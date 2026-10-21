<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    /**
     * Display the public vendor profile page.
     */
    public function show(User $user): Response
    {
        return Inertia::render('vendor-profile', [
            'vendor' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'about' => $user->about,
                'role' => $user->role,
                'memberSince' => $user->created_at?->format('F Y') ?? 'Baru Bergabung',
                'socialMedia' => $user->social_media ?? [],
            ],
        ]);
    }
}
