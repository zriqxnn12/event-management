<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $slug
 * @property string|null $description
 * @property string $category
 * @property string $type online|offline|hybrid
 * @property string $status draft|published|cancelled|completed
 * @property string|null $location_name
 * @property string|null $location_address
 * @property string|null $location_maps_url
 * @property string|null $online_platform
 * @property string|null $online_url
 * @property string|null $online_url_password
 * @property bool $online_url_protected
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property Carbon|null $registration_start
 * @property Carbon|null $registration_end
 * @property int|null $max_attendees
 * @property string|null $cover_image
 * @property array<int, string>|null $tags
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'user_id', 'title', 'slug', 'description', 'category', 'type', 'status',
    'location_name', 'location_address', 'location_maps_url',
    'online_platform', 'online_url', 'online_url_password', 'online_url_protected',
    'start_date', 'end_date', 'registration_start', 'registration_end',
    'max_attendees', 'cover_image', 'tags',
])]
class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'registration_start' => 'datetime',
            'registration_end' => 'datetime',
            'online_url_protected' => 'boolean',
        ];
    }

    /**
     * Auto-generate a unique slug from the title.
     */
    public static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $count = 1;

        while (
            static::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "{$original}-{$count}";
            $count++;
        }

        return $slug;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(EventTicket::class)->orderBy('order');
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(EventCoupon::class);
    }

    public function agendas(): HasMany
    {
        return $this->hasMany(EventAgenda::class)->orderBy('date')->orderBy('start_time')->orderBy('order');
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(EventSpeaker::class)->orderBy('order');
    }

    public function sponsors(): HasMany
    {
        return $this->hasMany(EventSponsor::class)->orderBy('order');
    }
}
