<?php

namespace App\Actions\Article;

use App\Models\Article;
use Illuminate\Support\Facades\Storage;

class DeleteArticle
{
    public function handle(Article $article): void
    {
        if ($article->thumbnail) {
            Storage::disk('public')->delete($article->thumbnail);
        }

        $article->delete();
    }
}
