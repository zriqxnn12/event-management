<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    /**
     * Display the public vendor profile page.
     */
    public function show(User $user): Response
    {
        $statusFilter = ['published', 'completed'];

        $events = $user->events()
            ->with(['tickets'])
            ->whereIn('status', $statusFilter)
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (Event $event) => $this->formatEventCard($event));

        $totalEventsCount = $events->count();
        $totalAttendeesCount = (int) $events->sum('attendees');

        return Inertia::render('vendor-profile', [
            'vendor' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'about' => $user->about,
                'role' => $user->role,
                'memberSince' => $user->created_at?->format('F Y') ?? 'Baru Bergabung',
                'socialMedia' => $user->social_media ?? [],
            ],
            'events' => $events,
            'stats' => [
                'totalEvents' => $totalEventsCount,
                'totalAttendees' => $totalAttendeesCount,
            ],
        ]);
    }

    /**
     * Display the public event detail page for a vendor.
     */
    public function showEvent(User $user, Event $event): Response
    {
        // Ensure event belongs to this user
        if ($event->user_id !== $user->id) {
            abort(404);
        }

        $isOwner = Auth::check() && Auth::id() === $user->id;

        // If draft and not the owner, 404
        if ($event->status === 'draft' && ! $isOwner) {
            abort(404);
        }

        $event->load([
            'tickets' => fn ($query) => $query->orderBy('order'),
            'agendas' => fn ($query) => $query->orderBy('date')->orderBy('start_time')->orderBy('order'),
            'speakers' => fn ($query) => $query->orderBy('order'),
            'sponsors' => fn ($query) => $query->orderBy('order'),
        ]);

        $startDate = $event->start_date ? Carbon::parse($event->start_date) : null;
        $endDate = $event->end_date ? Carbon::parse($event->end_date) : null;

        $formattedDate = '';
        $formattedTime = '';
        if ($startDate && $endDate) {
            if ($startDate->isSameDay($endDate)) {
                $formattedDate = $startDate->translatedFormat('l, d F Y');
                $formattedTime = $startDate->format('H:i').' - '.$endDate->format('H:i').' WIB';
            } else {
                $formattedDate = $startDate->translatedFormat('d M Y').' - '.$endDate->translatedFormat('d M Y');
                $formattedTime = $startDate->format('H:i').' WIB - '.$endDate->format('H:i').' WIB';
            }
        } elseif ($startDate) {
            $formattedDate = $startDate->translatedFormat('l, d F Y');
            $formattedTime = $startDate->format('H:i').' WIB';
        }

        $now = Carbon::now();
        $isUpcoming = $event->status === 'published' && ($endDate ? $endDate->isFuture() : ($startDate ? $startDate->isFuture() : true));

        $regStart = $event->registration_start ? Carbon::parse($event->registration_start) : null;
        $regEnd = $event->registration_end ? Carbon::parse($event->registration_end) : null;

        $isRegistrationOpen = $event->status === 'published'
            && ($regStart ? $now->greaterThanOrEqualTo($regStart) : true)
            && ($regEnd ? $now->lessThanOrEqualTo($regEnd) : ($endDate ? $now->lessThanOrEqualTo($endDate) : true));

        $tickets = $event->tickets->map(function ($ticket) use ($now) {
            $price = (float) $ticket->price;
            $isFree = $ticket->type === 'free' || $price <= 0;
            $formattedPrice = $isFree ? 'Gratis' : 'Rp '.number_format($price, 0, ',', '.');

            $saleStart = $ticket->sale_start ? Carbon::parse($ticket->sale_start) : null;
            $saleEnd = $ticket->sale_end ? Carbon::parse($ticket->sale_end) : null;

            $isOnSale = $ticket->is_active
                && ($saleStart ? $now->greaterThanOrEqualTo($saleStart) : true)
                && ($saleEnd ? $now->lessThanOrEqualTo($saleEnd) : true);

            $remainingQuota = $ticket->quota !== null ? max(0, $ticket->quota - $ticket->sold) : null;
            $isSoldOut = $ticket->quota !== null && $remainingQuota <= 0;

            return [
                'id' => $ticket->id,
                'name' => $ticket->name,
                'description' => $ticket->description,
                'type' => $ticket->type,
                'price' => $price,
                'formatted_price' => $formattedPrice,
                'quota' => $ticket->quota,
                'sold' => $ticket->sold,
                'remaining_quota' => $remainingQuota,
                'perks' => $ticket->perks ?? [],
                'is_active' => $ticket->is_active,
                'is_on_sale' => $isOnSale,
                'is_sold_out' => $isSoldOut,
                'sale_start' => $ticket->sale_start?->toISOString(),
                'sale_end' => $ticket->sale_end?->toISOString(),
            ];
        });

        // Price display calculation for banner
        $activePrices = $tickets->where('is_active', true)->pluck('price');
        $minPriceDisplay = 'Gratis';
        if ($activePrices->isNotEmpty() && (float) $activePrices->max() > 0) {
            $minP = (float) $activePrices->min();
            $minPriceDisplay = $minP === 0.0 ? 'Gratis' : 'Mulai Rp '.number_format($minP, 0, ',', '.');
        }

        $speakers = $event->speakers->map(fn ($speaker) => [
            'id' => $speaker->id,
            'name' => $speaker->name,
            'title' => $speaker->title,
            'company' => $speaker->company,
            'bio' => $speaker->bio,
            'avatar' => $speaker->avatar,
            'linkedin_url' => $speaker->linkedin_url,
            'twitter_url' => $speaker->twitter_url,
        ]);

        $agendas = $event->agendas->map(fn ($agenda) => [
            'id' => $agenda->id,
            'title' => $agenda->title,
            'description' => $agenda->description,
            'start_time' => $agenda->start_time ? Carbon::parse($agenda->start_time)->format('H:i') : '',
            'end_time' => $agenda->end_time ? Carbon::parse($agenda->end_time)->format('H:i') : null,
            'speaker_name' => $agenda->speaker_name,
            'date' => $agenda->date ? Carbon::parse($agenda->date)->translatedFormat('d M Y') : null,
        ]);

        $sponsors = $event->sponsors->map(fn ($sponsor) => [
            'id' => $sponsor->id,
            'name' => $sponsor->name,
            'tier' => $sponsor->tier,
            'website_url' => $sponsor->website_url,
            'logo' => $sponsor->logo,
        ]);

        // Other events by same vendor (up to 3)
        $otherEvents = $user->events()
            ->with(['tickets'])
            ->where('id', '!=', $event->id)
            ->where('status', 'published')
            ->orderByDesc('start_date')
            ->take(3)
            ->get()
            ->map(fn (Event $other) => $this->formatEventCard($other));

        return Inertia::render('event-detail', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'description' => $event->description,
                'category' => $event->category,
                'type' => $event->type,
                'status' => $event->status,
                'isUpcoming' => $isUpcoming,
                'isRegistrationOpen' => $isRegistrationOpen,
                'date' => $formattedDate,
                'time' => $formattedTime,
                'start_date' => $event->start_date?->toISOString(),
                'end_date' => $event->end_date?->toISOString(),
                'registration_start' => $event->registration_start?->toISOString(),
                'registration_end' => $event->registration_end?->toISOString(),
                'location_name' => $event->location_name,
                'location_address' => $event->location_address,
                'location_maps_url' => $event->location_maps_url,
                'online_platform' => $event->online_platform,
                'online_url' => ! $event->online_url_protected || $isOwner ? $event->online_url : null,
                'online_url_protected' => (bool) $event->online_url_protected,
                'max_attendees' => $event->max_attendees,
                'cover_image' => $event->cover_image,
                'tags' => $event->tags ?? [],
                'price_display' => $minPriceDisplay,
                'tickets' => $tickets,
                'agendas' => $agendas,
                'speakers' => $speakers,
                'sponsors' => $sponsors,
            ],
            'vendor' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'about' => $user->about,
                'role' => $user->role,
                'memberSince' => $user->created_at?->format('F Y') ?? 'Baru Bergabung',
                'socialMedia' => $user->social_media ?? [],
                'totalEvents' => $user->events()->where('status', 'published')->count(),
            ],
            'otherEvents' => $otherEvents,
            'isPreview' => $isOwner && $event->status === 'draft',
        ]);
    }

    /**
     * Format an event model into a card array representation.
     */
    private function formatEventCard(Event $event): array
    {
        $tickets = $event->tickets;
        $prices = $tickets->pluck('price')->filter(fn ($p) => is_numeric($p) && (float) $p >= 0);

        $priceDisplay = 'Gratis';
        if ($tickets->isNotEmpty() && $prices->isNotEmpty() && (float) $prices->max() > 0) {
            $min = (float) $prices->min();
            $max = (float) $prices->max();
            if ($min === 0.0 && $max > 0.0) {
                $priceDisplay = 'Gratis - Rp '.number_format($max, 0, ',', '.');
            } elseif ($min === $max) {
                $priceDisplay = 'Rp '.number_format($min, 0, ',', '.');
            } else {
                $priceDisplay = 'Mulai Rp '.number_format($min, 0, ',', '.');
            }
        }

        $isUpcoming = $event->status === 'published' && ($event->end_date ? Carbon::parse($event->end_date)->isFuture() : true);

        $formattedDate = '';
        if ($event->start_date && $event->end_date) {
            $start = Carbon::parse($event->start_date);
            $end = Carbon::parse($event->end_date);
            if ($start->isSameDay($end)) {
                $formattedDate = $start->translatedFormat('d M Y');
            } else {
                $formattedDate = $start->translatedFormat('d M').' - '.$end->translatedFormat('d M Y');
            }
        } elseif ($event->start_date) {
            $formattedDate = Carbon::parse($event->start_date)->translatedFormat('d M Y');
        }

        return [
            'id' => $event->id,
            'title' => $event->title,
            'slug' => $event->slug,
            'description' => $event->description,
            'category' => $event->category,
            'type' => $event->type,
            'status' => $event->status,
            'isUpcoming' => $isUpcoming,
            'date' => $formattedDate,
            'start_date' => $event->start_date?->toISOString(),
            'end_date' => $event->end_date?->toISOString(),
            'location' => $event->type === 'online'
                ? ($event->online_platform ? ucfirst($event->online_platform) : 'Online')
                : ($event->location_name ?: ($event->location_address ?: 'Offline')),
            'attendees' => (int) ($event->max_attendees ?: 0),
            'price' => $priceDisplay,
            'cover_image' => $event->cover_image,
        ];
    }
}
