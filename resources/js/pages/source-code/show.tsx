import { Link } from '@inertiajs/react';
import { ArrowLeft, Code2, Download, ShoppingCart } from 'lucide-react';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';

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

export default function SourceCodeShow({
    product,
    isPurchased,
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

                <main className="flex-1 py-10 sm:py-14">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        <Link
                            href="/source-code"
                            className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-primary sm:text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Source Code Project
                        </Link>

                        <div className="space-y-3 border-b border-border/40 pb-6">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-primary uppercase">
                                <Code2 className="h-3 w-3" />
                                Source Code
                            </span>
                            <h1 className="text-2xl leading-snug font-extrabold text-foreground sm:text-4xl">
                                {product.title}
                            </h1>
                        </div>

                        {product.thumbnail && (
                            <div className="mt-8 overflow-hidden rounded-2xl border border-border/50">
                                <img
                                    src={product.thumbnail}
                                    alt={product.title}
                                    className="h-auto w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="mt-8 whitespace-pre-line leading-relaxed text-foreground">
                            {product.description || (
                                <p className="text-muted-foreground italic">
                                    Belum ada deskripsi untuk produk ini.
                                </p>
                            )}
                        </div>

                        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-border/50 bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="block text-2xl font-extrabold text-primary">
                                    {formatPrice(product.price)}
                                </span>
                                {product.price_strikethrough && (
                                    <span className="text-sm text-muted-foreground line-through">
                                        {formatPrice(
                                            product.price_strikethrough,
                                        )}
                                    </span>
                                )}
                            </div>

                            {isPurchased ? (
                                <Button
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-6 font-bold text-white hover:bg-emerald-500 sm:w-auto"
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
                                    className="flex w-full items-center justify-center gap-2 rounded-xl py-6 font-bold shadow-md shadow-primary/20 sm:w-auto"
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
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
