import { Link } from '@inertiajs/react';
import { ArrowRight, Newspaper } from 'lucide-react';

export interface ArticleCardData {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    created_at: string;
}

export function ArticleCard({ article }: { article: ArticleCardData }) {
    return (
        <Link
            href={`/articles/${article.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
            {/* Thumbnail Image */}
            <div className="relative h-44 w-full overflow-hidden bg-muted">
                {article.thumbnail ? (
                    <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
                        <Newspaper className="h-10 w-10 text-primary/30" />
                    </div>
                )}

                <span className="absolute top-3 left-3 rounded-full bg-background/95 px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase shadow-xs backdrop-blur-xs">
                    Artikel
                </span>
            </div>

            {/* Content Details */}
            <div className="flex flex-1 flex-col justify-between gap-4 p-4.5">
                <div className="space-y-1.5">
                    <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground transition-colors group-hover:text-primary">
                        {article.title}
                    </h3>
                    {article.excerpt && (
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {article.excerpt}
                        </p>
                    )}
                </div>

                <span className="text-[10px] font-medium text-muted-foreground">
                    {article.created_at}
                </span>
            </div>

            {/* CTA Footer */}
            <div className="border-t border-border/40 p-4 pt-3.5">
                <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#B99430] py-2 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#725a15]">
                    Baca artikel
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </Link>
    );
}
