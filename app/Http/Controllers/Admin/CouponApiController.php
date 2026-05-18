<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\Order\CouponService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CouponApiController extends Controller
{
    public function __construct(
        protected CouponService $coupons,
    ) {}

    public function postCouponsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string', 'max:120'],
                'is_active' => ['nullable', 'boolean'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = (int) $request->input('per_page', 15);
            $currentPage = (int) $request->input('current_page', 1);

            $query = Coupon::query()->orderByDesc('created_at');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where('code', 'like', '%'.$keyword.'%');
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $paginator = $query->paginate($perPage, ['*'], 'page', $currentPage);

            $paginator->getCollection()->transform(function (Coupon $coupon) {
                return $this->formatCoupon($coupon);
            });

            return $this->sendJsonResponse(true, 'Coupons fetched successfully.', $paginator, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCouponShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:coupons,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $coupon = Coupon::query()->find($request->input('id'));

            if (! $coupon) {
                return $this->sendJsonResponse(false, 'Coupon not found.', null, 200);
            }

            return $this->sendJsonResponse(true, 'Coupon fetched successfully.', $this->formatCoupon($coupon), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCouponStore(Request $request)
    {
        try {
            $validation = $this->validator($request->all());

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $code = $this->coupons->normalizeCode((string) $request->input('code'));

            if (Coupon::query()->whereRaw('UPPER(code) = ?', [$code])->exists()) {
                return $this->sendJsonResponse(false, 'This coupon code already exists.', null, 200);
            }

            $coupon = Coupon::query()->create($this->payloadFromRequest($request, $code));

            return $this->sendJsonResponse(true, 'Coupon created.', $this->formatCoupon($coupon), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCouponUpdate(Request $request)
    {
        try {
            $validation = $this->validator($request->all(), true);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Coupon|null $coupon */
            $coupon = Coupon::query()->find($request->input('id'));

            if (! $coupon) {
                return $this->sendJsonResponse(false, 'Coupon not found.', null, 200);
            }

            $code = $this->coupons->normalizeCode((string) $request->input('code', $coupon->code));

            if (
                Coupon::query()
                    ->whereRaw('UPPER(code) = ?', [$code])
                    ->where('id', '!=', $coupon->id)
                    ->exists()
            ) {
                return $this->sendJsonResponse(false, 'This coupon code already exists.', null, 200);
            }

            $coupon->update($this->payloadFromRequest($request, $code));

            return $this->sendJsonResponse(true, 'Coupon updated.', $this->formatCoupon($coupon->fresh()), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCouponDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:coupons,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            Coupon::query()->whereKey($request->input('id'))->delete();

            return $this->sendJsonResponse(true, 'Coupon deleted.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function validator(array $data, bool $updating = false): \Illuminate\Contracts\Validation\Validator
    {
        $idRule = $updating ? ['required', 'integer', 'exists:coupons,id'] : ['nullable'];

        $type = $data['type'] ?? null;

        return Validator::make($data, [
            'id' => $idRule,
            'code' => [$updating ? 'sometimes' : 'required', 'string', 'min:2', 'max:64', 'regex:/^[A-Z0-9_-]+$/i'],
            'type' => ['required', 'string', Rule::in(['percentage', 'fixed'])],
            'value' => array_values(array_filter([
                'required',
                'numeric',
                'min:0.01',
                $type === 'percentage' ? 'max:100' : null,
            ])),
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'code.required' => 'Coupon code is required.',
            'code.regex' => 'Use letters, numbers, hyphens, or underscores only.',
            'type.required' => 'Discount type is required.',
            'value.required' => 'Discount value is required.',
            'value.max' => 'Percentage cannot exceed 100.',
            'starts_at.required' => 'Start date and time are required.',
            'starts_at.date' => 'Enter a valid start date and time.',
            'ends_at.required' => 'End date and time are required.',
            'ends_at.date' => 'Enter a valid end date and time.',
            'ends_at.after' => 'End date and time must be after the start.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function payloadFromRequest(Request $request, string $code): array
    {
        return [
            'code' => $code,
            'type' => $request->input('type'),
            'value' => $request->input('value'),
            'min_order_amount' => $request->filled('min_order_amount')
                ? $request->input('min_order_amount')
                : null,
            'max_uses' => $request->filled('max_uses') ? (int) $request->input('max_uses') : null,
            'per_user_limit' => $request->filled('per_user_limit')
                ? (int) $request->input('per_user_limit')
                : null,
            'starts_at' => $request->input('starts_at') ?: null,
            'ends_at' => $request->input('ends_at') ?: null,
            'is_active' => $request->boolean('is_active', true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatCoupon(Coupon $coupon): array
    {
        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'min_order_amount' => $coupon->min_order_amount !== null
                ? (float) $coupon->min_order_amount
                : null,
            'max_uses' => $coupon->max_uses,
            'used_count' => (int) $coupon->used_count,
            'per_user_limit' => $coupon->per_user_limit,
            'starts_at' => $coupon->starts_at?->toIso8601String(),
            'ends_at' => $coupon->ends_at?->toIso8601String(),
            'is_active' => (bool) $coupon->is_active,
            'created_at' => $coupon->created_at?->toIso8601String(),
        ];
    }
}
