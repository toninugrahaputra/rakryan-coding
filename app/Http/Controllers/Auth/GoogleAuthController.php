<?php

namespace App\Http\Controllers\Auth;

use App\Actions\User\FindOrCreateUserFromGoogle;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            report($e);

            return redirect()->route('login')->with('error', 'Gagal login dengan Google. Silakan coba lagi.');
        }

        $user = app(FindOrCreateUserFromGoogle::class)->handle($googleUser);

        Auth::login($user, remember: true);

        $url = $user->hasRole('admin') ? route('internal.dashboard') : route('dashboard');

        return redirect()->intended($url);
    }
}
