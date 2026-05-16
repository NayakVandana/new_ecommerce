<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\CheckoutPlaceRequest;
use App\Models\Order;
use App\Services\Cart\CartOwnerService;
use App\Services\Order\CheckoutService;
use App\Support\StoreDelivery;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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

            $order = $this->checkout->placeOrder($request->user(), $cart, [
                'payment_method' => $request->validated('payment_method'),
                'shipping_address' => $request->validatedShippingAddress(),
                'customer_note' => $request->input('customer_note'),
                'save_address' => $request->boolean('save_address'),
            ]);

            return $this->sendJsonResponse(true, 'Order placed successfully.', [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'grand_total' => $order->grand_total,
                'currency' => $order->currency,
                'status' => $order->status,
                'payment_method' => 'cod',
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
                    'payments' => fn ($q) => $q->orderBy('id'),
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
