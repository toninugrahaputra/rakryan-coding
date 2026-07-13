<?php

namespace App\Actions\Editor;

use Illuminate\Support\Facades\Storage;

class DeleteEditorImages
{
    /**
     * Delete image files from storage by their public URLs.
     *
     * @param  string[]  $urls
     */
    public function handle(array $urls): void
    {
        foreach ($urls as $url) {
            if (empty($url)) {
                continue;
            }

            $path = parse_url($url, PHP_URL_PATH);

            if (! $path) {
                continue;
            }

            // Strip leading slash and the "storage/" symlink prefix used by the public disk
            $storagePath = preg_replace('/^\/?storage\//', '', $path);

            if ($storagePath && Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
        }
    }
}
