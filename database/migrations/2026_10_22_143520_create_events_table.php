<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category');
            $table->enum('type', ['online', 'offline', 'hybrid'])->default('offline');
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');

            // Location fields (offline/hybrid)
            $table->string('location_name')->nullable();
            $table->text('location_address')->nullable();
            $table->string('location_maps_url')->nullable();

            // Online fields (online/hybrid)
            $table->string('online_platform')->nullable(); // zoom, youtube, etc.
            $table->string('online_url')->nullable();
            $table->string('online_url_password')->nullable();
            $table->boolean('online_url_protected')->default(false);

            // Date & time
            $table->dateTime('start_date');
            $table->dateTime('end_date');

            // Registration period
            $table->dateTime('registration_start')->nullable();
            $table->dateTime('registration_end')->nullable();

            // Capacity
            $table->unsignedInteger('max_attendees')->nullable(); // null = unlimited

            // Cover image
            $table->string('cover_image')->nullable();

            // Tags as JSON
            $table->json('tags')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
