import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    MapPin,
    Monitor,
    Globe,
    Plus,
    Pencil,
    Trash2,
    Eye,
    Ticket,
    Tag,
    Users,
    Clock,
    MoreVertical,
    X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    index as eventsIndex,
    create as eventsCreate,
    edit as eventsEdit,
    destroy as eventsDestroy,
    show as eventsShow,
} from '@/actions/App/Http/Controllers/Vendor/EventController';
import type { BreadcrumbItem, Event, PaginatedEvents, EventsIndexProps as Props } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Event', href: eventsIndex().url },
];

const STATUS_TABS = [
    { key: 'all', label: 'Semua' },
    { key: 'draft', label: 'Draft' },
    { key: 'published', label: 'Dipublish' },
    { key: 'cancelled', label: 'Dibatalkan' },
    { key: 'completed', label: 'Selesai' },
];

const STATUS_CONFIG = {
    draft: { label: 'Draft', variant: 'secondary' as const, className: '' },
    published: { label: 'Published', variant: 'default' as const, className: 'bg-emerald-500 hover:bg-emerald-500 border-emerald-600' },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, className: '' },
    completed: { label: 'Selesai', variant: 'outline' as const, className: 'text-muted-foreground' },
};

const TYPE_CONFIG = {
    online: { label: 'Online', icon: Monitor, className: 'text-blue-600' },
    offline: { label: 'Offline', icon: MapPin, className: 'text-orange-600' },
    hybrid: { label: 'Hybrid', icon: Globe, className: 'text-violet-600' },
};

function EventTypeIcon({ type }: { type: Event['type'] }) {
    const cfg = TYPE_CONFIG[type];
    return <cfg.icon className={`size-3.5 shrink-0 ${cfg.className}`} />;
}

function EventTableRow({ event }: { event: Event }) {
    const [deleting, setDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const statusCfg = STATUS_CONFIG[event.status];
    const typeCfg = TYPE_CONFIG[event.type];

    const handleConfirmDelete = () => {
        setDeleting(true);
        router.delete(eventsDestroy({ event: event.id }).url, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeleting(false);
                toast.success(`Event "${event.title}" berhasil dihapus.`);
            },
            onError: () => {
                toast.error('Gagal menghapus event.');
                setDeleting(false);
            },
        });
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

    return (
        <>
            <tr className="transition-colors hover:bg-muted/40">
                {/* Event Title & Cover */}
                <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border-2 border-foreground bg-muted/40">
                            {event.cover_image ? (
                                <img
                                    src={`/storage/${event.cover_image}`}
                                    alt={event.title}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center">
                                    <CalendarDays className="size-6 text-foreground/20" />
                                </div>
                            )}
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <Link
                                href={eventsShow({ event: event.id }).url}
                                className="line-clamp-1 font-bold hover:underline"
                                title={event.title}
                            >
                                {event.title}
                            </Link>
                            <span className="text-xs font-semibold text-muted-foreground">
                                {event.category}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Tipe & Lokasi / Platform */}
                <td className="px-4 py-3.5 align-middle">
                    <div className="flex flex-col gap-1">
                        <Badge
                            variant="outline"
                            className="w-fit border-2 border-foreground bg-background/80 text-xs font-bold shadow-2xs backdrop-blur-sm"
                        >
                            <EventTypeIcon type={event.type} />
                            <span className="ml-1">{typeCfg.label}</span>
                        </Badge>
                        {(event.type === 'offline' || event.type === 'hybrid') && event.location_name && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={event.location_name}>
                                <MapPin className="size-3.5 shrink-0 text-orange-600" />
                                <span className="max-w-[180px] truncate">{event.location_name}</span>
                            </div>
                        )}
                        {(event.type === 'online' || event.type === 'hybrid') && event.online_platform && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Monitor className="size-3.5 shrink-0 text-blue-600" />
                                <span className="max-w-[180px] truncate capitalize">{event.online_platform}</span>
                            </div>
                        )}
                        {event.max_attendees && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="size-3 shrink-0" />
                                <span>Maks {event.max_attendees.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </div>
                </td>

                {/* Jadwal */}
                <td className="px-4 py-3.5 align-middle whitespace-nowrap text-xs">
                    <div className="flex items-center gap-1.5 font-semibold">
                        <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                            {formatDate(event.start_date)}
                            {event.start_date !== event.end_date && ` — ${formatDate(event.end_date)}`}
                        </span>
                    </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5 align-middle">
                    <Badge
                        variant={statusCfg.variant}
                        className={`border-2 border-foreground text-xs font-bold shadow-2xs ${statusCfg.className}`}
                    >
                        {statusCfg.label}
                    </Badge>
                </td>

                {/* Tiket & Kupon */}
                <td className="px-4 py-3.5 align-middle text-xs">
                    <div className="flex flex-col gap-1 font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Ticket className="size-3.5 text-foreground/70" />
                            {event.tickets_count} tipe tiket
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Tag className="size-3.5 text-foreground/70" />
                            {event.coupons_count} kupon
                        </span>
                    </div>
                </td>

                {/* Actions (Dropdown Menu) */}
                <td className="px-4 py-3.5 align-middle text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 shrink-0 hover:border-2 hover:border-foreground">
                                <MoreVertical className="size-4" />
                                <span className="sr-only">Menu aksi</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-2 border-foreground">
                            <DropdownMenuItem asChild>
                                <Link href={eventsShow({ event: event.id }).url} className="flex items-center gap-2 font-semibold">
                                    <Eye className="size-4" /> Detail
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={eventsEdit({ event: event.id }).url} className="flex items-center gap-2 font-semibold">
                                    <Pencil className="size-4" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2 font-semibold text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setDeleteDialogOpen(true);
                                }}
                                disabled={deleting}
                            >
                                <Trash2 className="size-4" /> Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Dialog Konfirmasi Hapus */}
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="border-2 border-foreground text-left sm:max-w-md">
                            <DialogHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                                        <AlertTriangle className="size-5" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-base font-bold">Hapus Event</DialogTitle>
                                        <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                                            Tindakan ini tidak dapat dibatalkan.
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <p className="text-sm text-foreground/80">
                                Apakah Anda yakin ingin menghapus event <strong className="text-foreground">"{event.title}"</strong>? Seluruh data tiket, kupon, speaker, dan agenda yang berkaitan akan dihapus secara permanen.
                            </p>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    className="border-2 border-foreground font-bold"
                                    onClick={() => setDeleteDialogOpen(false)}
                                    disabled={deleting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="border-2 border-destructive font-bold"
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Menghapus...' : 'Ya, Hapus Event'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </td>
            </tr>
        </>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-foreground/30 py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center border-2 border-foreground/20 bg-muted/40">
                <CalendarDays className="size-8 text-foreground/30" />
            </div>
            <h3 className="mb-2 text-lg font-black">Belum ada event</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Mulai buat event pertama Anda dan kelola tiket, speaker, agenda, serta kupon promo di satu tempat.
            </p>
            <Button asChild className="border-2 border-foreground font-bold shadow-xs">
                <Link href={eventsCreate().url}>
                    <Plus className="size-4" />
                    Buat Event Pertama
                </Link>
            </Button>
        </div>
    );
}

export default function EventsIndex({ events, filters }: Props) {
    setLayoutProps({ breadcrumbs });
    const { flash } = usePage().props as unknown as { flash?: { success?: string; error?: string } };
    const [dismissedFlash, setDismissedFlash] = useState(false);

    const handleStatusFilter = (status: string) => {
        router.get(eventsIndex().url, { status }, { preserveState: true, replace: true });
    };

    const flashSuccess = !dismissedFlash && flash?.success;
    const flashError = !dismissedFlash && flash?.error;

    return (
        <>
            <Head title="Manajemen Event" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Flash Alert Banner */}
                {flashSuccess && (
                    <Alert className="border-2 border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-200">
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <div className="flex w-full items-center justify-between">
                            <div>
                                <AlertTitle className="font-bold">Berhasil</AlertTitle>
                                <AlertDescription className="text-xs">{flashSuccess}</AlertDescription>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDismissedFlash(true)}
                                className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100"
                                aria-label="Tutup alert"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </Alert>
                )}
                {flashError && (
                    <Alert variant="destructive" className="border-2 border-destructive bg-destructive/10 text-destructive shadow-xs">
                        <AlertTriangle className="size-4" />
                        <div className="flex w-full items-center justify-between">
                            <div>
                                <AlertTitle className="font-bold">Terjadi Kesalahan</AlertTitle>
                                <AlertDescription className="text-xs">{flashError}</AlertDescription>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDismissedFlash(true)}
                                className="text-destructive hover:opacity-80"
                                aria-label="Tutup alert"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </Alert>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Manajemen Event</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola semua event yang Anda selenggarakan ({events.total} total)
                        </p>
                    </div>
                    <Button asChild className="w-fit border-2 border-foreground font-bold shadow-xs">
                        <Link href={eventsCreate().url}>
                            <Plus className="size-4" />
                            Buat Event Baru
                        </Link>
                    </Button>
                </div>

                {/* Status filter tabs */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleStatusFilter(tab.key)}
                            className={`rounded-none border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                                filters.status === tab.key
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {events.data.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="overflow-hidden rounded-lg border-2 border-foreground bg-background shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b-2 border-foreground bg-muted/60 text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5">Event</th>
                                            <th scope="col" className="px-4 py-3.5">Tipe & Lokasi</th>
                                            <th scope="col" className="px-4 py-3.5">Jadwal</th>
                                            <th scope="col" className="px-4 py-3.5">Status</th>
                                            <th scope="col" className="px-4 py-3.5">Tiket / Kupon</th>
                                            <th scope="col" className="px-4 py-3.5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-foreground/10 font-medium">
                                        {events.data.map((event) => (
                                            <EventTableRow key={event.id} event={event} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {events.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {events.prev_page_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-foreground font-bold"
                                        onClick={() => router.get(events.prev_page_url!)}
                                    >
                                        ← Sebelumnya
                                    </Button>
                                )}
                                <span className="text-sm font-semibold text-muted-foreground">
                                    Halaman {events.current_page} dari {events.last_page}
                                </span>
                                {events.next_page_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-foreground font-bold"
                                        onClick={() => router.get(events.next_page_url!)}
                                    >
                                        Selanjutnya →
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs,
};
