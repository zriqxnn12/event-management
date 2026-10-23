import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    CalendarDays,
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
import type { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Event', href: eventsIndex().url },
];

type Event = {
    id: number;
    title: string;
    slug: string;
    category: string;
    type: 'online' | 'offline' | 'hybrid';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    start_date: string;
    end_date: string;
    location_name?: string | null;
    online_platform?: string | null;
    max_attendees?: number | null;
    cover_image?: string | null;
    tickets_count: number;
    coupons_count: number;
};

type PaginatedEvents = {
    data: Event[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

type Props = {
    events: PaginatedEvents;
    filters: { status: string };
};

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

function EventCard({ event }: { event: Event }) {
    const [deleting, setDeleting] = useState(false);
    const statusCfg = STATUS_CONFIG[event.status];
    const typeCfg = TYPE_CONFIG[event.type];

    const handleDelete = () => {
        if (!confirm(`Hapus event "${event.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        setDeleting(true);
        router.delete(eventsDestroy({ event: event.id }).url, {
            onSuccess: () => toast.success(`Event "${event.title}" berhasil dihapus.`),
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
        <Card className="group relative border-2 border-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            {/* Cover */}
            <div className="relative h-40 overflow-hidden border-b-2 border-foreground bg-muted/40">
                {event.cover_image ? (
                    <img
                        src={`/storage/${event.cover_image}`}
                        alt={event.title}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <CalendarDays className="size-16 text-foreground/10" />
                    </div>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge
                        variant={statusCfg.variant}
                        className={`border-2 border-foreground text-xs font-bold shadow-xs ${statusCfg.className}`}
                    >
                        {statusCfg.label}
                    </Badge>
                </div>
                <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="border-2 border-foreground bg-background/90 text-xs font-bold shadow-xs backdrop-blur-sm">
                        <EventTypeIcon type={event.type} />
                        <span className="ml-1">{typeCfg.label}</span>
                    </Badge>
                </div>
            </div>

            <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-black leading-snug">{event.title}</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7 shrink-0">
                                <MoreVertical className="size-4" />
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
                                className="flex items-center gap-2 font-semibold text-destructive focus:text-destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                <Trash2 className="size-4" /> Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Badge variant="outline" className="w-fit border border-foreground/30 text-[10px] font-semibold text-muted-foreground">
                    {event.category}
                </Badge>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 pt-0">
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="size-3.5 shrink-0" />
                        <span className="font-semibold">
                            {formatDate(event.start_date)}
                            {event.start_date !== event.end_date && ` — ${formatDate(event.end_date)}`}
                        </span>
                    </div>
                    {(event.type === 'offline' || event.type === 'hybrid') && event.location_name && (
                        <div className="flex items-center gap-2">
                            <MapPin className="size-3.5 shrink-0 text-orange-600" />
                            <span className="truncate">{event.location_name}</span>
                        </div>
                    )}
                    {(event.type === 'online' || event.type === 'hybrid') && event.online_platform && (
                        <div className="flex items-center gap-2">
                            <Monitor className="size-3.5 shrink-0 text-blue-600" />
                            <span className="truncate capitalize">{event.online_platform}</span>
                        </div>
                    )}
                    {event.max_attendees && (
                        <div className="flex items-center gap-2">
                            <Users className="size-3.5 shrink-0" />
                            <span>Maks {event.max_attendees.toLocaleString('id-ID')} peserta</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Ticket className="size-3.5" /> {event.tickets_count} tipe tiket
                    </span>
                    <span className="flex items-center gap-1">
                        <Tag className="size-3.5" /> {event.coupons_count} kupon
                    </span>
                </div>

                <div className="flex gap-2 pt-1">
                    <Button asChild size="sm" variant="outline" className="flex-1 border-2 border-foreground text-xs font-bold shadow-xs">
                        <Link href={eventsEdit({ event: event.id }).url}>
                            <Pencil className="size-3.5" /> Edit
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 border-2 border-foreground text-xs font-bold shadow-xs">
                        <Link href={eventsShow({ event: event.id }).url}>
                            <Eye className="size-3.5" /> Detail
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
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

    const handleStatusFilter = (status: string) => {
        router.get(eventsIndex().url, { status }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Manajemen Event" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
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

                {/* Grid */}
                {events.data.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {events.data.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
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
