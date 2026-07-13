<?php

namespace App\Actions\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Validation\ValidationException;

class UpdateOrder
{
    public function handle(Order $order, array $data): void
    {
        if ($order->status !== OrderStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => 'Hanya order pending yang dapat diubah.',
            ]);
        }

        $order->update([
            'channel_group' => $data['channel_group'],
            'channel_name' => $data['channel_name'] ?? null,
            'payment_fee' => $data['payment_fee'],
            'total_amount' => $data['total_amount'],
            'net_amount' => $data['total_amount'] - $data['payment_fee'],
            'payment_reference' => $data['payment_reference'] ?? null,
            'payment_code' => $data['payment_code'] ?? null,
            'payment_metadata' => $data['payment_metadata'] ?? null,
        ]);
    }
}
