import type { OutputData } from '@editorjs/editorjs';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Newspaper } from 'lucide-react';
import EditorJsRenderer from '@/components/editor-js-renderer';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';

interface ArticleShowProps {
    article: {
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        content: OutputData | null;
        thumbnail: string | null;
        created_at: string;
    };
}

export default function ArticleShow({ article }: ArticleShowProps) {
    return (
        <>
            <Head title={`${article.title} — Rakryan Coding`}>
                {article.excerpt && (
                    <meta name="description" content={article.excerpt} />
                )}
            </Head>

            <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
                <PublicNavbar />

                <main className="flex-1 py-10 sm:py-14">
                    <div className="mx-auto max-w-3xl px-6 lg:px-8">
                        <Link
                            href="/#artikel"
                            className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-primary sm:text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke beranda
                        </Link>

                        <div className="space-y-3 border-b border-border/40 pb-6">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-primary uppercase">
                                <Newspaper className="h-3 w-3" />
                                Artikel
                            </span>
                            <h1 className="text-2xl leading-snug font-extrabold text-foreground sm:text-4xl">
                                {article.title}
                            </h1>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                {article.created_at}
                            </p>
                        </div>

                        {article.thumbnail && (
                            <div className="mt-8 overflow-hidden rounded-2xl border border-border/50">
                                <img
                                    src={article.thumbnail}
                                    alt={article.title}
                                    className="h-auto w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="prose dark:prose-invert mt-8 max-w-none leading-relaxed text-foreground">
                            {article.content ? (
                                <EditorJsRenderer data={article.content} />
                            ) : (
                                <p className="text-muted-foreground italic">
                                    Konten artikel belum tersedia.
                                </p>
                            )}
                        </div>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
