<x-mail::message>
# New customer registered

A new account was created on **{{ $storeName }}**.

**Name:** {{ $user->name }}

**Email:** {{ $user->email }}

@if($user->phone)
**Phone:** {{ $user->phone }}
@endif

**Registered:** {{ $user->created_at?->timezone(config('app.timezone'))->format('d M Y, h:i A') ?? '—' }}

Thanks,<br>
{{ $storeName }}
</x-mail::message>
