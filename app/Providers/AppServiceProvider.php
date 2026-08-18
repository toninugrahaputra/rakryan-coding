<?php

namespace App\Providers;

use App\Actions\Fortify\GetPasswordRequirements;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        JsonResource::withoutWrapping();

        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // Aturannya dirakit dari GetPasswordRequirements supaya ambang yang divalidasi
        // di sini dan yang ditampilkan di halaman auth berasal dari satu definisi.
        Password::defaults(function (): Password {
            $requirements = app(GetPasswordRequirements::class)->handle();

            $rule = Password::min($requirements['min']);

            if ($requirements['letters']) {
                $rule->letters();
            }

            if ($requirements['mixedCase']) {
                $rule->mixedCase();
            }

            if ($requirements['numbers']) {
                $rule->numbers();
            }

            if ($requirements['symbols']) {
                $rule->symbols();
            }

            if ($requirements['uncompromised']) {
                $rule->uncompromised();
            }

            return $rule;
        });
    }

    /**
     * Rate limit endpoints that trigger real cost or external side effects
     * (payment gateway calls, paid AI generation) so a single user or a
     * traffic spike can't hammer them.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('checkout', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('apply-voucher', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('generate-ai', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });
    }
}
