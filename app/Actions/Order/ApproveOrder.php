<?php

namespace App\Actions\Order;

use App\Actions\Notification\NotifyUser;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApproveOrder
{
    public function __construct(private NotifyUser $notifyUser) {}

    public function handle(Order $order, User $approvedBy): Order
    {
        // Pending adalah jalur normal. Expired/Cancel tetap boleh disetujui secara
        // manual lewat alur peninjauan pembayaran (order ternyata lunas di Xendit
        // walau statusnya di sini sudah kadaluarsa/dibatalkan) — hanya order yang
        // sudah Paid yang ditolak, supaya tidak ada approval ganda.
        if ($order->status === OrderStatus::Paid) {
            throw ValidationException::withMessages([
                'status' => 'Order ini sudah disetujui sebelumnya.',
            ]);
        }

        DB::transaction(function () use ($order, $approvedBy) {
            $order->update([
                'status' => OrderStatus::Paid,
                'paid_at' => now(),
                'approved_by' => $approvedBy->id,
                'needs_payment_review' => false,
            ]);

            UserSubscription::firstOrCreate(
                ['user_id' => $order->user_id, 'product_id' => $order->product_id],
                ['order_id' => $order->id],
            );
        });

        $order->loadMissing('product', 'user');

        $this->notifyUser->handle(
            $order->user,
            'Pembelian Berhasil! 🎉',
            "Selamat! Kamu berhasil membeli \"{$order->product->title}\". Yuk mulai belajar sekarang!",
            route('orders.show', $order),
        );

        return $order;
    }
}
