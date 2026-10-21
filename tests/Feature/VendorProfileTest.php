<?php

use App\Models\User;

test('vendor profile page can be rendered by username', function () {
    $user = User::factory()->create([
        'username' => 'testvendor123',
        'role' => 'vendor',
        'about' => 'Kami event organizer berpengalaman di Jakarta.',
    ]);

    $response = $this->get('/'.$user->username);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('vendor-profile')
        ->has('vendor', fn ($page) => $page
            ->where('username', 'testvendor123')
            ->where('about', 'Kami event organizer berpengalaman di Jakarta.')
            ->has('avatar')
            ->etc()
        )
    );
});
