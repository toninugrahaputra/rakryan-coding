<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\CourseGallery;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SyncCourseGallery
{
    public function __construct(private ExtractYoutubeVideoId $extractYoutubeVideoId) {}

    /**
     * @param  array<int, UploadedFile>  $newFiles
     * @param  array<int, int>  $removeIds
     * @param  array<int, string>  $youtubeUrls
     */
    public function handle(Course $course, array $newFiles, array $removeIds = [], array $youtubeUrls = []): void
    {
        if (! empty($removeIds)) {
            $toDelete = $course->galleries()->whereIn('id', $removeIds)->get();

            foreach ($toDelete as $gallery) {
                if ($gallery->path) {
                    Storage::disk('public')->delete($gallery->path);
                }
                $gallery->delete();
            }
        }

        $remainingSlots = CourseGallery::MAX_PER_COURSE - $course->galleries()->count();
        $nextOrder = (int) $course->galleries()->max('order') + 1;

        foreach (array_slice($newFiles, 0, max($remainingSlots, 0)) as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            CourseGallery::create([
                'course_id' => $course->id,
                'type' => 'image',
                'path' => $file->store('courses/galleries', 'public'),
                'order' => $nextOrder++,
            ]);
            $remainingSlots--;
        }

        foreach (array_slice($youtubeUrls, 0, max($remainingSlots, 0)) as $url) {
            $youtubeId = $this->extractYoutubeVideoId->handle($url);

            if (! $youtubeId) {
                continue;
            }

            CourseGallery::create([
                'course_id' => $course->id,
                'type' => 'video',
                'youtube_id' => $youtubeId,
                'order' => $nextOrder++,
            ]);
        }
    }
}
