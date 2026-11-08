import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    CalendarDays,
    Ticket,
    TrendingUp,
    Users,
    CreditCard,
    Plus,
    ExternalLink,
    Activity,
    CheckCircle2,
    Clock,
    AlertCircle,
    MapPin,
    Monitor,
    Globe,
    ChevronRight,
    ShoppingBag,
    BarChart3,
    ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import { create as eventsCreate, index as eventsIndex } from '@/actions/App/Http/Controllers/Vendor/EventController';
import type { BreadcrumbItem, User } from '@/types';

export type DashboardStats = {
    total_revenue: number;
    total_tickets_sold: number;
    total_events: number;
    published_events: number;
    draft_events: number;
    completed_events: number;
    total_attendees: number;
    total_quota: number;
};

export type SalesTrendItem = {
    date: string;
    label: string;
    day: string;
    revenue: number;
    tickets: number;
    orders_count: number;
};

export type CategoryStat = {
    name: string;
    count: number;
};

export type EventTypeBreakdown = {
    online: number;
    offline: number;
    hybrid: number;
};

export type RecentOrder = {
    id: number;
    number: string;
    attendee_name: string;
    attendee_email: string;
    event_title: string;
    event_slug: string;
    ticket_name: string;
    quantity: number;
    total_price: number;
    payment_status: 'paid' | 'pending' | 'expired' | 'cancelled';
    created_at_human: string;
    created_at: string;
};

export type UpcomingEventItem = {
    id: number;
    title: string;
    slug: string;
    category: string;
    type: 'online' | 'offline' | 'hybrid';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    start_date: string;
    cover_image: string | null;
    tickets_sold: number;
    tickets_quota: number;
};

export type DashboardProps = {
    stats?: DashboardStats;
    sales_trend?: SalesTrendItem[];
    categories?: CategoryStat[];
    types?: EventTypeBreakdown;
    recent_orders?: RecentOrder[];
    upcoming_events?: UpcomingEventItem[];
};

const DEFAULT_STATS: DashboardStats = {
    total_revenue: 0,
    total_tickets_sold: 0,
    total_events: 0,
    published_events: 0,
    draft_events: 0,
    completed_events: 0,
    total_attendees: 0,
    total_quota: 0,
};

const DEFAULT_TYPES: EventTypeBreakdown = {
    online: 0,
    offline: 0,
    hybrid: 0,
};

function formatCurrency(val: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
}

function formatNumber(val: number): string {
    return new Intl.NumberFormat('id-ID').format(val);
}

export default function Dashboard({
    stats: rawStats,
    sales_trend: rawSalesTrend,
    categories: rawCategories,
    types: rawTypes,
    recent_orders: rawRecentOrders,
    upcoming_events: rawUpcomingEvents,
}: DashboardProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    const [chartMode, setChartMode] = useState<'revenue' | 'tickets'>('revenue');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const stats = rawStats ?? DEFAULT_STATS;
    const salesTrend = rawSalesTrend ?? [];
    const categories = rawCategories ?? [];
    const types = rawTypes ?? DEFAULT_TYPES;
    const recentOrders = rawRecentOrders ?? [];
    const upcomingEvents = rawUpcomingEvents ?? [];

    // Chart calculations
    const chartWidth = 720;
    const chartHeight = 220;
    const paddingX = 40;
    const paddingY = 30;
    const innerWidth = chartWidth - paddingX * 2;
    const innerHeight = chartHeight - paddingY * 2;

    const maxChartValue = useMemo(() => {
        if (salesTrend.length === 0) return 100;
        const max = Math.max(
            ...salesTrend.map((d) => (chartMode === 'revenue' ? d.revenue : d.tickets)),
            chartMode === 'revenue' ? 1000000 : 10
        );
        return max * 1.15; // small breathing room
    }, [salesTrend, chartMode]);

    const points = useMemo(() => {
        if (salesTrend.length === 0) return [];
        const step = salesTrend.length > 1 ? innerWidth / (salesTrend.length - 1) : innerWidth;
        return salesTrend.map((item, idx) => {
            const val = chartMode === 'revenue' ? item.revenue : item.tickets;
            const x = paddingX + idx * step;
            const y = chartHeight - paddingY - (val / (maxChartValue || 1)) * innerHeight;
            return { x, y, item, val };
        });
    }, [salesTrend, chartMode, maxChartValue, innerWidth, innerHeight]);

    // Smooth Bezier Curve Path Generator
    const { pathD, areaD } = useMemo(() => {
        if (points.length === 0) return { pathD: '', areaD: '' };
        if (points.length === 1) {
            const p = points[0];
            return {
                pathD: `M ${p.x} ${p.y}`,
                areaD: `M ${p.x} ${chartHeight - paddingY} L ${p.x} ${p.y} L ${p.x} ${chartHeight - paddingY} Z`,
            };
        }

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i === 0 ? 0 : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        const first = points[0];
        const last = points[points.length - 1];
        const area = `${d} L ${last.x} ${chartHeight - paddingY} L ${first.x} ${chartHeight - paddingY} Z`;

        return { pathD: d, areaD: area };
    }, [points, chartHeight, paddingY]);

    // Ticket quota percentage
    const quotaPercentage = stats.total_quota > 0
        ? Math.min(100, Math.round((stats.total_tickets_sold / stats.total_quota) * 100))
        : stats.total_tickets_sold > 0
        ? 100
        : 0;

    // Peak metric from sales trend (only if > 0)
    const peakMetric = useMemo(() => {
        if (salesTrend.length === 0) return null;
        const highest = [...salesTrend].sort((a, b) =>
            chartMode === 'revenue' ? b.revenue - a.revenue : b.tickets - a.tickets
        )[0];
        const val = chartMode === 'revenue' ? highest.revenue : highest.tickets;
        return val > 0 ? highest : null;
    }, [salesTrend, chartMode]);

    const averagePerDay = useMemo(() => {
        if (salesTrend.length === 0) return 0;
        const total = salesTrend.reduce((acc, d) => acc + (chartMode === 'revenue' ? d.revenue : d.tickets), 0);
        return Math.round(total / salesTrend.length);
    }, [salesTrend, chartMode]);

    const hasAnySalesActivity = useMemo(() => {
        return salesTrend.some((d) => d.revenue > 0 || d.tickets > 0);
    }, [salesTrend]);

    return (
        <>
            <Head title="Vendor Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Welcome Header */}
                <div className="flex flex-col gap-4 rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_#000] md:flex-row md:items-center md:justify-between dark:shadow-[4px_4px_0px_0px_#fff]">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <Badge variant="outline" className="border-2 border-foreground font-mono text-xs uppercase tracking-wider">
                                Vendor Console
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                            Halo, {user?.name || 'Partner Vendor'}! 👋
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            Pantau metrik penjualan tiket, performa aktivitas event, dan peserta terbaru Anda secara real-time.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {user?.username && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0"
                                asChild
                            >
                                <Link href={`/${user.username}`} target="_blank">
                                    <ExternalLink className="mr-1.5 size-4" />
                                    Profil Publik
                                </Link>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0"
                            asChild
                        >
                            <Link href={eventsIndex().url}>
                                <CalendarDays className="mr-1.5 size-4" />
                                Kelola Event
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            className="border-2 border-foreground bg-primary font-bold text-primary-foreground shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
                            asChild
                        >
                            <Link href={eventsCreate().url}>
                                <Plus className="mr-1.5 size-4 stroke-[3]" />
                                Buat Event Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Revenue */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Total Pendapatan
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-emerald-200 text-emerald-950 shadow-[2px_2px_0px_0px_#000]">
                                <CreditCard className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                                {formatCurrency(stats.total_revenue)}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="size-3.5" />
                                <span>Dari pesanan yang telah lunas</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Tickets Sold */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Tiket Terjual
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-amber-200 text-amber-950 shadow-[2px_2px_0px_0px_#000]">
                                <Ticket className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="flex items-baseline justify-between">
                                <p className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                                    {formatNumber(stats.total_tickets_sold)}
                                    <span className="ml-1 text-sm font-normal text-muted-foreground">tiket</span>
                                </p>
                                <span className="font-mono text-xs font-bold">{quotaPercentage}% kuota</span>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border-2 border-foreground bg-muted">
                                <div
                                    className="h-full bg-amber-400 transition-all duration-500"
                                    style={{ width: `${quotaPercentage}%` }}
                                />
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                                {stats.total_quota > 0 ? `Target ${formatNumber(stats.total_quota)} total kuota tiket` : 'Kapasitas tiket tidak terbatas'}
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Active Events */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Event Aktif
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-blue-200 text-blue-950 shadow-[2px_2px_0px_0px_#000]">
                                <CalendarDays className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                                {stats.published_events}
                                <span className="ml-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    Dipublish
                                </span>
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <span>{stats.draft_events} Draft</span>
                                <span>•</span>
                                <span>{stats.completed_events} Selesai</span>
                                <span>•</span>
                                <span className="font-bold">{stats.total_events} Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Total Attendees */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Total Peserta
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-purple-200 text-purple-950 shadow-[2px_2px_0px_0px_#000]">
                                <Users className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                                {formatNumber(stats.total_attendees)}
                                <span className="ml-1 text-sm font-normal text-muted-foreground">orang</span>
                            </p>
                            <p className="mt-2 text-xs font-medium text-muted-foreground">
                                Terdaftar di semua event Anda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Interactive Chart Section */}
                <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    <div className="flex flex-col gap-4 border-b-2 border-foreground/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Activity className="size-5 text-primary" />
                                <h2 className="text-lg font-black tracking-tight">Grafik Aktivitas Penjualan</h2>
                                <Badge variant="outline" className="border-2 border-foreground font-mono text-[10px]">
                                    14 Hari Terakhir
                                </Badge>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Analisis tren pendapatan dan jumlah tiket yang dibeli peserta
                            </p>
                        </div>

                        {/* Chart View Mode Controls */}
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-lg border-2 border-foreground p-0.5 shadow-[2px_2px_0px_0px_#000]">
                                <button
                                    type="button"
                                    onClick={() => setChartMode('revenue')}
                                    className={`px-3 py-1 text-xs font-bold transition-colors ${
                                        chartMode === 'revenue'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-foreground hover:bg-muted'
                                    }`}
                                >
                                    Pendapatan (Rp)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartMode('tickets')}
                                    className={`px-3 py-1 text-xs font-bold transition-colors ${
                                        chartMode === 'tickets'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-foreground hover:bg-muted'
                                    }`}
                                >
                                    Tiket Terjual (Qty)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart Summary Highlights */}
                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border-2 border-dashed border-foreground/30 bg-muted/30 p-3 sm:grid-cols-4">
                        <div>
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Total Periode</span>
                            <p className="font-mono text-base font-black">
                                {chartMode === 'revenue'
                                    ? formatCurrency(salesTrend.reduce((acc, d) => acc + d.revenue, 0))
                                    : `${formatNumber(salesTrend.reduce((acc, d) => acc + d.tickets, 0))} tiket`}
                            </p>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Rata-rata / Hari</span>
                            <p className="font-mono text-base font-black">
                                {chartMode === 'revenue' ? formatCurrency(averagePerDay) : `${averagePerDay} tiket/hari`}
                            </p>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Hari Puncak</span>
                            <p className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                                {peakMetric
                                    ? `${peakMetric.label} (${chartMode === 'revenue' ? formatCurrency(peakMetric.revenue) : `${peakMetric.tickets} tiket`})`
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-[11px] font-bold uppercase text-muted-foreground">Total Transaksi</span>
                            <p className="font-mono text-base font-black">
                                {formatNumber(salesTrend.reduce((acc, d) => acc + d.orders_count, 0))} pesanan
                            </p>
                        </div>
                    </div>

                    {/* SVG Chart Area */}
                    <div className="relative mt-6 w-full select-none overflow-x-auto">
                        {!hasAnySalesActivity && (
                            <div className="mb-3 flex items-center justify-center gap-2 rounded-md border border-dashed border-foreground/30 bg-muted/40 py-2 text-xs text-muted-foreground">
                                <Clock className="size-3.5" />
                                <span>Belum ada transaksi penjualan pada periode 14 hari terakhir</span>
                            </div>
                        )}

                        <div className="min-w-[620px]">
                            <svg
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                className="h-60 w-full overflow-visible"
                            >
                                <defs>
                                    <linearGradient id="chartGradientRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                                    </linearGradient>
                                    <linearGradient id="chartGradientTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Y-Axis Horizontal Gridlines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                                    const y = chartHeight - paddingY - ratio * innerHeight;
                                    const val = Math.round(ratio * maxChartValue);
                                    return (
                                        <g key={ratio}>
                                            <line
                                                x1={paddingX}
                                                y1={y}
                                                x2={chartWidth - paddingX}
                                                y2={y}
                                                stroke="currentColor"
                                                strokeOpacity={ratio === 0 ? '0.3' : '0.1'}
                                                strokeDasharray={ratio === 0 ? undefined : '3 3'}
                                                className="text-foreground"
                                            />
                                            <text
                                                x={paddingX - 8}
                                                y={y + 3}
                                                textAnchor="end"
                                                fontSize="9"
                                                fontWeight="bold"
                                                className="fill-muted-foreground font-mono"
                                            >
                                                {chartMode === 'revenue'
                                                    ? val >= 1000000
                                                        ? `${(val / 1000000).toFixed(1)}jt`
                                                        : val >= 1000
                                                        ? `${(val / 1000).toFixed(0)}rb`
                                                        : val
                                                    : val}
                                            </text>
                                        </g>
                                    );
                                })}

                                {chartMode === 'revenue' ? (
                                    <>
                                        {/* Area Fill */}
                                        <path
                                            d={areaD}
                                            fill="url(#chartGradientRevenue)"
                                        />

                                        {/* Main Line */}
                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke="#ea580c"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </>
                                ) : (
                                    /* Bar Columns for Tickets */
                                    <g>
                                        {points.map((p, idx) => {
                                            const barWidth = Math.max(12, innerWidth / points.length - 8);
                                            const barHeight = Math.max(2, chartHeight - paddingY - p.y);
                                            const isHovered = hoveredIndex === idx;
                                            return (
                                                <rect
                                                    key={p.item.date}
                                                    x={p.x - barWidth / 2}
                                                    y={p.y}
                                                    width={barWidth}
                                                    height={barHeight}
                                                    rx="2"
                                                    className={`transition-all duration-150 ${
                                                        isHovered
                                                            ? 'fill-blue-500 stroke-2 stroke-foreground'
                                                            : 'fill-blue-600/85 hover:fill-blue-500'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </g>
                                )}

                                {/* Interactive Vertical Line & Tooltip Trigger Areas */}
                                {points.map((p, idx) => {
                                    const isHovered = hoveredIndex === idx;
                                    return (
                                        <g key={p.item.date}>
                                            {isHovered && (
                                                <line
                                                    x1={p.x}
                                                    y1={paddingY}
                                                    x2={p.x}
                                                    y2={chartHeight - paddingY}
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeDasharray="4 4"
                                                    className="text-foreground"
                                                />
                                            )}

                                            {/* Data Point Dots for Line Mode */}
                                            {chartMode === 'revenue' && (
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={isHovered ? 6 : 4}
                                                    className={`transition-all ${
                                                        isHovered
                                                            ? 'fill-primary stroke-3 stroke-background'
                                                            : 'fill-background stroke-2 stroke-primary'
                                                    }`}
                                                />
                                            )}

                                            {/* X-Axis Date Labels */}
                                            <text
                                                x={p.x}
                                                y={chartHeight - 8}
                                                textAnchor="middle"
                                                fontSize="9.5"
                                                fontWeight={isHovered ? 'bold' : 'normal'}
                                                className={isHovered ? 'fill-foreground font-bold' : 'fill-muted-foreground'}
                                            >
                                                {p.item.label}
                                            </text>

                                            {/* Transparent Hover Hitbox */}
                                            <rect
                                                x={p.x - innerWidth / (points.length * 2)}
                                                y={0}
                                                width={innerWidth / points.length}
                                                height={chartHeight}
                                                fill="transparent"
                                                className="cursor-pointer"
                                                onMouseEnter={() => setHoveredIndex(idx)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            />
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Interactive Floating Tooltip */}
                        {hoveredIndex !== null && points[hoveredIndex] && (
                            <div
                                className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 rounded-lg border-2 border-foreground bg-card p-2.5 text-xs font-bold shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]"
                                style={{
                                    left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
                                }}
                            >
                                <p className="font-semibold text-muted-foreground">
                                    {points[hoveredIndex].item.day}, {points[hoveredIndex].item.label}
                                </p>
                                <p className="text-sm font-black text-foreground">
                                    {chartMode === 'revenue'
                                        ? formatCurrency(points[hoveredIndex].item.revenue)
                                        : `${points[hoveredIndex].item.tickets} Tiket`}
                                </p>
                                <p className="text-[10px] font-normal text-muted-foreground">
                                    {points[hoveredIndex].item.orders_count} Transaksi
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Visualizations: Category & Type Distribution */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Event Type Breakdown */}
                    <div className="flex flex-col justify-between rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div>
                            <div className="flex items-center justify-between border-b-2 border-foreground/15 pb-3">
                                <h3 className="font-black text-foreground">Tipe Event</h3>
                                <Badge variant="outline" className="border-2 border-foreground font-mono text-[10px]">
                                    Format
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Ragam format event yang diselenggarakan
                            </p>

                            <div className="mt-5 space-y-3">
                                {/* Online */}
                                <div>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                            <Monitor className="size-3.5" />
                                            <span>Online (Webinar / Stream)</span>
                                        </div>
                                        <span className="font-mono">{types.online} event</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-foreground bg-muted">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{
                                                width: `${stats.total_events > 0 ? (types.online / stats.total_events) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Offline */}
                                <div>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                                            <MapPin className="size-3.5" />
                                            <span>Offline (Tatap Muka)</span>
                                        </div>
                                        <span className="font-mono">{types.offline} event</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-foreground bg-muted">
                                        <div
                                            className="h-full bg-orange-500"
                                            style={{
                                                width: `${stats.total_events > 0 ? (types.offline / stats.total_events) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Hybrid */}
                                <div>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                                            <Globe className="size-3.5" />
                                            <span>Hybrid</span>
                                        </div>
                                        <span className="font-mono">{types.hybrid} event</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-foreground bg-muted">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{
                                                width: `${stats.total_events > 0 ? (types.hybrid / stats.total_events) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 rounded-lg border-2 border-foreground bg-muted/40 p-3 text-center text-xs font-semibold">
                            Total {stats.total_events} Event Terdata
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="flex flex-col justify-between rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] lg:col-span-2 dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div>
                            <div className="flex items-center justify-between border-b-2 border-foreground/15 pb-3">
                                <h3 className="font-black text-foreground">Distribusi Kategori Event</h3>
                                <Badge variant="outline" className="border-2 border-foreground font-mono text-[10px]">
                                    Top Kategori
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Sebaran topik dan kategori event yang diminati audiens Anda
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                {categories.length === 0 ? (
                                    <div className="col-span-2 py-6 text-center text-xs text-muted-foreground">
                                        Belum ada kategori event yang ditambahkan.
                                    </div>
                                ) : (
                                    categories.map((cat, i) => (
                                        <div
                                            key={cat.name}
                                            className="flex items-center justify-between rounded-lg border-2 border-foreground bg-background p-3 shadow-[2px_2px_0px_0px_#000]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="flex size-6 items-center justify-center rounded-md border border-foreground bg-primary/20 text-xs font-black">
                                                    {i + 1}
                                                </span>
                                                <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <Badge variant="secondary" className="border border-foreground font-mono text-xs">
                                                {cat.count} event
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t-2 border-foreground/15 pt-3 text-xs">
                            <span className="font-medium text-muted-foreground">Ingin menjangkau segmen baru?</span>
                            <Link
                                href={eventsCreate().url}
                                className="flex items-center gap-1 font-bold text-primary underline hover:text-primary/80"
                            >
                                Buat kategori event baru <ArrowUpRight className="size-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Recent Orders Activity & Upcoming Events Performance */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Activity Feed: Recent Ticket Orders */}
                    <div className="flex flex-col justify-between rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div>
                            <div className="flex items-center justify-between border-b-2 border-foreground/15 pb-3">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="size-5 text-emerald-600 dark:text-emerald-400" />
                                    <h3 className="font-black text-foreground">Pesanan & Transaksi Terbaru</h3>
                                </div>
                                <Badge variant="outline" className="border-2 border-foreground font-mono text-[10px]">
                                    Live Log
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Aktivitas pemesanan tiket terkini oleh calon peserta
                            </p>

                            <div className="mt-4 divide-y-2 divide-foreground/10">
                                {recentOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-full border-2 border-foreground bg-muted">
                                            <ShoppingBag className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="mt-3 text-sm font-bold">Belum ada pesanan tiket</p>
                                        <p className="text-xs text-muted-foreground">
                                            Pesanan dari pembeli tiket akan langsung muncul di sini.
                                        </p>
                                    </div>
                                ) : (
                                    recentOrders.map((order) => {
                                        const isPaid = order.payment_status === 'paid';
                                        const isPending = order.payment_status === 'pending';
                                        return (
                                            <div key={order.id} className="flex items-start justify-between py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-foreground bg-muted font-black text-xs">
                                                        {order.attendee_name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-black text-foreground">
                                                                {order.attendee_name}
                                                            </p>
                                                            <Badge
                                                                variant={isPaid ? 'default' : isPending ? 'secondary' : 'destructive'}
                                                                className={`border text-[10px] font-bold ${
                                                                    isPaid ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : ''
                                                                }`}
                                                            >
                                                                {isPaid ? 'Lunas' : isPending ? 'Menunggu' : order.payment_status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[11px] font-medium text-muted-foreground">
                                                            {order.event_title} • <span className="font-semibold text-foreground">{order.ticket_name}</span> ({order.quantity}x)
                                                        </p>
                                                        <span className="font-mono text-[10px] text-muted-foreground">
                                                            {order.number} • {order.created_at_human}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono text-xs font-black text-foreground">
                                                        {formatCurrency(order.total_price)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="mt-4 border-t-2 border-foreground/15 pt-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000]"
                                asChild
                            >
                                <Link href={eventsIndex().url}>
                                    Lihat Semua Event & Penjualan →
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Upcoming Events & Ticket Quota Progress */}
                    <div className="flex flex-col justify-between rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div>
                            <div className="flex items-center justify-between border-b-2 border-foreground/15 pb-3">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="size-5 text-primary" />
                                    <h3 className="font-black text-foreground">Event Terkini & Kuota</h3>
                                </div>
                                <Badge variant="outline" className="border-2 border-foreground font-mono text-[10px]">
                                    Status
                                </Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Pantau serapan kuota tiket pada event-event aktif Anda
                            </p>

                            <div className="mt-4 space-y-3.5">
                                {upcomingEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-full border-2 border-foreground bg-muted">
                                            <CalendarDays className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="mt-3 text-sm font-bold">Belum ada event</p>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Mulai publikasikan event Anda sekarang.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000]"
                                            asChild
                                        >
                                            <Link href={eventsCreate().url}>
                                                Buat Event Sekarang
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    upcomingEvents.map((evt) => {
                                        const soldPct = evt.tickets_quota > 0
                                            ? Math.min(100, Math.round((evt.tickets_sold / evt.tickets_quota) * 100))
                                            : 0;
                                        return (
                                            <div
                                                key={evt.id}
                                                className="group rounded-lg border-2 border-foreground bg-background p-3 shadow-[2px_2px_0px_0px_#000] transition-transform hover:-translate-y-0.5"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Badge variant="secondary" className="border border-foreground text-[10px] font-bold">
                                                                {evt.category}
                                                            </Badge>
                                                            <Badge
                                                                variant={evt.status === 'published' ? 'default' : 'outline'}
                                                                className={`border text-[10px] ${
                                                                    evt.status === 'published' ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : ''
                                                                }`}
                                                            >
                                                                {evt.status === 'published' ? 'Aktif' : evt.status}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="mt-1 text-xs font-black text-foreground group-hover:text-primary transition-colors">
                                                            {evt.title}
                                                        </h4>
                                                        <p className="text-[11px] font-medium text-muted-foreground">
                                                            📅 {evt.start_date}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="size-7 p-0 border border-foreground"
                                                        asChild
                                                    >
                                                        <Link href={eventsIndex().url}>
                                                            <ChevronRight className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>

                                                {/* Quota Progress */}
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-muted-foreground">Serapan Tiket:</span>
                                                        <span className="font-mono">
                                                            {evt.tickets_sold} / {evt.tickets_quota > 0 ? evt.tickets_quota : '∞'} ({soldPct}%)
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-foreground bg-muted">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${
                                                                soldPct >= 90 ? 'bg-rose-500' : soldPct >= 50 ? 'bg-amber-500' : 'bg-primary'
                                                            }`}
                                                            style={{ width: `${soldPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="mt-4 border-t-2 border-foreground/15 pt-3">
                            <Button
                                className="w-full border-2 border-foreground bg-primary font-bold text-primary-foreground shadow-[2px_2px_0px_0px_#000] hover:bg-primary/90"
                                asChild
                            >
                                <Link href={eventsCreate().url}>
                                    <Plus className="mr-1.5 size-4" /> Tambah Event Baru
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ] as BreadcrumbItem[],
};
