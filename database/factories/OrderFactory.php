<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventTicket;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'number' => Order::generateNumber(),
            'user_id' => User::factory(),
            'event_id' => Event::factory(),
            'event_ticket_id' => EventTicket::factory(),
            'attendee_name' => fake()->name(),
            'attendee_email' => fake()->safeEmail(),
            'attendee_phone' => fake()->phoneNumber(),
            'quantity' => 1,
            'total_price' => 100000,
            'payment_status' => 'pending',
        ];
    }

    public function paid(): self
    {
        return $this->state(fn () => [
            'payment_status' => 'paid',
        ]);
    }
}
