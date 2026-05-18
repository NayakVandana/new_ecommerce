<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\CheckoutPlaceRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\Cart\CartOwnerService;
use App\Services\Order\CheckoutService;
use App\Support\OrderPresentation;
use App\Support\StoreDelivery;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(
        protected CartOwnerService $cartOwner,
        protected CheckoutService $checkout,
    ) {}

    public function postCheckoutOptions(Request $request)
    {
        try {
            $methods = collect(config('checkout.payment_methods', ['cod' => 'Cash on delivery']))
                ->map(fn (string $label, string $id) => ['id' => $id, 'label' => $label])
                ->values()
                ->all();

            return $this->sendJsonResponse(true, 'Checkout options.', [
                'payment_methods' => $methods,
                'default_payment_method' => config('checkout.default_payment_method', 'cod'),
                'delivery_cities' => StoreDelivery::citiesForApi(),
                'shipping_flat' => (float) config('checkout.shipping_flat', 0),
                'tax_rate' => (float) config('checkout.tax_rate', 0),
                'currency' => $this->cartOwner->resolve($request)->currency ?? 'INR',
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCheckout(CheckoutPlaceRequest $request)
    {
        try {
            $cart = $this->cartOwner->resolve($request);

            $result = $this->checkout->placeOrder($request->user(), $cart, [
                'payment_method' => $request->validated('payment_method'),
                'shipping_address' => $request->validatedShippingAddress(),
                'customer_note' => $request->input('customer_note'),
                'save_address' => $request->boolean('save_address'),
                'coupon_code' => $request->input('coupon_code'),
            ]);

            $orders = $result['orders'];
            $primary = $result['primary'];
            $ordersCount = $orders->count();

            $message = $ordersCount > 1
                ? "{$ordersCount} orders placed successfully (one per item)."
                : 'Order placed successfully.';

            return $this->sendJsonResponse(true, $message, [
                'id' => $primary->id,
                'order_number' => $primary->order_number,
                'grand_total' => $primary->grand_total,
                'currency' => $primary->currency,
                'status' => $primary->status,
                'payment_method' => 'cod',
                'orders_count' => $ordersCount,
                'orders' => $orders->map(fn (Order $order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'grand_total' => $order->grand_total,
                    'currency' => $order->currency,
                    'status' => $order->status,
                ])->values()->all(),
            ], 200);
        } catch (RuntimeException $e) {
            return $this->sendJsonResponse(false, $e->getMessage(), null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

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
                ->withSum('items', 'quantity')
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

    public function postOrderItemsList(Request $request)
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

            $perPage = $request->input('per_page') ? (int) $request->input('per_page') : 10;
            $currentPage = $request->input('current_page') ? (int) $request->input('current_page') : 1;
            $userId = $request->user()->id;

            $query = OrderItem::query()
                ->select('order_items.*')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->where('orders.user_id', $userId)
                ->with([
                    'order:id,order_number,user_id,status,currency,placed_at,created_at',
                ])
                ->orderByDesc('orders.placed_at')
                ->orderByDesc('orders.created_at')
                ->orderByDesc('order_items.id');

            if ($request->filled('status')) {
                $query->where('orders.status', $request->input('status'));
            }

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('orders.order_number', 'like', '%'.$keyword.'%')
                        ->orWhere('order_items.product_name', 'like', '%'.$keyword.'%')
                        ->orWhere('order_items.variant_label', 'like', '%'.$keyword.'%')
                        ->orWhere('order_items.sku', 'like', '%'.$keyword.'%');
                });
            }

            $paginator = $query->paginate($perPage, ['order_items.*'], 'page', $currentPage);

            $paginator->getCollection()->transform(function (OrderItem $row) {
                $order = $row->order;

                return [
                    'id' => $row->id,
                    'order_id' => $order?->id,
                    'order_number' => $order?->order_number,
                    'status' => $order?->status,
                    'currency' => $order?->currency ?? 'INR',
                    'placed_at' => $order?->placed_at?->toIso8601String(),
                    'created_at' => $order?->created_at?->toIso8601String(),
                    'product_name' => $row->product_name,
                    'variant_label' => $row->variant_label,
                    'sku' => $row->sku,
                    'quantity' => $row->quantity,
                    'unit_price' => (float) $row->unit_price,
                    'line_total' => (float) $row->line_total,
                ];
            });

            return $this->sendJsonResponse(true, 'Order lines fetched successfully.', $paginator, 200);
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
                    'payments' => fn ($q) => $q->orderBy('id'),
                ])
                ->find($request->input('id'));

            if (! $order) {
                return $this->sendJsonResponse(false, 'Order not found.', null, 200);
            }

            return $this->sendJsonResponse(
                true,
                'Order fetched successfully.',
                OrderPresentation::formatForUser($order),
                200,
            );
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
