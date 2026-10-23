<?php

use App\Models\Event;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('vendor can create event with uploaded cover image', function () {
    Storage::fake('public');

    $vendor = User::factory()->create(['role' => 'vendor']);

    $image = UploadedFile::fake()->image('event_cover.jpg', 1200, 600);

    $payload = [
        'title' => 'Festival Musik Tahunan',
        'description' => 'Festival musik terbesar tahun ini',
        'category' => 'Musik',
        'type' => 'offline',
        'status' => 'published',
        'start_date' => now()->addDays(7)->format('Y-m-d H:i:s'),
        'end_date' => now()->addDays(8)->format('Y-m-d H:i:s'),
        'location_name' => 'Stadion Utama',
        'location_address' => 'Jl. Pemuda No. 1',
        'cover_image' => $image,
        'tickets' => [
            [
                'name' => 'Early Bird',
                'type' => 'paid',
                'price' => 150000,
                'quota' => 100,
                'is_active' => true,
            ],
        ],
    ];

    $response = $this->actingAs($vendor)->post(route('vendor.events.store'), $payload);

    $response->assertRedirect(route('vendor.events.index'));

    $event = Event::where('title', 'Festival Musik Tahunan')->first();
    expect($event)->not->toBeNull();
    expect($event->cover_image)->not->toBeNull();
    expect($event->cover_image)->toBeString();
    expect($event->cover_image)->toStartWith('events/covers/');

    Storage::disk('public')->assertExists($event->cover_image);
});

test('vendor can update event cover image', function () {
    Storage::fake('public');

    $vendor = User::factory()->create(['role' => 'vendor']);

    $oldImage = UploadedFile::fake()->image('old_cover.jpg');
    $oldPath = $oldImage->store('events/covers', 'public');

    $event = Event::factory()->create([
        'user_id' => $vendor->id,
        'title' => 'Event Awal',
        'cover_image' => $oldPath,
    ]);

    $newImage = UploadedFile::fake()->image('new_cover.jpg');

    $payload = [
        'title' => 'Event Diperbarui',
        'description' => 'Deskripsi baru',
        'category' => 'Seminar',
        'type' => 'offline',
        'status' => 'published',
        'start_date' => now()->addDays(3)->format('Y-m-d H:i:s'),
        'end_date' => now()->addDays(4)->format('Y-m-d H:i:s'),
        'location_name' => 'Gedung Pertemuan',
        'cover_image' => $newImage,
    ];

    $response = $this->actingAs($vendor)->put(route('vendor.events.update', $event), $payload);

    $response->assertRedirect(route('vendor.events.index'));

    $event->refresh();
    expect($event->cover_image)->not->toBe($oldPath);
    expect($event->cover_image)->toBeString();

    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($event->cover_image);
});
