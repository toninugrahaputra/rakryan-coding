<?php

namespace App\Http\Controllers;

use App\Actions\Order\ApproveOrder;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $token = $request->header('x-callback-token');
        $expectedToken = config('services.xendit.callback_token');

        // Validasi callback token jika dikonfigurasi di .env
        if (blank($expectedToken) || $token !== $expectedToken) {
            Log::warning('Xendit Webhook: Callback token mismatch.');

            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        $status = $payload['status'] ?? null;
        $externalId = $payload['external_id'] ?? null;

        Log::info("Xendit Webhook received: external_id={$externalId}, status={$status}");

        if (! $externalId) {
            return response()->json(['message' => 'Invalid external_id'], 400);
        }

        $order = Order::where('order_number', $externalId)->first();

        if (! $order) {
            Log::warning("Xendit Webhook: Order {$externalId} not found.");

            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($status === 'PAID' || $status === 'SETTLED') {
            // Sudah pernah diproses (retry/duplicate delivery dari Xendit) — balas 200 idempotent
            // supaya Xendit berhenti mengirim ulang webhook yang sama.
            if ($order->status === OrderStatus::Paid) {
                Log::info("Xendit Webhook: Order {$externalId} already paid, skipping (idempotent).");

                return response()->json(['message' => 'Already processed']);
            }

            // Order sudah dibatalkan/kedaluwarsa di sisi kita tapi tetap dibayar di Xendit —
            // butuh peninjauan manual, tapi tetap balas 200 agar Xendit tidak retry terus-menerus.
            if ($order->status !== OrderStatus::Pending) {
                Log::warning("Xendit Webhook: Order {$externalId} received PAID webhook while status is {$order->status->value}. Perlu peninjauan manual.");

                return response()->json(['message' => 'Order not payable, manual review required']);
            }

            // Ambil admin user pertama sebagai penanggung jawab approve order otomatis
            $adminUser = User::role('admin')->first() ?? User::first();

            if (! $adminUser) {
                Log::error('Xendit Webhook: No admin user found to approve order.');

                return response()->json(['message' => 'No administrator available'], 500);
            }

            try {
                app(ApproveOrder::class)->handle($order, $adminUser);
                Log::info("Xendit Webhook: Order {$externalId} successfully marked as PAID and subscription activated.");
            } catch (\Exception $e) {
                Log::error('Xendit Webhook: Error approving order: '.$e->getMessage());

                return response()->json(['message' => 'Failed to process activation'], 500);
            }

            return response()->json(['message' => 'Success']);
        }

        if ($status === 'EXPIRED') {
            if ($order->status === OrderStatus::Pending) {
                $order->update(['status' => OrderStatus::Expired]);
                Log::info("Xendit Webhook: Order {$externalId} marked as expired.");
            }

            return response()->json(['message' => 'Success']);
        }

        return response()->json(['message' => 'Success']);
    }
}
