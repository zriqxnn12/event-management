<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class SocialMediaUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->has('social_media') || ! is_array($this->input('social_media'))) {
            return;
        }

        $cleaned = [];
        foreach ($this->input('social_media') as $item) {
            if (! is_array($item)) {
                continue;
            }

            $platform = trim($item['platform'] ?? '');
            $url = trim($item['url'] ?? '');
            $handle = isset($item['handle']) ? trim($item['handle']) : null;

            if ($platform === '' && $url === '') {
                continue;
            }

            // Normalize URL if protocol is missing
            if ($url !== '' && ! preg_match('~^(?:f|ht)tps?://~i', $url)) {
                if (strtolower($platform) === 'whatsapp') {
                    $cleanedPhone = preg_replace('/[^0-9]/', '', $url);
                    if (str_starts_with($cleanedPhone, '0')) {
                        $cleanedPhone = '62'.substr($cleanedPhone, 1);
                    }
                    $url = 'https://wa.me/'.$cleanedPhone;
                } elseif (str_starts_with($url, '@')) {
                    $username = substr($url, 1);
                    $url = match (strtolower($platform)) {
                        'instagram' => 'https://instagram.com/'.$username,
                        'tiktok' => 'https://tiktok.com/@'.$username,
                        'twitter', 'x' => 'https://x.com/'.$username,
                        'facebook' => 'https://facebook.com/'.$username,
                        'youtube' => 'https://youtube.com/@'.$username,
                        'github' => 'https://github.com/'.$username,
                        'telegram' => 'https://t.me/'.$username,
                        default => 'https://'.$username,
                    };
                } else {
                    $url = 'https://'.$url;
                }
            }

            $cleaned[] = [
                'id' => $item['id'] ?? uniqid('sm_'),
                'platform' => strtolower($platform),
                'url' => $url,
                'handle' => $handle !== '' ? $handle : null,
            ];
        }

        $this->merge([
            'social_media' => $cleaned,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'social_media' => ['present', 'array'],
            'social_media.*.id' => ['nullable', 'string', 'max:50'],
            'social_media.*.platform' => ['required', 'string', 'max:50'],
            'social_media.*.url' => ['required', 'string', 'max:500'],
            'social_media.*.handle' => ['nullable', 'string', 'max:100'],
        ];
    }
}
