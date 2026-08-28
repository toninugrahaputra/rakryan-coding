<?php

namespace App\Actions\Product;

use App\Enums\ProductType;
use App\Models\Product;

class GetSourceCodeProductBySlug
{
    public function handle(string $slug): Product
    {
        return Product::where('slug', $slug)
            ->where('type', ProductType::SourceCode)
            ->where('is_published', true)
            ->firstOrFail();
    }
}
