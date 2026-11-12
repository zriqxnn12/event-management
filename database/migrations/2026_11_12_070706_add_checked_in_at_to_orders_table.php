<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('checked_in_at')->nullable()->after('snap_token');
            $table->unsignedInteger('checked_in_count')->default(0)->after('checked_in_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['checked_in_at', 'checked_in_count']);
        });
    }
};
