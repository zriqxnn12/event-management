<?php

namespace App\Models;

use Database\Factories\EventTicketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string|null $description
 * @property string $type free|paid
 * @property float $price
 * @property int|null $quota
 * @property int $sold
 * @property Carbon|null $sale_start
 * @property Carbon|null $sale_end
 * @property array<int, string>|null $perks
 * @property bool $is_active
 * @property int $order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'event_id', 'name', 'description', 'type', 'price', 'quota', 'sold',
    'sale_start', 'sale_end', 'perks', 'is_active', 'order',
])]
class EventTicket extends Model
{
    /** @use HasFactory<EventTicketFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'perks' => 'array',
            'sale_start' => 'datetime',
            'sale_end' => 'datetime',
            'is_active' => 'boolean',
            'price' => 'decimal:2',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'event_ticket_id');
    }

    /**
     * Recalculate and update the sold count based on paid orders.
     */
    public function recalculateSold(): int
    {
        $soldCount = (int) $this->orders()->where('payment_status', 'paid')->sum('quantity');
        $this->update(['sold' => $soldCount]);

        return $soldCount;
    }

    public function getRemainingQuotaAttribute(): ?int
    {
        if ($this->quota === null) {
            return null;
        }

        return max(0, $this->quota - $this->sold);
    }
}
