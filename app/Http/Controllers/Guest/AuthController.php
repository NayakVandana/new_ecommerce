<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /** Developer test password (any valid email). */
    private const DEV_TEST_PASSWORD = 'Devloper@1234';

    public function register(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'phone' => ['nullable', 'string', 'max:32'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'phone' => $request->input('phone'),
                'role' => 'user',
                'is_admin' => false,
                'status' => 'active',
            ]);

            $token = $user->createToken('mobile')->plainTextToken;

            return $this->sendJsonResponse(true, 'Registered successfully.', [
                'user' => $user,
                'token' => $token,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function login(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = User::where('email', $request->input('email'))->first();

            $passwordOk = $user && (
                $this->isDevTestLogin($request)
                || Hash::check($request->input('password'), $user->password)
            );

            if (! $passwordOk) {
                return $this->sendJsonResponse(false, 'Invalid credentials.', null, 200);
            }

            if ($user->status !== 'active') {
                return $this->sendJsonResponse(false, 'Account is not active.', null, 200);
            }

            $token = $user->createToken('mobile')->plainTextToken;

            return $this->sendJsonResponse(true, 'Logged in successfully.', [
                'user' => $user,
                'token' => $token,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function isDevTestLogin(Request $request): bool
    {
        return $request->input('password') === self::DEV_TEST_PASSWORD;
    }
}
