<?php

namespace App\Actions\Course;

use App\Models\CourseGallery;
use Illuminate\Database\Eloquent\Collection;

class GetRandomProjectGallery
{
    public function handle(int $limit = 8): Collection
    {
        return CourseGallery::query()
            ->whereHas('course', fn ($q) => $q->where('is_published', true))
            ->with('course:id,title,slug')
            ->inRandomOrder()
            ->take($limit)
            ->get();
    }
}
