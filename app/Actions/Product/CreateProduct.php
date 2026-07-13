<?php

namespace App\Actions\Product;

use App\Models\Product;
use Illuminate\Http\UploadedFile;

class CreateProduct
{
    public function handle(array $data): Product
    {
        $product = Product::create([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'thumbnail' => $this->storeThumbnail($data['thumbnail'] ?? null),
            'price' => $data['price'],
            'price_strikethrough' => $data['price_strikethrough'] ?? null,
            'is_published' => $data['is_published'] ?? false,
            'is_favourite' => $data['is_favourite'] ?? false,
        ]);

        $product->courses()->sync($data['course_ids'] ?? []);

        return $product;
    }

    private function storeThumbnail(mixed $file): ?string
    {
        if ($file instanceof UploadedFile) {
            return $file->store('products/thumbnails', 'public');
        }

        return null;
    }
}
