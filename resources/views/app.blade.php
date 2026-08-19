<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php
            $seoTitle = $seo['title'] ?? config('app.name', 'Rakryan Coding');
            $seoDescription = $seo['description'] ?? 'Platform belajar ngoding teks lengkap untuk semua kalangan di seluruh Indonesia. Materi terstruktur, dirancang biar kamu siap kerja atau bikin project sendiri.';
            $seoImage = $seo['image'] ?? asset('assets/images/og-image.png');
            $seoType = $seo['type'] ?? 'website';
            $seoUrl = $seo['url'] ?? url()->current();
        @endphp

        <meta data-inertia="description" name="description" content="{{ $seoDescription }}">
        <link data-inertia="canonical" rel="canonical" href="{{ $seoUrl }}">

        {{-- Open Graph / Twitter Card — dibaca oleh crawler link-preview (WhatsApp, Telegram, dll) yang tidak menjalankan JS,
             jadi tag ini harus di-render server-side lewat $seo (ShareSeoMeta), bukan hanya lewat <Head> Inertia. --}}
        <meta property="og:type" data-inertia="og:type" content="{{ $seoType }}">
        <meta property="og:site_name" content="{{ config('app.name', 'Rakryan Coding') }}">
        <meta property="og:locale" content="id_ID">
        <meta property="og:title" data-inertia="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" data-inertia="og:description" content="{{ $seoDescription }}">
        <meta property="og:image" data-inertia="og:image" content="{{ $seoImage }}">
        <meta property="og:image:alt" data-inertia="og:image:alt" content="{{ $seoTitle }}">
        <meta property="og:url" data-inertia="og:url" content="{{ $seoUrl }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" data-inertia="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" data-inertia="twitter:description" content="{{ $seoDescription }}">
        <meta name="twitter:image" data-inertia="twitter:image" content="{{ $seoImage }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script nonce="{{ $cspNonce }}">
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
