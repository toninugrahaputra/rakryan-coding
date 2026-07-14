import { Head, usePage, router } from '@inertiajs/react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { CourseCard } from '@/components/course-card';
import type { CourseCardData } from '@/components/course-card';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import { ScrollReveal } from '@/components/scroll-reveal';
import AppLayout from '@/layouts/app-layout';
import type { PaginatedResource } from '@/types/ui';

// Auth untuk halaman publik — user bisa null jika belum login
type PublicAuth = {
    user: { id: number; name: string; email: string } | null;
};

interface CoursesIndexProps {
    courses: PaginatedResource<CourseCardData>;
    categories: Array<{ id: number; name: string }>;
    purchasedCourseIds: number[];
    filters: {
        search: string | null;
        category: string | null;
        sort: string | null;
    };
}

const SORT_OPTIONS = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'popular', label: 'Terpopuler' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'title-az', label: 'Judul A–Z' },
    { value: 'title-za', label: 'Judul Z–A' },
];

/** Konten katalog yang digunakan baik oleh guest maupun user login */
function CatalogContent() {
    const props = usePage().props as unknown as CoursesIndexProps & {
        auth: PublicAuth;
    };
    const { courses, categories, purchasedCourseIds, filters } = props;
    const auth = props.auth;
    const isLoggedIn = Boolean(auth?.user);

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
        router.visit(`/courses?${query.toString()}`, { preserveScroll: true });
    };

    const activeCategory = filters.category ?? '';
    const activeSort = filters.sort ?? 'latest';

    return (
        <>
            <Head title="Katalog Courses">
                <meta
                    name="description"
                    content="Jelajahi semua course coding dan teknologi digital tersedia di Rakryan Coding."
                />
            </Head>

            {/* Page Header */}
            <ScrollReveal animation="slide-right">
                <section className="bg-muted/40 py-14 sm:py-16">
                    <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                            #BelajarDariAhlinya
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Katalog Courses
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            Rakryan Coding menyediakan course Web Development
                            &amp; Programming dari pemula ke mahir
                        </p>

                        {/* Search bar */}
                        <div className="relative mx-auto mt-8 w-full max-w-3xl">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari course..."
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

            {/* Content — sidebar + grid */}
            <section className="py-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex gap-8">
                        {/* ── Sidebar Filter ── */}
                        <aside className="hidden w-52 shrink-0 lg:block">
                            {/* Category */}
                            <div className="mb-8">
                                <h3 className="mb-3 text-sm font-bold tracking-wide text-foreground uppercase">
                                    Kategori
                                </h3>
                                <ul className="space-y-1.5">
                                    <li>
                                        <button
                                            onClick={() =>
                                                visit({ category: '' })
                                            }
                                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${activeCategory === '' ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                        >
                                            <BookOpen className="h-3.5 w-3.5 shrink-0" />
                                            Semua
                                        </button>
                                    </li>
                                    {categories.map((cat) => (
                                        <li key={cat.id}>
                                            <button
                                                onClick={() =>
                                                    visit({
                                                        category: cat.name,
                                                    })
                                                }
                                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${activeCategory === cat.name ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                            >
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Sort */}
                            <div>
                                <h3 className="mb-3 text-sm font-bold tracking-wide text-foreground uppercase">
                                    Urutkan
                                </h3>
                                <ul className="space-y-1.5">
                                    {SORT_OPTIONS.map(({ value, label }) => (
                                        <li key={value}>
                                            <button
                                                onClick={() =>
                                                    visit({ sort: value })
                                                }
                                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${activeSort === value ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                            >
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                                                {label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>

                        {/* ── Main Content ── */}
                        <div className="min-w-0 flex-1">
                            {/* Mobile filters */}
                            <div className="mb-5 flex items-center gap-3 lg:hidden">
                                <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <select
                                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    onChange={(e) =>
                                        visit({ category: e.target.value })
                                    }
                                    defaultValue={activeCategory}
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    onChange={(e) =>
                                        visit({ sort: e.target.value })
                                    }
                                    defaultValue={activeSort}
                                >
                                    {SORT_OPTIONS.map(({ value, label }) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Result count */}
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {courses.meta.total > 0
                                        ? `${courses.meta.total} course ditemukan`
                                        : 'Tidak ada course'}
                                    {activeCategory && (
                                        <span className="ml-1">
                                            di{' '}
                                            <strong className="text-foreground">
                                                {activeCategory}
                                            </strong>
                                        </span>
                                    )}
                                </p>
                                {activeCategory && (
                                    <button
                                        onClick={() => visit({ category: '' })}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Hapus filter
                                    </button>
                                )}
                            </div>

                            {/* Course Grid */}
                            {courses.data.length === 0 ? (
                                <ScrollReveal animation="fade-in">
                                    <div className="flex flex-col items-center justify-center py-24 text-center">
                                        <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
                                        <p className="text-base font-medium text-foreground">
                                            Tidak ada course ditemukan
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Coba kata kunci atau kategori lain
                                        </p>
                                        <button
                                            onClick={() =>
                                                router.visit('/courses')
                                            }
                                            className="mt-4 text-sm font-medium text-primary hover:underline"
                                        >
                                            Reset filter
                                        </button>
                                    </div>
                                </ScrollReveal>
                            ) : (
                                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {courses.data.map((course, index) => {
                                        const delays = [
                                            100, 150, 200, 250, 300, 350,
                                        ] as const;
                                        const delay =
                                            delays[index % delays.length];

                                        return (
                                            <ScrollReveal
                                                key={course.id}
                                                animation="scale-in"
                                                delay={delay}
                                                className="h-full"
                                            >
                                                <CourseCard
                                                    course={course}
                                                    isPurchased={purchasedCourseIds.includes(
                                                        course.id,
                                                    )}
                                                    isLoggedIn={isLoggedIn}
                                                    showRating={false}
                                                />
                                            </ScrollReveal>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {courses.meta.last_page > 1 &&
                                (() => {
                                    const currentPage =
                                        courses.meta.current_page;
                                    const lastPage = courses.meta.last_page;

                                    const getPages = () => {
                                        const pages = [];
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
                                                pages[pages.length - 1] !==
                                                '...'
                                            ) {
                                                pages.push('...');
                                            }
                                        }

                                        return pages;
                                    };

                                    const handlePageClick = (
                                        pageVal: number | string,
                                    ) => {
                                        if (typeof pageVal === 'number') {
                                            const q = new URLSearchParams(
                                                window.location.search,
                                            );
                                            q.set('page', String(pageVal));
                                            router.visit(
                                                `/courses?${q.toString()}`,
                                            );
                                        }
                                    };

                                    return (
                                        <div className="mt-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                                            {/* Prev Button */}
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

                                            {/* Page Numbers */}
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

                                                const isActive =
                                                    p === currentPage;

                                                return (
                                                    <button
                                                        key={`page-${p}`}
                                                        onClick={() =>
                                                            handlePageClick(p)
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

                                            {/* Next Button */}
                                            <button
                                                onClick={() =>
                                                    handlePageClick(
                                                        Math.min(
                                                            lastPage,
                                                            currentPage + 1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    currentPage >= lastPage
                                                }
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
                    </div>
                </div>
            </section>
        </>
    );
}

export default function CoursesIndex() {
    const props = usePage().props as unknown as CoursesIndexProps & {
        auth: PublicAuth;
    };
    const isLoggedIn = Boolean(props.auth?.user);

    if (isLoggedIn) {
        // User login: render dalam AppLayout + breadcrumb (tanpa PublicNavbar/Footer publik)
        return <CatalogContent />;
    }

    // Guest: tampilkan navbar & footer publik
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicNavbar />
            <main className="flex-1">
                <CatalogContent />
            </main>
            <PublicFooter />
        </div>
    );
}

CoursesIndex.layout = (page: React.ReactNode) => {
    // Akses props dari page element yang di-pass Inertia
    const props = (page as any).props as CoursesIndexProps & {
        auth: PublicAuth;
    };
    const isLoggedIn = Boolean(props?.auth?.user);

    if (isLoggedIn) {
        return (
            <AppLayout
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Katalog Courses', href: '/courses' },
                ]}
            >
                {page}
            </AppLayout>
        );
    }

    // Guest: tidak ada AppLayout, render langsung
    return <>{page}</>;
};
