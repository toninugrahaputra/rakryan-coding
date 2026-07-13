<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
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
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => str($title)->slug()->toString(),
            'description' => fake()->paragraph(),
            'thumbnail' => null,
            'is_published' => fake()->boolean(),
        ];
    }
}
