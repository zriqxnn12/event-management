<?php

use App\Http\Controllers\CheckInController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Vendor\EventController;
use App\Http\Controllers\VendorProfileController;
use App\Http\Controllers\WithdrawalController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard (admin sees platform-wide metrics + fees; vendor sees own metrics)
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Orders index (admin sees all + fees; vendor sees own orders)
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');

    // Check-in management
    Route::get('check-in', [CheckInController::class, 'index'])->name('check-in.index');
    Route::post('check-in/scan', [CheckInController::class, 'checkIn'])->name('check-in.scan');
    Route::get('check-in/lookup', [CheckInController::class, 'lookup'])->name('check-in.lookup');

    // Withdrawals (vendor balance & requests; admin review & approval)
    Route::get('withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::post('withdrawals', [WithdrawalController::class, 'store'])->name('withdrawals.store');
    Route::patch('withdrawals/{withdrawal}/status', [WithdrawalController::class, 'updateStatus'])->name('withdrawals.update-status');

    // Event management (admin sees all events; vendor sees own events)
    Route::prefix('vendor')->name('vendor.')->group(function () {
        Route::match(['put', 'patch', 'post'], 'events/{event}', [EventController::class, 'update'])->name('events.update');
        Route::resource('events', EventController::class)->except(['show', 'update']);
        Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');
    });
});

// Order & Payment
Route::post('/order', [OrderController::class, 'store'])->name('orders.store');
Route::get('/payments/finish', [OrderController::class, 'finish'])->name('payments.finish');
Route::get('/order/{order:number}', [OrderController::class, 'show'])->name('orders.show');
Route::get('/order/{order:number}/receipt', [OrderController::class, 'receipt'])->name('orders.receipt');
Route::post('/payments/notification', [OrderController::class, 'notification'])->name('payments.notification');
Route::post('/api/midtrans/notification', [OrderController::class, 'notification'])->name('api.midtrans.notification');

require __DIR__.'/settings.php';

// Catch-all vendor & event routes — must be last to avoid clashing with fixed routes
Route::get('/{user:username}/{event:slug}', [VendorProfileController::class, 'showEvent'])->name('vendor.event.detail');
Route::get('/{user:username}', [VendorProfileController::class, 'show'])->name('vendor.profile');
