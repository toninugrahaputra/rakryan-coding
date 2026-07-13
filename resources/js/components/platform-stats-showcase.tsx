import { BookOpen, Users, Tag, TrendingUp } from 'lucide-react';

interface PlatformStatsProps {
    stats: {
        total_courses: number;
        total_students: number;
        total_categories: number;
    };
}

const statItems = (stats: PlatformStatsProps['stats']) => [
    {
        icon: BookOpen,
        value: stats.total_courses,
        label: 'course Tersedia',
        suffix: '+',
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
    },
    {
        icon: Users,
        value: stats.total_students,
        label: 'Pelajar Aktif',
        suffix: '+',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Tag,
        value: stats.total_categories,
        label: 'Kategori Bidang',
        suffix: '',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: TrendingUp,
        value: 98,
        label: 'Tingkat Kepuasan',
        suffix: '%',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
    },
];

function formatNumber(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
}

export function PlatformStatsShowcase({ stats }: PlatformStatsProps) {
    const items = statItems(stats);

    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mb-14 text-center">
                    <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        Kenapa Kami?
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Dipercaya Ribuan Pelajar
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Bergabunglah dengan komunitas belajar yang terus berkembang
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map(({ icon: Icon, value, label, suffix, color, bg }) => (
                        <div
                            key={label}
                            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* Subtle glow on hover */}
                            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${bg} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`} />

                            <div className="relative">
                                {/* Icon */}
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>

                                {/* Number */}
                                <div className={`text-4xl font-extrabold tracking-tight ${color}`}>
                                    {formatNumber(value)}
                                    <span className="text-2xl">{suffix}</span>
                                </div>

                                {/* Label */}
                                <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}