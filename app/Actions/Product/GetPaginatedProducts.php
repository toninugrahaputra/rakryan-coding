<?php

namespace App\Actions\Product;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedProducts
{
    public function handle(): LengthAwarePaginator
    {
        return Product::withCount('courses')
            ->latest()
            ->paginate(10);
    }
}
