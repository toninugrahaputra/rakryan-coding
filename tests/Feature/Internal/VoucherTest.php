<?php

namespace Tests\Feature\Internal;

use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VoucherTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->user = User::factory()->create();
        $this->user->assignRole('user');
    }

    public function test_admin_can_view_vouchers_index(): void
    {
        $response = $this->actingAs($this->admin)->get('/internal/vouchers');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('internal/vouchers/index'));
    }

    public function test_non_admin_cannot_view_vouchers(): void
    {
        $response = $this->actingAs($this->user)->get('/internal/vouchers');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_percentage_voucher_for_all_products(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/vouchers', [
            'code' => 'DISKON10',
            'name' => 'Diskon Sepuluh',
            'type' => 'percentage',
            'value' => 10,
            'max_discount' => 20000,
            'applies_to_all_products' => true,
            'is_active' => true,
            'product_ids' => [],
        ]);

        $response->assertRedirect('/internal/vouchers');
        $this->assertDatabaseHas('vouchers', [
            'code' => 'DISKON10',
            'type' => 'percentage',
            'value' => 10,
            'max_discount' => 20000,
            'applies_to_all_products' => true,
        ]);
    }

    public function test_admin_can_create_voucher_scoped_to_specific_products(): void
    {
        $products = Product::factory()->count(2)->create();

        $response = $this->actingAs($this->admin)->post('/internal/vouchers', [
            'code' => 'PRODUKAB',
            'type' => 'flat',
            'value' => 25000,
            'applies_to_all_products' => false,
            'is_active' => true,
            'product_ids' => $products->pluck('id')->toArray(),
        ]);

        $response->assertRedirect('/internal/vouchers');

        $voucher = Voucher::where('code', 'PRODUKAB')->first();
        $this->assertCount(2, $voucher->products);
    }

    public function test_specific_product_voucher_requires_product_ids(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/vouchers', [
            'code' => 'NOPRODUCT',
            'type' => 'flat',
            'value' => 25000,
            'applies_to_all_products' => false,
            'is_active' => true,
            'product_ids' => [],
        ]);

        $response->assertSessionHasErrors(['product_ids']);
    }

    public function test_percentage_value_cannot_exceed_100(): void
    {
        $response = $this->actingAs($this->admin)->post('/internal/vouchers', [
            'code' => 'TOOBIG',
            'type' => 'percentage',
            'value' => 150,
            'applies_to_all_products' => true,
            'is_active' => true,
            'product_ids' => [],
        ]);

        $response->assertSessionHasErrors(['value']);
    }

    public function test_create_voucher_requires_unique_code(): void
    {
        Voucher::factory()->create(['code' => 'EXISTING']);

        $response = $this->actingAs($this->admin)->post('/internal/vouchers', [
            'code' => 'EXISTING',
            'type' => 'flat',
            'value' => 25000,
            'applies_to_all_products' => true,
            'is_active' => true,
            'product_ids' => [],
        ]);

        $response->assertSessionHasErrors(['code']);
    }

    public function test_admin_can_update_voucher(): void
    {
        $voucher = Voucher::factory()->flat(10000)->create(['code' => 'OLD']);

        $response = $this->actingAs($this->admin)->put("/internal/vouchers/{$voucher->code}", [
            'code' => 'NEW',
            'type' => 'flat',
            'value' => 30000,
            'applies_to_all_products' => true,
            'is_active' => false,
            'product_ids' => [],
        ]);

        $response->assertRedirect('/internal/vouchers');
        $this->assertDatabaseHas('vouchers', [
            'id' => $voucher->id,
            'code' => 'NEW',
            'value' => 30000,
            'is_active' => false,
        ]);
    }

    public function test_updating_voucher_to_all_products_detaches_pivot(): void
    {
        $products = Product::factory()->count(2)->create();
        $voucher = Voucher::factory()->create(['applies_to_all_products' => false]);
        $voucher->products()->sync($products->pluck('id'));

        $this->actingAs($this->admin)->put("/internal/vouchers/{$voucher->code}", [
            'code' => $voucher->code,
            'type' => $voucher->type->value,
            'value' => $voucher->value,
            'applies_to_all_products' => true,
            'is_active' => true,
            'product_ids' => [],
        ]);

        $this->assertCount(0, $voucher->fresh()->products);
    }

    public function test_admin_can_delete_voucher(): void
    {
        $voucher = Voucher::factory()->create();

        $response = $this->actingAs($this->admin)->delete("/internal/vouchers/{$voucher->code}");

        $response->assertRedirect('/internal/vouchers');
        $this->assertSoftDeleted('vouchers', ['id' => $voucher->id]);
    }
}
