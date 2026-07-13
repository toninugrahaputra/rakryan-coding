<?php

namespace App\Actions\Article;

use App\Models\Article;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPaginatedArticles
{
    public function handle(): LengthAwarePaginator
    {
        $query = Article::query();

        if ($search = request()->input('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        return $query->latest()->paginate(12);
    }
}
