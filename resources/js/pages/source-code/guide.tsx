import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Lock,
    Menu,
    ShoppingCart,
    X,
} from 'lucide-react';
import { useState } from 'react';
import EditorJsRenderer from '@/components/editor-js-renderer';
import ScrollToTopBottom from '@/components/scroll-to-top-bottom';
import { Button } from '@/components/ui/button';

interface Step {
    id: number;
    title: string;
    slug: string;
    order: number;
}

interface GuideShowProps {
    product: {
        slug: string;
        title: string;
    };
    guide: {
        id: number;
        title: string;
        slug: string;
        order: number;
        content: any;
    };
    prevGuide: { slug: string; title: string } | null;
    nextGuide: { slug: string; title: string } | null;
    guides: Step[];
    isPurchased: boolean;
    isLoggedIn: boolean;
    currentIndex: number;
}

export default function SourceCodeGuideShow({
    product,
    guide,
    prevGuide,
    nextGuide,
    guides = [],
    isPurchased,
    currentIndex,
}: GuideShowProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <Head title={`${guide.title} — ${product.title}`} />

            <ScrollToTopBottom />

            <div className="flex min-h-screen flex-col bg-[#fcfcfd] font-sans text-foreground dark:bg-background">
                {/* Reader Top Control Bar */}
                <div className="sticky top-0 z-40 border-b border-border/50 bg-card py-3 shadow-xs">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <Link
                            href={`/source-code/${product.slug}`}
                            className="inline-flex max-w-[220px] items-center gap-2 truncate text-base font-bold text-muted-foreground transition-colors hover:text-primary sm:max-w-md"
                        >
                            <ArrowLeft className="h-5 w-5 shrink-0" />
                            <span className="truncate">{product.title}</span>
                        </Link>

                        <span className="hidden text-xs font-bold text-muted-foreground uppercase tracking-wider sm:inline">
                            Panduan Instalasi
                        </span>
                    </div>
                </div>

                {/* Main split layout */}
                <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
                    {isSidebarOpen && (
                        <div
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 z-[45] bg-black/40 lg:hidden"
                        />
                    )}

                    {!isSidebarOpen && (
                        <button
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                            className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 lg:hidden"
                            aria-label="Buka daftar step"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    )}

                    {/* Sidebar: daftar step */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform space-y-6 overflow-y-auto border-r border-border/40 bg-background p-6 shadow-2xl transition-transform duration-300 ease-out ${
                            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } lg:sticky lg:top-24 lg:z-auto lg:h-fit lg:w-72 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:self-start lg:overflow-visible lg:bg-transparent lg:p-0 lg:pr-6 lg:shadow-none`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                                <span className="block text-xs font-bold tracking-widest text-primary uppercase">
                                    PANDUAN INSTALASI
                                </span>
                                <h3 className="line-clamp-2 text-base leading-snug font-extrabold text-foreground">
                                    {product.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
                                aria-label="Tutup daftar step"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                            {guides.map((step) => {
                                const isActive = step.slug === guide.slug;

                                return (
                                    <Link
                                        key={step.id}
                                        href={`/source-code/${product.slug}/guide/${step.slug}`}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                                            isActive
                                                ? 'border-primary bg-primary/5 font-extrabold text-primary shadow-xs'
                                                : 'border-border/40 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            {isPurchased ? (
                                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border/80 text-[9px] font-bold">
                                                    {step.order}
                                                </span>
                                            ) : (
                                                <Lock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                                            )}
                                            <span className="truncate text-xs leading-tight font-medium">
                                                {step.title}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Main panel */}
                    <main className="min-w-0 flex-1 space-y-8">
                        <div className="space-y-2 border-b border-border/40 pb-5">
                            <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                                Step {currentIndex} dari {guides.length}
                            </span>
                            <h1 className="text-2xl leading-snug font-extrabold text-foreground sm:text-3xl">
                                {guide.title}
                            </h1>
                        </div>

                        {isPurchased ? (
                            <div className="prose dark:prose-invert max-w-none rounded-3xl border border-border/50 bg-card p-6.5 leading-relaxed text-foreground shadow-xs">
                                {guide.content ? (
                                    <EditorJsRenderer data={guide.content} />
                                ) : (
                                    <p className="text-muted-foreground italic">
                                        Konten step ini belum diisi.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/60 bg-card p-10 text-center shadow-xs">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Lock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-base font-extrabold text-foreground">
                                        Konten panduan ini terkunci
                                    </p>
                                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                                        Beli produk ini dulu untuk membuka seluruh
                                        panduan instalasi, step demi step.
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    className="mt-2 rounded-xl bg-[#B99430] px-8 py-3.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#725a15]"
                                >
                                    <Link href={`/orders/create?product=${product.slug}`}>
                                        <ShoppingCart className="mr-1.5 h-4 w-4" />
                                        Beli Sekarang
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {isPurchased && (
                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6">
                                {prevGuide ? (
                                    <Link
                                        href={`/source-code/${product.slug}/guide/${prevGuide.slug}`}
                                        className="group inline-flex max-w-[200px] flex-col text-left"
                                    >
                                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            SEBELUMNYA
                                        </span>
                                        <span className="mt-0.5 truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                                            {prevGuide.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div />
                                )}

                                {nextGuide ? (
                                    <Link
                                        href={`/source-code/${product.slug}/guide/${nextGuide.slug}`}
                                        className="group inline-flex max-w-[200px] flex-col items-end text-right"
                                    >
                                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            BERIKUTNYA
                                        </span>
                                        <span className="mt-0.5 truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                                            {nextGuide.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Step terakhir
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
