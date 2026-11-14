<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    /** Platform fee rate applied to calculate vendor net revenue (3%). */
    private const PLATFORM_FEE_RATE = 0.03;

    /** Minimum withdrawal amount in Rupiah. */
    private const MINIMUM_WITHDRAWAL_AMOUNT = 50000;

    /**
     * Display a paginated list of withdrawals and financial summaries.
     *
     * - Admin: sees all withdrawal requests from all vendors with approval controls.
     * - Vendor: sees their own withdrawal requests, balance, and withdrawal form.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $isAdmin = $user->role === 'admin';

        $status = $request->query('status', 'all');
        $search = $request->query('search');

        // Base query for withdrawals
        $withdrawalsQuery = Withdrawal::query()
            ->with(['user:id,name,email,username', 'approver:id,name'])
            ->when(! $isAdmin, fn ($q) => $q->where('user_id', $user->id))
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where(fn ($sq) => $sq
                ->where('reference_number', 'like', "%{$search}%")
                ->orWhere('account_number', 'like', "%{$search}%")
                ->orWhere('account_name', 'like', "%{$search}%")
                ->orWhere('bank_name', 'like', "%{$search}%")
                ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            ))
            ->latest();

        $withdrawals = $withdrawalsQuery->paginate(15)->withQueryString();

        $withdrawals->getCollection()->transform(fn ($w) => [
            'id' => $w->id,
            'reference_number' => $w->reference_number,
            'amount' => (float) $w->amount,
            'formatted_amount' => 'Rp '.number_format((float) $w->amount, 0, ',', '.'),
            'bank_name' => $w->bank_name,
            'account_number' => $w->account_number,
            'account_name' => $w->account_name,
            'status' => $w->status,
            'notes' => $w->notes,
            'admin_notes' => $w->admin_notes,
            'created_at' => $w->created_at?->format('d M Y, H:i') ?? '',
            'created_at_human' => $w->created_at?->diffForHumans() ?? '',
            'processed_at' => $w->processed_at?->format('d M Y, H:i'),
            'user' => $w->user ? [
                'id' => $w->user->id,
                'name' => $w->user->name,
                'email' => $w->user->email,
                'username' => $w->user->username,
            ] : null,
            'approver' => $w->approver ? [
                'id' => $w->approver->id,
                'name' => $w->approver->name,
            ] : null,
        ]);

        // Calculate vendor metrics or admin platform stats
        if ($isAdmin) {
            $approvedSum = (float) Withdrawal::where('status', 'approved')->sum('amount');
            $pendingSum = (float) Withdrawal::where('status', 'pending')->sum('amount');
            $rejectedSum = (float) Withdrawal::where('status', 'rejected')->sum('amount');

            $stats = [
                'total_approved_amount' => $approvedSum,
                'formatted_approved_amount' => 'Rp '.number_format($approvedSum, 0, ',', '.'),
                'total_pending_amount' => $pendingSum,
                'formatted_pending_amount' => 'Rp '.number_format($pendingSum, 0, ',', '.'),
                'total_rejected_amount' => $rejectedSum,
                'formatted_rejected_amount' => 'Rp '.number_format($rejectedSum, 0, ',', '.'),
                'pending_count' => Withdrawal::where('status', 'pending')->count(),
                'approved_count' => Withdrawal::where('status', 'approved')->count(),
                'rejected_count' => Withdrawal::where('status', 'rejected')->count(),
                'available_balance' => null,
                'formatted_available_balance' => null,
                'net_earnings' => null,
                'formatted_net_earnings' => null,
            ];
        } else {
            // Vendor specific revenue calculations
            $vendorEventIds = Event::withTrashed()->where('user_id', $user->id)->pluck('id');
            $grossRevenue = (float) Order::whereIn('event_id', $vendorEventIds)
                ->where('payment_status', 'paid')
                ->sum('total_price');

            $platformFee = (float) bcmul((string) $grossRevenue, (string) self::PLATFORM_FEE_RATE, 2);
            $netEarnings = max(0, $grossRevenue - $platformFee);

            $committedAmount = (float) Withdrawal::where('user_id', $user->id)
                ->whereIn('status', ['approved', 'pending'])
                ->sum('amount');

            $availableBalance = max(0, $netEarnings - $committedAmount);

            $totalWithdrawn = (float) Withdrawal::where('user_id', $user->id)
                ->where('status', 'approved')
                ->sum('amount');

            $pendingAmount = (float) Withdrawal::where('user_id', $user->id)
                ->where('status', 'pending')
                ->sum('amount');

            $stats = [
                'available_balance' => $availableBalance,
                'formatted_available_balance' => 'Rp '.number_format($availableBalance, 0, ',', '.'),
                'net_earnings' => $netEarnings,
                'formatted_net_earnings' => 'Rp '.number_format($netEarnings, 0, ',', '.'),
                'gross_revenue' => $grossRevenue,
                'formatted_gross_revenue' => 'Rp '.number_format($grossRevenue, 0, ',', '.'),
                'platform_fee' => $platformFee,
                'formatted_platform_fee' => 'Rp '.number_format($platformFee, 0, ',', '.'),
                'total_withdrawn' => $totalWithdrawn,
                'formatted_total_withdrawn' => 'Rp '.number_format($totalWithdrawn, 0, ',', '.'),
                'pending_amount' => $pendingAmount,
                'formatted_pending_amount' => 'Rp '.number_format($pendingAmount, 0, ',', '.'),
                'pending_count' => Withdrawal::where('user_id', $user->id)->where('status', 'pending')->count(),
                'approved_count' => Withdrawal::where('user_id', $user->id)->where('status', 'approved')->count(),
                'rejected_count' => Withdrawal::where('user_id', $user->id)->where('status', 'rejected')->count(),
            ];
        }

        return Inertia::render('withdrawals/index', [
            'withdrawals' => $withdrawals,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'stats' => $stats,
            'isAdmin' => $isAdmin,
            'minWithdrawalAmount' => self::MINIMUM_WITHDRAWAL_AMOUNT,
            'formattedMinWithdrawalAmount' => 'Rp '.number_format(self::MINIMUM_WITHDRAWAL_AMOUNT, 0, ',', '.'),
        ]);
    }

    /**
     * Store a new withdrawal request submitted by a vendor.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:'.self::MINIMUM_WITHDRAWAL_AMOUNT],
            'bank_name' => ['required', 'string', 'max:50'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_name' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            // Lock the vendor row to serialize concurrent withdrawal submissions
            User::where('id', $user->id)->lockForUpdate()->first();

            // Calculate available balance to verify sufficient funds
            $vendorEventIds = Event::withTrashed()->where('user_id', $user->id)->pluck('id');
            $grossRevenue = (float) Order::whereIn('event_id', $vendorEventIds)
                ->where('payment_status', 'paid')
                ->sum('total_price');

            $platformFee = (float) bcmul((string) $grossRevenue, (string) self::PLATFORM_FEE_RATE, 2);
            $netEarnings = max(0, $grossRevenue - $platformFee);

            $committedAmount = (float) Withdrawal::where('user_id', $user->id)
                ->whereIn('status', ['approved', 'pending'])
                ->sum('amount');

            $availableBalance = max(0, $netEarnings - $committedAmount);

            if ((float) $validated['amount'] > $availableBalance) {
                throw ValidationException::withMessages([
                    'amount' => 'Saldo yang dapat ditarik tidak mencukupi (Saldo tersedia: Rp '.number_format($availableBalance, 0, ',', '.').').',
                ]);
            }

            Withdrawal::create([
                'reference_number' => Withdrawal::generateReferenceNumber(),
                'user_id' => $user->id,
                'amount' => $validated['amount'],
                'bank_name' => $validated['bank_name'],
                'account_number' => $validated['account_number'],
                'account_name' => $validated['account_name'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->route('withdrawals.index')->with('success', 'Permintaan penarikan dana berhasil diajukan dan sedang menunggu persetujuan admin.');
    }

    /**
     * Update withdrawal status (approve or reject) by an administrator.
     */
    public function updateStatus(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->role !== 'admin') {
            abort(403, 'Hanya administrator yang dapat mengubah status penarikan.');
        }

        if ($withdrawal->status !== 'pending') {
            return redirect()->route('withdrawals.index')->with('error', 'Permintaan penarikan ini sudah diproses sebelumnya.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $affected = Withdrawal::where('id', $withdrawal->id)
            ->where('status', 'pending')
            ->update([
                'status' => $validated['status'],
                'admin_notes' => $validated['admin_notes'] ?? null,
                'approved_by' => $user->id,
                'processed_at' => now(),
            ]);

        if ($affected !== 1) {
            return redirect()->route('withdrawals.index')->with('error', 'Permintaan penarikan ini sudah diproses sebelumnya.');
        }

        $actionText = $validated['status'] === 'approved' ? 'disetujui' : 'ditolak';

        return redirect()->route('withdrawals.index')->with('success', "Permintaan penarikan {$withdrawal->reference_number} berhasil {$actionText}.");
    }
}
