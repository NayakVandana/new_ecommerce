@php
    $formatMoney = function (float $amount, string $currency): string {
        try {
            $formatter = new \NumberFormatter('en_IN', \NumberFormatter::CURRENCY);

            return $formatter->formatCurrency($amount, $currency);
        } catch (\Throwable) {
            return $currency.' '.number_format($amount, 2);
        }
    };
    $primary = $orders->first();
    $ship = $primary && is_array($primary->address_of_ship_to)
        ? $primary->address_of_ship_to
        : [];
@endphp

<x-mail::message>
# New order placed

**Customer:** {{ $user->name }} ({{ $user->email }})

@if($user->phone)
**Account phone:** {{ $user->phone }}
@endif

@foreach($orders as $order)
---

**Order #{{ $order->order_number }}** — {{ ucfirst($order->status) }}

| Product | Variant | Qty | Line total |
|:--------|:--------|:---:|-----------:|
@foreach($order->items as $item)
| {{ $item->product_name }} | {{ $item->variant_label ?: '—' }} | {{ $item->quantity }} | {{ $formatMoney((float) $item->line_total, $order->currency) }} |
@endforeach

| | |
|---|---|
| Subtotal | {{ $formatMoney((float) $order->subtotal, $order->currency) }} |
| Shipping | {{ $formatMoney((float) $order->shipping_total, $order->currency) }} |
| Discount | {{ $formatMoney((float) $order->discount_total, $order->currency) }} |
| Tax | {{ $formatMoney((float) $order->tax_total, $order->currency) }} |
| **Grand total** | **{{ $formatMoney((float) $order->grand_total, $order->currency) }}** |

@if($order->customer_note)
**Customer note:** {{ $order->customer_note }}
@endif

@endforeach

@if($orders->count() > 1)
**Combined grand total:** {{ $formatMoney($combinedTotal, $currency) }}
@endif

@if(!empty($ship))
## Shipping address

{{ $ship['full_name'] ?? '' }}

{{ $ship['line1'] ?? '' }}@if(!empty($ship['line2']))

{{ $ship['line2'] }}@endif

{{ $ship['city'] ?? '' }}, {{ $ship['state'] ?? '' }} {{ $ship['postal_code'] ?? '' }}

**Phone:** {{ $ship['phone'] ?? '—' }}
@endif

Thanks,<br>
{{ $storeName }}
</x-mail::message>
