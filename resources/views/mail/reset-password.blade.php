<x-mail::message>
# Reset your password

Hi {{ $user->name }},

We received a request to reset the password for your **{{ $storeName }}** account ({{ $user->email }}).

<x-mail::button :url="$url">
Reset password
</x-mail::button>

This link expires in {{ $expireMinutes }} minutes. If you did not request a reset, you can ignore this email — your password will stay the same.

For help, contact {{ config('store.mail.support') }}.

Thanks,<br>
{{ $storeName }}
</x-mail::message>
