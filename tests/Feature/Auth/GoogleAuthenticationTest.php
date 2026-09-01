<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'user']);
        Role::create(['name' => 'admin']);
    }

    public function test_redirect_route_sends_user_to_google(): void
    {
        Socialite::fake('google');

        $response = $this->get(route('auth.google.redirect'));

        $response->assertRedirect();
    }

    public function test_new_user_is_created_and_logged_in_via_google_callback(): void
    {
        Socialite::fake('google', SocialiteUser::fake([
            'id' => 'google-123',
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
        ]));

        $response = $this->get(route('auth.google.callback'));

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('users', [
            'email' => 'budi@example.com',
            'google_id' => 'google-123',
        ]);

        $user = User::where('email', 'budi@example.com')->first();
        $this->assertTrue($user->hasRole('user'));
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_existing_user_with_matching_google_id_logs_in_without_duplicate(): void
    {
        $existing = User::factory()->create(['google_id' => 'google-123']);
        $existing->assignRole('user');

        Socialite::fake('google', SocialiteUser::fake([
            'id' => 'google-123',
            'name' => $existing->name,
            'email' => $existing->email,
        ]));

        $this->get(route('auth.google.callback'));

        $this->assertAuthenticatedAs($existing);
        $this->assertSame(1, User::where('email', $existing->email)->count());
    }

    public function test_session_id_is_regenerated_after_google_login(): void
    {
        Socialite::fake('google', SocialiteUser::fake([
            'id' => 'google-123',
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
        ]));

        // Regression guard against session fixation: Laravel's SessionGuard::login()
        // already calls session()->regenerate(true) internally (SessionGuard.php:588),
        // so this doesn't need custom code here — this test just pins that behavior
        // down for this controller in case that framework default ever changes.
        // Simulate a session that already existed before login (e.g. the ID an
        // attacker "planted" in the victim's browser), carrying the same cookie
        // into the login request so it truly continues that session, not a fresh one.
        $sessionCookieName = config('session.cookie');
        $before = $this->get('/');
        $sessionIdBeforeLogin = $this->app['session']->getId();
        $cookie = collect($before->headers->getCookies())
            ->first(fn ($c) => $c->getName() === $sessionCookieName);

        $this->withCookie($sessionCookieName, $cookie->getValue())
            ->get(route('auth.google.callback'));
        $sessionIdAfterLogin = $this->app['session']->getId();

        $this->assertNotSame($sessionIdBeforeLogin, $sessionIdAfterLogin);
    }

    public function test_existing_user_with_matching_email_gets_linked_to_google(): void
    {
        $existing = User::factory()->create(['email' => 'linked@example.com', 'google_id' => null]);
        $existing->assignRole('user');

        Socialite::fake('google', SocialiteUser::fake([
            'id' => 'google-456',
            'name' => $existing->name,
            'email' => 'linked@example.com',
        ]));

        $this->get(route('auth.google.callback'));

        $this->assertAuthenticatedAs($existing->fresh());
        $this->assertSame(1, User::where('email', 'linked@example.com')->count());
        $this->assertSame('google-456', $existing->fresh()->google_id);
    }
}
