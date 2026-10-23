<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Reguler, VIP, VVIP, etc.
            $table->text('description')->nullable();
            $table->enum('type', ['free', 'paid'])->default('free');
            $table->decimal('price', 12, 2)->default(0);
            $table->unsignedInteger('quota')->nullable(); // null = unlimited
            $table->unsignedInteger('sold')->default(0);
            $table->dateTime('sale_start')->nullable();
            $table->dateTime('sale_end')->nullable();
            $table->json('perks')->nullable(); // Array of perks/benefits
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_tickets');
    }
};
