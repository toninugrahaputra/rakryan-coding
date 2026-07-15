<?php

namespace App\Console\Commands;

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
    public function handle(): int
    {
        $count = Order::query()
            ->where('status', OrderStatus::Pending)
            ->whereNotNull('valid_until')
            ->where('valid_until', '<', now())
            ->update(['status' => OrderStatus::Expired]);

        $this->info("{$count} order ditandai sebagai expired.");

        return self::SUCCESS;
    }
}
