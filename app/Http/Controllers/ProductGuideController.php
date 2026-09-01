<?php

namespace App\Http\Controllers;

use App\Actions\Product\GetSourceCodeProductBySlug;
use App\Actions\ProductGuide\GetPublishedProductGuides;
use App\Actions\User\HasPurchasedProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductGuideController extends Controller
{
    public function show(Request $request, string $product, string $guide): Response
    {
        $product = app(GetSourceCodeProductBySlug::class)->handle($product);

        $guides = app(GetPublishedProductGuides::class)->handle($product);
        $currentGuide = $guides->firstWhere('slug', $guide);

        abort_if(! $currentGuide, 404);

        $user = $request->user();
        $isPurchased = app(HasPurchasedProduct::class)->handle($user, $product);

        $currentIndex = $guides->search(fn ($g) => $g->id === $currentGuide->id);
        $prevGuide = $currentIndex > 0 ? $guides[$currentIndex - 1] : null;
        $nextGuide = $currentIndex < $guides->count() - 1 ? $guides[$currentIndex + 1] : null;

        return Inertia::render('source-code/guide', [
            'product' => [
                'slug' => $product->slug,
                'title' => $product->title,
            ],
            'guide' => [
                'id' => $currentGuide->id,
                'title' => $currentGuide->title,
                'slug' => $currentGuide->slug,
                'order' => $currentGuide->order,
                // Isi konten cuma dikirim kalau sudah dibeli — sebelum itu, judul saja
                // yang boleh terlihat (dipakai sidebar sebagai daftar isi/"jualan").
                'content' => $isPurchased ? $currentGuide->content : null,
            ],
            'prevGuide' => $prevGuide ? ['slug' => $prevGuide->slug, 'title' => $prevGuide->title] : null,
            'nextGuide' => $nextGuide ? ['slug' => $nextGuide->slug, 'title' => $nextGuide->title] : null,
            'guides' => $guides->values()->map(fn ($g) => [
                'id' => $g->id,
                'title' => $g->title,
                'slug' => $g->slug,
                'order' => $g->order,
            ]),
            'isPurchased' => $isPurchased,
            'isLoggedIn' => $user !== null,
            'currentIndex' => $currentIndex + 1,
        ]);
    }
}
