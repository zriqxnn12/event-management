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
} from 'lucide-react';
import { type ReactNode, useEffect, useState, useRef } from 'react';

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

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                    className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                        scrollY > 50 ? 'border-b-2 border-foreground bg-background/95 shadow-sm backdrop-blur-sm' : 'bg-transparent'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center border-2 border-foreground bg-primary shadow-sm">
                                <PartyPopper className="size-5 text-primary-foreground" />
                            </div>
                            <span className="font-mono text-xl font-black tracking-tight">eventoria.id</span>
                        </Link>

                        <div className="hidden items-center gap-1 md:flex">
                            <a href="#features" className="px-3 py-2 text-sm font-semibold transition-colors hover:text-primary">
                                Fitur
                            </a>
                            <a href="#categories" className="px-3 py-2 text-sm font-semibold transition-colors hover:text-primary">
                                Kategori
                            </a>
                            <a href="#how-it-works" className="px-3 py-2 text-sm font-semibold transition-colors hover:text-primary">
                                Cara Kerja
                            </a>
                            <a href="#testimonials" className="px-3 py-2 text-sm font-semibold transition-colors hover:text-primary">
                                Testimoni
                            </a>
                        </div>

                        <div className="flex items-center gap-2">
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
                    </div>
                </nav>

                {/* ───── HERO ───── */}
                <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32">
                    {/* Background decoration */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -right-20 size-72 border-2 border-foreground/10 bg-secondary/30 rotate-12" />
                        <div className="absolute -bottom-10 -left-10 size-56 border-2 border-foreground/10 bg-accent/10 -rotate-6" />
                        <div className="absolute top-1/3 right-1/4 size-32 border-2 border-foreground/10 bg-primary/10 rotate-45" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-6">
                        <div className="mx-auto max-w-4xl text-center">
                            <Badge variant="secondary" className="mb-6 border-2 border-foreground px-4 py-1.5 text-sm font-bold shadow-sm">
                                <Zap className="size-3.5" />
                                Platform Event #1 di Indonesia
                            </Badge>

                            <h1 className="mb-6 text-5xl leading-[1.1] font-black tracking-tight md:text-7xl lg:text-8xl">
                                Buat Event
                                <br />
                                <span className="relative inline-block">
                                    <span className="relative z-10">Luar Biasa</span>
                                    <span className="absolute bottom-1 left-0 -z-0 h-4 w-full bg-secondary md:bottom-2 md:h-6" />
                                </span>
                            </h1>

                            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
                                Dari konser musik hingga workshop kreatif — kelola semua event kamu dalam satu platform yang powerful, mudah, dan
                                menyenangkan.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button size="lg" asChild className="border-2 border-foreground text-base font-bold shadow-md">
                                    <Link href={register()}>
                                        Mulai Sekarang — Gratis
                                        <ArrowRight data-icon="inline-end" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" asChild className="border-2 border-foreground text-base font-bold shadow-sm">
                                    <a href="#features">
                                        Lihat Fitur
                                        <ChevronRight data-icon="inline-end" />
                                    </a>
                                </Button>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    <span>Gratis selamanya</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    <span>Setup 5 menit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    <span>Tanpa kartu kredit</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

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
                                <span>di Indonesia</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
