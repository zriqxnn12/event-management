<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string|null $logo
 * @property string|null $website_url
 * @property string $tier platinum|gold|silver|bronze|partner
 * @property int $order
 */
#[Fillable(['event_id', 'name', 'logo', 'website_url', 'tier', 'order'])]
class EventSponsor extends Model
{
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
