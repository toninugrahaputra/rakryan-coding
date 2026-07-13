<?php

namespace App\Actions\Course;

use App\Models\Course;

class DeleteCourse
{
    public function handle(Course $course): void
    {
        $course->delete();
    }
}
