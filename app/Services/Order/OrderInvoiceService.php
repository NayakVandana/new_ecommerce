<?php

namespace App\Services\Order;

use App\Models\Order;

class OrderInvoiceService
{
    public function findForInvoice(int $id): ?Order
    {
        return Order::query()
            ->with([
                'user:id,name,email,phone',
                'items' => fn ($q) => $q->orderBy('id'),
                'items.productVariant',
                'payments' => fn ($q) => $q->orderBy('id'),
            ])
            ->find($id);
    }

    /**
     * @param  array<string, mixed>|null  $snapshot
     * @return array<int, string>
     */
    public function formatAddressLines(?array $snapshot): array
    {
        if (! is_array($snapshot) || empty($snapshot['line1'])) {
            return [];
        }

        $cityLine = collect([
            $snapshot['city'] ?? null,
            $snapshot['state'] ?? null,
            $snapshot['postal_code'] ?? null,
        ])->filter()->implode(', ');

        return array_values(array_filter([
            $snapshot['full_name'] ?? null,
            $snapshot['phone'] ?? null,
            $snapshot['line1'] ?? null,
            $snapshot['line2'] ?? null,
            $cityLine !== '' ? $cityLine : null,
        ]));
    }

    public function statusLabel(string $status): string
    {
        return config('orders.statuses.'.$status)
            ?? ucfirst(str_replace('_', ' ', $status));
    }
}
