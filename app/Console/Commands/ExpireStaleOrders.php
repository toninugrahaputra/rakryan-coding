<?php

namespace App\Console\Commands;

use App\Actions\Voucher\ReleaseVoucherUsage;
use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('orders:expire-stale')]
#[Description('Tandai order pending yang sudah melewati batas waktu pembayaran (valid_until) sebagai expired.')]
class ExpireStaleOrders extends Command
{
    /**
     * Grace period past valid_until before an order is actually marked expired —
     * gives a Xendit "paid" webhook that lands slightly late (network hiccup, a
     * payment confirmed right at the deadline) room to still land on a Pending
     * order instead of racing this command and needing manual review.
     */
    private const GRACE_PERIOD_HOURS = 2;

    /**
     * Execute the console command.
     */
    public function handle(ReleaseVoucherUsage $releaseVoucherUsage): int
    {
        $staleOrders = Order::query()
            ->where('status', OrderStatus::Pending)
            ->whereNotNull('valid_until')
            ->where('valid_until', '<', now()->subHours(self::GRACE_PERIOD_HOURS))
            ->with('voucherUsage')
            ->get();

        foreach ($staleOrders as $order) {
            $releaseVoucherUsage->handle($order);
        }

        $count = Order::query()
            ->whereIn('id', $staleOrders->pluck('id'))
            ->update(['status' => OrderStatus::Expired]);

        $this->info("{$count} order ditandai sebagai expired.");

        return self::SUCCESS;
    }
}
