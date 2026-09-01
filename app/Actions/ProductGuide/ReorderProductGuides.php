<?php

namespace App\Actions\ProductGuide;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ReorderProductGuides
{
    /**
     * @param  array<int, int>  $orderedIds
     */
    public function handle(Product $product, array $orderedIds): void
    {
        $ownedCount = $product->guides()->whereIn('id', $orderedIds)->count();

        abort_unless($ownedCount === count($orderedIds), 422, 'Semua panduan yang diurutkan harus berasal dari produk yang sama.');

        DB::transaction(function () use ($product, $orderedIds) {
            foreach ($orderedIds as $index => $guideId) {
                $product->guides()->whereKey($guideId)->update(['order' => $index + 1]);
            }
        });
    }
}
