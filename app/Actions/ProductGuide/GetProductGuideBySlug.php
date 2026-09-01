<?php

namespace App\Actions\ProductGuide;

use App\Models\Product;
use App\Models\ProductGuide;

class GetProductGuideBySlug
{
    public function handle(Product $product, string $slug): ProductGuide
    {
        return $product->guides()->where('slug', $slug)->firstOrFail();
    }
}
