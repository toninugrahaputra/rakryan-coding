<?php

namespace App\Actions\Article;

use App\Actions\Notification\NotifyAllUsers;
use App\Models\Article;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Throwable;

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
            try {
                $this->notifyAllUsers->handle(
                    'Artikel Baru! 📰',
                    "Artikel baru \"{$article->title}\" sudah bisa dibaca sekarang.",
                    route('articles.show', $article),
                );
            } catch (Throwable $e) {
                Log::error('Failed to notify users about new article', [
                    'article_id' => $article->id,
                    'exception' => $e->getMessage(),
                ]);
            }
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
