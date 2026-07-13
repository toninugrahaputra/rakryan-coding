<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedCourses
{
    public function handle(): LengthAwarePaginator
    {
        $query = Course::with(['category', 'products' => fn ($q) => $q->where('is_published', true)->orderBy('price')])
            ->withCount('contents')
            ->where('is_published', true);

        // Search by title
        if ($search = request()->input('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        // Filter by category name
        if ($category = request()->input('category')) {
            $query->whereHas('category', fn ($q) => $q->where('name', $category));
        }

        // Sort
        match (request()->input('sort', 'latest')) {
            'oldest'   => $query->oldest(),
            'title-az' => $query->orderBy('title'),
            'title-za' => $query->orderByDesc('title'),
            'popular'  => $query->withCount('reviews')->orderByDesc('reviews_count'),
            default    => $query->latest(),
        };

        return $query->paginate(12);
    }
}
