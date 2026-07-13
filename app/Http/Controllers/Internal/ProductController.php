<?php

namespace App\Http\Controllers\Internal;

use App\Actions\Product\CreateProduct;
use App\Actions\Product\DeleteProduct;
use App\Actions\Product\GetCourseOptions;
use App\Actions\Product\GetPaginatedProducts;
use App\Actions\Product\GetProductBySlug;
use App\Actions\Product\UpdateProduct;
use App\Http\Controllers\Controller;
use App\Http\Requests\Internal\ProductRequest;
use App\Http\Resources\Product\ProductListResource;
use App\Http\Resources\Product\ProductShowResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('internal/products/index', [
            'products' => ProductListResource::collection(app(GetPaginatedProducts::class)->handle()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('internal/products/create', [
            'courses' => app(GetCourseOptions::class)->handle(),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        app(CreateProduct::class)->handle($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Produk berhasil ditambahkan.']);

        return redirect()->route('internal.products.index');
    }

    public function edit(string $product): Response
    {
        $product = app(GetProductBySlug::class)->handle($product);
        $product->load('courses');

        return Inertia::render('internal/products/edit', [
            'product' => new ProductShowResource($product),
            'courses' => app(GetCourseOptions::class)->handle(),
        ]);
    }

    public function update(ProductRequest $request, string $product): RedirectResponse
    {
        $product = app(GetProductBySlug::class)->handle($product);
        app(UpdateProduct::class)->handle($product, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Produk berhasil diperbarui.']);

        return redirect()->route('internal.products.index');
    }

    public function destroy(string $product): RedirectResponse
    {
        $product = app(GetProductBySlug::class)->handle($product);
        app(DeleteProduct::class)->handle($product);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Produk berhasil dihapus.']);

        return redirect()->route('internal.products.index');
    }
}
