import { Head, router, setLayoutProps } from '@inertiajs/react';
import jsQR from 'jsqr';
import {
    CalendarDays,
    Camera,
    CameraOff,
    CheckCircle2,
    Clock,
    Filter,
    Mail,
    Phone,
    QrCode,
    RefreshCw,
    RotateCcw,
    ScanLine,
    Search,
    Ticket,
    UserCheck,
    UserX,
    X,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { index as checkInIndex, checkIn as checkInScan } from '@/actions/App/Http/Controllers/CheckInController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem, CheckInAttendee, CheckInIndexProps as Props } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Check-in', href: checkInIndex().url },
];

const CHECKED_IN_TABS = [
    { key: 'all', label: 'Semua Peserta' },
    { key: 'not_checked_in', label: 'Belum Hadir' },
    { key: 'checked_in', label: 'Sudah Hadir' },
];

type ScanState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; action: 'check_in' | 'undo' | 'already_checked_in'; message: string; order: CheckInAttendee }
    | { status: 'error'; message: string };

function playBeep(success: boolean): void {
    try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) {
            return;
        }
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = success ? 880 : 320;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
    } catch {
        // Ignore audio errors when autoplay/audio context is blocked
    }
}

function ProgressRing({ value, max, size = 60 }: { value: number; max: number; size?: number }) {
    const pct = max > 0 ? Math.min(1, value / max) : 0;
    const displayPct = Math.round(pct * 100);
    const r = size / 2 - 6;
    const circ = 2 * Math.PI * r;
    return (
        <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/40" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={5}
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct)}
                    className="text-emerald-500 transition-all duration-500"
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-xs font-black tracking-tight">{displayPct}%</span>
        </div>
    );
}

function ScanResultCard({
    scanState,
    onToggleOrder,
    onReset,
}: {
    scanState: Exclude<ScanState, { status: 'idle' | 'loading' }>;
    onToggleOrder: (orderNumber: string) => void;
    onReset: () => void;
}) {
    if (scanState.status === 'error') {
        return (
            <div className="mt-4 overflow-hidden rounded-xl border-2 border-destructive bg-destructive/5 shadow-[3px_3px_0px_0px_rgba(220,38,38,0.25)]">
                <div className="flex items-center justify-between border-b-2 border-destructive/30 bg-destructive/10 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        <XCircle className="size-4 text-destructive" />
                        <span className="text-xs font-black uppercase tracking-wider text-destructive">Check-in Gagal</span>
                    </div>
                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-md p-1 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Tutup hasil scan"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                    <p className="text-sm font-bold text-destructive">{scanState.message}</p>
                    <Button type="button" variant="outline" size="sm" onClick={onReset} className="shrink-0 border-2 border-destructive/50 font-bold">
                        Coba Lagi
                    </Button>
                </div>
            </div>
        );
    }

    const isCheckIn = scanState.action === 'check_in';
    const isAlreadyCheckedIn = scanState.action === 'already_checked_in';
    const isCurrentlyCheckedIn = isCheckIn || isAlreadyCheckedIn;
    const { order } = scanState;

    const bannerTitle = isCheckIn
        ? 'Check-in Berhasil'
        : isAlreadyCheckedIn
          ? 'Sudah Check-in Sebelumnya'
          : 'Check-in Dibatalkan';

    return (
        <div
            className={`mt-4 overflow-hidden rounded-xl border-2 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] ${
                isCheckIn ? 'border-emerald-600 bg-card' : 'border-amber-500 bg-card'
            }`}
        >
            {/* Status Banner */}
            <div
                className={`flex items-center justify-between border-b-2 px-4 py-2.5 ${
                    isCheckIn
                        ? 'border-emerald-600/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                        : 'border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-200'
                }`}
            >
                <div className="flex items-center gap-2">
                    {isCheckIn ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : isAlreadyCheckedIn ? (
                        <Clock className="size-4 shrink-0 text-amber-600" />
                    ) : (
                        <RotateCcw className="size-4 shrink-0 text-amber-600" />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider">{bannerTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                    {order.checked_in_at && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-current/20 bg-background/60 px-2 py-0.5 text-[11px] font-bold">
                            <Clock className="size-3" />
                            {order.checked_in_at}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
                        aria-label="Tutup hasil scan"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            {/* Attendee Highlight */}
            <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-dashed border-foreground/15 pb-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Peserta</p>
                        <h4 className="mt-0.5 text-lg font-black tracking-tight">{order.attendee_name}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            className={`border-2 font-bold ${
                                isCurrentlyCheckedIn
                                    ? 'border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-500'
                                    : 'border-amber-500 bg-amber-500 text-white hover:bg-amber-500'
                            }`}
                        >
                            {isCurrentlyCheckedIn ? 'Hadir' : 'Belum Hadir'}
                        </Badge>
                        {order.ticket && (
                            <Badge variant="outline" className="border-2 border-foreground font-bold">
                                <Ticket className="mr-1 size-3" />
                                {order.ticket.name} ×{order.quantity}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="mt-3 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-foreground/15 bg-muted/30 px-3 py-2">
                        <span className="block font-bold text-muted-foreground">No. Order</span>
                        <span className="mt-0.5 block font-mono text-sm font-black tracking-wide text-foreground">{order.number}</span>
                    </div>

                    <div className="rounded-lg border border-foreground/15 bg-muted/30 px-3 py-2">
                        <span className="flex items-center gap-1 font-bold text-muted-foreground">
                            <Mail className="size-3" /> Email
                        </span>
                        <span className="mt-0.5 block truncate font-bold text-foreground">{order.attendee_email}</span>
                    </div>

                    <div className="rounded-lg border border-foreground/15 bg-muted/30 px-3 py-2">
                        <span className="flex items-center gap-1 font-bold text-muted-foreground">
                            <Phone className="size-3" /> No. Telepon
                        </span>
                        <span className="mt-0.5 block font-bold text-foreground">{order.attendee_phone || '—'}</span>
                    </div>

                    {order.event && (
                        <div className="rounded-lg border border-foreground/15 bg-muted/30 px-3 py-2 sm:col-span-2">
                            <span className="flex items-center gap-1 font-bold text-muted-foreground">
                                <CalendarDays className="size-3" /> Event
                            </span>
                            <span className="mt-0.5 block truncate font-bold text-foreground">{order.event.title}</span>
                        </div>
                    )}

                    <div className="rounded-lg border border-foreground/15 bg-muted/30 px-3 py-2">
                        <span className="block font-bold text-muted-foreground">Total Bayar</span>
                        <span className="mt-0.5 block font-black text-foreground">{order.formatted_price}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                {/* <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t-2 border-foreground/10 pt-3">
                    <p className="text-xs font-semibold text-muted-foreground">{scanState.message}</p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onToggleOrder(order.number)}
                            className={`border-2 font-bold ${
                                isCurrentlyCheckedIn
                                    ? 'border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40'
                                    : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
                            }`}
                        >
                            {isCurrentlyCheckedIn ? (
                                <>
                                    <RotateCcw className="mr-1.5 size-3.5" /> Batalkan Check-in
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-1.5 size-3.5" /> Check-in Ulang
                                </>
                            )}
                        </Button>
                        <Button type="button" size="sm" onClick={onReset} className="border-2 border-foreground font-bold">
                            Selesai
                        </Button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

function ScanPanel({ onCheckIn }: { onCheckIn: (orderNumber: string, allowUndo?: boolean) => Promise<ScanState> }) {
    const [input, setInput] = useState('');
    const [scanState, setScanState] = useState<ScanState>({ status: 'idle' });
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [isScanningActive, setIsScanningActive] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isSubmittingRef = useRef(false);
    const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

    const executeCheckIn = useCallback(
        async (orderNumber: string, fromCamera = false, allowUndo = false) => {
            const trimmed = orderNumber.trim();
            if (!trimmed || isSubmittingRef.current) {
                return;
            }

            isSubmittingRef.current = true;
            setScanState({ status: 'loading' });

            const result = await onCheckIn(trimmed, allowUndo);
            setScanState(result);
            isSubmittingRef.current = false;

            if (result.status === 'success') {
                playBeep(result.action === 'check_in');
                if (!fromCamera) {
                    setInput('');
                    setTimeout(() => inputRef.current?.focus(), 50);
                }
            } else if (fromCamera) {
                playBeep(false);
            }
        },
        [onCheckIn],
    );

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsScanningActive(false);
    }, []);

    useEffect(() => {
        if (!cameraOpen) {
            stopCamera();
            return;
        }

        let cancelled = false;
        let rafId: number | null = null;
        let lastDetectTime = 0;

        const startCameraAndScanner = async () => {
            setCameraError(null);

            if (!navigator.mediaDevices?.getUserMedia) {
                setCameraError('Akses kamera tidak tersedia pada perangkat atau koneksi ini (pastikan menggunakan HTTPS atau localhost).');
                return;
            }

            try {
                let stream: MediaStream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: { ideal: 'environment' } },
                        audio: false,
                    });
                } catch (err) {
                    if (err instanceof DOMException && (err.name === 'OverconstrainedError' || err.name === 'NotFoundError') && selectedDeviceId) {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    } else {
                        throw err;
                    }
                }

                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                // Populate camera list after permission is granted
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter((d) => d.kind === 'videoinput');
                if (!cancelled) {
                    setCameras(videoInputs);
                    setIsScanningActive(true);
                }

                const scanLoop = async (timestamp: number) => {
                    if (cancelled) {
                        return;
                    }

                    const video = videoRef.current;
                    const canvas = canvasRef.current;

                    if (
                        timestamp - lastDetectTime >= 150 &&
                        video &&
                        canvas &&
                        video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA &&
                        video.videoWidth > 0 &&
                        video.videoHeight > 0
                    ) {
                        lastDetectTime = timestamp;
                        try {
                            const scale = Math.min(1, 640 / video.videoWidth);
                            const width = Math.max(1, Math.floor(video.videoWidth * scale));
                            const height = Math.max(1, Math.floor(video.videoHeight * scale));

                            if (canvas.width !== width || canvas.height !== height) {
                                canvas.width = width;
                                canvas.height = height;
                            }

                            const ctx = canvas.getContext('2d', { willReadFrequently: true });
                            if (ctx) {
                                ctx.drawImage(video, 0, 0, width, height);
                                const imageData = ctx.getImageData(0, 0, width, height);
                                const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
                                    inversionAttempts: 'attemptBoth',
                                });

                                if (decoded?.data) {
                                    const rawValue = decoded.data.trim();
                                    const now = Date.now();
                                    const isSameCooldown =
                                        lastScanRef.current.code === rawValue && now - lastScanRef.current.time < 3000;

                                    if (rawValue && !isSameCooldown && !isSubmittingRef.current) {
                                        lastScanRef.current = { code: rawValue, time: now };
                                        await executeCheckIn(rawValue, true);
                                    }
                                }
                            }
                        } catch {
                            // Ignore transient frame detection errors
                        }
                    }

                    rafId = requestAnimationFrame(scanLoop);
                };

                rafId = requestAnimationFrame(scanLoop);
            } catch (err) {
                if (!cancelled) {
                    const msg =
                        err instanceof DOMException && err.name === 'NotAllowedError'
                            ? 'Izin akses kamera ditolak. Mohon izinkan akses kamera pada browser Anda.'
                            : err instanceof DOMException && err.name === 'NotFoundError'
                                ? 'Kamera tidak ditemukan pada perangkat ini.'
                                : 'Tidak dapat mengakses kamera. Pastikan kamera tidak sedang digunakan aplikasi lain.';
                    setCameraError(msg);
                    setIsScanningActive(false);
                }
            }
        };

        startCameraAndScanner();

        return () => {
            cancelled = true;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            stopCamera();
        };
    }, [cameraOpen, selectedDeviceId, executeCheckIn, stopCamera]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await executeCheckIn(input, false);
    };

    const handleReset = () => {
        setScanState({ status: 'idle' });
        setInput('');
        inputRef.current?.focus();
    };

    const handleSwitchCamera = () => {
        if (cameras.length < 2) {
            return;
        }
        const currentIdx = cameras.findIndex((c) => c.deviceId === selectedDeviceId);
        const nextIdx = (currentIdx + 1) % cameras.length;
        setSelectedDeviceId(cameras[nextIdx].deviceId);
    };

    return (
        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                        <ScanLine className="size-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black">Scan QR Code / Input Nomor Order</h3>
                        <p className="text-xs text-muted-foreground">Gunakan kamera untuk scan QR tiket atau ketik nomor order secara manual</p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant={cameraOpen ? 'destructive' : 'outline'}
                    onClick={() => {
                        setCameraError(null);
                        setCameraOpen((prev) => !prev);
                    }}
                    className={`border-2 font-bold shadow-[2px_2px_0px_0px_#000] transition-transform hover:-translate-y-0.5 dark:shadow-[2px_2px_0px_0px_#fff] ${
                        cameraOpen ? 'border-foreground' : 'border-foreground bg-background'
                    }`}
                >
                    {cameraOpen ? (
                        <>
                            <CameraOff className="mr-1.5 size-4" /> Tutup Kamera
                        </>
                    ) : (
                        <>
                            <Camera className="mr-1.5 size-4" /> Buka Kamera QR
                        </>
                    )}
                </Button>
            </div>

            {/* Camera Scanner Area */}
            {cameraOpen && (
                <div className="mb-4 overflow-hidden rounded-xl border-2 border-foreground bg-muted/20">
                    <canvas ref={canvasRef} className="hidden" />
                    {cameraError ? (
                        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                            <CameraOff className="size-8 text-destructive/70" />
                            <p className="max-w-md text-xs font-bold text-destructive">{cameraError}</p>
                        </div>
                    ) : null}
                    <div className={cameraError ? 'hidden' : 'flex flex-col bg-black'}>
                        <div className="relative w-full overflow-hidden">
                            <video ref={videoRef} className="h-80 w-full object-cover sm:h-96" playsInline muted autoPlay />

                            {/* Target Reticle Overlay */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="relative size-56 rounded-xl border-2 border-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] sm:size-64">
                                    <span className="absolute -left-0.5 -top-0.5 size-6 rounded-tl-lg border-l-4 border-t-4 border-emerald-400" />
                                    <span className="absolute -right-0.5 -top-0.5 size-6 rounded-tr-lg border-r-4 border-t-4 border-emerald-400" />
                                    <span className="absolute -bottom-0.5 -left-0.5 size-6 rounded-bl-lg border-b-4 border-l-4 border-emerald-400" />
                                    <span className="absolute -bottom-0.5 -right-0.5 size-6 rounded-br-lg border-b-4 border-r-4 border-emerald-400" />
                                </div>
                            </div>
                        </div>

                            {/* Camera Status Bar */}
                            <div className="flex w-full items-center justify-between border-t-2 border-foreground bg-card px-3 py-2 text-xs">
                                <span className="flex items-center gap-2 font-bold">
                                    <span className={`size-2 rounded-full ${isScanningActive ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
                                    {isScanningActive ? 'Kamera aktif — arahkan ke QR Code tiket' : 'Menyiapkan kamera…'}
                                </span>
                                {cameras.length > 1 && (
                                    <Button type="button" variant="outline" size="sm" onClick={handleSwitchCamera} className="h-7 border-2 border-foreground px-2 text-xs font-bold">
                                        <RefreshCw className="mr-1 size-3" /> Ganti Kamera
                                    </Button>
                                )}
                            </div>
                        </div>
                </div>
            )}

            {/* Manual Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <QrCode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ketik manual: ORD-XXXXXXXXXXXXXXXX"
                        className="h-11 border-2 border-foreground/40 placeholder:text-slate-400 pl-9 font-mono text-sm font-semibold uppercase tracking-wider focus-visible:border-foreground"
                        autoFocus={!cameraOpen}
                        disabled={scanState.status === 'loading'}
                    />
                </div>
                <Button
                    type="submit"
                    className="h-11 border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 dark:shadow-[2px_2px_0px_0px_#fff]"
                    disabled={!input.trim() || scanState.status === 'loading'}
                >
                    {scanState.status === 'loading' ? 'Memeriksa…' : 'Check-in Manual'}
                </Button>
            </form>

            {/* Scan Result Card */}
            {scanState.status !== 'idle' && scanState.status !== 'loading' && (
                <ScanResultCard scanState={scanState} onToggleOrder={(num) => executeCheckIn(num, false, true)} onReset={handleReset} />
            )}
        </div>
    );
}

function AttendeeRow({ attendee, onToggle }: { attendee: CheckInAttendee; onToggle: (orderNumber: string) => Promise<void> }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        await onToggle(attendee.number);
        setLoading(false);
    };

    return (
        <tr className="transition-colors hover:bg-muted/40">
            <td className="px-4 py-3 align-middle">
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold">{attendee.attendee_name}</span>
                    <span className="text-xs text-muted-foreground">{attendee.attendee_email}</span>
                    {attendee.attendee_phone && <span className="text-xs text-muted-foreground">{attendee.attendee_phone}</span>}
                </div>
            </td>
            <td className="px-4 py-3 align-middle">
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-bold tracking-tight">{attendee.number}</span>
                    {attendee.ticket && (
                        <span className="text-xs text-muted-foreground">
                            {attendee.ticket.name} ×{attendee.quantity}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 align-middle">
                {attendee.is_checked_in ? (
                    <div className="flex flex-col gap-0.5">
                        <Badge className="w-fit border-2 border-emerald-600 bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-500">
                            <UserCheck className="mr-1 size-3" /> Hadir
                        </Badge>
                        {attendee.checked_in_at && <span className="text-xs text-muted-foreground">{attendee.checked_in_at}</span>}
                    </div>
                ) : (
                    <Badge variant="outline" className="w-fit border-2 border-foreground/40 text-xs font-bold text-muted-foreground">
                        <UserX className="mr-1 size-3" /> Belum Hadir
                    </Badge>
                )}
            </td>
            <td className="px-4 py-3 align-middle text-right">
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={loading}
                    className={`inline-flex items-center gap-1.5 rounded-none border-2 px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50 ${
                        attendee.is_checked_in
                            ? 'border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300'
                            : 'border-foreground bg-background text-foreground hover:bg-foreground hover:text-background'
                    }`}
                >
                    {loading ? (
                        '…'
                    ) : attendee.is_checked_in ? (
                        <>
                            <XCircle className="size-3" /> Batalkan
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="size-3" /> Check-in
                        </>
                    )}
                </button>
            </td>
        </tr>
    );
}

export default function CheckInIndex({ events, selectedEvent, attendees, filters }: Props) {
    setLayoutProps({ breadcrumbs });

    const [search, setSearch] = useState(filters.search ?? '');

    const selectedEventData = events.find((e) => e.id === filters.event_id);

    const applyFilters = (overrides: Partial<typeof filters>) => {
        const params: Record<string, string | number | undefined> = {
            event_id: (overrides.event_id ?? filters.event_id) ?? undefined,
            search: (overrides.search !== undefined ? overrides.search : filters.search) ?? undefined,
            checked_in: overrides.checked_in ?? filters.checked_in,
        };
        if (!params.search) {
            delete params.search;
        }
        if (params.checked_in === 'all') {
            delete params.checked_in;
        }

        router.get(checkInIndex().url, params as Record<string, string>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSelectEvent = (eventId: string) => {
        setSearch('');
        router.get(checkInIndex().url, { event_id: eventId }, { preserveState: false });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const performCheckIn = useCallback(async (orderNumber: string, allowUndo = false): Promise<ScanState> => {
        try {
            const resp = await fetch(checkInScan().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ order_number: orderNumber, allow_undo: allowUndo }),
            });

            const data = await resp.json();

            if (!resp.ok || !data.success) {
                return { status: 'error', message: data.message ?? 'Terjadi kesalahan.' };
            }

            // Refresh the attendee list and event counts in page state
            router.reload({ only: ['attendees', 'events'] });

            return {
                status: 'success',
                action: data.action,
                message: data.message,
                order: data.order as CheckInAttendee,
            };
        } catch {
            return { status: 'error', message: 'Gagal terhubung ke server.' };
        }
    }, []);

    const handleRowToggle = async (orderNumber: string) => {
        await performCheckIn(orderNumber, true);
    };

    const checkedIn = selectedEventData?.checked_in ?? 0;
    const totalOrders = selectedEventData?.total_orders ?? 0;
    const pct = totalOrders > 0 ? Math.round((checkedIn / totalOrders) * 100) : 0;

    return (
        <>
            <Head title="Check-in Absensi" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Check-in Absensi</h1>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Scan QR code dengan kamera atau input nomor order untuk mencatat kehadiran peserta.
                    </p>
                </div>

                {/* Event Selector Dropdown Card */}
                <div className="rounded-xl border-2 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-muted/60">
                                <CalendarDays className="size-4" />
                            </div>
                            <div>
                                <label htmlFor="event-selector" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Pilih Event
                                </label>
                                <p className="text-xs font-medium text-muted-foreground">Tentukan event yang akan dilakukan proses check-in</p>
                            </div>
                        </div>

                        <div className="w-full sm:w-96">
                            {events.length === 0 ? (
                                <div className="rounded-lg border-2 border-dashed border-foreground/30 px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                                    Belum ada event tersedia
                                </div>
                            ) : (
                                <Select value={filters.event_id ? String(filters.event_id) : undefined} onValueChange={handleSelectEvent}>
                                    <SelectTrigger
                                        id="event-selector"
                                        className="h-11 w-full border-2 border-foreground bg-background font-bold shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
                                    >
                                        <SelectValue placeholder="Pilih event untuk memulai check-in…" />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-foreground">
                                        {events.map((event) => (
                                            <SelectItem key={event.id} value={String(event.id)} className="font-semibold">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="truncate">{event.title}</span>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        ({event.checked_in}/{event.total_orders})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {!selectedEvent ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-foreground/30 bg-muted/20 py-20 text-center">
                        <ScanLine className="mb-3 size-12 text-foreground/30" />
                        <h3 className="text-lg font-black">Pilih event terlebih dahulu</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Gunakan dropdown di atas untuk memilih event yang ingin di-check-in.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {/* Event Summary Card */}
                        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex flex-wrap items-center gap-4">
                                <ProgressRing value={checkedIn} max={totalOrders} size={68} />
                                <div className="min-w-0 flex-1">
                                    <h2 className="line-clamp-2 text-lg font-black">{selectedEvent.title}</h2>
                                    <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                                        {selectedEvent.start_date}
                                        {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date
                                            ? ` – ${selectedEvent.end_date}`
                                            : ''}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
                                        <span className="text-emerald-600 dark:text-emerald-400">✓ {checkedIn} Hadir</span>
                                        <span className="text-muted-foreground">{Math.max(0, totalOrders - checkedIn)} Belum Hadir</span>
                                        {/* <span className="font-black">{pct}% Tingkat Kehadiran</span> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scan Panel (Camera + Manual) */}
                        <ScanPanel onCheckIn={performCheckIn} />

                        {/* Attendee List */}
                        <div className="rounded-xl border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            {/* Filter bar */}
                            <div className="border-b-2 border-foreground p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-sm">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari nama, email, no. order…"
                                            className="h-9 border-2 placeholder:text-slate-400 border-foreground/40 pl-9 pr-8 text-sm font-medium focus-visible:border-foreground"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch('');
                                                    applyFilters({ search: '' });
                                                }}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </form>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Filter className="size-3.5 text-muted-foreground" />
                                        {CHECKED_IN_TABS.map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => applyFilters({ checked_in: tab.key })}
                                                className={`rounded-md border-2 px-2.5 py-1 text-xs font-bold transition-all ${
                                                    (filters.checked_in ?? 'all') === tab.key
                                                        ? 'border-foreground bg-foreground text-background'
                                                        : 'border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            {!attendees || attendees.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <UserX className="mb-2 size-10 text-foreground/30" />
                                    <p className="text-sm font-bold">Tidak ada peserta ditemukan</p>
                                    <p className="text-xs text-muted-foreground">Coba ubah filter atau kata kunci pencarian.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="border-b-2 border-foreground/20 bg-muted/40 text-xs font-black uppercase tracking-wider text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3">Peserta</th>
                                                    <th className="px-4 py-3">Order / Tiket</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-2 divide-foreground/10">
                                                {attendees.data.map((attendee) => (
                                                    <AttendeeRow key={attendee.id} attendee={attendee} onToggle={handleRowToggle} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination */}
                                    {attendees.last_page > 1 && (
                                        <div className="flex items-center justify-center gap-2 border-t-2 border-foreground/10 p-4">
                                            {attendees.prev_page_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-2 border-foreground font-bold shadow-2xs"
                                                    onClick={() => router.get(attendees.prev_page_url!)}
                                                >
                                                    ← Sebelumnya
                                                </Button>
                                            )}
                                            <span className="text-sm font-semibold text-muted-foreground">
                                                Halaman {attendees.current_page} dari {attendees.last_page}
                                            </span>
                                            {attendees.next_page_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-2 border-foreground font-bold shadow-2xs"
                                                    onClick={() => router.get(attendees.next_page_url!)}
                                                >
                                                    Selanjutnya →
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
