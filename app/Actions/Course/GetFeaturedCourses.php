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
            $query->where('is_published', true);
        })
        ->with(['category', 'reviews', 'products' => function ($query) {
            $query->where('is_published', true)->orderBy('price');
        }])
        ->withCount('contents')
        ->latest()
        ->take(6)
        ->get();
    }
}