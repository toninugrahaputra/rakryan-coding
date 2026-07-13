<?php

namespace App\Actions\Article;

use App\Models\Article;

class GetArticleBySlug
{
    public function handle(string $slug): Article
    {
        return Article::where('slug', $slug)->firstOrFail();
    }
}
