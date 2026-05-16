<?php

namespace App\Services\Admin;

use App\Models\Brand;
use App\Models\Gender;
use App\Models\Subcategory;
use Illuminate\Support\Collection;

class ProductFormMetaService
{
    /**
     * Lookup data for admin product create/edit (web Inertia + mobile API).
     *
     * @return array{brands: Collection, subcategories: Collection, genders: Collection}
     */
    public function get(): array
    {
        return [
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
            'subcategories' => Subcategory::query()
                ->with(['category:id,name'])
                ->orderBy('name')
                ->get(['id', 'category_id', 'name']),
            'genders' => Gender::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name']),
        ];
    }
}
