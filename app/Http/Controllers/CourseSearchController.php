<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = trim($request->input('q', ''));

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $courses = Course::with(['category', 'products' => fn ($q) => $q->where('is_published', true)->orderBy('price')])
            ->where('is_published', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhereHas('category', fn ($q2) => $q2->where('name', 'like', "%{$query}%"));
            })
            ->latest()
            ->limit(6)
            ->get();

        return response()->json($courses->map(function ($course) {
            $product = $course->products->first();

            return [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'thumbnail' => $course->thumbnail ? Storage::disk('public')->url($course->thumbnail) : null,
                'category' => $course->category?->name,
                'price' => $product?->price,
                'price_strikethrough' => $product?->price_strikethrough,
                'is_free' => $product !== null && $product->price === 0,
                'has_product' => $product !== null,
            ];
        }));
    }
}
