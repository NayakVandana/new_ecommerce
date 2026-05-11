<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Gender;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'brand_id' => Brand::factory(),
            'subcategory_id' => Subcategory::factory(),
            'gender_id' => Gender::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 99999),
            'base_sku' => strtoupper(Str::random(8)),
            'summary' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'status' => 'published',
            'meta_title' => null,
            'meta_description' => null,
            'is_featured' => fake()->boolean(30),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }
}
