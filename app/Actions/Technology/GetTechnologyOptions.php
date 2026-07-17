<?php

namespace App\Actions\Technology;

use App\Models\Technology;
use Illuminate\Database\Eloquent\Collection;

class GetTechnologyOptions
{
    public function handle(): Collection
    {
        return Technology::select('id', 'name', 'slug', 'logo')->orderBy('name')->get();
    }
}
