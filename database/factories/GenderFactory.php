<?php

namespace Database\Factories;

use App\Models\Gender;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Gender>
 */
class GenderFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->randomElement(['Trail', 'Court', 'Street', 'Classic', 'Prime', 'Flex']);

        return [
            'name' => $name.' '.fake()->numerify('##'),
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('####'),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}
