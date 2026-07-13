<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetUserOptions
{
    public function handle(): Collection
    {
        return User::select('id', 'name', 'email')->orderBy('name')->get();
    }
}
