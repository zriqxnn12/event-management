<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'vendor';
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            // Basic info
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:online,offline,hybrid'],
            'status' => ['required', 'in:draft,published,cancelled,completed'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],

            // Date & time
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'registration_start' => ['nullable', 'date'],
            'registration_end' => ['nullable', 'date', 'after_or_equal:registration_start'],
            'max_attendees' => ['nullable', 'integer', 'min:1'],

            // Location (offline/hybrid)
            'location_name' => ['nullable', 'required_if:type,offline', 'required_if:type,hybrid', 'string', 'max:255'],
            'location_address' => ['nullable', 'string'],
            'location_maps_url' => ['nullable', 'url'],

            // Online (online/hybrid)
            'online_platform' => ['nullable', 'string', 'max:100'],
            'online_url' => ['nullable', 'url'],
            'online_url_protected' => ['boolean'],
            'online_url_password' => ['nullable', 'string', 'max:255'],

            // Tickets
            'tickets' => ['nullable', 'array'],
            'tickets.*.name' => ['required', 'string', 'max:100'],
            'tickets.*.description' => ['nullable', 'string'],
            'tickets.*.type' => ['required', 'in:free,paid'],
            'tickets.*.price' => ['required_if:tickets.*.type,paid', 'nullable', 'numeric', 'min:0'],
            'tickets.*.quota' => ['nullable', 'integer', 'min:1'],
            'tickets.*.sale_start' => ['nullable', 'date'],
            'tickets.*.sale_end' => ['nullable', 'date'],
            'tickets.*.perks' => ['nullable', 'array'],
            'tickets.*.perks.*' => ['string', 'max:255'],
            'tickets.*.is_active' => ['boolean'],

            // Coupons
            'coupons' => ['nullable', 'array'],
            'coupons.*.code' => ['required', 'string', 'max:50'],
            'coupons.*.description' => ['nullable', 'string', 'max:255'],
            'coupons.*.discount_type' => ['required', 'in:percentage,fixed'],
            'coupons.*.discount_value' => ['required', 'numeric', 'min:0'],
            'coupons.*.max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'coupons.*.max_uses' => ['nullable', 'integer', 'min:1'],
            'coupons.*.max_uses_per_user' => ['nullable', 'integer', 'min:1'],
            'coupons.*.minimum_purchase' => ['nullable', 'numeric', 'min:0'],
            'coupons.*.valid_from' => ['nullable', 'date'],
            'coupons.*.valid_until' => ['nullable', 'date'],
            'coupons.*.is_active' => ['boolean'],

            // Agendas
            'agendas' => ['nullable', 'array'],
            'agendas.*.title' => ['required', 'string', 'max:255'],
            'agendas.*.description' => ['nullable', 'string'],
            'agendas.*.start_time' => ['required', 'date_format:H:i'],
            'agendas.*.end_time' => ['nullable', 'date_format:H:i'],
            'agendas.*.speaker_name' => ['nullable', 'string', 'max:255'],
            'agendas.*.date' => ['nullable', 'date'],

            // Speakers
            'speakers' => ['nullable', 'array'],
            'speakers.*.name' => ['required', 'string', 'max:255'],
            'speakers.*.title' => ['nullable', 'string', 'max:255'],
            'speakers.*.company' => ['nullable', 'string', 'max:255'],
            'speakers.*.bio' => ['nullable', 'string'],
            'speakers.*.linkedin_url' => ['nullable', 'url'],
            'speakers.*.twitter_url' => ['nullable', 'url'],

            // Sponsors
            'sponsors' => ['nullable', 'array'],
            'sponsors.*.name' => ['required', 'string', 'max:255'],
            'sponsors.*.website_url' => ['nullable', 'url'],
            'sponsors.*.tier' => ['required', 'in:platinum,gold,silver,bronze,partner'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'location_name.required_if' => 'Nama lokasi wajib diisi untuk event offline atau hybrid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama dengan atau setelah tanggal mulai.',
            'registration_end.after_or_equal' => 'Tanggal akhir pendaftaran harus setelah tanggal mulai pendaftaran.',
        ];
    }
}
