<?php

namespace App\Actions\CourseContent;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

class GetCourseContents
{
    public function handle(Course $course): Collection
    {
        return $course->contents()->orderBy('order')->get();
    }
}
