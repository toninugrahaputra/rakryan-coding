<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Article\CreateArticle;
use App\Actions\Article\DeleteArticle;
use App\Actions\Article\GetArticleBySlug;
use App\Actions\Article\GetPaginatedArticles;
use App\Actions\Article\UpdateArticle;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\ArticleRequest;
use App\Http\Resources\Article\ArticleListResource;
use App\Http\Resources\Article\ArticleShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('internal/articles/index', [
            'articles' => ArticleListResource::collection(app(GetPaginatedArticles::class)->handle()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/articles/create');
    }

    public function store(ArticleRequest $request): RedirectResponse
    {
        app(CreateArticle::class)->handle($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Artikel berhasil ditambahkan.']);

        return redirect()->route('internal.articles.index');
    }

    public function edit(string $article): Response
    {
        $article = app(GetArticleBySlug::class)->handle($article);

        return Inertia::render('internal/articles/edit', [
            'article' => new ArticleShowResource($article),
        ]);
    }

    public function update(ArticleRequest $request, string $article): RedirectResponse
    {
        $article = app(GetArticleBySlug::class)->handle($article);
        app(UpdateArticle::class)->handle($article, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Artikel berhasil diperbarui.']);

        return redirect()->route('internal.articles.index');
    }

    public function destroy(string $article): RedirectResponse
    {
        $article = app(GetArticleBySlug::class)->handle($article);
        app(DeleteArticle::class)->handle($article);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Artikel berhasil dihapus.']);

        return redirect()->route('internal.articles.index');
    }
}
