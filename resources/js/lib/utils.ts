import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Token tipografi kustom dari `@theme` di app.css (`text-body`, `text-title`, dst)
 * tidak dikenali tailwind-merge. Tanpa didaftarkan di sini ia menyangka token itu
 * kelas warna, lalu membuangnya diam-diam saat digabung dengan `text-<warna>` —
 * sehingga ukuran font hilang tanpa error apa pun.
 *
 * Daftar ini harus ikut diperbarui setiap ada token `--text-*` baru di app.css.
 */
const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': [
                {
                    text: [
                        'display',
                        'title',
                        'subtitle',
                        'card-title',
                        'lead',
                        'body',
                        'body-sm',
                        'caption',
                        'badge',
                        'eyebrow',
                        'button',
                        'price',
                        'price-sm',
                        'price-strike',
                    ],
                },
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}
