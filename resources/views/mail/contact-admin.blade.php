<x-mail::message>
# New contact message

**From:** {{ $contactMessage->name }} ({{ $contactMessage->email }})
@if ($contactMessage->phone)
**Phone:** {{ $contactMessage->phone }}
@endif
@if ($contactMessage->subject)
**Subject:** {{ $contactMessage->subject }}
@endif

**Message:**

{{ $contactMessage->message }}

<x-mail::button :url="$adminUrl">
View in admin
</x-mail::button>

Reply directly to this email to reach the customer.

Thanks,<br>
{{ $storeName }}
</x-mail::message>
