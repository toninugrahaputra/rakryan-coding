<?php

namespace Tests\Feature\Voucher;

use App\Actions\Voucher\ApplyVoucher;
use App\Actions\Voucher\RedeemVoucher;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ApplyVoucherTest extends TestCase
{
    use RefreshDatabase;

    private function apply(string $code, Product $product, User $user): array
    {
        return app(ApplyVoucher::class)->handle($code, $product, $user);
    }

    public function test_it_calculates_percentage_discount(): void
    {
        $product = Product::factory()->create(['price' => 100000]);
        $user = User::factory()->create();
        $voucher = Voucher::factory()->percentage(10)->create();

        $result = $this->apply($voucher->code, $product, $user);

        $this->assertSame(10000, $result['discount']);
    }

    public function test_percentage_discount_is_capped_by_max_discount(): void
    {
        $product = Product::factory()->create(['price' => 1000000]);
        $user = User::factory()->create();
        $voucher = Voucher::factory()->percentage(50, 20000)->create();

        $result = $this->apply($voucher->code, $product, $user);

        $this->assertSame(20000, $result['discount']);
    }

    public function test_it_calculates_flat_discount(): void
    {
        $product = Product::factory()->create(['price' => 100000]);
        $user = User::factory()->create();
        $voucher = Voucher::factory()->flat(25000)->create();

        $result = $this->apply($voucher->code, $product, $user);

        $this->assertSame(25000, $result['discount']);
    }

    public function test_flat_discount_never_exceeds_product_price(): void
    {
        $product = Product::factory()->create(['price' => 20000]);
        $user = User::factory()->create();
        $voucher = Voucher::factory()->flat(50000)->create();

        $result = $this->apply($voucher->code, $product, $user);

        $this->assertSame(20000, $result['discount']);
    }

    public function test_unknown_code_fails(): void
    {
        $product = Product::factory()->create();
        $user = User::factory()->create();

        $this->expectException(ValidationException::class);
        $this->apply('NOPE', $product, $user);
    }

    public function test_inactive_voucher_fails(): void
    {
        $product = Product::factory()->create();
        $user = User::factory()->create();
        $voucher = Voucher::factory()->inactive()->create();

        $this->expectException(ValidationException::class);
        $this->apply($voucher->code, $product, $user);
    }

    public function test_expired_voucher_fails(): void
    {
        $product = Product::factory()->create();
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['ends_at' => now()->subDay()]);

        $this->expectException(ValidationException::class);
        $this->apply($voucher->code, $product, $user);
    }

    public function test_not_yet_started_voucher_fails(): void
    {
        $product = Product::factory()->create();
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['starts_at' => now()->addDay()]);

        $this->expectException(ValidationException::class);
        $this->apply($voucher->code, $product, $user);
    }

    public function test_quota_exhausted_voucher_fails(): void
    {
        $product = Product::factory()->create();
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['quota' => 5, 'usage_count' => 5]);

        $this->expectException(ValidationException::class);
        $this->apply($voucher->code, $product, $user);
    }

    public function test_product_outside_scope_fails(): void
    {
        $allowed = Product::factory()->create();
        $other = Product::factory()->create();
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['applies_to_all_products' => false]);
        $voucher->products()->attach($allowed->id);

        $this->expectException(ValidationException::class);
        $this->apply($voucher->code, $other, $user);
    }

    public function test_min_purchase_not_met_fails(): void
    {
        $product = Product::factory()->create(['price' => 50000]);
        $user = User::factory()->create();
        $voucher = Voucher::factory()->flat(10000)->create(['min_purchase' => 100000]);

        $this->expectException(ValidationException::class);
        $this->apply($voucher->code, $product, $user);
    }

    public function test_per_user_limit_blocks_after_reaching_limit(): void
    {
        $product = Product::factory()->create(['price' => 100000]);
        $user = User::factory()->create();
        $voucher = Voucher::factory()->flat(10000)->create(['per_user_limit' => 1]);

        app(RedeemVoucher::class)->handle($voucher, $user, 10000);

        $this->expectException(ValidationException::class);
        $this->apply($voucher->code, $product, $user);
    }

    public function test_redeem_records_usage_and_increments_counter(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->flat(10000)->create();

        app(RedeemVoucher::class)->handle($voucher, $user, 10000);

        $this->assertDatabaseHas('voucher_usages', [
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
            'discount_amount' => 10000,
        ]);
        $this->assertSame(1, $voucher->fresh()->usage_count);
    }
}
