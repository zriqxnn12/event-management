import { Head, router, setLayoutProps, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownToLine,
    Banknote,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    Filter,
    Plus,
    RotateCcw,
    Search,
    TrendingUp,
    User,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { index as withdrawalsIndex, store as withdrawalsStore, updateStatus as withdrawalsUpdateStatus } from '@/actions/App/Http/Controllers/WithdrawalController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem, WithdrawalRow, WithdrawalStatus, WithdrawalsIndexProps as Props } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Penarikan Dana', href: withdrawalsIndex().url },
];

const STATUS_TABS = [
    { key: 'all', label: 'Semua Status' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'rejected', label: 'Ditolak' },
];

const STATUS_CONFIG: Record<
    WithdrawalStatus,
    { label: string; className: string; icon: typeof Clock }
> = {
    pending: {
        label: 'Menunggu',
        className: 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
        icon: Clock,
    },
    approved: {
        label: 'Disetujui',
        className: 'border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-500',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Ditolak',
        className: 'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive',
        icon: XCircle,
    },
};

const BANK_OPTIONS = [
    { label: 'Bank BCA', value: 'BCA' },
    { label: 'Bank Mandiri', value: 'Mandiri' },
    { label: 'Bank BNI', value: 'BNI' },
    { label: 'Bank BRI', value: 'BRI' },
    { label: 'Bank Syariah Indonesia (BSI)', value: 'BSI' },
    { label: 'Bank CIMB Niaga', value: 'CIMB Niaga' },
    { label: 'Bank Permata', value: 'Permata' },
    { label: 'Bank Jago', value: 'Bank Jago' },
    { label: 'GoPay', value: 'GoPay' },
    { label: 'OVO', value: 'OVO' },
    { label: 'DANA', value: 'DANA' },
    { label: 'ShopeePay', value: 'ShopeePay' },
];

function formatCurrency(value: number): string {
    return 'Rp ' + value.toLocaleString('id-ID', { minimumFractionDigits: 0 });
}

export default function WithdrawalsIndex({
    withdrawals,
    filters,
    stats,
    isAdmin,
    minWithdrawalAmount,
    formattedMinWithdrawalAmount,
}: Props) {
    setLayoutProps({ breadcrumbs });

    const [search, setSearch] = useState(filters.search ?? '');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedWithdrawalForProcess, setSelectedWithdrawalForProcess] = useState<WithdrawalRow | null>(null);

    // Vendor withdrawal form
    const createForm = useForm({
        amount: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        notes: '',
    });

    // Admin process form
    const processForm = useForm({
        status: 'approved' as 'approved' | 'rejected',
        admin_notes: '',
    });

    const applyFilters = (overrides: Partial<typeof filters>) => {
        const params: Record<string, string | undefined> = {
            status: overrides.status ?? filters.status,
            search: (overrides.search !== undefined ? overrides.search : filters.search) ?? undefined,
        };

        if (params.status === 'all') delete params.status;
        if (!params.search) delete params.search;

        router.get(withdrawalsIndex().url, params as Record<string, string>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleResetFilters = () => {
        setSearch('');
        applyFilters({ status: 'all', search: '' });
    };

    const handleOpenCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
        createForm.reset();
        createForm.clearErrors();
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(withdrawalsStore().url, {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenProcessModal = (withdrawal: WithdrawalRow) => {
        setSelectedWithdrawalForProcess(withdrawal);
        processForm.setData({
            status: 'approved',
            admin_notes: '',
        });
        processForm.clearErrors();
    };

    const handleCloseProcessModal = () => {
        setSelectedWithdrawalForProcess(null);
        processForm.reset();
    };

    const handleProcessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWithdrawalForProcess) return;

        processForm.patch(
            withdrawalsUpdateStatus({ withdrawal: selectedWithdrawalForProcess.id }).url,
            {
                onSuccess: () => {
                    setSelectedWithdrawalForProcess(null);
                    processForm.reset();
                },
            }
        );
    };

    const availableBalance = stats.available_balance ?? 0;
    const canWithdraw = availableBalance >= minWithdrawalAmount;

    return (
        <>
            <Head title="Penarikan Dana" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                            {isAdmin ? 'Manajemen Penarikan Dana (Vendor)' : 'Penarikan Dana'}
                        </h1>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            {isAdmin
                                ? 'Tinjau, setujui, atau tolak permintaan pencairan dana dari seluruh vendor.'
                                : 'Kelola dan ajukan penarikan pendapatan dari tiket event Anda.'}
                        </p>
                    </div>

                    {!isAdmin && (
                        <Button
                            type="button"
                            onClick={handleOpenCreateModal}
                            disabled={!canWithdraw}
                            className="h-11 border-2 border-foreground bg-primary px-5 font-black text-primary-foreground shadow-[3px_3px_0px_0px_#000] transition-transform hover:-translate-y-0.5 disabled:opacity-50 dark:shadow-[3px_3px_0px_0px_#fff]"
                        >
                            <ArrowDownToLine className="mr-2 size-4" />
                            Tarik Dana
                        </Button>
                    )}
                </div>

                {/* Stat Cards */}
                {isAdmin ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Total Berhasil Dicairkan
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-emerald-500 text-white">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-2xl font-black">
                                {stats.formatted_approved_amount ?? 'Rp 0'}
                            </p>
                            <p className="mt-1 text-xs font-bold text-muted-foreground">
                                {stats.approved_count} permintaan telah disetujui
                            </p>
                        </div>

                        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Menunggu Persetujuan
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-amber-400 text-black">
                                    <Clock className="size-4" />
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                                {stats.formatted_pending_amount ?? 'Rp 0'}
                            </p>
                            <p className="mt-1 text-xs font-bold text-muted-foreground">
                                {stats.pending_count} permintaan butuh tindakan
                            </p>
                        </div>

                        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Permintaan Ditolak
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-destructive text-destructive-foreground">
                                    <XCircle className="size-4" />
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-2xl font-black text-destructive">
                                {stats.formatted_rejected_amount ?? 'Rp 0'}
                            </p>
                            <p className="mt-1 text-xs font-bold text-muted-foreground">
                                {stats.rejected_count} permintaan ditolak
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Saldo Tersedia */}
                        <div className="rounded-xl border-2 border-foreground bg-emerald-500/10 p-5 shadow-[4px_4px_0px_0px_#000] dark:bg-emerald-950/20 dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                    Saldo Tersedia
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-emerald-500 text-white">
                                    <Wallet className="size-4" />
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-2xl font-black text-emerald-700 dark:text-emerald-300">
                                {stats.formatted_available_balance ?? 'Rp 0'}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                                Min. penarikan {formattedMinWithdrawalAmount}
                            </p>
                        </div>

                        {/* Total Pendapatan Bersih */}
                        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Pendapatan Bersih
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-muted">
                                    <TrendingUp className="size-4" />
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-2xl font-black">
                                {stats.formatted_net_earnings ?? 'Rp 0'}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                                Bersih 97% (Fee platform 3%)
                            </p>
                        </div>

                        {/* Total Berhasil Ditarik */}
                        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Berhasil Ditarik
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-muted">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-2xl font-black">
                                {stats.formatted_total_withdrawn ?? 'Rp 0'}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                                {stats.approved_count} penarikan sukses
                            </p>
                        </div>

                        {/* Sedang Diproses */}
                        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                    Sedang Diproses
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-lg border-2 border-foreground bg-amber-400 text-black">
                                    <Clock className="size-4" />
                                </div>
                            </div>
                            <p className="mt-3 font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                                {stats.formatted_pending_amount ?? 'Rp 0'}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                                {stats.pending_count} menunggu persetujuan
                            </p>
                        </div>
                    </div>
                )}

                {/* Filter Card */}
                <div className="rounded-xl border-2 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 lg:max-w-md">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={
                                    isAdmin
                                        ? 'Cari no. ref, nama vendor, bank, rekening…'
                                        : 'Cari no. ref, bank, nomor rekening…'
                                }
                                className="h-10 border-2 placeholder:text-slate-400 border-foreground/40 pl-9 pr-9 text-sm font-medium focus-visible:border-foreground"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters({ search: '' });
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </form>

                        {/* Status Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Filter className="mr-1 size-4 text-muted-foreground" />
                            {STATUS_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => applyFilters({ status: tab.key })}
                                    className={`rounded-md border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                                        (filters.status ?? 'all') === tab.key
                                            ? 'border-foreground bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                                            : 'border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                            {(filters.status !== 'all' || filters.search) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="ml-auto border-2 border-foreground/40 text-xs font-bold"
                                >
                                    <RotateCcw className="mr-1 size-3" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="rounded-xl border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                    {withdrawals.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-3 flex size-12 items-center justify-center rounded-xl border-2 border-foreground/30 bg-muted/40">
                                <Wallet className="size-6 text-foreground/40" />
                            </div>
                            <h3 className="text-base font-black">Belum ada riwayat penarikan</h3>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                {filters.search || filters.status !== 'all'
                                    ? 'Tidak ada data penarikan yang cocok dengan filter pencarian Anda.'
                                    : isAdmin
                                      ? 'Belum ada permintaan penarikan dari vendor.'
                                      : 'Anda belum pernah mengajukan penarikan dana.'}
                            </p>
                            {(filters.search || filters.status !== 'all') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="mt-4 border-2 border-foreground font-bold"
                                >
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b-2 border-foreground/20 bg-muted/40 text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">No. Referensi</th>
                                            {isAdmin && <th className="px-4 py-3">Vendor</th>}
                                            <th className="px-4 py-3">Nominal</th>
                                            <th className="px-4 py-3">Tujuan Transfer</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Catatan / Diproses</th>
                                            {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-foreground/10">
                                        {withdrawals.data.map((item) => {
                                            const statusCfg = STATUS_CONFIG[item.status];
                                            const StatusIcon = statusCfg.icon;

                                            return (
                                                <tr key={item.id} className="transition-colors hover:bg-muted/30">
                                                    {/* Ref & Date */}
                                                    <td className="px-4 py-3 align-middle">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-mono text-xs font-black tracking-wide">
                                                                {item.reference_number}
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-muted-foreground">
                                                                {item.created_at}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Vendor (Admin only) */}
                                                    {isAdmin && (
                                                        <td className="px-4 py-3 align-middle">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="font-bold">{item.user?.name ?? '—'}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {item.user?.email ?? ''}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    )}

                                                    {/* Nominal */}
                                                    <td className="px-4 py-3 align-middle">
                                                        <span className="font-mono text-base font-black">
                                                            {item.formatted_amount}
                                                        </span>
                                                    </td>

                                                    {/* Tujuan Transfer */}
                                                    <td className="px-4 py-3 align-middle">
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge variant="outline" className="border-2 border-foreground/40 font-black text-xs">
                                                                    {item.bank_name}
                                                                </Badge>
                                                                <span className="font-mono text-xs font-bold">
                                                                    {item.account_number}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs font-semibold text-muted-foreground">
                                                                a.n. {item.account_name}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3 align-middle">
                                                        <Badge className={`w-fit border-2 font-bold text-xs ${statusCfg.className}`}>
                                                            <StatusIcon className="mr-1 size-3" />
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </td>

                                                    {/* Notes / Processed */}
                                                    <td className="px-4 py-3 align-middle">
                                                        <div className="flex flex-col gap-0.5 text-xs">
                                                            {item.notes && (
                                                                <span className="italic text-muted-foreground">
                                                                    Catatan: "{item.notes}"
                                                                </span>
                                                            )}
                                                            {item.admin_notes && (
                                                                <span className="font-semibold text-foreground">
                                                                    Admin: {item.admin_notes}
                                                                </span>
                                                            )}
                                                            {item.processed_at && (
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    Diproses: {item.processed_at}
                                                                </span>
                                                            )}
                                                            {!item.notes && !item.admin_notes && !item.processed_at && (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Action (Admin) */}
                                                    {isAdmin && (
                                                        <td className="px-4 py-3 align-middle text-right">
                                                            {item.status === 'pending' ? (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => handleOpenProcessModal(item)}
                                                                    className="h-8 border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 dark:shadow-[2px_2px_0px_0px_#fff]"
                                                                >
                                                                    Proses
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs font-semibold text-muted-foreground">
                                                                    Selesai
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {withdrawals.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 border-t-2 border-foreground/10 p-4">
                                    {withdrawals.prev_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-2 border-foreground font-bold"
                                            onClick={() => router.get(withdrawals.prev_page_url!)}
                                        >
                                            ← Sebelumnya
                                        </Button>
                                    )}
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        Halaman {withdrawals.current_page} dari {withdrawals.last_page}
                                    </span>
                                    {withdrawals.next_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-2 border-foreground font-bold"
                                            onClick={() => router.get(withdrawals.next_page_url!)}
                                        >
                                            Selanjutnya →
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal: Ajukan Penarikan Dana (Vendor) */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="border-2 border-foreground shadow-[6px_6px_0px_0px_#000] sm:max-w-lg dark:shadow-[6px_6px_0px_0px_#fff]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Ajukan Penarikan Dana</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Pencairan dana hasil penjualan tiket event akan ditransfer ke rekening / e-wallet yang Anda daftarkan.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Saldo banner */}
                    <div className="rounded-lg border-2 border-emerald-600 bg-emerald-50 p-3.5 dark:bg-emerald-950/30">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">
                                Saldo Tersedia untuk Ditarik
                            </span>
                            <span className="font-mono text-base font-black text-emerald-800 dark:text-emerald-200">
                                {formatCurrency(availableBalance)}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        {/* Jumlah Penarikan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="amount" className="text-xs font-bold">
                                Nominal Penarikan (Rp) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min={minWithdrawalAmount}
                                max={availableBalance}
                                step="1000"
                                value={createForm.data.amount}
                                onChange={(e) => createForm.setData('amount', e.target.value)}
                                placeholder="Contoh: 150000"
                                className="h-10 border-2 border-foreground/40 font-mono font-bold"
                                required
                            />
                            {/* Quick amount buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {[50000, 100000, 250000, 500000].map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        disabled={amt > availableBalance}
                                        onClick={() => createForm.setData('amount', String(amt))}
                                        className="rounded border border-foreground/30 px-2 py-0.5 text-[11px] font-bold text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-40"
                                    >
                                        +{formatCurrency(amt)}
                                    </button>
                                ))}
                                {availableBalance >= minWithdrawalAmount && (
                                    <button
                                        type="button"
                                        onClick={() => createForm.setData('amount', String(Math.floor(availableBalance)))}
                                        className="rounded border border-emerald-600 bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                                    >
                                        Tarik Semua Saldo
                                    </button>
                                )}
                            </div>
                            {createForm.errors.amount && (
                                <p className="text-xs font-bold text-destructive">{createForm.errors.amount}</p>
                            )}
                        </div>

                        {/* Pilihan Bank / E-Wallet */}
                        <div className="space-y-1.5">
                            <Label htmlFor="bank_name" className="text-xs font-bold">
                                Bank / E-Wallet <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={createForm.data.bank_name}
                                onValueChange={(val) => createForm.setData('bank_name', val)}
                            >
                                <SelectTrigger id="bank_name" className="h-10 border-2 border-foreground/40 font-bold">
                                    <SelectValue placeholder="Pilih Bank atau E-Wallet…" />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-foreground">
                                    {BANK_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value} className="font-semibold">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {createForm.errors.bank_name && (
                                <p className="text-xs font-bold text-destructive">{createForm.errors.bank_name}</p>
                            )}
                        </div>

                        {/* Nomor Rekening */}
                        <div className="space-y-1.5">
                            <Label htmlFor="account_number" className="text-xs font-bold">
                                Nomor Rekening / Nomor E-Wallet <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="account_number"
                                type="text"
                                value={createForm.data.account_number}
                                onChange={(e) => createForm.setData('account_number', e.target.value)}
                                placeholder="Contoh: 1234567890 atau 08123456789"
                                className="h-10 border-2 border-foreground/40 font-mono font-bold"
                                required
                            />
                            {createForm.errors.account_number && (
                                <p className="text-xs font-bold text-destructive">{createForm.errors.account_number}</p>
                            )}
                        </div>

                        {/* Nama Pemilik Rekening */}
                        <div className="space-y-1.5">
                            <Label htmlFor="account_name" className="text-xs font-bold">
                                Nama Pemilik Rekening / Akun <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="account_name"
                                type="text"
                                value={createForm.data.account_name}
                                onChange={(e) => createForm.setData('account_name', e.target.value)}
                                placeholder="Sesuai buku tabungan / akun e-wallet"
                                className="h-10 border-2 border-foreground/40 font-semibold"
                                required
                            />
                            {createForm.errors.account_name && (
                                <p className="text-xs font-bold text-destructive">{createForm.errors.account_name}</p>
                            )}
                        </div>

                        {/* Catatan Tambahan (Opsional) */}
                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-xs font-bold">
                                Catatan (Opsional)
                            </Label>
                            <Input
                                id="notes"
                                type="text"
                                value={createForm.data.notes}
                                onChange={(e) => createForm.setData('notes', e.target.value)}
                                placeholder="Pesan atau keterangan tambahan"
                                className="h-10 border-2 border-foreground/40 text-xs"
                            />
                            {createForm.errors.notes && (
                                <p className="text-xs font-bold text-destructive">{createForm.errors.notes}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseCreateModal}
                                className="border-2 border-foreground font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 dark:shadow-[2px_2px_0px_0px_#fff]"
                            >
                                {createForm.processing ? 'Mengajukan…' : 'Kirim Pengajuan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Proses Penarikan (Admin Only) */}
            <Dialog open={!!selectedWithdrawalForProcess} onOpenChange={(open) => !open && handleCloseProcessModal()}>
                <DialogContent className="border-2 border-foreground shadow-[6px_6px_0px_0px_#000] sm:max-w-md dark:shadow-[6px_6px_0px_0px_#fff]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black">Proses Penarikan Dana</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Tentukan status persetujuan untuk permintaan penarikan dana ini.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedWithdrawalForProcess && (
                        <div className="space-y-3 rounded-lg border-2 border-foreground/20 bg-muted/30 p-3 text-xs">
                            <div className="flex justify-between">
                                <span className="font-bold text-muted-foreground">No. Referensi:</span>
                                <span className="font-mono font-black">{selectedWithdrawalForProcess.reference_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-muted-foreground">Vendor:</span>
                                <span className="font-bold">{selectedWithdrawalForProcess.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-muted-foreground">Nominal:</span>
                                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
                                    {selectedWithdrawalForProcess.formatted_amount}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-muted-foreground">Bank / Rekening:</span>
                                <span className="font-bold">
                                    {selectedWithdrawalForProcess.bank_name} - {selectedWithdrawalForProcess.account_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-muted-foreground">Atas Nama:</span>
                                <span className="font-bold">{selectedWithdrawalForProcess.account_name}</span>
                            </div>
                            {selectedWithdrawalForProcess.notes && (
                                <div className="border-t border-foreground/10 pt-2 text-[11px] italic text-muted-foreground">
                                    "{selectedWithdrawalForProcess.notes}"
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleProcessSubmit} className="space-y-4 pt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Keputusan Tindakan</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => processForm.setData('status', 'approved')}
                                    className={`rounded-lg border-2 p-2.5 text-xs font-bold transition-all ${
                                        processForm.data.status === 'approved'
                                            ? 'border-emerald-600 bg-emerald-500 text-white shadow-[2px_2px_0px_0px_#000]'
                                            : 'border-foreground/30 hover:border-foreground'
                                    }`}
                                >
                                    ✓ Setujui Penarikan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => processForm.setData('status', 'rejected')}
                                    className={`rounded-lg border-2 p-2.5 text-xs font-bold transition-all ${
                                        processForm.data.status === 'rejected'
                                            ? 'border-destructive bg-destructive text-destructive-foreground shadow-[2px_2px_0px_0px_#000]'
                                            : 'border-foreground/30 hover:border-foreground'
                                    }`}
                                >
                                    ✕ Tolak Penarikan
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="admin_notes" className="text-xs font-bold">
                                {processForm.data.status === 'approved'
                                    ? 'Catatan / No. Referensi Transfer Bank (Opsional)'
                                    : 'Alasan Penolakan (Disarankan)'}
                            </Label>
                            <Input
                                id="admin_notes"
                                type="text"
                                value={processForm.data.admin_notes}
                                onChange={(e) => processForm.setData('admin_notes', e.target.value)}
                                placeholder={
                                    processForm.data.status === 'approved'
                                        ? 'Contoh: Transfer via BCA ref #12345678'
                                        : 'Contoh: Nomor rekening tidak sesuai / tidak aktif'
                                }
                                className="h-10 border-2 border-foreground/40 text-xs"
                            />
                            {processForm.errors.admin_notes && (
                                <p className="text-xs font-bold text-destructive">{processForm.errors.admin_notes}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseProcessModal}
                                className="border-2 border-foreground font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processForm.processing}
                                className={`border-2 border-foreground font-bold shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 dark:shadow-[2px_2px_0px_0px_#fff] ${
                                    processForm.data.status === 'approved'
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                }`}
                            >
                                {processForm.processing ? 'Menyimpan…' : 'Simpan Keputusan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
