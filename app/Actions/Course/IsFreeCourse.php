<?php

namespace App\Actions\Course;

use App\Models\Course;

class IsFreeCourse
{
    public function handle(Course $course): bool
    {
        $cheapestProduct = $course->products()
            ->where('is_published', true)
            ->orderBy('price')
            ->first();

        return $cheapestProduct !== null && $cheapestProduct->price === 0;
    }
}
