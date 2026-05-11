<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;

class DashboardApiController extends Controller
{
    public function postStats(Request $request)
    {
        try {
            $stats = [
                'products' => Product::count(),
                'brands' => Brand::count(),
                'orders' => Order::count(),
                'customers' => User::where('is_admin', false)->where('role', 'user')->count(),
            ];

            return $this->sendJsonResponse(true, 'Stats fetched successfully.', $stats, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
