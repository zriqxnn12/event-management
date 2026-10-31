# Panduan Integrasi Midtrans Snap dengan Laravel

Dokumentasi ini berisi langkah-langkah lengkap cara mengintegrasikan payment gateway **Midtrans** menggunakan **Snap API** pada framework **Laravel**.

---

## Daftar Isi
1. [Persiapan Awal & Kredensial](#1-persiapan-awal--kredensial)
2. [Instalasi Package Midtrans PHP](#2-instalasi-package-midtrans-php)
3. [Konfigurasi Environment (.env & config)](#3-konfigurasi-environment-env--config)
4. [Membuat Database & Model Order](#4-membuat-database--model-order)
5. [Membuat Controller & Service Midtrans](#5-membuat-controller--service-midtrans)
6. [Membuat Tampilan (View) & Script Midtrans Snap](#6-membuat-tampilan-view--script-midtrans-snap)
7. [Menangani Webhook / Notification Handler](#7-menangani-webhook--notification-handler)

---

## 1. Persiapan Awal & Kredensial
Masuk ke dashboard [Midtrans Sandbox / Production](https://dashboard.sandbox.midtrans.com/) Anda, lalu ambil kunci akses pada menu **Settings > Access Keys**:
*   `Merchant ID`
*   `Client Key`
*   `Server Key`

---

## 2. Instalasi Package Midtrans PHP
Jalankan perintah berikut pada terminal di root direktori project Laravel Anda untuk menginstal library resmi Midtrans:

```bash
composer require midtrans/midtrans-php
```

---

## 3. Konfigurasi Environment (`.env` & `config`)

### A. Tambahkan ke file `.env`
Buka file `.env` dan tambahkan baris berikut (sesuaikan dengan kredensial Anda):

```env
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_IS_PRODUCTION=false
```

### B. Buat File Konfigurasi Baru (`config/midtrans.php`)
Buat file baru bernama `midtrans.php` di dalam folder `config/`:

```php
<?php

return [
    'merchant_id' => env('MIDTRANS_MERCHANT_ID'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => true,
    'is_3ds' => true,
];
```

---

## 4. Membuat Database & Model Order

Buat migration untuk tabel `orders` yang menampung status pembayaran dan `snap_token`:

```bash
php artisan make:model Order -m
```

Sesuaikan file migration yang digenerate di `database/migrations/_[timestamp]_create_orders_table.php`:

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('number');
    $table->decimal('total_price', 12, 2);
    $table->enum('payment_status', ['1', '2', '3', '4'])->comment('1=Menunggu Pembayaran, 2=Sudah Dibayar, 3=Kadaluarsa, 4=Dibatalkan');
    $table->string('snap_token')->nullable();
    $table->timestamps();
});
```
Jalankan migration:
```bash
php artisan migrate
```

---

## 5. Membuat Controller & Service Midtrans

### A. Konfigurasi Global Midtrans di Base Controller atau Service
Buat file helper/service untuk inisialisasi konfigurasi Midtrans di `app/Services/Midtrans/Midtrans.php`:

```php
<?php

namespace App\Services\Midtrans;

class Midtrans
{
    protected $serverKey;
    protected $isProduction;
    protected $isSanitized;
    protected $is3ds;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key');
        $this->isProduction = config('midtrans.is_production');
        $this->isSanitized = config('midtrans.is_sanitized');
        $this->is3ds = config('midtrans.is_3ds');
    }

    public function configure()
    {
        \Midtrans\Config::$serverKey = $this->serverKey;
        \Midtrans\Config::$isProduction = $this->isProduction;
        \Midtrans\Config::$isSanitized = $this->isSanitized;
        \Midtrans\Config::$is3ds = $this->is3ds;
    }
}
```

### B. Buat Service untuk Get Snap Token (`app/Services/Midtrans/CreateSnapTokenService.php`)

```php
<?php

namespace App\Services\Midtrans;

use Midtrans\Snap;

class CreateSnapTokenService extends Midtrans
{
    protected $order;

    public function __construct($order)
    {
        parent::__construct();
        $this->order = $order;
    }

    public function getSnapToken()
    {
        $this->configure();

        $params = [
            'transaction_details' => [
                'order_id' => $this->order->number,
                'gross_amount' => $this->order->total_price,
            ],
            'customer_details' => [
                'first_name' => 'Nama Pelanggan',
                'email' => 'pelanggan@email.com',
                'phone' => '08123456789',
            ]
        ];

        $snapToken = Snap::getSnapToken($params);

        return $snapToken;
    }
}
```

### C. Buat OrderController

```bash
php artisan make:controller OrderController --resource --model=Order
```

Isi method `show` di dalam `OrderController.php`:

```php
public function show(Order $order)
{
    // Jika snap_token kosong, buat baru
    if (empty($order->snap_token)) {
        $midtrans = new \App\Services\Midtrans\CreateSnapTokenService($order);
        $snapToken = $midtrans->getSnapToken();
        
        $order->snap_token = $snapToken;
        $order->save();
    }

    return view('orders.show', compact('order'));
}
```

---

## 6. Membuat Tampilan (View) & Script Midtrans Snap

Buat file view di `resources/views/orders/show.blade.php`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Detail Pesanan #{{ $order->number }}</title>
    <!-- Midtrans Snap JS (Gunakan sandbox/production URL sesuai mode) -->
    <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="{{ config('midtrans.client_key') }}"></script>
</head>
<body>
    <div style="padding: 20px;">
        <h1>Order #{{ $order->number }}</h1>
        <p>Total: Rp {{ number_format($order->total_price, 0, ',', '.') }}</p>
        <p>Status: 
            @if($order->payment_status == 1) Menunggu Pembayaran
            @elseif($order->payment_status == 2) Sudah Dibayar
            @endif
        </p>

        @if($order->payment_status == 1)
            <button id="pay-button">Bayar Sekarang</button>
        @endif
    </div>

    <script type="text/javascript">
      const payButton = document.querySelector('#pay-button');
      if (payButton) {
          payButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.snap.pay('{{ $order->snap_token }}', {
              onSuccess: function(result){
                alert("Pembayaran berhasil!");
                location.reload();
              },
              onPending: function(result){
                alert("Menunggu pembayaran Anda!");
                location.reload();
              },
              onError: function(result){
                alert("Pembayaran gagal!");
                location.reload();
              }
            });
          });
      }
    </script>
</body>
</html>
```

---

## 7. Menangani Webhook / Notification Handler

Midtrans akan mengirim HTTP POST notification ke server Anda ketika status transaksi berubah.

### A. Buat Route Webhook di `routes/web.php`
*Catatan: Jangan lupa untuk mengecualikan route ini dari CSRF Token verification di `app/Http/Middleware/VerifyCsrfToken.php`.*

```php
use App\Http\Controllers\Api\PaymentController;

Route::post('/payments/notification', [PaymentController::class, 'notification']);
```

### B. Buat Method Handler di Controller (`PaymentController.php`)

```php
public function notification(Request $request)
{
    $serverKey = config('midtrans.server_key');
    $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

    if ($hashed == $request->signature_key) {
        $order = Order::where('number', $request->order_id)->first();
        
        if ($order) {
            if ($request->transaction_status == 'capture' || $request->transaction_status == 'settlement') {
                $order->payment_status = 2; // Sudah Dibayar
            } else if ($request->transaction_status == 'cancel' || $request->transaction_status == 'expire') {
                $order->payment_status = 4; // Dibatalkan / Kadaluarsa
            }
            $order->save();
        }
    }

    return response()->json(['status' => 'success']);
}