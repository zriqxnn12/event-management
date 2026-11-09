import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
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
    CreditCard,
    ExternalLink,
    Receipt,
    Search,
    ShoppingCart,
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
    { key: 'all', label: 'Semua' },
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

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-foreground/30 py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center border-2 border-foreground/20 bg-muted/40">
                <ShoppingCart className="size-8 text-foreground/30" />
            </div>
            <h3 className="mb-2 text-lg font-black">Belum ada order</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
                Tidak ada order yang cocok dengan filter yang dipilih.
            </p>
        </div>
    );
}

export default function OrdersIndex({ orders, filters, eventOptions, isAdmin, feeRate }: Props) {
    setLayoutProps({ breadcrumbs });

    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (overrides: Partial<typeof filters>) => {
        const params: Record<string, string | number | undefined> = {
            payment_status: overrides.payment_status ?? filters.payment_status,
            event_id: overrides.event_id ?? filters.event_id ?? undefined,
            search: overrides.search !== undefined ? overrides.search : (filters.search ?? undefined),
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

    return (
        <>
            <Head title="Manajemen Order" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        {isAdmin ? 'Semua Order' : 'Order Saya'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAdmin
                            ? `Seluruh data transaksi platform (fee ${(feeRate * 100).toFixed(0)}% per transaksi berbayar) · ${orders.total} total`
                            : `Order dari event yang Anda selenggarakan · ${orders.total} total`}
                    </p>
                </div>

                {/* Filter bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari no. order, nama, email…"
                            className="border-2 border-foreground/40 pl-8 pr-8 text-sm font-medium focus-visible:border-foreground"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Hapus pencarian"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </form>

                    {/* Event filter */}
                    <Select
                        value={filters.event_id ? String(filters.event_id) : 'all'}
                        onValueChange={(val) =>
                            applyFilters({ event_id: val === 'all' ? null : Number(val) })
                        }
                    >
                        <SelectTrigger className="w-full border-2 border-foreground/40 text-sm font-semibold sm:w-56">
                            <CalendarDays className="mr-1.5 size-3.5 shrink-0 text-muted-foreground" />
                            <SelectValue placeholder="Filter Event" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-foreground">
                            <SelectItem value="all" className="font-semibold">
                                Semua Event
                            </SelectItem>
                            {eventOptions.map((e) => (
                                <SelectItem key={e.id} value={String(e.id)} className="font-semibold">
                                    {e.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status tabs */}
                <div className="flex flex-wrap gap-2">
                    {PAYMENT_STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => applyFilters({ payment_status: tab.key })}
                            className={`rounded-none border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                                (filters.payment_status ?? 'all') === tab.key
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {orders.data.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="overflow-hidden rounded-lg border-2 border-foreground bg-background shadow-xs">
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
                                                        <td className="px-4 py-3.5 align-middle text-right">
                                                            {order.payment_status === 'paid' && order.total_price > 0 ? (
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                    {order.formatted_fee ?? formatCurrency((order.total_price * feeRate))}
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

                        {/* Summary row (admin: total fees) */}
                        {isAdmin && (
                            <div className="flex items-center justify-end gap-2 rounded-lg border-2 border-foreground bg-muted/40 px-4 py-3">
                                <CreditCard className="size-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-muted-foreground">
                                    Total Fee Halaman Ini:
                                </span>
                                <span className="font-black text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(
                                        orders.data
                                            .filter((o) => o.payment_status === 'paid' && o.total_price > 0)
                                            .reduce((sum, o) => sum + (o.platform_fee ?? o.total_price * feeRate), 0),
                                    )}
                                </span>
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {orders.prev_page_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-2 border-foreground font-bold"
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
                                        className="border-2 border-foreground font-bold"
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

