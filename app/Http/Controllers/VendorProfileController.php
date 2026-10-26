<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Carbon;
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
            ->map(function (Event $event) {
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
            });

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
}
