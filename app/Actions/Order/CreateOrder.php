<?php

namespace App\Actions\Order;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Str;

class CreateOrder
{
    public function handle(array $data): Order
    {
        $product = Product::findOrFail($data['product_id']);

        return Order::create([
            'user_id' => $data['user_id'],
            'product_id' => $product->id,
            'items' => [
                'product_id' => $product->id,
                'product_name' => $product->title,
                'product_type' => $product->type->value,
                'product_price' => $product->price,
                'product_price_strikethrough' => $product->price_strikethrough,
            ],
            'order_number' => $this->generateOrderNumber(),
            'provider' => 'Manual',
            'channel_group' => $data['channel_group'],
            'channel_code' => $data['channel_code'] ?? null,
            'channel_name' => $data['channel_name'] ?? null,
            'payment_reference' => $data['payment_reference'] ?? null,
            'payment_code' => $data['payment_code'] ?? null,
            'payment_fee' => $data['payment_fee'],
            'total_amount' => $data['total_amount'],
            'net_amount' => $data['total_amount'] - $data['payment_fee'],
            'payment_metadata' => $data['payment_metadata'] ?? null,
            'status' => 'pending',
        ]);
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}
