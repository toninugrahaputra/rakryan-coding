<?php

namespace App\Actions\ProductGuide;

use App\Models\Product;
use App\Models\ProductGuide;
use Illuminate\Support\Facades\Storage;

class DeleteProductGuide
{
    public function handle(ProductGuide $guide, Product $product): void
    {
        $guideSlug = $guide->slug;

        $guide->delete();

        Storage::disk('public')->deleteDirectory("products/{$product->slug}/guides/{$guideSlug}");
    }
}
