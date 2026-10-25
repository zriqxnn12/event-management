<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreEventRequest;
use App\Http\Requests\Vendor\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    /**
     * Display a listing of the vendor's events.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');

        $events = Event::where('user_id', Auth::id())
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->withCount(['tickets', 'coupons'])
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('vendor/events/index', [
            'events' => $events,
            'filters' => ['status' => $status],
        ]);
    }

    /**
     * Show the form for creating a new event.
     */
    public function create(): Response
    {
        return Inertia::render('vendor/events/create');
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(StoreEventRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $event = DB::transaction(function () use ($request, $validated) {
            $slug = Event::generateUniqueSlug($validated['title']);

            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                $validated['cover_image'] = $request->file('cover_image')->store('events/covers', 'public');
            } else {
                $validated['cover_image'] = null;
            }

            $eventData = $this->extractEventFields($validated);
            $eventData['status'] = $validated['status'];

            $event = Event::create([
                'user_id' => Auth::id(),
                'slug' => $slug,
                ...$eventData,
            ]);

            $this->syncRelated($event, $validated);

            return $event;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Event \"{$event->title}\" berhasil dibuat!",
        ]);

        return redirect()->route('vendor.events.index')
            ->with('success', "Event \"{$event->title}\" berhasil dibuat!");
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event): Response
    {
        $this->authorizeEventOwner($event);

        $event->load(['tickets', 'coupons', 'agendas', 'speakers', 'sponsors']);

        return Inertia::render('vendor/events/show', [
            'event' => $event,
        ]);
    }

    /**
     * Show the form for editing the specified event.
     */
    public function edit(Event $event): Response
    {
        $this->authorizeEventOwner($event);

        $event->load(['tickets', 'coupons', 'agendas', 'speakers', 'sponsors']);

        return Inertia::render('vendor/events/edit', [
            'event' => $event,
        ]);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $event, $validated) {
            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                // Delete old cover if exists
                if ($event->cover_image) {
                    Storage::disk('public')->delete($event->cover_image);
                }
                $validated['cover_image'] = $request->file('cover_image')->store('events/covers', 'public');
            } else {
                // Keep existing cover
                unset($validated['cover_image']);
            }

            // Re-generate slug if title changed
            if ($validated['title'] !== $event->title) {
                $validated['slug'] = Event::generateUniqueSlug($validated['title'], $event->id);
            }

            $eventData = $this->extractEventFields($validated);
            $eventData['status'] = $validated['status'];
            $event->update($eventData);

            $this->syncRelated($event, $validated);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Event \"{$event->title}\" berhasil diperbarui!",
        ]);

        return redirect()->route('vendor.events.index')
            ->with('success', "Event \"{$event->title}\" berhasil diperbarui!");
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Event $event): RedirectResponse
    {
        $this->authorizeEventOwner($event);

        $title = $event->title;

        DB::transaction(function () use ($event) {
            // Delete cover image
            if ($event->cover_image) {
                Storage::disk('public')->delete($event->cover_image);
            }

            $event->delete();
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Event \"{$title}\" berhasil dihapus.",
        ]);

        return redirect()->route('vendor.events.index')
            ->with('success', "Event \"{$title}\" berhasil dihapus.");
    }

    /**
     * Extract only event-level fields from validated data.
     *
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function extractEventFields(array $validated): array
    {
        return array_filter(
            $validated,
            fn ($key) => ! in_array($key, ['tickets', 'coupons', 'agendas', 'speakers', 'sponsors']),
            ARRAY_FILTER_USE_KEY
        );
    }

    /**
     * Sync all related models (tickets, coupons, agendas, speakers, sponsors).
     *
     * @param  array<string, mixed>  $validated
     */
    private function syncRelated(Event $event, array $validated): void
    {
        // Sync tickets
        if (array_key_exists('tickets', $validated)) {
            $event->tickets()->delete();
            foreach ($validated['tickets'] ?? [] as $index => $ticketData) {
                $event->tickets()->create([
                    ...$ticketData,
                    'order' => $index,
                    'type' => $ticketData['type'] ?? 'free',
                    'price' => ($ticketData['type'] ?? 'free') === 'free' ? 0 : ($ticketData['price'] ?? 0),
                    'is_active' => $ticketData['is_active'] ?? true,
                ]);
            }
        }

        // Sync coupons
        if (array_key_exists('coupons', $validated)) {
            $event->coupons()->delete();
            foreach ($validated['coupons'] ?? [] as $couponData) {
                $event->coupons()->create([
                    ...$couponData,
                    'is_active' => $couponData['is_active'] ?? true,
                    'used_count' => 0,
                    'max_uses_per_user' => $couponData['max_uses_per_user'] ?? 1,
                ]);
            }
        }

        // Sync agendas
        if (array_key_exists('agendas', $validated)) {
            $event->agendas()->delete();
            foreach ($validated['agendas'] ?? [] as $index => $agendaData) {
                $event->agendas()->create([
                    ...$agendaData,
                    'order' => $index,
                ]);
            }
        }

        // Sync speakers
        if (array_key_exists('speakers', $validated)) {
            $event->speakers()->delete();
            foreach ($validated['speakers'] ?? [] as $index => $speakerData) {
                $event->speakers()->create([
                    ...$speakerData,
                    'order' => $index,
                ]);
            }
        }

        // Sync sponsors
        if (array_key_exists('sponsors', $validated)) {
            $event->sponsors()->delete();
            foreach ($validated['sponsors'] ?? [] as $index => $sponsorData) {
                $event->sponsors()->create([
                    ...$sponsorData,
                    'order' => $index,
                ]);
            }
        }
    }

    /**
     * Abort with 403 if the current user does not own the event.
     */
    private function authorizeEventOwner(Event $event): void
    {
        abort_unless((int) $event->user_id === Auth::id(), 403);
    }
}
