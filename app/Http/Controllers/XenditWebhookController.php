<?php

namespace App\Http\Controllers;

use App\Actions\Order\ApproveOrder;
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
        }

        return response()->json(['message' => 'Success']);
    }
}
