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
            'price' => $data['price'],
            'price_strikethrough' => $data['price_strikethrough'] ?? null,
            'is_published' => $data['is_published'] ?? false,
            'is_favourite' => $data['is_favourite'] ?? false,
        ]);

        $product->courses()->sync($data['course_ids'] ?? []);

        if ($product->is_published) {
            $url = $product->type === ProductType::Single && $product->courses->isNotEmpty()
                ? route('courses.show', $product->courses->first())
                : route('courses.index');

            $this->notifyAllUsers->handle(
                'Produk Baru Tersedia! 🚀',
                "Produk baru \"{$product->title}\" sudah bisa dibeli sekarang.",
                $url,
            );
        }

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
