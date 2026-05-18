<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestMailCommand extends Command
{
    protected $signature = 'mail:test {email? : Recipient address (defaults to MAIL_ADMIN_NOTIFY)}';

    protected $description = 'Send a test email using the configured mailer';

    public function handle(): int
    {
        $to = $this->argument('email') ?: config('store.mail.admin_notify');

        if (! is_string($to) || ! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error('Provide a valid email or set MAIL_ADMIN_NOTIFY in .env');

            return self::FAILURE;
        }

        try {
            Mail::raw(
                'This is a test email from '.config('store.name', 'Selorise').' at '.now()->toDateTimeString(),
                function ($message) use ($to) {
                    $message->to($to)->subject('Selorise mail test');
                },
            );

            $this->info("Test email sent to {$to}");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
