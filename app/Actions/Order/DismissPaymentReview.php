<?php

namespace App\Actions\Order;

use App\Models\Order;

class DismissPaymentReview
{
    /**
     * Clear an order's "needs manual review" flag without approving it — for
     * when an admin checks the Xendit dashboard and confirms the late webhook
     * was a false alarm (duplicate delivery, stale retry) rather than a real
     * missed payment.
     */
    public function handle(Order $order): Order
    {
        $order->update(['needs_payment_review' => false]);

        return $order;
    }
}
