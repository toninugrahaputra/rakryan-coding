import { Link } from '@inertiajs/react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';

interface FeaturedCourseProps {
    course: {
        id: number;
        title: string;
        slug: string;
        thumbnail: string | null;
        category: string | null;
        contents_count: number;
        created_at: string;
    };
}

interface FeaturedCoursesProps {
    courses: FeaturedCourseProps['course'][];
}

export function FeaturedCoursesShowcase({ courses }: FeaturedCoursesProps) {
    if (courses.length === 0) {
        return (
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">Belum ada course unggulan saat ini.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                            course Unggulan
                        </span>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Mulai Perjalanan Belajarmu
                        </h2>
                        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                            course pilihan terbaik untuk meningkatkan skill dan kariermu
                        </p>
                    </div>
                    <Link
                        href="/courses"
                        className="group flex shrink-0 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                        Lihat Semua course
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Courses Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-48 w-full overflow-hidden bg-muted">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
                                        <BookOpen className="h-10 w-10 text-primary/40" />
                                        <span className="text-xs text-muted-foreground">Tidak ada thumbnail</span>
                                    </div>
                                )}

                                {/* Category badge */}
                                {course.category && (
                                    <div className="absolute left-3 top-3">
                                        <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                            {course.category}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex flex-1 flex-col gap-3 p-5">
                                <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                                    {course.title}
                                </h3>

                                <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        <span>{course.contents_count} modul</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>
                                            {new Date(course.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'short',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover CTA */}
                            <div className="border-t border-border/50 px-5 py-3">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                                    Lihat Detail
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}