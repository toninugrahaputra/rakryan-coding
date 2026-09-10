<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedPublishedCourses
{
    public function handle(): LengthAwarePaginator
    {
        $query = Course::with(['category', 'technologies', 'products' => fn ($q) => $q->where('is_published', true)->where('course_product.is_bonus', false)->orderBy('price')])
            ->withCount('contents')
            ->where('is_published', true)
            // Course published tapi tidak punya produk published sama sekali harus tetap
            // disembunyikan dari katalog publik — tidak ada yang bisa dibeli dari situ.
            ->whereHas('products', fn ($q) => $q->where('is_published', true)->where('course_product.is_bonus', false));

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
            'oldest' => $query->oldest(),
            'title-az' => $query->orderBy('title'),
            'title-za' => $query->orderByDesc('title'),
            'popular' => $query->withCount('reviews')->orderByDesc('reviews_count'),
            'price-asc' => $query->orderBy($this->cheapestProductPriceSubquery(), 'asc'),
            'price-desc' => $query->orderBy($this->cheapestProductPriceSubquery(), 'desc'),
            default => $query->latest(),
        };

        return $query->paginate(12);
    }

    /**
     * Subquery harga produk termurah (non-bonus, published) milik sebuah course —
     * dipakai untuk urutkan katalog berdasarkan harga yang sama dengan yang ditampilkan di kartu.
     */
    private function cheapestProductPriceSubquery(): Builder
    {
        return Product::query()
            ->selectRaw('MIN(products.price)')
            ->join('course_product', 'products.id', '=', 'course_product.product_id')
            ->whereColumn('course_product.course_id', 'courses.id')
            ->where('products.is_published', true)
            ->where('course_product.is_bonus', false);
    }
}
