<?php

namespace App\Http\Controllers;

use App\Actions\Article\GetArticleBySlug;
use App\Actions\Article\GetPaginatedPublishedArticles;
use App\Http\Resources\Article\ArticleListResource;
use App\Http\Resources\Article\ArticleShowResource;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
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

        return Inertia::render('articles/show', [
            'article' => new ArticleShowResource($article),
        ]);
    }
}
