<?php

namespace App\Console\Commands;

use App\Http\Controllers\XenditWebhookController;
use App\Models\Order;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Http\Request;

#[Signature('xendit:simulate {order_number} {--status=PAID : PAID, SETTLED, atau EXPIRED}')]
#[Description('Simulasikan webhook Xendit untuk testing lokal, tanpa perlu akun Xendit asli.')]
class SimulateXenditPayment extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (! app()->environment('local', 'testing')) {
            $this->error('Command ini hanya bisa dijalankan di environment local/testing.');

            return self::FAILURE;
        }

        $order = Order::where('order_number', $this->argument('order_number'))->first();

        if (! $order) {
            $this->error("Order dengan nomor {$this->argument('order_number')} tidak ditemukan.");

            return self::FAILURE;
        }

        $callbackToken = config('services.xendit.callback_token');

        if (blank($callbackToken)) {
            $this->error('XENDIT_CALLBACK_TOKEN belum diisi di .env. Isi dengan string bebas (mis. "local-testing-token") untuk simulasi lokal — belum perlu token asli dari Xendit.');

            return self::FAILURE;
        }

        $status = strtoupper($this->option('status'));

        $request = Request::create('/webhooks/xendit', 'POST', [
            'external_id' => $order->order_number,
            'status' => $status,
            'amount' => $order->net_amount,
        ]);
        $request->headers->set('x-callback-token', $callbackToken);

        $response = app(XenditWebhookController::class)->handle($request);

        $this->info("Webhook dikirim: status={$status}, order={$order->order_number}");
        $this->line('Response ('.$response->getStatusCode().'): '.$response->getContent());
        $this->info('Status order sekarang: '.$order->fresh()->status->value);

        return self::SUCCESS;
    }
}
