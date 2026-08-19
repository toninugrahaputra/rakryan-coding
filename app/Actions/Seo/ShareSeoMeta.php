<?php

namespace App\Actions\Seo;

use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;

class ShareSeoMeta
{
    private const DEFAULT_DESCRIPTION = 'Platform belajar ngoding teks lengkap untuk semua kalangan di seluruh Indonesia. Materi terstruktur, dirancang biar kamu siap kerja atau bikin project sendiri.';

    /**
     * Share per-page SEO meta with the root Blade view.
     *
     * This is rendered server-side (not just through Inertia's client-side
     * <Head> component) so that crawlers and link-preview bots that don't
     * execute JavaScript — Googlebot's first pass, WhatsApp, Telegram,
     * Facebook — still see the correct title/description/OG image.
     */
    public function handle(string $title, ?string $description, ?string $image = null, string $type = 'website'): void
    {
        View::share('seo', [
            'title' => $title,
            'description' => Str::limit(trim(strip_tags($description ?? '')), 160) ?: self::DEFAULT_DESCRIPTION,
            'image' => $image ?: asset('assets/images/og-image.png'),
            'type' => $type,
            'url' => url()->current(),
        ]);
    }
}
