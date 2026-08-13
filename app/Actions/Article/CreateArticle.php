<?php

namespace App\Actions\Article;

use App\Actions\Notification\NotifyAllUsers;
use App\Models\Article;
use Illuminate\Http\UploadedFile;

class CreateArticle
{
    public function __construct(private NotifyAllUsers $notifyAllUsers) {}

    public function handle(array $data): Article
    {
        $article = Article::create([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'] ?? null,
            'thumbnail' => $this->storeThumbnail($data['thumbnail'] ?? null),
            'is_published' => $data['is_published'] ?? false,
        ]);

        if ($article->is_published) {
            $this->notifyAllUsers->handle(
                'Artikel Baru! 📰',
                "Artikel baru \"{$article->title}\" sudah bisa dibaca sekarang.",
                route('articles.show', $article),
            );
        }

        return $article;
    }

    private function storeThumbnail(mixed $file): ?string
    {
        if ($file instanceof UploadedFile) {
            return $file->store('articles/thumbnails', 'public');
        }

        return null;
    }
}
