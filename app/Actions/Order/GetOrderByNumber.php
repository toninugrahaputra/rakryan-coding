<?php

namespace App\Actions\Order;

use App\Models\Order;

class GetOrderByNumber
{
    public function handle(string $orderNumber): Order
    {
        return Order::where('order_number', $orderNumber)->firstOrFail();
    }
}
