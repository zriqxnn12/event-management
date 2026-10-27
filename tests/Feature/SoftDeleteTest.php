<?php

use App\Models\Event;
use App\Models\EventAgenda;
use App\Models\EventCoupon;
use App\Models\EventSpeaker;
use App\Models\EventSponsor;
use App\Models\EventTicket;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('all required tables have deleted_at column', function () {
    $tables = [
        'users',
        'events',
        'event_tickets',
        'event_coupons',
        'event_agendas',
        'event_speakers',
        'event_sponsors',
    ];

    foreach ($tables as $table) {
        expect(Schema::hasColumn($table, 'deleted_at'))->toBeTrue(
            "Expected table [{$table}] to have [deleted_at] column."
        );
    }
});

test('models support soft delete and restore', function () {
    $user = User::factory()->create();
    $user->delete();
    expect($user->trashed())->toBeTrue()
        ->and(User::find($user->id))->toBeNull()
        ->and(User::withTrashed()->find($user->id))->not->toBeNull();
    $user->restore();
    expect($user->trashed())->toBeFalse()
        ->and(User::find($user->id))->not->toBeNull();

    $event = Event::factory()->create(['user_id' => $user->id]);
    $event->delete();
    expect($event->trashed())->toBeTrue()
        ->and(Event::find($event->id))->toBeNull()
        ->and(Event::withTrashed()->find($event->id))->not->toBeNull();
    $event->restore();
    expect($event->trashed())->toBeFalse();

    $ticket = EventTicket::create([
        'event_id' => $event->id,
        'name' => 'VIP',
        'price' => 50000,
        'type' => 'paid',
        'order' => 1,
    ]);
    $ticket->delete();
    expect($ticket->trashed())->toBeTrue()
        ->and(EventTicket::find($ticket->id))->toBeNull();
    $ticket->restore();
    expect($ticket->trashed())->toBeFalse();

    $coupon = EventCoupon::create([
        'event_id' => $event->id,
        'code' => 'DISC10',
        'discount_type' => 'percentage',
        'discount_value' => 10,
    ]);
    $coupon->delete();
    expect($coupon->trashed())->toBeTrue()
        ->and(EventCoupon::find($coupon->id))->toBeNull();
    $coupon->restore();
    expect($coupon->trashed())->toBeFalse();

    $agenda = EventAgenda::create([
        'event_id' => $event->id,
        'title' => 'Opening Ceremony',
        'start_time' => '09:00:00',
        'order' => 1,
    ]);
    $agenda->delete();
    expect($agenda->trashed())->toBeTrue()
        ->and(EventAgenda::find($agenda->id))->toBeNull();
    $agenda->restore();
    expect($agenda->trashed())->toBeFalse();

    $speaker = EventSpeaker::create([
        'event_id' => $event->id,
        'name' => 'John Doe',
        'order' => 1,
    ]);
    $speaker->delete();
    expect($speaker->trashed())->toBeTrue()
        ->and(EventSpeaker::find($speaker->id))->toBeNull();
    $speaker->restore();
    expect($speaker->trashed())->toBeFalse();

    $sponsor = EventSponsor::create([
        'event_id' => $event->id,
        'name' => 'Tech Corp',
        'order' => 1,
    ]);
    $sponsor->delete();
    expect($sponsor->trashed())->toBeTrue()
        ->and(EventSponsor::find($sponsor->id))->toBeNull();
    $sponsor->restore();
    expect($sponsor->trashed())->toBeFalse();
});
