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
     * Execute the console command.
     */
    public function handle(ReleaseVoucherUsage $releaseVoucherUsage): int
    {
        $staleOrders = Order::query()
            ->where('status', OrderStatus::Pending)
            ->whereNotNull('valid_until')
            ->where('valid_until', '<', now())
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
