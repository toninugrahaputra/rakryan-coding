<?php

namespace App\Http\Controllers;

use App\Actions\Sitemap\GenerateSitemap;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $urls = app(GenerateSitemap::class)->handle();

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml');
    }
}
