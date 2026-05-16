<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function postOrdersList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer'],
                'current_page' => ['nullable', 'integer'],
                'status' => ['nullable', 'string', 'max:32'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page') ? (int) $request->input('per_page') : 10;
            $currentPage = $request->input('current_page') ? (int) $request->input('current_page') : 1;

            $query = Order::query()
                ->where('user_id', $request->user()->id)
                ->withCount('items')
                ->orderByDesc('placed_at')
                ->orderByDesc('created_at');

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            $orders = $query->paginate($perPage, [
                'id',
                'order_number',
                'status',
                'grand_total',
                'currency',
                'placed_at',
                'created_at',
            ], 'page', $currentPage);

            return $this->sendJsonResponse(true, 'Orders fetched successfully.', $orders, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postOrderShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $order = Order::query()
                ->where('user_id', $request->user()->id)
                ->with([
                    'items' => fn ($q) => $q->orderBy('id'),
                    'statusHistories' => fn ($q) => $q->orderBy('created_at'),
                ])
                ->find($request->input('id'));

            if (! $order) {
                return $this->sendJsonResponse(false, 'Order not found.', null, 200);
            }

            return $this->sendJsonResponse(true, 'Order fetched successfully.', $order, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
