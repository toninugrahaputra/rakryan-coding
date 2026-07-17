import { Link } from '@inertiajs/react';
import { Instagram, Mail, Phone, Youtube } from 'lucide-react';
// We can use a custom SVG for Tiktok or import it if available. Let's try importing.

export function PublicFooter() {
    const year = new Date().getFullYear();

    const sections = [
        {
            title: 'Produk',
            items: [
                { label: 'Semua studi kasus', href: '/courses' },
                { label: 'Paket hemat', href: '/#paket' },
                { label: 'Web Development', href: '/courses?category=Web+Dev' },
                {
                    label: 'Android Development',
                    href: '/courses?category=Android+Dev',
                },
            ],
        },
        {
            title: 'Rakryan',
            items: [
                { label: 'Tentang kami', href: '/#tentang' },
                { label: 'Karier', href: '/#karier' },
                { label: 'Artikel', href: '/#artikel' },
            ],
        },
    ];

    return (
        <footer className="border-t border-border/50 bg-[#111116] py-14 text-[#b3b3ba]">
            <div className="mx-auto max-w-7xl space-y-12 px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand / Logo */}
                    <div className="space-y-6 sm:col-span-2 lg:col-span-2">
                        <Link
                            href="/"
                            className="flex items-center transition-opacity hover:opacity-85"
                        >
                            <img
                                src="/assets/images/logo-full.svg"
                                alt="Rakryan Coding"
                                className="h-14 w-auto sm:h-16"
                            />
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed font-medium text-white">
                            Platform belajar ngoding teks lengkap untuk semua
                            kalangan di seluruh Indonesia. Materi terstruktur,
                            dirancang biar kamu siap kerja atau bikin project
                            sendiri.
                        </p>

                        {/* Social Media Row */}
                        <div className="flex items-center gap-3">
                            <a
                                href="https://instagram.com/rakryancoding"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/15 hover:text-primary"
                                title="Instagram"
                            >
                                <Instagram className="h-4.5 w-4.5" />
                            </a>
                            <a
                                href="https://tiktok.com/@rakryancoding"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/15 hover:text-primary"
                                title="TikTok"
                            >
                                <svg
                                    className="h-4 w-4 fill-current"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.61-.7-.02 3.68-.01 7.36-.02 11.04-.1 2.44-1.14 4.87-3.14 6.26-2.28 1.6-5.5 1.83-7.98.54-2.82-1.45-4.42-4.73-3.86-7.89.47-2.73 2.64-5 5.37-5.52.88-.17 1.79-.1 2.68.17v4.12c-.7-.24-1.48-.3-2.19-.07-1.39.42-2.33 1.86-2.14 3.3.16 1.25 1.19 2.29 2.44 2.43 1.54.19 2.97-.86 3.19-2.39.06-1.18.03-9.52.03-10.7 0-3.34.02-6.68-.02-10.02z" />
                                </svg>
                            </a>
                            <a
                                href="https://youtube.com/rakryancoding"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/15 hover:text-primary"
                                title="YouTube"
                            >
                                <Youtube className="h-4.5 w-4.5" />
                            </a>
                        </div>
                    </div>

                    {/* Columns */}
                    {sections.map((sec, idx) => (
                        <div key={idx} className="space-y-4">
                            <h4 className="text-xl font-bold text-white">
                                {sec.title}
                            </h4>
                            <ul className="flex flex-col gap-2.5">
                                {sec.items.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                        {item.href.startsWith('/#') ? (
                                            <a
                                                href={item.href}
                                                className="text-base font-medium text-white transition-colors hover:text-primary"
                                            >
                                                {item.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="text-base font-medium text-white transition-colors hover:text-primary"
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Kontak */}
                    <div className="space-y-4">
                        <h4 className="text-xl font-bold text-white">
                            Kontak
                        </h4>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <a
                                    href="tel:+6281234567890"
                                    className="flex items-center gap-2 text-base font-medium text-white transition-colors hover:text-primary"
                                >
                                    <Phone className="h-4 w-4 shrink-0" />
                                    +62 812-3456-7890
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:hello@rakryancoding.id"
                                    className="flex items-center gap-2 text-base font-medium text-white transition-colors hover:text-primary"
                                >
                                    <Mail className="h-4 w-4 shrink-0" />
                                    hello@rakryancoding.id
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8 text-center text-xs font-medium text-slate-500">
                    <span>
                        &copy; {year} Rakryan Coding · Dibuat untuk calon
                        developer di seluruh Indonesia
                    </span>
                </div>
            </div>
        </footer>
    );
}
