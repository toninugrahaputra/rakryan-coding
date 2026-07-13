<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        $product = Product::factory()->create();
        $totalAmount = fake()->numberBetween(50000, 500000);

        return [
            'user_id' => User::factory(),
            'product_id' => $product->id,
            'items' => [
                'product_id' => $product->id,
                'product_name' => $product->title,
                'product_type' => $product->type->value,
                'product_price' => $product->price,
                'product_price_strikethrough' => $product->price_strikethrough,
            ],
            'order_number' => 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
            'provider' => 'Manual',
            'payment_reference' => null,
            'channel_group' => fake()->randomElement(['Transfer', 'Virtual Account', 'QRIS', 'E Wallet']),
            'channel_code' => null,
            'channel_name' => fake()->randomElement(['BCA', 'BRI', 'Mandiri', 'OVO', 'GoPay']),
            'payment_fee' => 0,
            'payment_code' => null,
            'payment_url' => null,
            'total_amount' => $totalAmount,
            'net_amount' => $totalAmount,
            'valid_until' => null,
            'payment_metadata' => null,
            'status' => OrderStatus::Pending,
            'paid_at' => null,
            'approved_by' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Pending]);
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status' => OrderStatus::Paid,
            'paid_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => OrderStatus::Cancel]);
    }
}
