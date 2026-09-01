import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Code2,
    Download,
    FileCode2,
    Infinity as InfinityIcon,
    Lock,
    ShoppingCart,
    Wrench,
} from 'lucide-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';

interface GuideStep {
    title: string;
    slug: string;
    order: number;
}

interface SourceCodeShowProps {
    product: {
        id: number;
        title: string;
        slug: string;
        description: string | null;
        thumbnail: string | null;
        price: number;
        price_strikethrough: number | null;
    };
    isPurchased: boolean;
    isLoggedIn: boolean;
    guides: GuideStep[];
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

const benefits = [
    {
        icon: InfinityIcon,
        title: 'Akses Selamanya',
        desc: 'Sekali beli, file source code jadi milikmu — download kapan saja tanpa batas waktu.',
    },
    {
        icon: Wrench,
        title: 'Bebas Dimodifikasi',
        desc: 'Kembangkan, ubah, atau jadikan bahan belajar/tugas sesuai kebutuhanmu.',
    },
    {
        icon: FileCode2,
        title: 'Kode Rapi & Terstruktur',
        desc: 'Ditulis mengikuti best practice, gampang dipelajari dan dilanjutkan.',
    },
];

export default function SourceCodeShow({
    product,
    isPurchased,
    guides = [],
}: SourceCodeShowProps) {
    return (
        <>
            <Seo
                title={product.title}
                description={
                    product.description ??
                    `Beli source code project "${product.title}" di Rakryan Coding.`
                }
                image={product.thumbnail}
            />

            <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
                <PublicNavbar />

                <main className="flex-1 py-10">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        {/* Back navigation */}
                        <div className="mb-6">
                            <Link
                                href="/source-code"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Source Code Project
                            </Link>
                        </div>

                        {/* Split layout: konten kiri, card beli sticky kanan */}
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Header / Title */}
                            <div className="order-1 lg:col-span-2">
                                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
                                    <Code2 className="h-3.5 w-3.5" />
                                    Source Code
                                </span>
                                <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                                    {product.title}
                                </h1>
                                {guides.length > 0 && (
                                    <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <FileCode2 className="h-4 w-4" />
                                            <span>
                                                {guides.length} Step Panduan
                                                Instalasi
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Sticky Pricing & CTA Card */}
                            <div className="order-2 lg:col-span-1 lg:row-span-2">
                                <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5 shadow-lg">
                                    <div className="relative mb-5 h-44 w-full overflow-hidden rounded-xl bg-muted">
                                        {product.thumbnail ? (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                <Code2 className="h-10 w-10 text-primary/30" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-5">
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            Harga
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-extrabold text-foreground">
                                                {formatPrice(product.price)}
                                            </span>
                                            {product.price_strikethrough &&
                                                product.price_strikethrough >
                                                    product.price && (
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        {formatPrice(
                                                            product.price_strikethrough,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    </div>

                                    {isPurchased ? (
                                        <Button
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-6 font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-500"
                                            asChild
                                        >
                                            <a
                                                href={`/source-code/${product.slug}/download`}
                                            >
                                                <Download className="h-4 w-4" />
                                                Download Source Code
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button
                                            className="flex w-full items-center justify-center gap-2 rounded-xl py-6 font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                            asChild
                                        >
                                            <Link
                                                href={`/orders/create?product=${product.slug}`}
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Beli Sekarang
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Left Column: About, Benefits, Guide */}
                            <div className="order-3 space-y-8 lg:col-span-2">
                                {/* About / Description */}
                                <div className="border-t border-border/50 pt-8">
                                    <h2 className="mb-4 text-xl font-bold">
                                        Tentang Produk
                                    </h2>
                                    {product.description ? (
                                        <div className="space-y-4 leading-relaxed whitespace-pre-line text-muted-foreground">
                                            {product.description}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">
                                            Belum ada deskripsi untuk produk
                                            ini.
                                        </p>
                                    )}
                                </div>

                                {/* Benefits */}
                                <div className="border-t border-border/50 pt-8">
                                    <h2 className="mb-6 text-xl font-bold">
                                        Yang Kamu Dapat
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {benefits.map(
                                            ({ icon: Icon, title, desc }) => (
                                                <div
                                                    key={title}
                                                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
                                                >
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                        <Icon className="h-4.5 w-4.5" />
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">
                                                            {title}
                                                        </p>
                                                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                                            {desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                {/* Panduan Instalasi — gaya penomoran sama seperti "Kurikulum Belajar" di halaman course */}
                                {guides.length > 0 && (
                                    <div className="border-t border-border/50 pt-8">
                                        <h2 className="mb-1 text-xl font-bold">
                                            Panduan Instalasi
                                        </h2>
                                        <p className="mb-6 text-sm text-muted-foreground">
                                            {guides.length} step untuk
                                            menjalankan project ini di
                                            komputermu.
                                        </p>
                                        <div className="space-y-3">
                                            {guides.map((step) => (
                                                <div
                                                    key={step.slug}
                                                    className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card/70"
                                                >
                                                    <Link
                                                        href={`/source-code/${product.slug}/guide/${step.slug}`}
                                                        className="flex min-w-0 flex-1 items-center gap-3"
                                                    >
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                                            {step.order}
                                                        </span>
                                                        <h4 className="truncate text-sm leading-snug font-bold text-foreground sm:text-base">
                                                            {step.title}
                                                        </h4>
                                                    </Link>

                                                    {isPurchased ? (
                                                        <Link
                                                            href={`/source-code/${product.slug}/guide/${step.slug}`}
                                                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                                                        >
                                                            Buka
                                                        </Link>
                                                    ) : (
                                                        <div
                                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                                                            title="Terkunci — beli dulu untuk membuka"
                                                        >
                                                            <Lock className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
