<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Category\CreateCategory;
use App\Actions\Category\DeleteCategory;
use App\Actions\Category\GetCategoryBySlug;
use App\Actions\Category\GetPaginatedCategories;
use App\Actions\Category\UpdateCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\CategoryRequest;
use App\Http\Resources\Category\CategoryListResource;
use App\Http\Resources\Category\CategoryShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('internal/categories/index', [
            'categories' => CategoryListResource::collection(app(GetPaginatedCategories::class)->handle()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/categories/create');
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        app(CreateCategory::class)->handle($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil ditambahkan.']);

        return redirect()->route('internal.categories.index');
    }

    public function edit(string $category): Response
    {
        $category = app(GetCategoryBySlug::class)->handle($category);

        return Inertia::render('internal/categories/edit', [
            'category' => new CategoryShowResource($category),
        ]);
    }

    public function update(CategoryRequest $request, string $category): RedirectResponse
    {
        $category = app(GetCategoryBySlug::class)->handle($category);
        app(UpdateCategory::class)->handle($category, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil diperbarui.']);

        return redirect()->route('internal.categories.index');
    }

    public function destroy(string $category): RedirectResponse
    {
        $category = app(GetCategoryBySlug::class)->handle($category);
        app(DeleteCategory::class)->handle($category);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil dihapus.']);

        return redirect()->route('internal.categories.index');
    }
}
