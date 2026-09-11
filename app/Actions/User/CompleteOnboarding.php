<?php

namespace App\Actions\User;

use App\Models\User;

class CompleteOnboarding
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(User $user, array $data): User
    {
        $user->fill([
            'region' => $data['region'],
            'info_source' => $data['info_source'],
            'status' => $data['status'],
            'additional_notes' => $data['additional_notes'] ?? null,
        ]);

        $user->onboarded_at = now();

        $user->save();

        return $user;
    }
}
