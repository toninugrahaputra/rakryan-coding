<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Voucher;
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
}
