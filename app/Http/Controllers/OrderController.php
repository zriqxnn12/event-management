<?php

namespace App\Http\Controllers;

use Akira\QrCode\Facades\QrCode;
use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\User;
use App\Services\Fonnte\FonnteService;
use App\Services\Midtrans\MidtransService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /** Platform fee rate applied to every paid order (3%). */
    private const PLATFORM_FEE_RATE = 0.03;

    /**
     * Display a paginated list of orders.
     *
     * - Admin: sees all orders with the 3% platform fee per transaction.
     * - Vendor: sees only orders belonging to their own events.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $isAdmin = $user->role === 'admin';

        $paymentStatus = $request->query('payment_status', 'all');
        $eventId = $request->query('event_id');
        $search = $request->query('search');

        $baseScope = Order::query()
            ->when(! $isAdmin, fn ($q) => $q->whereHas('event', fn ($eq) => $eq->where('user_id', $user->id)))
            ->when($eventId, fn ($q) => $q->where('event_id', (int) $eventId))
            ->when($search, fn ($q) => $q->where(fn ($sq) => $sq
                ->where('number', 'like', "%{$search}%")
                ->orWhere('attendee_name', 'like', "%{$search}%")
                ->orWhere('attendee_email', 'like', "%{$search}%")
            ));

        $totalOrders = (clone $baseScope)->count();
        $paidOrdersQuery = (clone $baseScope)->where('payment_status', 'paid');
        $totalPaidOrders = (clone $paidOrdersQuery)->count();
        $totalRevenue = (float) (clone $paidOrdersQuery)->sum('total_price');
        $totalFee = $isAdmin ? (float) bcmul((string) $totalRevenue, (string) self::PLATFORM_FEE_RATE, 2) : null;

        $query = (clone $baseScope)
            ->with(['event:id,title,slug,user_id', 'ticket:id,name', 'user:id,name,email'])
            ->when($paymentStatus !== 'all', fn ($q) => $q->where('payment_status', $paymentStatus))
            ->latest();

        $orders = $query->paginate(15)->withQueryString();

        $feeRate = self::PLATFORM_FEE_RATE;

        $orders->getCollection()->transform(fn ($order) => [
            'id' => $order->id,
            'number' => $order->number,
            'attendee_name' => $order->attendee_name,
            'attendee_email' => $order->attendee_email,
            'attendee_phone' => $order->attendee_phone,
            'quantity' => (int) $order->quantity,
            'total_price' => (float) $order->total_price,
            'formatted_price' => 'Rp '.number_format((float) $order->total_price, 0, ',', '.'),
            'platform_fee' => $isAdmin ? (float) bcmul((string) $order->total_price, (string) $feeRate, 2) : null,
            'formatted_fee' => $isAdmin ? 'Rp '.number_format((float) bcmul((string) $order->total_price, (string) $feeRate, 2), 0, ',', '.') : null,
            'payment_status' => $order->payment_status,
            'created_at' => $order->created_at?->format('d M Y, H:i') ?? '',
            'created_at_human' => $order->created_at?->diffForHumans() ?? '',
            'event' => $order->event ? [
                'id' => $order->event->id,
                'title' => $order->event->title,
                'slug' => $order->event->slug,
            ] : null,
            'ticket' => $order->ticket ? [
                'id' => $order->ticket->id,
                'name' => $order->ticket->name,
            ] : null,
        ]);

        // Build the event options list for the filter dropdown
        $eventOptions = $isAdmin
            ? Event::orderBy('title')->get(['id', 'title'])
            : Event::where('user_id', $user->id)->orderBy('title')->get(['id', 'title']);

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => [
                'payment_status' => $paymentStatus,
                'event_id' => $eventId ? (int) $eventId : null,
                'search' => $search,
            ],
            'eventOptions' => $eventOptions->map(fn ($e) => ['id' => $e->id, 'title' => $e->title]),
            'isAdmin' => $isAdmin,
            'feeRate' => self::PLATFORM_FEE_RATE,
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_paid_orders' => $totalPaidOrders,
                'total_fee' => $totalFee,
            ],
        ]);
    }

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
            $order->markAsPaid();

            return redirect()->route('orders.show', $order);
        }

        $midtrans = new MidtransService;
        try {
            $midtrans->getSnapToken($order);
        } catch (\Throwable $e) {
            Log::warning('Midtrans Snap token generation failed: '.$e->getMessage());
        }

        try {
            app(FonnteService::class)->sendOrderPendingNotification($order);
        } catch (\Throwable $e) {
            Log::error('Fonnte sendOrderPendingNotification error: '.$e->getMessage());
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

            // Sync with Midtrans API directly (ensures status updates even in localhost where webhooks cannot reach)
            $order = $midtrans->syncStatus($order);

            if ($order->payment_status === 'pending') {
                try {
                    $snapToken = $midtrans->getSnapToken($order);
                } catch (\Throwable $e) {
                    Log::warning('Midtrans Snap token generation failed: '.$e->getMessage());
                }
            }
        }

        return $this->renderPaymentPage($order, $snapToken);
    }

    /**
     * Handle redirection callback from Midtrans Dashboard.
     */
    public function finish(Request $request): RedirectResponse
    {
        $orderNumber = $request->query('order_id');

        if ($orderNumber) {
            $order = Order::where('number', $orderNumber)->first();

            if ($order) {
                if ($order->payment_status === 'pending') {
                    $midtrans = new MidtransService;
                    $midtrans->syncStatus($order);
                }

                return redirect()->route('orders.show', $order);
            }
        }

        return redirect()->route('home');
    }

    /**
     * Handle Midtrans webhook notification.
     */
    public function notification(Request $request): JsonResponse
    {
        Log::info('Midtrans webhook received:', $request->all());

        $serverKey = config('midtrans.server_key');
        $hashed = hash(
            'sha512',
            $request->order_id.$request->status_code.$request->gross_amount.$serverKey
        );

        if ($hashed !== $request->signature_key) {
            Log::warning('Midtrans webhook invalid signature for order '.$request->order_id);

            return response()->json(['status' => 'invalid signature'], 403);
        }

        $order = Order::where('number', $request->order_id)->first();

        if ($order) {
            $transactionStatus = $request->transaction_status;

            if (in_array($transactionStatus, ['capture', 'settlement'], true)) {
                $order->markAsPaid();
            } elseif (in_array($transactionStatus, ['cancel', 'expire'], true)) {
                $order->update(['payment_status' => $transactionStatus === 'expire' ? 'expired' : 'cancelled']);
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Download the official payment receipt / ticket PDF.
     */
    public function receipt(Request $request, Order $order): HttpResponse
    {
        if ($order->payment_status === 'pending' && $order->total_price > 0) {
            $midtrans = new MidtransService;
            $order = $midtrans->syncStatus($order);
        }

        abort_if($order->payment_status !== 'paid', 403, 'Bukti pembayaran hanya tersedia untuk pesanan yang telah lunas.');

        $order->load(['event.user', 'ticket']);
        $qrCode = $this->generateQrCode($order);

        $pdf = Pdf::loadView('pdf.receipt', [
            'order' => $order,
            'qrCode' => $qrCode,
        ]);

        $pdf->setPaper('a4', 'portrait');

        $fileName = "bukti-pembayaran-{$order->number}.pdf";

        if ($request->boolean('stream')) {
            return $pdf->stream($fileName);
        }

        return $pdf->download($fileName);
    }

    /**
     * Generate official QR code data URL for a paid order.
     */
    private function generateQrCode(Order $order): ?string
    {
        if ($order->payment_status !== 'paid') {
            return null;
        }

        try {
            $svg = (string) QrCode::size(240)->margin(1)->generate($order->number);

            return 'data:image/svg+xml;base64,'.base64_encode($svg);
        } catch (\Throwable $e) {
            Log::warning('QR Code generation failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Render the Inertia payment page with the order data.
     */
    private function renderPaymentPage(Order $order, ?string $snapToken): Response
    {
        $order->load(['event.user', 'ticket']);

        $qrCode = $this->generateQrCode($order);

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
