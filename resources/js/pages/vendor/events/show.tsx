import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    ArrowLeft,
    CalendarDays,
    MapPin,
    Monitor,
    Globe,
    Pencil,
    Trash2,
    Ticket,
    Tag,
    Users,
    Clock,
    Mic,
    Building2,
    ExternalLink,
    Lock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ZoomIn,
} from 'lucide-react';
import {
    index as eventsIndex,
    edit as eventsEdit,
    destroy as eventsDestroy,
    show as eventsShow,
} from '@/actions/App/Http/Controllers/Vendor/EventController';
import type { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

type Ticket = {
    id: number; name: string; description: string | null; type: 'free' | 'paid';
    price: string; quota: number | null; sold: number; sale_start: string | null;
    sale_end: string | null; perks: string[] | null; is_active: boolean;
};

type Coupon = {
    id: number; code: string; description: string | null;
    discount_type: 'percentage' | 'fixed'; discount_value: string;
    max_uses: number | null; used_count: number; is_active: boolean;
    valid_from: string | null; valid_until: string | null;
};

type Agenda = {
    id: number; title: string; description: string | null;
    start_time: string; end_time: string | null; speaker_name: string | null; date: string | null;
};

type Speaker = {
    id: number; name: string; title: string | null; company: string | null;
    bio: string | null; linkedin_url: string | null; twitter_url: string | null;
    avatar?: string | null;
};

type Sponsor = {
    id: number; name: string; website_url: string | null;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
    logo?: string | null;
};

type EventDetail = {
    id: number; title: string; slug: string; description: string | null;
    category: string; type: 'online' | 'offline' | 'hybrid';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    start_date: string; end_date: string;
    registration_start: string | null; registration_end: string | null;
    max_attendees: number | null; cover_image: string | null; tags: string[] | null;
    location_name: string | null; location_address: string | null; location_maps_url: string | null;
    online_platform: string | null; online_url: string | null;
    online_url_protected: boolean; online_url_password: string | null;
    tickets: Ticket[];
    coupons: Coupon[];
    agendas: Agenda[];
    speakers: Speaker[];
    sponsors: Sponsor[];
};

type Props = { event: EventDetail };

const STATUS_BADGE: Record<EventDetail['status'], { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'border-foreground bg-muted text-muted-foreground' },
    published: { label: 'Published', className: 'border-emerald-600 bg-emerald-50 text-emerald-700' },
    cancelled: { label: 'Dibatalkan', className: 'border-red-500 bg-red-50 text-red-700' },
    completed: { label: 'Selesai', className: 'border-foreground/40 bg-muted/40 text-muted-foreground' },
};

const TIER_CLASS: Record<Sponsor['tier'], string> = {
    platinum: 'border-sky-300 bg-sky-50 text-sky-800',
    gold: 'border-amber-300 bg-amber-50 text-amber-800',
    silver: 'border-slate-300 bg-slate-100 text-slate-700',
    bronze: 'border-orange-300 bg-orange-50 text-orange-700',
    partner: 'border-violet-300 bg-violet-50 text-violet-700',
};

function formatDateTime(s: string) {
    return new Date(s).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: React.ElementType }) {
    return (
        <div className="flex gap-3">
            <Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                <div className="mt-0.5 text-sm font-semibold">{value}</div>
            </div>
        </div>
    );
}

export default function ShowEvent({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Event', href: eventsIndex().url },
        { title: event.title, href: eventsShow({ event: event.id }).url },
    ];

    setLayoutProps({ breadcrumbs });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const statusCfg = STATUS_BADGE[event.status];
    const isOffline = event.type === 'offline' || event.type === 'hybrid';
    const isOnline = event.type === 'online' || event.type === 'hybrid';

    const handleConfirmDelete = () => {
        setDeleting(true);
        router.delete(eventsDestroy({ event: event.id }).url, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeleting(false);
                toast.success(`Event "${event.title}" berhasil dihapus.`);
            },
            onError: () => {
                setDeleting(false);
                toast.error('Gagal menghapus event.');
            },
        });
    };

    return (
        <>
            <Head title={event.title} />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* ── Header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button asChild variant="outline" size="icon" className="mt-0.5 border-2 border-foreground shadow-xs shrink-0">
                            <Link href={eventsIndex().url}><ArrowLeft className="size-4" /></Link>
                        </Button>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className={`border-2 text-xs font-bold ${statusCfg.className}`}>
                                    {statusCfg.label}
                                </Badge>
                                <Badge variant="outline" className="border-2 border-foreground/40 text-xs font-bold capitalize">
                                    {event.type}
                                </Badge>
                                <Badge variant="outline" className="border border-foreground/30 text-xs font-semibold">
                                    {event.category}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{event.title}</h1>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button asChild variant="outline" className="border-2 border-foreground font-bold shadow-xs">
                            <Link href={eventsEdit({ event: event.id }).url}>
                                <Pencil className="size-4" /> Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="border-2 border-destructive text-destructive font-bold shadow-xs hover:bg-destructive/10"
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={deleting}
                        >
                            <Trash2 className="size-4" /> Hapus
                        </Button>
                    </div>
                </div>

                {/* ── Cover ── */}
                {event.cover_image && (
                    <div
                        className="group relative h-52 w-full cursor-pointer overflow-hidden border-2 border-foreground sm:h-72"
                        onClick={() => setImageModalOpen(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setImageModalOpen(true);
                            }
                        }}
                        title="Klik untuk melihat gambar penuh"
                    >
                        <img
                            src={`/storage/${event.cover_image}`}
                            alt={event.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-[1px]">
                            <span className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-3.5 py-1.5 text-xs font-bold text-foreground shadow-xs">
                                <ZoomIn className="size-4" /> Klik untuk melihat gambar penuh
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Grid layout ── */}
                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Main column */}
                    <div className="flex flex-col gap-5 lg:col-span-2">
                        {/* Description */}
                        {event.description && (
                            <Card className="border-2 border-foreground">
                                <CardHeader><CardTitle className="font-black">Deskripsi</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{event.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Agenda */}
                        {event.agendas.length > 0 && (
                            <Card className="border-2 border-foreground">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-black">
                                        <CalendarDays className="size-5 text-primary" /> Agenda / Rundown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col divide-y divide-foreground/10">
                                        {event.agendas.map((item) => (
                                            <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="w-20 shrink-0 text-right">
                                                    <p className="font-mono text-xs font-black text-primary">{item.start_time?.slice(0, 5)}</p>
                                                    {item.end_time && (
                                                        <p className="font-mono text-xs text-muted-foreground">{item.end_time.slice(0, 5)}</p>
                                                    )}
                                                </div>
                                                <div className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:h-2 before:w-2 before:border-2 before:border-foreground before:bg-primary">
                                                    <p className="font-bold text-sm">{item.title}</p>
                                                    {item.speaker_name && (
                                                        <p className="text-xs text-muted-foreground">{item.speaker_name}</p>
                                                    )}
                                                    {item.description && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Speakers */}
                        {event.speakers.length > 0 && (
                            <Card className="border-2 border-foreground">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-black">
                                        <Mic className="size-5 text-primary" /> Pembicara
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {event.speakers.map((s) => (
                                            <div key={s.id} className="flex gap-3 border-2 border-foreground/20 p-3 bg-muted/5">
                                                {s.avatar ? (
                                                    <img
                                                        src={`/storage/${s.avatar}`}
                                                        alt={s.name}
                                                        className="size-12 shrink-0 border border-foreground/30 object-cover rounded-none"
                                                    />
                                                ) : (
                                                    <div className="flex size-12 shrink-0 items-center justify-center border border-foreground/30 bg-primary/10 text-xs font-black">
                                                        {s.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-black text-sm">{s.name}</p>
                                                    {(s.title || s.company) && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {[s.title, s.company].filter(Boolean).join(' · ')}
                                                        </p>
                                                    )}
                                                    {s.bio && <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{s.bio}</p>}
                                                    <div className="mt-2 flex gap-2">
                                                        {s.linkedin_url && (
                                                            <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                                                                LinkedIn <ExternalLink className="size-2.5" />
                                                            </a>
                                                        )}
                                                        {s.twitter_url && (
                                                            <a href={s.twitter_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                                                                Twitter <ExternalLink className="size-2.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Sponsors */}
                        {event.sponsors.length > 0 && (
                            <Card className="border-2 border-foreground">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-black">
                                        <Building2 className="size-5 text-primary" /> Sponsor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {event.sponsors.map((sp) => (
                                            <div key={sp.id} className={`flex items-center gap-2 border-2 px-3 py-2 ${TIER_CLASS[sp.tier]}`}>
                                                {sp.logo && (
                                                    <img
                                                        src={`/storage/${sp.logo}`}
                                                        alt={sp.name}
                                                        className="size-6 object-contain border border-foreground/20 bg-background/60 p-0.5 shrink-0"
                                                    />
                                                )}
                                                <Badge className={`border text-[10px] font-bold capitalize ${TIER_CLASS[sp.tier]}`}>{sp.tier}</Badge>
                                                <span className="font-bold text-sm">{sp.name}</span>
                                                {sp.website_url && (
                                                    <a href={sp.website_url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="size-3.5 opacity-60 hover:opacity-100" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-5">
                        {/* Event Info */}
                        <Card className="border-2 border-foreground">
                            <CardHeader><CardTitle className="font-black text-base">Informasi Event</CardTitle></CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <InfoRow
                                    icon={Clock}
                                    label="Mulai"
                                    value={formatDateTime(event.start_date)}
                                />
                                <InfoRow
                                    icon={Clock}
                                    label="Selesai"
                                    value={formatDateTime(event.end_date)}
                                />
                                {event.registration_start && (
                                    <InfoRow
                                        icon={CalendarDays}
                                        label="Pendaftaran"
                                        value={
                                            <>
                                                <span className="block">{formatDateTime(event.registration_start)}</span>
                                                {event.registration_end && (
                                                    <span className="block text-muted-foreground">s/d {formatDateTime(event.registration_end)}</span>
                                                )}
                                            </>
                                        }
                                    />
                                )}
                                {event.max_attendees && (
                                    <InfoRow
                                        icon={Users}
                                        label="Kapasitas"
                                        value={`${event.max_attendees.toLocaleString('id-ID')} peserta`}
                                    />
                                )}

                                {isOffline && event.location_name && (
                                    <>
                                        <Separator className="bg-foreground/10" />
                                        <InfoRow
                                            icon={MapPin}
                                            label="Lokasi"
                                            value={
                                                <>
                                                    <span className="block">{event.location_name}</span>
                                                    {event.location_address && (
                                                        <span className="block text-xs text-muted-foreground">{event.location_address}</span>
                                                    )}
                                                    {event.location_maps_url && (
                                                        <a
                                                            href={event.location_maps_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-1 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                                        >
                                                            Buka di Google Maps <ExternalLink className="size-3" />
                                                        </a>
                                                    )}
                                                </>
                                            }
                                        />
                                    </>
                                )}

                                {isOnline && event.online_platform && (
                                    <>
                                        <Separator className="bg-foreground/10" />
                                        <InfoRow
                                            icon={Monitor}
                                            label="Platform Online"
                                            value={
                                                <>
                                                    <span className="capitalize block">{event.online_platform}</span>
                                                    {event.online_url && (
                                                        <a
                                                            href={event.online_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-1 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                                        >
                                                            Buka Link <ExternalLink className="size-3" />
                                                        </a>
                                                    )}
                                                    {event.online_url_protected && (
                                                        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Lock className="size-3" />
                                                            Password: <span className="font-mono font-bold">{event.online_url_password}</span>
                                                        </span>
                                                    )}
                                                </>
                                            }
                                        />
                                    </>
                                )}

                                {event.tags && event.tags.length > 0 && (
                                    <>
                                        <Separator className="bg-foreground/10" />
                                        <div className="flex flex-wrap gap-1.5">
                                            {event.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="border border-foreground/30 text-xs font-semibold">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tickets */}
                        {event.tickets.length > 0 && (
                            <Card className="border-2 border-foreground">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-black text-base">
                                        <Ticket className="size-4 text-primary" /> Tiket ({event.tickets.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col divide-y divide-foreground/10">
                                    {event.tickets.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm">{t.name}</p>
                                                    {t.is_active ? (
                                                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="size-3.5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {t.quota ? `${t.sold}/${t.quota} terjual` : `${t.sold} terjual`}
                                                </p>
                                            </div>
                                            <span className="font-mono font-black text-sm">
                                                {t.type === 'free' ? 'Gratis' : `Rp ${parseFloat(t.price).toLocaleString('id-ID')}`}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Coupons */}
                        {event.coupons.length > 0 && (
                            <Card className="border-2 border-foreground">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-black text-base">
                                        <Tag className="size-4 text-primary" /> Kupon ({event.coupons.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col divide-y divide-foreground/10">
                                    {event.coupons.map((c) => (
                                        <div key={c.id} className="py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-black text-sm">{c.code}</span>
                                                <span className="text-sm font-bold text-primary">
                                                    {c.discount_type === 'percentage'
                                                        ? `${c.discount_value}%`
                                                        : `Rp ${parseFloat(c.discount_value).toLocaleString('id-ID')}`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''} penggunaan
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog Konfirmasi Hapus */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="border-2 border-foreground sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                                <AlertTriangle className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold">Hapus Event</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Tindakan ini tidak dapat dibatalkan.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <p className="text-sm text-foreground/80">
                        Apakah Anda yakin ingin menghapus event <strong className="text-foreground">"{event.title}"</strong>? Seluruh data tiket, kupon, speaker, dan agenda yang berkaitan akan dihapus secara permanen.
                    </p>
                    <DialogFooter className="gap-2">
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

            {/* Modal Gambar Cover Penuh */}
            {event.cover_image && (
                <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                    <DialogContent className="max-w-4xl p-2 sm:p-4 border-2 border-foreground bg-background">
                        <DialogHeader className="p-2 pb-0">
                            <DialogTitle className="text-base font-black truncate pr-6">{event.title}</DialogTitle>
                        </DialogHeader>
                        <div className="relative mt-2 max-h-[75vh] w-full overflow-auto flex items-center justify-center rounded-md border border-foreground/20 bg-muted/30 p-1">
                            <img
                                src={`/storage/${event.cover_image}`}
                                alt={event.title}
                                className="max-h-[72vh] w-auto max-w-full rounded object-contain shadow-xs"
                            />
                        </div>
                        <div className="flex items-center justify-between px-2 pt-2 text-xs">
                            <a
                                href={`/storage/${event.cover_image}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-foreground hover:underline"
                            >
                                <ExternalLink className="size-3.5" /> Buka Tab Baru
                            </a>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
