<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ConfirmEmailVerificationCode
{
    /** Batas percobaan salah sebelum kode dianggap hangus dan wajib kirim ulang. */
    private const MAX_ATTEMPTS = 5;

    public function handle(User $user, string $code): bool
    {
        if ($user->email_verification_code === null || $user->email_verification_code_expires_at === null) {
            return false;
        }

        if ($user->email_verification_code_expires_at->isPast()) {
            return false;
        }

        if (! Hash::check($code, $user->email_verification_code)) {
            $attempts = $user->email_verification_code_attempts + 1;

            $user->forceFill(
                $attempts >= self::MAX_ATTEMPTS
                    ? [
                        'email_verification_code' => null,
                        'email_verification_code_expires_at' => null,
                        'email_verification_code_attempts' => 0,
                    ]
                    : ['email_verification_code_attempts' => $attempts]
            )->save();

            return false;
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_verification_code' => null,
            'email_verification_code_expires_at' => null,
            'email_verification_code_attempts' => 0,
        ])->save();

        return true;
    }
}
