<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

class GetFeaturedCourses
{
    public function handle(): Collection
    {
        // Get featured courses - for now, we'll use recently published/popular courses
        // In a real app, you might have an 'is_featured' flag or more complex logic
        return Course::whereHas('products', function ($query) {
            $query->where('is_published', true)->where('course_product.is_bonus', false);
        })
            ->with(['category', 'reviews', 'technologies', 'products' => function ($query) {
                $query->where('is_published', true)->where('course_product.is_bonus', false)->orderBy('price');
            }])
            ->withCount('contents')
            ->latest()
            ->take(6)
            ->get();
    }
}
