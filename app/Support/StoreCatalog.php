<?php

namespace App\Support;

use App\Models\Gender;
use Illuminate\Support\Facades\Cache;

class StoreCatalog
{
    public static function womenOnly(): bool
    {
        return (bool) config('store.women_only', false);
    }

    public static function womenGenderSlug(): string
    {
        return (string) config('store.women_gender_slug', 'women');
    }

    public static function shopCategorySlugs(): array
    {
        return config('store.shop_category_slugs', []);
    }

    public static function womenGenderId(): ?int
    {
        if (! self::womenOnly()) {
            return null;
        }

        return Cache::remember('store.women_gender_id', 3600, function () {
            return Gender::query()
                ->where('slug', self::womenGenderSlug())
                ->where('is_active', true)
                ->value('id');
        });
    }
}
