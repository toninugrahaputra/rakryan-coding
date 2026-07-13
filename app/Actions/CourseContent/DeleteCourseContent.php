<?php

namespace App\Actions\CourseContent;

use App\Models\Course;
use App\Models\CourseContent;
use Illuminate\Support\Facades\Storage;

class DeleteCourseContent
{
    public function handle(CourseContent $content, Course $course): void
    {
        $contentSlug = $content->slug;

        $content->delete();

        Storage::disk('public')->deleteDirectory("courses/{$course->slug}/{$contentSlug}");
    }
}
