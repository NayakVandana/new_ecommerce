<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function postShow(Request $request)
    {
        try {
            return $this->sendJsonResponse(
                true,
                'Profile fetched successfully.',
                $request->user()->makeHidden(['password', 'remember_token']),
                200
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postUpdate(Request $request)
    {
        try {
            $user = $request->user();

            $validation = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'string',
                    'lowercase',
                    'email',
                    'max:255',
                    Rule::unique(User::class)->ignore($user->id),
                ],
                'phone' => ['nullable', 'string', 'max:32'],
                'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user->name = $request->input('name');
            $email = $request->input('email');
            if ($user->email !== $email) {
                $user->email = $email;
                if ($user instanceof MustVerifyEmail) {
                    $user->email_verified_at = null;
                }
            }

            if ($request->has('phone')) {
                $user->phone = $request->input('phone');
            }

            if ($request->filled('password')) {
                $user->password = Hash::make($request->input('password'));
            }

            $user->save();

            return $this->sendJsonResponse(
                true,
                'Profile updated successfully.',
                $user->fresh()->makeHidden(['password', 'remember_token']),
                200
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postAppearanceUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'theme_preference' => ['required', 'string', 'in:light,dark,system'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = $request->user();
            $user->theme_preference = $request->input('theme_preference');
            $user->save();

            return $this->sendJsonResponse(
                true,
                'Appearance updated.',
                $user->fresh()->makeHidden(['password', 'remember_token']),
                200
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'password' => ['required', 'current_password'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $user = $request->user();

            $user->tokens()->delete();
            $user->delete();

            return $this->sendJsonResponse(true, 'Account deleted successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
