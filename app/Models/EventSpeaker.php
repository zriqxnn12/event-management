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
 * @property string|null $title
 * @property string|null $company
 * @property string|null $bio
 * @property string|null $avatar
 * @property string|null $linkedin_url
 * @property string|null $twitter_url
 * @property int $order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['event_id', 'name', 'title', 'company', 'bio', 'avatar', 'linkedin_url', 'twitter_url', 'order'])]
class EventSpeaker extends Model
{
    use SoftDeletes;

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
