import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Copy,
    Image as ImageIcon,
    Newspaper,
    Ticket,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { ArticleCard } from '@/components/article-card';
import { CourseCard } from '@/components/course-card';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import { ScrollReveal } from '@/components/scroll-reveal';
import { WhatsappFloatButton } from '@/components/whatsapp-float-button';
import { useClipboard } from '@/hooks/use-clipboard';

interface Course {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: string | null;
    contents_count: number;
    created_at: string;
    price?: number;
    price_strikethrough?: number;
    rating?: number;
    reviews_count?: number;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    created_at: string;
}

interface ProjectGalleryItem {
    id: number;
    url: string;
    course_title: string | null;
    course_slug: string | null;
}

interface Voucher {
    code: string;
    name: string | null;
    type: 'percentage' | 'flat';
    value: number;
    max_discount: number | null;
    min_purchase: number | null;
    ends_at: string | null;
}

interface WelcomeProps {
    featuredCourses: Course[];
    articles: Article[];
    projectGallery: ProjectGalleryItem[];
    stats: {
        total_courses: number;
        total_students: number;
        total_categories: number;
    };
    auth: {
        user: { id: number; name: string; email: string } | null;
    };
    vouchers?: Voucher[];
}

function formatPrice(price: number): string {
    if (price === 0) {
        return 'Gratis';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

function formatVoucherDiscount(voucher: Voucher): string {
    if (voucher.type === 'percentage') {
        const maks = voucher.max_discount
            ? ` (maks ${formatPrice(voucher.max_discount)})`
            : '';

        return `Diskon ${voucher.value}%${maks}`;
    }

    return `Potongan ${formatPrice(voucher.value)}`;
}

export default function Welcome({
    featuredCourses = [],
    articles = [],
    projectGallery = [],
    auth,
    vouchers = [],
}: WelcomeProps) {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [copiedCode, copyVoucherCode] = useClipboard();
    const projectGalleryRef = useRef<HTMLDivElement>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const scrollProjectGallery = (direction: 'left' | 'right') => {
        const el = projectGalleryRef.current;

        if (!el) {
            return;
        }

        const cardWidth =
            el.firstElementChild instanceof HTMLElement
                ? el.firstElementChild.offsetWidth + 16
                : 320;
        el.scrollBy({
            left: direction === 'left' ? -cardWidth : cardWidth,
            behavior: 'smooth',
        });
    };

    const faqs = [
        {
            q: 'Apakah materinya berupa video?',
            a: 'Bukan. Semua materi berupa tulisan/artikel panjang yang dibaca langsung di web — lengkap dengan gambar, source code yang bisa di-copy, dan checkpoint praktik. Format ini kita pilih supaya kamu gampang skim ulang, search snippet code, dan gak harus nungguin loading video pas lagi praktik.',
        },
        {
            q: 'Bekal apa yang dibutuhkan sebelum mulai?',
            a: 'Cukup laptop atau komputer dengan koneksi internet. Software yang dibutuhkan gratis seperti Visual Studio Code dan web browser. Kami ajarkan instalasi semuanya dari dasar.',
        },
        {
            q: 'Berapa lama akses materinya?',
            a: 'Akses materi selamanya (lifetime access) termasuk update berkala tanpa biaya tambahan.',
        },
        {
            q: 'Bisa bayar pakai apa saja?',
            a: 'Pembayaran praktis menggunakan Xendit Gateway, mendukung Virtual Account (BCA, Mandiri, BNI, BRI), QRIS (GoPay, OVO, Dana, ShopeePay), serta e-Wallet.',
        },
        {
            q: 'Cocok buat pemula yang belum punya basic sama sekali?',
            a: 'Sangat cocok! Materi kami disusun bertahap dari dasar sampai studi kasus industri nyata, jadi kamu nggak perlu punya pengalaman coding sebelumnya untuk mulai.',
        },
    ];

    return (
        <>
            <Head title="Platform Belajar Coding">
                <meta
                    name="description"
                    content="Platform belajar coding teks lengkap untuk semua kalangan di seluruh Indonesia. Materi terstruktur, dirancang biar kamu siap kerja atau bikin project sendiri."
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
                {/* Navbar */}
                <PublicNavbar />

                <main className="flex-1">
                    {/* ─── HERO SECTION ──────────────────────────────────── */}
                    <section className="relative overflow-hidden border-b border-border/40 py-16 lg:py-24">
                        {/* Background decoration */}
                        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                            <div className="absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
                        </div>

                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
                                {/* Left text content (6 cols) */}
                                <ScrollReveal
                                    animation="fade-up"
                                    className="space-y-8 lg:col-span-6"
                                >
                                    <h1 className="text-left text-4xl leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                        Belajar ngoding <br />
                                        dari nol sampai <br />
                                        <span className="relative inline-block text-primary">
                                            bikin project
                                            <span className="absolute right-0 bottom-2 left-0 -z-10 h-3 rounded-sm bg-[#eab308]/30" />
                                        </span>{' '}
                                        <br />
                                        sendiri.
                                    </h1>

                                    <p className="max-w-2xl text-left text-base leading-relaxed text-muted-foreground sm:text-lg">
                                        Bukan sekadar teori. Kamu bisa langsung
                                        praktik bikin project Web, Mobile, dan
                                        Game, lewat studi kasus nyata. Materi
                                        berbasis tutorial modul teks lengkap,
                                        bisa akses seumur hidup.
                                    </p>

                                    {/* Action Button */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {auth.user ? (
                                            <Link
                                                href="/dashboard"
                                                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 active:shadow-md"
                                            >
                                                Lanjutkan Belajar Anda
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/courses"
                                                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 active:shadow-md"
                                            >
                                                Lihat Semua Course
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        )}
                                    </div>
                                </ScrollReveal>

                                {/* Right Column: Hero illustration (6 cols, diperbesar) */}
                                <ScrollReveal
                                    animation="slide-right"
                                    delay={150}
                                    className="relative flex items-center justify-center lg:col-span-6"
                                >
                                    <img
                                        src="/assets/images/hero-side-image.webp"
                                        alt="Contoh hasil project — mockup device"
                                        className="w-full max-w-2xl object-contain drop-shadow-2xl"
                                    />
                                </ScrollReveal>
                            </div>
                        </div>
                    </section>

                    {/* ─── VOUCHER SECTION (full-width, di bawah Hero) ──── */}
                    {vouchers.length > 0 && (
                        <section
                            id="paket"
                            className="border-y border-border/40 bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#1e1b4b] py-14"
                        >
                            <div className="mx-auto max-w-5xl px-4 lg:px-1">
                                <ScrollReveal animation="scale-in">
                                    <div className="relative overflow-hidden rounded-3xl border border-[#eab308]/30 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md md:p-10">
                                        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[#eab308]/10 blur-2xl" />
                                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:text-left">
                                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eab308]/20 text-[#eab308] shadow-inner">
                                                    <Ticket className="h-7 w-7" />
                                                </div>
                                                <div className="space-y-1.5 text-center sm:text-left">
                                                    <p className="text-lg font-black tracking-tight text-white uppercase sm:text-xl md:text-2xl">
                                                        Voucher aktif ini
                                                        spesial buat kamu
                                                    </p>
                                                    <p className="text-xs font-extrabold tracking-wide text-[#eab308] sm:text-sm md:text-base">
                                                        {formatVoucherDiscount(
                                                            vouchers[0],
                                                        )}
                                                        {vouchers[0].name
                                                            ? ` — ${vouchers[0].name}`
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    copyVoucherCode(
                                                        vouchers[0].code,
                                                    )
                                                }
                                                className="group relative flex shrink-0 items-center gap-2.5 rounded-2xl bg-[#eab308] px-6 py-3.5 font-mono text-sm font-black text-slate-950 uppercase shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#facc15] hover:shadow-lg hover:shadow-[#eab308]/20 active:translate-y-0 active:scale-98"
                                            >
                                                {copiedCode === vouchers[0].code
                                                    ? 'Tersalin!'
                                                    : vouchers[0].code}
                                                <Copy className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                                            </button>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </section>
                    )}

                    {/* ─── GALERI PROJEK COURSE (6 course terbaru) ──────── */}
                    <section
                        id="materi"
                        className="border-b border-border/40 py-20"
                    >
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <ScrollReveal
                                animation="fade-up"
                                className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
                            >
                                <div>
                                    <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
                                        COURSE PILIHAN
                                    </span>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                        Course yang langsung menghasilkan karya
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        Tiap course dirancang dari studi kasus
                                        nyata, dikerjain end-to-end sampai
                                        project benar-benar jadi — siap kamu
                                        pamerin buat portofolio kerja atau
                                        lamaran magang.
                                    </p>
                                </div>

                                <Link
                                    href="/courses"
                                    className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-primary/80"
                                >
                                    Lihat lainnya
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </ScrollReveal>

                            {featuredCourses.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    Belum ada studi kasus saat ini.
                                </p>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {featuredCourses.map((course, idx) => (
                                        <ScrollReveal
                                            key={course.id}
                                            animation="scale-in"
                                            delay={
                                                (((idx % 3) + 1) * 100) as
                                                    | 100
                                                    | 200
                                                    | 300
                                            }
                                            className="h-full"
                                        >
                                            <CourseCard
                                                course={course as any}
                                                isLoggedIn={Boolean(auth.user)}
                                                showRating={false}
                                            />
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── ARTIKEL (menggantikan Kategori) ──────── */}
                    <section
                        id="artikel"
                        className="border-b border-border/40 bg-muted/10 py-20"
                    >
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <ScrollReveal
                                animation="fade-up"
                                className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
                            >
                                <div>
                                    <span className="mb-2.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
                                        <Newspaper className="h-3 w-3" />
                                        ARTIKEL
                                    </span>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                        Belajar dari artikel juga bisa
                                    </h2>
                                    <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                                        Tips, tutorial singkat, sampai cara
                                        menangani error yang sering ditemui pas
                                        ngoding.
                                    </p>
                                </div>

                                <Link
                                    href="/articles"
                                    className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary transition-colors hover:text-primary/80"
                                >
                                    Lihat lainnya
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </ScrollReveal>

                            {articles.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    Belum ada artikel saat ini.
                                </p>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {articles.map((article, idx) => (
                                        <ScrollReveal
                                            key={article.id}
                                            animation="fade-up"
                                            delay={
                                                (((idx % 3) + 1) * 100) as
                                                    | 100
                                                    | 200
                                                    | 300
                                            }
                                            className="h-full"
                                        >
                                            <ArticleCard article={article} />
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── GALERI HASIL PROJECT (menggantikan Rating/Testimoni) ─── */}
                    <section className="border-b border-border/40 bg-muted/20 py-20">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <ScrollReveal
                                animation="fade-up"
                                className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
                            >
                                <div>
                                    <span className="mb-2.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
                                        <ImageIcon className="h-3 w-3" />
                                        HASIL PROJECT
                                    </span>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                        Galeri hasil project
                                    </h2>
                                    <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                                        Contoh nyata project yang udah jadi dari
                                        studi kasus di Rakryan Coding.
                                    </p>
                                </div>

                                {/* Slider nav buttons */}
                                {projectGallery.length > 0 && (
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() =>
                                                scrollProjectGallery('left')
                                            }
                                            aria-label="Sebelumnya"
                                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border/60 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                scrollProjectGallery('right')
                                            }
                                            aria-label="Berikutnya"
                                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border/60 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </ScrollReveal>

                            {projectGallery.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    Belum ada galeri hasil project saat ini.
                                </p>
                            ) : (
                                <div
                                    ref={projectGalleryRef}
                                    className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    {projectGallery.map((item, idx) => (
                                        <ScrollReveal
                                            key={item.id}
                                            animation="scale-in"
                                            delay={
                                                (((idx % 3) + 1) * 100) as
                                                    | 100
                                                    | 200
                                                    | 300
                                            }
                                            className="w-[280px] shrink-0 snap-start sm:w-[360px]"
                                        >
                                            <Link
                                                href={
                                                    item.course_slug
                                                        ? `/courses/${item.course_slug}`
                                                        : '/courses'
                                                }
                                                className="group relative block aspect-video w-full overflow-hidden rounded-2xl border-2 border-border/80 bg-muted"
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={
                                                        item.course_title ??
                                                        'Hasil project'
                                                    }
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/0 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    {item.course_title && (
                                                        <span className="line-clamp-1 text-xs font-bold text-white">
                                                            {item.course_title}
                                                        </span>
                                                    )}
                                                    <span className="mt-0.5 text-[10px] font-medium text-white/70">
                                                        Lihat course →
                                                    </span>
                                                </div>
                                            </Link>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── FAQ ACCORDION ────────────────────────── */}
                    <section
                        id="faq"
                        className="border-b border-border/40 py-20"
                    >
                        <div className="mx-auto max-w-4xl px-6 lg:px-8">
                            <ScrollReveal
                                animation="fade-up"
                                className="mb-14 text-center"
                            >
                                <span className="mb-2.5 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
                                    FAQ
                                </span>
                                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                    Pertanyaan yang sering ditanya
                                </h2>
                            </ScrollReveal>

                            <div className="space-y-3">
                                {faqs.map(({ q, a }, idx) => (
                                    <ScrollReveal
                                        key={idx}
                                        animation="fade-up"
                                        delay={
                                            (((idx % 3) + 1) * 100) as
                                                | 100
                                                | 200
                                                | 300
                                        }
                                    >
                                        <div
                                            className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${activeFaq === idx ? 'border-primary/40 bg-card shadow-sm' : 'border-border/50 bg-card'}`}
                                        >
                                            <button
                                                onClick={() => toggleFaq(idx)}
                                                className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold transition-colors hover:bg-muted/10 sm:text-base"
                                            >
                                                <span>{q}</span>
                                                <ChevronDown
                                                    className={`h-5 w-5 shrink-0 transition-all duration-300 ${activeFaq === idx ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}
                                                />
                                            </button>
                                            {/* Smooth expand/collapse tanpa JS height calc — teknik CSS grid-template-rows 0fr→1fr */}
                                            <div
                                                className={`grid transition-all duration-300 ease-out ${activeFaq === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="border-t border-border/20 bg-muted/5 p-5 pt-0 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                                        {a}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <PublicFooter />

                <WhatsappFloatButton />
            </div>
        </>
    );
}
