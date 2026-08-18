<?php

namespace Tests\Feature\Auth;

use App\Actions\Fortify\GetPasswordRequirements;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\Rules\Password;
use Inertia\Testing\AssertableInertia;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_registration_screen_receives_password_requirements()
    {
        $response = $this->get(route('register'));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('auth/register')
            ->has('passwordRequirements')
            ->where('passwordRequirements', app(GetPasswordRequirements::class)->handle())
        );
    }

    /**
     * Ketentuan yang ditampilkan di layar harus berasal dari ambang yang sama dengan
     * yang divalidasi server — kalau keduanya berbeda, pengguna bisa ditolak karena
     * aturan yang tidak pernah tertulis.
     */
    public function test_displayed_requirements_match_the_enforced_password_rule()
    {
        $requirements = app(GetPasswordRequirements::class)->handle();
        $rulesString = Password::defaults()->toPasswordRulesString();

        $this->assertStringContainsString("minlength: {$requirements['min']};", $rulesString);
        $this->assertSame($requirements['mixedCase'], str_contains($rulesString, 'required: upper'));
        $this->assertSame($requirements['numbers'], str_contains($rulesString, 'required: digit'));
        $this->assertSame($requirements['symbols'], str_contains($rulesString, 'required: special'));
    }

    public function test_new_users_can_register()
    {
        Role::create(['name' => 'user']);

        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('home', absolute: false));
    }

    /**
     * Guest yang mencoba membuka halaman terkunci (mis. checkout) dilempar ke login,
     * dan tujuannya disimpan sebagai `url.intended`. Setelah mendaftar ia harus kembali
     * ke sana, bukan terdampar di beranda dan harus mengulang langkahnya dari awal.
     */
    public function test_registration_returns_the_guest_to_the_page_they_were_sent_away_from()
    {
        Role::create(['name' => 'user']);

        $intended = route('orders.create', ['course' => 'belajar-laravel']);

        // Perjalanan nyata: guest ditolak di halaman terkunci, mendarat di login,
        // lalu berpindah sendiri ke halaman daftar sebelum mengirim formulir.
        $this->get($intended)->assertRedirect(route('login'));
        $this->get(route('login'))->assertOk();
        $this->get(route('register'))->assertOk();

        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect($intended);
    }

    public function test_registration_falls_back_to_home_without_an_intended_page()
    {
        Role::create(['name' => 'user']);

        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('home', absolute: false));
    }

    public function test_successful_registration_flashes_a_success_toast()
    {
        Role::create(['name' => 'user']);

        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertSame(
            ['type' => 'success', 'message' => 'Akun berhasil dibuat. Selamat datang di Rakryan Coding!'],
            session('inertia.flash_data')['toast'] ?? null,
        );
    }

    public function test_failed_registration_does_not_flash_a_toast()
    {
        Role::create(['name' => 'user']);

        $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'not-an-email',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertGuest();
        $this->assertNull(session('inertia.flash_data')['toast'] ?? null);
    }
}
