<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactMessageApiController extends Controller
{
    public function postContactMessagesList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer'],
                'current_page' => ['nullable', 'integer'],
                'keyword' => ['nullable', 'string'],
                'unread_only' => ['nullable', 'boolean'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page') ? (int) $request->input('per_page') : 15;
            $currentPage = $request->input('current_page') ? (int) $request->input('current_page') : 1;

            $query = ContactMessage::query()
                ->select([
                    'id',
                    'user_id',
                    'name',
                    'email',
                    'phone',
                    'subject',
                    'message',
                    'read_at',
                    'created_at',
                ])
                ->orderByDesc('created_at');

            if ($request->boolean('unread_only')) {
                $query->whereNull('read_at');
            }

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('email', 'like', '%'.$keyword.'%')
                        ->orWhere('phone', 'like', '%'.$keyword.'%')
                        ->orWhere('subject', 'like', '%'.$keyword.'%')
                        ->orWhere('message', 'like', '%'.$keyword.'%');
                });
            }

            $messages = $query->paginate($perPage, ['*'], 'page', $currentPage);

            return $this->sendJsonResponse(true, 'Contact messages fetched successfully.', $messages, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postContactMessageMarkRead(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:contact_messages,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $message = ContactMessage::query()->findOrFail((int) $request->input('id'));
            $message->markAsRead();

            return $this->sendJsonResponse(true, 'Message marked as read.', $message->fresh(), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postContactMessageDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:contact_messages,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $message = ContactMessage::query()->findOrFail((int) $request->input('id'));
            $message->delete();

            return $this->sendJsonResponse(true, 'Message deleted.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
