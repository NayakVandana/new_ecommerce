<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to '.config('store.name', 'Selorise'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.welcome-user',
            with: [
                'user' => $this->user,
                'storeName' => config('store.name', 'Selorise'),
                'loginUrl' => url('/login'),
            ],
        );
    }
}
