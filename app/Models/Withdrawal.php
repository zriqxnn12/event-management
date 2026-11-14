<?php

namespace App\Models;

use Database\Factories\WithdrawalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $reference_number
 * @property int $user_id
 * @property float $amount
 * @property string $bank_name
 * @property string $account_number
 * @property string $account_name
 * @property string $status pending|approved|rejected
 * @property string|null $notes
 * @property string|null $admin_notes
 * @property int|null $approved_by
 * @property Carbon|null $processed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'reference_number',
    'user_id',
    'amount',
    'bank_name',
    'account_number',
    'account_name',
    'status',
    'notes',
    'admin_notes',
    'approved_by',
    'processed_at',
])]
class Withdrawal extends Model
{
    /** @use HasFactory<WithdrawalFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * Get the vendor user who requested the withdrawal.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin user who approved/rejected the withdrawal.
     *
     * @return BelongsTo<User, $this>
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Generate a unique, readable reference number for the withdrawal.
     */
    public static function generateReferenceNumber(): string
    {
        return 'WD-'.date('Ymd').'-'.strtoupper(Str::random(6));
    }
}
