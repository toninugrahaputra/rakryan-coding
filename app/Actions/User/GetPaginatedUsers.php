<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedUsers
{
    public function handle(): LengthAwarePaginator
    {
        return User::with('roles')
            ->latest()
            ->paginate(10);
    }
}
