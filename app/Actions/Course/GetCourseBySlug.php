<?php

namespace App\Actions\Course;

use App\Models\Course;

class GetCourseBySlug
{
    public function handle(string $slug): Course
    {
        return Course::where('slug', $slug)->firstOrFail();
    }
}
