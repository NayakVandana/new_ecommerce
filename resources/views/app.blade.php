<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $appearance = auth()->check()
                ? (auth()->user()->theme_preference ?? 'system')
                : null;
        @endphp
        <script>
            window.__INITIAL_APPEARANCE__ = @json($appearance);
            (function () {
                var pref = window.__INITIAL_APPEARANCE__;
                if (pref !== 'light' && pref !== 'dark' && pref !== 'system') {
                    try {
                        var s = localStorage.getItem('appearance');
                        pref =
                            s === 'light' || s === 'dark' || s === 'system'
                                ? s
                                : 'system';
                    } catch (e) {
                        pref = 'system';
                    }
                }
                function isDark(p) {
                    if (p === 'dark') return true;
                    if (p === 'light') return false;
                    return window.matchMedia('(prefers-color-scheme: dark)')
                        .matches;
                }
                document.documentElement.classList.toggle('dark', isDark(pref));
            })();
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="h-full font-sans antialiased">
        @inertia
    </body>
</html>
