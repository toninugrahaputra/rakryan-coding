<?php

namespace App\Http\Controllers;

use App\Actions\Article\GetLatestArticles;
use App\Actions\Course\GetFeaturedCourses;
use App\Actions\Course\GetRandomProjectGallery;
use App\Actions\Product\GetPublishedSourceCodeProducts;
use App\Actions\Seo\ShareSeoMeta;
use App\Http\Resources\Article\ArticleListResource;
use App\Http\Resources\Course\CourseListResource;
use App\Http\Resources\Product\SourceCodeListResource;
use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function __invoke(): mixed
    {
        // Get featured courses for showcase (6 course terbaru untuk Galeri Proyek)
        $featuredCourses = app(GetFeaturedCourses::class)->handle();

        // Artikel terbaru untuk section "Belajar dari Artikel"
        $articles = app(GetLatestArticles::class)->handle();

        // Source code project untuk section "Butuh source code siap pakai?"
        $sourceCodeProducts = app(GetPublishedSourceCodeProducts::class)->handle(3);

        // Galeri hasil project acak lintas course untuk section "Galeri Hasil Project"
        $projectGallery = app(GetRandomProjectGallery::class)->handle()
            ->map(fn ($gallery) => [
                'id' => $gallery->id,
                'type' => $gallery->type,
                'url' => $gallery->type === 'video'
                    ? "https://img.youtube.com/vi/{$gallery->youtube_id}/hqdefault.jpg"
                    : Storage::disk('public')->url($gallery->path),
                'youtube_id' => $gallery->youtube_id,
                'course_title' => $gallery->course?->title,
                'course_slug' => $gallery->course?->slug,
            ]);

        // Get basic stats for showcase
        $stats = [
            'total_courses' => Course::whereHas('products', function ($query) {
                $query->where('is_published', true);
            })->count(),
            'total_students' => User::count(),
            'total_categories' => Category::has('courses')->count(),
        ];

        // Get voucher publik yang sedang aktif untuk ditampilkan di section Voucher (cukup 1, paling cepat berakhir)
        $vouchers = Voucher::query()
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->where(fn ($q) => $q->whereNull('quota')->orWhereColumn('usage_count', '<', 'quota'))
            ->orderBy('ends_at')
            ->limit(1)
            ->get()
            ->map(fn (Voucher $v) => [
                'code' => $v->code,
                'name' => $v->name,
                'type' => $v->type->value,
                'value' => $v->value,
                'max_discount' => $v->max_discount,
                'min_purchase' => $v->min_purchase,
                'ends_at' => $v->ends_at?->translatedFormat('d M Y'),
            ]);

        app(ShareSeoMeta::class)->handle(
            'Platform Belajar Coding',
            'Platform belajar coding teks lengkap untuk semua kalangan di seluruh Indonesia. Materi terstruktur, dirancang biar kamu siap kerja atau bikin project sendiri.',
        );

        return Inertia::render('welcome', [
            'featuredCourses' => CourseListResource::collection($featuredCourses),
            'articles' => ArticleListResource::collection($articles),
            'sourceCodeProducts' => SourceCodeListResource::collection($sourceCodeProducts),
            'projectGallery' => $projectGallery,
            'stats' => $stats,
            'vouchers' => $vouchers,
        ]);
    }
}
