<?php

namespace App\Actions\User;

use App\Models\User;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class FindOrCreateUserFromGoogle
{
    public function handle(SocialiteUser $googleUser): User
    {
        $user = User::where('google_id', $googleUser->getId())->first();

        if ($user) {
            return $user;
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            $user->update([
                'google_id' => $googleUser->getId(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);

            return $user;
        }

        $user = User::create([
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'google_id' => $googleUser->getId(),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('user');

        return $user;
    }
}
