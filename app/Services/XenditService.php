<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XenditService
{
    protected ?string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('services.xendit.secret_key');
    }

    /**
     * Create an invoice on Xendit.
     * If the XENDIT_SECRET_KEY is empty or begins with 'mock_', it will return a mock payment url.
     */
    public function createInvoice(Order $order, string $email, string $description): array
    {
        if (empty($this->secretKey) || str_starts_with($this->secretKey, 'mock_') || app()->environment('testing')) {
            // Mock Fallback
            $mockUrl = route('orders.show', $order->id).'?mock_pay=1';
            $expiryDate = now()->addDay()->toIso8601String();

            return [
                'id' => 'xnd_mock_'.time().'_'.rand(1000, 9999),
                'invoice_url' => $mockUrl,
                'status' => 'PENDING',
                'expiry_date' => $expiryDate,
                'raw' => [
                    'mock' => true,
                    'note' => 'XENDIT_SECRET_KEY belum dikonfigurasi — ini invoice simulasi lokal, bukan invoice Xendit asli.',
                    'expiry_date' => $expiryDate,
                ],
            ];
        }

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->post('https://api.xendit.co/v2/invoices', [
                    'external_id' => $order->order_number,
                    'amount' => (int) $order->net_amount,
                    'payer_email' => $email,
                    'description' => $description,
                    'success_redirect_url' => route('orders.show', $order->id),
                    'failure_redirect_url' => route('orders.show', $order->id),
                ]);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'id' => $data['id'],
                    'invoice_url' => $data['invoice_url'],
                    'status' => $data['status'],
                    'expiry_date' => $data['expiry_date'] ?? null,
                    'raw' => $data,
                ];
            }

            Log::error('Xendit invoice creation failed: '.$response->body());
            throw new \Exception('Gagal membuat invoice ke Xendit: '.$response->status());
        } catch (\Exception $e) {
            Log::error('Xendit request exception: '.$e->getMessage());
            throw $e;
        }
    }
}
