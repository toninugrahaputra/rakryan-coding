<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\GetPasswordRequirements;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->instance(LoginResponse::class, new class implements LoginResponse
        {
            public function toResponse($request)
            {
                $url = $request->user()->hasRole('admin')
                    ? route('internal.dashboard')
                    : route('dashboard');

                return $request->wantsJson()
                    ? response()->json(['redirect' => $url])
                    : redirect()->intended($url);
            }
        });

        $this->app->instance(RegisterResponse::class, new class implements RegisterResponse
        {
            public function toResponse($request)
            {
                if ($request->wantsJson()) {
                    return response()->json(['two_factor' => false]);
                }

                Inertia::flash('toast', [
                    'type' => 'success',
                    'message' => 'Akun berhasil dibuat. Selamat datang di Rakryan Coding!',
                ]);

                // Guest yang tadinya diarahkan ke login/daftar dari halaman terkunci
                // (mis. checkout atau modul berbayar) dikembalikan ke sana, sama seperti
                // perilaku LoginResponse. Dashboard hanya dipakai kalau tidak ada tujuan.
                return redirect()->intended(route('dashboard'));
            }
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->throttleUnprotectedRoutes();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'passwordRequirements' => app(GetPasswordRequirements::class)->handle(),
        ]));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('passkeys', function (Request $request) {
            return Limit::perMinute(10)->by(
                ($request->input('credential.id') ?: $request->session()->getId()).'|'.$request->ip(),
            );
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('forgot-password', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('reset-password', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }

    /**
     * Fortify's route file doesn't offer a `fortify.limiters` config hook for
     * register/forgot-password/reset-password (unlike login/two-factor/passkeys),
     * so their throttle middleware is attached here directly onto the already
     * -registered named routes once every provider has booted.
     */
    private function throttleUnprotectedRoutes(): void
    {
        $this->app->booted(function () {
            $routes = Route::getRoutes();

            // Name lookups aren't populated incrementally in this app's minimal
            // bootstrap (no classic RouteServiceProvider refreshing them) — without
            // this, getByName() silently returns null for every route.
            $routes->refreshNameLookups();

            $limiters = [
                'register.store' => 'register',
                'password.email' => 'forgot-password',
                'password.update' => 'reset-password',
            ];

            foreach ($limiters as $routeName => $limiter) {
                $routes->getByName($routeName)?->middleware('throttle:'.$limiter);
            }
        });
    }
}
