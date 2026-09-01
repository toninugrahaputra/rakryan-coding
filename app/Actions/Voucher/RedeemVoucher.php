<?php

namespace App\Actions\Voucher;

use App\Models\Order;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RedeemVoucher
{
    /**
     * Record a voucher redemption and bump its global usage counter.
     *
     * Runs inside a transaction with a pessimistic lock on the voucher row so the
     * quota AND per-user-limit counters stay consistent under concurrent checkouts.
     * Both are re-checked here (not just in ApplyVoucher's earlier unlocked read)
     * because many concurrent checkouts — e.g. the same user double-submitting in
     * two tabs — can each pass that earlier check before any of them commits.
     * Without re-checking under the lock, a `per_user_limit: 1` voucher could be
     * redeemed twice by the same user in one race.
     */
    public function handle(Voucher $voucher, User $user, int $discount, ?Order $order = null): VoucherUsage
    {
        return DB::transaction(function () use ($voucher, $user, $discount, $order) {
            $locked = Voucher::whereKey($voucher->id)->lockForUpdate()->firstOrFail();

            if ($locked->quota !== null && $locked->usage_count >= $locked->quota) {
                throw ValidationException::withMessages([
                    'voucher_code' => 'Kuota voucher sudah habis.',
                ]);
            }

            $perUserLimit = $locked->per_user_limit ?? 1;
            $userUsageCount = $locked->usages()->where('user_id', $user->id)->whereNotNull('order_id')->count();

            if ($userUsageCount >= $perUserLimit) {
                throw ValidationException::withMessages([
                    'voucher_code' => "Voucher hanya dapat digunakan {$perUserLimit} kali per pengguna.",
                ]);
            }

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
