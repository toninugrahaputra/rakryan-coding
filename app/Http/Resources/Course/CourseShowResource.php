<?php

namespace App\Http\Resources\Course;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CourseShowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cheapestProduct = $this->relationLoaded('products')
            ? $this->products->first()
            : null;

        $ratingCount = $this->relationLoaded('reviews') ? $this->reviews->count() : $this->reviews()->count();
        $averageRating = $ratingCount > 0
            ? round(($this->relationLoaded('reviews') ? $this->reviews->avg('rating') : $this->reviews()->avg('rating')), 1)
            : 4.9;

        $completedCount = 0;
        if ($request->user() && $this->relationLoaded('contents')) {
            $completedCount = $this->contents->filter(function ($content) use ($request) {
                return $content->progress->contains('user_id', $request->user()->id);
            })->count();
        }

        $userReview = null;
        if ($request->user()) {
            $review = \App\Models\Review::where('user_id', $request->user()->id)
                ->where('course_id', $this->id)
                ->first();
            if ($review) {
                $userReview = [
                    'rating'  => $review->rating,
                    'tags'    => $review->tags,
                    'comment' => $review->comment,
                ];
            }
        }

        return [
            'id'                       => $this->id,
            'title'                    => $this->title,
            'slug'                     => $this->slug,
            'description'              => $this->description,
            'thumbnail'                => $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null,
            'category'                 => $this->whenLoaded('category', fn () => $this->category instanceof \App\Models\Category ? $this->category->name : null),
            'is_published'             => $this->is_published,
            'price'                    => $cheapestProduct?->price ?? null,
            'price_strikethrough'      => $cheapestProduct?->price_strikethrough ?? null,
            'is_free'                  => $cheapestProduct !== null && $cheapestProduct->price === 0,
            'has_product'              => $cheapestProduct !== null,
            'rating'                   => $averageRating,
            'reviews_count'            => $ratingCount,
            'completed_contents_count' => $completedCount,
            'user_review'              => $userReview,
            'contents'                 => $this->whenLoaded('contents', fn () => $this->contents
                ->where('is_published', true)
                ->map(fn ($content) => [
                    'id'    => $content->id,
                    'title' => $content->title,
                    'slug'  => $content->slug,
                    'order' => $content->order,
                ])
                ->values()),
            'gallery'                  => $this->whenLoaded('galleries', fn () => $this->galleries
                ->map(fn ($gallery) => [
                    'id'  => $gallery->id,
                    'url' => Storage::disk('public')->url($gallery->path),
                ])
                ->values()),
        ];
    }
}
