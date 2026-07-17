import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Play,
    BookOpen,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Images,
    Star,
    Lock,
    ShoppingCart,
} from 'lucide-react';
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
    section_name?: string | null;
    sub_topics?: string[];
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
    technologies?: Array<{
        id: number;
        name: string;
        slug: string;
        logo_url: string | null;
    }>;
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

/** Grid tools/teknologi yang dipakai course — dipakai baik di posisi desktop maupun mobile. */
function TechnologyList({ technologies }: { technologies: NonNullable<Course['technologies']> }) {
    return (
        <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Tools yang digunakan
            </p>
            <div className="flex flex-wrap gap-4">
                {technologies.map((tech) => (
                    <div
                        key={tech.id}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 px-5 py-4"
                    >
                        {tech.logo_url && (
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background">
                                <img
                                    src={tech.logo_url}
                                    alt={tech.name}
                                    className="h-full w-full object-contain p-2"
                                />
                            </span>
                        )}
                        <span className="text-sm font-bold text-foreground">
                            {tech.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
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

/** Jumlah modul pertama yang boleh dibaca tanpa login pada course gratis (samakan dengan backend). */
const FREE_PREVIEW_LIMIT = 3;

/** Konten detail course yang dipakai baik oleh guest maupun user login */
function CourseDetailContent() {
    const {
        course,
        isPurchased = false,
        isLoggedIn = false,
    } = usePage().props as unknown as CourseShowProps;
    const isCompleted =
        isPurchased &&
        course.contents.length > 0 &&
        course.completed_contents_count === course.contents.length;

    // Indeks urutan modul (0-based) untuk menentukan modul mana yang termasuk preview gratis
    const contentIndexById = new Map(
        course.contents.map((content, index) => [content.id, index]),
    );

    // Group contents by section_name preserving chronological order
    const sections: Array<{ name: string | null; contents: Content[] }> = [];
    course.contents.forEach((content) => {
        const sectionName = content.section_name || null;
        let existingSection = sections.find((s) => s.name === sectionName);

        if (!existingSection) {
            existingSection = { name: sectionName, contents: [] };
            sections.push(existingSection);
        }

        existingSection.contents.push(content);
    });

    const { data, setData, post, processing } = useForm({
        rating: course.user_review?.rating ?? 5,
        tags: course.user_review?.tags ?? ([] as string[]),
        comment: course.user_review?.comment ?? '',
    });

    const [ratingHover, setRatingHover] = useState<number | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const gallery = course.gallery ?? [];

    const quickTags = [
        'Materi Jelas',
        'Sangat Detail',
        'Mudah Dipahami',
        'Desain Rapi',
        'Rekomendasi!',
    ];

    function toggleTag(tag: string) {
        if (data.tags.includes(tag)) {
            setData(
                'tags',
                data.tags.filter((t) => t !== tag),
            );
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
        setLightboxIndex((idx) =>
            idx === null ? null : (idx - 1 + gallery.length) % gallery.length,
        );
    }

    function showNextImage() {
        setLightboxIndex((idx) =>
            idx === null ? null : (idx + 1) % gallery.length,
        );
    }

    const hasReviewed = !!course.user_review;
    useEffect(() => {
        if (isCompleted && !hasReviewed) {
            const reviewEl = document.getElementById('review-form-container');

            if (reviewEl) {
                setTimeout(() => {
                    reviewEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }, 800);
            }
        }
    }, [isCompleted, hasReviewed]);

    return (
        <>
            <Head title={course.title} />

            <main className="flex-1 py-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Back navigation */}
                    <div className="mb-6">
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Katalog Course
                        </Link>
                    </div>

                    {/* Split layout: Content (Left) & Sticky Buy Card (Right). Order dipakai supaya card Investasi Belajar tampil di atas deskripsi saat mobile, tanpa mengubah susunan desktop. */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Header / Title */}
                        <div className="order-1 lg:col-span-2">
                            {course.category && (
                                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
                                    {course.category}
                                </span>
                            )}
                            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                                {course.title}
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4" />
                                    <span>
                                        {course.contents.length} Modul
                                        Belajar
                                    </span>
                                </div>
                            </div>

                            {/* Desktop: tampil di sini seperti semula. Mobile: dipindahkan ke atas deskripsi (lihat di bawah). */}
                            {course.technologies && course.technologies.length > 0 && (
                                <div className="mt-6 hidden lg:block">
                                    <TechnologyList technologies={course.technologies} />
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sticky Pricing & CTA Card */}
                        <div className="order-2 lg:col-span-1 lg:row-span-2">
                            <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5 shadow-lg">
                                {/* Thumbnail */}
                                <div className="relative mb-5 h-44 w-full overflow-hidden rounded-xl bg-muted">
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
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            Investasi Belajar
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-extrabold text-foreground">
                                                {formatPrice(course.price ?? 0)}
                                            </span>
                                            {course.price_strikethrough &&
                                                course.price_strikethrough >
                                                    (course.price ?? 0) && (
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        {formatPrice(
                                                            course.price_strikethrough,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-5 rounded-lg bg-muted/65 p-3 text-center text-sm text-muted-foreground">
                                        Course ini segera hadir / belum dapat
                                        dibeli.
                                    </div>
                                )}

                                {/* Benefits checklist */}
                                <ul className="mb-6 space-y-2.5 border-t border-border/40 pt-4 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                        Akses materi seumur hidup
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                        Sertifikat penyelesaian course
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                        Konsultasi dengan Instruktur
                                    </li>
                                </ul>

                                {/* Contextual CTA Button */}
                                {isPurchased ? (
                                    <Link
                                        href={
                                            course.contents.length > 0
                                                ? courses.contents.show.url([
                                                      course.slug,
                                                      course.contents[0].slug,
                                                  ])
                                                : '#'
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-semibold text-white shadow-md shadow-emerald-500/10 transition-all hover:bg-emerald-500"
                                    >
                                        <Play className="h-4 w-4" />
                                        Lanjutkan Belajar
                                    </Link>
                                ) : !isLoggedIn ? (
                                    // Guest: tampilan tombol "Beli Sekarang", tapi flow tetap arahkan ke halaman Login (tidak diubah)
                                    <Link
                                        href="/login"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-center text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Beli Sekarang
                                    </Link>
                                ) : course.has_product ? (
                                    // User login: flow langsung ke checkout, tidak diubah
                                    <Button
                                        className="flex w-full items-center justify-center gap-2 rounded-xl py-6 font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                        asChild
                                    >
                                        <Link
                                            href={`/orders/create?course=${course.slug}`}
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            {course.is_free
                                                ? 'Daftar Course Gratis'
                                                : 'Beli Sekarang'}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full rounded-xl py-6 font-bold"
                                        disabled
                                    >
                                        Segera Hadir
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Mobile only: tools ditampilkan tepat di atas deskripsi course */}
                        {course.technologies && course.technologies.length > 0 && (
                            <div className="order-3 lg:hidden">
                                <TechnologyList technologies={course.technologies} />
                            </div>
                        )}

                        {/* Left Column: About & Curriculum */}
                        <div className="order-3 space-y-8 lg:col-span-2">
                            {/* About / Description */}
                            <div className="border-t border-border/50 pt-8">
                                <h2 className="mb-4 text-xl font-bold">
                                    Tentang Course
                                </h2>
                                {course.description ? (
                                    <div className="space-y-4 leading-relaxed whitespace-pre-line text-muted-foreground">
                                        {course.description}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        Deskripsi course belum tersedia.
                                    </p>
                                )}
                            </div>

                            {/* Curriculum / Lesson list */}
                            <div className="border-t border-border/50 pt-8">
                                <div className="mb-6">
                                    <h2 className="flex items-center gap-2 text-xl font-bold">
                                        Kurikulum Belajar
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Daftar modul terstruktur untuk menunjang
                                        proses belajarmu
                                    </p>
                                </div>

                                {course.contents.length > 0 ? (
                                    <div className="space-y-6">
                                        {sections.map((section, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className="space-y-3.5"
                                            >
                                                {section.name && (
                                                    <h3 className="pt-3 text-base font-extrabold text-[#B99430] sm:text-lg dark:text-[#d4af37]">
                                                        {section.name}
                                                    </h3>
                                                )}
                                                <div className="space-y-3">
                                                    {section.contents.map(
                                                        (content) => (
                                                            <div
                                                                key={content.id}
                                                                className="rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card/70"
                                                            >
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                                                            {
                                                                                content.order
                                                                            }
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm leading-snug font-bold text-foreground sm:text-base">
                                                                                {
                                                                                    content.title
                                                                                }
                                                                            </h4>
                                                                        </div>
                                                                    </div>

                                                                    {/* Access action */}
                                                                    <div>
                                                                        {(() => {
                                                                            const contentIndex =
                                                                                contentIndexById.get(
                                                                                    content.id,
                                                                                ) ??
                                                                                -1;
                                                                            const isFreePreview =
                                                                                course.is_free &&
                                                                                contentIndex <
                                                                                    FREE_PREVIEW_LIMIT;
                                                                            const canAccess =
                                                                                isPurchased ||
                                                                                isFreePreview;

                                                                            return canAccess ? (
                                                                                <Link
                                                                                    href={courses.contents.show.url(
                                                                                        [
                                                                                            course.slug,
                                                                                            content.slug,
                                                                                        ],
                                                                                    )}
                                                                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                                                                                >
                                                                                    Mulai
                                                                                    Belajar
                                                                                </Link>
                                                                            ) : (
                                                                                <div
                                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                                                                                    title="Materi Terkunci"
                                                                                >
                                                                                    <Lock className="h-4 w-4" />
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </div>

                                                                {/* Render sub topics */}
                                                                {content.sub_topics &&
                                                                    content
                                                                        .sub_topics
                                                                        .length >
                                                                        0 && (
                                                                        <div className="mt-3.5 ml-4 space-y-1.5 border-l border-border/40 pl-11">
                                                                            {content.sub_topics.map(
                                                                                (
                                                                                    topic,
                                                                                    tIdx,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            tIdx
                                                                                        }
                                                                                        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                                                                                    >
                                                                                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/35" />
                                                                                        <span>
                                                                                            {
                                                                                                topic
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
                                        Kurikulum / modul belum ditambahkan
                                        untuk course ini.
                                    </div>
                                )}
                            </div>

                            {/* Galeri Hasil Project */}
                            {gallery.length > 0 && (
                                <div className="border-t border-border/50 pt-8">
                                    <div className="mb-6">
                                        <h2 className="flex items-center gap-2 text-xl font-bold">
                                            <Images className="h-5 w-5 text-primary" />
                                            Galeri Hasil Project
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Contoh tampilan jadi dari project
                                            yang akan kamu bangun di course ini
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {gallery.map((image, idx) => (
                                            <button
                                                key={image.id}
                                                type="button"
                                                onClick={() =>
                                                    setLightboxIndex(idx)
                                                }
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
                                <div
                                    id="review-form-container"
                                    className="mt-8 border-t border-border/50 pt-8"
                                >
                                    <div className="mb-6">
                                        <h2 className="flex items-center gap-2 text-xl font-bold">
                                            Ulasan Course Kamu
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Kamu telah menyelesaikan course ini!
                                            Bantu pembelajar lain dengan
                                            memberikan ulasan terbaikmu.
                                        </p>
                                    </div>

                                    <form
                                        onSubmit={submitReview}
                                        className="space-y-5 rounded-2xl border border-border/60 bg-card p-5 sm:p-6"
                                    >
                                        {/* Rating Star Selection */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Rating Course
                                            </label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'rating',
                                                                star,
                                                            )
                                                        }
                                                        onMouseEnter={() =>
                                                            setRatingHover(star)
                                                        }
                                                        onMouseLeave={() =>
                                                            setRatingHover(null)
                                                        }
                                                        className="cursor-pointer p-1 transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`h-7 w-7 ${
                                                                star <=
                                                                (ratingHover ??
                                                                    data.rating)
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
                                            <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Tag Cepat
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {quickTags.map((tag) => {
                                                    const isSelected =
                                                        data.tags.includes(tag);

                                                    return (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() =>
                                                                toggleTag(tag)
                                                            }
                                                            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                                                                isSelected
                                                                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                                    : 'border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted'
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
                                            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                <label htmlFor="comment">
                                                    Komentar Ulasan
                                                </label>
                                                <span>
                                                    {data.comment.length}/500
                                                </span>
                                            </div>
                                            <textarea
                                                id="comment"
                                                rows={3}
                                                maxLength={500}
                                                placeholder="Tulis ulasan belajarmu di sini (opsional)..."
                                                value={data.comment}
                                                onChange={(e) =>
                                                    setData(
                                                        'comment',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-border/80 bg-muted/20 p-3.5 text-sm font-medium focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-4 pt-2">
                                            {course.user_review && (
                                                <span className="rounded border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    Sudah diulas sebelumnya
                                                </span>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="ml-auto rounded-xl bg-[#B99430] font-bold text-white hover:bg-[#725a15]"
                                            >
                                                {processing
                                                    ? 'Menyimpan...'
                                                    : course.user_review
                                                      ? 'Perbarui Ulasan'
                                                      : 'Kirim Ulasan'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Lightbox galeri */}
            <Dialog
                open={lightboxIndex !== null}
                onOpenChange={(open) => !open && setLightboxIndex(null)}
            >
                <DialogContent className="w-[95vw] max-w-6xl border-0 bg-transparent p-0 shadow-none sm:max-w-6xl">
                    <DialogTitle className="sr-only">
                        Galeri hasil project {course.title}
                    </DialogTitle>
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
                                        className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={showNextImage}
                                        aria-label="Gambar berikutnya"
                                        className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
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
                    {
                        title: props.course?.title ?? 'Detail Course',
                        href: '#',
                    },
                ]}
            >
                {page}
            </AppLayout>
        );
    }

    // Guest: tidak ada AppLayout, render langsung
    return <>{page}</>;
};
