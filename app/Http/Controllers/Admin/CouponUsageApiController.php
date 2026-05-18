<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CouponUsage;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponUsageApiController extends Controller
{
    public function postCouponUsagesList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string', 'max:120'],
                'coupon_id' => ['nullable', 'integer', 'exists:coupons,id'],
                'user_id' => ['nullable', 'integer', 'exists:users,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = (int) $request->input('per_page', 15);
            $currentPage = (int) $request->input('current_page', 1);

            $query = CouponUsage::query()
                ->with([
                    'coupon:id,code,type,value',
                    'user:id,name,email',
                    'order:id,order_number,currency,grand_total',
                ])
                ->orderByDesc('used_at')
                ->orderByDesc('id');

            if ($request->filled('coupon_id')) {
                $query->where('coupon_id', $request->input('coupon_id'));
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->input('user_id'));
            }

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->whereHas('coupon', fn ($cq) => $cq->where('code', 'like', '%'.$keyword.'%'))
                        ->orWhereHas('user', function ($uq) use ($keyword) {
                            $uq->where('name', 'like', '%'.$keyword.'%')
                                ->orWhere('email', 'like', '%'.$keyword.'%');
                        })
                        ->orWhereHas('order', fn ($oq) => $oq->where('order_number', 'like', '%'.$keyword.'%'));
                });
            }

            $paginator = $query->paginate($perPage, ['*'], 'page', $currentPage);

            $paginator->getCollection()->transform(function (CouponUsage $row) {
                return [
                    'id' => $row->id,
                    'used_at' => $row->used_at?->toIso8601String(),
                    'amount_saved' => (float) $row->amount_saved,
                    'coupon_id' => $row->coupon_id,
                    'coupon_code' => $row->coupon?->code,
                    'coupon_type' => $row->coupon?->type,
                    'user_id' => $row->user_id,
                    'user_name' => $row->user?->name,
                    'user_email' => $row->user?->email,
                    'order_id' => $row->order_id,
                    'order_number' => $row->order?->order_number,
                    'order_currency' => $row->order?->currency ?? 'INR',
                    'order_grand_total' => $row->order?->grand_total !== null
                        ? (float) $row->order->grand_total
                        : null,
                ];
            });

            return $this->sendJsonResponse(true, 'Coupon usage history fetched successfully.', $paginator, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
