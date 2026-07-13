<?php

namespace App\Actions\User;

use App\Models\User;

class CreateUser
{
    public function handle(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $user->assignRole($data['role']);

        return $user;
    }
}
