<?php

namespace App\Actions\ProductGuide;

use App\Models\Product;
use App\Models\ProductGuide;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CreateProductGuide
{
    public function handle(Product $product, array $data): ProductGuide
    {
        $guideSlug = $data['slug'];

        try {
            return DB::transaction(function () use ($product, $data) {
                return $product->guides()->create([
                    'title' => $data['title'],
                    'slug' => $data['slug'],
                    'content' => $data['content'] ?? null,
                    'is_published' => $data['is_published'] ?? false,
                    'order' => $product->guides()->max('order') + 1,
                ]);
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->deleteDirectory("products/{$product->slug}/guides/{$guideSlug}");
            throw $e;
        }
    }
}
