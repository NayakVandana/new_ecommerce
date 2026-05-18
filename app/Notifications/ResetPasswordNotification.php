<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $expire = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

        return (new MailMessage)
            ->subject('Reset your password — '.config('store.name', 'Selorise'))
            ->markdown('mail.reset-password', [
                'url' => $this->resetUrl($notifiable),
                'user' => $notifiable,
                'storeName' => config('store.name', 'Selorise'),
                'expireMinutes' => $expire,
            ]);
    }
}
