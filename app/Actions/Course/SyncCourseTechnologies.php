<?php

namespace App\Actions\Course;

use App\Models\Course;

class SyncCourseTechnologies
{
    /**
     * @param  array<int, int>  $technologyIds
     */
    public function handle(Course $course, array $technologyIds = []): void
    {
        $course->technologies()->sync($technologyIds);
    }
}
