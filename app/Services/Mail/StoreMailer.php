<?php

namespace App\Services\Mail;

use App\Mail\NewOrderAdminMail;
use App\Mail\NewUserAdminMail;
use App\Mail\OrderPlacedCustomerMail;
use App\Mail\WelcomeUserMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class StoreMailer
{
    public function isEnabled(): bool
    {
        return (bool) config('store.mail.enabled', true);
    }

    public function adminNotifyAddress(): ?string
    {
        $email = config('store.mail.admin_notify');

        return is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    public function sendWelcome(User $user): void
    {
        if (! $this->isEnabled()) {
            return;
        }

        try {
            Mail::to($user->email)->send(new WelcomeUserMail($user));

            $admin = $this->adminNotifyAddress();

            if ($admin) {
                Mail::to($admin)->send(new NewUserAdminMail($user));
            }
        } catch (Throwable $e) {
            Log::warning('Welcome email failed.', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @param  Collection<int, Order>  $orders
     */
    public function sendOrderPlaced(User $user, Collection $orders): void
    {
        if (! $this->isEnabled() || $orders->isEmpty()) {
            return;
        }

        $orders->each(fn (Order $order) => $order->loadMissing(['items', 'coupon']));

        try {
            Mail::to($user->email)->send(new OrderPlacedCustomerMail($user, $orders));

            $admin = $this->adminNotifyAddress();

            if ($admin) {
                Mail::to($admin)->send(new NewOrderAdminMail($user, $orders));
            }
        } catch (Throwable $e) {
            Log::warning('Order email failed.', [
                'user_id' => $user->id,
                'order_ids' => $orders->pluck('id')->all(),
                'error' => $e->getMessage(),
            ]);
        }
    }
}
