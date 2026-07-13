<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => Hash::make('password')],
        );
        $admin->assignRole('admin');

        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            ['name' => 'User', 'password' => Hash::make('password')],
        );
        $user->assignRole('user');
    }
}
