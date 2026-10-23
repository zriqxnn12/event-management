<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::random(5),
            'description' => fake()->paragraph(),
            'category' => fake()->randomElement(['Teknologi', 'Musik', 'Bisnis', 'Desain', 'Kesehatan']),
            'type' => 'offline',
            'status' => 'published',
            'location_name' => fake()->company().' Hall',
            'location_address' => fake()->address(),
            'start_date' => now()->addDays(5),
            'end_date' => now()->addDays(6),
            'registration_start' => now()->subDay(),
            'registration_end' => now()->addDays(4),
            'max_attendees' => 200,
            'cover_image' => null,
            'tags' => ['seminar', 'workshop'],
        ];
    }
}
