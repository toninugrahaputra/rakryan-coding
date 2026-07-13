import { Head, router } from '@inertiajs/react';
import { Newspaper, Search } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import type { ArticleCardData } from '@/components/article-card';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import { ScrollReveal } from '@/components/scroll-reveal';
import type { PaginatedResource } from '@/types/ui';

interface ArticlesIndexProps {
    articles: PaginatedResource<ArticleCardData>;
    filters: {
        search: string | null;
    };
}

export default function ArticlesIndex({
    articles,
    filters,
}: ArticlesIndexProps) {
    const visit = (params: Record<string, string>) => {
        const query = new URLSearchParams(window.location.search);
        Object.entries(params).forEach(([k, v]) => {
            if (v) {
                query.set(k, v);
            } else {
                query.delete(k);
            }
        });
        query.set('page', '1');
        router.visit(`/articles?${query.toString()}`, { preserveScroll: true });
    };

    const handlePageClick = (page: number) => {
        const query = new URLSearchParams(window.location.search);
        query.set('page', String(page));
        router.visit(`/articles?${query.toString()}`);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <PublicNavbar />

            <main className="flex-1">
                <Head title="Artikel — Rakryan Coding">
                    <meta
                        name="description"
                        content="Kumpulan artikel, tips, dan tutorial singkat seputar coding dari Rakryan Coding."
                    />
                </Head>

                <ScrollReveal animation="slide-right">
                    <section className="bg-muted/40 py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold tracking-widest text-primary uppercase">
                                <Newspaper className="h-4 w-4" />
                                Artikel
                            </span>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Semua Artikel
                            </h1>
                            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                                Tips, tutorial singkat, sampai cara menangani
                                error yang sering ditemui pas ngoding.
                            </p>

                            <div className="relative mx-auto mt-8 w-full max-w-3xl">
                                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Cari artikel..."
                                    className="w-full rounded-xl border border-input bg-background py-3 pr-4 pl-10 text-sm shadow-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            visit({
                                                search: (
                                                    e.target as HTMLInputElement
                                                ).value,
                                            });
                                        }
                                    }}
                                    defaultValue={filters.search || ''}
                                />
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                <section className="py-10">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <p className="mb-5 text-sm text-muted-foreground">
                            {articles.meta.total > 0
                                ? `${articles.meta.total} artikel ditemukan`
                                : 'Tidak ada artikel'}
                        </p>

                        {articles.data.length === 0 ? (
                            <ScrollReveal animation="fade-in">
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/40" />
                                    <p className="text-base font-medium text-foreground">
                                        Tidak ada artikel ditemukan
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Coba kata kunci lain
                                    </p>
                                </div>
                            </ScrollReveal>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {articles.data.map((article, index) => {
                                    const delays = [
                                        100, 150, 200, 250, 300, 350,
                                    ] as const;
                                    const delay = delays[index % delays.length];

                                    return (
                                        <ScrollReveal
                                            key={article.id}
                                            animation="scale-in"
                                            delay={delay}
                                            className="h-full"
                                        >
                                            <ArticleCard article={article} />
                                        </ScrollReveal>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {articles.meta.last_page > 1 &&
                            (() => {
                                const currentPage = articles.meta.current_page;
                                const lastPage = articles.meta.last_page;

                                const getPages = () => {
                                    const pages: (number | string)[] = [];
                                    const delta = 1;

                                    for (let i = 1; i <= lastPage; i++) {
                                        if (
                                            i === 1 ||
                                            i === lastPage ||
                                            (i >= currentPage - delta &&
                                                i <= currentPage + delta)
                                        ) {
                                            pages.push(i);
                                        } else if (
                                            pages[pages.length - 1] !== '...'
                                        ) {
                                            pages.push('...');
                                        }
                                    }

                                    return pages;
                                };

                                return (
                                    <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                                        <button
                                            onClick={() =>
                                                handlePageClick(
                                                    Math.max(
                                                        1,
                                                        currentPage - 1,
                                                    ),
                                                )
                                            }
                                            disabled={currentPage <= 1}
                                            className="cursor-pointer rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-40 sm:text-sm"
                                            aria-label="Halaman sebelumnya"
                                        >
                                            ←{' '}
                                            <span className="ml-1 hidden sm:inline">
                                                Sebelumnya
                                            </span>
                                        </button>

                                        {getPages().map((p, idx) => {
                                            if (p === '...') {
                                                return (
                                                    <span
                                                        key={`dots-${idx}`}
                                                        className="px-2 text-sm font-semibold text-muted-foreground"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const isActive = p === currentPage;

                                            return (
                                                <button
                                                    key={`page-${p}`}
                                                    onClick={() =>
                                                        handlePageClick(
                                                            p as number,
                                                        )
                                                    }
                                                    className={`h-9 w-9 cursor-pointer rounded-xl text-xs font-extrabold transition-all sm:text-sm ${
                                                        isActive
                                                            ? 'bg-[#B99430] text-white shadow-sm hover:bg-[#725a15]'
                                                            : 'border border-border bg-card text-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() =>
                                                handlePageClick(
                                                    Math.min(
                                                        lastPage,
                                                        currentPage + 1,
                                                    ),
                                                )
                                            }
                                            disabled={currentPage >= lastPage}
                                            className="cursor-pointer rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-40 sm:text-sm"
                                            aria-label="Halaman berikutnya"
                                        >
                                            <span className="mr-1 hidden sm:inline">
                                                Selanjutnya
                                            </span>{' '}
                                            →
                                        </button>
                                    </div>
                                );
                            })()}
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
