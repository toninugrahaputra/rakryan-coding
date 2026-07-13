<?php

namespace App\Actions\Category;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedCategories
{
    public function handle(): LengthAwarePaginator
    {
        return Category::withCount('courses')
            ->latest()
            ->paginate(10);
    }
}
