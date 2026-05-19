<x-mail::message>
# Thanks for reaching out, {{ $contactMessage->name }}!

We received your message and our team will get back to you as soon as possible.

@if ($contactMessage->subject)
**Subject:** {{ $contactMessage->subject }}
@endif

**Your message:**

{{ $contactMessage->message }}

@if ($supportEmail)
If you need urgent help, email us at {{ $supportEmail }}.
@endif

Thanks,<br>
{{ $storeName }}
</x-mail::message>
