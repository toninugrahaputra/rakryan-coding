<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

class GetFeaturedCourses
{
    /** Jumlah course yang ditampilkan per kelompok (berbayar / gratis) di landing page. */
    private const PER_GROUP = 3;

    public function handle(): Collection
    {
        // Campuran course berbayar & gratis, bukan sekadar yang terbaru, biar landing page
        // menunjukkan kedua jenis course sebagai funnel (preview gratis -> upsell berbayar).
        $courses = Course::where('is_published', true)
            ->whereHas('products', function ($query) {
                $query->where('is_published', true)->where('course_product.is_bonus', false);
            })
            ->with(['category', 'reviews', 'technologies', 'products' => function ($query) {
                $query->where('is_published', true)->where('course_product.is_bonus', false)->orderBy('price');
            }])
            ->withCount('contents')
            ->latest()
            ->get();

        $isFree = fn (Course $course) => $course->products->first()?->price === 0;

        $paidCourses = $courses->reject($isFree)->take(self::PER_GROUP);
        $freeCourses = $courses->filter($isFree)->take(self::PER_GROUP);

        return $paidCourses->merge($freeCourses)->values();
    }
}
