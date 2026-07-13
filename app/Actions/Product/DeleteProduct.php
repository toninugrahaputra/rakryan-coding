<?php

namespace App\Actions\Product;

use App\Models\Product;

class DeleteProduct
{
    public function handle(Product $product): void
    {
        $product->delete();
    }
}
