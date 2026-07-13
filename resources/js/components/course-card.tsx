import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, CheckCircle, ShoppingCart } from 'lucide-react';

export interface CourseCardData {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: string | any;
    contents_count: number;
    created_at: string;
    price: number | null;
    price_strikethrough: number | null;
    is_free: boolean;
    has_product: boolean;
    rating?: number;
    reviews_count?: number;
}

interface CourseCardProps {
    course: CourseCardData;
    isPurchased?: boolean;
    isLoggedIn?: boolean;
    showRating?: boolean;
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

export function CourseCard({
    course,
    isPurchased = false,
    isLoggedIn = false,
    showRating = true,
}: CourseCardProps) {
    const categoryName =
        typeof course.category === 'object' && course.category !== null
            ? (course.category as any).name
            : course.category;

    // Default prices based on standard mock prices in the PDF
    const strikePriceVal = course.price_strikethrough ?? 249000;
    const actualPriceVal = course.price ?? 149000;
    const isFree = course.is_free || actualPriceVal === 0;

    // Hitung persentase diskon
    const discountPercent =
        strikePriceVal > actualPriceVal
            ? Math.round(
                  ((strikePriceVal - actualPriceVal) / strikePriceVal) * 100,
              )
            : 0;

    return (
        <Link
            href={`/courses/${course.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
            {/* Thumbnail Image */}
            <div className="relative h-44 w-full overflow-hidden bg-muted">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
                        <BookOpen className="h-10 w-10 text-primary/30" />
                    </div>
                )}

                {/* Category badge */}
                {categoryName && (
                    <span className="absolute top-3 left-3 rounded-full bg-background/95 px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase shadow-xs backdrop-blur-xs">
                        {categoryName}
                    </span>
                )}

                {/* Status Dimiliki badge */}
                {isPurchased && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase shadow-xs">
                        <CheckCircle className="h-3 w-3" />
                        Dimiliki
                    </span>
                )}
            </div>

            {/* Content Details */}
            <div className="flex flex-1 flex-col justify-between gap-4 p-4.5">
                <div>
                    <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
                        {course.title}
                    </h3>
                </div>

                <div className="space-y-3 border-t border-border/40 pt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{course.contents_count} bab</span>
                    </div>

                    {/* Price Tag Row */}
                    <div className="flex flex-wrap items-center justify-between gap-1">
                        {isPurchased ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                <span>Siap Belajar</span>
                            </div>
                        ) : isFree ? (
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                Gratis
                            </span>
                        ) : (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground line-through">
                                        {formatPrice(strikePriceVal)}
                                    </span>
                                    <span className="text-sm font-extrabold text-foreground">
                                        {formatPrice(actualPriceVal)}
                                    </span>
                                </div>
                                {discountPercent > 0 && (
                                    <span className="rounded border border-emerald-500/15 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                                        Hemat {discountPercent}%
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* CTA Button Footer */}
            <div className="border-t border-border/40 p-4 pt-3.5">
                {isPurchased ? (
                    <div className="flex w-full items-center justify-center gap-1 rounded-xl border border-emerald-500/15 bg-emerald-500/10 py-2 text-center text-xs font-bold text-emerald-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Lanjutkan Belajar
                    </div>
                ) : !isLoggedIn ? (
                    // Tampilan saja yang diubah (icon + teks) — flow klik tetap ke halaman detail course seperti semula,
                    // proses login/checkout sesungguhnya baru terjadi di halaman detail course.
                    <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#B99430] py-2 text-center text-xs font-bold text-white shadow-sm">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Beli Sekarang
                    </div>
                ) : isFree ? (
                    <div className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground hover:bg-primary/95">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Daftar Gratis
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#B99430] py-2 text-center text-xs font-bold text-white shadow-sm hover:bg-[#725a15]">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Beli Sekarang
                    </div>
                )}
            </div>
        </Link>
    );
}
