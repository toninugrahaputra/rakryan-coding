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
            $table->string('username')->unique()->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('phone')->nullable();
            $table->text('bio')->nullable();
            $table->string('school')->nullable();
            $table->string('major')->nullable();
            $table->string('grade')->nullable();
            $table->integer('graduation_year')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('city')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username', 'avatar_url', 'phone', 'bio', 'school', 'major', 'grade',
                'graduation_year', 'birth_date', 'gender', 'city'
            ]);
        });
    }
};
