<?php

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
