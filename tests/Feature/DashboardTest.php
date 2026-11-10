<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create(['role' => 'vendor']);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('isAdmin', false)
            ->has('stats')
            ->has('sales_trend')
            ->has('categories')
            ->has('types')
            ->has('recent_orders')
            ->has('upcoming_events')
        );
});

test('admin can visit dashboard with platform-wide stats and isAdmin true', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $response = $this->get(route('dashboard'));
    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('isAdmin', true)
            ->has('stats')
            ->has('sales_trend')
        );
});
