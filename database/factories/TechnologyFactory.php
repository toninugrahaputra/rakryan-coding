<?php

namespace Database\Factories;

use App\Models\Technology;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Technology>
 */
class TechnologyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->randomElement([
            'Laravel', 'React', 'Vue.js', 'MySQL', 'PostgreSQL', 'PHP',
            'JavaScript', 'TypeScript', 'Tailwind CSS', 'Node.js', 'REST API', 'Docker',
        ]);

        return [
            'name' => $name,
            'slug' => str($name)->slug(),
            'logo' => null,
        ];
    }
}
