<?php

namespace Database\Factories;

use App\Enums\VoucherType;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Voucher>
 */
class VoucherFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('VCR####')),
            'name' => $this->faker->words(3, true),
            'type' => VoucherType::Flat,
            'value' => $this->faker->numberBetween(10000, 50000),
            'max_discount' => null,
            'min_purchase' => null,
            'quota' => null,
            'usage_count' => 0,
            'per_user_limit' => null,
            'applies_to_all_products' => true,
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
        ];
    }

    public function percentage(int $value = 10, ?int $maxDiscount = null): static
    {
        return $this->state([
            'type' => VoucherType::Percentage,
            'value' => $value,
            'max_discount' => $maxDiscount,
        ]);
    }

    public function flat(int $value = 25000): static
    {
        return $this->state([
            'type' => VoucherType::Flat,
            'value' => $value,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
