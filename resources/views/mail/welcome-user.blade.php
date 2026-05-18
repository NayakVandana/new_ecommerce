<x-mail::message>
# Welcome, {{ $user->name }}!

Thanks for creating an account with **{{ $storeName }}**.

You can sign in anytime to browse our collection, save your wishlist, and track your orders.

<x-mail::button :url="$loginUrl">
Sign in
</x-mail::button>

If you did not create this account, please contact us at {{ config('store.mail.support') }}.

Thanks,<br>
{{ $storeName }}
</x-mail::message>
