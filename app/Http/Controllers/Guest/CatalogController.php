<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CatalogController extends Controller
{
    public function postBrandsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page', 10);
            $currentPage = $request->input('current_page', 1);

            $query = Brand::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%');
                });
            }

            $brands = $query->paginate($perPage, ['*'], 'page', $currentPage);

            return $this->sendJsonResponse(true, 'Brands fetched successfully.', $brands, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postCategoriesList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'keyword' => ['nullable', 'string'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $query = Category::query()
                ->where('is_active', true)
                ->with(['subcategories' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')->orderBy('name')])
                ->orderBy('sort_order')
                ->orderBy('name');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%');
                });
            }

            $categories = $query->get();

            return $this->sendJsonResponse(true, 'Categories fetched successfully.', $categories, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProductsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
                'current_page' => ['nullable', 'integer', 'min:1'],
                'keyword' => ['nullable', 'string'],
                'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
                'status' => ['nullable', 'string', 'in:draft,published,archived'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page', 10);
            $currentPage = $request->input('current_page', 1);

            $query = Product::query()
                ->with(['brand', 'subcategory.category', 'variants']);

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%')
                        ->orWhere('base_sku', 'like', '%'.$keyword.'%');
                });
            }

            if ($request->filled('brand_id')) {
                $query->where('brand_id', $request->input('brand_id'));
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            } else {
                $query->where('status', 'published');
            }

            $query->orderByDesc('is_featured')->orderByDesc('created_at');

            $products = $query->paginate($perPage, ['*'], 'page', $currentPage);

            return $this->sendJsonResponse(true, 'Products fetched successfully.', $products, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }
}
