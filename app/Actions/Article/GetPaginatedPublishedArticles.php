<?php

namespace App\Actions\Article;

use App\Models\Article;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedPublishedArticles
{
    public function handle(): LengthAwarePaginator
    {
        $query = Article::where('is_published', true);

        if ($search = request()->input('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        return $query->latest()->paginate(9);
    }
}
