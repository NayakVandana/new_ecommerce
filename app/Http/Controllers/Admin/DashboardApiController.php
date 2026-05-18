<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\RecentlyViewedProduct;
use App\Models\Subcategory;
use App\Models\User;
use App\Models\WishlistItem;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    public function postStats(Request $request)
    {
        try {
            $today = Carbon::today();

            $orderTodayQuery = fn () => Order::query()->where(function ($q) use ($today) {
                $q->whereDate('placed_at', $today)
                    ->orWhere(function ($q2) use ($today) {
                        $q2->whereNull('placed_at')->whereDate('created_at', $today);
                    });
            });

            $ordersToday = (clone $orderTodayQuery())->count();
            $ordersTotal = Order::count();
            $revenueToday = (float) (clone $orderTodayQuery())->sum('grand_total');
            $revenueTotal = (float) Order::sum('grand_total');

            $customerQuery = User::query()
                ->where('is_admin', false)
                ->where('role', 'user');

            $modules = [
                $this->moduleRow('orders', 'Orders', $ordersToday, $ordersTotal),
                $this->moduleRow('products', 'Products', Product::whereDate('created_at', $today)->count(), Product::count()),
                $this->moduleRow('customers', 'Customers', (clone $customerQuery)->whereDate('created_at', $today)->count(), (clone $customerQuery)->count()),
                $this->moduleRow('brands', 'Brands', Brand::whereDate('created_at', $today)->count(), Brand::count()),
                $this->moduleRow('categories', 'Categories', Category::whereDate('created_at', $today)->count(), Category::count()),
                $this->moduleRow('subcategories', 'Subcategories', Subcategory::whereDate('created_at', $today)->count(), Subcategory::count()),
                $this->moduleRow('wishlist', 'Wishlist items', WishlistItem::whereDate('created_at', $today)->count(), WishlistItem::count()),
                $this->moduleRow('recently_viewed', 'Recently viewed', RecentlyViewedProduct::whereDate('viewed_at', $today)->count(), RecentlyViewedProduct::count()),
            ];

            $orderStatusCountsTotal = Order::query()
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->map(fn ($count) => (int) $count)
                ->all();

            $orderStatusCountsToday = (clone $orderTodayQuery())
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->map(fn ($count) => (int) $count)
                ->all();

            $configuredStatuses = array_keys(config('orders.statuses', []));
            $ordersByStatus = [];

            foreach ($configuredStatuses as $status) {
                $ordersByStatus[] = [
                    'status' => $status,
                    'label' => config("orders.statuses.{$status}", ucfirst($status)),
                    'today' => $orderStatusCountsToday[$status] ?? 0,
                    'total' => $orderStatusCountsTotal[$status] ?? 0,
                ];
            }

            foreach ($orderStatusCountsTotal as $status => $total) {
                if (! in_array($status, $configuredStatuses, true)) {
                    $ordersByStatus[] = [
                        'status' => $status,
                        'label' => ucfirst(str_replace('_', ' ', $status)),
                        'today' => $orderStatusCountsToday[$status] ?? 0,
                        'total' => $total,
                    ];
                }
            }

            $recentOrders = Order::query()
                ->with([
                    'user:id,name,email',
                    'items' => fn ($q) => $q
                        ->select('id', 'order_id', 'product_name', 'product_variant_id')
                        ->orderBy('id')
                        ->with('productVariant:id,product_id'),
                ])
                ->orderByDesc('placed_at')
                ->orderByDesc('created_at')
                ->limit(8)
                ->get([
                    'id',
                    'order_number',
                    'status',
                    'grand_total',
                    'currency',
                    'placed_at',
                    'created_at',
                    'user_id',
                    'address_of_ship_to',
                    'address_of_bill_to',
                ])
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'grand_total' => (float) $order->grand_total,
                    'currency' => $order->currency,
                    'placed_at' => $order->placed_at?->toIso8601String(),
                    'created_at' => $order->created_at?->toIso8601String(),
                    'customer_name' => self::orderCustomerName($order),
                    'products' => self::orderProducts($order),
                ])
                ->values()
                ->all();

            return $this->sendJsonResponse(true, 'Stats fetched successfully.', [
                'date_label' => $today->format('l, j M Y'),
                'summary' => [
                    'orders_today' => $ordersToday,
                    'orders_total' => $ordersTotal,
                    'revenue_today' => round($revenueToday, 2),
                    'revenue_total' => round($revenueTotal, 2),
                    'customers_today' => (clone $customerQuery)->whereDate('created_at', $today)->count(),
                    'customers_total' => (clone $customerQuery)->count(),
                ],
                'modules' => $modules,
                'orders_by_status' => $ordersByStatus,
                'recent_orders' => $recentOrders,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    /**
     * @return array{key: string, label: string, today: int, total: int}
     */
    private function moduleRow(string $key, string $label, int $today, int $total): array
    {
        return [
            'key' => $key,
            'label' => $label,
            'today' => $today,
            'total' => $total,
        ];
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private static function orderProducts(Order $order): array
    {
        $products = [];
        $seen = [];

        foreach ($order->items as $item) {
            $productId = $item->productVariant?->product_id;
            $name = trim((string) $item->product_name);

            if (! $productId || $name === '' || isset($seen[$productId])) {
                continue;
            }

            $seen[$productId] = true;
            $products[] = [
                'id' => (int) $productId,
                'name' => $name,
            ];
        }

        return $products;
    }

    private static function orderCustomerName(Order $order): ?string
    {
        if ($order->user?->name) {
            return $order->user->name;
        }

        $shipName = is_array($order->address_of_ship_to)
            ? trim((string) ($order->address_of_ship_to['full_name'] ?? ''))
            : '';

        if ($shipName !== '') {
            return $shipName;
        }

        $billName = is_array($order->address_of_bill_to)
            ? trim((string) ($order->address_of_bill_to['full_name'] ?? ''))
            : '';

        return $billName !== '' ? $billName : null;
    }
}
