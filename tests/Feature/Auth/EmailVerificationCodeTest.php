<?php

namespace Tests\Feature\Auth;

use App\Actions\Auth\SendEmailVerificationCode;
use App\Models\User;
use App\Notifications\VerifyEmailWithCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EmailVerificationCodeTest extends TestCase
{
    use RefreshDatabase;

    private function sendCodeAndCapture(User $user): string
    {
        Notification::fake();

        app(SendEmailVerificationCode::class)->handle($user);

        $code = null;

        Notification::assertSentTo($user, VerifyEmailWithCode::class, function (VerifyEmailWithCode $notification) use (&$code) {
            $code = $notification->code;

            return true;
        });

        return $code;
    }

    public function test_registration_sends_a_verification_code(): void
    {
        Role::create(['name' => 'user']);
        Notification::fake();

        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::where('email', 'test@example.com')->firstOrFail();

        Notification::assertSentTo($user, VerifyEmailWithCode::class);
        $this->assertNotNull($user->email_verification_code);
        $this->assertNotNull($user->email_verification_code_expires_at);
    }

    public function test_registration_redirects_to_the_code_verification_page(): void
    {
        Role::create(['name' => 'user']);

        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('verification.code.notice'));
    }

    /**
     * User sengaja di-logout lagi setelah verifikasi berhasil (bukan langsung ke
     * dashboard) — supaya dia login ulang dengan sadar setelah bikin akun.
     */
    public function test_correct_code_verifies_the_email_and_sends_user_to_login(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCodeAndCapture($user);

        $response = $this->actingAs($user->fresh())->post(route('verification.code.store'), [
            'code' => $code,
        ]);

        $response->assertRedirect(route('login'));
        $this->assertGuest();
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNull($user->fresh()->email_verification_code);
    }

    public function test_correct_code_flashes_a_success_toast(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCodeAndCapture($user);

        $this->actingAs($user->fresh())->post(route('verification.code.store'), [
            'code' => $code,
        ]);

        $this->assertSame(
            ['type' => 'success', 'message' => 'Akun kamu berhasil dibuat dan diverifikasi! Silakan login untuk mulai belajar di Rakryan Coding.'],
            session('inertia.flash_data')['toast'] ?? null,
        );
    }

    /**
     * Alur lengkap: guest ditolak di halaman terkunci -> daftar -> verifikasi kode
     * -> dilempar ke login (bukan langsung masuk) -> login manual -> BARU sampai
     * ke halaman yang tadinya mau dia buka. `url.intended` harus selamat melewati
     * logout paksa di antara verifikasi dan login ulang.
     */
    public function test_user_returns_to_the_page_they_were_sent_away_from_after_logging_back_in(): void
    {
        Role::create(['name' => 'user']);

        $intended = route('orders.create', ['course' => 'belajar-laravel']);

        $this->get($intended)->assertRedirect(route('login'));
        $this->get(route('register'))->assertOk();

        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::where('email', 'test@example.com')->firstOrFail();
        $code = $this->sendCodeAndCapture($user);

        $this->actingAs($user->fresh())->post(route('verification.code.store'), [
            'code' => $code,
        ])->assertRedirect(route('login'));

        $this->assertGuest();

        $response = $this->post(route('login.store'), [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect($intended);
    }

    public function test_wrong_code_is_rejected_and_increments_attempts(): void
    {
        $user = User::factory()->unverified()->create();
        $this->sendCodeAndCapture($user);

        $response = $this->actingAs($user->fresh())->post(route('verification.code.store'), [
            'code' => '000000',
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertNull($user->fresh()->email_verified_at);
        $this->assertSame(1, $user->fresh()->email_verification_code_attempts);
    }

    public function test_code_is_invalidated_after_five_wrong_attempts(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCodeAndCapture($user);

        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($user->fresh())->post(route('verification.code.store'), ['code' => '000000']);
        }

        $this->assertNull($user->fresh()->email_verification_code);

        $response = $this->actingAs($user->fresh())->post(route('verification.code.store'), [
            'code' => $code,
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_expired_code_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $code = $this->sendCodeAndCapture($user);

        $user->forceFill(['email_verification_code_expires_at' => now()->subMinute()])->save();

        $response = $this->actingAs($user->fresh())->post(route('verification.code.store'), [
            'code' => $code,
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_resend_issues_a_new_code_and_resets_attempts(): void
    {
        $user = User::factory()->unverified()->create();
        $firstCode = $this->sendCodeAndCapture($user);

        $this->actingAs($user->fresh())->post(route('verification.code.store'), ['code' => '000000']);
        $this->assertSame(1, $user->fresh()->email_verification_code_attempts);

        Notification::fake();
        $this->actingAs($user->fresh())->post(route('verification.code.resend'));

        Notification::assertSentTo($user, VerifyEmailWithCode::class, function (VerifyEmailWithCode $notification) use ($firstCode) {
            return $notification->code !== $firstCode;
        });
        $this->assertSame(0, $user->fresh()->email_verification_code_attempts);
    }

    public function test_resend_is_rate_limited(): void
    {
        $user = User::factory()->unverified()->create();
        $this->sendCodeAndCapture($user);

        $this->actingAs($user->fresh())->post(route('verification.code.resend'));
        $response = $this->actingAs($user->fresh())->post(route('verification.code.resend'));

        $response->assertTooManyRequests();
    }

    public function test_legacy_unverified_user_without_a_code_is_not_blocked_from_dashboard(): void
    {
        $user = User::factory()->unverified()->create();

        $this->assertNull($user->email_verification_code);

        $response = $this->actingAs($user->fresh())->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_user_pending_code_verification_is_redirected_away_from_dashboard(): void
    {
        $user = User::factory()->unverified()->create();
        $this->sendCodeAndCapture($user);

        $response = $this->actingAs($user->fresh())->get(route('dashboard'));

        $response->assertRedirect(route('verification.code.notice'));
    }

    public function test_already_verified_user_is_redirected_away_from_the_code_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user->fresh())->get(route('verification.code.notice'));

        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
