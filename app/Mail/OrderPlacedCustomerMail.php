<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class OrderPlacedCustomerMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  Collection<int, Order>  $orders
     */
    public function __construct(
        public User $user,
        public Collection $orders,
    ) {}

    public function envelope(): Envelope
    {
        $primary = $this->orders->first();
        $number = $primary?->order_number ?? 'Order';

        $subject = $this->orders->count() > 1
            ? 'Your orders are confirmed — '.$number.' +'.($this->orders->count() - 1).' more'
            : 'Order confirmed — '.$number;

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.order-placed-customer',
            with: [
                'user' => $this->user,
                'orders' => $this->orders,
                'combinedTotal' => (float) $this->orders->sum('grand_total'),
                'currency' => $this->orders->first()?->currency ?? 'INR',
                'storeName' => config('store.name', 'Selorise'),
                'ordersUrl' => route('user.orders.index'),
            ],
        );
    }
}
