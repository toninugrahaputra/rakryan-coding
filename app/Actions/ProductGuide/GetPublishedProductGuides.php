<?php

namespace App\Actions\ProductGuide;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class GetPublishedProductGuides
{
    public function handle(Product $product): Collection
    {
        return $product->guides()->where('is_published', true)->orderBy('order')->get();
    }
}
