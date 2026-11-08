<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Bukti Pembayaran #{{ $order->number }}</title>
    <style>
        * {
            box-sizing: border-box;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        body {
            margin: 0;
            padding: 24px;
            color: #111827;
            background-color: #ffffff;
            font-size: 12px;
            line-height: 1.5;
        }

        .header-table {
            width: 100%;
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 18px;
        }

        .brand-title {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .brand-subtitle {
            font-size: 11px;
            color: #6b7280;
            margin-top: 4px;
        }

        .badge-paid {
            display: inline-block;
            background-color: #16a34a;
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            padding: 5px 12px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .order-number {
            font-family: monospace;
            font-weight: bold;
            font-size: 13px;
            margin-top: 5px;
            color: #111827;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #111827;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-top: 16px;
            margin-bottom: 10px;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .info-table td {
            padding: 5px 6px;
            vertical-align: top;
        }

        .info-table .label {
            width: 25%;
            color: #6b7280;
            font-weight: bold;
            font-size: 11px;
        }

        .info-table .value {
            width: 75%;
            font-weight: bold;
            color: #111827;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 16px;
        }

        .items-table th {
            background-color: #f3f4f6;
            color: #111827;
            font-weight: bold;
            font-size: 11px;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #d1d5db;
            text-transform: uppercase;
        }

        .items-table td {
            padding: 9px 10px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
        }

        .items-table .text-right {
            text-align: right;
        }

        .items-table .text-center {
            text-align: center;
        }

        .total-row td {
            background-color: #f9fafb;
            font-weight: bold;
            font-size: 12px;
            border-top: 2px solid #111827;
        }

        .qr-section {
            width: 100%;
            border: 2px dashed #9ca3af;
            border-radius: 6px;
            padding: 14px;
            margin-top: 16px;
            background-color: #f9fafb;
        }

        .qr-table {
            width: 100%;
        }

        .qr-table td {
            vertical-align: middle;
        }

        .qr-code-cell {
            width: 160px;
            text-align: center;
        }

        .qr-desc-cell {
            padding-left: 16px;
        }

        .qr-desc-title {
            font-size: 13px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 4px;
        }

        .qr-desc-text {
            font-size: 11px;
            color: #4b5563;
            line-height: 1.4;
            margin-bottom: 6px;
        }

        .footer {
            margin-top: 24px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            line-height: 1.4;
        }
    </style>
</head>

<body>
    <table class="header-table">
        <tr>
            <td style="vertical-align: top;">
                <div class="brand-title">BUKTI PEMBAYARAN RESMI</div>
                <div class="brand-subtitle">Platform Manajemen Acara & Tiket Elektronik</div>
            </td>
            <td style="text-align: right; vertical-align: top;">
                <span class="badge-paid">&#10003; LUNAS</span>
                <div class="order-number">#{{ $order->number }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Informasi Acara & Penyelenggara</div>
    <table class="info-table">
        <tr>
            <td class="label">Nama Acara:</td>
            <td class="value">{{ $order->event->title }}</td>
        </tr>
        <tr>
            <td class="label">Kategori / Tipe:</td>
            <td class="value">{{ $order->event->category }} &bull; {{ ucfirst($order->event->type) }}</td>
        </tr>
        @if ($order->event->start_date)
            <tr>
                <td class="label">Waktu Acara:</td>
                <td class="value">{{ $order->event->start_date->translatedFormat('d F Y, H:i') }} WIB</td>
            </tr>
        @endif
        @if ($order->event->location_name || $order->event->location_address)
            <tr>
                <td class="label">Lokasi:</td>
                <td class="value">
                    {{ $order->event->location_name }}
                    @if ($order->event->location_address)
                        - {{ $order->event->location_address }}
                    @endif
                </td>
            </tr>
        @endif
        @if ($order->event->user)
            <tr>
                <td class="label">Penyelenggara:</td>
                <td class="value">{{ $order->event->user->name }}</td>
            </tr>
        @endif
    </table>

    <div class="section-title">Data Peserta & Pemesanan</div>
    <table class="info-table">
        <tr>
            <td class="label">Nama Peserta:</td>
            <td class="value">{{ $order->attendee_name }}</td>
        </tr>
        <tr>
            <td class="label">Email:</td>
            <td class="value">{{ $order->attendee_email }}</td>
        </tr>
        @if ($order->attendee_phone)
            <tr>
                <td class="label">No. Telepon:</td>
                <td class="value">{{ $order->attendee_phone }}</td>
            </tr>
        @endif
        <tr>
            <td class="label">Waktu Pembayaran:</td>
            <td class="value">{{ $order->updated_at?->translatedFormat('d F Y, H:i') ?? '-' }} WIB</td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>Deskripsi Tiket</th>
                <th style="width: 15%;" class="text-center">Jumlah</th>
                <th style="width: 25%;" class="text-right">Harga Satuan</th>
                <th style="width: 25%;" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>{{ $order->ticket->name }}</strong></td>
                <td class="text-center">{{ $order->quantity }}</td>
                <td class="text-right">
                    {{ (float) $order->ticket->price <= 0 ? 'GRATIS' : 'Rp ' . number_format((float) $order->ticket->price, 0, ',', '.') }}
                </td>
                <td class="text-right">
                    <strong>{{ (float) $order->total_price <= 0 ? 'GRATIS' : 'Rp ' . number_format((float) $order->total_price, 0, ',', '.') }}</strong>
                </td>
            </tr>
            <tr class="total-row">
                <td colspan="3" class="text-right">TOTAL PEMBAYARAN:</td>
                <td class="text-right">
                    {{ (float) $order->total_price <= 0 ? 'GRATIS' : 'Rp ' . number_format((float) $order->total_price, 0, ',', '.') }}
                </td>
            </tr>
        </tbody>
    </table>

    @if ($qrCode)
        <div class="qr-section">
            <table class="qr-table">
                <tr>
                    <td class="qr-code-cell">
                        <img src="{{ $qrCode }}" width="140" height="140" alt="QR Code Bukti Pembayaran" />
                    </td>
                    <td class="qr-desc-cell">
                        <div class="qr-desc-title">Validasi & Check-in Tiket</div>
                        <div class="qr-desc-text">
                            Pindai kode QR ini saat registrasi masuk acara untuk verifikasi kehadiran dan keabsahan
                            tiket.
                        </div>
                        <div class="qr-desc-text" style="font-family: monospace; font-size: 10px; color: #4b5563;">
                            KODE PESANAN: <strong>#{{ $order->number }}</strong><br>
                            STATUS: <strong>LUNAS (PAID)</strong>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    @endif

    <div class="footer">
        Bukti pembayaran ini diterbitkan secara otomatis oleh sistem dan berlaku sebagai tiket resmi masuk acara.<br>
        Dicetak pada {{ now()->translatedFormat('d F Y, H:i') }} WIB &bull; Verifikasi:
        {{ route('orders.show', $order) }}
    </div>
</body>

</html>
