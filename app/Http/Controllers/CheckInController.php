<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
{
    /**
     * Display the check-in management page.
     *
     * - Admin: can access check-in for any event.
     * - Vendor: can only access check-in for their own events.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $isAdmin = $user->role === 'admin';

        $selectedEventId = $request->query('event_id');

        // Build the event list
        $eventsQuery = Event::withCount([
            'orders as total_orders_count' => fn ($q) => $q->where('payment_status', 'paid'),
            'orders as checked_in_count' => fn ($q) => $q->where('payment_status', 'paid')->whereNotNull('checked_in_at'),
        ])->orderByDesc('start_date');

        if (! $isAdmin) {
            $eventsQuery->where('user_id', $user->id);
        }

        $events = $eventsQuery->get(['id', 'title', 'start_date', 'end_date', 'cover_image', 'status', 'user_id'])
            ->map(fn ($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'start_date' => $e->start_date?->format('d M Y'),
                'end_date' => $e->end_date?->format('d M Y'),
                'cover_image' => $e->cover_image,
                'status' => $e->status,
                'total_orders' => (int) $e->total_orders_count,
                'checked_in' => (int) $e->checked_in_count,
            ]);

        // If an event is selected, load its attendees
        $attendees = collect();
        $selectedEvent = null;

        if ($selectedEventId) {
            $eventQuery = Event::query();

            if (! $isAdmin) {
                $eventQuery->where('user_id', $user->id);
            }

            $selectedEvent = $eventQuery->find((int) $selectedEventId);

            if ($selectedEvent) {
                $search = $request->query('search');
                $checkedInFilter = $request->query('checked_in', 'all');

                $attendees = Order::with(['ticket:id,name'])
                    ->where('event_id', $selectedEvent->id)
                    ->where('payment_status', 'paid')
                    ->when($search, fn ($q) => $q->where(fn ($sq) => $sq
                        ->where('number', 'like', "%{$search}%")
                        ->orWhere('attendee_name', 'like', "%{$search}%")
                        ->orWhere('attendee_email', 'like', "%{$search}%")
                        ->orWhere('attendee_phone', 'like', "%{$search}%")
                    ))
                    ->when($checkedInFilter === 'checked_in', fn ($q) => $q->whereNotNull('checked_in_at'))
                    ->when($checkedInFilter === 'not_checked_in', fn ($q) => $q->whereNull('checked_in_at'))
                    ->orderByRaw('checked_in_at IS NULL DESC, checked_in_at DESC')
                    ->paginate(20)
                    ->withQueryString();

                $attendees->getCollection()->transform(fn ($order) => [
                    'id' => $order->id,
                    'number' => $order->number,
                    'attendee_name' => $order->attendee_name,
                    'attendee_email' => $order->attendee_email,
                    'attendee_phone' => $order->attendee_phone,
                    'quantity' => (int) $order->quantity,
                    'checked_in_at' => $order->checked_in_at?->format('d M Y, H:i'),
                    'checked_in_count' => (int) $order->checked_in_count,
                    'is_checked_in' => ! is_null($order->checked_in_at),
                    'ticket' => $order->ticket ? ['id' => $order->ticket->id, 'name' => $order->ticket->name] : null,
                    'total_price' => (float) $order->total_price,
                    'formatted_price' => 'Rp '.number_format((float) $order->total_price, 0, ',', '.'),
                ]);
            }
        }

        return Inertia::render('check-in/index', [
            'events' => $events,
            'selectedEvent' => $selectedEvent ? [
                'id' => $selectedEvent->id,
                'title' => $selectedEvent->title,
                'start_date' => $selectedEvent->start_date?->format('d M Y'),
                'end_date' => $selectedEvent->end_date?->format('d M Y'),
                'status' => $selectedEvent->status,
            ] : null,
            'attendees' => $attendees instanceof LengthAwarePaginator ? $attendees : null,
            'filters' => [
                'event_id' => $selectedEventId ? (int) $selectedEventId : null,
                'search' => $request->query('search'),
                'checked_in' => $request->query('checked_in', 'all'),
            ],
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Scan / toggle check-in for a specific order.
     * Accepts either a numeric order ID or the order number string.
     */
    public function checkIn(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $isAdmin = $user->role === 'admin';

        $validated = $request->validate([
            'order_number' => ['required', 'string'],
            'allow_undo' => ['sometimes', 'boolean'],
        ]);

        $order = Order::with(['event:id,title,user_id', 'ticket:id,name'])
            ->where('number', $validated['order_number'])
            ->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan. Periksa kembali nomor order atau QR code.',
            ], 404);
        }

        // Authorization: vendor can only check in attendees for their own events
        if (! $isAdmin && $order->event?->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk melakukan check-in pada event ini.',
            ], 403);
        }

        if ($order->payment_status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan belum lunas. Check-in hanya tersedia untuk pesanan yang telah dibayar.',
                'payment_status' => $order->payment_status,
            ], 422);
        }

        // If already checked in → only undo when explicitly requested; otherwise report already checked in
        if ($order->checked_in_at) {
            if ($request->boolean('allow_undo')) {
                $order->update(['checked_in_at' => null, 'checked_in_count' => 0]);

                return response()->json([
                    'success' => true,
                    'action' => 'undo',
                    'message' => "Check-in untuk {$order->attendee_name} telah dibatalkan.",
                    'order' => $this->formatOrderForResponse($order),
                ]);
            }

            return response()->json([
                'success' => true,
                'action' => 'already_checked_in',
                'message' => "Sudah check-in sebelumnya pada {$order->checked_in_at->format('d M Y, H:i')}.",
                'order' => $this->formatOrderForResponse($order),
            ]);
        }

        // Perform check-in
        $order->update([
            'checked_in_at' => now(),
            'checked_in_count' => $order->quantity,
        ]);

        return response()->json([
            'success' => true,
            'action' => 'check_in',
            'message' => "Check-in berhasil untuk {$order->attendee_name}! ({$order->quantity} tiket)",
            'order' => $this->formatOrderForResponse($order->fresh()),
        ]);
    }

    /**
     * Look up an order by number and return a JSON preview (for the scan step).
     */
    public function lookup(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $isAdmin = $user->role === 'admin';

        $orderNumber = $request->query('order_number');

        if (! $orderNumber) {
            return response()->json(['success' => false, 'message' => 'Nomor order diperlukan.'], 422);
        }

        $order = Order::with(['event:id,title,user_id', 'ticket:id,name'])
            ->where('number', $orderNumber)
            ->first();

        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Order tidak ditemukan.'], 404);
        }

        if (! $isAdmin && $order->event?->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk event ini.'], 403);
        }

        return response()->json([
            'success' => true,
            'order' => $this->formatOrderForResponse($order),
        ]);
    }

    /**
     * Format an order model for JSON responses.
     *
     * @return array<string, mixed>
     */
    private function formatOrderForResponse(Order $order): array
    {
        return [
            'id' => $order->id,
            'number' => $order->number,
            'attendee_name' => $order->attendee_name,
            'attendee_email' => $order->attendee_email,
            'attendee_phone' => $order->attendee_phone,
            'quantity' => (int) $order->quantity,
            'ticket' => $order->ticket ? ['id' => $order->ticket->id, 'name' => $order->ticket->name] : null,
            'event' => $order->event ? ['id' => $order->event->id, 'title' => $order->event->title] : null,
            'total_price' => (float) $order->total_price,
            'formatted_price' => 'Rp '.number_format((float) $order->total_price, 0, ',', '.'),
            'payment_status' => $order->payment_status,
            'is_checked_in' => ! is_null($order->checked_in_at),
            'checked_in_at' => $order->checked_in_at?->format('d M Y, H:i'),
            'checked_in_count' => (int) $order->checked_in_count,
        ];
    }
}
