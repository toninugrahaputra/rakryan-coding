<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Article\CreateArticle;
use App\Actions\Article\DeleteArticle;
use App\Actions\Article\GenerateArticleContent;
use App\Actions\Article\GetArticleBySlug;
use App\Actions\Article\GetPaginatedArticles;
use App\Actions\Article\UpdateArticle;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\ArticleRequest;
use App\Http\Requests\Internal\GenerateArticleContentRequest;
use App\Http\Resources\Article\ArticleListResource;
use App\Http\Resources\Article\ArticleShowResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

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

    public function generateAi(GenerateArticleContentRequest $request): JsonResponse
    {
        try {
            $result = app(GenerateArticleContent::class)->handle(
                $request->validated('title'),
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Gagal terhubung ke layanan AI. Coba lagi beberapa saat.'], 422);
        }

        return response()->json([
            'excerpt' => $result['excerpt'],
            'content' => [
                'time' => (int) (microtime(true) * 1000),
                'blocks' => $result['blocks'],
                'version' => '2.31.6',
            ],
        ]);
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
