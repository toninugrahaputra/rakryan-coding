<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseGallery;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseGallery>
 */
class CourseGalleryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'path' => 'courses/galleries/'.fake()->uuid().'.jpg',
            'order' => fake()->numberBetween(0, 3),
        ];
    }
}
