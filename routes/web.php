<?php

use App\Http\Controllers\Vendor\EventController;
use App\Http\Controllers\VendorProfileController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Vendor event management
    Route::prefix('vendor')->name('vendor.')->group(function () {
        Route::match(['put', 'patch', 'post'], 'events/{event}', [EventController::class, 'update'])->name('events.update');
        Route::resource('events', EventController::class)->except(['show', 'update']);
        Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');
    });
});

require __DIR__.'/settings.php';

// Catch-all vendor & event routes — must be last to avoid clashing with fixed routes
Route::get('/{user:username}/{event:slug}', [VendorProfileController::class, 'showEvent'])->name('vendor.event.detail');
Route::get('/{user:username}', [VendorProfileController::class, 'show'])->name('vendor.profile');
