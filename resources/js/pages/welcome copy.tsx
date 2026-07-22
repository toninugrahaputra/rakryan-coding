import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Copy, Star, Ticket } from 'lucide-react';
import { useRef, useState } from 'react';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';

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
    categories: Array<{ id: number; name: string; courses_count: number }>;
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

    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatVoucherDiscount(voucher: Voucher): string {
    if (voucher.type === 'percentage') {
        const maks = voucher.max_discount ? ` (maks ${formatPrice(voucher.max_discount)})` : '';

        return `Diskon ${voucher.value}%${maks}`;
    }

    return `Potongan ${formatPrice(voucher.value)}`;
}

export default function Welcome({ featuredCourses = [], categories = [], auth, vouchers = [] }: WelcomeProps) {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handleCopyVoucher = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const scrollGallery = (direction: 'left' | 'right') => {
        const el = galleryRef.current;

        if (!el) {
return;
}

        const cardWidth = el.firstElementChild instanceof HTMLElement ? el.firstElementChild.offsetWidth + 24 : 320;
        el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    };

    const bestCourse = featuredCourses[0] ?? null;

    const categoryIcons: Record<string, string> = {
        'Web Dev': '💻',
        'Mobile Dev': '📱',
        'Backend & API': '⚙️',
        'Fundamental': '🧠',
        'UI/UX': '🎨',
    };

    const testimonials = [
        {
            stars: 5,
            quote: 'Materinya teks jadi gampang di-copy code-nya pas lagi praktik. Pas ada error, tinggal Ctrl+F cari kata kunci di materi — langsung ketemu jawabannya.',
            name: 'Naufal P.',
            details: 'Kelas XII RPL • SMKN 5 Malang',
            initial: 'N',
            bgColor: 'bg-amber-600',
        },
        {
            stars: 5,
            quote: 'Pas PKL di perusahaan, aku dikasih tugas bikin landing page. Karena udah belajar Tailwind di sini, langsung kelar dalam 2 hari. Mentor PKL ngira aku udah lulus kuliah.',
            name: 'Rizki F.',
            details: 'PKL di startup fintech • angkatan 2025',
            initial: 'R',
            bgColor: 'bg-indigo-600',
            highlighted: true,
        },
        {
            stars: 5,
            quote: 'Studi kasus Toko Online dengan Laravel-nya keren, langsung jadi project portfolio aku. Pas wawancara magang, recruiter langsung impressed.',
            name: 'Bagas H.',
            details: 'Kelas XI RPL • SMK Telkom',
            initial: 'B',
            bgColor: 'bg-blue-600',
        },
    ];

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
            q: 'Cocok buat persiapan PKL atau LKS?',
            a: 'Sangat cocok! Materi kami berfokus pada studi kasus industri nyata. Banyak alumni yang berhasil menyelesaikan tugas PKL dengan cepat dan memenangkan lomba LKS berkat materi ini.',
        },
    ];

    return (
        <>
            <Head title="Rakryan Coding — Platform Belajar Coding">
                <meta
                    name="description"
                    content="Platform belajar coding teks lengkap khusus siswa SMK RPL Indonesia. Materi terstruktur, dirancang biar kamu siap PKL dan kerja."
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
                {/* Navbar */}
                <PublicNavbar />

                <main className="flex-1">
                    {/* ─── HERO SECTION ──────────────────────────────────── */}
                    <section className="relative overflow-hidden py-16 lg:py-24 border-b border-border/40">
                        {/* Background decoration */}
                        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                            <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                            <div className="absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
                        </div>

                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
                                {/* Left text content (7 cols) */}
                                <div className="lg:col-span-7 space-y-8">
                                    <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl text-left">
                                        Belajar ngoding <br />
                                        dari nol sampai <br />
                                        <span className="relative inline-block text-primary">
                                            bikin project
                                            <span className="absolute bottom-2 left-0 right-0 h-3 bg-[#eab308]/30 -z-10 rounded-sm" />
                                        </span> <br />
                                        sendiri.
                                    </h1>

                                    <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl text-left">
                                        Materi <strong>teks lengkap</strong> berisi studi kasus nyata — Web Dev, Mobile Dev, dan lainnya. Cocok buat anak SMK RPL yang mau jago beneran, bukan cuma teori. Akses sampai kamu lulus.
                                    </p>

                                    {/* Action Button */}
                                    <div className="flex flex-wrap gap-4 items-center">
                                        {auth.user ? (
                                            <Link
                                                href="/dashboard"
                                                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95"
                                            >
                                                Lanjutkan Belajar Anda
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/courses"
                                                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95"
                                            >
                                                Lihat Semua Course
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Counters Row */}
                                    <div className="pt-6 border-t border-border/50 grid grid-cols-3 gap-4 max-w-lg">
                                        <div>
                                            <span className="block text-2xl font-extrabold text-foreground">68</span>
                                            <span className="text-xs text-muted-foreground mt-0.5 block font-medium">Studi kasus</span>
                                        </div>
                                        <div>
                                            <span className="block text-2xl font-extrabold text-foreground">4.9/5</span>
                                            <span className="text-xs text-muted-foreground mt-0.5 block font-medium">Rating siswa</span>
                                        </div>
                                        <div>
                                            <span className="block text-2xl font-extrabold text-foreground">∞</span>
                                            <span className="text-xs text-muted-foreground mt-0.5 block font-medium">Akses sampai lulus</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Thumbnail Course Terbaik (5 cols) */}
                                <div className="lg:col-span-5 relative flex justify-center">
                                    {bestCourse ? (
                                        <Link
                                            href={`/courses/${bestCourse.slug}`}
                                            className="group relative w-full max-w-sm h-[400px] block rounded-3xl border border-border/40 shadow-lg overflow-hidden"
                                        >
                                            {bestCourse.thumbnail ? (
                                                <img
                                                    src={bestCourse.thumbnail}
                                                    alt={bestCourse.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-violet-500/10">
                                                    <BookOpen className="h-14 w-14 text-primary/30" />
                                                </div>
                                            )}

                                            {/* Gradient overlay for text legibility */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                            {/* Category badge */}
                                            {bestCourse.category && (
                                                <span className="absolute left-4 top-4 rounded-full bg-background/95 backdrop-blur-xs px-3 py-1 text-[10px] font-bold text-primary uppercase shadow-xs">
                                                    {bestCourse.category}
                                                </span>
                                            )}

                                            {/* Title + rating overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                                                <h3 className="text-white font-bold text-base leading-snug line-clamp-2">
                                                    {bestCourse.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-200">
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                        {bestCourse.rating ?? 4.9}
                                                    </span>
                                                    <span>{bestCourse.contents_count} bab</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="relative w-full max-w-sm h-[400px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-3xl border border-border/40">
                                            <BookOpen className="h-14 w-14 text-primary/30" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── VOUCHER SECTION (full-width, di bawah Hero) ──── */}
                    {vouchers.length > 0 && (
                        <section id="paket" className="py-16 bg-[#1e1b4b] border-b border-border/40">
                            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                                <div className="mb-8 flex items-center gap-3">
                                    <Ticket className="h-6 w-6 text-[#eab308]" />
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                                            Voucher aktif buat kamu
                                        </h2>
                                        <p className="text-xs sm:text-sm text-slate-300">
                                            Pakai salah satu kode ini saat checkout, langsung hemat.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {vouchers.map((voucher) => (
                                        <div
                                            key={voucher.code}
                                            className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-5 flex flex-col gap-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-lg font-extrabold text-[#eab308] tracking-widest">
                                                    {voucher.code}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyVoucher(voucher.code)}
                                                    className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                    {copiedCode === voucher.code ? 'Tersalin!' : 'Salin'}
                                                </button>
                                            </div>

                                            <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                {formatVoucherDiscount(voucher)}
                                            </p>

                                            <div className="text-[11px] text-slate-400 space-y-0.5">
                                                {voucher.name && <p>{voucher.name}</p>}
                                                {voucher.min_purchase ? (
                                                    <p>Min. belanja {formatPrice(voucher.min_purchase)}</p>
                                                ) : null}
                                                {voucher.ends_at && <p>Berlaku sampai {voucher.ends_at}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ─── CATEGORIES (Jelajahi per stack) ──────── */}
                    <section className="py-20 bg-muted/10 border-b border-border/40">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mb-14 text-center">
                                <span className="mb-2.5 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                                    KATEGORI
                                </span>
                                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                    Jelajahi per stack & topik
                                </h2>
                                <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                                    Pilih jalur yang kamu suka — semua punya materi dari dasar sampai studi kasus nyata.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/courses?category=${cat.id}`}
                                        className="flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-card hover:bg-muted/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-lg">
                                                {categoryIcons[cat.name] || '💻'}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {cat.name === 'Web Dev' ? 'Web Development' : cat.name === 'Mobile Dev' ? 'Mobile Development' : cat.name}
                                                </h3>
                                                <span className="text-xs text-muted-foreground mt-0.5 block">{cat.courses_count} materi</span>
                                            </div>
                                        </div>
                                        <ChevronDown className="h-5 w-5 text-muted-foreground/60 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── GALERI PROJEK COURSE (Carousel) ──────── */}
                    <section id="materi" className="py-20 border-b border-border/40">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                                <div>
                                    <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                                        STUDI KASUS
                                    </span>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                        Galeri proyek, langsung jadi portfolio
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                                        Inti dari Rakryan Coding. Tiap studi kasus dibikin end-to-end sampai project benar-benar jadi — siap kamu pamerin pas PKL atau lomba LKS.
                                    </p>
                                </div>

                                {/* Carousel nav buttons */}
                                {featuredCourses.length > 0 && (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => scrollGallery('left')}
                                            aria-label="Sebelumnya"
                                            className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => scrollGallery('right')}
                                            aria-label="Berikutnya"
                                            className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {featuredCourses.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-10">Belum ada studi kasus saat ini.</p>
                            ) : (
                                <div
                                    ref={galleryRef}
                                    className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    {featuredCourses.map((course) => (
                                        <Link
                                            key={course.id}
                                            href={`/courses/${course.slug}`}
                                            className="group shrink-0 snap-start w-[280px] sm:w-[320px] flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative h-44 w-full overflow-hidden bg-muted">
                                                {course.thumbnail ? (
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
                                                        <BookOpen className="h-10 w-10 text-primary/30" />
                                                    </div>
                                                )}

                                                {course.category && (
                                                    <span className="absolute left-3 top-3 rounded-full bg-background/95 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase shadow-xs">
                                                        {course.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-1 flex-col gap-4 p-4.5 justify-between">
                                                <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                                                    {course.title}
                                                </h3>

                                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
                                                    <span>{course.contents_count} bab</span>
                                                    <span className="flex items-center gap-0.5">
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                        {course.rating ?? 4.9}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── TESTIMONIALS (Kata Siswa) ───────────── */}
                    <section className="py-20 bg-muted/20 border-b border-border/40">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mb-14 text-center">
                                <span className="mb-2.5 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                                    KATA SISWA
                                </span>
                                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                    Rata-rata rating 4.9 dari siswa SMK RPL.
                                </h2>
                                <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                                    Mereka udah duluan praktik, sekarang giliran kamu.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {testimonials.map(({ stars, quote, name, details, initial, bgColor, highlighted }, i) => (
                                    <div
                                        key={i}
                                        className={`p-6.5 rounded-2xl border flex flex-col justify-between gap-6 shadow-xs relative ${
                                            highlighted
                                                ? 'bg-[#1e1b4b] text-white border-primary/40 shadow-md transform md:-translate-y-1'
                                                : 'bg-card text-foreground border-border/50'
                                        }`}
                                    >
                                        <div className="space-y-4">
                                            {/* Stars */}
                                            <div className="flex gap-0.5 text-amber-500">
                                                {Array.from({ length: stars }).map((_, idx) => (
                                                    <Star key={idx} className="h-4.5 w-4.5 fill-current" />
                                                ))}
                                            </div>
                                            <p className={`text-xs sm:text-sm leading-relaxed ${highlighted ? 'text-slate-200' : 'text-muted-foreground'}`}>
                                                "{quote}"
                                            </p>
                                        </div>

                                        {/* Profile */}
                                        <div className="flex items-center gap-3 border-t border-border/30 pt-4 mt-auto">
                                            <div className={`h-9 w-9 rounded-full ${bgColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                                                {initial}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold leading-tight">{name}</h4>
                                                <span className={`text-[10px] block mt-0.5 ${highlighted ? 'text-slate-400' : 'text-muted-foreground'}`}>
                                                    {details}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── FAQ ACCORDION ────────────────────────── */}
                    <section id="faq" className="py-20 border-b border-border/40">
                        <div className="mx-auto max-w-4xl px-6 lg:px-8">
                            <div className="mb-14 text-center">
                                <span className="mb-2.5 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                                    FAQ
                                </span>
                                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                    Pertanyaan yang sering ditanya
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {faqs.map(({ q, a }, idx) => (
                                    <div key={idx} className="border border-border/50 bg-card rounded-2xl overflow-hidden transition-all duration-200">
                                        <button
                                            onClick={() => toggleFaq(idx)}
                                            className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base hover:bg-muted/10 transition-colors"
                                        >
                                            <span>{q}</span>
                                            <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                                        </button>
                                        {activeFaq === idx && (
                                            <div className="p-5 pt-0 border-t border-border/20 text-xs sm:text-sm leading-relaxed text-muted-foreground bg-muted/5">
                                                {a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <PublicFooter />
            </div>
        </>
    );
}
