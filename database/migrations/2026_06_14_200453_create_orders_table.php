<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->json('items');
            $table->string('order_number')->unique()->comment('Kode referensi unik untuk internal');
            $table->string('provider')->nullable()->index();
            $table->string('payment_reference')->nullable()->index()->comment('Kode referensi unik dari payment gateway');
            $table->string('channel_group');
            $table->string('channel_code')->nullable();
            $table->string('channel_name')->nullable();
            $table->unsignedInteger('payment_fee')->default(0);
            $table->string('payment_code')->nullable()->comment('Nomor VA atau kode pembayaran yang diinput user');
            $table->string('payment_url')->nullable()->comment('URL gambar QRIS atau deeplink e-wallet / jump-to-app');
            $table->unsignedInteger('total_amount');
            $table->unsignedInteger('net_amount');
            $table->timestamp('valid_until')->nullable();
            $table->enum('status', ['pending', 'paid', 'cancel', 'expired'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('payment_metadata')->nullable()->comment('Raw response dari payment gateway atau data tambahan transaksi manual');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
