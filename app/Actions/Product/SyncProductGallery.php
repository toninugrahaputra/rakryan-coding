<?php

namespace App\Actions\Product;

use App\Actions\Course\ExtractYoutubeVideoId;
use App\Models\Product;
use App\Models\ProductGallery;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SyncProductGallery
{
    public function __construct(private ExtractYoutubeVideoId $extractYoutubeVideoId) {}

    /**
     * @param  array<int, UploadedFile>  $newFiles
     * @param  array<int, int>  $removeIds
     * @param  array<int, string>  $youtubeUrls
     */
    public function handle(Product $product, array $newFiles, array $removeIds = [], array $youtubeUrls = []): void
    {
        if (! empty($removeIds)) {
            $toDelete = $product->galleries()->whereIn('id', $removeIds)->get();

            foreach ($toDelete as $gallery) {
                if ($gallery->path) {
                    Storage::disk('public')->delete($gallery->path);
                }
                $gallery->delete();
            }
        }

        $remainingSlots = ProductGallery::MAX_PER_PRODUCT - $product->galleries()->count();
        $nextOrder = (int) $product->galleries()->max('order') + 1;

        foreach (array_slice($newFiles, 0, max($remainingSlots, 0)) as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            ProductGallery::create([
                'product_id' => $product->id,
                'type' => 'image',
                'path' => $file->store('products/galleries', 'public'),
                'order' => $nextOrder++,
            ]);
            $remainingSlots--;
        }

        foreach (array_slice($youtubeUrls, 0, max($remainingSlots, 0)) as $url) {
            $youtubeId = $this->extractYoutubeVideoId->handle($url);

            if (! $youtubeId) {
                continue;
            }

            ProductGallery::create([
                'product_id' => $product->id,
                'type' => 'video',
                'youtube_id' => $youtubeId,
                'order' => $nextOrder++,
            ]);
        }
    }
}
