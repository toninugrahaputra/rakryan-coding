<?php

namespace App\Actions\Article;

use App\Models\Article;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateArticle
{
    public function handle(Article $article, array $data): void
    {
        $fields = [
            'title' => $data['title'],
            'slug' => $data['slug'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'] ?? null,
            'is_published' => $data['is_published'] ?? false,
        ];

        if (array_key_exists('thumbnail', $data)) {
            $fields['thumbnail'] = $this->replaceThumbnail($article, $data['thumbnail']);
        }

        $article->update($fields);
    }

    private function replaceThumbnail(Article $article, mixed $file): ?string
    {
        if ($article->thumbnail) {
            Storage::disk('public')->delete($article->thumbnail);
        }

        if ($file instanceof UploadedFile) {
            return $file->store('articles/thumbnails', 'public');
        }

        return null;
    }
}
