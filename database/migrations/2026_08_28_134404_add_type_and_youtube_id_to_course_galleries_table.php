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
        Schema::table('course_galleries', function (Blueprint $table) {
            $table->string('path')->nullable()->change();
            $table->string('type')->default('image')->after('course_id');
            $table->string('youtube_id')->nullable()->after('path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_galleries', function (Blueprint $table) {
            $table->dropColumn(['type', 'youtube_id']);
        });
    }
};
