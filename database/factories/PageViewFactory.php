<?php

namespace Database\Factories;

use App\Models\PageView;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PageView>
 */
class PageViewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'session_id' => (string) Str::uuid(),
            'path' => '/courses',
        ];
    }

    public function byUser(?User $user = null): static
    {
        return $this->state(fn () => [
            'user_id' => ($user ?? User::factory()->create())->id,
            'session_id' => null,
        ]);
    }
}
