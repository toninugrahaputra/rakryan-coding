<?php

namespace App\Actions\User;

use App\Models\User;

class UpdateUser
{
    public function handle(User $user, array $data): void
    {
        $fields = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (filled($data['password'] ?? null)) {
            $fields['password'] = $data['password'];
        }

        $user->update($fields);
        $user->syncRoles([$data['role']]);
    }
}
