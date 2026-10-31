<?php

namespace App\Services\Midtrans;

use App\Models\Order;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Get or create a Snap token for the given order.
     */
    public function getSnapToken(Order $order): string
    {
        if (! empty($order->snap_token)) {
            return $order->snap_token;
        }

        $params = [
            'transaction_details' => [
                'order_id' => $order->number,
                'gross_amount' => (int) $order->total_price,
            ],
            'customer_details' => [
                'first_name' => $order->attendee_name,
                'email' => $order->attendee_email,
                'phone' => $order->attendee_phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => $order->event_ticket_id,
                    'price' => (int) ($order->total_price / $order->quantity),
                    'quantity' => $order->quantity,
                    'name' => $order->ticket->name ?? 'Tiket Event',
                ],
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        $order->snap_token = $snapToken;
        $order->save();

        return $snapToken;
    }
}
