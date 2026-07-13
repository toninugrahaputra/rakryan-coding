<?php

namespace App\Actions\Voucher;

use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Support\Facades\DB;

class RedeemVoucher
{
    /**
     * Record a voucher redemption and bump its global usage counter.
     *
     * Runs inside a transaction with a pessimistic lock on the voucher row so the
     * quota counter stays consistent under concurrent checkouts.
     */
    public function handle(Voucher $voucher, User $user, int $discount, ?Order $order = null): VoucherUsage
    {
        return DB::transaction(function () use ($voucher, $user, $discount, $order) {
            $locked = Voucher::whereKey($voucher->id)->lockForUpdate()->firstOrFail();

            $usage = $locked->usages()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'order_id' => null,
                ],
                [
                    'order_id' => $order?->id,
                    'discount_amount' => $discount,
                ]
            );

            $locked->increment('usage_count');

            return $usage;
        });
    }
}
