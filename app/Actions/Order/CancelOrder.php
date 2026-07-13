<?php

namespace App\Actions\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Validation\ValidationException;

class CancelOrder
{
    public function handle(Order $order): Order
    {
        if ($order->status !== OrderStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => 'Hanya order berstatus pending yang dapat dibatalkan.',
            ]);
        }

        $order->update(['status' => OrderStatus::Cancel]);

        return $order;
    }
}
