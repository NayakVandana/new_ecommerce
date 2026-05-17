<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\StoreCatalog;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CatalogController extends Controller
{
    public function postGendersList(Request $request)
    {
        try {
            $genders = Gender::query()
                ->where('is_active', true)
                ->when(StoreCatalog::womenOnly(), fn ($q) => $q->where('slug', StoreCatalog::womenGenderSlug()))
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug']);

            return $this->sendJsonResponse(true, 'Genders fetched successfully.', $genders, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

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

            $shopSlugs = StoreCatalog::shopCategorySlugs();
            if (StoreCatalog::womenOnly() && $shopSlugs !== []) {
                $query->whereIn('slug', $shopSlugs);
            }

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

    public function postColorsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'category_id' => ['nullable', 'integer', 'exists:categories,id'],
                'subcategory_id' => ['nullable', 'integer', 'exists:subcategories,id'],
                'gender_id' => ['nullable', 'integer', 'exists:genders,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $productQuery = Product::query()->where('status', 'published');
            $this->applyCatalogScopeFilters($productQuery, $request);

            $variants = ProductVariant::query()
                ->whereHas('product', fn ($q) => $q->whereIn('id', (clone $productQuery)->select('id')))
                ->where(function ($q) {
                    $q->where(function ($inner) {
                        $inner->whereNotNull('color')->where('color', '!=', '');
                    })->orWhereNotNull('color_hex');
                })
                ->get(['color', 'color_hex']);

            $seen = [];
            $colors = [];

            foreach ($variants as $variant) {
                $hex = $this->normalizeVariantColorHex($variant->color_hex);
                $name = trim((string) ($variant->color ?? ''));
                $value = $hex ?? ($name !== '' ? $name : null);

                if ($value === null || isset($seen[$value])) {
                    continue;
                }

                $seen[$value] = true;
                $colors[] = [
                    'value' => $value,
                    'label' => $name !== '' ? $name : strtoupper(ltrim($value, '#')),
                    'hex' => $hex,
                ];
            }

            usort($colors, fn ($a, $b) => strcasecmp($a['label'], $b['label']));

            return $this->sendJsonResponse(true, 'Colors fetched successfully.', $colors, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postSearchSuggestionsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'keyword' => ['required', 'string', 'min:2', 'max:120'],
                'limit' => ['nullable', 'integer', 'min:1', 'max:12'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $keyword = trim((string) $request->input('keyword'));
            $limit = (int) $request->input('limit', 8);

            $query = Product::query()
                ->with([
                    'subcategory.category',
                    'images' => fn ($q) => $q
                        ->whereNull('product_variant_id')
                        ->orderByDesc('is_primary')
                        ->orderBy('sort_order')
                        ->limit(1),
                ])
                ->where('status', 'published')
                ->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%')
                        ->orWhere('base_sku', 'like', '%'.$keyword.'%');
                });

            $this->applyCatalogScopeFilters($query, $request);

            $products = $query
                ->orderByDesc('is_featured')
                ->orderBy('name')
                ->limit($limit)
                ->get(['id', 'name', 'slug', 'base_sku', 'subcategory_id']);

            $suggestions = $products->map(function (Product $product) {
                $image = $product->images->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'sku' => $product->base_sku,
                    'category' => $product->subcategory?->category?->name,
                    'image_path' => $image?->path,
                ];
            })->values();

            return $this->sendJsonResponse(true, 'Search suggestions fetched successfully.', $suggestions, 200);
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
                'color' => ['nullable', 'string', 'max:50'],
                'category_id' => ['nullable', 'integer', 'exists:categories,id'],
                'subcategory_id' => ['nullable', 'integer', 'exists:subcategories,id'],
                'gender_id' => ['nullable', 'integer', 'exists:genders,id'],
                'featured_only' => ['nullable', 'boolean'],
                'status' => ['nullable', 'string', 'in:draft,published,archived'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page', 10);
            $currentPage = $request->input('current_page', 1);

            $query = Product::query()
                ->with([
                    'brand',
                    'gender',
                    'subcategory.category',
                    'variants',
                    'images' => fn ($q) => $q
                        ->whereNull('product_variant_id')
                        ->orderByDesc('is_primary')
                        ->orderBy('sort_order')
                        ->limit(1),
                ]);

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

            $this->applyCatalogScopeFilters($query, $request);

            if ($request->filled('color')) {
                $filterColor = trim((string) $request->input('color'));
                $query->whereHas('variants', function ($q) use ($filterColor) {
                    if (str_starts_with($filterColor, '#')) {
                        $hex = $this->normalizeVariantColorHex($filterColor);
                        $q->where('color_hex', $hex ?? $filterColor);
                    } else {
                        $q->whereRaw('LOWER(TRIM(color)) = ?', [strtolower($filterColor)]);
                    }
                });
            }

            if ($request->boolean('featured_only')) {
                $query->where('is_featured', true);
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

    public function postProductShow(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'slug' => ['required_without:product_id', 'string', 'max:255'],
                'product_id' => ['required_without:slug', 'integer', 'exists:products,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $query = Product::query()
                ->with([
                    'brand',
                    'gender',
                    'subcategory.category',
                    'variants.images' => fn ($q) => $q
                        ->orderByDesc('is_primary')
                        ->orderBy('sort_order'),
                    'images' => fn ($q) => $q
                        ->orderByDesc('is_primary')
                        ->orderBy('sort_order'),
                ])
                ->where('status', 'published');

            if (StoreCatalog::womenOnly()) {
                $womenId = StoreCatalog::womenGenderId();
                if ($womenId) {
                    $query->where('gender_id', $womenId);
                }
            }

            if ($request->filled('slug')) {
                $query->where('slug', $request->input('slug'));
            } else {
                $query->whereKey($request->input('product_id'));
            }

            $product = $query->first();

            if (! $product) {
                return $this->sendJsonResponse(false, 'Product not found.', null, 200);
            }

            return $this->sendJsonResponse(true, 'Product fetched successfully.', $product, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function applyCatalogScopeFilters($query, Request $request): void
    {
        if (StoreCatalog::womenOnly()) {
            $womenId = StoreCatalog::womenGenderId();
            if ($womenId) {
                $query->where('gender_id', $request->input('gender_id', $womenId));
            }
        } elseif ($request->filled('gender_id')) {
            $query->where('gender_id', $request->input('gender_id'));
        }

        if ($request->filled('subcategory_id')) {
            $query->where('subcategory_id', $request->input('subcategory_id'));
        }

        if ($request->filled('category_id')) {
            $categoryId = $request->input('category_id');
            $query->whereHas('subcategory', fn ($q) => $q->where('category_id', $categoryId));
        }
    }

    private function normalizeVariantColorHex(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $v = trim((string) $value);
        if ($v === '') {
            return null;
        }

        if (preg_match('/^#([0-9A-Fa-f]{6})$/', $v)) {
            return strtolower($v);
        }

        if (preg_match('/^#([0-9A-Fa-f]{3})$/', $v, $m)) {
            $s = $m[1];

            return strtolower('#'.$s[0].$s[0].$s[1].$s[1].$s[2].$s[2]);
        }

        return null;
    }
}
