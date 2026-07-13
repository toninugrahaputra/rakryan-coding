import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    Lock,
    Clock,
    Bookmark,
    Moon,
} from 'lucide-react';
import { useState } from 'react';
import EditorJsRenderer from '@/components/editor-js-renderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

interface Lesson {
    id: number;
    title: string;
    slug: string;
    order: number;
    is_completed: boolean;
    is_locked: boolean;
}

interface Content {
    id: number;
    title: string;
    slug: string;
    content: any;
    order: number;
    is_completed: boolean;
}

interface CourseContentShowProps {
    course: {
        id: number;
        slug: string;
        title: string;
    };
    content: Content;
    prevContent: { slug: string; title: string } | null;
    nextContent: { slug: string; title: string } | null;
    lessons: Lesson[];
    isLoggedIn: boolean;
    isPurchased: boolean;
    isPreview: boolean;
    isFree: boolean;
    progress: {
        total_count: number;
        completed_count: number;
        percentage: number;
        current_index: number;
    };
}

export default function CourseContentShow({
    course,
    content,
    prevContent,
    nextContent,
    lessons = [],
    isLoggedIn,
    isPurchased,
    isPreview,
    isFree,
    progress,
}: CourseContentShowProps) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

    function handleComplete() {
        setIsCompleting(true);
        router.post(
            `/courses/${course.slug}/contents/${content.slug}/complete`,
            {},
            {
                onFinish: () => setIsCompleting(false),
            },
        );
    }

    const fontSizeClasses = {
        sm: 'text-sm prose-sm',
        base: 'text-base prose-base',
        lg: 'text-lg prose-lg',
    };

    return (
        <>
            <Head title={`${content.title} — ${course.title}`} />

            <div className="flex min-h-screen flex-col bg-[#fcfcfd] font-sans text-foreground dark:bg-background">
                {/* ─── Reader Top Control Bar (BWA Page 23) ─── */}
                <div className="sticky top-0 z-40 border-b border-border/50 bg-card py-3 shadow-xs">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        {/* Back link */}
                        <Link
                            href={`/courses/${course.slug}`}
                            className="inline-flex max-w-[200px] items-center gap-1.5 truncate text-xs font-bold text-muted-foreground transition-colors hover:text-primary sm:max-w-md sm:text-sm"
                        >
                            <ArrowLeft className="h-4 w-4 shrink-0" />
                            <span className="truncate">{course.title}</span>
                        </Link>

                        {/* Progress Indicator bar — disembunyikan untuk guest yang belum punya progress */}
                        {isLoggedIn ? (
                            <div className="hidden items-center gap-4 text-xs font-bold sm:flex">
                                <span className="text-muted-foreground">
                                    Bab {progress.current_index}/
                                    {progress.total_count}
                                </span>
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{
                                            width: `${progress.percentage}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-emerald-600">
                                    {progress.percentage}%
                                </span>
                            </div>
                        ) : (
                            <span className="hidden items-center gap-1.5 rounded-full bg-[#eab308]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#B99430] uppercase sm:inline-flex">
                                <Eye className="h-3 w-3" />
                                Mode Preview
                            </span>
                        )}

                        {/* Font size control and bookmark actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setFontSize(
                                        fontSize === 'sm'
                                            ? 'base'
                                            : fontSize === 'base'
                                              ? 'lg'
                                              : 'sm',
                                    )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 font-serif text-sm font-bold hover:bg-muted"
                                title="Ganti Ukuran Font"
                            >
                                A
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:bg-muted">
                                <Bookmark className="h-4 w-4" />
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:bg-muted">
                                <Moon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {isPreview && (
                    <div className="border-b border-[#eab308]/20 bg-[#eab308]/10 py-2.5 sm:hidden">
                        <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 px-4 text-[10px] font-bold tracking-widest text-[#B99430] uppercase">
                            <Eye className="h-3 w-3" />
                            Mode Preview
                        </div>
                    </div>
                )}

                {/* ─── Main split layout (BWA Page 23) ─── */}
                <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
                    {/* Left Sidebar: Lesson listing list (1/3 width on desktop) */}
                    <aside className="hidden w-72 shrink-0 space-y-6 border-r border-border/40 pr-6 lg:block">
                        <div className="space-y-1">
                            <span className="block text-[10px] font-bold tracking-widest text-primary uppercase">
                                MATERI BELAJAR
                            </span>
                            <h3 className="line-clamp-2 text-sm leading-snug font-extrabold text-foreground">
                                {course.title}
                            </h3>
                            {isLoggedIn && (
                                <span className="mt-1 block text-[10px] font-bold text-emerald-600">
                                    {progress.percentage}% Selesai
                                </span>
                            )}
                        </div>

                        <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                            {lessons.map((lesson) => {
                                const isActive = lesson.slug === content.slug;

                                return (
                                    <Link
                                        key={lesson.id}
                                        href={`/courses/${course.slug}/contents/${lesson.slug}`}
                                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                                            isActive
                                                ? 'border-primary bg-primary/5 font-extrabold text-primary shadow-xs'
                                                : lesson.is_locked
                                                  ? 'border-border/30 text-muted-foreground/70 hover:bg-muted/20'
                                                  : 'border-border/40 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            {lesson.is_locked ? (
                                                <Lock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                                            ) : lesson.is_completed ? (
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                            ) : (
                                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border/80 text-[9px] font-bold">
                                                    {lesson.order}
                                                </span>
                                            )}
                                            <span className="truncate text-xs leading-tight font-medium">
                                                {lesson.title}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Right Main Panel: Material Reader (2/3 width) */}
                    <main className="min-w-0 flex-1 space-y-8">
                        {/* Title Header */}
                        <div className="space-y-2 border-b border-border/40 pb-5">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                Bab {progress.current_index} dari{' '}
                                {progress.total_count}
                            </span>
                            <h1 className="text-2xl leading-snug font-extrabold text-foreground sm:text-3xl">
                                {content.title}
                            </h1>
                            <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    ±14 menit baca
                                </span>
                            </div>
                        </div>

                        {/* Rich Content View Pane */}
                        <div
                            className={`prose dark:prose-invert max-w-none rounded-3xl border border-border/50 bg-card p-6.5 leading-relaxed text-foreground shadow-xs ${fontSizeClasses[fontSize]}`}
                        >
                            {content.content ? (
                                <EditorJsRenderer data={content.content} />
                            ) : (
                                <p className="text-muted-foreground italic">
                                    Materi tidak dapat dimuat atau kosong.
                                </p>
                            )}
                        </div>

                        {/* Bottom navigation buttons */}
                        <div className="space-y-6 border-t border-border/40 pt-6">
                            {/* Prev / Next buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {prevContent ? (
                                    <Link
                                        href={`/courses/${course.slug}/contents/${prevContent.slug}`}
                                        className="group inline-flex max-w-[200px] flex-col text-left"
                                    >
                                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            SEBELUMNYA
                                        </span>
                                        <span className="mt-0.5 truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                                            {prevContent.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div />
                                )}

                                {nextContent ? (
                                    <Link
                                        href={`/courses/${course.slug}/contents/${nextContent.slug}`}
                                        className="group inline-flex max-w-[200px] flex-col items-end text-right"
                                    >
                                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            BERIKUTNYA
                                        </span>
                                        <span className="mt-0.5 truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                                            {nextContent.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div />
                                )}
                            </div>

                            {/* Mark complete CTA button — hanya untuk yang punya akses penuh */}
                            <div className="flex justify-center pt-2">
                                {!isPurchased && !isLoggedIn ? (
                                    <Button
                                        asChild
                                        className="rounded-xl bg-[#B99430] px-8 py-3.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#725a15]"
                                    >
                                        <Link href="/login">
                                            Login untuk melanjutkan belajar ➔
                                        </Link>
                                    </Button>
                                ) : !isPurchased && isFree ? (
                                    <Button
                                        asChild
                                        className="rounded-xl bg-[#B99430] px-8 py-3.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#725a15]"
                                    >
                                        <Link href={`/orders/create?course=${course.slug}`}>
                                            Daftar Gratis untuk Lanjut Belajar ➔
                                        </Link>
                                    </Button>
                                ) : content.is_completed ? (
                                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 px-6 text-xs font-bold text-emerald-600">
                                        <CheckCircle2 className="h-4.5 w-4.5" />
                                        Kamu telah menyelesaikan modul ini!
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleComplete}
                                        disabled={isCompleting}
                                        className="rounded-xl bg-[#B99430] px-8 py-3.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#725a15]"
                                    >
                                        {isCompleting
                                            ? 'Menyimpan progres...'
                                            : 'Tandai selesai & lanjut ➔'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

CourseContentShow.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[]}>{page}</AppLayout>
);
