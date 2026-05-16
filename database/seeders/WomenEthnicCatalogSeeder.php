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

class WomenEthnicCatalogSeeder extends Seeder
{
    public function run(): void
    {
        Gender::query()->whereNotIn('slug', ['women'])->update(['is_active' => false]);

        $women = Gender::firstOrCreate(
            ['slug' => 'women'],
            ['name' => 'Women', 'sort_order' => 1, 'is_active' => true]
        );

        $brands = collect([
            ['name' => 'Silk Route', 'slug' => 'silk-route'],
            ['name' => 'Kala Kendra', 'slug' => 'kala-kendra'],
            ['name' => 'Rangrez', 'slug' => 'rangrez'],
        ])->map(fn ($b) => Brand::firstOrCreate(
            ['slug' => $b['slug']],
            [
                'name' => $b['name'],
                'description' => 'Curated ethnic label for women\'s wear.',
                'is_active' => true,
                'sort_order' => 0,
            ]
        ));

        $sarees = Category::firstOrCreate(
            ['slug' => 'sarees'],
            [
                'name' => 'Sarees',
                'description' => 'Silk, cotton, and designer sarees.',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $kurtas = Category::firstOrCreate(
            ['slug' => 'kurtas-suits'],
            [
                'name' => 'Kurtas & Suits',
                'description' => 'Kurta sets, salwar suits, and co-ords.',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        $tunics = Category::firstOrCreate(
            ['slug' => 'tunics'],
            [
                'name' => 'Tunics',
                'description' => 'Ethnic tunics and kurtis for everyday wear.',
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        Category::query()
            ->whereNotIn('slug', ['sarees', 'kurtas-suits', 'tunics'])
            ->update(['is_active' => false]);

        $silkSarees = Subcategory::firstOrCreate(
            ['category_id' => $sarees->id, 'slug' => 'silk-sarees'],
            ['name' => 'Silk Sarees', 'is_active' => true, 'sort_order' => 1]
        );
        $cottonSarees = Subcategory::firstOrCreate(
            ['category_id' => $sarees->id, 'slug' => 'cotton-sarees'],
            ['name' => 'Cotton Sarees', 'is_active' => true, 'sort_order' => 2]
        );
        $kurtaSets = Subcategory::firstOrCreate(
            ['category_id' => $kurtas->id, 'slug' => 'kurta-sets'],
            ['name' => 'Kurta Sets', 'is_active' => true, 'sort_order' => 1]
        );
        $salwarSuits = Subcategory::firstOrCreate(
            ['category_id' => $kurtas->id, 'slug' => 'salwar-suits'],
            ['name' => 'Salwar Suits', 'is_active' => true, 'sort_order' => 2]
        );
        $ethnicTunics = Subcategory::firstOrCreate(
            ['category_id' => $tunics->id, 'slug' => 'ethnic-tunics'],
            ['name' => 'Ethnic Tunics', 'is_active' => true, 'sort_order' => 1]
        );

        $products = [
            [
                'name' => 'Banarasi Silk Saree — Maroon Gold',
                'slug' => 'banarasi-silk-saree-maroon',
                'brand' => 0,
                'sub' => $silkSarees,
                'summary' => 'Handwoven Banarasi silk with zari border.',
                'price' => 8999,
                'size' => 'Free Size',
                'color' => 'Maroon',
                'featured' => true,
            ],
            [
                'name' => 'Kanjivaram Cotton Saree — Temple Border',
                'slug' => 'kanjivaram-cotton-saree-temple',
                'brand' => 1,
                'sub' => $cottonSarees,
                'summary' => 'Lightweight cotton saree for festive occasions.',
                'price' => 3499,
                'size' => 'Free Size',
                'color' => 'Green',
                'featured' => true,
            ],
            [
                'name' => 'Chanderi Silk Saree — Ivory',
                'slug' => 'chanderi-silk-saree-ivory',
                'brand' => 2,
                'sub' => $silkSarees,
                'summary' => 'Sheer Chanderi with subtle gold motifs.',
                'price' => 6499,
                'size' => 'Free Size',
                'color' => 'Ivory',
                'featured' => false,
            ],
            [
                'name' => 'Embroidered Kurta Set — Teal',
                'slug' => 'embroidered-kurta-set-teal',
                'brand' => 1,
                'sub' => $kurtaSets,
                'summary' => 'Kurta with palazzo and dupatta — 3-piece set.',
                'price' => 4299,
                'size' => 'M',
                'color' => 'Teal',
                'featured' => true,
            ],
            [
                'name' => 'Anarkali Salwar Suit — Rose Gold',
                'slug' => 'anarkali-salwar-suit-rose',
                'brand' => 0,
                'sub' => $salwarSuits,
                'summary' => 'Floor-length anarkali with net dupatta.',
                'price' => 5599,
                'size' => 'L',
                'color' => 'Rose',
                'featured' => true,
            ],
            [
                'name' => 'Printed Salwar Suit — Indigo',
                'slug' => 'printed-salwar-suit-indigo',
                'brand' => 2,
                'sub' => $salwarSuits,
                'summary' => 'Cotton salwar kameez for daily wear.',
                'price' => 2799,
                'size' => 'M',
                'color' => 'Indigo',
                'featured' => false,
            ],
            [
                'name' => 'A-Line Ethnic Tunic — Mustard',
                'slug' => 'a-line-ethnic-tunic-mustard',
                'brand' => 1,
                'sub' => $ethnicTunics,
                'summary' => 'Cotton tunic with mirror work yoke.',
                'price' => 1899,
                'size' => 'L',
                'color' => 'Mustard',
                'featured' => false,
            ],
            [
                'name' => 'Straight Kurti Tunic — Black',
                'slug' => 'straight-kurti-tunic-black',
                'brand' => 0,
                'sub' => $ethnicTunics,
                'summary' => 'Versatile black kurti for office or casual.',
                'price' => 1599,
                'size' => 'S',
                'color' => 'Black',
                'featured' => false,
            ],
        ];

        foreach ($products as $index => $row) {
            $brand = $brands[$row['brand']];

            $product = Product::updateOrCreate(
                ['slug' => $row['slug']],
                [
                    'brand_id' => $brand->id,
                    'subcategory_id' => $row['sub']->id,
                    'gender_id' => $women->id,
                    'name' => $row['name'],
                    'base_sku' => strtoupper(Str::slug($row['slug'], '')),
                    'summary' => $row['summary'],
                    'description' => $row['summary'].' Crafted for the Suhaag women\'s ethnic collection.',
                    'status' => 'published',
                    'is_featured' => $row['featured'],
                ]
            );

            ProductVariant::updateOrCreate(
                ['sku' => 'SUH-'.strtoupper(Str::slug($row['slug'], '-'))],
                [
                    'product_id' => $product->id,
                    'barcode' => null,
                    'size' => $row['size'],
                    'color' => $row['color'],
                    'price' => $row['price'],
                    'compare_at_price' => $row['price'] + 500,
                    'cost' => (int) ($row['price'] * 0.45),
                    'stock_quantity' => 25,
                    'low_stock_threshold' => 3,
                    'weight_kg' => 0.35,
                    'is_default' => true,
                ]
            );
        }
    }
}
