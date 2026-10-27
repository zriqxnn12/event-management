import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    PartyPopper,
    ArrowLeft,
    CalendarDays,
    Clock,
    MapPin,
    Users,
    Ticket,
    Share2,
    ExternalLink,
    CheckCircle2,
    AlertTriangle,
    Shield,
    Sparkles,
    Building2,
    Mic,
    QrCode,
    Calendar,
    Globe,
    Check,
    Layers,
    Tag,
    ChevronRight,
    Info,
    Mail,
    Phone,
} from 'lucide-react';
import { EventCard, getCategoryIcon } from '@/components/event-card';
import { SocialIcon } from '@/components/social-media-icon';
import { toast } from 'sonner';
import type {
    EventDetailPageProps,
    PublicTicket,
    PublicAgenda,
    PublicSpeaker,
    PublicSponsor,
    VendorProfileEvent,
} from '@/types/event';

function capitalize(str?: string | null): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const TIER_BADGES: Record<string, { label: string; className: string }> = {
    platinum: { label: 'Platinum Sponsor', className: 'border-2 border-foreground bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200' },
    gold: { label: 'Gold Sponsor', className: 'border-2 border-foreground bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' },
    silver: { label: 'Silver Sponsor', className: 'border-2 border-foreground bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
    bronze: { label: 'Bronze Sponsor', className: 'border-2 border-foreground bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200' },
    partner: { label: 'Official Partner', className: 'border-2 border-foreground bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200' },
};


export default function EventDetail({
    event,
    vendor,
    otherEvents = [],
    isPreview = false,
}: EventDetailPageProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: number; name: string; email: string } } };
    const CategoryIcon = getCategoryIcon(event.category);

    const [selectedTicket, setSelectedTicket] = useState<PublicTicket | null>(
        event.tickets.find((t) => t.is_active && !t.is_sold_out) || event.tickets[0] || null
    );
    const [ticketQuantity, setTicketQuantity] = useState<number>(1);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Registration Form State
    const [regName, setRegName] = useState(auth?.user?.name || '');
    const [regEmail, setRegEmail] = useState(auth?.user?.email || '');
    const [regPhone, setRegPhone] = useState('');
    const [regNotes, setRegNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const vendorProfileUrl = `/${vendor.username}`;

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: `Ikuti event "${event.title}" yang diselenggarakan oleh ${vendor.name} di eventoria.id!`,
                    url,
                });
                return;
            } catch {
                // fallback to clipboard
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link event berhasil disalin ke clipboard!');
        } catch {
            toast.error('Gagal menyalin link.');
        }
    };

    const scrollToTickets = () => {
        const el = document.getElementById('tickets-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleOpenRegister = (ticket: PublicTicket) => {
        if (!ticket.is_active || ticket.is_sold_out) {
            toast.error('Tiket ini saat ini tidak tersedia.');
            return;
        }
        setSelectedTicket(ticket);
        setIsRegisterModalOpen(true);
    };

    const handleConfirmRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        if (!regName.trim() || !regEmail.trim()) {
            toast.error('Harap lengkapi nama dan email Anda.');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsRegisterModalOpen(false);
            setIsSuccessModalOpen(true);
            toast.success('Pemesanan tiket berhasil diproses!');
        }, 800);
    };

    const activeTickets = event.tickets.filter((t) => t.is_active);
    const hasTickets = activeTickets.length > 0;
    const isOwner = Boolean(auth?.user && auth.user.id === vendor.id);

    return (
        <>
            <Head title={`${event.title} - ${vendor.name}`}>
                <meta
                    name="description"
                    content={event.description?.slice(0, 160) || `Detail acara ${event.title} diselenggarakan oleh ${vendor.name}`}
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground pb-20">
                {/* ───── PREVIEW BANNER (IF DRAFT & VIEWED BY OWNER) ───── */}
                {isPreview && (
                    <div className="border-b-2 border-foreground bg-amber-400 px-4 py-2 text-center text-xs font-black text-black">
                        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span>Mode Pratinjau: Event ini berstatus <strong>DRAFT</strong> dan belum dipublikasikan untuk publik.</span>
                            </div>
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-2 border-foreground bg-background text-foreground font-black shadow-2xs h-7 px-2.5 text-xs"
                            >
                                <Link href={`/vendor/events/${event.id}/edit`}>
                                    Edit Event
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* ───── TOP BAR ───── */}
                <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/95 backdrop-blur-md">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-3">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-2 border-foreground font-bold shadow-2xs hover:bg-muted"
                            >
                                <Link href={vendorProfileUrl}>
                                    <ArrowLeft className="size-4" />
                                    <span className="hidden sm:inline">Profil Vendor</span>
                                </Link>
                            </Button>

                            <Link href={home()} className="hidden md:flex items-center gap-2">
                                <div className="flex size-7 items-center justify-center border-2 border-foreground bg-primary shadow-2xs">
                                    <PartyPopper className="size-3.5 text-primary-foreground" />
                                </div>
                                <span className="font-mono text-sm font-black tracking-tight">eventoria.id</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="border-2 border-foreground font-bold shadow-2xs hover:bg-muted"
                                title="Bagikan Event"
                            >
                                <Share2 className="size-4" />
                                <span className="hidden sm:inline">Bagikan</span>
                            </Button>

                            {hasTickets && (
                                <Button
                                    size="sm"
                                    onClick={scrollToTickets}
                                    className="border-2 border-foreground font-black shadow-2xs"
                                >
                                    <Ticket className="size-4 mr-1.5" />
                                    Beli Tiket
                                </Button>
                            )}

                            {isOwner && (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-foreground font-bold shadow-2xs hidden sm:inline-flex"
                                >
                                    <Link href={`/vendor/events/${event.id}`}>
                                        Kelola
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-8">
                    {/* ───── BREADCRUMBS ───── */}
                    <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Link href={home()} className="hover:text-foreground">Beranda</Link>
                        <ChevronRight className="size-3" />
                        <Link href={vendorProfileUrl} className="hover:text-foreground">@{vendor.username}</Link>
                        <ChevronRight className="size-3" />
                        <span className="truncate text-foreground max-w-[200px] sm:max-w-md">{event.title}</span>
                    </nav>

                    {/* ───── HERO SECTION ───── */}
                    <section className="mb-8 flex flex-col gap-4">
                        {/* Status, Category & Type Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={event.isUpcoming ? 'default' : 'secondary'}
                                className="border-2 border-foreground font-black uppercase tracking-wider shadow-2xs"
                            >
                                {event.isUpcoming ? 'Upcoming Event' : 'Event Selesai'}
                            </Badge>

                            <Badge
                                variant="outline"
                                className="border-2 border-foreground bg-accent/40 text-accent-foreground font-bold shadow-2xs"
                            >
                                <CategoryIcon className="size-3.5 mr-1 text-foreground" />
                                {event.category || 'Event'}
                            </Badge>

                            <Badge
                                variant="secondary"
                                className="border-2 border-foreground font-bold uppercase shadow-2xs"
                            >
                                {event.type === 'online' ? '🌐 Online' : event.type === 'hybrid' ? '⚡ Hybrid' : '📍 Offline'}
                            </Badge>

                            {event.price_display && (
                                <Badge
                                    variant="outline"
                                    className="border-2 border-foreground bg-background font-mono font-black text-foreground shadow-2xs"
                                >
                                    {event.price_display}
                                </Badge>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                            {event.title}
                        </h1>

                        {/* Host snippet */}
                        <div className="flex items-center gap-2.5 text-sm">
                            <span className="text-muted-foreground">Diselenggarakan oleh:</span>
                            <Link
                                href={vendorProfileUrl}
                                className="group flex items-center gap-2 font-black underline-offset-4 hover:underline"
                            >
                                {vendor.avatar ? (
                                    <img
                                        src={vendor.avatar}
                                        alt={vendor.name}
                                        className="size-6 border-2 border-foreground object-cover"
                                    />
                                ) : (
                                    <div className="flex size-6 items-center justify-center border-2 border-foreground bg-primary text-[10px] font-black text-primary-foreground">
                                        {vendor.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span>{vendor.name}</span>
                            </Link>
                        </div>

                        {/* Cover Image */}
                        <div className="relative mt-2 overflow-hidden border-2 border-foreground bg-white shadow-md">
                            {event.cover_image ? (
                                <img
                                    src={`/storage/${event.cover_image}`}
                                    alt={event.title}
                                    className="aspect-video w-full object-contain max-h-[580px]"
                                />
                            ) : (
                                <div className="flex aspect-video max-h-[380px] w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/15">
                                    <div className="flex flex-col items-center gap-3 text-foreground/40">
                                        <CategoryIcon className="size-20" />
                                        <span className="font-mono text-sm font-bold tracking-wider uppercase">
                                            {event.category || 'Eventoria Event'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Key Info Strip Cards */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mt-2">
                            {/* Date */}
                            <div className="flex flex-col justify-center border-2 border-foreground bg-card p-3 sm:p-4 shadow-xs">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 font-semibold">
                                    <CalendarDays className="size-4 text-primary" />
                                    <span>Tanggal</span>
                                </div>
                                <div className="font-black text-sm sm:text-base leading-snug">
                                    {event.date || 'Segera Diumumkan'}
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex flex-col justify-center border-2 border-foreground bg-card p-3 sm:p-4 shadow-xs">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 font-semibold">
                                    <Clock className="size-4 text-primary" />
                                    <span>Waktu</span>
                                </div>
                                <div className="font-black text-sm sm:text-base leading-snug">
                                    {event.time || 'Waktu Fleksibel'}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex flex-col justify-center border-2 border-foreground bg-card p-3 sm:p-4 shadow-xs">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 font-semibold">
                                    <MapPin className="size-4 text-primary" />
                                    <span>Lokasi</span>
                                </div>
                                <div className="font-black text-sm sm:text-base leading-snug truncate" title={event.type === 'online' ? (event.online_platform ? capitalize(event.online_platform) : 'Online') : (event.location_name || 'Offline')}>
                                    {event.type === 'online'
                                        ? (event.online_platform ? capitalize(event.online_platform) : 'Online Meeting')
                                        : (event.location_name || 'Lokasi Acara')}
                                </div>
                            </div>

                            {/* Attendees */}
                            <div className="flex flex-col justify-center border-2 border-foreground bg-card p-3 sm:p-4 shadow-xs">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 font-semibold">
                                    <Users className="size-4 text-primary" />
                                    <span>Kapasitas</span>
                                </div>
                                <div className="font-black text-sm sm:text-base leading-snug">
                                    {event.max_attendees ? `${event.max_attendees.toLocaleString('id-ID')} Kuota` : 'Peserta Umum'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ───── CONTENT GRID (MAIN INFO + SIDEBAR BOOKING) ───── */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* ───── LEFT / MAIN COLUMN ───── */}
                        <div className="flex flex-col gap-8 lg:col-span-8">
                            {/* Description Section */}
                            <Card className="border-2 border-foreground shadow-sm">
                                <CardHeader className="border-b-2 border-foreground bg-muted/30 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg font-black">
                                        <Sparkles className="size-5 text-primary" />
                                        Tentang Acara Ini
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-5">
                                    {event.description ? (
                                        <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line font-medium leading-relaxed">
                                            {event.description}
                                        </div>
                                    ) : (
                                        <p className="italic text-muted-foreground">
                                            Belum ada deskripsi lengkap untuk acara ini.
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {event.tags && event.tags.length > 0 && (
                                        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t-2 border-dashed border-foreground/20">
                                            <Tag className="size-4 text-muted-foreground" />
                                            {event.tags.map((tag, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="border border-foreground text-xs font-bold"
                                                >
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Speakers / Guest Stars Section */}
                            {event.speakers && event.speakers.length > 0 && (
                                <Card className="border-2 border-foreground shadow-sm">
                                    <CardHeader className="border-b-2 border-foreground bg-muted/30 pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg font-black">
                                            <Mic className="size-5 text-primary" />
                                            Guest Stars & Pembicara ({event.speakers.length})
                                        </CardTitle>
                                        <CardDescription className="font-medium text-xs">
                                            Tokoh dan pemateri inspiratif yang akan mengisi acara
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {event.speakers.map((speaker) => (
                                                <div
                                                    key={speaker.id}
                                                    className="flex items-start gap-3.5 border-2 border-foreground bg-card p-3.5 shadow-xs"
                                                >
                                                    {speaker.avatar ? (
                                                        <img
                                                            src={`/storage/${speaker.avatar}`}
                                                            alt={speaker.name}
                                                            className="size-14 border-2 border-foreground object-cover shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="flex size-14 shrink-0 items-center justify-center border-2 border-foreground bg-secondary font-black text-base">
                                                            {speaker.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        <h4 className="font-black text-sm truncate">{speaker.name}</h4>
                                                        {(speaker.title || speaker.company) && (
                                                            <p className="text-xs text-muted-foreground font-semibold truncate">
                                                                {[speaker.title, speaker.company].filter(Boolean).join(' • ')}
                                                            </p>
                                                        )}
                                                        {speaker.bio && (
                                                            <p className="text-xs text-foreground/80 line-clamp-2 mt-1">
                                                                {speaker.bio}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {speaker.linkedin_url && (
                                                                <a
                                                                    href={speaker.linkedin_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                                                                >
                                                                    LinkedIn <ExternalLink className="size-3" />
                                                                </a>
                                                            )}
                                                            {speaker.twitter_url && (
                                                                <a
                                                                    href={speaker.twitter_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                                                                >
                                                                    Twitter/X <ExternalLink className="size-3" />
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

                            {/* Rundown / Agenda Section */}
                            {event.agendas && event.agendas.length > 0 && (
                                <Card className="border-2 border-foreground shadow-sm">
                                    <CardHeader className="border-b-2 border-foreground bg-muted/30 pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg font-black">
                                            <Calendar className="size-5 text-primary" />
                                            Rundown & Agenda Acara
                                        </CardTitle>
                                        <CardDescription className="font-medium text-xs">
                                            Susunan jadwal dan aktivitas selama berlangsungnya acara
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col gap-3">
                                            {event.agendas.map((agenda, index) => (
                                                <div
                                                    key={agenda.id}
                                                    className="relative flex items-start gap-4 border-2 border-foreground bg-card p-3.5 shadow-2xs transition-all hover:bg-muted/20"
                                                >
                                                    <div className="flex flex-col items-center shrink-0 w-20">
                                                        <span className="font-mono text-xs font-black px-2 py-1 border-2 border-foreground bg-primary/20 text-center">
                                                            {agenda.start_time}
                                                            {agenda.end_time ? ` - ${agenda.end_time}` : ''}
                                                        </span>
                                                        {agenda.date && (
                                                            <span className="text-[10px] text-muted-foreground mt-1 font-semibold">
                                                                {agenda.date}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-muted-foreground">#{index + 1}</span>
                                                            <h4 className="font-black text-sm">{agenda.title}</h4>
                                                        </div>
                                                        {agenda.speaker_name && (
                                                            <div className="flex items-center gap-1.5 text-xs text-primary font-bold mt-0.5">
                                                                <Mic className="size-3" />
                                                                <span>{agenda.speaker_name}</span>
                                                            </div>
                                                        )}
                                                        {agenda.description && (
                                                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                                                {agenda.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Location Details / Maps */}
                            <Card className="border-2 border-foreground shadow-sm">
                                <CardHeader className="border-b-2 border-foreground bg-muted/30 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg font-black">
                                        <MapPin className="size-5 text-primary" />
                                        Lokasi & Akses Acara
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-5">
                                    {event.type === 'online' ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3 border-2 border-foreground bg-secondary/30 p-4">
                                                <Globe className="size-8 text-foreground shrink-0" />
                                                <div>
                                                    <h4 className="font-black text-base">
                                                        Diselenggarakan Secara Online
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                                                        Platform: {event.online_platform ? capitalize(event.online_platform) : 'Meeting Online (Zoom / Google Meet)'}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {event.online_url_protected
                                                    ? '🔒 Tautan meeting dilindungi dan akan otomatis dikirimkan ke email terdaftar setelah tiket berhasil didapatkan.'
                                                    : event.online_url
                                                      ? `Tautan akses: ${event.online_url}`
                                                      : 'Tautan meeting akan dibagikan kepada seluruh peserta terdaftar menjelang jadwal acara.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div className="border-2 border-foreground bg-card p-4 shadow-xs">
                                                <h4 className="font-black text-base mb-1">
                                                    {event.location_name || 'Lokasi Acara Offline'}
                                                </h4>
                                                {event.location_address && (
                                                    <p className="text-sm text-muted-foreground font-medium">
                                                        {event.location_address}
                                                    </p>
                                                )}
                                                {event.location_maps_url && (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                        className="mt-3 border-2 border-foreground font-bold shadow-2xs"
                                                    >
                                                        <a
                                                            href={event.location_maps_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1.5"
                                                        >
                                                            <MapPin className="size-4 text-primary" />
                                                            Buka di Google Maps
                                                            <ExternalLink className="size-3" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Sponsors Section */}
                            {event.sponsors && event.sponsors.length > 0 && (
                                <Card className="border-2 border-foreground shadow-sm">
                                    <CardHeader className="border-b-2 border-foreground bg-muted/30 pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg font-black">
                                            <Building2 className="size-5 text-primary" />
                                            Sponsor & Partner Resmi
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                            {event.sponsors.map((sponsor) => {
                                                const tierMeta = TIER_BADGES[sponsor.tier] || TIER_BADGES.partner;
                                                return (
                                                    <div
                                                        key={sponsor.id}
                                                        className="flex flex-col items-center justify-center border-2 border-foreground bg-card p-4 text-center shadow-xs"
                                                    >
                                                        {sponsor.logo ? (
                                                            <img
                                                                src={`/storage/${sponsor.logo}`}
                                                                alt={sponsor.name}
                                                                className="h-12 max-w-[120px] object-contain mb-2"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-28 items-center justify-center border-2 border-dashed border-foreground/30 bg-muted/40 font-mono text-xs font-bold mb-2">
                                                                {sponsor.name}
                                                            </div>
                                                        )}
                                                        <span className="font-black text-sm truncate max-w-full">{sponsor.name}</span>
                                                        <Badge className={`mt-1.5 text-[10px] font-black uppercase ${tierMeta.className}`}>
                                                            {tierMeta.label}
                                                        </Badge>
                                                        {sponsor.website_url && (
                                                            <a
                                                                href={sponsor.website_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-2 text-xs text-primary font-bold hover:underline flex items-center gap-1"
                                                            >
                                                                Website <ExternalLink className="size-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Host / Vendor Card */}
                            <Card className="border-2 border-foreground shadow-md bg-secondary/15">
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                        {vendor.avatar ? (
                                            <img
                                                src={vendor.avatar}
                                                alt={vendor.name}
                                                className="size-16 sm:size-20 border-2 border-foreground object-cover shadow-2xs shrink-0"
                                            />
                                        ) : (
                                            <div className="flex size-16 sm:size-20 shrink-0 items-center justify-center border-2 border-foreground bg-primary font-mono text-2xl font-black text-primary-foreground shadow-2xs">
                                                {vendor.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                                        <h3 className="text-lg font-black">{vendor.name}</h3>
                                                        <CheckCircle2 className="size-4 text-primary" />
                                                    </div>
                                                    <p className="font-mono text-xs text-muted-foreground font-semibold">
                                                        @{vendor.username} • {vendor.role === 'vendor' ? 'Official Organizer' : 'Penyelenggara'}
                                                    </p>
                                                </div>

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="default"
                                                    className="border-2 border-foreground font-bold shadow-2xs self-center sm:self-start"
                                                >
                                                    <Link href={vendorProfileUrl}>
                                                        Kunjungi Profil
                                                    </Link>
                                                </Button>
                                            </div>

                                            {vendor.about && (
                                                <p className="mt-2 text-xs sm:text-sm text-foreground/80 line-clamp-3 font-medium">
                                                    {vendor.about}
                                                </p>
                                            )}

                                            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground font-semibold">
                                                <span>Bergabung: {vendor.memberSince}</span>
                                                <span>•</span>
                                                <span>{vendor.totalEvents} Event Sukses</span>
                                            </div>

                                            {/* Social Media links */}
                                            {vendor.socialMedia && vendor.socialMedia.length > 0 && (
                                                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                    {vendor.socialMedia.map((item, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex size-7 items-center justify-center border border-foreground bg-card text-foreground transition-all hover:bg-muted"
                                                            title={item.platform}
                                                        >
                                                            <SocialIcon platform={item.platform} className="size-3.5" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ───── RIGHT / STICKY BOOKING COLUMN ───── */}
                        <aside className="lg:col-span-4" id="tickets-section">
                            <div className="sticky top-20 flex flex-col gap-4">
                                <Card className="border-2 border-foreground shadow-lg">
                                    <CardHeader className="border-b-2 border-foreground bg-primary/10 pb-4">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className="border-2 border-foreground bg-background font-mono text-xs font-black shadow-2xs"
                                            >
                                                TIKET RESMI
                                            </Badge>
                                            <span className="font-mono text-xs font-bold text-muted-foreground">
                                                {event.isRegistrationOpen ? '🟢 Pendaftaran Dibuka' : '🔴 Pendaftaran Ditutup'}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl font-black mt-2">
                                            Pilih Kategori Tiket
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium">
                                            Tiket digital resmi terbit instan setelah pemesanan.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex flex-col gap-3 pt-5">
                                        {event.tickets && event.tickets.length > 0 ? (
                                            event.tickets.map((ticket) => {
                                                const isSelected = selectedTicket?.id === ticket.id;
                                                const isUnavailable = !ticket.is_active || ticket.is_sold_out;

                                                return (
                                                    <div
                                                        key={ticket.id}
                                                        onClick={() => !isUnavailable && setSelectedTicket(ticket)}
                                                        className={`relative flex flex-col rounded-none border-2 p-3.5 transition-all ${
                                                            isUnavailable
                                                                ? 'border-muted-foreground/30 bg-muted/30 opacity-60 cursor-not-allowed'
                                                                : isSelected
                                                                  ? 'border-foreground bg-primary/10 shadow-sm ring-2 ring-primary cursor-pointer'
                                                                  : 'border-foreground bg-card hover:bg-muted/30 cursor-pointer shadow-2xs'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <h4 className="font-black text-sm">{ticket.name}</h4>
                                                                {ticket.description && (
                                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 font-medium">
                                                                        {ticket.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="font-mono text-sm font-black text-foreground">
                                                                    {ticket.formatted_price}
                                                                </div>
                                                                {ticket.is_sold_out ? (
                                                                    <span className="text-[10px] font-black text-red-600 uppercase">
                                                                        Habis Terjual
                                                                    </span>
                                                                ) : ticket.remaining_quota !== null && ticket.remaining_quota <= 10 ? (
                                                                    <span className="text-[10px] font-black text-amber-600">
                                                                        Sisa {ticket.remaining_quota} tiket!
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>

                                                        {/* Perks */}
                                                        {ticket.perks && ticket.perks.length > 0 && (
                                                            <div className="mt-2.5 flex flex-col gap-1 border-t border-foreground/10 pt-2 text-xs">
                                                                {ticket.perks.map((perk, pIdx) => (
                                                                    <div key={pIdx} className="flex items-center gap-1.5 text-muted-foreground">
                                                                        <Check className="size-3 text-primary shrink-0" />
                                                                        <span className="truncate">{perk}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="mt-3 flex items-center justify-between pt-1">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={isSelected ? 'default' : 'outline'}
                                                                disabled={isUnavailable}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenRegister(ticket);
                                                                }}
                                                                className="w-full border-2 border-foreground text-xs font-black shadow-2xs"
                                                            >
                                                                {isUnavailable
                                                                    ? 'Tidak Tersedia'
                                                                    : ticket.type === 'free'
                                                                      ? 'Daftar Gratis'
                                                                      : `Beli Tiket (${ticket.formatted_price})`}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="border-2 border-dashed border-foreground/30 p-6 text-center text-muted-foreground">
                                                <Ticket className="size-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-xs font-bold">Kategori tiket belum dikonfigurasi oleh penyelenggara.</p>
                                            </div>
                                        )}

                                        <Separator className="my-2 bg-foreground/15" />

                                        {/* Guarantee Notice */}
                                        <div className="flex flex-col gap-2 rounded-none border border-foreground/20 bg-muted/20 p-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2 font-bold text-foreground">
                                                <Shield className="size-4 text-primary" />
                                                <span>Jaminan Transaksi Aman</span>
                                            </div>
                                            <p className="text-[11px] leading-relaxed">
                                                E-tiket dengan QR Code instan akan diterbitkan ke akun Anda dan dikirimkan via email resmi.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </aside>
                    </div>

                    {/* ───── BOTTOM SECTION: MORE EVENTS FROM VENDOR ───── */}
                    {otherEvents.length > 0 && (
                        <section className="mt-16 pt-10 border-t-2 border-foreground">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                                        Event Lainnya dari {vendor.name}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                        Jelajahi agenda dan aktivitas menarik lainnya dari penyelenggara ini
                                    </p>
                                </div>

                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="border-2 border-foreground font-bold shadow-2xs"
                                >
                                    <Link href={vendorProfileUrl}>
                                        Lihat Semua ({vendor.totalEvents})
                                    </Link>
                                </Button>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {otherEvents.map((other) => (
                                    <EventCard
                                        key={other.id}
                                        event={other}
                                        vendorUsername={vendor.username}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* ───── REGISTRATION MODAL / DIALOG ───── */}
                <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                    <DialogContent className="max-w-md border-2 border-foreground shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-black flex items-center gap-2">
                                <Ticket className="size-5 text-primary" />
                                Formulir Pendaftaran Tiket
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium">
                                Konfirmasi data diri Anda untuk pemesanan tiket acara.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedTicket && (
                            <form onSubmit={handleConfirmRegistration} className="flex flex-col gap-4 mt-2">
                                {/* Ticket Selected Summary */}
                                <div className="border-2 border-foreground bg-secondary/30 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-sm">{selectedTicket.name}</span>
                                        <span className="font-mono font-black text-sm">{selectedTicket.formatted_price}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-semibold mt-0.5">
                                        {event.title}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="reg-name" className="text-xs font-bold">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="reg-name"
                                        required
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        placeholder="Nama sesuai identitas"
                                        className="border-2 border-foreground font-medium"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="reg-email" className="text-xs font-bold">
                                        Email Aktif <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        required
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        placeholder="nama@email.com"
                                        className="border-2 border-foreground font-medium"
                                    />
                                    <span className="text-[11px] text-muted-foreground">E-tiket akan dikirimkan ke email ini.</span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="reg-phone" className="text-xs font-bold">
                                        Nomor WhatsApp
                                    </Label>
                                    <Input
                                        id="reg-phone"
                                        type="tel"
                                        value={regPhone}
                                        onChange={(e) => setRegPhone(e.target.value)}
                                        placeholder="081234567890"
                                        className="border-2 border-foreground font-medium"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="reg-notes" className="text-xs font-bold">
                                        Catatan Tambahan (Opsional)
                                    </Label>
                                    <Input
                                        id="reg-notes"
                                        value={regNotes}
                                        onChange={(e) => setRegNotes(e.target.value)}
                                        placeholder="Kebutuhan khusus atau pertanyaan"
                                        className="border-2 border-foreground font-medium"
                                    />
                                </div>

                                <DialogFooter className="mt-2 gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsRegisterModalOpen(false)}
                                        className="border-2 border-foreground font-bold"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="border-2 border-foreground font-black shadow-xs"
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Konfirmasi Pendaftaran'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ───── SUCCESS CONFIRMATION MODAL ───── */}
                <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                    <DialogContent className="max-w-md border-2 border-foreground shadow-2xl text-center">
                        <div className="mx-auto my-2 flex size-14 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-xs">
                            <Check className="size-8 stroke-[3]" />
                        </div>

                        <DialogTitle className="text-xl font-black">
                            Pendaftaran Berhasil!
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground">
                            Terima kasih telah mendaftar. E-tiket resmi Anda telah siap.
                        </DialogDescription>

                        {selectedTicket && (
                            <div className="my-3 border-2 border-foreground bg-card p-4 text-left shadow-xs">
                                <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/20 pb-2 mb-2 font-mono text-xs">
                                    <span className="font-bold">#EVT-{event.id}-{selectedTicket.id}</span>
                                    <span className="font-black text-emerald-600">TERKONFIRMASI</span>
                                </div>
                                <div className="font-black text-base">{event.title}</div>
                                <div className="text-xs text-muted-foreground font-semibold mt-1">
                                    Kategori: {selectedTicket.name} • {selectedTicket.formatted_price}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    Peserta: <strong>{regName}</strong> ({regEmail})
                                </div>
                                <div className="mt-3 flex items-center justify-center border-2 border-foreground bg-muted/40 p-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <QrCode className="size-20" />
                                        <span className="font-mono text-[10px] font-bold text-muted-foreground">SCAN GATE CHECK-IN</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <Button
                                className="w-full border-2 border-foreground font-black"
                                onClick={() => setIsSuccessModalOpen(false)}
                            >
                                Selesai
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
