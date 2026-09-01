<?php

namespace Tests\Feature\Voucher;

use App\Actions\Voucher\RedeemVoucher;
use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
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
        $order = Order::factory()->create();

        // Catat penggunaan voucher dengan discount_amount yang diwajibkan
        $voucher->usages()->create([
            'user_id' => $user->id,
            'order_id' => $order->id,
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

    public function test_redeem_fails_if_voucher_already_claimed_by_user(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create();

        // Catat klaim voucher (order_id null)
        $voucher->usages()->create([
            'user_id' => $user->id,
            'order_id' => null,
            'discount_amount' => 0,
        ]);

        $response = $this->actingAs($user)
            ->from(route('vouchers.index'))
            ->post(route('vouchers.redeem'), ['code' => $voucher->code]);

        $response->assertRedirect(route('vouchers.index'));

        $this->get(route('vouchers.index'))
            ->assertInertia(fn ($page) => $page
                ->hasFlash('toast', [
                    'type' => 'error',
                    'message' => 'Anda sudah pernah mengklaim voucher ini.',
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

        $this->assertDatabaseHas('voucher_usages', [
            'user_id' => $user->id,
            'voucher_id' => $voucher->id,
            'order_id' => null,
        ]);
    }

    public function test_redeem_action_throws_when_quota_is_already_exhausted(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['quota' => 1, 'usage_count' => 1]);

        $this->expectException(ValidationException::class);

        app(RedeemVoucher::class)->handle($voucher, $user, 10000);
    }

    public function test_redeem_action_rejects_a_second_redemption_past_the_per_user_limit(): void
    {
        // Simulates the double-submit race: even though ApplyVoucher's earlier
        // unlocked check might pass twice, RedeemVoucher must independently refuse
        // a second redemption once the first has actually committed.
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['per_user_limit' => 1]);
        $firstOrder = Order::factory()->create();

        app(RedeemVoucher::class)->handle($voucher, $user, 10000, $firstOrder);

        $this->expectException(ValidationException::class);

        $secondOrder = Order::factory()->create();
        app(RedeemVoucher::class)->handle($voucher, $user, 10000, $secondOrder);
    }

    public function test_redeem_action_does_not_double_count_usage_past_the_per_user_limit(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['per_user_limit' => 1]);
        $firstOrder = Order::factory()->create();

        app(RedeemVoucher::class)->handle($voucher, $user, 10000, $firstOrder);

        try {
            $secondOrder = Order::factory()->create();
            app(RedeemVoucher::class)->handle($voucher, $user, 10000, $secondOrder);
        } catch (ValidationException) {
            // expected — per-user limit already reached
        }

        $this->assertSame(1, $voucher->fresh()->usage_count);
        $this->assertSame(1, $voucher->usages()->where('user_id', $user->id)->count());
    }

    public function test_redeem_action_does_not_increment_usage_count_past_quota(): void
    {
        $user = User::factory()->create();
        $voucher = Voucher::factory()->create(['quota' => 1, 'usage_count' => 1]);

        try {
            app(RedeemVoucher::class)->handle($voucher, $user, 10000);
        } catch (ValidationException) {
            // expected — quota already exhausted
        }

        $this->assertSame(1, $voucher->fresh()->usage_count);
        $this->assertDatabaseMissing('voucher_usages', [
            'voucher_id' => $voucher->id,
            'user_id' => $user->id,
        ]);
    }
}
