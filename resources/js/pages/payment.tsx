import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Ticket,
    AlertCircle,
    Clock,
    QrCode,
    Download,
    FileDown,
    Printer,
    RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { receipt } from '@/routes/orders';

interface PaymentProps {
    order: {
        id: number;
        number: string;
        attendee_name: string;
        attendee_email: string;
        total_price: number;
        formatted_price: string;
        quantity: number;
        payment_status: 'pending' | 'paid' | 'expired' | 'cancelled';
    };
    event: {
        id: number;
        title: string;
        slug: string;
    };
    ticket: {
        id: number;
        name: string;
    };
    vendor: {
        username: string;
    };
    snapToken: string | null;
    midtransIsProduction: boolean;
    qrCode?: string | null;
}

const STATUS_CONFIG = {
    pending: {
        label: 'Menunggu Pembayaran',
        icon: Clock,
        variant: 'secondary' as const,
        className: 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    },
    paid: {
        label: 'Pembayaran Berhasil',
        icon: CheckCircle2,
        variant: 'default' as const,
        className: 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    },
    expired: {
        label: 'Pembayaran Kadaluarsa',
        icon: AlertCircle,
        variant: 'destructive' as const,
        className: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
    },
    cancelled: {
        label: 'Pembayaran Dibatalkan',
        icon: AlertCircle,
        variant: 'destructive' as const,
        className: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
    },
};

export default function Payment({
    order,
    event,
    ticket,
    vendor,
    snapToken,
    midtransIsProduction,
    qrCode,
}: PaymentProps) {

    const midtransSnapUrl = midtransIsProduction
        ? `https://app.midtrans.com/snap/v3/redirection/${snapToken}`
        : `https://app.sandbox.midtrans.com/snap/v3/redirection/${snapToken}`;

    const vendorEventUrl = `/${vendor.username}/${event.slug}`;
    const statusConfig = STATUS_CONFIG[order.payment_status];
    const StatusIcon = statusConfig.icon;

    const handlePayNow = () => {
        if (!snapToken) {
            toast.error('Token pembayaran tidak tersedia.');
            return;
        }

        window.open(midtransSnapUrl, '_blank', 'noopener,noreferrer');
    };

    const handleDownloadQrCodePng = () => {
        if (!qrCode) return;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 600;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                toast.error('Gagal membuat canvas gambar.');
                return;
            }

            // Solid clean white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, size, size);

            // Draw QR code centered with padding for reliable scanning
            const padding = 40;
            ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `qrcode-bukti-pembayaran-${order.number}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('QR Code berhasil diunduh sebagai PNG!');
        };
        img.onerror = () => {
            toast.error('Gagal memproses QR Code untuk diunduh.');
        };
        img.src = qrCode;
    };

    return (
        <>
            <Head title={`Pembayaran #${order.number} — ${event.title}`} />

            <div className="min-h-screen bg-background text-foreground pb-20">
                {/* ─── TOP BAR ─── */}
                <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-md">
                    <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-2 border-foreground font-bold shadow-2xs hover:bg-muted"
                        >
                            <Link href={vendorEventUrl}>
                                <ArrowLeft className="size-4" />
                                <span className="hidden sm:inline">Kembali ke Event</span>
                            </Link>
                        </Button>

                        <span className="font-black text-sm tracking-tight">Halaman Pembayaran</span>
                    </div>
                </header>

                <main className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
                    {/* ─── STATUS BANNER ─── */}
                    <div className={`mb-6 flex items-center gap-3 border-2 p-4 ${statusConfig.className}`}>
                        <StatusIcon className="size-5 shrink-0" />
                        <div>
                            <p className="font-black text-sm">{statusConfig.label}</p>
                            {order.payment_status === 'pending' && (
                                <p className="text-xs font-medium opacity-80">
                                    Segera selesaikan pembayaran sebelum batas waktu berakhir.
                                </p>
                            )}
                            {order.payment_status === 'paid' && (
                                <p className="text-xs font-medium opacity-80">
                                    Tiket Anda telah terverifikasi. Simpan atau tunjukkan QR Code di bawah untuk akses check-in resmi.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ─── QR CODE BUKTI PEMBAYARAN (DI ATAS RINCIAN PESANAN) ─── */}
                    {order.payment_status === 'paid' && qrCode && (
                        <Card className="border-2 border-foreground shadow-md bg-card text-center overflow-hidden mb-6">
                            <CardHeader className="border-b-2 border-foreground bg-muted/30 py-3">
                                <CardTitle className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider">
                                    <QrCode className="size-4 text-primary" />
                                    QR Code Bukti Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 pb-6 flex flex-col items-center gap-4">
                                {/* QR Code Container with scan border */}
                                <div className="relative p-3 border-2 border-foreground bg-white shadow-xs rounded-none">
                                    <img
                                        src={qrCode}
                                        alt={`QR Code Bukti Pembayaran #${order.number}`}
                                        className="size-48 sm:size-56 object-contain"
                                    />
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <span className="font-mono text-xs font-black tracking-widest px-2.5 py-1 border-2 border-foreground bg-secondary/20">
                                        {order.number}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-semibold mt-1 max-w-sm">
                                        Scan QR code untuk melihat rincian bukti transaksi & validasi tiket resmi
                                    </span>
                                </div>

                                {/* Download & Print Actions */}
                                <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-2 border-t border-foreground/10">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownloadQrCodePng}
                                        className="border-2 border-foreground font-bold shadow-2xs hover:bg-muted text-xs"
                                    >
                                        <Download className="size-3.5 mr-1.5" />
                                        Unduh QR Code (PNG)
                                    </Button>

                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-foreground font-bold shadow-2xs hover:bg-muted text-xs"
                                    >
                                        <a href={receipt.url(order.number)}>
                                            <FileDown className="size-3.5 mr-1.5" />
                                            Unduh Bukti Pembayaran (PDF)
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ─── ORDER SUMMARY CARD ─── */}
                    <Card className="border-2 border-foreground shadow-sm mb-6">
                        <CardHeader className="border-b-2 border-foreground bg-muted/30 pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-black">
                                <Ticket className="size-5 text-primary" />
                                Rincian Pesanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 flex flex-col gap-4">
                            {/* Order number */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-semibold">Nomor Pesanan</span>
                                <span className="font-mono font-black">#{order.number}</span>
                            </div>

                            <Separator className="bg-foreground/10" />

                            {/* Event & ticket */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Event</span>
                                <span className="font-black text-base leading-snug">{event.title}</span>
                            </div>

                            <div className="flex items-center justify-between border-2 border-foreground bg-secondary/20 p-3">
                                <div>
                                    <span className="font-black text-sm">{ticket.name}</span>
                                    <div className="text-xs text-muted-foreground font-semibold mt-0.5">
                                        Qty: {order.quantity}
                                    </div>
                                </div>
                                <Badge
                                    variant="default"
                                    className="border-2 border-foreground font-mono font-black"
                                >
                                    {order.formatted_price}
                                </Badge>
                            </div>

                            <Separator className="bg-foreground/10" />

                            {/* Attendee */}
                            <div className="flex flex-col gap-1 text-sm">
                                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Peserta</span>
                                <span className="font-black">{order.attendee_name}</span>
                                <span className="text-muted-foreground font-medium">{order.attendee_email}</span>
                            </div>

                            <Separator className="bg-foreground/10" />

                            {/* Total */}
                            <div className="flex items-center justify-between">
                                <span className="font-black text-base">Total Pembayaran</span>
                                <span className="font-mono font-black text-xl">
                                    {order.total_price <= 0 ? 'GRATIS' : order.formatted_price}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ─── ACTION AREA ─── */}
                    {order.payment_status === 'pending' && order.total_price > 0 && snapToken && (
                        <div className="flex flex-col gap-2.5">
                            <Button
                                onClick={handlePayNow}
                                size="lg"
                                className="w-full border-2 border-foreground font-black shadow-sm text-base"
                            >
                                <CreditCard className="size-5 mr-2" />
                                Bayar Sekarang
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    toast.info('Memeriksa status pembayaran ke Midtrans…');
                                    router.reload();
                                }}
                                className="w-full border-2 border-foreground font-bold shadow-2xs hover:bg-muted text-xs"
                            >
                                <RotateCw className="size-3.5 mr-1.5" />
                                Sudah Bayar? Cek Status Pembayaran
                            </Button>
                        </div>
                    )}

                    {order.payment_status === 'pending' && order.total_price > 0 && !snapToken && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 border-2 border-amber-400 bg-amber-50 dark:bg-amber-950 p-4 text-amber-800 dark:text-amber-200">
                                <AlertCircle className="size-5 shrink-0" />
                                <span className="font-bold text-sm">
                                    Token pembayaran belum berhasil dimuat. Pastikan kredensial Midtrans di server sudah diisi atau coba muat ulang halaman ini.
                                </span>
                            </div>
                            <Button
                                onClick={() => router.reload()}
                                variant="outline"
                                className="w-full border-2 border-foreground font-bold"
                            >
                                Coba Muat Ulang
                            </Button>
                        </div>
                    )}

                    {order.payment_status === 'paid' && (
                        <div className="flex flex-col gap-3">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-2 border-foreground font-bold shadow-2xs hover:bg-muted"
                            >
                                <Link href={vendorEventUrl}>Kembali ke Halaman Event</Link>
                            </Button>
                        </div>
                    )}

                    {(order.payment_status === 'expired' || order.payment_status === 'cancelled') && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 border-2 border-red-400 bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">
                                <AlertCircle className="size-5 shrink-0" />
                                <span className="font-black text-sm">
                                    {order.payment_status === 'expired'
                                        ? 'Waktu pembayaran telah habis.'
                                        : 'Pesanan ini telah dibatalkan.'}
                                </span>
                            </div>
                            <Button
                                asChild
                                className="w-full border-2 border-foreground font-black"
                            >
                                <Link href={vendorEventUrl}>Pesan Ulang Tiket</Link>
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

