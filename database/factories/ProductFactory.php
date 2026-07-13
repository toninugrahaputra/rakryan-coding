<?php

namespace Database\Factories;

use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->words(3, true);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(ProductType::cases()),
            'price' => $this->faker->numberBetween(50000, 500000),
            'price_strikethrough' => null,
            'is_published' => false,
            'is_favourite' => false,
        ];
    }

    public function single(): static
    {
        return $this->state(['type' => ProductType::Single]);
    }

    public function bundle(): static
    {
        return $this->state(['type' => ProductType::Bundle]);
    }

    public function published(): static
    {
        return $this->state(['is_published' => true]);
    }
}
