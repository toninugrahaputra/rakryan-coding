<?php

namespace App\Actions\CourseContent;

use App\Models\Course;
use App\Models\CourseContent;

class GetCourseContentBySlug
{
    public function handle(Course $course, string $slug): CourseContent
    {
        return $course->contents()->where('slug', $slug)->firstOrFail();
    }
}
