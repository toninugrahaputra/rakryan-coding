<?php

namespace App\Actions\Product;

use App\Models\Product;

class GetProductBySlug
{
    public function handle(string $slug): Product
    {
        return Product::where('slug', $slug)->firstOrFail();
    }
}
