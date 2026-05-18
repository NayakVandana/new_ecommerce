<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Support\OrderPresentation;
use App\Support\ProductThumbnail;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class OrderApiController extends Controller
{
    public function postOrdersMeta(Request $request)
    {
        try {
            $statuses = collect(config('orders.statuses', []))
                ->map(fn (string $label, string $id) => ['id' => $id, 'label' => $label])
                ->values()
                ->all();

            return $this->sendJsonResponse(true, 'Order options.', [
                'statuses' => $statuses,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postOrdersList(Request $request)
    {
        try {
            $statusKeys = array_keys(config('orders.statuses', []));

            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string', 'max:120'],
                'status' => ['nullable', 'string', Rule::in($statusKeys)],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page') ? (int) $request->input('per_page') : 15;
            $currentPage = $request->input('current_page') ? (int) $request->input('current_page') : 1;

            $query = Order::query()
                ->with([
                    'user:id,name,email,phone',
                    'items' => fn ($q) => $q
                        ->orderBy('id')
                        ->limit(1)
                        ->with([
                            'productVariant.product' => fn ($pq) => $pq->with(
                                ProductThumbnail::productMediaEagerConstraints(),
                            ),
                        ]),
                ])
                ->withCount('items')
                ->withSum('items', 'quantity')
                ->orderByDesc('placed_at')
                ->orderByDesc('created_at');

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('order_number', 'like', '%'.$keyword.'%')
                        ->orWhereHas('user', function ($uq) use ($keyword) {
                            $uq->where('name', 'like', '%'.$keyword.'%')
                                ->orWhere('email', 'like', '%'.$keyword.'%')
                                ->orWhere('phone', 'like', '%'.$keyword.'%');
                        });
                });
            }

            $orders = $query->paginate($perPage, [
                'id',
                'order_number',
                'user_id',
                'status',
                'grand_total',
                'currency',
                'placed_at',
                'created_at',
            ], 'page', $currentPage);

            $orders->getCollection()->transform(function (Order $order) {
                $firstItem = $order->items->first();
                $product = $firstItem?->productVariant?->product;
                $extraItems = max(0, (int) $order->items_count - 1);

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'grand_total' => $order->grand_total,
                    'currency' => $order->currency,
                    'placed_at' => $order->placed_at?->toIso8601String(),
                    'created_at' => $order->created_at?->toIso8601String(),
                    'items_count' => (int) $order->items_count,
                    'items_sum_quantity' => $order->items_sum_quantity !== null
                        ? (int) $order->items_sum_quantity
                        : null,
                    'user' => $order->user,
                    'product_id' => $product?->id,
                    'product_name' => $firstItem?->product_name ?? $product?->name,
                    'product_slug' => $product?->slug,
                    'product_thumb_url' => ProductThumbnail::forProduct($product),
                    'extra_items_count' => $extraItems,
                ];
            });

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
                ->with([
                    'user:id,name,email,phone',
                    'items' => fn ($q) => $q->orderBy('id'),
                    'statusHistories' => fn ($q) => $q->orderByDesc('created_at'),
                    'statusHistories.creator:id,name',
                    'payments' => fn ($q) => $q->orderBy('id'),
                ])
                ->find($request->input('id'));

            if (! $order) {
                return $this->sendJsonResponse(false, 'Order not found.', null, 200);
            }

            return $this->sendJsonResponse(
                true,
                'Order fetched successfully.',
                OrderPresentation::formatForAdmin($order),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postOrderUpdateStatus(Request $request)
    {
        try {
            $statusKeys = array_keys(config('orders.statuses', []));

            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer'],
                'status' => ['required', 'string', Rule::in($statusKeys)],
                'note' => ['nullable', 'string', 'max:500'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $order = Order::query()->find($request->input('id'));

            if (! $order) {
                return $this->sendJsonResponse(false, 'Order not found.', null, 200);
            }

            $newStatus = $request->input('status');

            if ($order->status === $newStatus) {
                return $this->sendJsonResponse(false, 'Order is already in that status.', null, 200);
            }

            $order = DB::transaction(function () use ($request, $order, $newStatus) {
                $order->update(['status' => $newStatus]);

                OrderStatusHistory::query()->create([
                    'order_id' => $order->id,
                    'status' => $newStatus,
                    'note' => $request->input('note'),
                    'created_by' => $request->user()->id,
                ]);

                return $order->fresh([
                    'user:id,name,email,phone',
                    'items',
                    'statusHistories' => fn ($q) => $q->orderByDesc('created_at'),
                    'statusHistories.creator:id,name',
                    'payments',
                ]);
            });

            return $this->sendJsonResponse(
                true,
                'Order status updated.',
                OrderPresentation::formatForAdmin($order),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
