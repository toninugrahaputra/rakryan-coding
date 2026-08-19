<?php

namespace App\Actions\Sitemap;

use App\Models\Article;
use App\Models\Course;
use Illuminate\Support\Collection;

class GenerateSitemap
{
    /**
     * Build the list of URL entries for the public sitemap.
     *
     * @return Collection<int, array{loc: string, lastmod: string, changefreq: string, priority: string}>
     */
    public function handle(): Collection
    {
        $staticPages = collect([
            ['loc' => route('home'), 'lastmod' => now()->toAtomString(), 'changefreq' => 'daily', 'priority' => '1.0'],
            ['loc' => route('courses.index'), 'lastmod' => now()->toAtomString(), 'changefreq' => 'daily', 'priority' => '0.9'],
            ['loc' => route('articles.index'), 'lastmod' => now()->toAtomString(), 'changefreq' => 'daily', 'priority' => '0.7'],
        ]);

        $courses = Course::query()
            ->where('is_published', true)
            ->whereHas('products', fn ($q) => $q->where('is_published', true))
            ->get(['slug', 'updated_at'])
            ->map(fn (Course $course) => [
                'loc' => route('courses.show', $course),
                'lastmod' => $course->updated_at->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ]);

        $articles = Article::query()
            ->where('is_published', true)
            ->get(['slug', 'updated_at'])
            ->map(fn (Article $article) => [
                'loc' => route('articles.show', $article),
                'lastmod' => $article->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ]);

        return $staticPages->concat($courses)->concat($articles);
    }
}
