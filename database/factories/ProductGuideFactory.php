<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductGuide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductGuide>
 */
class ProductGuideFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3, false);

        return [
            'product_id' => Product::factory(),
            'title' => $title,
            'slug' => str($title)->slug()->toString(),
            'content' => null,
            'order' => fake()->unique()->numberBetween(1, 9999),
            'is_published' => false,
        ];
    }
}
