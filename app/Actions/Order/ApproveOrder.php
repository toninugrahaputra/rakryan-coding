<?php

namespace App\Actions\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApproveOrder
{
    public function handle(Order $order, User $approvedBy): Order
    {
        if ($order->status !== OrderStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => 'Hanya order berstatus pending yang dapat disetujui.',
            ]);
        }

        DB::transaction(function () use ($order, $approvedBy) {
            $order->update([
                'status' => OrderStatus::Paid,
                'paid_at' => now(),
                'approved_by' => $approvedBy->id,
            ]);

            UserSubscription::firstOrCreate(
                ['user_id' => $order->user_id, 'product_id' => $order->product_id],
                ['order_id' => $order->id],
            );
        });

        return $order;
    }
}
