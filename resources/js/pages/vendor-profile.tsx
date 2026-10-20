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
} from 'lucide-react';

type Vendor = {
    id: number;
    name: string;
    username: string;
    role: string;
    memberSince: string;
};

type Props = {
    vendor: Vendor;
};

/** Static placeholder event data for the vendor profile. */
const PLACEHOLDER_EVENTS = [
    {
        id: 1,
        title: 'Neon Nights Music Festival',
        date: '15 Nov 2026',
        location: 'Jakarta Convention Center',
        category: 'Musik',
        categoryIcon: Music,
        attendees: 2400,
        price: 'Rp 150.000',
        status: 'upcoming' as const,
    },
    {
        id: 2,
        title: 'Creative Design Workshop',
        date: '22 Nov 2026',
        location: 'CoHive Mega Kuningan',
        category: 'Workshop',
        categoryIcon: Palette,
        attendees: 120,
        price: 'Rp 75.000',
        status: 'upcoming' as const,
    },
    {
        id: 3,
        title: 'Tech Startup Bootcamp 2026',
        date: '28 Okt 2026',
        location: 'Universitas Indonesia, Depok',
        category: 'Edukasi',
        categoryIcon: GraduationCap,
        attendees: 350,
        price: 'Gratis',
        status: 'past' as const,
    },
];

const STATS = [
    { label: 'Total Event', value: '24', icon: CalendarDays },
    { label: 'Total Peserta', value: '8.500+', icon: Users },
    { label: 'Rating', value: '4.9', icon: Star },
    { label: 'Tiket Terjual', value: '12.000+', icon: Ticket },
];

function EventCard({
    event,
}: {
    event: (typeof PLACEHOLDER_EVENTS)[number];
}) {
    const IconComponent = event.categoryIcon;
    const isUpcoming = event.status === 'upcoming';

    return (
        <Card className="group border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            {/* Event visual banner */}
            <div
                className={`relative h-36 border-b-2 border-foreground ${
                    isUpcoming ? 'bg-secondary/40' : 'bg-muted/60'
                }`}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="size-16 text-foreground/10" />
                </div>
                <div className="absolute top-3 left-3">
                    <Badge
                        variant={isUpcoming ? 'default' : 'secondary'}
                        className="border-2 border-foreground text-xs font-bold shadow-2xs"
                    >
                        {isUpcoming ? 'Upcoming' : 'Selesai'}
                    </Badge>
                </div>
                <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="border-2 border-foreground bg-background text-xs font-bold shadow-2xs">
                        {event.category}
                    </Badge>
                </div>
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2 text-base font-black leading-snug">{event.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 shrink-0" />
                        <span className="font-semibold">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="size-3.5 shrink-0" />
                        <span>{event.attendees.toLocaleString()} peserta</span>
                    </div>
                </div>

                <Separator className="bg-foreground/15" />

                <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black">{event.price}</span>
                    <Button
                        size="sm"
                        variant={isUpcoming ? 'default' : 'outline'}
                        className="border-2 border-foreground text-xs font-bold shadow-2xs"
                    >
                        {isUpcoming ? 'Lihat Detail' : 'Recap'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function VendorProfile({ vendor }: Props) {
    const { auth } = usePage().props;
    const initials = vendor.name
        .split(' ')
        .map((word: string) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

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
                            <Button variant="outline" size="sm" asChild className="border-2 border-foreground text-xs font-bold shadow-xs">
                                <Link href={home()}>
                                    <ArrowLeft data-icon="inline-start" />
                                    Beranda
                                </Link>
                            </Button>
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
                                <div className="flex size-28 items-center justify-center border-2 border-foreground bg-primary font-mono text-4xl font-black text-primary-foreground shadow-md sm:size-32">
                                    {initials}
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

                                <p className="mb-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                                    Event organizer berpengalaman yang fokus pada pengalaman peserta yang luar biasa. Telah menyelenggarakan
                                    berbagai event mulai dari konser musik, workshop kreatif, hingga konferensi teknologi.
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
                                    <Button className="border-2 border-foreground font-bold shadow-sm active:translate-x-0.5 active:translate-y-0.5">
                                        <Mail data-icon="inline-start" />
                                        Hubungi
                                    </Button>
                                    <Button variant="outline" className="border-2 border-foreground font-bold shadow-xs">
                                        <Heart data-icon="inline-start" />
                                        Ikuti
                                    </Button>
                                    <Button variant="outline" size="icon" className="border-2 border-foreground shadow-xs">
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
                        {STATS.map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`flex flex-col items-center gap-1 px-4 py-5 ${
                                    index < STATS.length - 1 ? 'border-r-2 border-foreground/15 sm:border-foreground/15' : ''
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
                                <Badge variant="default" className="cursor-pointer border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs">
                                    Semua
                                </Badge>
                                <Badge variant="outline" className="cursor-pointer border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs hover:bg-secondary/40">
                                    Upcoming
                                </Badge>
                                <Badge variant="outline" className="cursor-pointer border-2 border-foreground px-3 py-1 text-xs font-bold shadow-2xs hover:bg-secondary/40">
                                    Selesai
                                </Badge>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {PLACEHOLDER_EVENTS.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>

                        {/* Load more */}
                        <div className="mt-10 flex justify-center">
                            <Button
                                variant="outline"
                                className="border-2 border-foreground px-8 font-bold shadow-xs hover:bg-secondary/40"
                            >
                                Lihat Semua Event
                                <ExternalLink data-icon="inline-end" />
                            </Button>
                        </div>
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
                                    <p className="leading-relaxed">
                                        Kami adalah tim event organizer yang berdedikasi untuk menciptakan pengalaman tak terlupakan. Dengan
                                        pengalaman lebih dari 5 tahun di industri event, kami telah menyelenggarakan berbagai acara mulai dari
                                        konser musik skala besar hingga workshop intim.
                                    </p>
                                    <p className="leading-relaxed">
                                        Fokus kami adalah kualitas, kreativitas, dan kepuasan peserta. Setiap event yang kami selenggarakan
                                        dirancang dengan detail untuk memberikan pengalaman terbaik.
                                    </p>

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
