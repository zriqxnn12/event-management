import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CalendarDays,
    CheckCircle2,
    Coins,
    CreditCard,
    ExternalLink,
    Filter,
    Receipt,
    RotateCcw,
    Search,
    ShoppingCart,
    TrendingUp,
    X,
} from 'lucide-react';
import { index as ordersIndex } from '@/actions/App/Http/Controllers/OrderController';
import { show as orderShow } from '@/routes/orders';
import type { BreadcrumbItem, OrdersIndexProps as Props, PaymentStatus } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: ordersIndex().url },
];

const PAYMENT_STATUS_TABS = [
    { key: 'all', label: 'Semua Status' },
    { key: 'paid', label: 'Lunas' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'expired', label: 'Kadaluarsa' },
    { key: 'cancelled', label: 'Dibatalkan' },
];

const PAYMENT_STATUS_CONFIG: Record<
    PaymentStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
    paid: {
        label: 'Lunas',
        variant: 'default',
        className: 'bg-emerald-500 hover:bg-emerald-500 border-emerald-600',
    },
    pending: {
        label: 'Menunggu',
        variant: 'secondary',
        className: 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300',
    },
    expired: {
        label: 'Kadaluarsa',
        variant: 'outline',
        className: 'text-muted-foreground',
    },
    cancelled: {
        label: 'Dibatalkan',
        variant: 'destructive',
        className: '',
    },
};

function formatCurrency(value: number): string {
    return 'Rp ' + value.toLocaleString('id-ID', { minimumFractionDigits: 0 });
}

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-foreground/30 bg-muted/20 py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl border-2 border-foreground/20 bg-muted/60">
                <ShoppingCart className="size-7 text-foreground/40" />
            </div>
            <h3 className="mb-1 text-lg font-black">Belum ada data order</h3>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                Tidak ada order yang cocok dengan filter atau kata kunci pencarian yang sedang dipilih.
            </p>
            <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="border-2 border-foreground font-bold shadow-2xs"
            >
                <RotateCcw className="mr-1.5 size-3.5" />
                Reset Semua Filter
            </Button>
        </div>
    );
}

export default function OrdersIndex({ orders, filters, eventOptions, isAdmin, feeRate, stats }: Props) {
    setLayoutProps({ breadcrumbs });

    const [search, setSearch] = useState(filters.search ?? '');

    const hasActiveFilters = Boolean(
        (filters.payment_status && filters.payment_status !== 'all') ||
        filters.event_id ||
        filters.search
    );

    const applyFilters = (overrides: Partial<typeof filters>) => {
        const params: Record<string, string | number | undefined> = {
            payment_status: overrides.payment_status ?? filters.payment_status,
            event_id: overrides.event_id ?? filters.event_id ?? undefined,
            search: (overrides.search !== undefined ? overrides.search : filters.search) || undefined,
        };

        // Omit 'all' so the URL stays clean
        if (params.payment_status === 'all') {
            delete params.payment_status;
        }

        if (!params.search) {
            delete params.search;
        }

        if (!params.event_id) {
            delete params.event_id;
        }

        router.get(ordersIndex().url, params as Record<string, string>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleClearSearch = () => {
        setSearch('');
        applyFilters({ search: '' });
    };

    const handleResetAllFilters = () => {
        setSearch('');
        router.get(ordersIndex().url, {}, { preserveState: true, replace: true });
    };

    const paidRate = stats.total_orders > 0
        ? Math.round((stats.total_paid_orders / stats.total_orders) * 100)
        : 0;

    return (
        <>
            <Head title="Manajemen Order" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        {isAdmin ? 'Semua Order Platform' : 'Manajemen Order'}
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground">
                        {isAdmin
                            ? `Kelola semua transaksi order platform beserta komisi fee ${(feeRate * 100).toFixed(0)}% per transaksi lunas.`
                            : 'Pantau status pembayaran dan riwayat pemesanan tiket untuk event Anda.'}
                    </p>
                </div>

                {/* Summary Metric Cards */}
                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                    {/* Card 1: Total Pendapatan */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Total Pendapatan
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-emerald-200 text-emerald-950 shadow-[2px_2px_0px_0px_#000] dark:bg-emerald-900/60 dark:text-emerald-200">
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

                    {/* Card 2: Total Order */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Total Order
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-blue-200 text-blue-950 shadow-[2px_2px_0px_0px_#000] dark:bg-blue-900/60 dark:text-blue-200">
                                <ShoppingCart className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                                {stats.total_orders.toLocaleString('id-ID')}
                                <span className="ml-1.5 text-sm font-semibold text-muted-foreground">transaksi</span>
                            </p>
                            <p className="mt-2 text-xs font-semibold text-muted-foreground">
                                Seluruh status pesanan tercatat
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Order Lunas */}
                    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Order Lunas
                            </span>
                            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-amber-200 text-amber-950 shadow-[2px_2px_0px_0px_#000] dark:bg-amber-900/60 dark:text-amber-200">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="flex items-baseline justify-between">
                                <p className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                                    {stats.total_paid_orders.toLocaleString('id-ID')}
                                    <span className="ml-1.5 text-sm font-semibold text-muted-foreground">lunas</span>
                                </p>
                                <span className="font-mono text-xs font-bold text-muted-foreground">
                                    {paidRate}% rasio
                                </span>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                Pembayaran berhasil terverifikasi
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Total Fee Platform (Role Admin Only) */}
                    {isAdmin && (
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-start justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Total Fee (3%)
                                </span>
                                <div className="flex size-10 items-center justify-center rounded-lg border-2 border-foreground bg-violet-200 text-violet-950 shadow-[2px_2px_0px_0px_#000] dark:bg-violet-900/60 dark:text-violet-200">
                                    <Coins className="size-5" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
                                    {formatCurrency(stats.total_fee ?? 0)}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                                    <span>Komisi pendapatan platform</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter & Search Section wrapped in a Card */}
                <div className="rounded-xl border-2 border-foreground bg-card p-4 sm:p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    <div className="flex flex-col gap-4">
                        {/* Top bar: Search input + Event Select + Reset button */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                {/* Search */}
                                <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari no. order, nama peserta, email…"
                                        className="h-10 border-2 border-foreground/40 pl-9 pr-9 text-sm font-semibold focus-visible:border-foreground"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                                            aria-label="Hapus pencarian"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    )}
                                </form>

                                {/* Event filter dropdown */}
                                <Select
                                    value={filters.event_id ? String(filters.event_id) : 'all'}
                                    onValueChange={(val) =>
                                        applyFilters({ event_id: val === 'all' ? null : Number(val) })
                                    }
                                >
                                    <SelectTrigger className="h-10 w-full border-2 border-foreground/40 text-sm font-semibold sm:w-64">
                                        <CalendarDays className="mr-2 size-4 shrink-0 text-muted-foreground" />
                                        <SelectValue placeholder="Semua Event" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72 border-2 border-foreground">
                                        <SelectItem value="all" className="font-semibold">
                                            Semua Event ({eventOptions.length})
                                        </SelectItem>
                                        {eventOptions.map((e) => (
                                            <SelectItem key={e.id} value={String(e.id)} className="font-semibold">
                                                {e.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reset button if any filter is active */}
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetAllFilters}
                                    className="self-start border-2 border-foreground text-xs font-bold shadow-2xs hover:bg-muted md:self-auto"
                                >
                                    <RotateCcw className="mr-1.5 size-3.5" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-0.5 w-full bg-border" />

                        {/* Bottom bar: Status tabs filter */}
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <Filter className="size-3.5" />
                                <span>Status Pembayaran:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {PAYMENT_STATUS_TABS.map((tab) => {
                                    const isActive = (filters.payment_status ?? 'all') === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => applyFilters({ payment_status: tab.key })}
                                            className={`rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                                                isActive
                                                    ? 'border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]'
                                                    : 'border-foreground/30 bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table or Empty State */}
                {orders.data.length === 0 ? (
                    <EmptyState onReset={handleResetAllFilters} />
                ) : (
                    <>
                        <div className="overflow-hidden rounded-xl border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b-2 border-foreground bg-muted/60 text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5">
                                                Order
                                            </th>
                                            <th scope="col" className="px-4 py-3.5">
                                                Peserta
                                            </th>
                                            <th scope="col" className="px-4 py-3.5">
                                                Event / Tiket
                                            </th>
                                            <th scope="col" className="px-4 py-3.5">
                                                Total
                                            </th>
                                            {isAdmin && (
                                                <th scope="col" className="px-4 py-3.5">
                                                    Fee (3%)
                                                </th>
                                            )}
                                            <th scope="col" className="px-4 py-3.5">
                                                Status
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-foreground/10 font-medium">
                                        {orders.data.map((order) => {
                                            const statusCfg =
                                                PAYMENT_STATUS_CONFIG[order.payment_status] ??
                                                PAYMENT_STATUS_CONFIG.pending;

                                            return (
                                                <tr
                                                    key={order.id}
                                                    className="transition-colors hover:bg-muted/40"
                                                >
                                                    {/* Order number + date */}
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-mono text-xs font-bold tracking-tight">
                                                                {order.number}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground" title={order.created_at}>
                                                                {order.created_at_human}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Attendee info */}
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-semibold">
                                                                {order.attendee_name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {order.attendee_email}
                                                            </span>
                                                            {order.attendee_phone && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {order.attendee_phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Event / Ticket */}
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex flex-col gap-0.5">
                                                            {order.event ? (
                                                                <span className="line-clamp-1 font-semibold" title={order.event.title}>
                                                                    {order.event.title}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                            {order.ticket && (
                                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Receipt className="size-3 shrink-0" />
                                                                    {order.ticket.name} ×{order.quantity}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Total */}
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-bold">
                                                            {order.total_price <= 0
                                                                ? 'GRATIS'
                                                                : order.formatted_price}
                                                        </span>
                                                    </td>

                                                    {/* Platform fee – admin only */}
                                                    {isAdmin && (
                                                        <td className="px-4 py-3.5 align-middle">
                                                            {order.payment_status === 'paid' && order.total_price > 0 ? (
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                    {order.formatted_fee ?? formatCurrency(order.total_price * feeRate)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">—</span>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* Status badge */}
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <Badge
                                                            variant={statusCfg.variant}
                                                            className={`border-2 border-foreground text-xs font-bold shadow-2xs ${statusCfg.className}`}
                                                        >
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3.5 align-middle text-right">
                                                        <Link
                                                            href={orderShow({ order: order.number }).url}
                                                            className="inline-flex items-center gap-1.5 rounded-none border-2 border-foreground px-2.5 py-1 text-xs font-bold transition-colors hover:bg-foreground hover:text-background"
                                                            title="Lihat detail order"
                                                        >
                                                            <ExternalLink className="size-3" />
                                                            Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {orders.prev_page_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-foreground font-bold shadow-2xs"
                                        onClick={() => router.get(orders.prev_page_url!)}
                                    >
                                        ← Sebelumnya
                                    </Button>
                                )}
                                <span className="text-sm font-semibold text-muted-foreground">
                                    Halaman {orders.current_page} dari {orders.last_page}
                                </span>
                                {orders.next_page_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-foreground font-bold shadow-2xs"
                                        onClick={() => router.get(orders.next_page_url!)}
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
