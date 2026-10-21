<?php

use App\Models\User;

test('guest cannot access social media settings', function () {
    $response = $this->get(route('social-media.edit'));

    $response->assertRedirect(route('login'));
});

test('social media settings page is displayed', function () {
    $user = User::factory()->create([
        'social_media' => [
            [
                'id' => 'sm_1',
                'platform' => 'instagram',
                'url' => 'https://instagram.com/myvendor',
                'handle' => '@myvendor',
            ],
        ],
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('social-media.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/social-media')
        ->has('socialMedia', 1)
        ->where('socialMedia.0.platform', 'instagram')
    );
});

test('social media settings can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('social-media.update'), [
            'social_media' => [
                [
                    'platform' => 'instagram',
                    'url' => 'https://instagram.com/mybrand',
                    'handle' => '@mybrand',
                ],
                [
                    'platform' => 'tiktok',
                    'url' => 'https://tiktok.com/@mybrand',
                    'handle' => 'TikTok Kami',
                ],
            ],
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('social-media.edit'));

    $user->refresh();

    expect($user->social_media)->toBeArray();
    expect($user->social_media)->toHaveCount(2);
    expect($user->social_media[0]['platform'])->toBe('instagram');
    expect($user->social_media[0]['url'])->toBe('https://instagram.com/mybrand');
    expect($user->social_media[1]['platform'])->toBe('tiktok');
});

test('social media handles username and phone normalization', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('social-media.update'), [
            'social_media' => [
                [
                    'platform' => 'instagram',
                    'url' => '@supervendor',
                ],
                [
                    'platform' => 'whatsapp',
                    'url' => '081298765432',
                ],
            ],
        ]);

    $response->assertSessionHasNoErrors();

    $user->refresh();

    expect($user->social_media[0]['url'])->toBe('https://instagram.com/supervendor');
    expect($user->social_media[1]['url'])->toBe('https://wa.me/6281298765432');
});

test('social media can be emptied', function () {
    $user = User::factory()->create([
        'social_media' => [
            [
                'platform' => 'instagram',
                'url' => 'https://instagram.com/vendor',
            ],
        ],
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('social-media.update'), [
            'social_media' => [],
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('social-media.edit'));

    expect($user->refresh()->social_media)->toBeArray();
    expect($user->social_media)->toBeEmpty();
});
