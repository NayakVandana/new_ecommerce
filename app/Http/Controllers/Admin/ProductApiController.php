<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductApiController extends Controller
{
    public function postProductsList(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'per_page' => ['nullable', 'integer'],
                'current_page' => ['nullable', 'integer'],
                'keyword' => ['nullable', 'string'],
                'status' => ['nullable', 'string', 'in:draft,published,archived'],
                'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $perPage = $request->input('per_page') ? (int) $request->input('per_page') : 10;
            $currentPage = $request->input('current_page') ? (int) $request->input('current_page') : 1;

            $query = Product::query()
                ->with([
                    'brand',
                    'subcategory.category',
                    'variants',
                    'images' => fn ($q) => $q
                        ->orderByDesc('is_primary')
                        ->orderBy('sort_order')
                        ->orderBy('id')
                        ->limit(1),
                ])
                ->orderBy('created_at', 'DESC');

            if ($request->filled('keyword')) {
                $keyword = $request->input('keyword');
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', '%'.$keyword.'%')
                        ->orWhere('slug', 'like', '%'.$keyword.'%')
                        ->orWhere('base_sku', 'like', '%'.$keyword.'%');
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('brand_id')) {
                $query->where('brand_id', $request->input('brand_id'));
            }

            $products = $query->paginate($perPage, ['*'], 'page', $currentPage);

            $products->getCollection()->transform(function (Product $product) {
                $img = $product->images->first();
                $thumbUrl = null;
                if ($img && $img->path) {
                    try {
                        $disk = $img->disk ?: config('filesystems.default');
                        $thumbUrl = Storage::disk($disk)->url($img->path);
                    } catch (\Throwable) {
                        $thumbUrl = null;
                    }
                }
                $product->setAttribute('thumb_url', $thumbUrl);
                $product->unsetRelation('images');

                return $product;
            });

            return $this->sendJsonResponse(true, 'Products fetched successfully.', $products, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProductStore(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
                'subcategory_id' => ['nullable', 'integer', 'exists:subcategories,id'],
                'gender_id' => ['nullable', 'integer', 'exists:genders,id'],
                'name' => ['required', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'base_sku' => ['nullable', 'string', 'max:255'],
                'summary' => ['nullable', 'string'],
                'description' => ['nullable', 'string'],
                'status' => ['required', 'string', 'in:draft,published,archived'],
                'meta_title' => ['nullable', 'string', 'max:255'],
                'meta_description' => ['nullable', 'string'],
                'is_featured' => ['nullable', 'boolean'],
                'variant_sku' => ['required', 'string', 'max:255', 'unique:product_variants,sku'],
                'variant_price' => ['required', 'numeric', 'min:0'],
                'variant_stock_quantity' => ['nullable', 'integer', 'min:0'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $slug = $request->input('slug') ?: Str::slug($request->input('name'));
            $slug = $this->uniqueProductSlug($slug);

            $product = null;

            DB::transaction(function () use ($request, $slug, &$product) {
                $product = Product::query()->create([
                    'brand_id' => $request->input('brand_id'),
                    'subcategory_id' => $request->input('subcategory_id'),
                    'gender_id' => $request->input('gender_id'),
                    'name' => $request->input('name'),
                    'slug' => $slug,
                    'base_sku' => $request->input('base_sku'),
                    'summary' => $request->input('summary'),
                    'description' => $request->input('description'),
                    'status' => $request->input('status'),
                    'meta_title' => $request->input('meta_title'),
                    'meta_description' => $request->input('meta_description'),
                    'is_featured' => $request->boolean('is_featured', false),
                ]);

                ProductVariant::query()->create([
                    'product_id' => $product->id,
                    'sku' => $request->input('variant_sku'),
                    'price' => $request->input('variant_price'),
                    'stock_quantity' => $request->input('variant_stock_quantity', 0),
                    'is_default' => true,
                ]);
            });

            return $this->sendJsonResponse(true, 'Product created.', $product->fresh(['brand', 'subcategory.category', 'variants']), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProductUpdate(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:products,id'],
                'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
                'subcategory_id' => ['nullable', 'integer', 'exists:subcategories,id'],
                'gender_id' => ['nullable', 'integer', 'exists:genders,id'],
                'name' => ['sometimes', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255'],
                'base_sku' => ['nullable', 'string', 'max:255'],
                'summary' => ['nullable', 'string'],
                'description' => ['nullable', 'string'],
                'status' => ['sometimes', 'string', 'in:draft,published,archived'],
                'meta_title' => ['nullable', 'string', 'max:255'],
                'meta_description' => ['nullable', 'string'],
                'is_featured' => ['nullable', 'boolean'],
                'variant_sku' => ['nullable', 'string', 'max:255'],
                'variant_price' => ['nullable', 'numeric', 'min:0'],
                'variant_stock_quantity' => ['nullable', 'integer', 'min:0'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            /** @var Product|null $product */
            $product = Product::query()->find($request->input('id'));

            if (! $product) {
                return $this->sendJsonResponse(false, 'Product not found.', null, 200);
            }

            $payload = [];

            foreach (['brand_id', 'subcategory_id', 'gender_id', 'base_sku', 'summary', 'description', 'status', 'meta_title', 'meta_description'] as $field) {
                if ($request->has($field)) {
                    $payload[$field] = $request->input($field);
                }
            }

            if ($request->filled('name')) {
                $payload['name'] = $request->input('name');
            }

            if ($request->has('slug')) {
                $slug = $request->input('slug') ?: Str::slug($request->input('name', $product->name));
                $payload['slug'] = $this->uniqueProductSlug($slug, $product->id);
            } elseif ($request->filled('name')) {
                $payload['slug'] = $this->uniqueProductSlug(Str::slug($request->input('name')), $product->id);
            }

            if ($request->has('is_featured')) {
                $payload['is_featured'] = $request->boolean('is_featured');
            }

            $variant = $product->variants()->where('is_default', true)->first()
                ?? $product->variants()->orderBy('id')->first();

            if ($variant && (
                $request->filled('variant_sku')
                || $request->filled('variant_price')
                || $request->has('variant_stock_quantity')
            )) {
                $skuRules = ['nullable', 'string', 'max:255'];
                if ($request->filled('variant_sku')) {
                    $skuRules[] = 'unique:product_variants,sku,'.$variant->id;
                }

                $variantValidation = Validator::make($request->only(['variant_sku', 'variant_price', 'variant_stock_quantity']), [
                    'variant_sku' => $skuRules,
                    'variant_price' => ['nullable', 'numeric', 'min:0'],
                    'variant_stock_quantity' => ['nullable', 'integer', 'min:0'],
                ]);

                if ($variantValidation->fails()) {
                    return $this->sendJsonResponse(false, $variantValidation->errors()->first(), $variantValidation->errors()->getMessages(), 200);
                }
            }

            DB::transaction(function () use ($request, $product, $payload, $variant) {
                if ($payload !== []) {
                    $product->update($payload);
                }

                if ($variant && (
                    $request->filled('variant_sku')
                    || $request->filled('variant_price')
                    || $request->has('variant_stock_quantity')
                )) {
                    $vPayload = [];
                    if ($request->filled('variant_sku')) {
                        $vPayload['sku'] = $request->input('variant_sku');
                    }
                    if ($request->filled('variant_price')) {
                        $vPayload['price'] = $request->input('variant_price');
                    }
                    if ($request->has('variant_stock_quantity')) {
                        $vPayload['stock_quantity'] = $request->input('variant_stock_quantity');
                    }

                    if ($vPayload !== []) {
                        $variant->update($vPayload);
                    }
                }
            });

            return $this->sendJsonResponse(true, 'Product updated.', $product->fresh(['brand', 'subcategory.category', 'variants']), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProductDestroy(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:products,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            Product::query()->whereKey($request->input('id'))->delete();

            return $this->sendJsonResponse(true, 'Product deleted.', null, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    private function uniqueProductSlug(string $baseSlug, ?int $exceptId = null): string
    {
        $slug = $baseSlug;
        $n = 2;

        while (
            Product::query()
                ->withTrashed()
                ->where('slug', $slug)
                ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$n;
            $n++;
        }

        return $slug;
    }
}
