<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Follow-up for environments where the previous migration already ran
     * before it was corrected to convert `type` from a DB enum to a plain
     * string (see 2026_08_28_113705). Safe to run everywhere: on a fresh
     * database `type` is already a string(20) by that point, so this is a
     * no-op change there.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('type', 20)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally a no-op — reverting to a strict DB enum isn't safe
        // once rows may contain the newer 'source_code' value.
    }
};
