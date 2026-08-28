import { Link } from '@inertiajs/react';
import { Code2 } from 'lucide-react';

export interface SourceCodeCardData {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    price: number;
    price_strikethrough: number | null;
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

export function SourceCodeCard({ product }: { product: SourceCodeCardData }) {
    return (
        <Link
            href={`/source-code/${product.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
            <div className="relative h-44 w-full overflow-hidden bg-muted">
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
                        <Code2 className="h-10 w-10 text-primary/30" />
                    </div>
                )}

                <span className="absolute top-3 left-3 rounded-full bg-background/95 px-2.5 py-0.5 text-badge text-primary uppercase shadow-xs backdrop-blur-xs">
                    Source Code
                </span>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 p-4.5">
                <h3 className="line-clamp-2 text-card-title text-foreground transition-colors group-hover:text-primary">
                    {product.title}
                </h3>

                <div className="flex items-center gap-2">
                    <span className="text-body font-bold text-foreground">
                        {formatPrice(product.price)}
                    </span>
                    {product.price_strikethrough && (
                        <span className="text-caption text-muted-foreground line-through">
                            {formatPrice(product.price_strikethrough)}
                        </span>
                    )}
                </div>
            </div>

            <div className="border-t border-border/40 p-4 pt-3.5">
                <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#B99430] py-2 text-center text-button text-white shadow-sm transition-colors hover:bg-[#725a15]">
                    Lihat Detail
                </div>
            </div>
        </Link>
    );
}
