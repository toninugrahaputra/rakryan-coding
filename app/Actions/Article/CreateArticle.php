<?php

namespace App\Actions\Article;

use App\Models\Article;
use Illuminate\Http\UploadedFile;

class CreateArticle
{
    public function handle(array $data): Article
    {
        return Article::create([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'] ?? null,
            'thumbnail' => $this->storeThumbnail($data['thumbnail'] ?? null),
            'is_published' => $data['is_published'] ?? false,
        ]);
    }

    private function storeThumbnail(mixed $file): ?string
    {
        if ($file instanceof UploadedFile) {
            return $file->store('articles/thumbnails', 'public');
        }

        return null;
    }
}
