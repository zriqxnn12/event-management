<?php

namespace App\Http\Controllers;

use Akira\QrCode\Facades\QrCode;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Services\Midtrans\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Create a new order and redirect to the payment page.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'integer', Rule::exists('events', 'id')],
            'ticket_id' => ['required', 'integer', Rule::exists('event_tickets', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        /** @var EventTicket $ticket */
        $ticket = EventTicket::findOrFail($validated['ticket_id']);

        /** @var Event $event */
        $event = Event::findOrFail($validated['event_id']);

        // Guard: ticket must belong to the event
        abort_if($ticket->event_id !== $event->id, 422, 'Tiket tidak valid untuk event ini.');

        // Guard: ticket must be active and not sold out
        abort_if(! $ticket->is_active, 422, 'Tiket tidak lagi tersedia.');
        if ($ticket->quota !== null) {
            abort_if(($ticket->quota - $ticket->sold) < $validated['quantity'], 422, 'Kuota tiket tidak mencukupi.');
        }

        $totalPrice = (float) $ticket->price * $validated['quantity'];

        $order = Order::create([
            'number' => Order::generateNumber(),
            'user_id' => Auth::id(),
            'event_id' => $event->id,
            'event_ticket_id' => $ticket->id,
            'attendee_name' => $validated['name'],
            'attendee_email' => $validated['email'],
            'attendee_phone' => $validated['phone'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'quantity' => $validated['quantity'],
            'total_price' => $totalPrice,
            'payment_status' => 'pending',
        ]);

        // For free tickets, mark as paid immediately
        if ($totalPrice <= 0) {
            $order->update(['payment_status' => 'paid']);

            return redirect()->route('orders.show', $order);
        }

        $midtrans = new MidtransService;
        try {
            $midtrans->getSnapToken($order);
        } catch (\Throwable $e) {
            Log::warning('Midtrans Snap token generation failed: '.$e->getMessage());
        }

        return redirect()->route('orders.show', $order);
    }

    /**
     * Show the payment page for an existing order.
     */
    public function show(Order $order): Response
    {
        $snapToken = null;

        if ($order->payment_status === 'pending' && $order->total_price > 0) {
            $midtrans = new MidtransService;
            try {
                $snapToken = $midtrans->getSnapToken($order);
            } catch (\Throwable $e) {
                Log::warning('Midtrans Snap token generation failed: '.$e->getMessage());
            }
        }

        return $this->renderPaymentPage($order, $snapToken);
    }

    /**
     * Handle Midtrans webhook notification.
     */
    public function notification(Request $request): JsonResponse
    {
        $serverKey = config('midtrans.server_key');
        $hashed = hash(
            'sha512',
            $request->order_id.$request->status_code.$request->gross_amount.$serverKey
        );

        if ($hashed !== $request->signature_key) {
            return response()->json(['status' => 'invalid signature'], 403);
        }

        $order = Order::where('number', $request->order_id)->first();

        if ($order) {
            $transactionStatus = $request->transaction_status;

            if (in_array($transactionStatus, ['capture', 'settlement'], true)) {
                $order->update(['payment_status' => 'paid']);
            } elseif (in_array($transactionStatus, ['cancel', 'expire'], true)) {
                $order->update(['payment_status' => $transactionStatus === 'expire' ? 'expired' : 'cancelled']);
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Render the Inertia payment page with the order data.
     */
    private function renderPaymentPage(Order $order, ?string $snapToken): Response
    {
        $order->load(['event.user', 'ticket']);

        $qrCode = null;
        if ($order->payment_status === 'paid') {
            try {
                $verificationUrl = route('orders.show', $order);
                $paidAt = $order->updated_at?->translatedFormat('d M Y, H:i') ?? now()->translatedFormat('d M Y, H:i');
                $priceDisplay = $order->total_price <= 0 ? 'GRATIS' : 'Rp '.number_format((float) $order->total_price, 0, ',', '.');

                $payload = implode("\n", [
                    '=== BUKTI PEMBAYARAN RESMI ===',
                    "No. Pesanan : {$order->number}",
                    'Status      : LUNAS / TERKONFIRMASI',
                    "Acara       : {$order->event->title}",
                    "Tiket       : {$order->ticket->name} ({$order->quantity}x)",
                    "Total       : {$priceDisplay}",
                    "Peserta     : {$order->attendee_name}",
                    "Email       : {$order->attendee_email}",
                    "Waktu       : {$paidAt} WIB",
                    "Verifikasi  : {$verificationUrl}",
                ]);

                $svg = (string) QrCode::size(240)->margin(1)->generate($payload);
                $qrCode = 'data:image/svg+xml;base64,'.base64_encode($svg);
            } catch (\Throwable $e) {
                Log::warning('QR Code generation failed: '.$e->getMessage());
            }
        }

        return Inertia::render('payment', [
            'order' => [
                'id' => $order->id,
                'number' => $order->number,
                'attendee_name' => $order->attendee_name,
                'attendee_email' => $order->attendee_email,
                'total_price' => (float) $order->total_price,
                'formatted_price' => 'Rp '.number_format((float) $order->total_price, 0, ',', '.'),
                'quantity' => $order->quantity,
                'payment_status' => $order->payment_status,
            ],
            'event' => [
                'id' => $order->event->id,
                'title' => $order->event->title,
                'slug' => $order->event->slug,
            ],
            'ticket' => [
                'id' => $order->ticket->id,
                'name' => $order->ticket->name,
            ],
            'vendor' => [
                'username' => $order->event->user->username ?? '',
            ],
            'snapToken' => $snapToken,
            'qrCode' => $qrCode,
            'midtransClientKey' => config('midtrans.client_key'),
            'midtransIsProduction' => config('midtrans.is_production'),
        ]);
    }
}
