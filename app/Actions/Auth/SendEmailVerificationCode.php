<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Notifications\VerifyEmailWithCode;
use Illuminate\Support\Facades\Hash;

class SendEmailVerificationCode
{
    /** Berapa lama kode verifikasi berlaku sebelum harus minta yang baru. */
    private const CODE_LIFETIME_MINUTES = 10;

    public function handle(User $user): void
    {
        $code = (string) random_int(100000, 999999);

        $user->forceFill([
            'email_verification_code' => Hash::make($code),
            'email_verification_code_expires_at' => now()->addMinutes(self::CODE_LIFETIME_MINUTES),
            'email_verification_code_attempts' => 0,
        ])->save();

        $user->notify(new VerifyEmailWithCode($code));
    }
}
