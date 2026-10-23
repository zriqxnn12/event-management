<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_agendas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('speaker_name')->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->date('date')->nullable(); // for multi-day events
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_agendas');
    }
};
