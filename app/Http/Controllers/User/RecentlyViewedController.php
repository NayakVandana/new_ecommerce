<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\RecentlyViewed\RecentlyViewedService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecentlyViewedController extends Controller
{
    public function __construct(
        protected RecentlyViewedService $recentlyViewed,
    ) {}

    public function postRecentlyViewedRecord(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'product_id' => ['required', 'integer', 'exists:products,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $this->recentlyViewed->record($request, (int) $request->input('product_id'));

            return $this->sendJsonResponse(true, 'View recorded.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postRecentlyViewedList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'limit' => ['nullable', 'integer', 'min:1', 'max:30'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $limit = (int) $request->input('limit', 12);
            $entries = $this->recentlyViewed->listForUser($request->user()->id, $limit);
            $items = $this->recentlyViewed->formatList($entries);

            return $this->sendJsonResponse(true, 'Recently viewed fetched successfully.', [
                'items' => $items,
                'count' => count($items),
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postRecentlyViewedClear(Request $request)
    {
        try {
            $this->recentlyViewed->clearForUser($request->user()->id);

            return $this->sendJsonResponse(true, 'Recently viewed cleared.', [
                'items' => [],
                'count' => 0,
            ], 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
