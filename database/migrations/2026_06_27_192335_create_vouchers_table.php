<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name')->nullable();
            $table->enum('type', ['percentage', 'flat']);
            $table->unsignedInteger('value')->comment('Persen (1-100) untuk percentage, rupiah untuk flat');
            $table->unsignedInteger('max_discount')->nullable()->comment('Batas maksimum nominal diskon, terutama untuk percentage');
            $table->unsignedInteger('min_purchase')->nullable()->comment('Minimum harga produk agar voucher bisa dipakai');
            $table->unsignedInteger('quota')->nullable()->comment('Total kuota pemakaian global, null = unlimited');
            $table->unsignedInteger('usage_count')->default(0)->comment('Jumlah pemakaian global (denormalized)');
            $table->unsignedInteger('per_user_limit')->nullable()->comment('Batas pemakaian per user, null = unlimited');
            $table->boolean('applies_to_all_products')->default(true)->comment('true = berlaku semua produk, false = hanya produk di pivot');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
