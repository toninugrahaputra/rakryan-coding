<?php

namespace App\Actions\Article;

use App\Models\Article;
use Illuminate\Database\Eloquent\Collection;

class GetLatestArticles
{
    public function handle(int $limit = 6): Collection
    {
        return Article::where('is_published', true)
            ->latest()
            ->take($limit)
            ->get();
    }
}
