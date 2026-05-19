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
                'phone' => ['required', 'string', 'max:32'],
                'subject' => ['nullable', 'string', 'max:200'],
                'message' => ['required', 'string', 'min:10', 'max:5000'],
            ], [
                'name.required' => 'Please enter your name.',
                'name.max' => 'Name cannot exceed 255 characters.',
                'email.required' => 'Please enter your email address.',
                'email.email' => 'Please enter a valid email address.',
                'email.max' => 'Email cannot exceed 255 characters.',
                'phone.required' => 'Phone number is required.',
                'phone.max' => 'Phone number is too long.',
                'subject.max' => 'Subject cannot exceed 200 characters.',
                'message.required' => 'Please enter your message.',
                'message.min' => 'Your message must be at least 10 characters.',
                'message.max' => 'Your message cannot exceed 5000 characters.',
            ]);

            $validation->after(function ($validator) use ($request) {
                $phone = (string) $request->input('phone', '');
                $digits = preg_replace('/\D+/', '', $phone) ?? '';

                if (strlen($digits) < 10) {
                    $validator->errors()->add('phone', 'Enter a valid 10-digit mobile number.');
                } elseif (strlen($digits) > 12) {
                    $validator->errors()->add('phone', 'Phone number is too long.');
                } elseif (! preg_match('/^[6-9]\d{9}$/', substr($digits, -10))) {
                    $validator->errors()->add('phone', 'Enter a valid Indian mobile number starting with 6–9.');
                }
            });

            if ($validation->fails()) {
                return $this->sendJsonResponse(
                    false,
                    'Please fix the highlighted fields.',
                    $validation->errors()->getMessages(),
                    200,
                );
            }

            $message = ContactMessage::create([
                'user_id' => $this->resolveUserId($request),
                'name' => trim((string) $request->input('name')),
                'email' => strtolower(trim((string) $request->input('email'))),
                'phone' => trim((string) $request->input('phone')),
                'subject' => $request->filled('subject') ? trim((string) $request->input('subject')) : null,
                'message' => trim((string) $request->input('message')),
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
