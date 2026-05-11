<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $men = Gender::firstOrCreate(
            ['slug' => 'men'],
            ['name' => 'Men', 'sort_order' => 1, 'is_active' => true]
        );
        $women = Gender::firstOrCreate(
            ['slug' => 'women'],
            ['name' => 'Women', 'sort_order' => 2, 'is_active' => true]
        );
        $unisex = Gender::firstOrCreate(
            ['slug' => 'unisex'],
            ['name' => 'Unisex', 'sort_order' => 3, 'is_active' => true]
        );

        $brands = collect([
            ['name' => 'NorthWave', 'slug' => 'northwave'],
            ['name' => 'UrbanFit', 'slug' => 'urbanfit'],
            ['name' => 'PureLine', 'slug' => 'pureline'],
        ])->map(fn ($b) => Brand::firstOrCreate(
            ['slug' => $b['slug']],
            [
                'name' => $b['name'],
                'description' => 'Demo brand for admin UI.',
                'is_active' => true,
                'sort_order' => 0,
            ]
        ));

        $electronics = Category::firstOrCreate(
            ['slug' => 'electronics'],
            [
                'name' => 'Electronics',
                'description' => 'Gadgets and devices',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $fashion = Category::firstOrCreate(
            ['slug' => 'fashion'],
            [
                'name' => 'Fashion',
                'description' => 'Apparel and accessories',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $phoneSub = Subcategory::firstOrCreate(
            ['category_id' => $electronics->id, 'slug' => 'phones'],
            [
                'name' => 'Phones',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $audioSub = Subcategory::firstOrCreate(
            ['category_id' => $electronics->id, 'slug' => 'audio'],
            [
                'name' => 'Audio',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $topsSub = Subcategory::firstOrCreate(
            ['category_id' => $fashion->id, 'slug' => 'tops'],
            [
                'name' => 'Tops',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $footwearSub = Subcategory::firstOrCreate(
            ['category_id' => $fashion->id, 'slug' => 'footwear'],
            [
                'name' => 'Footwear',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $demoProducts = [
            ['name' => 'Pulse Phone X', 'slug' => 'pulse-phone-x', 'brand' => 0, 'sub' => $phoneSub, 'gender' => $unisex->id],
            ['name' => 'AeroBuds Pro', 'slug' => 'aerobuds-pro', 'brand' => 1, 'sub' => $audioSub, 'gender' => $unisex->id],
            ['name' => 'Studio Headphones', 'slug' => 'studio-headphones', 'brand' => 2, 'sub' => $audioSub, 'gender' => $unisex->id],
            ['name' => 'Flex Tee', 'slug' => 'flex-tee', 'brand' => 1, 'sub' => $topsSub, 'gender' => $men->id],
            ['name' => 'City Sneakers', 'slug' => 'city-sneakers', 'brand' => 0, 'sub' => $footwearSub, 'gender' => $women->id],
            ['name' => 'Trail Runner', 'slug' => 'trail-runner', 'brand' => 2, 'sub' => $footwearSub, 'gender' => $men->id],
        ];

        foreach ($demoProducts as $index => $row) {
            $brand = $brands[$row['brand']];

            $product = Product::firstOrCreate(
                ['slug' => $row['slug']],
                [
                    'brand_id' => $brand->id,
                    'subcategory_id' => $row['sub']->id,
                    'gender_id' => $row['gender'],
                    'name' => $row['name'],
                    'base_sku' => strtoupper(Str::slug($row['slug'], '')),
                    'summary' => 'Demo catalog item for UI testing.',
                    'description' => 'Seeded product used to preview the Tailwind admin tables and storefront APIs.',
                    'status' => 'published',
                    'is_featured' => $index < 2,
                ]
            );

            ProductVariant::firstOrCreate(
                ['sku' => 'DEMO-'.strtoupper(Str::slug($row['slug'], '-'))],
                [
                    'product_id' => $product->id,
                    'barcode' => null,
                    'size' => $index % 2 === 0 ? 'M' : 'L',
                    'color' => $index % 2 === 0 ? 'Black' : 'White',
                    'price' => 49.99 + ($index * 10),
                    'compare_at_price' => 89.99 + ($index * 10),
                    'cost' => 25,
                    'stock_quantity' => 120,
                    'low_stock_threshold' => 10,
                    'weight_kg' => 0.45,
                    'is_default' => true,
                ]
            );
        }

        Product::factory()
            ->count(6)
            ->published()
            ->has(ProductVariant::factory()->count(2), 'variants')
            ->create();
    }
}
