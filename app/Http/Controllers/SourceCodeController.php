<?php

namespace App\Http\Controllers;

use App\Actions\Product\GetPublishedSourceCodeProducts;
use App\Actions\Product\GetSourceCodeProductBySlug;
use App\Actions\ProductGuide\GetPublishedProductGuides;
use App\Actions\Seo\ShareSeoMeta;
use App\Actions\User\HasPurchasedProduct;
use App\Enums\ProductPlatform;
use App\Http\Resources\Product\SourceCodeListResource;
use App\Http\Resources\Product\SourceCodeShowResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SourceCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $platform = ProductPlatform::tryFrom((string) $request->query('platform'));

        $products = app(GetPublishedSourceCodeProducts::class)->handle(platform: $platform);

        app(ShareSeoMeta::class)->handle(
            'Source Code Project',
            'Beli source code project siap pakai dari Rakryan Coding — cocok buat referensi, modifikasi, atau bahan tugas akhir.',
        );

        return Inertia::render('source-code/index', [
            'products' => SourceCodeListResource::collection($products),
            'filters' => [
                'platform' => $platform?->value,
            ],
        ]);
    }

    public function show(Request $request, string $product): Response
    {
        $product = app(GetSourceCodeProductBySlug::class)->handle($product);
        $product->load('galleries');

        $user = $request->user();
        $isPurchased = $user && app(HasPurchasedProduct::class)->handle($user, $product);

        app(ShareSeoMeta::class)->handle(
            $product->title,
            $product->description,
        );

        $guides = app(GetPublishedProductGuides::class)->handle($product);

        return Inertia::render('source-code/show', [
            'product' => new SourceCodeShowResource($product),
            'isPurchased' => $isPurchased,
            'isLoggedIn' => $user !== null,
            'guides' => $guides->values()->map(fn ($g) => [
                'title' => $g->title,
                'slug' => $g->slug,
                'order' => $g->order,
            ]),
        ]);
    }
}
