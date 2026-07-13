<?php

namespace App\Http\Resources\Course;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class CourseListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Ambil produk dengan harga terendah dari relasi yang sudah di-load
        $cheapestProduct = $this->relationLoaded('products')
            ? $this->products->first()
            : null;

        // Cari modul pertama yang belum selesai
        $nextContentSlug = null;
        if ($request->user() && $this->relationLoaded('contents')) {
            $incompleteContent = $this->contents->first(function ($content) use ($request) {
                // Modul dianggap belum selesai jika tidak ada data progress untuk user tersebut
                return !$content->progress->contains('user_id', $request->user()->id);
            });

            // Jika semua selesai atau tidak ditemukan, fallback ke modul pertama
            $nextContent = $incompleteContent ?? $this->contents->first();
            $nextContentSlug = $nextContent?->slug;
        }

        // Cari tanggal terakhir dibaca
        $lastReadAt = null;
        if ($request->user() && $this->relationLoaded('contents')) {
            $progressDates = $this->contents->flatMap(function ($content) use ($request) {
                return $content->progress->where('user_id', $request->user()->id)->pluck('created_at');
            });
            if ($progressDates->isNotEmpty()) {
                $lastReadAt = $progressDates->max()->diffForHumans();
            }
        }

        $ratingCount = $this->relationLoaded('reviews') ? $this->reviews->count() : $this->reviews()->count();
        $averageRating = $ratingCount > 0
            ? round(($this->relationLoaded('reviews') ? $this->reviews->avg('rating') : $this->reviews()->avg('rating')), 1)
            : 4.9;

        return [
            'id'                       => $this->id,
            'title'                    => $this->title,
            'slug'                     => $this->slug,
            'thumbnail'                => $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null,
            'is_published'             => $this->is_published,
            'category'                 => $this->whenLoaded('category', fn () => $this->category instanceof \App\Models\Category ? $this->category->name : null),
            'contents_count'           => $this->contents_count,
            'created_at'               => $this->created_at->format('d-m-Y'),
            'completed_contents_count' => $this->completed_contents_count ?? 0,
            'next_content_slug'        => $nextContentSlug,
            // Pricing — dari produk published termurah yang terkait dengan kursus ini
            'price'                    => $cheapestProduct?->price ?? null,
            'price_strikethrough'      => $cheapestProduct?->price_strikethrough ?? null,
            'is_free'                  => $cheapestProduct !== null && $cheapestProduct->price === 0,
            'has_product'              => $cheapestProduct !== null,
            'tech_stack'               => $this->tech_stack,
            'read_duration'            => $this->read_duration,
            'last_read_at'             => $lastReadAt,
            'rating'                   => $averageRating,
            'reviews_count'            => $ratingCount,
        ];
    }
}
