<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Bukti Pembayaran #{{ $order->number }}</title>
    <link rel="stylesheet" href="{{ public_path('css/pdf.css') }}">
</head>

<body class="bg-white text-gray-900 text-xs">
    <!-- Header -->
    <table class="w-full border-b-2 border-gray-900 pb-4 mb-4">
        <tr>
            <td class="align-top">
                <div class="text-lg font-bold text-gray-900 uppercase tracking-tight">BUKTI PEMBAYARAN RESMI</div>
                <div class="text-xs text-gray-500 mt-1">Platform Manajemen Acara & Tiket Elektronik</div>
            </td>
            <td class="text-right align-top">
                <span
                    class="inline-block bg-green-600 text-white font-bold text-xs px-3 py-1 rounded uppercase tracking-wide">&#10003;
                    LUNAS</span>
                <div class="font-mono font-bold text-sm text-gray-900 mt-1">#{{ $order->number }}</div>
            </td>
        </tr>
    </table>

    <!-- Informasi Acara & Penyelenggara -->
    <div class="text-xs font-bold uppercase tracking-wide text-gray-900 border-b border-gray-200 pb-1 mt-4 mb-2">
        Informasi Acara & Penyelenggara</div>
    <table class="w-full border-collapse mb-3">
        <tr>
            <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Nama Acara:</td>
            <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">{{ $order->event->title }}</td>
        </tr>
        <tr>
            <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Kategori / Tipe:</td>
            <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">{{ $order->event->category }} &bull;
                {{ ucfirst($order->event->type) }}</td>
        </tr>
        @if ($order->event->start_date)
            <tr>
                <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Waktu Acara:</td>
                <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">
                    {{ $order->event->start_date->translatedFormat('d F Y, H:i') }} WIB</td>
            </tr>
        @endif
        @if ($order->event->location_name || $order->event->location_address)
            <tr>
                <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Lokasi:</td>
                <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">
                    {{ $order->event->location_name }}
                    @if ($order->event->location_address)
                        - {{ $order->event->location_address }}
                    @endif
                </td>
            </tr>
        @endif
        @if ($order->event->user)
            <tr>
                <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Penyelenggara:</td>
                <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">{{ $order->event->user->name }}
                </td>
            </tr>
        @endif
    </table>

    <!-- Data Peserta & Pemesanan -->
    <div class="text-xs font-bold uppercase tracking-wide text-gray-900 border-b border-gray-200 pb-1 mt-4 mb-2">Data
        Peserta & Pemesanan</div>
    <table class="w-full border-collapse mb-3">
        <tr>
            <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Nama Peserta:</td>
            <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">{{ $order->attendee_name }}</td>
        </tr>
        <tr>
            <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Email:</td>
            <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">{{ $order->attendee_email }}</td>
        </tr>
        @if ($order->attendee_phone)
            <tr>
                <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">No. Telepon:</td>
                <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">{{ $order->attendee_phone }}</td>
            </tr>
        @endif
        <tr>
            <td class="w-1/4 py-1 px-2 text-gray-500 font-bold text-xs align-top">Waktu Pembayaran:</td>
            <td class="w-3/4 py-1 px-2 font-bold text-gray-900 text-xs align-top">
                {{ $order->updated_at?->translatedFormat('d F Y, H:i') ?? '-' }} WIB</td>
        </tr>
    </table>

    <!-- Rincian Tiket -->
    <table class="w-full border-collapse mt-2 mb-4">
        <thead>
            <tr>
                <th class="bg-gray-100 text-gray-900 font-bold text-xs uppercase p-2 border border-gray-300 text-left">
                    Deskripsi Tiket</th>
                <th
                    class="bg-gray-100 text-gray-900 font-bold text-xs uppercase p-2 border border-gray-300 text-center w-[15%]">
                    Jumlah</th>
                <th
                    class="bg-gray-100 text-gray-900 font-bold text-xs uppercase p-2 border border-gray-300 text-right w-[25%]">
                    Harga Satuan</th>
                <th
                    class="bg-gray-100 text-gray-900 font-bold text-xs uppercase p-2 border border-gray-300 text-right w-[25%]">
                    Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="p-2 border border-gray-200 text-xs">
                    <strong class="font-bold text-gray-900">{{ $order->ticket->name }}</strong>
                </td>
                <td class="p-2 border border-gray-200 text-xs text-center font-bold">
                    {{ $order->quantity }}
                </td>
                <td class="p-2 border border-gray-200 text-xs text-right">
                    {{ (float) $order->ticket->price <= 0 ? 'GRATIS' : 'Rp ' . number_format((float) $order->ticket->price, 0, ',', '.') }}
                </td>
                <td class="p-2 border border-gray-200 text-xs text-right font-bold">
                    {{ (float) $order->total_price <= 0 ? 'GRATIS' : 'Rp ' . number_format((float) $order->total_price, 0, ',', '.') }}
                </td>
            </tr>
            <tr class="bg-gray-50 font-bold text-xs border-t-2 border-gray-900">
                <td colspan="3" class="p-2 border border-gray-200 text-right font-bold text-gray-900">TOTAL
                    PEMBAYARAN:</td>
                <td class="p-2 border border-gray-200 text-right font-bold text-gray-900">
                    {{ (float) $order->total_price <= 0 ? 'GRATIS' : 'Rp ' . number_format((float) $order->total_price, 0, ',', '.') }}
                </td>
            </tr>
        </tbody>
    </table>

    <!-- QR Code Section -->
    @if ($qrCode)
        <div class="w-full border-2 border-dashed border-gray-400 rounded-md p-3 mt-4 bg-gray-50">
            <table class="w-full">
                <tr>
                    <td class="w-40 text-center align-middle">
                        <img src="{{ $qrCode }}" width="140" height="140" alt="QR Code Bukti Pembayaran"
                            class="mx-auto" />
                    </td>
                    <td class="pl-4 align-middle">
                        <div class="text-sm font-bold text-gray-900 mb-1">Validasi & Check-in Tiket</div>
                        <div class="text-xs text-gray-600 mb-1 leading-relaxed">
                            Pindai kode QR ini saat registrasi masuk acara untuk verifikasi kehadiran dan keabsahan
                            tiket.
                        </div>
                        <div class="font-mono text-xs text-gray-600">
                            KODE PESANAN: <strong class="text-gray-900">#{{ $order->number }}</strong><br>
                            STATUS: <strong class="text-green-700">LUNAS (PAID)</strong>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    @endif

    <!-- Footer -->
    <div class="mt-6 border-t border-gray-200 pt-2 text-center text-xs text-gray-400 leading-relaxed">
        Bukti pembayaran ini diterbitkan secara otomatis oleh sistem dan berlaku sebagai tiket resmi masuk acara.<br>
        Dicetak pada {{ now()->translatedFormat('d F Y, H:i') }} WIB &bull; Verifikasi:
        {{ route('orders.show', $order) }}
    </div>
</body>

</html>
