<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\ConfirmEmailVerificationCode;
use App\Actions\Auth\SendEmailVerificationCode;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class VerifyEmailCodeController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->email_verified_at !== null) {
            return redirect()->intended(route('dashboard'));
        }

        return Inertia::render('auth/verify-email-code');
    }

    public function store(Request $request, ConfirmEmailVerificationCode $confirmEmailVerificationCode): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $verified = $confirmEmailVerificationCode->handle($request->user(), $request->string('code')->value());

        if (! $verified) {
            $user = $request->user()->fresh();

            if ($user->email_verification_code === null) {
                throw ValidationException::withMessages([
                    'code' => 'Terlalu banyak percobaan salah. Silakan minta kode baru.',
                ]);
            }

            throw ValidationException::withMessages([
                'code' => 'Kode yang kamu masukkan salah atau sudah kedaluwarsa.',
            ]);
        }

        // Balik ke halaman login (bukan langsung dashboard) supaya user login ulang
        // dengan sadar setelah bikin akun. `url.intended` sengaja dipertahankan
        // secara eksplisit lewat logout ini, supaya begitu dia login, tetap
        // diarahkan ke halaman yang tadinya mau dia buka (mis. checkout).
        $intended = $request->session()->get('url.intended');

        Auth::guard('web')->logout();

        if ($intended) {
            $request->session()->put('url.intended', $intended);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Akun kamu berhasil dibuat dan diverifikasi! Silakan login untuk mulai belajar di Rakryan Coding.',
        ]);

        return redirect()->route('login');
    }

    public function resend(Request $request, SendEmailVerificationCode $sendEmailVerificationCode): RedirectResponse
    {
        if ($request->user()->email_verified_at !== null) {
            return redirect()->intended(route('dashboard'));
        }

        $sendEmailVerificationCode->handle($request->user());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Kode verifikasi baru sudah dikirim ke email kamu.',
        ]);

        return back();
    }
}
