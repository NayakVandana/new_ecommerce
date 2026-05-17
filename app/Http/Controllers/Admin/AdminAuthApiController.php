<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAuthApiController extends Controller
{
    /** Developer test password (any admin email). */
    private const DEV_TEST_PASSWORD = 'Devloper@1234';

    /**
     * API login: no session — returns a Sanctum personal access token (same pattern as guest/mobile login).
     */
    public function login(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
                'device_name' => ['nullable', 'string', 'max:120'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = User::query()->where('email', $request->input('email'))->first();

            $passwordOk = $user && (
                $this->isDevTestLogin($request)
                || Hash::check($request->input('password'), $user->password)
            );

            if (! $passwordOk) {
                return $this->sendJsonResponse(false, 'These credentials do not match our records.', null, 200);
            }

            if (! $user->is_admin && $user->role !== 'admin') {
                return $this->sendJsonResponse(false, 'You do not have access to the admin panel.', null, 200);
            }

            $device = $request->input('device_name', 'admin-panel');
            $plainToken = $user->createToken($device)->plainTextToken;

            return $this->sendJsonResponse(true, 'Logged in successfully.', [
                'user' => $user->makeHidden(['password', 'remember_token']),
                'token' => $plainToken,
                'token_type' => 'Bearer',
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function isDevTestLogin(Request $request): bool
    {
        return $request->input('password') === self::DEV_TEST_PASSWORD;
    }

    public function logout(Request $request)
    {
        try {
            $request->user()?->currentAccessToken()?->delete();

            return $this->sendJsonResponse(true, 'Logged out successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
