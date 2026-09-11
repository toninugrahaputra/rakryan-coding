<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_user_is_redirected_to_onboarding_from_dashboard(): void
    {
        $user = User::factory()->pendingOnboarding()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('onboarding.show'));
    }

    public function test_onboarding_form_can_be_rendered(): void
    {
        $user = User::factory()->pendingOnboarding()->create();

        $response = $this->actingAs($user)->get(route('onboarding.show'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('onboarding/show'));
    }

    public function test_onboarding_form_can_be_submitted(): void
    {
        $user = User::factory()->pendingOnboarding()->create();

        $response = $this->actingAs($user)->post(route('onboarding.store'), [
            'region' => 'Jawa Barat',
            'info_source' => 'TikTok',
            'status' => 'working',
            'additional_notes' => 'Semoga makin banyak course JS.',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $user->refresh();
        $this->assertSame('Jawa Barat', $user->region);
        $this->assertSame('TikTok', $user->info_source);
        $this->assertSame('working', $user->status);
        $this->assertSame('Semoga makin banyak course JS.', $user->additional_notes);
        $this->assertNotNull($user->onboarded_at);
    }

    public function test_onboarding_additional_notes_is_optional(): void
    {
        $user = User::factory()->pendingOnboarding()->create();

        $response = $this->actingAs($user)->post(route('onboarding.store'), [
            'region' => 'Jawa Barat',
            'info_source' => 'TikTok',
            'status' => 'working',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertNull($user->fresh()->additional_notes);
    }

    public function test_status_must_be_a_valid_option(): void
    {
        $user = User::factory()->pendingOnboarding()->create();

        $response = $this->actingAs($user)->post(route('onboarding.store'), [
            'region' => 'Jawa Barat',
            'info_source' => 'TikTok',
            'status' => 'invalid-value',
        ]);

        $response->assertSessionHasErrors('status');
        $this->assertNull($user->fresh()->onboarded_at);
    }

    public function test_already_onboarded_user_is_not_redirected_to_onboarding(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_already_onboarded_user_visiting_onboarding_page_is_redirected_to_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('onboarding.show'));

        $response->assertRedirect(route('dashboard'));
    }

    /**
     * Guest ditolak di halaman terkunci -> onboarding.store berhasil -> baru
     * dikirim ke halaman yang tadinya mau dia buka, bukan ke dashboard.
     */
    public function test_onboarding_success_returns_user_to_the_page_they_were_sent_away_from(): void
    {
        Role::create(['name' => 'user']);
        $user = User::factory()->pendingOnboarding()->create();

        $intended = route('orders.create', ['course' => 'belajar-laravel']);
        $this->actingAs($user)->get($intended)->assertRedirect(route('onboarding.show'));

        $response = $this->actingAs($user)->post(route('onboarding.store'), [
            'region' => 'Jawa Barat',
            'info_source' => 'TikTok',
            'status' => 'working',
        ]);

        $response->assertRedirect($intended);
    }

    /**
     * User baru lewat Google OAuth juga wajib kena gate ini di percobaan akses
     * pertama mereka, meskipun email-nya otomatis sudah terverifikasi.
     */
    public function test_new_google_oauth_user_is_redirected_to_onboarding_on_first_dashboard_visit(): void
    {
        Role::create(['name' => 'user']);
        Role::create(['name' => 'admin']);

        Socialite::fake('google', SocialiteUser::fake([
            'id' => 'google-123',
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
        ]));

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'budi@example.com')->firstOrFail();
        $this->assertNull($user->onboarded_at);

        $this->get(route('dashboard'))->assertRedirect(route('onboarding.show'));
    }
}
