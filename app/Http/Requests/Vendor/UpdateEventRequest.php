<?php

namespace App\Http\Requests\Vendor;

class UpdateEventRequest extends StoreEventRequest
{
    // All rules are shared with StoreEventRequest.
    // Override authorize to include the event ownership check.
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $this->user()?->role === 'vendor'
            && $event
            && (int) $event->user_id === $this->user()->id;
    }
}
