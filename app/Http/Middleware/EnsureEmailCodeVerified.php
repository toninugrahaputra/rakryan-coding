<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailCodeVerified
{
    /**
     * Hanya memblokir user yang benar-benar sedang dalam proses verifikasi kode
     * (kolom `email_verification_code` terisi) — user lama dari sebelum fitur ini
     * ada tidak pernah punya kode, jadi tidak ikut terblokir.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->email_verification_code !== null && $user->email_verified_at === null) {
            return redirect()->route('verification.code.notice');
        }

        return $next($request);
    }
}
