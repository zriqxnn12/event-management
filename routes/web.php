<?php

use App\Http\Controllers\OrderController;
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

// Order & Payment
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
Route::get('/payments/finish', [OrderController::class, 'finish'])->name('payments.finish');
Route::get('/orders/{order:number}', [OrderController::class, 'show'])->name('orders.show');
Route::post('/payments/notification', [OrderController::class, 'notification'])->name('payments.notification');

require __DIR__.'/settings.php';

// Catch-all vendor & event routes — must be last to avoid clashing with fixed routes
Route::get('/{user:username}/{event:slug}', [VendorProfileController::class, 'showEvent'])->name('vendor.event.detail');
Route::get('/{user:username}', [VendorProfileController::class, 'show'])->name('vendor.profile');
