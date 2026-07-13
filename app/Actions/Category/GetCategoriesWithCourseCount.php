<?php

namespace App\Actions\Category;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class GetCategoriesWithCourseCount
{
    public function handle(): Collection
    {
        // Get categories that have courses, with course count
        return Category::has('publishedCourses')
            ->withCount('publishedCourses as courses_count')
            ->orderByDesc('courses_count')
            ->take(8)
            ->get();
    }
}