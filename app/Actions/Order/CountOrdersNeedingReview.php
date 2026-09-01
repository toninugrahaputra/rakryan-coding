<?php

namespace App\Actions\Order;

use App\Models\Order;

class CountOrdersNeedingReview
{
    public function handle(): int
    {
        return Order::where('needs_payment_review', true)->count();
    }
}
