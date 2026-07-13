import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Play, BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Images, Star, Lock, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@/components/ui/link';
import AppLayout from '@/layouts/app-layout';
import courses from '@/routes/courses';

// Auth untuk halaman publik — user bisa null jika belum login
type PublicAuth = {
    user: { id: number; name: string; email: string } | null;
};

interface Content {
    id: number;
    slug: string;
    title: string;
    order: number;
}

interface Course {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    category: string | null;
    contents: Content[];
    price: number | null;
    price_strikethrough: number | null;
    is_free: boolean;
    has_product: boolean;
    rating?: number;
    reviews_count?: number;
    completed_contents_count?: number;
    gallery?: Array<{ id: number; url: string }>;
    user_review?: {
        rating: number;
        tags: string[];
        comment: string | null;
    } | null;
}

interface CourseShowProps {
    course: Course;
    isPurchased: boolean;
    isLoggedIn: boolean;
}

function formatPrice(price: number): string {
    if (price === 0) {
        return 'Gratis';
    }

    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

/** Konten detail course yang dipakai baik oleh guest maupun user login */
function CourseDetailContent() {
    const { course, isPurchased = false, isLoggedIn = false } = usePage().props as unknown as CourseShowProps;
    const isCompleted = isPurchased && course.contents.length > 0 && (course.completed_contents_count === course.contents.length);

    const { data, setData, post, processing } = useForm({
        rating: course.user_review?.rating ?? 5,
        tags: course.user_review?.tags ?? [] as string[],
        comment: course.user_review?.comment ?? '',
    });

    const [ratingHover, setRatingHover] = useState<number | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const gallery = course.gallery ?? [];

    const quickTags = ['Materi Jelas', 'Sangat Detail', 'Mudah Dipahami', 'Desain Rapi', 'Rekomendasi!'];

    function toggleTag(tag: string) {
        if (data.tags.includes(tag)) {
            setData('tags', data.tags.filter(t => t !== tag));
        } else {
            setData('tags', [...data.tags, tag]);
        }
    }

    function submitReview(e: React.FormEvent) {
        e.preventDefault();
        post(`/courses/${course.slug}/reviews`, {
            preserveScroll: true,
        });
    }

    function showPrevImage() {
        setLightboxIndex((idx) => (idx === null ? null : (idx - 1 + gallery.length) % gallery.length));
    }

    function showNextImage() {
        setLightboxIndex((idx) => (idx === null ? null : (idx + 1) % gallery.length));
    }

    const hasReviewed = !!course.user_review;
    useEffect(() => {
        if (isCompleted && !hasReviewed) {
            const reviewEl = document.getElementById('review-form-container');

            if (reviewEl) {
                setTimeout(() => {
                    reviewEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 800);
            }
        }
    }, [isCompleted, hasReviewed]);

    return (
        <>
            <Head title={`${course.title} — Rakryan Coding`} />

            <main className="flex-1 py-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Back navigation */}
                    <div className="mb-6">
                        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Katalog Course
                        </Link>
                    </div>

                    {/* Split layout: Content (Left) & Sticky Buy Card (Right) */}
                    <div className="grid gap-8 lg:grid-cols-3">

                        {/* Left Column: About & Curriculum */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header / Title */}
                            <div>
                                {course.category && (
                                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                                        {course.category}
                                    </span>
                                )}
                                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-foreground leading-tight">
                                    {course.title}
                                </h1>
                                <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <span className="font-semibold text-foreground">{course.rating ?? 4.9}</span>
                                        <span>({course.reviews_count ?? 0} Ulasan Pelajar)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{course.contents.length} Modul Belajar</span>
                                    </div>
                                </div>
                            </div>

                            {/* About / Description */}
                            <div className="border-t border-border/50 pt-8">
                                <h2 className="text-xl font-bold mb-4">Tentang Kelas</h2>
                                {course.description ? (
                                    <div className="text-muted-foreground leading-relaxed space-y-4 whitespace-pre-line">
                                        {course.description}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">Deskripsi kelas belum tersedia.</p>
                                )}
                            </div>

                            {/* Curriculum / Lesson list */}
                            <div className="border-t border-border/50 pt-8">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        Kurikulum Belajar
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Daftar modul terstruktur untuk menunjang proses belajarmu
                                    </p>
                                </div>

                                {course.contents.length > 0 ? (
                                    <div className="space-y-3">
                                        {course.contents.map((content) => (
                                            <div
                                                key={content.id}
                                                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/50 transition-colors hover:bg-card"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                                        {content.order}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-foreground sm:text-base">
                                                            {content.title}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            Modul {content.order} • Belajar Mandiri
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Access action */}
                                                <div>
                                                    {isPurchased ? (
                                                        <Link
                                                            href={courses.contents.show.url([course.slug, content.slug])}
                                                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                                                        >
                                                            Mulai Belajar
                                                        </Link>
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground" title="Materi Terkunci">
                                                            <Lock className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
                                        Kurikulum / modul belum ditambahkan untuk kelas ini.
                                    </div>
                                )}
                            </div>

                            {/* Galeri Hasil Project */}
                            {gallery.length > 0 && (
                                <div className="border-t border-border/50 pt-8">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Images className="h-5 w-5 text-primary" />
                                            Galeri Hasil Project
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Contoh tampilan jadi dari project yang akan kamu bangun di kelas ini
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {gallery.map((image, idx) => (
                                            <button
                                                key={image.id}
                                                type="button"
                                                onClick={() => setLightboxIndex(idx)}
                                                className="group relative aspect-video overflow-hidden rounded-xl border border-border/50"
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`Contoh hasil project ${course.title} ${idx + 1}`}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Review Section */}
                            {isCompleted && (
                                <div id="review-form-container" className="border-t border-border/50 pt-8 mt-8">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            Ulasan Kelasmu
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Kamu telah menyelesaikan kelas ini! Bantu pembelajar lain dengan memberikan ulasan terbaikmu.
                                        </p>
                                    </div>

                                    <form onSubmit={submitReview} className="bg-card border border-border/60 rounded-2xl p-5 sm:p-6 space-y-5">
                                        {/* Rating Star Selection */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Rating Kelas</label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setData('rating', star)}
                                                        onMouseEnter={() => setRatingHover(star)}
                                                        onMouseLeave={() => setRatingHover(null)}
                                                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`h-7 w-7 ${star <= (ratingHover ?? data.rating)
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-muted-foreground/35'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Tags Badge */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Tag Cepat</label>
                                            <div className="flex flex-wrap gap-2">
                                                {quickTags.map((tag) => {
                                                    const isSelected = data.tags.includes(tag);

                                                    return (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => toggleTag(tag)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isSelected
                                                                ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400'
                                                                : 'bg-muted/40 hover:bg-muted border-border/80 text-muted-foreground'
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Comment area */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                <label htmlFor="comment">Komentar Ulasan</label>
                                                <span>{data.comment.length}/500</span>
                                            </div>
                                            <textarea
                                                id="comment"
                                                rows={3}
                                                maxLength={500}
                                                placeholder="Tulis ulasan belajarmu di sini (opsional)..."
                                                value={data.comment}
                                                onChange={(e) => setData('comment', e.target.value)}
                                                className="w-full rounded-xl border border-border/80 bg-muted/20 p-3.5 text-sm font-medium focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-2">
                                            {course.user_review && (
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded px-2.5 py-1">
                                                    Sudah diulas sebelumnya
                                                </span>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-xl font-bold bg-[#B99430] hover:bg-[#725a15] text-white ml-auto"
                                            >
                                                {processing ? 'Menyimpan...' : course.user_review ? 'Perbarui Ulasan' : 'Kirim Ulasan'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sticky Pricing & CTA Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5 shadow-lg">
                                {/* Thumbnail */}
                                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-muted mb-5">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
                                            <BookOpen className="h-8 w-8 text-primary/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Pricing details */}
                                {course.has_product ? (
                                    <div className="mb-5">
                                        <p className="text-xs text-muted-foreground mb-1">Investasi Belajar</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-extrabold text-foreground">
                                                {formatPrice(course.price ?? 0)}
                                            </span>
                                            {course.price_strikethrough && course.price_strikethrough > (course.price ?? 0) && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    {formatPrice(course.price_strikethrough)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-5 p-3 rounded-lg bg-muted/65 text-center text-sm text-muted-foreground">
                                        Kelas ini segera hadir / belum dapat dibeli.
                                    </div>
                                )}

                                {/* Benefits checklist */}
                                <ul className="mb-6 space-y-2.5 text-sm text-muted-foreground border-t border-border/40 pt-4">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                        Akses materi seumur hidup
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                        Sertifikat kelulusan kelas
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                        Konsultasi dengan Instruktur
                                    </li>
                                </ul>

                                {/* Contextual CTA Button */}
                                {isPurchased ? (
                                    <Link
                                        href={course.contents.length > 0 ? courses.contents.show.url([course.slug, course.contents[0].slug]) : '#'}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-semibold text-white transition-all hover:bg-emerald-500 shadow-md shadow-emerald-500/10"
                                    >
                                        <Play className="h-4 w-4" />
                                        Lanjutkan Belajar
                                    </Link>
                                ) : !isLoggedIn ? (
                                    // Guest: tampilan tombol "Beli Sekarang", tapi flow tetap arahkan ke halaman Login (tidak diubah)
                                    <Link
                                        href="/login"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Beli Sekarang
                                    </Link>
                                ) : course.has_product ? (
                                    // User login: flow langsung ke checkout, tidak diubah
                                    <Button
                                        className="w-full py-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                        asChild
                                    >
                                        <Link href={`/orders/create?course=${course.slug}`}>
                                            <ShoppingCart className="h-4 w-4" />
                                            {course.is_free ? 'Daftar Kelas Gratis' : 'Beli Sekarang'}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button className="w-full py-6 rounded-xl font-bold" disabled>
                                        Segera Hadir
                                    </Button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Lightbox galeri */}
            <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
                <DialogContent className="w-[95vw] max-w-6xl border-0 bg-transparent p-0 shadow-none sm:max-w-6xl">
                    <DialogTitle className="sr-only">Galeri hasil project {course.title}</DialogTitle>
                    {lightboxIndex !== null && gallery[lightboxIndex] && (
                        <div className="relative">
                            <img
                                src={gallery[lightboxIndex].url}
                                alt={`Contoh hasil project ${course.title} ${lightboxIndex + 1}`}
                                className="max-h-[88vh] w-full rounded-xl object-contain"
                            />
                            {gallery.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={showPrevImage}
                                        aria-label="Gambar sebelumnya"
                                        className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={showNextImage}
                                        aria-label="Gambar berikutnya"
                                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                                        {lightboxIndex + 1} / {gallery.length}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function CourseShow() {
    const { auth } = usePage<{ auth: PublicAuth }>().props;
    const isLoggedIn = Boolean(auth?.user);

    if (isLoggedIn) {
        // User login: render dalam AppLayout + breadcrumb (tanpa PublicNavbar/Footer publik)
        return <CourseDetailContent />;
    }

    // Guest: tampilkan navbar & footer publik
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <PublicNavbar />
            <CourseDetailContent />
            <PublicFooter />
        </div>
    );
}

CourseShow.layout = (page: React.ReactNode) => {
    // Akses props dari page element yang di-pass Inertia
    const props = (page as any).props as CourseShowProps & { auth: PublicAuth };
    const isLoggedIn = Boolean(props?.auth?.user);

    if (isLoggedIn) {
        return (
            <AppLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Katalog Courses', href: '/courses' },
                    { title: props.course?.title ?? 'Detail Course', href: '#' },
                ]}
            >
                {page}
            </AppLayout>
        );
    }

    // Guest: tidak ada AppLayout, render langsung
    return <>{page}</>;
};