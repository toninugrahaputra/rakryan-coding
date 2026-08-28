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
        Schema::table('products', function (Blueprint $table) {
            // Diganti dari enum DB ke string biasa: validitas nilai sudah dijaga oleh
            // App\Enums\ProductType di level aplikasi, jadi menambah tipe baru nanti
            // tidak perlu migration ALTER enum lagi (yang berbeda syntax-nya per driver).
            $table->string('type', 20)->change();
            $table->string('source_code_path')->nullable()->after('thumbnail');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('source_code_path');
        });
    }
};
