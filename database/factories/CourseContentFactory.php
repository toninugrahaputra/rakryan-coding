<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseContent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseContent>
 */
class CourseContentFactory extends Factory
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
            'course_id' => Course::factory(),
            'title' => $title,
            'slug' => str($title)->slug()->toString(),
            'content' => null,
            'order' => fake()->unique()->numberBetween(1, 9999),
            'is_published' => false,
        ];
    }
}
