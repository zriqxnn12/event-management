<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
 */
#[Fillable(['event_id', 'name', 'title', 'company', 'bio', 'avatar', 'linkedin_url', 'twitter_url', 'order'])]
class EventSpeaker extends Model
{
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
