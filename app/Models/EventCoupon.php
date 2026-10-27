<?php

namespace App\Models;

use Database\Factories\EventCouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $event_id
 * @property string $code
 * @property string|null $description
 * @property string $discount_type percentage|fixed
 * @property float $discount_value
 * @property float|null $max_discount_amount
 * @property int|null $max_uses
 * @property int $used_count
 * @property int $max_uses_per_user
 * @property float|null $minimum_purchase
 * @property Carbon|null $valid_from
 * @property Carbon|null $valid_until
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'event_id', 'code', 'description', 'discount_type', 'discount_value',
    'max_discount_amount', 'max_uses', 'used_count', 'max_uses_per_user',
    'minimum_purchase', 'valid_from', 'valid_until', 'is_active',
])]
class EventCoupon extends Model
{
    /** @use HasFactory<EventCouponFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'is_active' => 'boolean',
            'discount_value' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'minimum_purchase' => 'decimal:2',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        $now = now();

        if ($this->valid_from && $now->lt($this->valid_from)) {
            return false;
        }

        if ($this->valid_until && $now->gt($this->valid_until)) {
            return false;
        }

        return true;
    }
}
