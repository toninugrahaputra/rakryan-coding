<?php

namespace App\Actions\Article;

use App\Services\ArticleAiGeneratorService;

class GenerateArticleContent
{
    public function __construct(private ArticleAiGeneratorService $articleAiGeneratorService) {}

    /**
     * @return array{excerpt: ?string, blocks: array<int, array<string, mixed>>}
     */
    public function handle(string $title): array
    {
        return $this->articleAiGeneratorService->generateArticle($title);
    }
}
