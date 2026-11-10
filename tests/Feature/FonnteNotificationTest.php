<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\User;
use App\Services\Fonnte\FonnteService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Config::set('fonnte.token', 'test-fonnte-token-12345');
    Config::set('fonnte.url', 'https://api.fonnte.com/send');
    Config::set('fonnte.country_code', '62');
});

test('phone number formatting normalizes indonesian numbers correctly', function () {
    $service = new FonnteService;

    expect($service->formatPhoneNumber('081234567890'))->toBe('6281234567890');
    expect($service->formatPhoneNumber('81234567890'))->toBe('6281234567890');
    expect($service->formatPhoneNumber('+6281234567890'))->toBe('6281234567890');
    expect($service->formatPhoneNumber('6281234567890'))->toBe('6281234567890');
    expect($service->formatPhoneNumber('0812-3456-7890'))->toBe('6281234567890');
    expect($service->formatPhoneNumber('0812 3456 7890'))->toBe('6281234567890');
});

test('sendMessage posts to fonnte api with authorization header and body', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response([
            'status' => true,
            'target' => ['6281234567890'],
            'detail' => 'success',
        ], 200),
    ]);

    $service = new FonnteService;
    $result = $service->sendMessage('081234567890', 'Pesan pengujian');

    expect($result['success'])->toBeTrue();

    Http::assertSent(function ($request) {
        return $request->url() === 'https://api.fonnte.com/send'
            && $request->hasHeader('Authorization', 'test-fonnte-token-12345')
            && $request['target'] === '6281234567890'
            && $request['message'] === 'Pesan pengujian'
            && $request['countryCode'] === '62';
    });
});

test('sendMessage returns false when fonnte token is empty', function () {
    Config::set('fonnte.token', '');

    Http::fake();

    $service = new FonnteService;
    $result = $service->sendMessage('081234567890', 'Pesan pengujian');

    expect($result['success'])->toBeFalse();
    expect($result['error'])->toBe('FONNTE_TOKEN not configured');
    Http::assertNothingSent();
});

test('sendOrderPendingNotification sends formatted pending message with order details', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
    ]);

    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id, 'title' => 'Konser Musik Akbar']);
    $ticket = EventTicket::factory()->create([
        'event_id' => $event->id,
        'name' => 'VIP Presale',
        'price' => 250000,
    ]);

    $order = Order::factory()->create([
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'attendee_name' => 'Budi Santoso',
        'attendee_phone' => '081234567899',
        'quantity' => 2,
        'total_price' => 500000,
        'payment_status' => 'pending',
    ]);

    $service = new FonnteService;
    $success = $service->sendOrderPendingNotification($order);

    expect($success)->toBeTrue();

    Http::assertSent(function ($request) use ($order) {
        $message = $request['message'];

        return $request['target'] === '6281234567899'
            && str_contains($message, 'Budi Santoso')
            && str_contains($message, $order->number)
            && str_contains($message, 'Konser Musik Akbar')
            && str_contains($message, 'VIP Presale')
            && str_contains($message, 'MENUNGGU PEMBAYARAN')
            && str_contains($message, '500.000');
    });
});

test('sendOrderPaidNotification sends formatted paid message with ticket and receipt links', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
    ]);

    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id, 'title' => 'Workshop Desain']);
    $ticket = EventTicket::factory()->create([
        'event_id' => $event->id,
        'name' => 'General Admission',
        'price' => 150000,
    ]);

    $order = Order::factory()->paid()->create([
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'attendee_name' => 'Siti Rahma',
        'attendee_phone' => '089876543210',
        'quantity' => 1,
        'total_price' => 150000,
    ]);

    $service = new FonnteService;
    $success = $service->sendOrderPaidNotification($order);

    expect($success)->toBeTrue();

    Http::assertSent(function ($request) use ($order) {
        $message = $request['message'];

        return $request['target'] === '6289876543210'
            && str_contains($message, 'Siti Rahma')
            && str_contains($message, $order->number)
            && str_contains($message, 'Workshop Desain')
            && str_contains($message, 'LUNAS')
            && str_contains($message, route('orders.show', $order))
            && str_contains($message, route('orders.receipt', $order));
    });
});

test('marking order as paid automatically triggers fonnte paid notification', function () {
    Http::fake([
        'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
    ]);

    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $ticket = EventTicket::factory()->create([
        'event_id' => $event->id,
        'price' => 100000,
        'sold' => 0,
    ]);

    $order = Order::factory()->create([
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'attendee_phone' => '085712345678',
        'payment_status' => 'pending',
    ]);

    $order->markAsPaid();

    expect($order->fresh()->payment_status)->toBe('paid');

    Http::assertSent(function ($request) {
        return $request['target'] === '6285712345678'
            && str_contains($request['message'], 'LUNAS');
    });
});

