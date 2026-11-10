<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const PLATFORM_FEE_RATE = 0.03;

    /**
     * Display the dashboard with analytics and activities.
     *
     * - Admin: sees platform-wide metrics (all events, all orders, platform fee, total vendors).
     * - Vendor: sees metrics scoped strictly to their own events and orders.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $isAdmin = $user->role === 'admin';

        $eventsQuery = Event::query()->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id));
        $eventIds = (clone $eventsQuery)->pluck('id');

        // Total KPIs
        $totalEvents = (clone $eventsQuery)->count();
        $publishedEvents = (clone $eventsQuery)->where('status', 'published')->count();
        $draftEvents = (clone $eventsQuery)->where('status', 'draft')->count();
        $completedEvents = (clone $eventsQuery)->where('status', 'completed')->count();

        $ordersScope = Order::query()->when(! $isAdmin, fn ($q) => $q->whereIn('event_id', $eventIds));
        $paidOrdersQuery = (clone $ordersScope)->where('payment_status', 'paid');

        $totalRevenue = (float) (clone $paidOrdersQuery)->sum('total_price');
        $totalTicketsSold = (int) (clone $paidOrdersQuery)->sum('quantity');
        $totalAttendees = (int) (clone $paidOrdersQuery)->distinct('attendee_email')->count('attendee_email');

        // Platform fee for admin (3%) & total registered vendors
        $platformFee = $isAdmin ? (float) bcmul((string) $totalRevenue, (string) self::PLATFORM_FEE_RATE, 2) : null;
        $totalVendors = $isAdmin ? User::where('role', 'vendor')->count() : null;

        // Total Quota across tickets
        $totalQuota = (int) EventTicket::when(! $isAdmin, fn ($q) => $q->whereIn('event_id', $eventIds))->sum('quota');

        // Sales trend for the last 14 days
        $daysCount = 14;
        $startDate = Carbon::today()->subDays($daysCount - 1);

        $dailyStats = (clone $ordersScope)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', $startDate->startOfDay())
            ->selectRaw('DATE(created_at) as order_date, SUM(total_price) as revenue, SUM(quantity) as tickets, COUNT(*) as orders_count')
            ->groupBy('order_date')
            ->get()
            ->keyBy('order_date');

        $salesTrend = [];
        for ($i = 0; $i < $daysCount; $i++) {
            $date = Carbon::today()->subDays($daysCount - 1 - $i);
            $dateString = $date->toDateString();
            $stat = $dailyStats->get($dateString);

            $salesTrend[] = [
                'date' => $dateString,
                'label' => $date->translatedFormat('d M'),
                'day' => $date->translatedFormat('D'),
                'revenue' => $stat ? (float) $stat->revenue : 0.0,
                'tickets' => $stat ? (int) $stat->tickets : 0,
                'orders_count' => $stat ? (int) $stat->orders_count : 0,
            ];
        }

        // Category breakdown
        $categories = (clone $eventsQuery)
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'name' => (string) ($item->category ?: 'Lainnya'),
                'count' => (int) $item->count,
            ]);

        // Event type breakdown
        $types = (clone $eventsQuery)
            ->selectRaw('type, count(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Recent orders / activity (last 7)
        $feeRate = self::PLATFORM_FEE_RATE;
        $recentOrders = (clone $ordersScope)
            ->with(['event:id,title,slug,user_id', 'event.user:id,name,username', 'ticket:id,name'])
            ->latest()
            ->limit(7)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'number' => $order->number,
                'attendee_name' => $order->attendee_name,
                'attendee_email' => $order->attendee_email,
                'event_title' => $order->event?->title ?? '-',
                'event_slug' => $order->event?->slug ?? '',
                'vendor_name' => $order->event?->user?->name ?? null,
                'ticket_name' => $order->ticket?->name ?? 'Tiket Masuk',
                'quantity' => (int) $order->quantity,
                'total_price' => (float) $order->total_price,
                'platform_fee' => $isAdmin ? (float) bcmul((string) $order->total_price, (string) $feeRate, 2) : null,
                'payment_status' => $order->payment_status,
                'created_at_human' => $order->created_at?->diffForHumans() ?? '',
                'created_at' => $order->created_at?->format('d M Y, H:i') ?? '',
            ]);

        // Upcoming / top active events (last 5)
        $upcomingEvents = (clone $eventsQuery)
            ->with(['user:id,name,username'])
            ->withCount('tickets')
            ->withSum('tickets as tickets_quota', 'quota')
            ->withSum('tickets as tickets_sold', 'sold')
            ->orderByRaw("CASE WHEN status = 'published' THEN 0 ELSE 1 END")
            ->orderBy('start_date', 'asc')
            ->limit(5)
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'category' => $event->category,
                'type' => $event->type,
                'status' => $event->status,
                'vendor_name' => $event->user?->name ?? null,
                'start_date' => $event->start_date?->format('d M Y, H:i'),
                'cover_image' => $event->cover_image,
                'tickets_sold' => (int) ($event->tickets_sold ?? 0),
                'tickets_quota' => (int) ($event->tickets_quota ?? 0),
            ]);

        return Inertia::render('dashboard', [
            'isAdmin' => $isAdmin,
            'feeRate' => self::PLATFORM_FEE_RATE,
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_tickets_sold' => $totalTicketsSold,
                'total_events' => $totalEvents,
                'published_events' => $publishedEvents,
                'draft_events' => $draftEvents,
                'completed_events' => $completedEvents,
                'total_attendees' => $totalAttendees,
                'total_quota' => $totalQuota,
                'platform_fee' => $platformFee,
                'total_vendors' => $totalVendors,
            ],
            'sales_trend' => $salesTrend,
            'categories' => $categories,
            'types' => [
                'online' => (int) ($types['online'] ?? 0),
                'offline' => (int) ($types['offline'] ?? 0),
                'hybrid' => (int) ($types['hybrid'] ?? 0),
            ],
            'recent_orders' => $recentOrders,
            'upcoming_events' => $upcomingEvents,
        ]);
    }
}
