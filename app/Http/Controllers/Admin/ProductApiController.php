<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\ProductVideo;
use App\Services\Admin\ProductFormLoaderService;
use App\Services\Admin\ProductFormMetaService;
use App\Support\StoreCatalog;
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
                    'variants' => fn ($q) => $q
                        ->orderByDesc('is_default')
                        ->orderBy('id')
                        ->with(['images' => fn ($iq) => $iq
                            ->orderByDesc('is_primary')
                            ->orderBy('sort_order')
                            ->orderBy('id')
                            ->limit(1),
                        ]),
                    'images' => fn ($q) => $q
                        ->whereNull('product_variant_id')
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

            if (StoreCatalog::womenOnly()) {
                $womenId = StoreCatalog::womenGenderId();
                if ($womenId) {
                    $query->where('gender_id', $womenId);
                }
            }

            $products = $query->paginate($perPage, ['*'], 'page', $currentPage);

            $products->getCollection()->transform(function (Product $product) {
                $defaultVariant = $product->variants->firstWhere('is_default', true)
                    ?? $product->variants->first();
                $img = $defaultVariant?->images->first()
                    ?? $product->images->first();
                $thumbUrl = null;
                if ($img && $img->path) {
                    $thumbUrl = $this->resolveImagePublicUrl($img->path, $img->disk);
                }
                $product->setAttribute('thumb_url', $thumbUrl);
                $product->setAttribute(
                    'total_stock',
                    (int) $product->variants->sum('stock_quantity'),
                );
                $product->unsetRelation('images');
                $product->variants->each(fn ($v) => $v->unsetRelation('images'));

                return $product;
            });

            return $this->sendJsonResponse(true, 'Products fetched successfully.', $products, 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProductFormMeta(ProductFormMetaService $metaService)
    {
        try {
            return $this->sendJsonResponse(true, 'Product form meta fetched successfully.', $metaService->get(), 200);
        } catch (Exception $e) {
            return $this->sendError($e);
        }
    }

    public function postProductShow(Request $request, ProductFormLoaderService $loader)
    {
        try {
            $validation = Validator::make($request->all(), [
                'id' => ['required', 'integer', 'exists:products,id'],
            ]);

            if ($validation->fails()) {
                return $this->sendJsonResponse(false, $validation->errors()->first(), $validation->errors()->getMessages(), 200);
            }

            $product = Product::query()->find($request->input('id'));

            if (! $product) {
                return $this->sendJsonResponse(false, 'Product not found.', null, 200);
            }

            return $this->sendJsonResponse(
                true,
                'Product fetched successfully.',
                $loader->loadForForm($product),
                200,
            );
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
                'subcategory_id' => ['required', 'integer', 'exists:subcategories,id'],
                'gender_id' => ['required', 'integer', 'exists:genders,id'],
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
                $rules['variants.*.color_hex'] = ['nullable', 'string', 'max:7', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'];
                $rules['variants.*.barcode'] = ['nullable', 'string', 'max:255'];
                $rules['variants.*.is_default'] = ['nullable', 'boolean'];
                $rules['variants.*.images'] = ['nullable', 'array'];
                $rules['variants.*.images.*.id'] = ['nullable', 'integer'];
                $rules['variants.*.images.*.path'] = ['required', 'string', 'max:2048'];
                $rules['variants.*.images.*.alt_text'] = ['nullable', 'string', 'max:255'];
                $rules['variants.*.images.*.sort_order'] = ['nullable', 'integer', 'min:0', 'max:65535'];
                $rules['variants.*.images.*.is_primary'] = ['nullable', 'boolean'];
                $rules['variants.*.videos'] = ['nullable', 'array'];
                $rules['variants.*.videos.*.id'] = ['nullable', 'integer'];
                $rules['variants.*.videos.*.url'] = ['required', 'string', 'max:2048'];
                $rules['variants.*.videos.*.provider'] = ['nullable', 'string', 'max:32'];
                $rules['variants.*.videos.*.sort_order'] = ['nullable', 'integer', 'min:0', 'max:65535'];
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
                $sizeColorError = $this->assertVariantSizeColorRules($variantsInput);
                if ($sizeColorError !== null) {
                    return $this->sendJsonResponse(false, $sizeColorError, null, 200);
                }

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
                    $createdVariantModels = [];
                    foreach ($variantsInput as $row) {
                        $createdVariantModels[] = ProductVariant::query()->create([
                            'product_id' => $product->id,
                            'sku' => $row['sku'],
                            'price' => $row['price'],
                            'stock_quantity' => $row['stock_quantity'] ?? 0,
                            'size' => $row['size'] ?? null,
                            'color' => isset($row['color']) ? (trim((string) $row['color']) ?: null) : null,
                            'color_hex' => $this->normalizeVariantColorHex($row['color_hex'] ?? null),
                            'barcode' => $row['barcode'] ?? null,
                            'is_default' => (bool) ($row['is_default'] ?? false),
                        ]);
                    }
                    $this->normalizeSingleDefaultVariant($product);
                    foreach ($createdVariantModels as $i => $v) {
                        $row = $variantsInput[$i];
                        foreach ($row['images'] ?? [] as $j => $img) {
                            $path = isset($img['path']) ? trim((string) $img['path']) : '';
                            if ($path === '') {
                                continue;
                            }
                            ProductImage::query()->create([
                                'product_id' => $product->id,
                                'product_variant_id' => $v->id,
                                'path' => $path,
                                'disk' => preg_match('#^https?://#i', $path) ? 'external' : ($img['disk'] ?? 'public'),
                                'alt_text' => $img['alt_text'] ?? null,
                                'sort_order' => (int) ($img['sort_order'] ?? $j),
                                'is_primary' => (bool) ($img['is_primary'] ?? false),
                            ]);
                        }
                        foreach ($row['videos'] ?? [] as $j => $vid) {
                            $url = isset($vid['url']) ? trim((string) $vid['url']) : '';
                            if ($url === '') {
                                continue;
                            }
                            ProductVideo::query()->create([
                                'product_id' => $product->id,
                                'product_variant_id' => $v->id,
                                'url' => $url,
                                'provider' => $vid['provider'] ?? null,
                                'sort_order' => (int) ($vid['sort_order'] ?? $j),
                            ]);
                        }
                    }
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
                $this->normalizePrimaryImagesForProduct($product);

                foreach ($request->input('videos', []) as $j => $vid) {
                    $url = isset($vid['url']) ? trim((string) $vid['url']) : '';
                    if ($url === '') {
                        continue;
                    }
                    ProductVideo::query()->create([
                        'product_id' => $product->id,
                        'product_variant_id' => null,
                        'url' => $url,
                        'provider' => $vid['provider'] ?? null,
                        'sort_order' => (int) ($vid['sort_order'] ?? $j),
                    ]);
                }
            });

            return $this->sendJsonResponse(true, 'Product created.', $product->fresh([
                'brand',
                'subcategory.category',
                'variants' => fn ($q) => $q->orderByDesc('is_default')->orderBy('id')->with([
                    'images' => fn ($iq) => $iq->orderBy('sort_order')->orderBy('id'),
                    'videos' => fn ($vq) => $vq->orderBy('sort_order')->orderBy('id'),
                ]),
                'images' => fn ($q) => $q->whereNull('product_variant_id')->orderBy('sort_order')->orderBy('id'),
                'videos' => fn ($q) => $q->whereNull('product_variant_id')->orderBy('sort_order')->orderBy('id'),
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
                'subcategory_id' => ['required', 'integer', 'exists:subcategories,id'],
                'gender_id' => ['required', 'integer', 'exists:genders,id'],
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
                'variants.*.color_hex' => ['nullable', 'string', 'max:7', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
                'variants.*.barcode' => ['nullable', 'string', 'max:255'],
                'variants.*.is_default' => ['nullable', 'boolean'],
                'variants.*.images' => ['nullable', 'array'],
                'variants.*.images.*.id' => ['nullable', 'integer'],
                'variants.*.images.*.path' => ['required', 'string', 'max:2048'],
                'variants.*.images.*.alt_text' => ['nullable', 'string', 'max:255'],
                'variants.*.images.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
                'variants.*.images.*.is_primary' => ['nullable', 'boolean'],
                'variants.*.videos' => ['nullable', 'array'],
                'variants.*.videos.*.id' => ['nullable', 'integer'],
                'variants.*.videos.*.url' => ['required', 'string', 'max:2048'],
                'variants.*.videos.*.provider' => ['nullable', 'string', 'max:32'],
                'variants.*.videos.*.sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
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
                $sizeColorError = $this->assertVariantSizeColorRules($variantsPayload);
                if ($sizeColorError !== null) {
                    return $this->sendJsonResponse(false, $sizeColorError, null, 200);
                }

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
                    $resolvedVariants = [];
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
                                    'color' => isset($row['color']) ? (trim((string) $row['color']) ?: null) : null,
                                    'color_hex' => $this->normalizeVariantColorHex($row['color_hex'] ?? null),
                                    'barcode' => $row['barcode'] ?? null,
                                    'is_default' => (bool) ($row['is_default'] ?? false),
                                ]);
                                $resolvedVariants[] = $v;
                            } else {
                                $resolvedVariants[] = null;
                            }
                        } else {
                            $resolvedVariants[] = ProductVariant::query()->create([
                                'product_id' => $product->id,
                                'sku' => $row['sku'],
                                'price' => $row['price'],
                                'stock_quantity' => $row['stock_quantity'] ?? 0,
                                'size' => $row['size'] ?? null,
                                'color' => isset($row['color']) ? (trim((string) $row['color']) ?: null) : null,
                                'color_hex' => $this->normalizeVariantColorHex($row['color_hex'] ?? null),
                                'barcode' => $row['barcode'] ?? null,
                                'is_default' => (bool) ($row['is_default'] ?? false),
                            ]);
                        }
                    }
                    $this->normalizeSingleDefaultVariant($product->fresh());

                    foreach ($variantsPayload as $i => $row) {
                        $v = $resolvedVariants[$i] ?? null;
                        if (! $v) {
                            continue;
                        }
                        if (array_key_exists('images', $row)) {
                            $this->syncVariantImages(
                                $product,
                                $v,
                                is_array($row['images']) ? $row['images'] : [],
                            );
                        }
                        if (array_key_exists('videos', $row)) {
                            $this->syncVariantVideos(
                                $product,
                                $v,
                                is_array($row['videos']) ? $row['videos'] : [],
                            );
                        }
                    }
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

                $this->normalizePrimaryImagesForProduct($product->fresh());
            });

            return $this->sendJsonResponse(true, 'Product updated.', $product->fresh([
                'brand',
                'subcategory.category',
                'variants' => fn ($q) => $q->orderByDesc('is_default')->orderBy('id')->with([
                    'images' => fn ($iq) => $iq->orderBy('sort_order')->orderBy('id'),
                    'videos' => fn ($vq) => $vq->orderBy('sort_order')->orderBy('id'),
                ]),
                'images' => fn ($q) => $q->whereNull('product_variant_id')->orderBy('sort_order')->orderBy('id'),
                'videos' => fn ($q) => $q->whereNull('product_variant_id')->orderBy('sort_order')->orderBy('id'),
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

    private function normalizePrimaryImagesForProduct(Product $product): void
    {
        $this->normalizePrimaryImageScope($product->id, null);
        foreach ($product->variants()->pluck('id') as $variantId) {
            $this->normalizePrimaryImageScope($product->id, (int) $variantId);
        }
    }

    private function normalizePrimaryImageScope(int $productId, ?int $variantId): void
    {
        $q = ProductImage::query()->where('product_id', $productId);
        if ($variantId === null) {
            $q->whereNull('product_variant_id');
        } else {
            $q->where('product_variant_id', $variantId);
        }
        $images = $q->orderBy('sort_order')->orderBy('id')->get();
        if ($images->isEmpty()) {
            return;
        }

        $chosen = $images->firstWhere('is_primary', true) ?? $images->first();

        foreach ($images as $img) {
            $img->update(['is_primary' => $img->id === $chosen->id]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $images
     */
    private function syncVariantImages(Product $product, ProductVariant $variant, array $images): void
    {
        $idsToKeep = [];

        foreach ($images as $j => $img) {
            $path = isset($img['path']) ? trim((string) $img['path']) : '';
            if ($path === '') {
                continue;
            }

            $disk = preg_match('#^https?://#i', $path) ? 'external' : ($img['disk'] ?? 'public');
            $id = isset($img['id']) ? (int) $img['id'] : 0;

            if ($id > 0) {
                $model = ProductImage::query()
                    ->where('product_id', $product->id)
                    ->where('product_variant_id', $variant->id)
                    ->whereKey($id)
                    ->first();
                if ($model) {
                    $model->update([
                        'path' => $path,
                        'disk' => $disk,
                        'alt_text' => $img['alt_text'] ?? null,
                        'sort_order' => (int) ($img['sort_order'] ?? $j),
                        'is_primary' => (bool) ($img['is_primary'] ?? false),
                    ]);
                    $idsToKeep[] = $model->id;
                }
            } else {
                $created = ProductImage::query()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'path' => $path,
                    'disk' => $disk,
                    'alt_text' => $img['alt_text'] ?? null,
                    'sort_order' => (int) ($img['sort_order'] ?? $j),
                    'is_primary' => (bool) ($img['is_primary'] ?? false),
                ]);
                $idsToKeep[] = $created->id;
            }
        }

        $q = ProductImage::query()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant->id);

        if ($idsToKeep === []) {
            $q->delete();
        } else {
            $q->whereNotIn('id', $idsToKeep)->delete();
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $videos
     */
    private function syncVariantVideos(Product $product, ProductVariant $variant, array $videos): void
    {
        $idsToKeep = [];

        foreach ($videos as $j => $vid) {
            $url = isset($vid['url']) ? trim((string) $vid['url']) : '';
            if ($url === '') {
                continue;
            }

            $id = isset($vid['id']) ? (int) $vid['id'] : 0;

            if ($id > 0) {
                $model = ProductVideo::query()
                    ->where('product_id', $product->id)
                    ->where('product_variant_id', $variant->id)
                    ->whereKey($id)
                    ->first();
                if ($model) {
                    $model->update([
                        'url' => $url,
                        'provider' => $vid['provider'] ?? null,
                        'sort_order' => (int) ($vid['sort_order'] ?? $j),
                    ]);
                    $idsToKeep[] = $model->id;
                }
            } else {
                $created = ProductVideo::query()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'url' => $url,
                    'provider' => $vid['provider'] ?? null,
                    'sort_order' => (int) ($vid['sort_order'] ?? $j),
                ]);
                $idsToKeep[] = $created->id;
            }
        }

        $q = ProductVideo::query()
            ->where('product_id', $product->id)
            ->where('product_variant_id', $variant->id);

        if ($idsToKeep === []) {
            $q->delete();
        } else {
            $q->whereNotIn('id', $idsToKeep)->delete();
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $variantsInput
     */
    private function assertVariantSizeColorRules(array $variantsInput): ?string
    {
        $seen = [];

        foreach ($variantsInput as $row) {
            $size = isset($row['size']) ? trim((string) $row['size']) : '';
            $colorName = trim((string) ($row['color'] ?? ''));
            $hex = $this->normalizeVariantColorHex($row['color_hex'] ?? null);

            if ($size === '') {
                return 'Each variant must have a size.';
            }

            if ($hex === null && $colorName === '') {
                return 'Each variant must have a color (name or hex).';
            }

            $hasImage = false;
            foreach ($row['images'] ?? [] as $img) {
                if (trim((string) ($img['path'] ?? '')) !== '') {
                    $hasImage = true;

                    break;
                }
            }

            if (! $hasImage) {
                return 'Each variant must have at least one image.';
            }

            $key = $size."\0".($hex ?? strtolower($colorName));

            if (isset($seen[$key])) {
                return 'Duplicate variant: the same size and color combination is not allowed.';
            }

            $seen[$key] = true;
        }

        return null;
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
