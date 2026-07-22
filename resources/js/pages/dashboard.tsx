import { Head, usePage, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock3,
    Play,
    UserPlus,
    BookOpen,
    Flame,
    AlertCircle,
    Plus,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { CourseCard } from '@/components/course-card';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes';

interface Course {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: string | null;
    contents_count: number;
    completed_contents_count: number;
    next_content_slug: string | null;
    created_at: string;
    price: number | null;
    price_strikethrough: number | null;
    is_free: boolean;
    has_product: boolean;
    tech_stack: string | null;
    read_duration: string | null;
    last_read_at: string | null;
}

interface UserStats {
    courses_enrolled: number;
    courses_completed: number;
    member_since: string | null;
    total_chapters_read: number;
    streak_days: number;
}

interface DashboardProps {
    purchasedCourses: Course[];
    userStats: UserStats;
    recentCourses: Course[];
    recommendations: Course[];
    hasDuplicateCourses: boolean;
}

export default function Dashboard() {
    const props = usePage().props as unknown as DashboardProps & {
        auth: { user: { name: string; email: string } | null };
    };
    const {
        purchasedCourses = [],
        userStats,
        recentCourses = [],
        recommendations = [],
        hasDuplicateCourses = false,
        auth,
    } = props;
    const user = auth?.user;

    // Filter state for Courses list tabs
    const [activeTab, setActiveTab] = useState<
        'all' | 'learning' | 'completed' | 'not_started'
    >('all');

    // Counts computation
    const totalEnrolled = purchasedCourses.length;
    const totalCompleted = purchasedCourses.filter(
        (c) =>
            c.contents_count > 0 &&
            c.completed_contents_count === c.contents_count,
    ).length;
    const totalLearning = purchasedCourses.filter(
        (c) =>
            c.completed_contents_count > 0 &&
            c.completed_contents_count < c.contents_count,
    ).length;
    const totalNotStarted = purchasedCourses.filter(
        (c) => c.completed_contents_count === 0,
    ).length;

    const filteredCourses = purchasedCourses.filter((c) => {
        if (activeTab === 'learning') {
            return (
                c.completed_contents_count > 0 &&
                c.completed_contents_count < c.contents_count
            );
        }

        if (activeTab === 'completed') {
            return (
                c.contents_count > 0 &&
                c.completed_contents_count === c.contents_count
            );
        }

        if (activeTab === 'not_started') {
            return c.completed_contents_count === 0;
        }

        return true;
    });

    // Ambil course untuk Lanjut Belajar (Pilih dari yang baru diakses, atau purchased pertama)
    const activeCourse = recentCourses[0] || purchasedCourses[0] || null;
    const activeCoursePercent =
        activeCourse && activeCourse.contents_count > 0
            ? Math.round(
                  (activeCourse.completed_contents_count /
                      activeCourse.contents_count) *
                      100,
              )
            : 0;

    // Greeting time-based
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return 'Selamat pagi';
        }

        if (hour < 15) {
            return 'Selamat siang';
        }

        if (hour < 18) {
            return 'Selamat sore';
        }

        return 'Selamat malam';
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-[#fcfcfd] p-4 font-sans dark:bg-background">
                {/* ─── Welcome Greeting Area (BWA Page 21) ─── */}
                <ScrollReveal
                    animation="fade-up"
                    className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6"
                >
                    <div>
                        <h1 className="text-3xl mt-5 font-extrabold tracking-tight text-foreground">
                            {getGreeting()}, {user ? user.name : 'Pelajar'}👋
                        </h1>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                            Lanjut belajar hari ini? Progresmu ada di bawah.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="rounded-xl bg-[#B99430] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#725a15]"
                    >
                        <Link href="/courses">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Beli paket baru
                        </Link>
                    </Button>
                </ScrollReveal>

                {/* ─── Alert Info Block (BWA Page 21) ─── */}
                {hasDuplicateCourses && purchasedCourses.length > 0 && (
                    <ScrollReveal animation="slide-right" delay={100}>
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-800 shadow-xs sm:text-sm dark:text-amber-300">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            <div>
                                <span className="font-bold">
                                    Informasi Akses:{' '}
                                </span>
                                Kamu punya beberapa paket yang berbagi course
                                yang sama. Materi ditampilkan sekali saja — tapi
                                hak aksesmu tetap aman.{' '}
                                <Link
                                    href="/courses"
                                    className="font-bold underline hover:opacity-80"
                                >
                                    Lihat detail ➔
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* ─── Lanjut Belajar Focus Banner (BWA Page 21) ─── */}
                {activeCourse && (
                    <ScrollReveal animation="scale-in" delay={100}>
                        <div className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-2xl border border-border/50 bg-card p-5.5 shadow-sm">
                            <div className="pointer-events-none absolute top-0 right-0 h-36 w-36 translate-x-12 -translate-y-12 rounded-full bg-primary/5 blur-2xl" />

                            <div className="min-w-[280px] flex-1 space-y-3.5">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold tracking-widest text-[#B99430] uppercase">
                                        LANJUT BELAJAR
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg leading-snug font-extrabold text-foreground sm:text-xl">
                                        {activeCourse.title}
                                    </h3>
                                    <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                                        {activeCourse.category || 'Web Dev'} •
                                        Bab{' '}
                                        {activeCourse.completed_contents_count +
                                            1}{' '}
                                        dari {activeCourse.contents_count}{' '}
                                        {activeCourse.tech_stack
                                            ? `• ${activeCourse.tech_stack}`
                                            : ''}{' '}
                                        {activeCourse.read_duration
                                            ? `• ${activeCourse.read_duration}`
                                            : ''}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="max-w-md space-y-1.5">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                            style={{
                                                width: `${activeCoursePercent}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <span className="font-bold text-foreground">
                                            {activeCoursePercent}%
                                        </span>
                                        <span>terbaca</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side status and CTA button */}
                            <div className="flex shrink-0 items-center gap-4.5 sm:text-right">
                                <div className="hidden text-xs sm:block">
                                    <span className="block font-medium text-muted-foreground">
                                        Terakhir dibaca
                                    </span>
                                    <span className="mt-0.5 block font-bold text-foreground">
                                        {activeCourse.last_read_at ||
                                            'Baru mulai'}
                                    </span>
                                </div>
                                <Button
                                    className="rounded-xl bg-[#B99430] px-5 py-3 text-xs font-extrabold text-white shadow-md hover:bg-[#725a15]"
                                    asChild
                                >
                                    <a
                                        href={
                                            activeCourse.next_content_slug
                                                ? `/courses/${activeCourse.slug}/contents/${activeCourse.next_content_slug}`
                                                : `/courses/${activeCourse.slug}`
                                        }
                                    >
                                        Lanjut bab{' '}
                                        {activeCourse.completed_contents_count +
                                            1}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* ─── Stats Grid (BWA Page 21) ─── */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {/* Stat Card 1 */}
                    <ScrollReveal animation="fade-up" delay={100}>
                        <Card className="border-border/60 bg-gradient-to-br from-muted/30 to-background shadow-xs">
                            <div className="flex items-center justify-between gap-3 p-4.5">
                                <div>
                                    <span className="text-2xl font-extrabold text-foreground">
                                        {totalEnrolled}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] font-bold text-muted-foreground">
                                        Course Dimiliki
                                    </span>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    </ScrollReveal>

                    {/* Stat Card 2 */}
                    <ScrollReveal animation="fade-up" delay={150}>
                        <Card className="border-border/60 bg-gradient-to-br from-muted/30 to-background shadow-xs">
                            <div className="flex items-center justify-between gap-3 p-4.5">
                                <div>
                                    <span className="text-2xl font-extrabold text-foreground">
                                        {totalCompleted}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] font-bold text-muted-foreground">
                                        Course Selesai
                                    </span>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    </ScrollReveal>

                    {/* Stat Card 3 */}
                    <ScrollReveal animation="fade-up" delay={200}>
                        <Card className="border-border/60 bg-gradient-to-br from-muted/30 to-background shadow-xs">
                            <div className="flex items-center justify-between gap-3 p-4.5">
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-2xl font-extrabold text-foreground">
                                            {userStats.streak_days || 0}
                                        </span>
                                        <Flame className="h-5 w-5 fill-current text-amber-500" />
                                    </div>
                                    <span className="mt-0.5 block text-[10px] font-bold text-muted-foreground">
                                        Hari Streak
                                    </span>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                    <Clock3 className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    </ScrollReveal>

                    {/* Stat Card 4 */}
                    <ScrollReveal animation="fade-up" delay={250}>
                        <Card className="border-border/60 bg-gradient-to-br from-muted/30 to-background shadow-xs">
                            <div className="flex items-center justify-between gap-3 p-4.5">
                                <div>
                                    <span className="text-2xl font-extrabold text-foreground">
                                        {userStats.total_chapters_read || 0}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] font-bold text-muted-foreground">
                                        Bab Selesai Dibaca
                                    </span>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    </ScrollReveal>
                </div>

                {/* ─── Course Section & Tabs (BWA Page 21) ─── */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-3">
                        <h2 className="text-lg font-extrabold text-foreground">
                            Course milikmu
                        </h2>

                        {/* Tabs Buttons */}
                        <div className="flex gap-2 text-xs font-semibold text-muted-foreground">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`border-b-2 px-2 pb-2 transition-all ${
                                    activeTab === 'all'
                                        ? 'border-[#eab308] font-bold text-foreground'
                                        : 'border-transparent hover:text-foreground'
                                }`}
                            >
                                Semua ({totalEnrolled})
                            </button>
                            <button
                                onClick={() => setActiveTab('learning')}
                                className={`border-b-2 px-2 pb-2 transition-all ${
                                    activeTab === 'learning'
                                        ? 'border-[#eab308] font-bold text-foreground'
                                        : 'border-transparent hover:text-foreground'
                                }`}
                            >
                                Berlangsung ({totalLearning})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`border-b-2 px-2 pb-2 transition-all ${
                                    activeTab === 'completed'
                                        ? 'border-[#eab308] font-bold text-foreground'
                                        : 'border-transparent hover:text-foreground'
                                }`}
                            >
                                Selesai ({totalCompleted})
                            </button>
                            <button
                                onClick={() => setActiveTab('not_started')}
                                className={`border-b-2 px-2 pb-2 transition-all ${
                                    activeTab === 'not_started'
                                        ? 'border-[#eab308] font-bold text-foreground'
                                        : 'border-transparent hover:text-foreground'
                                }`}
                            >
                                Belum mulai ({totalNotStarted})
                            </button>
                        </div>
                    </div>

                    {/* Enrolled Courses Grid */}
                    <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.map((course) => {
                            const completed =
                                course.completed_contents_count || 0;
                            const total = course.contents_count || 0;
                            const percent =
                                total > 0
                                    ? Math.round((completed / total) * 100)
                                    : 0;
                            const isFinished = total > 0 && completed === total;

                            const learnUrl = course.next_content_slug
                                ? `/courses/${course.slug}/contents/${course.next_content_slug}`
                                : `/courses/${course.slug}`;

                            return (
                                <div
                                    key={course.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs transition hover:shadow-md"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        <div className="relative h-36 overflow-hidden bg-muted">
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-[10px] font-bold text-muted-foreground">
                                                    &lt;/&gt;
                                                </div>
                                            )}

                                            {course.category && (
                                                <span className="absolute top-3 left-3 rounded-full bg-background/95 px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase shadow-xs backdrop-blur-xs">
                                                    {course.category}
                                                </span>
                                            )}

                                            {isFinished && (
                                                <span className="absolute top-3 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase shadow-xs">
                                                    Selesai ✓
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-3.5 p-4">
                                            <h3 className="line-clamp-2 min-h-9 text-xs leading-snug font-bold text-foreground transition-colors group-hover:text-primary sm:text-sm">
                                                {course.title}
                                            </h3>

                                            {/* Progress */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>Progres Belajar</span>
                                                    <span className="font-bold text-foreground">
                                                        {percent}% ({completed}/
                                                        {total} bab)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${isFinished ? 'bg-emerald-500' : 'bg-primary'}`}
                                                        style={{
                                                            width: `${percent}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="border-t border-border/40 p-4 pt-3.5">
                                        <Button
                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-xs"
                                            asChild
                                        >
                                            <a href={learnUrl}>
                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                Lanjutkan Belajar
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Teaser Locked Card from recommendations if any */}
                        {recommendations.length > 0 && activeTab === 'all' && (
                            <div className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-border/85 bg-card opacity-75 shadow-xs">
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-background/50 p-4 backdrop-blur-[1px]">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-sm">
                                        🔒
                                    </div>
                                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                        Belum dibuka
                                    </span>
                                    <Button
                                        size="sm"
                                        className="h-7 rounded-lg bg-[#B99430] px-3 text-[10px] font-extrabold text-white hover:bg-[#725a15]"
                                        asChild
                                    >
                                        <Link
                                            href={`/courses/${recommendations[0].slug}`}
                                        >
                                            Buka Kunci
                                        </Link>
                                    </Button>
                                </div>

                                <div>
                                    {/* Thumbnail */}
                                    <div className="relative h-36 overflow-hidden bg-muted">
                                        {recommendations[0].thumbnail ? (
                                            <img
                                                src={
                                                    recommendations[0].thumbnail
                                                }
                                                alt={recommendations[0].title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-[10px] font-bold text-muted-foreground">
                                                &lt;/&gt;
                                            </div>
                                        )}

                                        {recommendations[0].category && (
                                            <span className="absolute top-3 left-3 rounded-full bg-background/95 px-2.5 py-0.5 text-[9px] font-bold text-primary uppercase shadow-xs backdrop-blur-xs">
                                                {recommendations[0].category}
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3.5 p-4">
                                        <h3 className="line-clamp-2 min-h-9 text-xs leading-snug font-bold text-foreground sm:text-sm">
                                            {recommendations[0].title}
                                        </h3>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span>Progres Belajar</span>
                                                <span className="font-bold text-foreground">
                                                    0% (0/
                                                    {
                                                        recommendations[0]
                                                            .contents_count
                                                    }{' '}
                                                    bab)
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{ width: '0%' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-border/40 p-4 pt-3.5">
                                    <Button
                                        disabled
                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted py-2 text-xs font-bold text-muted-foreground"
                                    >
                                        Lanjutkan Belajar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Add Material Placeholder Card (BWA Page 21) */}
                        <Link
                            href="/courses"
                            className="group flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/5 p-6 text-center transition-colors hover:bg-muted/10"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-xs transition-transform group-hover:scale-105">
                                <Plus className="h-5 w-5" />
                            </div>
                            <h4 className="mt-3 text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                                Tambah materi baru
                            </h4>
                            <p className="mt-1 max-w-xs text-[10px] leading-normal text-muted-foreground">
                                Lihat paket & studi kasus lainnya di katalog
                            </p>
                        </Link>
                    </div>
                </div>

                {/* ─── BWA-Style Recommendations Showcase ─── */}
                {recommendations.length > 0 && (
                    <div className="mt-6 space-y-4 border-t border-border/40 pt-8">
                        <div>
                            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-primary uppercase">
                                <Sparkles className="h-3.5 w-3.5" />
                                Rekomendasi
                            </span>
                            <h2 className="mt-1 text-lg font-extrabold text-foreground">
                                Rekomendasi Course Sesuai Karier Anda
                            </h2>
                            <p className="text-[11px] text-muted-foreground">
                                Pelajari keahlian baru terpopuler untuk
                                meningkatkan daya saing karier digital Anda
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {recommendations.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={
                                        {
                                            ...course,
                                            contents_count:
                                                course.contents_count || 0,
                                        } as any
                                    }
                                    isPurchased={false}
                                    isLoggedIn={true}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
