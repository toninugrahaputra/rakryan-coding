<?php

namespace Database\Factories;

use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4, false);

        return [
            'title' => $title,
            'slug' => str($title)->slug()->toString(),
            'excerpt' => fake()->paragraph(),
            'content' => [
                'time' => now()->timestamp,
                'blocks' => [
                    ['type' => 'paragraph', 'data' => ['text' => fake()->paragraphs(3, true)]],
                ],
                'version' => '2.29.0',
            ],
            'thumbnail' => null,
            'is_published' => true,
        ];
    }
}
