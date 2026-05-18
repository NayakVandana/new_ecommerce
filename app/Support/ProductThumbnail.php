<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductThumbnail
{
    public static function resolvePublicUrl(?string $path, ?string $disk): ?string
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

    /**
     * @return array<string, mixed>
     */
    public static function productMediaEagerConstraints(): array
    {
        return [
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
        ];
    }

    public static function forProduct(?Product $product): ?string
    {
        if ($product === null) {
            return null;
        }

        $defaultVariant = $product->variants->first(fn ($v) => $v->is_default)
            ?? $product->variants->first();
        $img = $defaultVariant?->images->first()
            ?? $product->images->first();

        if ($img === null || ! $img->path) {
            return null;
        }

        return self::resolvePublicUrl($img->path, $img->disk);
    }
}
