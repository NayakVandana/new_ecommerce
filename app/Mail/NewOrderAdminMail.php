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

class NewOrderAdminMail extends Mailable
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

        return new Envelope(
            subject: 'New order — '.$number.' ('.$this->user->name.')',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.order-placed-admin',
            with: [
                'user' => $this->user,
                'orders' => $this->orders,
                'combinedTotal' => (float) $this->orders->sum('grand_total'),
                'currency' => $this->orders->first()?->currency ?? 'INR',
                'storeName' => config('store.name', 'Selorise'),
            ],
        );
    }
}
