import { Link } from '@inertiajs/react';
import { Instagram, Youtube } from 'lucide-react';
// We can use a custom SVG for Tiktok or import it if available. Let's try importing.

export function PublicFooter() {
    const year = new Date().getFullYear();

    const sections = [
        {
            title: 'PRODUK',
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
            title: 'RAKRYAN',
            items: [
                { label: 'Tentang kami', href: '/#tentang' },
                { label: 'Karier', href: '/#karier' },
                { label: 'Artikel', href: '/#artikel' },
            ],
        },
        {
            title: 'BANTUAN',
            items: [
                { label: 'Kontak', href: '/#kontak' },
                { label: 'Syarat & ketentuan', href: '/#syarat' },
                { label: 'Kebijakan privasi', href: '/#privasi' },
            ],
        },
    ];

    return (
        <footer className="border-t border-border/50 bg-[#111116] py-14 text-[#b3b3ba]">
            <div className="mx-auto max-w-7xl space-y-12 px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand / Logo */}
                    <div className="space-y-5 lg:col-span-2">
                        <Link
                            href="/"
                            className="flex items-center gap-3 transition-opacity hover:opacity-85"
                        >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                                <img
                                    src="/assets/images/maskable.svg"
                                    alt="Logo"
                                    width={80}
                                    height={80}
                                    className="h-full w-full"
                                />
                            </div>
                            <div className="flex gap-1 text-xl font-extrabold">
                                <span className="text-white">Rakryan</span>
                                <span className="text-[#B99430]">Coding</span>
                            </div>
                        </Link>
                        <p className="max-w-xs text-xs leading-relaxed font-medium text-slate-400 sm:text-sm">
                            Platform belajar ngoding teks lengkap untuk semua
                            kalangan di seluruh Indonesia. Materi terstruktur,
                            dirancang biar kamu siap kerja atau bikin project
                            sendiri.
                        </p>

                        {/* Social Media Row */}
                        <div className="flex items-center gap-3 pt-2">
                            <a
                                href="https://instagram.com/rakryancoding"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/15 hover:text-white"
                                title="Instagram"
                            >
                                <Instagram className="h-4.5 w-4.5" />
                            </a>
                            <a
                                href="https://tiktok.com/@rakryancoding"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/15 hover:text-white"
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
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/15 hover:text-white"
                                title="YouTube"
                            >
                                <Youtube className="h-4.5 w-4.5" />
                            </a>
                        </div>
                    </div>

                    {/* Columns */}
                    {sections.map((sec, idx) => (
                        <div key={idx} className="space-y-4">
                            <h4 className="text-xs font-bold tracking-widest text-white uppercase">
                                {sec.title}
                            </h4>
                            <ul className="flex flex-col gap-2.5">
                                {sec.items.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                        {item.href.startsWith('/#') ? (
                                            <a
                                                href={item.href}
                                                className="text-xs font-medium text-slate-400 transition-colors hover:text-white sm:text-sm"
                                            >
                                                {item.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="text-xs font-medium text-slate-400 transition-colors hover:text-white sm:text-sm"
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
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
