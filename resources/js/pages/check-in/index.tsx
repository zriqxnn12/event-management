import { Head, router, setLayoutProps } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Filter,
    QrCode,
    RotateCcw,
    Search,
    ScanLine,
    UserCheck,
    UserX,
    X,
    XCircle,
} from 'lucide-react';
import { index as checkInIndex, checkIn as checkInScan } from '@/actions/App/Http/Controllers/CheckInController';
import type { BreadcrumbItem, CheckInIndexProps as Props, CheckInAttendee, CheckInEventOption } from '@/types';

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
    | { status: 'success'; action: 'check_in' | 'undo'; message: string; order: CheckInAttendee }
    | { status: 'error'; message: string };

function ProgressRing({ value, max, size = 60 }: { value: number; max: number; size?: number }) {
    const pct = max > 0 ? Math.min(1, value / max) : 0;
    const r = size / 2 - 6;
    const circ = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/40" />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={5}
                strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                className="text-emerald-500 transition-all duration-500"
                strokeLinecap="round"
            />
        </svg>
    );
}

function EventCard({ event, isSelected, onClick }: {
    event: CheckInEventOption;
    isSelected: boolean;
    onClick: () => void;
}) {
    const pct = event.total_orders > 0 ? Math.round((event.checked_in / event.total_orders) * 100) : 0;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 ${
                isSelected
                    ? 'border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                    : 'border-foreground/30 bg-card hover:border-foreground hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]'
            }`}
        >
            <div className="flex items-start gap-3">
                {event.cover_image ? (
                    <img
                        src={`/storage/${event.cover_image}`}
                        alt={event.title}
                        className="size-12 shrink-0 rounded-lg border-2 border-foreground/20 object-cover"
                    />
                ) : (
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg border-2 ${
                        isSelected ? 'border-background/20 bg-background/10' : 'border-foreground/20 bg-muted/40'
                    }`}>
                        <CalendarDays className="size-6 opacity-40" />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-black">{event.title}</p>
                        <ChevronRight className={`mt-0.5 size-4 shrink-0 opacity-60 ${isSelected ? 'opacity-100' : ''}`} />
                    </div>
                    <p className={`mt-0.5 text-xs font-semibold ${isSelected ? 'opacity-70' : 'text-muted-foreground'}`}>
                        {event.start_date}
                        {event.end_date && event.end_date !== event.start_date && ` – ${event.end_date}`}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1">
                            <div className={`h-1.5 w-full overflow-hidden rounded-full ${isSelected ? 'bg-background/30' : 'bg-muted'}`}>
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                        <span className={`shrink-0 text-xs font-bold ${isSelected ? 'opacity-80' : 'text-muted-foreground'}`}>
                            {event.checked_in}/{event.total_orders}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

function ScanPanel({ selectedEventId, onCheckIn }: {
    selectedEventId: number;
    onCheckIn: (orderNumber: string) => Promise<ScanState>;
}) {
    const [input, setInput] = useState('');
    const [scanState, setScanState] = useState<ScanState>({ status: 'idle' });
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        setScanState({ status: 'loading' });
        const result = await onCheckIn(trimmed);
        setScanState(result);

        if (result.status === 'success') {
            setInput('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleReset = () => {
        setScanState({ status: 'idle' });
        setInput('');
        inputRef.current?.focus();
    };

    return (
        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
            <div className="mb-4 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg border-2 border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                    <ScanLine className="size-4" />
                </div>
                <div>
                    <h3 className="text-sm font-black">Scan / Input Nomor Order</h3>
                    <p className="text-xs text-muted-foreground">Pindai QR code atau ketik nomor order untuk check-in</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <QrCode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="ORD-XXXXXXXXXXXXXXXX"
                        className="h-11 border-2 border-foreground/40 pl-9 font-mono text-sm font-semibold uppercase tracking-wider focus-visible:border-foreground"
                        autoFocus
                        disabled={scanState.status === 'loading'}
                    />
                </div>
                <Button
                    type="submit"
                    className="h-11 border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 dark:shadow-[2px_2px_0px_0px_#fff]"
                    disabled={!input.trim() || scanState.status === 'loading'}
                >
                    {scanState.status === 'loading' ? 'Memeriksa…' : 'Check-in'}
                </Button>
            </form>

            {/* Scan Result */}
            {scanState.status !== 'idle' && scanState.status !== 'loading' && (
                <div className={`mt-4 rounded-xl border-2 p-4 ${
                    scanState.status === 'success' && scanState.action === 'check_in'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                        : scanState.status === 'success' && scanState.action === 'undo'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                            : 'border-destructive bg-destructive/5'
                }`}>
                    <div className="flex items-start gap-3">
                        {scanState.status === 'success' && scanState.action === 'check_in' && (
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        )}
                        {scanState.status === 'success' && scanState.action === 'undo' && (
                            <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                        )}
                        {scanState.status === 'error' && (
                            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold ${
                                scanState.status === 'success' && scanState.action === 'check_in'
                                    ? 'text-emerald-800 dark:text-emerald-200'
                                    : scanState.status === 'success' && scanState.action === 'undo'
                                        ? 'text-amber-800 dark:text-amber-200'
                                        : 'text-destructive'
                            }`}>
                                {scanState.message}
                            </p>
                            {scanState.status === 'success' && (
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                                    <span>No. Order:</span>
                                    <span className="font-mono font-bold text-foreground">{scanState.order.number}</span>
                                    <span>Tiket:</span>
                                    <span className="text-foreground">{scanState.order.ticket?.name ?? '—'} ×{scanState.order.quantity}</span>
                                    <span>Email:</span>
                                    <span className="truncate text-foreground">{scanState.order.attendee_email}</span>
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={handleReset} className="shrink-0 text-muted-foreground hover:text-foreground">
                            <X className="size-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function AttendeeRow({ attendee, onToggle }: {
    attendee: CheckInAttendee;
    onToggle: (orderNumber: string) => void;
}) {
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
                    {attendee.attendee_phone && (
                        <span className="text-xs text-muted-foreground">{attendee.attendee_phone}</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 align-middle">
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-bold tracking-tight">{attendee.number}</span>
                    {attendee.ticket && (
                        <span className="text-xs text-muted-foreground">{attendee.ticket.name} ×{attendee.quantity}</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 align-middle">
                {attendee.is_checked_in ? (
                    <div className="flex flex-col gap-0.5">
                        <Badge className="w-fit border-2 border-emerald-600 bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-500">
                            <UserCheck className="mr-1 size-3" /> Hadir
                        </Badge>
                        {attendee.checked_in_at && (
                            <span className="text-xs text-muted-foreground">{attendee.checked_in_at}</span>
                        )}
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
                    {loading ? '…' : attendee.is_checked_in ? (
                        <><XCircle className="size-3" /> Batalkan</>
                    ) : (
                        <><CheckCircle2 className="size-3" /> Check-in</>
                    )}
                </button>
            </td>
        </tr>
    );
}

export default function CheckInIndex({ events, selectedEvent, attendees, filters, isAdmin }: Props) {
    setLayoutProps({ breadcrumbs });

    const [search, setSearch] = useState(filters.search ?? '');
    const [attendeeList, setAttendeeList] = useState(attendees);

    const selectedEventData = events.find((e) => e.id === filters.event_id);

    const applyFilters = (overrides: Partial<typeof filters>) => {
        const params: Record<string, string | number | undefined> = {
            event_id: overrides.event_id ?? filters.event_id ?? undefined,
            search: overrides.search !== undefined ? overrides.search : (filters.search ?? undefined),
            checked_in: overrides.checked_in ?? filters.checked_in,
        };
        if (!params.search) delete params.search;
        if (params.checked_in === 'all') delete params.checked_in;

        router.get(checkInIndex().url, params as Record<string, string>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSelectEvent = (eventId: number) => {
        setSearch('');
        router.get(checkInIndex().url, { event_id: String(eventId) }, { preserveState: false });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const performCheckIn = async (orderNumber: string): Promise<ScanState> => {
        try {
            const resp = await fetch(checkInScan().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ order_number: orderNumber }),
            });

            const data = await resp.json();

            if (!resp.ok || !data.success) {
                return { status: 'error', message: data.message ?? 'Terjadi kesalahan.' };
            }

            // Refresh the attendee list in page state
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
    };

    const handleRowToggle = async (orderNumber: string) => {
        await performCheckIn(orderNumber);
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
                        Scan QR code atau cari peserta untuk mencatat kehadiran pada event Anda.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT: Event List */}
                    <div className="flex flex-col gap-3 lg:col-span-1">
                        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Pilih Event
                        </h2>
                        <div className="flex max-h-[calc(100vh-14rem)] flex-col gap-2 overflow-y-auto pr-1">
                            {events.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-foreground/30 py-10 text-center">
                                    <CalendarDays className="mx-auto mb-2 size-8 text-foreground/30" />
                                    <p className="text-sm font-semibold text-muted-foreground">Belum ada event</p>
                                </div>
                            ) : (
                                events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        isSelected={filters.event_id === event.id}
                                        onClick={() => handleSelectEvent(event.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Scan + Attendee List */}
                    <div className="flex flex-col gap-5 lg:col-span-2">
                        {!selectedEvent ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-foreground/30 bg-muted/20 py-24 text-center">
                                <ScanLine className="mb-3 size-12 text-foreground/30" />
                                <h3 className="text-lg font-black">Pilih event terlebih dahulu</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Klik salah satu event di sebelah kiri untuk memulai check-in.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Event header + summary */}
                                <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                                    <div className="flex items-start gap-4">
                                        <ProgressRing value={checkedIn} max={totalOrders} size={68} />
                                        <div className="min-w-0 flex-1">
                                            <h2 className="line-clamp-2 text-base font-black">{selectedEvent.title}</h2>
                                            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                                                {selectedEvent.start_date}
                                                {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date
                                                    ? ` – ${selectedEvent.end_date}` : ''}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    ✓ {checkedIn} Hadir
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {totalOrders - checkedIn} Belum Hadir
                                                </span>
                                                <span className="font-black">{pct}% Tingkat Kehadiran</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scan panel */}
                                <ScanPanel
                                    selectedEventId={selectedEvent.id}
                                    onCheckIn={performCheckIn}
                                />

                                {/* Attendee list */}
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
                                                    className="h-9 border-2 border-foreground/40 pl-9 pr-8 text-sm font-semibold focus-visible:border-foreground"
                                                />
                                                {search && (
                                                    <button type="button" onClick={() => { setSearch(''); applyFilters({ search: '' }); }}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                        <X className="size-3.5" />
                                                    </button>
                                                )}
                                            </form>
                                            <div className="flex items-center gap-1.5">
                                                <Filter className="size-3.5 text-muted-foreground" />
                                                {CHECKED_IN_TABS.map((tab) => (
                                                    <button key={tab.key} type="button"
                                                        onClick={() => applyFilters({ checked_in: tab.key })}
                                                        className={`rounded-md border-2 px-2.5 py-1 text-xs font-bold transition-all ${
                                                            (filters.checked_in ?? 'all') === tab.key
                                                                ? 'border-foreground bg-foreground text-background'
                                                                : 'border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground'
                                                        }`}>
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
                                            <p className="text-xs text-muted-foreground">
                                                Coba ubah filter atau kata kunci pencarian.
                                            </p>
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
                                                            <AttendeeRow
                                                                key={attendee.id}
                                                                attendee={attendee}
                                                                onToggle={handleRowToggle}
                                                            />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* Pagination */}
                                            {attendees.last_page > 1 && (
                                                <div className="flex items-center justify-center gap-2 border-t-2 border-foreground/10 p-4">
                                                    {attendees.prev_page_url && (
                                                        <Button variant="outline" size="sm"
                                                            className="border-2 border-foreground font-bold shadow-2xs"
                                                            onClick={() => router.get(attendees.prev_page_url!)}>
                                                            ← Sebelumnya
                                                        </Button>
                                                    )}
                                                    <span className="text-sm font-semibold text-muted-foreground">
                                                        Halaman {attendees.current_page} dari {attendees.last_page}
                                                    </span>
                                                    {attendees.next_page_url && (
                                                        <Button variant="outline" size="sm"
                                                            className="border-2 border-foreground font-bold shadow-2xs"
                                                            onClick={() => router.get(attendees.next_page_url!)}>
                                                            Selanjutnya →
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

