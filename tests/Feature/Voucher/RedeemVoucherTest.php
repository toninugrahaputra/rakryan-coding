<?php

namespace Tests\Feature\Voucher;

use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RedeemVoucherTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_redeem_voucher(): void
    {
        $response = $this->post(route('vouchers.redeem'), ['code' => 'COBA']);
        $response->assertRedirect(route('login'));
    }

    public function test_user_can_view_vouchers_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('vouchers.index'));

        $response->assertOk();
    }

    public function test_redeem_fails_validation_if_code_is_empty(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->from(route('vouchers.index'))
            ->post(route('vouchers.redeem'), ['code' => '']);

        $response->assertSessionHasErrors('code');
    }

    public function test_redeem_fails_if_voucher_does_not_exist(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->from(route('vouchers.index'))
            ->post(route('vouchers.redeem'), ['code' => 'UNKNOWN123']);

        $response->assertRedirect(route('vouchers.index'));

        $this->get(route('vouchers.index'))
            ->assertInertia(fn ($page) => $page
                ->hasFlash('toast', [
                    'type' => 'error',
                    'message' => 'Kode voucher tidak ditemukan.',
                ])
            );
    }

    public function test_redeem_fails_if_voucher_is_inactive(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->inactive()->create();

        $response = $this->actingAs($user)
            ->from(route('vouchers.index'))
            ->post(route('vouchers.redeem'), ['code' => $voucher->code]);

        $response->assertRedirect(route('vouchers.index'));

        $this->get(route('vouchers.index'))
            ->assertInertia(fn ($page) => $page
                ->hasFlash('toast', [
                    'type' => 'error',
                    'message' => 'Kode voucher sudah kedaluwarsa atau tidak aktif.',
                ])
            );
    }

    public function test_redeem_fails_if_voucher_is_expired(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create([
            'ends_at' => now()->subDay(),
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->from(route('vouchers.index'))
            ->post(route('vouchers.redeem'), ['code' => $voucher->code]);

        $response->assertRedirect(route('vouchers.index'));

        $this->get(route('vouchers.index'))
            ->assertInertia(fn ($page) => $page
                ->hasFlash('toast', [
                    'type' => 'error',
                    'message' => 'Kode voucher sudah kedaluwarsa atau tidak aktif.',
                ])
            );
    }

    public function test_redeem_fails_if_voucher_already_used_by_user(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create();

        // Catat penggunaan voucher dengan discount_amount yang diwajibkan
        $voucher->usages()->create([
            'user_id' => $user->id,
            'order_id' => null,
            'discount_amount' => 10000,
        ]);

        $response = $this->actingAs($user)
            ->from(route('vouchers.index'))
            ->post(route('vouchers.redeem'), ['code' => $voucher->code]);

        $response->assertRedirect(route('vouchers.index'));

        $this->get(route('vouchers.index'))
            ->assertInertia(fn ($page) => $page
                ->hasFlash('toast', [
                    'type' => 'error',
                    'message' => 'Anda sudah pernah menggunakan voucher ini.',
                ])
            );
    }

    public function test_redeem_succeeds_if_voucher_is_valid(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create([
            'is_active' => true,
            'ends_at' => now()->addDay(),
        ]);

        $response = $this->actingAs($user)
            ->from(route('vouchers.index'))
            ->post(route('vouchers.redeem'), ['code' => $voucher->code]);

        $response->assertRedirect(route('vouchers.index'));

        $this->get(route('vouchers.index'))
            ->assertInertia(fn ($page) => $page
                ->hasFlash('toast', [
                    'type' => 'success',
                    'message' => "Kupon '{$voucher->code}' berhasil ditukarkan! Silakan pilih course untuk memulai belajar.",
                ])
            );
    }
}
