<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SocialMediaUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialMediaController extends Controller
{
    /**
     * Show the vendor social media settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/social-media', [
            'socialMedia' => $request->user()->social_media ?? [],
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the vendor social media links.
     */
    public function update(SocialMediaUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->social_media = $validated['social_media'];
        $user->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Data media sosial berhasil diperbarui.'),
        ]);

        return to_route('social-media.edit');
    }
}
