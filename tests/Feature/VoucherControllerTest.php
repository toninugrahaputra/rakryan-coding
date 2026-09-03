<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoucherControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_voucher_with_remaining_quota_is_listed_as_available(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create([
            'quota' => 10,
            'usage_count' => 5,
        ]);

        $response = $this->actingAs($user)->get('/vouchers');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('availableVouchers', 1)
            ->where('availableVouchers.0.code', $voucher->code)
            ->has('expiredVouchers', 0));
    }

    public function test_voucher_with_exhausted_quota_is_listed_as_expired_not_available(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create([
            'quota' => 10,
            'usage_count' => 10,
        ]);

        $response = $this->actingAs($user)->get('/vouchers');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('availableVouchers', 0)
            ->has('expiredVouchers', 1)
            ->where('expiredVouchers.0.code', $voucher->code));
    }

    public function test_claiming_a_voucher_with_exhausted_quota_is_rejected(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create([
            'quota' => 10,
            'usage_count' => 10,
        ]);

        $response = $this->actingAs($user)->post('/vouchers/redeem', ['code' => $voucher->code]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('voucher_usages', [
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_multi_use_voucher_stays_available_after_one_use_below_the_limit(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['per_user_limit' => 3]);
        $order = Order::factory()->create(['user_id' => $user->id]);
        VoucherUsage::create([
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'discount_amount' => 10000,
        ]);

        $response = $this->actingAs($user)->get('/vouchers');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('availableVouchers', 1)
            ->where('availableVouchers.0.code', $voucher->code));
    }

    public function test_multi_use_voucher_is_unavailable_once_per_user_limit_is_reached(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['per_user_limit' => 2]);

        foreach (range(1, 2) as $_) {
            $order = Order::factory()->create(['user_id' => $user->id]);
            VoucherUsage::create([
                'voucher_id' => $voucher->id,
                'user_id' => $user->id,
                'order_id' => $order->id,
                'discount_amount' => 10000,
            ]);
        }

        $response = $this->actingAs($user)->get('/vouchers');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('availableVouchers', 0));
    }

    public function test_claiming_a_multi_use_voucher_below_its_limit_succeeds(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['per_user_limit' => 3]);
        $order = Order::factory()->create(['user_id' => $user->id]);
        VoucherUsage::create([
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'discount_amount' => 10000,
        ]);

        $response = $this->actingAs($user)->post('/vouchers/redeem', ['code' => $voucher->code]);

        $response->assertRedirect();
        $this->assertDatabaseHas('voucher_usages', [
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
            'order_id' => null,
        ]);
    }
}
