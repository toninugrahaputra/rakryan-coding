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
        Schema::table('users', function (Blueprint $table) {
            $table->string('region')->nullable()->after('city');
            $table->string('info_source')->nullable()->after('region');
            $table->string('status')->nullable()->after('info_source');
            $table->text('additional_notes')->nullable()->after('status');
            $table->timestamp('onboarded_at')->nullable()->after('additional_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'region',
                'info_source',
                'status',
                'additional_notes',
                'onboarded_at',
            ]);
        });
    }
};
