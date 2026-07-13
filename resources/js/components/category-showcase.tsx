import { Link } from '@inertiajs/react';
import {
    Code2,
    BarChart2,
    Palette,
    Briefcase,
    Camera,
    Music,
    Globe,
    BookOpen,
} from 'lucide-react';

interface CategoryProps {
    category: {
        id: number;
        name: string;
        courses_count: number;
    };
}

interface CategoryShowcaseProps {
    categories: CategoryProps['category'][];
}

const categoryIcons: Record<string, React.ElementType> = {
    'web development': Code2,
    'data science': BarChart2,
    'design': Palette,
    'business': Briefcase,
    'photography': Camera,
    'music': Music,
    'language': Globe,
    'default': BookOpen,
};

function getCategoryIcon(name: string): React.ElementType {
    const key = name.toLowerCase();
    for (const [k, icon] of Object.entries(categoryIcons)) {
        if (key.includes(k)) return icon;
    }
    return categoryIcons['default'];
}

const categoryColors = [
    'from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400',
    'from-blue-500/20 to-cyan-500/10 text-blue-600 dark:text-blue-400',
    'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    'from-orange-500/20 to-amber-500/10 text-orange-600 dark:text-orange-400',
    'from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400',
    'from-indigo-500/20 to-blue-500/10 text-indigo-600 dark:text-indigo-400',
    'from-teal-500/20 to-green-500/10 text-teal-600 dark:text-teal-400',
    'from-yellow-500/20 to-amber-500/10 text-yellow-600 dark:text-yellow-400',
];

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
    if (categories.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-muted-foreground">Belum ada kategori tersedia.</p>
            </div>
        );
    }

    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mb-14 text-center">
                    <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        Kategori course
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Jelajahi Bidang yang Kamu Minati
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Pilih kategori dan temukan course yang tepat untuk kariermu
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {categories.map((category, index) => {
                        const Icon = getCategoryIcon(category.name);
                        const colorClass = categoryColors[index % categoryColors.length];

                        return (
                            <Link
                                key={category.id}
                                href={`/courses?category=${encodeURIComponent(category.name)}`}
                                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                            >
                                {/* Background gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${colorClass.split(' ').slice(0, 2).join(' ')}`} />

                                <div className="relative flex flex-col items-center gap-3">
                                    {/* Icon */}
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
                                        <Icon className={`h-7 w-7 ${colorClass.split(' ').slice(2).join(' ')}`} />
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary sm:text-base">
                                        {category.name}
                                    </h3>

                                    {/* Count */}
                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                        {category.courses_count} course
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}