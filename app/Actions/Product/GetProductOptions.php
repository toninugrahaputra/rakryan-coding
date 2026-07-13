<?php

namespace App\Actions\Product;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class GetProductOptions
{
    public function handle(): Collection
    {
        return Product::select('id', 'title', 'price')
            ->where('is_published', true)
            ->orderBy('title')
            ->get();
    }
}
