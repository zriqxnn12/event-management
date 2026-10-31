<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $number
 * @property int|null $user_id
 * @property int $event_id
 * @property int $event_ticket_id
 * @property string $attendee_name
 * @property string $attendee_email
 * @property string|null $attendee_phone
 * @property string|null $notes
 * @property int $quantity
 * @property float $total_price
 * @property string $payment_status pending|paid|expired|cancelled
 * @property string|null $snap_token
 */
#[Fillable([
    'number', 'user_id', 'event_id', 'event_ticket_id',
    'attendee_name', 'attendee_email', 'attendee_phone', 'notes',
    'quantity', 'total_price', 'payment_status', 'snap_token',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(EventTicket::class, 'event_ticket_id');
    }

    /** Generate a unique, human-readable order number. */
    public static function generateNumber(): string
    {
        return 'ORD-'.strtoupper(uniqid());
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'number';
    }
}
