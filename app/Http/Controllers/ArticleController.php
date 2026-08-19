<?php

namespace App\Http\Controllers;

use App\Actions\Article\GetArticleBySlug;
use App\Actions\Article\GetPaginatedPublishedArticles;
use App\Actions\Seo\ShareSeoMeta;
use App\Http\Resources\Article\ArticleListResource;
use App\Http\Resources\Article\ArticleShowResource;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
        app(ShareSeoMeta::class)->handle(
            'Artikel',
            'Kumpulan artikel, tips, dan tutorial singkat seputar coding dari Rakryan Coding.',
        );

        return Inertia::render('articles/index', [
            'articles' => ArticleListResource::collection(app(GetPaginatedPublishedArticles::class)->handle()),
            'filters' => [
                'search' => request('search'),
            ],
        ]);
    }

    public function show(string $article): Response
    {
        $article = app(GetArticleBySlug::class)->handle($article);

        abort_unless($article->is_published, 404);

        app(ShareSeoMeta::class)->handle(
            $article->title,
            $article->excerpt,
            $article->thumbnail ? Storage::disk('public')->url($article->thumbnail) : null,
            'article',
        );

        return Inertia::render('articles/show', [
            'article' => new ArticleShowResource($article),
        ]);
    }
}
