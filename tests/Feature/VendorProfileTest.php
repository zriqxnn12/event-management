<?php

use App\Models\Event;
use App\Models\User;

test('vendor profile page can be rendered by username with social media', function () {
    $user = User::factory()->create([
        'username' => 'testvendor123',
        'role' => 'vendor',
        'about' => 'Kami event organizer berpengalaman di Jakarta.',
        'social_media' => [
            [
                'id' => 'sm_1',
                'platform' => 'instagram',
                'url' => 'https://instagram.com/testvendor',
                'handle' => '@testvendor',
            ],
            [
                'id' => 'sm_2',
                'platform' => 'whatsapp',
                'url' => 'https://wa.me/6281234567890',
                'handle' => 'WhatsApp',
            ],
        ],
    ]);

    $response = $this->get('/'.$user->username);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('vendor-profile')
        ->has('vendor', fn ($page) => $page
            ->where('username', 'testvendor123')
            ->where('about', 'Kami event organizer berpengalaman di Jakarta.')
            ->where('socialMedia.0.platform', 'instagram')
            ->where('socialMedia.0.url', 'https://instagram.com/testvendor')
            ->where('socialMedia.1.platform', 'whatsapp')
            ->has('avatar')
            ->etc()
        )
    );
});

test('public event detail page can be rendered by vendor username and event slug', function () {
    $user = User::factory()->create([
        'username' => 'eventorganizer',
        'role' => 'vendor',
    ]);

    $event = Event::factory()->create([
        'user_id' => $user->id,
        'title' => 'Festival Musik Senja',
        'slug' => 'festival-musik-senja',
        'status' => 'published',
        'category' => 'Konser Musik',
        'type' => 'offline',
        'location_name' => 'Stadion Utama Gelora',
    ]);

    $response = $this->get('/'.$user->username.'/'.$event->slug);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('event-detail')
        ->has('event', fn ($page) => $page
            ->where('title', 'Festival Musik Senja')
            ->where('slug', 'festival-musik-senja')
            ->where('category', 'Konser Musik')
            ->where('type', 'offline')
            ->etc()
        )
        ->has('vendor', fn ($page) => $page
            ->where('username', 'eventorganizer')
            ->etc()
        )
    );
});

test('draft event returns 404 for guest visitors', function () {
    $user = User::factory()->create([
        'username' => 'draftorganizer',
    ]);

    $event = Event::factory()->create([
        'user_id' => $user->id,
        'slug' => 'draft-event-secret',
        'status' => 'draft',
    ]);

    $response = $this->get('/'.$user->username.'/'.$event->slug);

    $response->assertNotFound();
});

test('draft event can be previewed by owner with isPreview true', function () {
    $user = User::factory()->create([
        'username' => 'owneruser',
    ]);

    $event = Event::factory()->create([
        'user_id' => $user->id,
        'slug' => 'my-draft-event',
        'status' => 'draft',
    ]);

    $response = $this->actingAs($user)->get('/'.$user->username.'/'.$event->slug);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('event-detail')
        ->where('isPreview', true)
    );
});
