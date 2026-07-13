<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\CourseGallery;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SyncCourseGallery
{
    /**
     * @param  array<int, UploadedFile>  $newFiles
     * @param  array<int, int>  $removeIds
     */
    public function handle(Course $course, array $newFiles, array $removeIds = []): void
    {
        if (! empty($removeIds)) {
            $toDelete = $course->galleries()->whereIn('id', $removeIds)->get();

            foreach ($toDelete as $gallery) {
                Storage::disk('public')->delete($gallery->path);
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
                'path' => $file->store('courses/galleries', 'public'),
                'order' => $nextOrder++,
            ]);
        }
    }
}
