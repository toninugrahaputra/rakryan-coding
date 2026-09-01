<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Product\GetProductBySlug;
use App\Actions\ProductGuide\CreateProductGuide;
use App\Actions\ProductGuide\DeleteProductGuide;
use App\Actions\ProductGuide\GetProductGuideBySlug;
use App\Actions\ProductGuide\GetProductGuides;
use App\Actions\ProductGuide\ReorderProductGuides;
use App\Actions\ProductGuide\UpdateProductGuide;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\ProductGuideRequest;
use App\Http\Requests\Internal\ReorderProductGuidesRequest;
use App\Http\Resources\ProductGuide\ProductGuideListResource;
use App\Http\Resources\ProductGuide\ProductGuideShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductGuideController extends Controller
{
    public function index(string $product): Response
    {
        $product = app(GetProductBySlug::class)->handle($product);

        return Inertia::render('internal/products/guides/index', [
            'product' => ['id' => $product->id, 'slug' => $product->slug, 'title' => $product->title],
            'guides' => ProductGuideListResource::collection(app(GetProductGuides::class)->handle($product)),
        ]);
    }

    public function create(string $product): Response
    {
        $product = app(GetProductBySlug::class)->handle($product);

        return Inertia::render('internal/products/guides/create', [
            'product' => ['id' => $product->id, 'slug' => $product->slug, 'title' => $product->title],
        ]);
    }

    public function store(ProductGuideRequest $request, string $product): RedirectResponse
    {
        $product = app(GetProductBySlug::class)->handle($product);

        app(CreateProductGuide::class)->handle($product, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Panduan berhasil ditambahkan.']);

        return redirect()->route('internal.products.guides.index', $product);
    }

    public function edit(string $product, string $guide): Response
    {
        $product = app(GetProductBySlug::class)->handle($product);
        $guide = app(GetProductGuideBySlug::class)->handle($product, $guide);

        return Inertia::render('internal/products/guides/edit', [
            'product' => ['id' => $product->id, 'slug' => $product->slug, 'title' => $product->title],
            'guide' => new ProductGuideShowResource($guide),
        ]);
    }

    public function update(ProductGuideRequest $request, string $product, string $guide): RedirectResponse
    {
        $product = app(GetProductBySlug::class)->handle($product);
        $guide = app(GetProductGuideBySlug::class)->handle($product, $guide);

        app(UpdateProductGuide::class)->handle($guide, $product, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Panduan berhasil diperbarui.']);

        return redirect()->route('internal.products.guides.index', $product);
    }

    public function destroy(string $product, string $guide): RedirectResponse
    {
        $product = app(GetProductBySlug::class)->handle($product);
        $guide = app(GetProductGuideBySlug::class)->handle($product, $guide);
        app(DeleteProductGuide::class)->handle($guide, $product);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Panduan berhasil dihapus.']);

        return redirect()->route('internal.products.guides.index', $product);
    }

    public function reorder(ReorderProductGuidesRequest $request, string $product): RedirectResponse
    {
        $product = app(GetProductBySlug::class)->handle($product);

        app(ReorderProductGuides::class)->handle($product, $request->validated('order'));

        return back();
    }
}
