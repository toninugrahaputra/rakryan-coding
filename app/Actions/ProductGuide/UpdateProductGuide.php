<?php

namespace App\Actions\ProductGuide;

use App\Actions\Editor\DeleteEditorImages;
use App\Models\Product;
use App\Models\ProductGuide;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UpdateProductGuide
{
    public function handle(ProductGuide $guide, Product $product, array $data): void
    {
        $oldSlug = $guide->slug;
        $newSlug = $data['slug'];
        $productSlug = $product->slug;
        $slugChanged = $oldSlug !== $newSlug;
        $deletedImageUrls = $data['deleted_images'] ?? [];
        $folderRenamed = false;

        try {
            DB::transaction(function () use ($guide, $data, $deletedImageUrls, $oldSlug, $newSlug, $productSlug, $slugChanged, &$folderRenamed) {
                $contentJson = $data['content'] ?? null;

                if ($slugChanged) {
                    $contentJson = $this->moveStorageFolder($productSlug, $oldSlug, $newSlug, $contentJson);
                    $folderRenamed = true;
                }

                $guide->update([
                    'title' => $data['title'],
                    'slug' => $newSlug,
                    'content' => $contentJson,
                    'is_published' => $data['is_published'] ?? false,
                ]);

                if (! empty($deletedImageUrls)) {
                    app(DeleteEditorImages::class)->handle($deletedImageUrls);
                }
            });
        } catch (\Throwable $e) {
            if ($folderRenamed) {
                $this->moveStorageFolder($productSlug, $newSlug, $oldSlug, null);
            }
            throw $e;
        }
    }

    /**
     * Move all files from one slug folder to another and update image URLs in content JSON.
     *
     * @param  array<string, mixed>|null  $contentJson
     * @return array<string, mixed>|null
     */
    private function moveStorageFolder(string $productSlug, string $from, string $to, ?array $contentJson): ?array
    {
        $disk = Storage::disk('public');
        $fromDir = "products/{$productSlug}/guides/{$from}";
        $toDir = "products/{$productSlug}/guides/{$to}";

        if ($disk->exists($fromDir)) {
            foreach ($disk->allFiles($fromDir) as $file) {
                $disk->move($file, $toDir.'/'.basename($file));
            }
            $disk->deleteDirectory($fromDir);
        }

        if ($contentJson !== null) {
            $blocks = $contentJson['blocks'] ?? [];

            foreach ($blocks as &$block) {
                if (($block['type'] ?? '') !== 'image') {
                    continue;
                }

                $url = $block['data']['file']['url'] ?? '';

                if (str_contains($url, "/products/{$productSlug}/guides/{$from}/")) {
                    $block['data']['file']['url'] = str_replace(
                        "/products/{$productSlug}/guides/{$from}/",
                        "/products/{$productSlug}/guides/{$to}/",
                        $url,
                    );
                }
            }
            unset($block);

            $contentJson['blocks'] = $blocks;
        }

        return $contentJson;
    }
}
