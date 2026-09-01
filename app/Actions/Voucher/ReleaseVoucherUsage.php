<?php

namespace App\Actions\Voucher;

use App\Models\Order;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

class ReleaseVoucherUsage
{
    /**
     * Give back a cancelled/expired order's voucher redemption — it never resulted
     * in a sale, so it shouldn't keep counting against the voucher's global quota
     * or the user's per-voucher limit forever.
     */
    public function handle(Order $order): void
    {
        $usage = $order->voucherUsage;

        if (! $usage) {
            return;
        }

        DB::transaction(function () use ($usage) {
            $voucher = Voucher::whereKey($usage->voucher_id)->lockForUpdate()->first();

            if ($voucher && $voucher->usage_count > 0) {
                $voucher->decrement('usage_count');
            }

            $usage->delete();
        });
    }
}
