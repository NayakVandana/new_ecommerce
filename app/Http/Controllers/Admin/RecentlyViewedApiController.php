<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RecentlyViewedProduct;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecentlyViewedApiController extends Controller
{
    public function postRecentlyViewedList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string', 'max:120'],
                'user_id' => ['nullable', 'integer', 'exists:users,id'],
                'product_id' => ['nullable', 'integer', 'exists:products,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = (int) $request->input('per_page', 15);
            $currentPage = (int) $request->input('current_page', 1);

            $query = RecentlyViewedProduct::query()
                ->whereNotNull('user_id')
                ->with([
                    'user:id,name,email',
                    'product:id,name,slug,base_sku,status',
                ])
                ->orderByDesc('viewed_at');

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }

            if ($request->filled('product_id')) {
                $query->where('product_id', $request->input('product_id'));
            }

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->whereHas('user', function ($uq) use ($keyword) {
                        $uq->where('name', 'like', '%'.$keyword.'%')
                            ->orWhere('email', 'like', '%'.$keyword.'%');
                    })->orWhereHas('product', function ($pq) use ($keyword) {
                        $pq->where('name', 'like', '%'.$keyword.'%')
                            ->orWhere('slug', 'like', '%'.$keyword.'%')
                            ->orWhere('base_sku', 'like', '%'.$keyword.'%');
                    });
                });
            }

            $paginator = $query->paginate($perPage, ['*'], 'page', $currentPage);

            $paginator->getCollection()->transform(function (RecentlyViewedProduct $row) {
                return [
                    'id' => $row->id,
                    'viewed_at' => $row->viewed_at?->toIso8601String(),
                    'user_id' => $row->user_id,
                    'user_name' => $row->user?->name,
                    'user_email' => $row->user?->email,
                    'product_id' => $row->product_id,
                    'product_name' => $row->product?->name,
                    'product_slug' => $row->product?->slug,
                    'product_sku' => $row->product?->base_sku,
                    'product_status' => $row->product?->status,
                ];
            });

            return $this->sendJsonResponse(true, 'Recently viewed fetched successfully.', $paginator, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
