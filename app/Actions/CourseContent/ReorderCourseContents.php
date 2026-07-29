<?php

namespace App\Actions\CourseContent;

use App\Models\Course;
use Illuminate\Support\Facades\DB;

class ReorderCourseContents
{
    /**
     * @param  array<int, int>  $orderedIds
     */
    public function handle(Course $course, array $orderedIds): void
    {
        $ownedCount = $course->contents()->whereIn('id', $orderedIds)->count();

        abort_unless($ownedCount === count($orderedIds), 422, 'Semua konten yang diurutkan harus berasal dari course yang sama.');

        DB::transaction(function () use ($course, $orderedIds) {
            foreach ($orderedIds as $index => $contentId) {
                $course->contents()->whereKey($contentId)->update(['order' => $index + 1]);
            }
        });
    }
}
