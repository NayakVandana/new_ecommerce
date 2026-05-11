<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()?->delete();

            return $this->sendJsonResponse(true, 'Logged out successfully.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
