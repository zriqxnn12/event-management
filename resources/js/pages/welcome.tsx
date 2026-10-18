import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CalendarDays,
    Users,
    MapPin,
    Ticket,
    Star,
    ArrowRight,
    Sparkles,
    Zap,
    Shield,
    BarChart3,
    Globe,
    Heart,
    ChevronRight,
    Music,
    Palette,
    GraduationCap,
    Dumbbell,
    UtensilsCrossed,
    Briefcase,
    PartyPopper,
    Clock,
    CheckCircle2,
    Menu,
    X,
    Check,
    QrCode,
    TrendingUp,
    Flame,
} from 'lucide-react';
import { type ReactNode, useEffect, useState, useRef } from 'react';

const EVENT_TYPES = [
    { label: 'Konser Musik 🎸', bg: 'bg-secondary text-secondary-foreground', rotate: '-rotate-1' },
    { label: 'Tech Conference 💻', bg: 'bg-primary text-primary-foreground', rotate: 'rotate-1' },
    { label: 'Workshop Kreatif 🎨', bg: 'bg-accent text-accent-foreground', rotate: '-rotate-2' },
    { label: 'Festival Kuliner 🍜', bg: 'bg-secondary text-secondary-foreground', rotate: 'rotate-2' },
    { label: 'Community Meetup ⚡', bg: 'bg-primary text-primary-foreground', rotate: '-rotate-1' },
];

function HeroTicketShowcase() {
    return (
        <div className="relative mx-auto mt-14 max-w-4xl px-2 sm:px-0">
            {/* Floating Satellite 1: Top Left - Transaction Notification */}
            <div className="animate-float-slow absolute -top-7 -left-2 sm:-left-6 z-20 hidden sm:flex items-center gap-3 border-2 border-foreground bg-card p-3 shadow-md -rotate-2">
                <div className="flex size-9 items-center justify-center border-2 border-foreground bg-secondary font-bold">
                    <Check className="size-4 text-foreground" />
                </div>
                <div className="text-left text-xs">
                    <div className="font-mono font-bold text-foreground">Tiket Terjual! (VIP)</div>
                    <div className="text-muted-foreground">Rp 350.000 • Baru saja via QRIS</div>
                </div>
            </div>

            {/* Floating Satellite 2: Bottom Right - Real-time Check-in */}
            <div className="animate-float-reverse absolute -bottom-7 -right-2 sm:-right-6 z-20 hidden sm:flex items-center gap-3 border-2 border-foreground bg-card p-3 shadow-md rotate-2">
                <div className="flex size-9 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground font-bold">
                    <QrCode className="size-4" />
                </div>
                <div className="text-left text-xs">
                    <div className="font-mono font-bold text-foreground">Gate 01 • Validasi Cepat</div>
                    <div className="text-muted-foreground">892 / 1.000 Peserta Hadir (89%)</div>
                </div>
            </div>

            {/* Main Interactive Ticket Stub Container */}
            <div className="group relative border-2 border-foreground bg-card shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden text-left">
                {/* Header Tape / Event Tag */}
                <div className="flex flex-wrap items-center justify-between border-b-2 border-foreground bg-muted/60 px-4 py-2.5 sm:px-6">
                    <div className="flex items-center gap-2">
                        <span className="relative flex size-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-2.5 bg-primary"></span>
                        </span>
                        <span className="font-mono text-xs font-black uppercase tracking-wider text-primary">LIVE SIMULATION</span>
                        <span className="text-xs text-muted-foreground">• #EVT-2026-VIP</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
                        <span className="border border-foreground bg-secondary px-2 py-0.5 shadow-2xs text-secondary-foreground">
                            🔥 FAST SELLING
                        </span>
                        <span className="hidden sm:inline text-muted-foreground">VALIDASI QR INSTAN</span>
                    </div>
                </div>

                {/* Ticket Body: Split into Left Main Info and Right Perforated Stub */}
                <div className="grid md:grid-cols-3">
                    {/* Left 2 Cols: Event Info & Stats */}
                    <div className="p-5 sm:p-7 md:col-span-2 md:border-r-2 md:border-dashed md:border-foreground relative">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="border-2 border-foreground bg-primary px-2.5 py-0.5 text-xs font-black uppercase text-primary-foreground">
                                Konser & Festival
                            </span>
                            <span className="border-2 border-foreground bg-accent px-2.5 py-0.5 text-xs font-black uppercase text-accent-foreground">
                                VIP ACCESS
                            </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mb-2">
                            NUSANTARA SOUNDWAVE & TECH 2026
                        </h3>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4 font-mono text-xs text-muted-foreground border-y-2 border-foreground/10 py-3">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="size-4 shrink-0 text-primary" />
                                <div>
                                    <div className="font-bold text-foreground">28 Okt 2026</div>
                                    <div className="text-[11px]">16:00 - Selesai WIB</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 shrink-0 text-primary" />
                                <div>
                                    <div className="font-bold text-foreground">GBK Senayan</div>
                                    <div className="text-[11px]">Jakarta Pusat</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar with Ticket Count */}
                        <div>
                            <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <TrendingUp className="size-3.5 text-primary" />
                                    <span>Penjualan Tiket</span>
                                </span>
                                <span className="text-primary font-black">890 / 1.000 Terjual (89%)</span>
                            </div>
                            <div className="h-4 w-full border-2 border-foreground bg-muted overflow-hidden p-0.5">
                                <div className="h-full bg-primary transition-all duration-500 w-[89%]" />
                            </div>
                        </div>

                        {/* Attendee Avatars Stack */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    <div className="flex size-7 items-center justify-center border-2 border-foreground bg-secondary font-black text-[11px] text-secondary-foreground">
                                        RA
                                    </div>
                                    <div className="flex size-7 items-center justify-center border-2 border-foreground bg-accent font-black text-[11px] text-accent-foreground">
                                        BK
                                    </div>
                                    <div className="flex size-7 items-center justify-center border-2 border-foreground bg-primary font-black text-[11px] text-primary-foreground">
                                        DL
                                    </div>
                                    <div className="flex size-7 items-center justify-center border-2 border-foreground bg-background font-black text-[10px]">
                                        +4k
                                    </div>
                                </div>
                                <span className="font-semibold text-muted-foreground text-[11px] sm:text-xs">
                                    1.420+ orang sudah pesan
                                </span>
                            </div>
                            <div className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" />
                                E-Ticket Langsung Dikirim
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Scannable Stub */}
                    <div className="flex flex-col items-center justify-between bg-muted/40 p-5 sm:p-6 text-center border-t-2 md:border-t-0 border-dashed border-foreground">
                        <div className="w-full">
                            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                                PASS IDENTIFIER
                            </div>
                            <div className="font-mono text-sm font-black border-2 border-foreground bg-secondary py-1 px-2.5 shadow-2xs inline-block mb-3 text-secondary-foreground">
                                GATE A • ROW 04
                            </div>
                        </div>

                        {/* QR Code Mockup */}
                        <div className="relative my-2 p-2.5 border-2 border-foreground bg-background shadow-xs group-hover:scale-105 transition-transform duration-200">
                            <QrCode className="size-24 sm:size-28 text-foreground" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-background/85">
                                <span className="font-mono text-[10px] font-black border border-foreground bg-primary text-primary-foreground px-1.5 py-0.5">
                                    VALID SCAN
                                </span>
                            </div>
                        </div>

                        <div className="w-full mt-2">
                            {/* Barcode line simulation */}
                            <div className="flex justify-center items-end gap-1 h-6 px-4 mb-1 opacity-70">
                                <div className="w-1 h-full bg-foreground" />
                                <div className="w-0.5 h-full bg-foreground" />
                                <div className="w-1.5 h-full bg-foreground" />
                                <div className="w-0.5 h-3 bg-foreground" />
                                <div className="w-2 h-full bg-foreground" />
                                <div className="w-0.5 h-4 bg-foreground" />
                                <div className="w-1 h-full bg-foreground" />
                                <div className="w-1.5 h-full bg-foreground" />
                                <div className="w-0.5 h-full bg-foreground" />
                                <div className="w-2 h-full bg-foreground" />
                                <div className="w-0.5 h-4 bg-foreground" />
                                <div className="w-1 h-full bg-foreground" />
                            </div>
                            <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                                TAP / SCAN DI PINTU MASUK
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function AnimatedCounter({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const duration = 2000;
                    const step = (timestamp: number) => {
                        if (!start) start = timestamp;
                        const progress = Math.min((timestamp - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end));
                        if (progress < 1) {
                            requestAnimationFrame(step);
                        }
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.5 },
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, hasAnimated]);

    return (
        <div ref={ref} className="text-center">
            <div className="font-mono text-4xl font-black md:text-5xl">
                {count.toLocaleString()}
                {suffix}
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <Card className="group border-2 border-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground shadow-sm">
                    {icon}
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
        </Card>
    );
}

function CategoryCard({ icon, name, count }: { icon: ReactNode; name: string; count: string }) {
    return (
        <div className="group flex cursor-pointer items-center gap-4 border-2 border-foreground bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:shadow-md">
            <div className="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-background">{icon}</div>
            <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{name}</div>
                <div className="text-sm text-muted-foreground">{count} events</div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
    );
}

function TestimonialCard({ quote, name, role, rating }: { quote: string; name: string; role: string; rating: number }) {
    return (
        <Card className="border-2 border-foreground">
            <CardContent className="pt-6">
                <div className="mb-4 flex gap-1">
                    {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-secondary text-secondary" />
                    ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed italic text-muted-foreground">"{quote}"</p>
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center border-2 border-foreground bg-primary font-bold text-primary-foreground">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-semibold">{name}</div>
                        <div className="text-xs text-muted-foreground">{role}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
    return (
        <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex size-14 items-center justify-center border-2 border-foreground bg-primary font-mono text-2xl font-black text-primary-foreground shadow-sm">
                {step}
            </div>
            <h3 className="mb-2 text-lg font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [scrollY, setScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [eventIndex, setEventIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setEventIndex((prev) => (prev + 1) % EVENT_TYPES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const isNavSolid = scrollY > 40 || mobileMenuOpen;

    return (
        <>
            <Head title="Platform Event Management Terbaik">
                <meta
                    name="description"
                    content="eventoria.id — Platform event management terbaik di Indonesia. Kelola, buat, dan temukan event seru dengan mudah."
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* ───── NAVBAR ───── */}
                <nav
                    className={`fixed top-0 right-0 left-0 z-50 transition-all duration-200 ${
                        isNavSolid
                            ? 'border-b-2 border-foreground bg-background/95 shadow-sm backdrop-blur-md'
                            : 'bg-transparent'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                            <div className="flex size-8 sm:size-9 items-center justify-center border-2 border-foreground bg-primary shadow-xs sm:shadow-sm">
                                <PartyPopper className="size-4 sm:size-5 text-primary-foreground" />
                            </div>
                            <span className="font-mono text-lg sm:text-xl font-black tracking-tight">eventoria.id</span>
                        </Link>

                        {/* Desktop Links (PC / Laptop) */}
                        <div className="hidden items-center gap-1 lg:gap-2 md:flex">
                            <a href="#features" className="px-3 py-1.5 text-sm font-semibold transition-colors hover:text-primary">
                                Fitur
                            </a>
                            <a href="#categories" className="px-3 py-1.5 text-sm font-semibold transition-colors hover:text-primary">
                                Kategori
                            </a>
                            <a href="#how-it-works" className="px-3 py-1.5 text-sm font-semibold transition-colors hover:text-primary">
                                Cara Kerja
                            </a>
                            <a href="#testimonials" className="px-3 py-1.5 text-sm font-semibold transition-colors hover:text-primary">
                                Testimoni
                            </a>
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="hidden items-center gap-2 md:flex">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        Dashboard
                                        <ArrowRight data-icon="inline-end" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={register()}>
                                            Daftar Gratis
                                            <Sparkles data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile & Tablet Controls */}
                        <div className="flex items-center gap-2 md:hidden">
                            {auth.user ? (
                                <Button size="sm" asChild className="border-2 border-foreground shadow-xs text-xs font-bold px-3">
                                    <Link href={dashboard()}>
                                        Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="sm" asChild className="border-2 border-foreground shadow-xs text-xs font-bold px-3">
                                    <Link href={register()}>
                                        Daftar
                                    </Link>
                                </Button>
                            )}

                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex size-9 items-center justify-center border-2 border-foreground bg-background shadow-xs transition-transform active:translate-x-0.5 active:translate-y-0.5 hover:bg-secondary cursor-pointer"
                                aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                            >
                                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Dropdown Menu (Neo-brutalism style) */}
                    {mobileMenuOpen && (
                        <div className="border-t-2 border-foreground bg-background px-4 py-5 shadow-lg md:hidden animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col gap-2">
                                <a
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between border-2 border-foreground bg-card p-3 font-bold transition-all hover:translate-x-1 hover:bg-secondary shadow-xs"
                                >
                                    <span>Fitur Unggulan</span>
                                    <ChevronRight className="size-4" />
                                </a>
                                <a
                                    href="#categories"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between border-2 border-foreground bg-card p-3 font-bold transition-all hover:translate-x-1 hover:bg-secondary shadow-xs"
                                >
                                    <span>Kategori Event</span>
                                    <ChevronRight className="size-4" />
                                </a>
                                <a
                                    href="#how-it-works"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between border-2 border-foreground bg-card p-3 font-bold transition-all hover:translate-x-1 hover:bg-secondary shadow-xs"
                                >
                                    <span>Cara Kerja</span>
                                    <ChevronRight className="size-4" />
                                </a>
                                <a
                                    href="#testimonials"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between border-2 border-foreground bg-card p-3 font-bold transition-all hover:translate-x-1 hover:bg-secondary shadow-xs"
                                >
                                    <span>Testimoni</span>
                                    <ChevronRight className="size-4" />
                                </a>

                                <div className="mt-2 border-t-2 border-foreground/20 pt-3">
                                    {auth.user ? (
                                        <Button asChild size="lg" className="w-full border-2 border-foreground font-bold shadow-sm">
                                            <Link href={dashboard()} onClick={() => setMobileMenuOpen(false)}>
                                                Buka Dashboard
                                                <ArrowRight data-icon="inline-end" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                asChild
                                                className="w-full border-2 border-foreground font-bold shadow-xs hover:bg-muted"
                                            >
                                                <Link href={login()} onClick={() => setMobileMenuOpen(false)}>
                                                    Masuk
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                size="lg"
                                                className="w-full border-2 border-foreground font-bold shadow-xs"
                                            >
                                                <Link href={register()} onClick={() => setMobileMenuOpen(false)}>
                                                    Daftar Gratis
                                                    <Sparkles data-icon="inline-end" />
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* ───── HERO ───── */}
                <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
                    {/* Background Pattern & Decorative Elements */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {/* Dot Matrix Pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(#00000015_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#ffffff15_1.2px,transparent_1.2px)] [background-size:20px_20px]" />

                        {/* Retro Starbursts */}
                        <div className="absolute top-24 left-1/4 size-7 text-foreground/15 hidden md:block">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                            </svg>
                        </div>
                        <div className="absolute top-1/2 right-12 size-8 text-secondary/80 hidden md:block">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                            </svg>
                        </div>
                        <div className="absolute bottom-20 left-10 size-6 text-primary/40 hidden md:block">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Floating Neobrutalist Badges */}
                    <div className="hidden lg:flex items-center gap-2 border-2 border-foreground bg-secondary px-3.5 py-1.5 font-mono text-xs font-black shadow-md -rotate-6 animate-float-slow absolute top-32 left-6 xl:left-16 z-10 text-secondary-foreground">
                        <Zap className="size-4 fill-foreground" />
                        <span>100% UNTUK ORGANIZER</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 border-2 border-foreground bg-accent text-accent-foreground px-3.5 py-1.5 font-mono text-xs font-black shadow-md rotate-6 animate-float-reverse absolute top-40 right-6 xl:right-16 z-10">
                        <QrCode className="size-4" />
                        <span>INSTANT QR SCANNER</span>
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="mx-auto max-w-4xl text-center">
                            {/* Live Badge */}
                            <div className="inline-flex items-center gap-2.5 border-2 border-foreground bg-background px-3.5 py-1.5 text-xs font-bold shadow-xs mb-6">
                                <span className="relative flex size-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full size-2.5 bg-emerald-600"></span>
                                </span>
                                <span className="font-mono uppercase tracking-wider text-[11px] sm:text-xs">
                                    Platform Event #1 di Indonesia
                                </span>
                                <Badge variant="secondary" className="border border-foreground py-0 px-1.5 text-[10px] font-black uppercase text-secondary-foreground">
                                    v2.0
                                </Badge>
                            </div>

                            {/* Headline with animated cycling word */}
                            <h1 className="mb-6 text-4xl leading-[1.08] font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                                Kelola & Rayakan
                                <br />
                                <span className="relative inline-block my-1.5 sm:my-2">
                                    <span
                                        key={eventIndex}
                                        className={`inline-block border-2 border-foreground px-3 py-1 sm:px-5 sm:py-2 text-2xl sm:text-5xl md:text-6xl lg:text-7xl shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 ${EVENT_TYPES[eventIndex].bg} ${EVENT_TYPES[eventIndex].rotate}`}
                                    >
                                        {EVENT_TYPES[eventIndex].label}
                                    </span>
                                </span>
                                <br />
                                <span className="relative inline-block mt-1">
                                    <span className="relative z-10">Jadi Luar Biasa.</span>
                                    <span className="absolute bottom-1.5 left-0 -z-0 h-3 sm:h-5 w-full bg-secondary -rotate-1" />
                                </span>
                            </h1>

                            <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
                                Dari konser musik hingga workshop kreatif — buat event, jual tiket dengan sistem QR code instan, dan pantau kehadiran peserta secara real-time.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    asChild
                                    className="group border-2 border-foreground text-base font-black shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0.5 active:shadow-xs"
                                >
                                    <Link href={register()}>
                                        Mulai Sekarang — Gratis
                                        <ArrowRight className="transition-transform group-hover:translate-x-1" data-icon="inline-end" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    className="border-2 border-foreground bg-background text-base font-bold shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-secondary hover:text-secondary-foreground hover:shadow-md active:translate-y-0.5 active:shadow-xs"
                                >
                                    <a href="#features">
                                        <Ticket className="size-4 mr-1 text-primary" />
                                        Lihat Fitur Unggulan
                                        <ChevronRight data-icon="inline-end" />
                                    </a>
                                </Button>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center gap-2 border border-foreground/30 bg-background px-3 py-1 font-mono font-bold shadow-2xs">
                                    <CheckCircle2 className="size-3.5 text-primary" />
                                    <span>Gratis Selamanya</span>
                                </div>
                                <div className="flex items-center gap-2 border border-foreground/30 bg-background px-3 py-1 font-mono font-bold shadow-2xs">
                                    <CheckCircle2 className="size-3.5 text-primary" />
                                    <span>Setup 5 Menit</span>
                                </div>
                                <div className="flex items-center gap-2 border border-foreground/30 bg-background px-3 py-1 font-mono font-bold shadow-2xs">
                                    <CheckCircle2 className="size-3.5 text-primary" />
                                    <span>Tanpa Kartu Kredit</span>
                                </div>
                            </div>

                            {/* Realistic Product Showcase: Event Pass & Live Simulator */}
                            <HeroTicketShowcase />
                        </div>
                    </div>
                </section>

                {/* ───── MARQUEE TICKER ───── */}
                <div className="border-y-2 border-foreground bg-secondary py-3 overflow-hidden select-none">
                    <div className="animate-marquee font-mono text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-8 text-secondary-foreground">
                        <span>⚡ SISTEM TIKET QR OTOMATIS</span>
                        <span>•</span>
                        <span>🎸 DUKUNG SEMUA KATEGORI EVENT</span>
                        <span>•</span>
                        <span>💳 PEMBAYARAN CEPAT QRIS & VA</span>
                        <span>•</span>
                        <span>📊 REAL-TIME ATTENDEE ANALYTICS</span>
                        <span>•</span>
                        <span>🎟️ EARLY BIRD, REGULAR & VIP TIER</span>
                        <span>•</span>
                        <span>🚀 SETUP EVENT DALAM 5 MENIT</span>
                        <span>•</span>
                        <span>⚡ SISTEM TIKET QR OTOMATIS</span>
                        <span>•</span>
                        <span>🎸 DUKUNG SEMUA KATEGORI EVENT</span>
                        <span>•</span>
                        <span>💳 PEMBAYARAN CEPAT QRIS & VA</span>
                        <span>•</span>
                        <span>📊 REAL-TIME ATTENDEE ANALYTICS</span>
                        <span>•</span>
                        <span>🎟️ EARLY BIRD, REGULAR & VIP TIER</span>
                        <span>•</span>
                        <span>🚀 SETUP EVENT DALAM 5 MENIT</span>
                        <span>•</span>
                    </div>
                </div>


                {/* ───── STATS ───── */}
                <section className="border-y-2 border-foreground bg-secondary/30 py-16">
                    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
                        <AnimatedCounter end={12500} label="Event Dibuat" suffix="+" />
                        <AnimatedCounter end={850} label="Organizer Aktif" suffix="+" />
                        <AnimatedCounter end={250000} label="Tiket Terjual" suffix="+" />
                        <AnimatedCounter end={98} label="Kepuasan" suffix="%" />
                    </div>
                </section>

                {/* ───── FEATURES ───── */}
                <section id="features" className="py-20 md:py-28">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 border-2 border-foreground px-3 py-1 font-bold">
                                <Sparkles className="size-3.5" />
                                Fitur Unggulan
                            </Badge>
                            <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
                                Semua yang Kamu Butuhkan
                            </h2>
                            <p className="text-muted-foreground">
                                Tools lengkap untuk membuat, mengelola, dan mempromosikan event kamu ke level berikutnya.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<CalendarDays className="size-6" />}
                                title="Manajemen Event"
                                description="Buat dan kelola event dengan dashboard intuitif. Atur jadwal, lokasi, dan detail event dalam hitungan menit."
                            />
                            <FeatureCard
                                icon={<Ticket className="size-6" />}
                                title="Ticketing Pintar"
                                description="Sistem tiket yang fleksibel — dari tiket gratis, berbayar, hingga early bird. Dengan QR code dan validasi real-time."
                            />
                            <FeatureCard
                                icon={<Users className="size-6" />}
                                title="Manajemen Peserta"
                                description="Lacak pendaftaran, kehadiran, dan interaksi peserta. Export data ke CSV atau Google Sheets kapan saja."
                            />
                            <FeatureCard
                                icon={<BarChart3 className="size-6" />}
                                title="Analitik Real-time"
                                description="Dashboard analitik yang menampilkan penjualan tiket, demografi peserta, dan performa event secara real-time."
                            />
                            <FeatureCard
                                icon={<Shield className="size-6" />}
                                title="Keamanan Terjamin"
                                description="Proteksi data end-to-end, pembayaran aman via payment gateway terpercaya, dan verifikasi peserta berlapis."
                            />
                            <FeatureCard
                                icon={<Globe className="size-6" />}
                                title="Promosi & Jangkauan"
                                description="Bagikan event ke media sosial, embed di website, dan jangkau lebih banyak audience dengan tools promosi built-in."
                            />
                        </div>
                    </div>
                </section>

                {/* ───── CATEGORIES ───── */}
                <section id="categories" className="border-y-2 border-foreground bg-muted/50 py-20 md:py-28">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 border-2 border-foreground px-3 py-1 font-bold">
                                <Heart className="size-3.5" />
                                Kategori Event
                            </Badge>
                            <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
                                Event Untuk Semua
                            </h2>
                            <p className="text-muted-foreground">
                                Apapun jenis event kamu, kami siap mendukung kesuksesannya.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <CategoryCard icon={<Music className="size-5" />} name="Musik & Konser" count="3,200" />
                            <CategoryCard icon={<Palette className="size-5" />} name="Seni & Budaya" count="1,800" />
                            <CategoryCard icon={<GraduationCap className="size-5" />} name="Edukasi & Workshop" count="2,500" />
                            <CategoryCard icon={<Dumbbell className="size-5" />} name="Olahraga & Fitness" count="1,200" />
                            <CategoryCard icon={<UtensilsCrossed className="size-5" />} name="Food & Culinary" count="900" />
                            <CategoryCard icon={<Briefcase className="size-5" />} name="Bisnis & Networking" count="1,600" />
                            <CategoryCard icon={<PartyPopper className="size-5" />} name="Festival & Fair" count="800" />
                            <CategoryCard icon={<Sparkles className="size-5" />} name="Komunitas" count="2,100" />
                        </div>
                    </div>
                </section>

                {/* ───── HOW IT WORKS ───── */}
                <section id="how-it-works" className="py-20 md:py-28">
                    <div className="mx-auto max-w-5xl px-6">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 border-2 border-foreground px-3 py-1 font-bold">
                                <Clock className="size-3.5" />
                                Cara Kerja
                            </Badge>
                            <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
                                3 Langkah Mudah
                            </h2>
                            <p className="text-muted-foreground">
                                Dari ide hingga event sukses — semudah 1, 2, 3.
                            </p>
                        </div>

                        <div className="grid gap-12 md:grid-cols-3">
                            <StepCard
                                step={1}
                                title="Buat Event"
                                description="Isi detail event, atur tiket dan harga, pilih tanggal dan lokasi. Selesai dalam 5 menit!"
                            />
                            <StepCard
                                step={2}
                                title="Promosikan"
                                description="Bagikan halaman event ke media sosial, embed di website, atau kirim undangan langsung."
                            />
                            <StepCard
                                step={3}
                                title="Kelola & Nikmati"
                                description="Pantau penjualan tiket real-time, kelola peserta, dan nikmati event yang sukses."
                            />
                        </div>
                    </div>
                </section>

                {/* ───── TESTIMONIALS ───── */}
                <section id="testimonials" className="border-y-2 border-foreground bg-muted/50 py-20 md:py-28">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 border-2 border-foreground px-3 py-1 font-bold">
                                <Star className="size-3.5" />
                                Testimoni
                            </Badge>
                            <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
                                Dipercaya Ribuan Organizer
                            </h2>
                            <p className="text-muted-foreground">
                                Apa kata mereka yang sudah menggunakan eventoria.id
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <TestimonialCard
                                quote="Eventoria completely changed how we manage our music festivals. The ticketing system is seamless and the analytics help us make better decisions every year."
                                name="Rina Maharani"
                                role="Founder, Soundwave Festival"
                                rating={5}
                            />
                            <TestimonialCard
                                quote="Sebagai organizer workshop, saya butuh platform yang simple tapi powerful. Eventoria menjawab semua kebutuhan saya dengan fitur yang sangat lengkap."
                                name="Andi Pratama"
                                role="CEO, EduTech Indonesia"
                                rating={5}
                            />
                            <TestimonialCard
                                quote="Dashboard analitiknya luar biasa! Kami bisa track semua metrics penting dan buat keputusan yang lebih baik untuk event-event selanjutnya."
                                name="Sarah Wijaya"
                                role="Event Director, CreativHub"
                                rating={5}
                            />
                        </div>
                    </div>
                </section>

                {/* ───── CTA ───── */}
                <section className="py-20 md:py-28">
                    <div className="mx-auto max-w-4xl px-6">
                        <div className="relative border-2 border-foreground bg-primary p-10 text-primary-foreground shadow-lg md:p-16">
                            {/* Decorative squares */}
                            <div className="absolute -top-3 -left-3 size-6 border-2 border-foreground bg-secondary" />
                            <div className="absolute -right-3 -bottom-3 size-6 border-2 border-foreground bg-accent" />

                            <div className="text-center">
                                <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
                                    Siap Buat Event Luar Biasa?
                                </h2>
                                <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
                                    Bergabung dengan 850+ organizer yang sudah mempercayakan event mereka di eventoria.id. Daftar gratis sekarang!
                                </p>
                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        asChild
                                        className="border-2 border-foreground text-base font-bold shadow-md"
                                    >
                                        <Link href={register()}>
                                            Daftar Gratis Sekarang
                                            <ArrowRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        asChild
                                        className="border-2 border-primary-foreground bg-transparent text-base font-bold text-primary-foreground hover:bg-primary-foreground/10"
                                    >
                                        <a href="#features">
                                            Pelajari Lebih Lanjut
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ───── FOOTER ───── */}
                <footer className="border-t-2 border-foreground bg-muted/50 py-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-8 md:grid-cols-4">
                            <div className="md:col-span-1">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center border-2 border-foreground bg-primary shadow-sm">
                                        <PartyPopper className="size-4 text-primary-foreground" />
                                    </div>
                                    <span className="font-mono text-lg font-black">eventoria.id</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Platform event management terbaik di Indonesia. Buat, kelola, dan temukan event dengan mudah.
                                </p>
                            </div>

                            <div>
                                <h4 className="mb-4 font-bold">Platform</h4>
                                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                    <li>
                                        <a href="#features" className="transition-colors hover:text-foreground">
                                            Fitur
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#categories" className="transition-colors hover:text-foreground">
                                            Kategori
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#how-it-works" className="transition-colors hover:text-foreground">
                                            Cara Kerja
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#testimonials" className="transition-colors hover:text-foreground">
                                            Testimoni
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 font-bold">Perusahaan</h4>
                                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                    <li>
                                        <a href="#" className="transition-colors hover:text-foreground">
                                            Tentang Kami
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-foreground">
                                            Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-foreground">
                                            Karir
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-foreground">
                                            Kontak
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 font-bold">Legal</h4>
                                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                    <li>
                                        <a href="#" className="transition-colors hover:text-foreground">
                                            Kebijakan Privasi
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-foreground">
                                            Syarat & Ketentuan
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="transition-colors hover:text-foreground">
                                            Keamanan
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Separator className="my-8 bg-foreground/20" />

                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <p className="text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} eventoria.id — All rights reserved.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Dibuat dengan</span>
                                <Heart className="size-3.5 fill-primary text-primary" />
                                <span>oleh Qinshibe</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
