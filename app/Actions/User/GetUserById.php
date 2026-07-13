<?php

namespace App\Actions\User;

use App\Models\User;

class GetUserById
{
    public function handle(int $id): User
    {
        return User::findOrFail($id);
    }
}
