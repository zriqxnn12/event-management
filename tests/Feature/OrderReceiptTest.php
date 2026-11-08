<?php

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\User;

test('paid order can download pdf receipt', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $ticket = EventTicket::factory()->create([
        'event_id' => $event->id,
        'price' => 150000,
    ]);

    $order = Order::factory()->paid()->create([
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'quantity' => 1,
        'total_price' => 150000,
    ]);

    $response = $this->get(route('orders.receipt', $order));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
    expect($response->headers->get('content-disposition'))->toContain("bukti-pembayaran-{$order->number}.pdf");

    $content = $response->getContent();
    expect(strlen($content))->toBeGreaterThan(100);
});

test('pending order cannot download receipt', function () {
    $vendor = User::factory()->create(['role' => 'vendor']);
    $event = Event::factory()->create(['user_id' => $vendor->id]);
    $ticket = EventTicket::factory()->create([
        'event_id' => $event->id,
    ]);

    $order = Order::factory()->create([
        'event_id' => $event->id,
        'event_ticket_id' => $ticket->id,
        'payment_status' => 'pending',
        'total_price' => 100000,
    ]);

    $response = $this->get(route('orders.receipt', $order));

    $response->assertStatus(403);
});
