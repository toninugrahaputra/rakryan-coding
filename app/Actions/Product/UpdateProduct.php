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
            'platform' => $data['platform'] ?? null,
            'price' => $data['price'],
            'price_strikethrough' => $data['price_strikethrough'] ?? null,
            'is_published' => $data['is_published'] ?? false,
            'is_favourite' => $data['is_favourite'] ?? false,
        ];

        if (array_key_exists('thumbnail', $data)) {
            $fields['thumbnail'] = $this->replaceThumbnail($product, $data['thumbnail']);
        }

        if (array_key_exists('source_code_file', $data) && $data['source_code_file'] instanceof UploadedFile) {
            $fields['source_code_path'] = $this->replaceSourceCodeFile($product, $data['source_code_file']);
        }

        $product->update($fields);

        $product->courses()->sync($this->buildCourseSyncData($data));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<int, array{is_bonus: bool}>
     */
    private function buildCourseSyncData(array $data): array
    {
        $sync = [];

        foreach ($data['course_ids'] ?? [] as $id) {
            $sync[$id] = ['is_bonus' => false];
        }

        foreach ($data['bonus_course_ids'] ?? [] as $id) {
            $sync[$id] = ['is_bonus' => true];
        }

        return $sync;
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

    private function replaceSourceCodeFile(Product $product, UploadedFile $file): string
    {
        if ($product->source_code_path) {
            Storage::disk('local')->delete($product->source_code_path);
        }

        return $file->store('products/source-code', 'local');
    }
}
