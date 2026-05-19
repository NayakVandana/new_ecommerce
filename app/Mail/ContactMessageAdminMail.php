<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactMessageAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contactMessage) {}

    public function envelope(): Envelope
    {
        $subject = $this->contactMessage->subject
            ? 'Contact: '.$this->contactMessage->subject
            : 'New contact message from '.$this->contactMessage->name;

        return new Envelope(
            subject: $subject,
            replyTo: [$this->contactMessage->email],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.contact-admin',
            with: [
                'contactMessage' => $this->contactMessage,
                'storeName' => config('store.name', 'Selorise'),
                'adminUrl' => url('/admin/contact-messages'),
            ],
        );
    }
}
