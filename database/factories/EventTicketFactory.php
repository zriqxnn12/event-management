<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventTicket>
 */
class EventTicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => 'Regular Pass',
            'type' => 'paid',
            'price' => 100000,
            'quota' => 100,
            'sold' => 0,
            'is_active' => true,
        ];
    }
}
