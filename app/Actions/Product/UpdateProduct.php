<?php

namespace App\Actions\Product;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateProduct
{
    public function handle(Product $product, array $data): void
    {
        $fields = [
            'title' => $data['title'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'price' => $data['price'],
            'price_strikethrough' => $data['price_strikethrough'] ?? null,
            'is_published' => $data['is_published'] ?? false,
            'is_favourite' => $data['is_favourite'] ?? false,
        ];

        if (array_key_exists('thumbnail', $data)) {
            $fields['thumbnail'] = $this->replaceThumbnail($product, $data['thumbnail']);
        }

        $product->update($fields);

        $product->courses()->sync($data['course_ids'] ?? []);
    }

    private function replaceThumbnail(Product $product, mixed $file): ?string
    {
        if ($product->thumbnail) {
            Storage::disk('public')->delete($product->thumbnail);
        }

        if ($file instanceof UploadedFile) {
            return $file->store('products/thumbnails', 'public');
        }

        return null;
    }
}
