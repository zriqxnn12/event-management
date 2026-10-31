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
            $table->string('number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_ticket_id')->constrained()->cascadeOnDelete();
            $table->string('attendee_name');
            $table->string('attendee_email');
            $table->string('attendee_phone')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->decimal('total_price', 12, 2);
            $table->enum('payment_status', ['pending', 'paid', 'expired', 'cancelled'])
                ->default('pending')
                ->comment('pending=Menunggu Pembayaran, paid=Sudah Dibayar, expired=Kadaluarsa, cancelled=Dibatalkan');
            $table->string('snap_token')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
