<?php

use App\Http\Controllers\Vendor\EventController;
use App\Http\Controllers\VendorProfileController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Vendor event management
    Route::prefix('vendor')->name('vendor.')->group(function () {
        Route::resource('events', EventController::class)->except(['show']);
        Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');
    });
});

require __DIR__.'/settings.php';

// Catch-all vendor profile route — must be last to avoid clashing with fixed routes
Route::get('/{user:username}', [VendorProfileController::class, 'show'])->name('vendor.profile');
