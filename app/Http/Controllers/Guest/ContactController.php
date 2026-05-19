<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\User;
use App\Services\Mail\StoreMailer;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class ContactController extends Controller
{
    public function __construct(
        protected StoreMailer $mailer,
    ) {}

    public function postContactSubmit(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:32'],
                'subject' => ['nullable', 'string', 'max:200'],
                'message' => ['required', 'string', 'min:10', 'max:5000'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $message = ContactMessage::create([
                'user_id' => $this->resolveUserId($request),
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'subject' => $request->input('subject'),
                'message' => $request->input('message'),
                'ip_address' => $request->ip(),
            ]);

            $this->mailer->sendContactSubmitted($message);

            return $this->sendJsonResponse(true, 'Thank you — we received your message and will reply soon.', [
                'id' => $message->id,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function resolveUserId(Request $request): ?int
    {
        $token = $request->bearerToken();

        if (! $token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);

        if (! $accessToken || ! $accessToken->tokenable instanceof User) {
            return null;
        }

        return $accessToken->tokenable->id;
    }
}
