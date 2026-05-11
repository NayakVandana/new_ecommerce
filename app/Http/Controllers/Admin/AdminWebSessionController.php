<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class AdminWebSessionController extends Controller
{
    /**
     * Exchange a valid Sanctum personal-access token for a web session (Inertia admin shell).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $accessToken = PersonalAccessToken::findToken($request->input('token'));

        if (! $accessToken || ! ($accessToken->tokenable instanceof User)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token.',
            ], 401);
        }

        /** @var User $user */
        $user = $accessToken->tokenable;

        if (! $user->is_admin && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Not an administrator.',
            ], 403);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Session started.',
        ]);
    }

    /**
     * End web session after API token is revoked (admin panel log out).
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || (! $user->is_admin && $user->role !== 'admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden.',
            ], 403);
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out.',
        ]);
    }
}
