<?php

namespace App\Actions\CourseContent;

use App\Actions\Editor\DeleteEditorImages;
use App\Models\Course;
use App\Models\CourseContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UpdateCourseContent
{
    public function handle(CourseContent $content, Course $course, array $data): void
    {
        $oldSlug = $content->slug;
        $newSlug = $data['slug'];
        $courseSlug = $course->slug;
        $slugChanged = $oldSlug !== $newSlug;
        $deletedImageUrls = $data['deleted_images'] ?? [];
        $folderRenamed = false;

        try {
            DB::transaction(function () use ($content, $data, $deletedImageUrls, $oldSlug, $newSlug, $courseSlug, $slugChanged, &$folderRenamed) {
                $contentJson = $data['content'] ?? null;

                if ($slugChanged) {
                    $contentJson = $this->moveStorageFolder($courseSlug, $oldSlug, $newSlug, $contentJson);
                    $folderRenamed = true;
                }

                $fields = [
                    'section_name' => $data['section_name'] ?? null,
                    'title' => $data['title'],
                    'slug' => $newSlug,
                    'content' => $contentJson,
                    'sub_topics' => $data['sub_topics'] ?? null,
                    'is_published' => $data['is_published'] ?? false,
                ];

                // Kolom link YouTube baru diisi kalau admin memang mengetik link baru — dibiarkan
                // kosong di form berarti "jangan diubah", bukan "hapus video yang sudah ada".
                if (array_key_exists('youtube_id', $data)) {
                    $fields['youtube_id'] = $data['youtube_id'];
                }

                $content->update($fields);

                if (! empty($deletedImageUrls)) {
                    app(DeleteEditorImages::class)->handle($deletedImageUrls);
                }
            });
        } catch (\Throwable $e) {
            if ($folderRenamed) {
                $this->moveStorageFolder($courseSlug, $newSlug, $oldSlug, null);
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
    private function moveStorageFolder(string $courseSlug, string $from, string $to, ?array $contentJson): ?array
    {
        $disk = Storage::disk('public');
        $fromDir = "courses/{$courseSlug}/{$from}";
        $toDir = "courses/{$courseSlug}/{$to}";

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

                if (str_contains($url, "/courses/{$courseSlug}/{$from}/")) {
                    $block['data']['file']['url'] = str_replace(
                        "/courses/{$courseSlug}/{$from}/",
                        "/courses/{$courseSlug}/{$to}/",
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
