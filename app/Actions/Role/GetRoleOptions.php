<?php

namespace App\Actions\Role;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

class GetRoleOptions
{
    public function handle(): Collection
    {
        return Role::pluck('name');
    }
}
