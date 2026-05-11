<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        $price = fake()->randomFloat(2, 9, 499);

        return [
            'product_id' => Product::factory(),
            'sku' => 'SKU-'.Str::upper(Str::random(10)),
            'barcode' => fake()->optional()->ean13(),
            'size' => fake()->randomElement(['S', 'M', 'L', 'XL', null]),
            'color' => fake()->safeColorName(),
            'price' => $price,
            'compare_at_price' => fake()->optional()->randomFloat(2, $price, $price * 1.3),
            'cost' => fake()->optional()->randomFloat(2, 5, $price * 0.6),
            'stock_quantity' => fake()->numberBetween(0, 200),
            'low_stock_threshold' => 5,
            'weight_kg' => fake()->randomFloat(3, 0.1, 5),
            'is_default' => false,
        ];
    }
}
