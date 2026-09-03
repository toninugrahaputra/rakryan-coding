<?php

namespace Tests\Feature;

use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WelcomeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_voucher_with_remaining_quota_is_shown(): void
    {
        $voucher = Voucher::factory()->create([
            'quota' => 10,
            'usage_count' => 5,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('vouchers', 1)
            ->where('vouchers.0.code', $voucher->code));
    }

    public function test_voucher_with_exhausted_quota_is_not_shown(): void
    {
        Voucher::factory()->create([
            'quota' => 10,
            'usage_count' => 10,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('vouchers', 0));
    }

    public function test_voucher_with_unlimited_quota_is_shown(): void
    {
        $voucher = Voucher::factory()->create([
            'quota' => null,
            'usage_count' => 500,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('vouchers', 1)
            ->where('vouchers.0.code', $voucher->code));
    }
}
