<?php

namespace App\Actions\Order;

use App\Enums\OrderStatus;
use App\Models\Order;

class DeleteOrder
{
    public function handle(Order $order): void
    {
        abort_if($order->status !== OrderStatus::Pending, 403, 'Hanya order pending yang dapat dihapus.');

        $order->delete();
    }
}
