import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Activity,
    BookOpen,
    CheckCircle2,
    Clock3,
    DollarSign,
    Layers,
    Package,
    ShoppingBag,
    Sparkles,
    Ticket,
    TrendingUp,
    UserPlus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/internal';

interface LatestUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface LatestOrder {
    id: number;
    order_number: string;
    user_name: string;
    product_title: string;
    net_amount: number;
    status: 'pending' | 'paid' | 'cancel' | 'expired';
    created_at: string;
}

interface BestSelling {
    title: string;
    sales_count: number;
    price: number;
}

interface ChartItem {
    label: string;
    sales: number;
    registrations: number;
}

type AdminDashboardProps = {
    stats: {
        users: number;
        courses: number;
        products: number;
        categories: number;
        vouchers: number;
        orders: number;
        paid_orders: number;
        pending_orders: number;
        total_materi: number;
        total_pendapatan: number;
        best_selling: BestSelling[];
        latest_users: LatestUser[];
        latest_orders: LatestOrder[];
        chart_data: ChartItem[];
    };
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const },
    paid: { label: 'Paid', variant: 'default' as const },
    cancel: { label: 'Cancel', variant: 'destructive' as const },
    expired: { label: 'Expired', variant: 'destructive' as const },
};

export default function AdminDashboard() {
    const { stats } = usePage<AdminDashboardProps>().props;

    const statCards = [
        {
            label: 'Total Pendapatan',
            value: formatPrice(stats.total_pendapatan),
            icon: DollarSign,
        },
        { label: 'Total Users', value: stats.users, icon: UserPlus },
        { label: 'Total Courses', value: stats.courses, icon: BookOpen },
        { label: 'Total Materi', value: stats.total_materi, icon: Sparkles },
    ];

    const subStatCards = [
        { label: 'Total Orders', value: stats.orders, icon: ShoppingBag },
        { label: 'Paid Orders', value: stats.paid_orders, icon: CheckCircle2 },
        { label: 'Pending Orders', value: stats.pending_orders, icon: Clock3 },
        { label: 'Vouchers', value: stats.vouchers, icon: Ticket },
        { label: 'Products', value: stats.products, icon: Package },
        { label: 'Categories', value: stats.categories, icon: Layers },
    ];

    const maxSales = Math.max(...stats.chart_data.map((d) => d.sales), 1);
    const maxRegs = Math.max(
        ...stats.chart_data.map((d) => d.registrations),
        1,
    );

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                <div>
                    <h1 className="text-xl font-semibold sm:text-2xl">
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ringkasan metrik utama dan performa platform Rakryan
                        Coding.
                    </p>
                </div>

                {/* ─── Stat Cards ─── */}
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    {statCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card key={card.label} className="py-3 sm:py-6">
                                <CardContent className="flex items-center gap-3 px-4 sm:gap-4 sm:px-6">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {card.label}
                                        </p>
                                        <p className="truncate text-xl font-bold text-foreground">
                                            {card.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* ─── Charts ─── */}
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                    <Card className="py-4 sm:py-6">
                        <CardContent className="px-4 sm:px-6">
                            <div className="mb-4 flex items-center justify-between sm:mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Tren Pendapatan
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Pendapatan sukses bulanan (6 bulan
                                        terakhir)
                                    </p>
                                </div>
                                <TrendingUp className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                            </div>

                            <div className="overflow-x-auto">
                                <div className="h-56 w-full min-w-[480px]">
                                    <svg
                                        className="h-full w-full"
                                        viewBox="0 0 500 200"
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="salesGrad"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="var(--color-primary)"
                                                    stopOpacity="0.2"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="var(--color-primary)"
                                                    stopOpacity="0"
                                                />
                                            </linearGradient>
                                        </defs>

                                        <line
                                            x1="0"
                                            y1="20"
                                            x2="500"
                                            y2="20"
                                            stroke="currentColor"
                                            className="text-border/40"
                                            strokeDasharray="4"
                                        />
                                        <line
                                            x1="0"
                                            y1="80"
                                            x2="500"
                                            y2="80"
                                            stroke="currentColor"
                                            className="text-border/40"
                                            strokeDasharray="4"
                                        />
                                        <line
                                            x1="0"
                                            y1="140"
                                            x2="500"
                                            y2="140"
                                            stroke="currentColor"
                                            className="text-border/40"
                                            strokeDasharray="4"
                                        />
                                        <line
                                            x1="0"
                                            y1="190"
                                            x2="500"
                                            y2="190"
                                            stroke="currentColor"
                                            className="text-border"
                                        />

                                        <path
                                            d={
                                                `M 0 190 ` +
                                                stats.chart_data
                                                    .map((d, i) => {
                                                        const x = (i / 5) * 500;
                                                        const y =
                                                            190 -
                                                            (d.sales /
                                                                maxSales) *
                                                                160;

                                                        return `L ${x} ${y}`;
                                                    })
                                                    .join(' ') +
                                                ` L 500 190 Z`
                                            }
                                            fill="url(#salesGrad)"
                                        />

                                        <path
                                            d={stats.chart_data
                                                .map((d, i) => {
                                                    const x = (i / 5) * 500;
                                                    const y =
                                                        190 -
                                                        (d.sales / maxSales) *
                                                            160;

                                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                                })
                                                .join(' ')}
                                            fill="none"
                                            stroke="var(--color-primary)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />

                                        {stats.chart_data.map((d, i) => {
                                            const x = (i / 5) * 500;
                                            const y =
                                                190 -
                                                (d.sales / maxSales) * 160;

                                            return (
                                                <circle
                                                    key={i}
                                                    cx={x}
                                                    cy={y}
                                                    r="4.5"
                                                    fill="var(--color-primary)"
                                                    stroke="var(--color-card)"
                                                    strokeWidth="2"
                                                />
                                            );
                                        })}
                                    </svg>

                                    <div className="mt-3 flex justify-between px-1 text-[11px] font-medium text-muted-foreground">
                                        {stats.chart_data.map((d, i) => (
                                            <div
                                                key={i}
                                                className="w-12 truncate text-center"
                                            >
                                                <div>{d.label}</div>
                                                <div className="mt-0.5 text-foreground">
                                                    {formatPrice(d.sales)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-4 sm:py-6">
                        <CardContent className="px-4 sm:px-6">
                            <div className="mb-4 flex items-center justify-between sm:mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        Pendaftaran User
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Registrasi akun baru (6 bulan terakhir)
                                    </p>
                                </div>
                                <Activity className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
                            </div>

                            <div className="overflow-x-auto">
                                <div className="h-56 w-full min-w-[480px]">
                                    <svg
                                        className="h-full w-full"
                                        viewBox="0 0 500 200"
                                        preserveAspectRatio="none"
                                    >
                                        <line
                                            x1="0"
                                            y1="20"
                                            x2="500"
                                            y2="20"
                                            stroke="currentColor"
                                            className="text-border/40"
                                            strokeDasharray="4"
                                        />
                                        <line
                                            x1="0"
                                            y1="80"
                                            x2="500"
                                            y2="80"
                                            stroke="currentColor"
                                            className="text-border/40"
                                            strokeDasharray="4"
                                        />
                                        <line
                                            x1="0"
                                            y1="140"
                                            x2="500"
                                            y2="140"
                                            stroke="currentColor"
                                            className="text-border/40"
                                            strokeDasharray="4"
                                        />
                                        <line
                                            x1="0"
                                            y1="190"
                                            x2="500"
                                            y2="190"
                                            stroke="currentColor"
                                            className="text-border"
                                        />

                                        {stats.chart_data.map((d, i) => {
                                            const width = 36;
                                            const x =
                                                (i / 5) * 440 + 30 - width / 2;
                                            const barHeight =
                                                (d.registrations / maxRegs) *
                                                160;
                                            const y = 190 - barHeight;

                                            return (
                                                <rect
                                                    key={i}
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={barHeight}
                                                    rx="5"
                                                    fill="var(--color-primary)"
                                                    className="opacity-80 transition-opacity hover:opacity-100"
                                                />
                                            );
                                        })}
                                    </svg>

                                    <div className="mt-3 flex justify-between px-1 text-[11px] font-medium text-muted-foreground">
                                        {stats.chart_data.map((d, i) => (
                                            <div
                                                key={i}
                                                className="w-12 truncate text-center"
                                            >
                                                <div>{d.label}</div>
                                                <div className="mt-0.5 text-foreground">
                                                    {d.registrations} user
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Sub Stats ─── */}
                <div className="grid grid-cols-2 gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4 md:grid-cols-3 lg:grid-cols-6">
                    {subStatCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.label}
                                className="flex items-center gap-2.5 rounded-lg border p-2.5 sm:gap-3 sm:p-3"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                                    <Icon className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-muted-foreground">
                                        {card.label}
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ─── Latest Users & Orders ─── */}
                <div className="grid gap-4 sm:gap-6 xl:grid-cols-12">
                    <div className="rounded-xl border xl:col-span-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    User Terbaru
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Akun pendaftaran terbaru
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href="/internal/users"
                                    className="inline-flex items-center gap-1"
                                >
                                    Lihat semua{' '}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="divide-y">
                            {stats.latest_users.length === 0 ? (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    Belum ada user terdaftar.
                                </p>
                            ) : (
                                stats.latest_users.map((u) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between gap-3 p-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                {u.name[0]?.toUpperCase() ||
                                                    'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="block truncate text-sm font-medium">
                                                    {u.name}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {u.email}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {u.created_at}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border xl:col-span-7">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Aktivitas Pemesanan
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Riwayat transaksi terbaru masuk
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href="/internal/orders"
                                    className="inline-flex items-center gap-1"
                                >
                                    Semua transaksi{' '}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Order</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Paket</TableHead>
                                    <TableHead className="text-right">
                                        Harga
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.latest_orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada pemesanan masuk.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.latest_orders.map((o) => (
                                        <TableRow key={o.id}>
                                            <TableCell className="font-mono text-xs font-medium">
                                                {o.order_number}
                                            </TableCell>
                                            <TableCell
                                                className="max-w-[120px] truncate"
                                                title={o.user_name}
                                            >
                                                {o.user_name}
                                            </TableCell>
                                            <TableCell
                                                className="max-w-[140px] truncate"
                                                title={o.product_title}
                                            >
                                                {o.product_title}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatPrice(o.net_amount)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        statusConfig[o.status]
                                                            .variant
                                                    }
                                                >
                                                    {
                                                        statusConfig[o.status]
                                                            .label
                                                    }
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* ─── Best Selling ─── */}
                <div className="rounded-xl border p-4 sm:p-5">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold">
                            Produk &amp; Paket Terlaris
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Paket materi dengan angka transaksi tertinggi
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {stats.best_selling.length === 0 ? (
                            <p className="col-span-5 py-6 text-center text-sm text-muted-foreground">
                                Belum ada data penjualan produk.
                            </p>
                        ) : (
                            stats.best_selling.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="relative rounded-lg border p-4"
                                >
                                    <Badge
                                        variant="secondary"
                                        className="absolute top-3 right-3"
                                    >
                                        #{idx + 1}
                                    </Badge>
                                    <div className="space-y-1.5 pt-1">
                                        <span className="block text-xs font-semibold text-primary">
                                            PAKET BELAJAR
                                        </span>
                                        <h4
                                            className="line-clamp-2 text-sm font-semibold"
                                            title={item.title}
                                        >
                                            {item.title}
                                        </h4>
                                        <div className="pt-1 text-sm font-semibold">
                                            {formatPrice(item.price)}
                                        </div>
                                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            {item.sales_count} Penjualan
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Admin Dashboard', href: dashboard.url() }],
};
