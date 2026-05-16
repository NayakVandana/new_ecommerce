<?php

namespace App\Support;

class StoreDelivery
{
    /**
     * Cities we deliver to (display name => metadata).
     *
     * @return array<string, array{state: string}>
     */
    public static function cities(): array
    {
        /** @var array<string, array{state: string}> $cities */
        $cities = config('checkout.delivery_cities', []);

        return $cities;
    }

    /**
     * @return list<string>
     */
    public static function cityNames(): array
    {
        return array_keys(self::cities());
    }

    public static function isDeliverableCity(string $city): bool
    {
        return in_array(trim($city), self::cityNames(), true);
    }

    public static function stateForCity(string $city): ?string
    {
        $cities = self::cities();

        return $cities[trim($city)]['state'] ?? null;
    }

    /**
     * @return list<array{name: string, state: string}>
     */
    public static function citiesForApi(): array
    {
        return collect(self::cities())
            ->map(fn (array $meta, string $name) => [
                'name' => $name,
                'state' => $meta['state'],
            ])
            ->values()
            ->all();
    }
}
