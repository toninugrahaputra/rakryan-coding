import { Head, usePage } from '@inertiajs/react';

interface SeoProps {
    title: string;
    description: string;
    image?: string | null;
    type?: 'website' | 'article';
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_OG_IMAGE = '/assets/images/og-image.png';

/**
 * Mirrors the server-rendered meta tags from ShareSeoMeta/app.blade.php using
 * matching head-key values, so Open Graph/description/canonical stay correct
 * during client-side Inertia navigation (the blade tags only cover the first
 * full page load — SPA visits never re-render blade).
 */
export function Seo({ title, description, image, type = 'website', jsonLd }: SeoProps) {
    const { url } = usePage();
    // url()->current() on the server never includes the query string, so we
    // strip it here too — otherwise SPA navigation would override the
    // server-rendered canonical with one that still carries ?utm_source=...
    const path = url.split('?')[0];
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const canonicalUrl = `${origin}${path}`;
    const ogImage = image
        ? image.startsWith('http')
            ? image
            : `${origin}${image}`
        : `${origin}${DEFAULT_OG_IMAGE}`;

    return (
        <Head title={title}>
            <meta head-key="description" name="description" content={description} />
            <link head-key="canonical" rel="canonical" href={canonicalUrl} />

            <meta head-key="og:type" property="og:type" content={type} />
            <meta head-key="og:title" property="og:title" content={title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={description}
            />
            <meta head-key="og:image" property="og:image" content={ogImage} />
            <meta head-key="og:image:alt" property="og:image:alt" content={title} />
            <meta head-key="og:url" property="og:url" content={canonicalUrl} />

            <meta head-key="twitter:title" name="twitter:title" content={title} />
            <meta
                head-key="twitter:description"
                name="twitter:description"
                content={description}
            />
            <meta head-key="twitter:image" name="twitter:image" content={ogImage} />

            {jsonLd && (
                <script
                    head-key="structured-data"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
                    }}
                />
            )}
        </Head>
    );
}
