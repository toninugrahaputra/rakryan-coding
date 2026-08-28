<?php

namespace App\Http\Controllers;

use App\Actions\Product\GetSourceCodeProductBySlug;
use App\Actions\User\HasPurchasedProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SourceCodeDownloadController extends Controller
{
    public function __invoke(Request $request, string $product): StreamedResponse
    {
        $product = app(GetSourceCodeProductBySlug::class)->handle($product);

        $isPurchased = app(HasPurchasedProduct::class)->handle($request->user(), $product);

        if (! $isPurchased || ! $product->source_code_path) {
            abort(403);
        }

        return Storage::disk('local')->download(
            $product->source_code_path,
            "{$product->slug}.zip",
        );
    }
}
