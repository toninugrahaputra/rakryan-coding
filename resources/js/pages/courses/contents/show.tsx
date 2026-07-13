import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import EditorJsRenderer from '@/components/editor-js-renderer';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, CheckCircle2, ChevronRight, Play, Lock, BookOpen, Clock, Settings, Bookmark, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lesson {
    id: number;
    title: string;
    slug: string;
    order: number;
    is_completed: boolean;
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
            }
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

            <div className="flex min-h-screen flex-col bg-[#fcfcfd] dark:bg-background text-foreground font-sans">
                {/* ─── Reader Top Control Bar (BWA Page 23) ─── */}
                <div className="border-b border-border/50 bg-card py-3 sticky top-0 z-40 shadow-xs">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                        {/* Back link */}
                        <Link
                            href={`/courses/${course.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-md"
                        >
                            <ArrowLeft className="h-4 w-4 shrink-0" />
                            <span className="truncate">{course.title}</span>
                        </Link>

                        {/* Progress Indicator bar */}
                        <div className="hidden sm:flex items-center gap-4 text-xs font-bold">
                            <span className="text-muted-foreground">
                                Bab {progress.current_index}/{progress.total_count}
                            </span>
                            <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress.percentage}%` }} />
                            </div>
                            <span className="text-emerald-600">{progress.percentage}%</span>
                        </div>

                        {/* Font size control and bookmark actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
                                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center font-serif text-sm font-bold border border-border/40"
                                title="Ganti Ukuran Font"
                            >
                                A
                            </button>
                            <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground border border-border/40">
                                <Bookmark className="h-4 w-4" />
                            </button>
                            <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground border border-border/40">
                                <Moon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Main split layout (BWA Page 23) ─── */}
                <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
                    {/* Left Sidebar: Lesson listing list (1/3 width on desktop) */}
                    <aside className="w-72 shrink-0 border-r border-border/40 pr-6 hidden lg:block space-y-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">MATERI BELAJAR</span>
                            <h3 className="text-sm font-extrabold text-foreground leading-snug line-clamp-2">{course.title}</h3>
                            <span className="text-[10px] text-emerald-600 font-bold block mt-1">{progress.percentage}% Selesai</span>
                        </div>

                        <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-1">
                            {lessons.map((lesson) => {
                                const isActive = lesson.slug === content.slug;
                                return (
                                    <Link
                                        key={lesson.id}
                                        href={`/courses/${course.slug}/contents/${lesson.slug}`}
                                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${isActive
                                            ? 'border-primary bg-primary/5 font-extrabold text-primary shadow-xs'
                                            : 'border-border/40 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {lesson.is_completed ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            ) : (
                                                <span className="h-4 w-4 rounded-full border border-border/80 flex items-center justify-center text-[9px] font-bold shrink-0">
                                                    {lesson.order}
                                                </span>
                                            )}
                                            <span className="text-xs font-medium truncate leading-tight">{lesson.title}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Right Main Panel: Material Reader (2/3 width) */}
                    <main className="flex-1 min-w-0 space-y-8">
                        {/* Title Header */}
                        <div className="space-y-2 border-b border-border/40 pb-5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Modul 03 • Bab {progress.current_index} dari {progress.total_count}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-snug">
                                {content.title}
                            </h1>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    ±14 menit baca
                                </span>
                                <span>•</span>
                                <span>Diperbarui Juni 2026</span>
                            </div>
                        </div>

                        {/* Rich Content View Pane */}
                        <div className={`prose max-w-none text-foreground dark:prose-invert leading-relaxed border border-border/50 bg-card rounded-3xl p-6.5 shadow-xs ${fontSizeClasses[fontSize]}`}>
                            {content.content ? (
                                <EditorJsRenderer data={content.content} />
                            ) : (
                                <p className="italic text-muted-foreground">Materi tidak dapat dimuat atau kosong.</p>
                            )}
                        </div>

                        {/* Bottom navigation buttons */}
                        <div className="border-t border-border/40 pt-6 space-y-6">
                            {/* Prev / Next buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {prevContent ? (
                                    <Link
                                        href={`/courses/${course.slug}/contents/${prevContent.slug}`}
                                        className="group inline-flex flex-col text-left max-w-[200px]"
                                    >
                                        <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">SEBELUMNYA</span>
                                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate mt-0.5">
                                            {prevContent.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div />
                                )}

                                {nextContent ? (
                                    <Link
                                        href={`/courses/${course.slug}/contents/${nextContent.slug}`}
                                        className="group inline-flex flex-col text-right max-w-[200px] items-end"
                                    >
                                        <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">BERIKUTNYA</span>
                                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate mt-0.5">
                                            {nextContent.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div />
                                )}
                            </div>

                            {/* Mark complete CTA button */}
                            <div className="flex justify-center pt-2">
                                {content.is_completed ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-3.5 px-6 font-bold text-xs flex items-center gap-2">
                                        <CheckCircle2 className="h-4.5 w-4.5" />
                                        Kamu telah menyelesaikan modul ini!
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleComplete}
                                        disabled={isCompleting}
                                        className="rounded-xl font-extrabold text-xs bg-[#B99430] hover:bg-[#725a15] text-white px-8 py-3.5 shadow-sm"
                                    >
                                        {isCompleting ? 'Menyimpan progres...' : 'Tandai selesai & lanjut ➔'}
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
