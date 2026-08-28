<?php

namespace App\Actions\Product;

use App\Actions\Notification\NotifyAllUsers;
use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Http\UploadedFile;

class CreateProduct
{
    public function __construct(private NotifyAllUsers $notifyAllUsers) {}

    public function handle(array $data): Product
    {
        $product = Product::create([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'type' => $data['type'],
            'thumbnail' => $this->storeThumbnail($data['thumbnail'] ?? null),
            'source_code_path' => $this->storeSourceCodeFile($data['source_code_file'] ?? null),
            'price' => $data['price'],
            'price_strikethrough' => $data['price_strikethrough'] ?? null,
            'is_published' => $data['is_published'] ?? false,
            'is_favourite' => $data['is_favourite'] ?? false,
        ]);

        $product->courses()->sync($this->buildCourseSyncData($data));

        if ($product->is_published) {
            $url = match (true) {
                $product->type === ProductType::SourceCode => route('source-code.show', $product),
                $product->type === ProductType::Single && $product->courses->isNotEmpty() => route('courses.show', $product->courses->first()),
                default => route('courses.index'),
            };

            $this->notifyAllUsers->handle(
                'Produk Baru Tersedia! 🚀',
                "Produk baru \"{$product->title}\" sudah bisa dibeli sekarang.",
                $url,
            );
        }

        return $product;
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

    private function storeThumbnail(mixed $file): ?string
    {
        if ($file instanceof UploadedFile) {
            return $file->store('products/thumbnails', 'public');
        }

        return null;
    }

    private function storeSourceCodeFile(mixed $file): ?string
    {
        if ($file instanceof UploadedFile) {
            return $file->store('products/source-code', 'local');
        }

        return null;
    }
}
