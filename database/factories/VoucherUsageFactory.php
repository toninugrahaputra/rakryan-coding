<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VoucherUsage>
 */
class VoucherUsageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'voucher_id' => Voucher::factory(),
            'user_id' => User::factory(),
            'order_id' => null,
            'discount_amount' => $this->faker->numberBetween(10000, 50000),
        ];
    }
}
