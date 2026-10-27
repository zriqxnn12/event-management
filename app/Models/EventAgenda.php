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
 * @property string $title
 * @property string|null $description
 * @property string $start_time
 * @property string|null $end_time
 * @property string|null $speaker_name
 * @property int $order
 * @property string|null $date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['event_id', 'title', 'description', 'start_time', 'end_time', 'speaker_name', 'order', 'date'])]
class EventAgenda extends Model
{
    use SoftDeletes;

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
