<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\ProductVideo;
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
                    $thumbUrl = $this->resolveImagePublicUrl($img->path, $img->disk);
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
            $variantsInput = $request->input('variants');
            $useVariantsArray = is_array($variantsInput) && count($variantsInput) > 0;

            $rules = [
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
                'images' => ['nullable', 'array'],
                'images.*.path' => ['required', 'string', 'max:2048'],
                'images.*.alt_text' => ['nullable', 'string', 'max:255'],
                'images.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
                'images.*.is_primary' => ['nullable', 'boolean'],
                'videos' => ['nullable', 'array'],
                'videos.*.url' => ['required', 'string', 'max:2048'],
                'videos.*.provider' => ['nullable', 'string', 'max:32'],
                'videos.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
            ];

            if ($useVariantsArray) {
                $rules['variants'] = ['required', 'array', 'min:1'];
                $rules['variants.*.sku'] = ['required', 'string', 'max:255', 'distinct'];
                $rules['variants.*.price'] = ['required', 'numeric', 'min:0'];
                $rules['variants.*.stock_quantity'] = ['nullable', 'integer', 'min:0'];
                $rules['variants.*.size'] = ['nullable', 'string', 'max:50'];
                $rules['variants.*.color'] = ['nullable', 'string', 'max:50'];
                $rules['variants.*.barcode'] = ['nullable', 'string', 'max:255'];
                $rules['variants.*.is_default'] = ['nullable', 'boolean'];
            } else {
                $rules['variant_sku'] = ['required', 'string', 'max:255', 'unique:product_variants,sku'];
                $rules['variant_price'] = ['required', 'numeric', 'min:0'];
                $rules['variant_stock_quantity'] = ['nullable', 'integer', 'min:0'];
            }

            $validation = Validator::make($request->all(), $rules);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            if ($useVariantsArray) {
                foreach ($variantsInput as $row) {
                    if (ProductVariant::query()->where('sku', $row['sku'])->exists()) {
                        return $this->sendJsonResponse(false, 'SKU "'.$row['sku'].'" is already in use.', null, 200);
                    }
                }
            }

            $slug = $request->input('slug') ?: Str::slug($request->input('name'));
            $slug = $this->uniqueProductSlug($slug);

            $product = null;

            DB::transaction(function () use ($request, $slug, &$product, $useVariantsArray, $variantsInput) {
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

                if ($useVariantsArray) {
                    foreach ($variantsInput as $row) {
                        ProductVariant::query()->create([
                            'product_id' => $product->id,
                            'sku' => $row['sku'],
                            'price' => $row['price'],
                            'stock_quantity' => $row['stock_quantity'] ?? 0,
                            'size' => $row['size'] ?? null,
                            'color' => $row['color'] ?? null,
                            'barcode' => $row['barcode'] ?? null,
                            'is_default' => (bool) ($row['is_default'] ?? false),
                        ]);
                    }
                    $this->normalizeSingleDefaultVariant($product);
                } else {
                    ProductVariant::query()->create([
                        'product_id' => $product->id,
                        'sku' => $request->input('variant_sku'),
                        'price' => $request->input('variant_price'),
                        'stock_quantity' => $request->input('variant_stock_quantity', 0),
                        'is_default' => true,
                    ]);
                }

                foreach ($request->input('images', []) as $img) {
                    $path = isset($img['path']) ? trim((string) $img['path']) : '';
                    if ($path === '') {
                        continue;
                    }
                    ProductImage::query()->create([
                        'product_id' => $product->id,
                        'product_variant_id' => null,
                        'path' => $path,
                        'disk' => preg_match('#^https?://#i', $path) ? 'external' : ($img['disk'] ?? 'public'),
                        'alt_text' => $img['alt_text'] ?? null,
                        'sort_order' => (int) ($img['sort_order'] ?? 0),
                        'is_primary' => (bool) ($img['is_primary'] ?? false),
                    ]);
                }
                $this->normalizePrimaryImage($product);

                foreach ($request->input('videos', []) as $vid) {
                    $url = isset($vid['url']) ? trim((string) $vid['url']) : '';
                    if ($url === '') {
                        continue;
                    }
                    ProductVideo::query()->create([
                        'product_id' => $product->id,
                        'url' => $url,
                        'provider' => $vid['provider'] ?? null,
                        'sort_order' => (int) ($vid['sort_order'] ?? 0),
                    ]);
                }
            });

            return $this->sendJsonResponse(true, 'Product created.', $product->fresh([
                'brand',
                'subcategory.category',
                'variants',
                'images',
                'videos',
            ]), 200);
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
                'variants' => ['nullable', 'array'],
                'variants.*.id' => ['nullable', 'integer'],
                'variants.*.sku' => ['required_with:variants', 'string', 'max:255'],
                'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
                'variants.*.stock_quantity' => ['nullable', 'integer', 'min:0'],
                'variants.*.size' => ['nullable', 'string', 'max:50'],
                'variants.*.color' => ['nullable', 'string', 'max:50'],
                'variants.*.barcode' => ['nullable', 'string', 'max:255'],
                'variants.*.is_default' => ['nullable', 'boolean'],
                'new_images' => ['nullable', 'array'],
                'new_images.*.path' => ['required', 'string', 'max:2048'],
                'new_images.*.alt_text' => ['nullable', 'string', 'max:255'],
                'new_images.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
                'new_images.*.is_primary' => ['nullable', 'boolean'],
                'new_videos' => ['nullable', 'array'],
                'new_videos.*.url' => ['required', 'string', 'max:2048'],
                'new_videos.*.provider' => ['nullable', 'string', 'max:32'],
                'new_videos.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
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

            $variantsPayload = $request->input('variants');
            $useVariantsArray = is_array($variantsPayload) && count($variantsPayload) > 0;

            if ($useVariantsArray) {
                $seen = [];
                foreach ($variantsPayload as $row) {
                    $sku = $row['sku'] ?? '';
                    if ($sku === '') {
                        return $this->sendJsonResponse(false, 'Each variant needs a SKU.', null, 200);
                    }
                    if (isset($seen[$sku])) {
                        return $this->sendJsonResponse(false, 'Duplicate SKU in variant list.', null, 200);
                    }
                    $seen[$sku] = true;
                    $vid = $row['id'] ?? null;
                    if ($vid) {
                        $exists = ProductVariant::query()
                            ->where('product_id', $product->id)
                            ->whereKey($vid)
                            ->exists();
                        if (! $exists) {
                            return $this->sendJsonResponse(false, 'Invalid variant id.', null, 200);
                        }
                        if (ProductVariant::query()->where('sku', $sku)->where('id', '!=', $vid)->exists()) {
                            return $this->sendJsonResponse(false, 'SKU "'.$sku.'" is already in use.', null, 200);
                        }
                    } elseif (ProductVariant::query()->where('sku', $sku)->exists()) {
                        return $this->sendJsonResponse(false, 'SKU "'.$sku.'" is already in use.', null, 200);
                    }
                }
            } elseif ($variant && (
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

            DB::transaction(function () use ($request, $product, $payload, $variant, $useVariantsArray, $variantsPayload) {
                if ($payload !== []) {
                    $product->update($payload);
                }

                if ($useVariantsArray) {
                    foreach ($variantsPayload as $row) {
                        $vid = $row['id'] ?? null;
                        if ($vid) {
                            /** @var ProductVariant|null $v */
                            $v = ProductVariant::query()
                                ->where('product_id', $product->id)
                                ->whereKey($vid)
                                ->first();
                            if ($v) {
                                $v->update([
                                    'sku' => $row['sku'],
                                    'price' => $row['price'],
                                    'stock_quantity' => $row['stock_quantity'] ?? 0,
                                    'size' => $row['size'] ?? null,
                                    'color' => $row['color'] ?? null,
                                    'barcode' => $row['barcode'] ?? null,
                                    'is_default' => (bool) ($row['is_default'] ?? false),
                                ]);
                            }
                        } else {
                            ProductVariant::query()->create([
                                'product_id' => $product->id,
                                'sku' => $row['sku'],
                                'price' => $row['price'],
                                'stock_quantity' => $row['stock_quantity'] ?? 0,
                                'size' => $row['size'] ?? null,
                                'color' => $row['color'] ?? null,
                                'barcode' => $row['barcode'] ?? null,
                                'is_default' => (bool) ($row['is_default'] ?? false),
                            ]);
                        }
                    }
                    $this->normalizeSingleDefaultVariant($product->fresh());
                } elseif ($variant && (
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

                foreach ($request->input('new_images', []) as $img) {
                    $path = isset($img['path']) ? trim((string) $img['path']) : '';
                    if ($path === '') {
                        continue;
                    }
                    ProductImage::query()->create([
                        'product_id' => $product->id,
                        'product_variant_id' => null,
                        'path' => $path,
                        'disk' => preg_match('#^https?://#i', $path) ? 'external' : ($img['disk'] ?? 'public'),
                        'alt_text' => $img['alt_text'] ?? null,
                        'sort_order' => (int) ($img['sort_order'] ?? 0),
                        'is_primary' => (bool) ($img['is_primary'] ?? false),
                    ]);
                }
                $this->normalizePrimaryImage($product->fresh());

                foreach ($request->input('new_videos', []) as $vid) {
                    $url = isset($vid['url']) ? trim((string) $vid['url']) : '';
                    if ($url === '') {
                        continue;
                    }
                    ProductVideo::query()->create([
                        'product_id' => $product->id,
                        'url' => $url,
                        'provider' => $vid['provider'] ?? null,
                        'sort_order' => (int) ($vid['sort_order'] ?? 0),
                    ]);
                }
            });

            return $this->sendJsonResponse(true, 'Product updated.', $product->fresh([
                'brand',
                'subcategory.category',
                'variants',
                'images',
                'videos',
            ]), 200);
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

    private function resolveImagePublicUrl(?string $path, ?string $disk): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        if (($disk ?? '') === 'external') {
            return $path;
        }

        try {
            $d = $disk ?: config('filesystems.default');

            return Storage::disk($d)->url($path);
        } catch (\Throwable) {
            return null;
        }
    }

    private function normalizeSingleDefaultVariant(Product $product): void
    {
        $variants = $product->variants()->orderBy('id')->get();
        if ($variants->isEmpty()) {
            return;
        }

        $chosen = $variants->firstWhere('is_default', true) ?? $variants->first();

        foreach ($variants as $v) {
            $v->update(['is_default' => $v->id === $chosen->id]);
        }
    }

    private function normalizePrimaryImage(Product $product): void
    {
        $images = $product->images()->orderBy('sort_order')->orderBy('id')->get();
        if ($images->isEmpty()) {
            return;
        }

        $chosen = $images->firstWhere('is_primary', true) ?? $images->first();

        foreach ($images as $img) {
            $img->update(['is_primary' => $img->id === $chosen->id]);
        }
    }
}
