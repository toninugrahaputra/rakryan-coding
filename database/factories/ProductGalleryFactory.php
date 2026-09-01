<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductGallery;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductGallery>
 */
class ProductGalleryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'type' => 'image',
            'path' => 'products/galleries/'.fake()->uuid().'.jpg',
            'order' => fake()->numberBetween(0, 3),
        ];
    }
}
