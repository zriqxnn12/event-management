<?php

namespace App\Services\Midtrans;

use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;

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
            'callbacks' => [
                'finish' => route('orders.show', $order),
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        $order->snap_token = $snapToken;
        $order->save();

        return $snapToken;
    }

    /**
     * Sync transaction status directly with Midtrans API.
     */
    public function syncStatus(Order $order): Order
    {
        if ($order->payment_status === 'paid' || $order->total_price <= 0) {
            return $order;
        }

        try {
            $status = Transaction::status($order->number);
            $transactionStatus = is_object($status) ? ($status->transaction_status ?? null) : ($status['transaction_status'] ?? null);

            if (in_array($transactionStatus, ['capture', 'settlement'], true)) {
                $order->markAsPaid();
            } elseif (in_array($transactionStatus, ['cancel', 'expire'], true)) {
                $order->update([
                    'payment_status' => $transactionStatus === 'expire' ? 'expired' : 'cancelled',
                ]);
            }
        } catch (\Throwable $e) {
            Log::info("Midtrans status check for order {$order->number}: ".$e->getMessage());
        }

        return $order->fresh();
    }
}
