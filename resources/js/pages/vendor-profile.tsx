import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    PartyPopper,
    ArrowLeft,
    CalendarDays,
    MapPin,
    Star,
    Users,
    Mail,
    Globe,
    Ticket,
    Clock,
    Heart,
    Share2,
    ExternalLink,
    CheckCircle2,
    Sparkles,
    Music,
    Palette,
    GraduationCap,
    Laptop,
    Briefcase,
    Trophy,
    Utensils,
    FolderOpen,
    Plus,
} from 'lucide-react';
import { SocialIcon, getPlatformMeta } from '@/components/social-media-icon';
import { toast } from 'sonner';
import type {
    SocialMediaItem,
    Vendor,
    VendorProfileEvent,
    VendorProfileStats,
    VendorProfileProps as Props,
} from '@/types/event';

function resolveSocialMediaUrl(platform: string, rawUrl: string): string {
    const raw = (rawUrl || '').trim();
    if (!raw) return '#';
    if (/^(?:f|ht)tps?:\/\//i.test(raw)) return raw;

    if (platform === 'whatsapp') {
        const phone = raw.replace(/[^0-9]/g, '');
        const normalized = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
        return `https://wa.me/${normalized}`;
    }

    if (raw.startsWith('@')) {
        const username = raw.slice(1);
        switch (platform) {
            case 'instagram':
                return `https://instagram.com/${username}`;
            case 'tiktok':
                return `https://tiktok.com/@${username}`;
            case 'twitter':
            case 'x':
                return `https://x.com/${username}`;
            case 'facebook':
                return `https://facebook.com/${username}`;
            case 'youtube':
                return `https://youtube.com/@${username}`;
            case 'github':
                return `https://github.com/${username}`;
            case 'telegram':
                return `https://t.me/${username}`;
            default:
                return `https://${username}`;
        }
    }

    return `https://${raw}`;
}

function getCategoryIcon(category?: string | null) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('musik') || cat.includes('music') || cat.includes('konser')) return Music;
    if (cat.includes('design') || cat.includes('seni') || cat.includes('art') || cat.includes('workshop')) return Palette;
    if (cat.includes('edukasi') || cat.includes('pendidikan') || cat.includes('kursus') || cat.includes('seminar')) return GraduationCap;
    if (cat.includes('tech') || cat.includes('coding') || cat.includes('teknologi') || cat.includes('programming')) return Laptop;
    if (cat.includes('bisnis') || cat.includes('karir') || cat.includes('business')) return Briefcase;
    if (cat.includes('olahraga') || cat.includes('sport') || cat.includes('game')) return Trophy;
    if (cat.includes('kuliner') || cat.includes('food')) return Utensils;
    return CalendarDays;
}

function EventCard({
    event,
    isOwner = false,
}: {
    event: VendorProfileEvent;
    isOwner?: boolean;
}) {
    const IconComponent = getCategoryIcon(event.category);
    const isUpcoming = event.isUpcoming;

    return (
        <Card className="group flex flex-col justify-between overflow-hidden border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div>
                {/* Event visual banner */}
                <div
                    className={`relative h-44 overflow-hidden border-b-2 border-foreground ${
                        isUpcoming ? 'bg-secondary/40' : 'bg-muted/60'
                    }`}
                >
                    {event.cover_image ? (
                        <img
                            src={`/storage/${event.cover_image}`}
                            alt={event.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <IconComponent className="size-16 text-foreground/15" />
                        </div>
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <Badge
                            variant={event.status === 'draft' ? 'outline' : isUpcoming ? 'default' : 'secondary'}
                            className="border-2 border-foreground text-xs font-black shadow-2xs"
                        >
                            {event.status === 'draft' ? 'Draft' : isUpcoming ? 'Upcoming' : 'Selesai'}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="border-2 border-foreground text-[10px] font-black uppercase shadow-2xs"
                        >
                            {event.type === 'online' ? 'Online' : 'Offline'}
                        </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                        <Badge
                            variant="outline"
                            className="border-2 border-foreground bg-background/95 text-xs font-bold backdrop-blur-xs shadow-2xs"
                        >
                            {event.category || (event.type === 'online' ? 'Webinar' : 'Acara')}
                        </Badge>
                    </div>
                </div>

                <CardHeader className="pb-2 mt-4">
                    <CardTitle className="line-clamp-2 text-base font-black leading-snug">
                        {event.title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="size-3.5 shrink-0 text-primary" />
                            <span className="font-semibold">{event.date || 'Jadwal segera hadir'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate">{event.location || (event.type === 'online' ? 'Online' : 'Lokasi segera diumumkan')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="size-3.5 shrink-0 text-primary" />
                            <span>
                                {event.attendees > 0
                                    ? `${event.attendees.toLocaleString('id-ID')} kuota peserta`
                                    : 'Peserta umum'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </div>

            <CardContent className="pt-0">
                <Separator className="mb-3 bg-foreground/15" />
                <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-black text-foreground">
                        {event.price}
                    </span>
                    {isOwner ? (
                        <Button
                            size="sm"
                            asChild
                            variant="default"
                            className="border-2 border-foreground text-xs font-bold shadow-2xs"
                        >
                            <Link href={`/vendor/events/${event.id}`}>
                                Kelola Event
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant={isUpcoming ? 'default' : 'outline'}
                            className="border-2 border-foreground text-xs font-bold shadow-2xs"
                            onClick={() => {
                                toast.info(`Event: ${event.title}`, {
                                    description: `Status: ${isUpcoming ? 'Akan Datang' : 'Selesai'} • Tiket: ${event.price}`,
                                });
                            }}
                        >
                            {isUpcoming ? 'Lihat Detail' : 'Selesai'}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function VendorProfile({ vendor, events = [], stats }: Props) {
    const { auth } = usePage().props;
    const isOwner = Boolean(auth.user && (auth.user as any).id === vendor.id);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    const initials = vendor.name
        .split(' ')
        .map((word: string) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const totalEvents = stats?.totalEvents ?? events.length;
    const totalAttendees = stats?.totalAttendees ?? events.reduce((sum, e) => sum + (e.attendees || 0), 0);
    const categoryCount = new Set(events.map((e) => e.category).filter(Boolean)).size;

    const dynamicStats = [
        { label: 'Total Event', value: totalEvents.toString(), icon: CalendarDays },
        { label: 'Total Peserta', value: totalAttendees > 0 ? totalAttendees.toLocaleString('id-ID') : '0', icon: Users },
        { label: 'Rating', value: '5.0', icon: Star },
        { label: 'Kategori', value: categoryCount > 0 ? categoryCount.toString() : '1', icon: Ticket },
    ];

    const upcomingCount = events.filter((e) => e.isUpcoming).length;
    const pastCount = events.filter((e) => !e.isUpcoming && e.status !== 'draft').length;

    const filteredEvents = events.filter((event) => {
        if (filter === 'upcoming') return event.isUpcoming;
        if (filter === 'past') return !event.isUpcoming;
        return true;
    });

    return (
        <>
            <Head title={`${vendor.name} (@${vendor.username})`}>
                <meta
                    name="description"
                    content={`Profil vendor ${vendor.name} di eventoria.id — lihat event dan portofolio mereka.`}
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* ───── TOP BAR ───── */}
                <nav className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur-md">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                        <Link href={home()} className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center border-2 border-foreground bg-primary shadow-xs">
                                <PartyPopper className="size-4 text-primary-foreground" />
                            </div>
                            <span className="font-mono text-lg font-black tracking-tight">eventoria.id</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {/* <Button variant="outline" size="sm" asChild className="border-2 border-foreground text-xs font-bold shadow-xs">
                                <Link href={home()}>
                                    <ArrowLeft data-icon="inline-start" />
                                    Beranda
                                </Link>
                            </Button> */}
                            {auth.user && (
                                <Button size="sm" asChild className="border-2 border-foreground text-xs font-bold shadow-xs">
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ───── HERO PROFILE HEADER ───── */}
                <section className="relative overflow-hidden border-b-2 border-foreground bg-muted/30">
                    {/* Background geometric decorations */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-12 -right-12 size-48 border-2 border-foreground/10 bg-secondary/20 rotate-12" />
                        <div className="absolute -bottom-8 -left-8 size-40 border-2 border-foreground/10 bg-accent/10 -rotate-6" />
                        <div className="absolute top-1/2 right-1/3 size-20 border-2 border-foreground/5 bg-primary/5 rotate-45" />
                    </div>

                    <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 md:py-16">
                        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="flex size-28 items-center justify-center overflow-hidden border-2 border-foreground bg-primary font-mono text-4xl font-black text-primary-foreground shadow-md sm:size-32">
                                    {vendor.avatar ? (
                                        <img
                                            src={vendor.avatar}
                                            alt={vendor.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                {/* Corner decorations */}
                                <div className="absolute -top-2 -left-2 size-4 border-2 border-foreground bg-secondary" />
                                <div className="absolute -bottom-2 -right-2 size-4 border-2 border-foreground bg-accent" />
                                {/* Verified badge */}
                                <div className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center border-2 border-foreground bg-secondary shadow-xs">
                                    <CheckCircle2 className="size-5 text-foreground" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
                                <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                    <Badge variant="secondary" className="border-2 border-foreground px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                                        <Sparkles className="size-3" />
                                        {vendor.role === 'vendor' ? 'Event Organizer' : 'Member'}
                                    </Badge>
                                    <Badge variant="outline" className="border-2 border-foreground px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                                        <CheckCircle2 className="size-3 text-primary" />
                                        Terverifikasi
                                    </Badge>
                                </div>

                                <h1 className="mb-1 text-3xl font-black tracking-tight sm:text-4xl">{vendor.name}</h1>
                                <p className="mb-4 font-mono text-sm font-semibold text-muted-foreground">@{vendor.username}</p>

                                <p className="mb-5 max-w-lg text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                    {vendor.about ||
                                        'Event organizer berpengalaman yang fokus pada pengalaman peserta yang luar biasa. Telah menyelenggarakan berbagai event mulai dari konser musik, workshop kreatif, hingga konferensi teknologi.'}
                                </p>

                                {/* Meta info tags */}
                                <div className="mb-5 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-muted-foreground md:justify-start">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="size-3.5" />
                                        Bergabung {vendor.memberSince}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        Jakarta, Indonesia
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Globe className="size-3.5" />
                                        eventoria.id/{vendor.username}
                                    </span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {vendor.socialMedia && vendor.socialMedia.length > 0 ? (
                                        vendor.socialMedia.map((item, idx) => {
                                            const meta = getPlatformMeta(item.platform);
                                            const label = item.handle?.trim() || meta.label;
                                            const targetUrl = resolveSocialMediaUrl(item.platform, item.url);

                                            return (
                                                <Button
                                                    key={item.id || `${item.platform}-${idx}`}
                                                    variant="outline"
                                                    asChild
                                                    className="border-2 border-foreground font-bold shadow-xs hover:bg-secondary/40 active:translate-x-0.5 active:translate-y-0.5"
                                                >
                                                    <a
                                                        href={targetUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <SocialIcon platform={item.platform} className="size-4" />
                                                        <span>{label}</span>
                                                    </a>
                                                </Button>
                                            );
                                        })
                                    ) : (auth as any)?.user?.id === vendor.id ? (
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="border-2 border-foreground font-bold shadow-xs active:translate-x-0.5 active:translate-y-0.5"
                                        >
                                            <Link href="/settings/social-media" className="flex items-center gap-2">
                                                <Sparkles className="size-4 text-primary" />
                                                <span>+ Tambah Media Sosial</span>
                                            </Link>
                                        </Button>
                                    ) : null}

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-2 border-foreground shadow-xs active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                                        onClick={() => {
                                            if (typeof window !== 'undefined' && navigator.clipboard) {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success('Link profil berhasil disalin ke clipboard!');
                                            }
                                        }}
                                        title="Bagikan Profil"
                                    >
                                        <Share2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ───── STATS BAR ───── */}
                <section className="border-b-2 border-foreground bg-secondary/20">
                    <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4">
                        {dynamicStats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`flex flex-col items-center gap-1 px-4 py-5 ${
                                    index < dynamicStats.length - 1 ? 'border-r-2 border-foreground/15 sm:border-foreground/15' : ''
                                } ${index === 1 ? 'border-r-0 sm:border-r-2' : ''}`}
                            >
                                <stat.icon className="mb-1 size-5 text-primary" />
                                <span className="font-mono text-xl font-black sm:text-2xl">{stat.value}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ───── EVENTS SECTION ───── */}
                <section className="py-12 md:py-16">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Event</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Event yang diselenggarakan oleh {vendor.name}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    variant={filter === 'all' ? 'default' : 'outline'}
                                    className="cursor-pointer border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs hover:bg-secondary/40"
                                    onClick={() => setFilter('all')}
                                >
                                    Semua ({events.length})
                                </Badge>
                                <Badge
                                    variant={filter === 'upcoming' ? 'default' : 'outline'}
                                    className="cursor-pointer border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs hover:bg-secondary/40"
                                    onClick={() => setFilter('upcoming')}
                                >
                                    Upcoming ({upcomingCount})
                                </Badge>
                                <Badge
                                    variant={filter === 'past' ? 'default' : 'outline'}
                                    className="cursor-pointer border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs hover:bg-secondary/40"
                                    onClick={() => setFilter('past')}
                                >
                                    Selesai ({pastCount})
                                </Badge>
                            </div>
                        </div>

                        {filteredEvents.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredEvents.map((event) => (
                                    <EventCard key={event.id} event={event} isOwner={isOwner} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 bg-muted/20 p-12 text-center">
                                <div className="mb-4 flex size-14 items-center justify-center border-2 border-foreground bg-secondary/50 shadow-xs">
                                    <FolderOpen className="size-7 text-foreground" />
                                </div>
                                <h3 className="text-lg font-black tracking-tight">Belum Ada Event</h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    {filter === 'upcoming'
                                        ? 'Saat ini belum ada event mendatang yang terdaftar.'
                                        : filter === 'past'
                                          ? 'Belum ada riwayat event yang telah selesai.'
                                          : `${vendor.name} belum memiliki event yang dipublikasikan.`}
                                </p>
                                {isOwner && (
                                    <Button asChild className="mt-5 border-2 border-foreground font-bold shadow-xs">
                                        <Link href="/vendor/events/create">
                                            <Plus data-icon="inline-start" />
                                            Buat Event Sekarang
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Extra Action Link */}
                        {isOwner ? (
                            <div className="mt-10 flex justify-center">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-2 border-foreground px-8 font-bold shadow-xs hover:bg-secondary/40"
                                >
                                    <Link href="/vendor/events">
                                        Kelola Semua Event di Dashboard
                                        <ExternalLink data-icon="inline-end" />
                                    </Link>
                                </Button>
                            </div>
                        ) : events.length > 6 ? (
                            <div className="mt-10 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="border-2 border-foreground px-8 font-bold shadow-xs hover:bg-secondary/40"
                                    onClick={() => setFilter('all')}
                                >
                                    Lihat Semua Event ({events.length})
                                    <ExternalLink data-icon="inline-end" />
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* ───── ABOUT / SOCIAL ───── */}
                <section className="border-t-2 border-foreground bg-muted/30 py-12 md:py-16">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* About card */}
                            <Card className="border-2 border-foreground shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black">Tentang Organizer</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                                    <p className="leading-relaxed whitespace-pre-line">
                                        {vendor.about ||
                                            'Kami adalah tim event organizer yang berdedikasi untuk menciptakan pengalaman tak terlupakan. Dengan pengalaman lebih dari 5 tahun di industri event, kami telah menyelenggarakan berbagai acara mulai dari konser musik skala besar hingga workshop intim.'}
                                    </p>
                                    {!vendor.about && (
                                        <p className="leading-relaxed">
                                            Fokus kami adalah kualitas, kreativitas, dan kepuasan peserta. Setiap event yang kami selenggarakan dirancang dengan detail untuk memberikan pengalaman terbaik.
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {['Musik', 'Workshop', 'Konferensi', 'Festival', 'Networking'].map((tag) => (
                                            <Badge key={tag} variant="outline" className="border-2 border-foreground text-xs font-bold shadow-2xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick contact card */}
                            <Card className="border-2 border-foreground shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-black">Hubungi Kami</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-3">
                                        <a
                                            href="#"
                                            className="flex items-center gap-3 border-2 border-foreground bg-card p-3 font-semibold shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-secondary/30 hover:shadow-xs"
                                        >
                                            <Mail className="size-4 text-primary" />
                                            <span className="text-sm">contact@{vendor.username}.com</span>
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center gap-3 border-2 border-foreground bg-card p-3 font-semibold shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-secondary/30 hover:shadow-xs"
                                        >
                                            <Globe className="size-4 text-primary" />
                                            <span className="text-sm">www.{vendor.username}.com</span>
                                        </a>
                                    </div>

                                    <Separator className="bg-foreground/15" />

                                    {/* Social-style badges */}
                                    <div className="text-xs font-bold text-muted-foreground">
                                        <p className="mb-2">Juga tersedia di:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Instagram', 'Twitter/X', 'YouTube', 'TikTok'].map((social) => (
                                                <Badge
                                                    key={social}
                                                    variant="secondary"
                                                    className="cursor-pointer border-2 border-foreground shadow-2xs hover:bg-secondary"
                                                >
                                                    {social}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* ───── FOOTER ───── */}
                <footer className="border-t-2 border-foreground bg-muted/50 py-8">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <Link href={home()} className="flex items-center gap-2">
                                <div className="flex size-7 items-center justify-center border-2 border-foreground bg-primary shadow-xs">
                                    <PartyPopper className="size-3.5 text-primary-foreground" />
                                </div>
                                <span className="font-mono text-sm font-black">eventoria.id</span>
                            </Link>
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                <span>&copy; {new Date().getFullYear()} eventoria.id</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    Dibuat dengan <Heart className="size-3 fill-primary text-primary" /> di Indonesia
                                </span>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
