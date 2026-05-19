<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contactMessage) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We received your message — '.config('store.name', 'Selorise'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.contact-received',
            with: [
                'contactMessage' => $this->contactMessage,
                'storeName' => config('store.name', 'Selorise'),
                'supportEmail' => config('store.mail.support'),
            ],
        );
    }
}
