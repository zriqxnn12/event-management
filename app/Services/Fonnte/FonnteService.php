<?php

namespace App\Services\Fonnte;

use App\Models\Order;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    private string $token;

    private string $apiUrl;

    private string $countryCode;

    public function __construct()
    {
        $this->token = (string) config('fonnte.token', '');
        $this->apiUrl = (string) config('fonnte.url', 'https://api.fonnte.com/send');
        $this->countryCode = (string) config('fonnte.country_code', '62');
    }

    /**
     * Send a WhatsApp message via Fonnte API.
     *
     * @return array{success: bool, response?: array<string, mixed>, error?: string}
     */
    public function sendMessage(string $target, string $message): array
    {
        $formattedTarget = $this->formatPhoneNumber($target);

        if (empty($formattedTarget)) {
            Log::warning('Fonnte send skipped: recipient phone number is empty.');

            return ['success' => false, 'error' => 'Phone number is empty'];
        }

        if (empty($this->token)) {
            Log::info('Fonnte send skipped: FONNTE_TOKEN is not configured.');

            return ['success' => false, 'error' => 'FONNTE_TOKEN not configured'];
        }

        try {
            /** @var Response $response */
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => $this->token,
                ])
                ->asForm()
                ->post($this->apiUrl, [
                    'target' => $formattedTarget,
                    'message' => $message,
                    'countryCode' => $this->countryCode,
                ]);

            $result = $response->json();

            if (! $response->successful() || (is_array($result) && isset($result['status']) && $result['status'] === false)) {
                $reason = is_array($result) && isset($result['reason']) ? (string) $result['reason'] : $response->body();
                Log::warning("Fonnte API send failed for target {$formattedTarget}: {$reason}");

                return ['success' => false, 'error' => $reason, 'response' => is_array($result) ? $result : null];
            }

            Log::info("Fonnte WhatsApp sent successfully to {$formattedTarget}.");

            return ['success' => true, 'response' => is_array($result) ? $result : null];
        } catch (\Throwable $e) {
            Log::error("Fonnte API exception sending to {$formattedTarget}: ".$e->getMessage());

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send WhatsApp notification when an order is created and pending payment.
     */
    public function sendOrderPendingNotification(Order $order): bool
    {
        if (empty($order->attendee_phone)) {
            return false;
        }

        $order->loadMissing(['event', 'ticket']);

        $appName = config('app.name', 'Eventoria');
        $orderUrl = route('orders.show', $order);
        $priceDisplay = $order->total_price <= 0
            ? 'GRATIS'
            : 'Rp '.number_format((float) $order->total_price, 0, ',', '.');

        $message = implode("\n", [
            "Halo *{$order->attendee_name}*! 👋",
            '',
            "Terima kasih telah memesan tiket di *{$appName}*.",
            'Pesanan Anda telah kami terima dan saat ini berstatus *MENUNGGU PEMBAYARAN*.',
            '',
            '📋 *Rincian Pesanan:*',
            "• *No. Pesanan:* {$order->number}",
            "• *Acara:* {$order->event->title}",
            "• *Kategori Tiket:* {$order->ticket->name}",
            "• *Jumlah:* {$order->quantity} tiket",
            "• *Total Tagihan:* {$priceDisplay}",
            '• *Status:* Menunggu Pembayaran',
            '',
            '💳 *Instruksi Pembayaran:*',
            'Silakan selesaikan pembayaran Anda melalui tautan resmi berikut:',
            "{$orderUrl}",
            '',
            '⚠️ *Penting:* Mohon segera selesaikan pembayaran sebelum kuota habis agar tiket Anda tidak dibatalkan otomatis.',
            '',
            'Salam hangat,',
            "*Tim {$appName}*",
        ]);

        $res = $this->sendMessage($order->attendee_phone, $message);

        return $res['success'];
    }

    /**
     * Send WhatsApp notification when an order payment is confirmed (paid).
     */
    public function sendOrderPaidNotification(Order $order): bool
    {
        if (empty($order->attendee_phone)) {
            return false;
        }

        $order->loadMissing(['event', 'ticket']);

        $appName = config('app.name', 'Eventoria');
        $orderUrl = route('orders.show', $order);
        $receiptUrl = route('orders.receipt', $order);
        $priceDisplay = $order->total_price <= 0
            ? 'GRATIS'
            : 'Rp '.number_format((float) $order->total_price, 0, ',', '.');

        $message = implode("\n", [
            "Halo *{$order->attendee_name}*! 🎉",
            '',
            'Kabar gembira! Pembayaran untuk pesanan tiket Anda telah *BERHASIL TERKONFIRMASI (LUNAS)*.',
            '',
            '📋 *Detail Tiket Resmi:*',
            "• *No. Pesanan:* {$order->number}",
            "• *Acara:* {$order->event->title}",
            "• *Kategori Tiket:* {$order->ticket->name}",
            "• *Jumlah:* {$order->quantity} tiket",
            "• *Total Bayar:* {$priceDisplay}",
            '• *Status Pembayaran:* LUNAS ✅',
            '',
            '🎟️ *Akses E-Tiket & Bukti Pembayaran:*',
            '• Lihat E-Tiket & QR Code:',
            "{$orderUrl}",
            '',
            '• Unduh Bukti Pembayaran (PDF):',
            "{$receiptUrl}",
            '',
            '💡 *Informasi Acara:*',
            'Silakan simpan pesan ini atau simpan QR Code e-tiket Anda untuk ditunjukkan kepada panitia saat check-in pada hari acara.',
            '',
            'Sampai jumpa di acara! 🚀',
            "*Tim {$appName}*",
        ]);

        $res = $this->sendMessage($order->attendee_phone, $message);

        return $res['success'];
    }

    /**
     * Normalize and format phone number for WhatsApp.
     */
    public function formatPhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone) ?? '';

        if (str_starts_with($cleaned, '0')) {
            $cleaned = '62'.substr($cleaned, 1);
        } elseif (str_starts_with($cleaned, '8')) {
            $cleaned = '62'.$cleaned;
        }

        return $cleaned;
    }
}

