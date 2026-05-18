@php
    $formatMoney = function (float $amount, string $currency): string {
        try {
            $formatter = new \NumberFormatter('en_IN', \NumberFormatter::CURRENCY);

            return $formatter->formatCurrency($amount, $currency);
        } catch (\Throwable) {
            return $currency.' '.number_format($amount, 2);
        }
    };
@endphp

<x-mail::message>
# Thank you for your order!

Hi {{ $user->name }},

We have received your order{{ $orders->count() > 1 ? 's' : '' }}. Payment method: **Cash on delivery**.

@foreach($orders as $order)
@php
    $ship = is_array($order->address_of_ship_to) ? $order->address_of_ship_to : [];
@endphp
---

**Order #{{ $order->order_number }}**

| Item | Qty | Total |
|:-----|:---:|------:|
@foreach($order->items as $item)
| {{ $item->product_name }}@if($item->variant_label) ({{ $item->variant_label }})@endif | {{ $item->quantity }} | {{ $formatMoney((float) $item->line_total, $order->currency) }} |
@endforeach

**Order total:** {{ $formatMoney((float) $order->grand_total, $order->currency) }}

@if(!empty($ship))
**Deliver to:** {{ $ship['full_name'] ?? '' }}, {{ $ship['line1'] ?? '' }}@if(!empty($ship['line2'])), {{ $ship['line2'] }}@endif, {{ $ship['city'] ?? '' }}, {{ $ship['state'] ?? '' }} {{ $ship['postal_code'] ?? '' }}
**Phone:** {{ $ship['phone'] ?? '—' }}
@endif

@endforeach

@if($orders->count() > 1)
**Combined total:** {{ $formatMoney($combinedTotal, $currency) }}
@endif

<x-mail::button :url="$ordersUrl">
View your orders
</x-mail::button>

Questions? Email us at {{ config('store.mail.support') }}.

Thanks,<br>
{{ $storeName }}
</x-mail::message>
