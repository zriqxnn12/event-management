<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string|null $logo
 * @property string|null $website_url
 * @property string $tier platinum|gold|silver|bronze|partner
 * @property int $order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['event_id', 'name', 'logo', 'website_url', 'tier', 'order'])]
class EventSponsor extends Model
{
    use SoftDeletes;

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
