<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $event_id
 * @property string $title
 * @property string|null $description
 * @property string $start_time
 * @property string|null $end_time
 * @property string|null $speaker_name
 * @property int $order
 * @property string|null $date
 */
#[Fillable(['event_id', 'title', 'description', 'start_time', 'end_time', 'speaker_name', 'order', 'date'])]
class EventAgenda extends Model
{
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
