<?php

namespace App\Actions\ProductGuide;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class GetProductGuides
{
    public function handle(Product $product): Collection
    {
        return $product->guides()->orderBy('order')->get();
    }
}
