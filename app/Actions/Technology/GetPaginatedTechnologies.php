<?php

namespace App\Actions\Technology;

use App\Models\Technology;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedTechnologies
{
    public function handle(): LengthAwarePaginator
    {
        return Technology::withCount('courses')
            ->orderBy('name')
            ->paginate(10);
    }
}
