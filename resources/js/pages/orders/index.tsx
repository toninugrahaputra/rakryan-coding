import { Head, Link, router } from '@inertiajs/react';
import { Receipt, Clock, FileText, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cancel } from '@/actions/App/Http/Controllers/OrderController';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    discount_amount: number;
    net_amount: number;
    status: 'pending' | 'paid' | 'cancel' | 'expired';
    payment_url: string | null;
    valid_until: string | null;
    created_at: string;
    product: {
        id: number;
        title: string;
        courses: Array<{
            id: number;
            title: string;
            slug: string;
        }>;
    };
}

interface OrdersIndexProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

function formatCountdown(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((unit) => unit.toString().padStart(2, '0'))
        .join(':');
}

function PaymentCountdown({ validUntil }: { validUntil: string | null }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);

        return () => clearInterval(interval);
    }, []);

    if (!validUntil) {
        return (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                <Clock className="h-3.5 w-3.5" />
                Segera selesaikan pembayaran
            </span>
        );
    }

    const remaining = new Date(validUntil).getTime() - now;

    if (remaining <= 0) {
        return (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                <Clock className="h-3.5 w-3.5" />
                Waktu pembayaran telah habis
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
            <Clock className="h-3.5 w-3.5" />
            Bayar dalam {formatCountdown(remaining)}
        </span>
    );
}

export default function OrdersIndex({ orders }: OrdersIndexProps) {
    const allOrders = orders.data;
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    function handleCancel(orderId: number) {
        setCancellingId(orderId);
        router.patch(
            cancel(orderId).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setCancellingId(null),
            },
        );
    }

    // Filter tab state
    const [activeTab, setActiveTab] = useState<
        'all' | 'pending' | 'paid' | 'cancel'
    >('all');

    // Filter counts computed
    const countAll = allOrders.length;
    const countPending = allOrders.filter((o) => o.status === 'pending').length;
    const countPaid = allOrders.filter((o) => o.status === 'paid').length;
    const countCancel = allOrders.filter(
        (o) => o.status === 'cancel' || o.status === 'expired',
    ).length;

    const filteredOrders = allOrders.filter((o) => {
        if (activeTab === 'pending') {
            return o.status === 'pending';
        }

        if (activeTab === 'paid') {
            return o.status === 'paid';
        }

        if (activeTab === 'cancel') {
            return o.status === 'cancel' || o.status === 'expired';
        }

        return true;
    });

    return (
        <>
            <Head title="Riwayat Pesanan" />

            <div className="mx-auto max-w-4xl space-y-6 font-sans">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Riwayat Pesanan
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        Semua transaksi & status pembayaranmu ada di sini.
                    </p>
                </div>

                {/* Filter Tabs (BWA Page 26) */}
                <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2 text-xs font-semibold text-muted-foreground sm:text-sm">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'all'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Semua ({countAll})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'pending'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Menunggu ({countPending})
                    </button>
                    <button
                        onClick={() => setActiveTab('paid')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'paid'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Berhasil ({countPaid})
                    </button>
                    <button
                        onClick={() => setActiveTab('cancel')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'cancel'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Dibatalkan ({countCancel})
                    </button>
                </div>

                {/* Orders List Container */}
                {filteredOrders.length === 0 ? (
                    <Card className="border-border/50 py-16 text-center">
                        <CardContent className="space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Receipt className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <h3 className="font-bold text-foreground">
                                Tidak ada pesanan
                            </h3>
                            <p className="mx-auto max-w-xs text-xs text-muted-foreground sm:text-sm">
                                Belum ada riwayat transaksi untuk kategori
                                status pembayaran ini.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const isPending = order.status === 'pending';
                            const isPaid = order.status === 'paid';
                            const isCancel = order.status === 'cancel';
                            const isExpired = order.status === 'expired';
                            const firstCourseSlug =
                                order.product?.courses[0]?.slug;

                            return (
                                <div
                                    key={order.id}
                                    className="space-y-4 overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-xs transition-all hover:border-border/80"
                                >
                                    {/* Card Header: Order Number, Date, Status Badge */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">
                                                {order.order_number}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        {isPending && (
                                            <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                Menunggu pembayaran
                                            </span>
                                        )}
                                        {isPaid && (
                                            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                Berhasil
                                            </span>
                                        )}
                                        {isCancel && (
                                            <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold text-destructive">
                                                Dibatalkan
                                            </span>
                                        )}
                                        {isExpired && (
                                            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                Kedaluwarsa
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Body: Details & Pricing */}
                                    <div className="flex gap-4">
                                        {/* Course Icon Placeholder */}
                                        <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-xs font-bold text-[#eab308]">
                                            &lt;/&gt;
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block text-[9px] font-bold tracking-wider text-primary uppercase">
                                                PAKET •{' '}
                                                {order.product?.courses
                                                    ?.length || 1}{' '}
                                                MATERI
                                            </span>
                                            <h4 className="mt-0.5 truncate text-sm leading-snug font-extrabold text-foreground">
                                                {order.product?.title ||
                                                    'Paket Jago'}
                                            </h4>
                                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                BCA Virtual Account{' '}
                                                {order.discount_amount > 0
                                                    ? '• voucher NGODING40'
                                                    : ''}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="block text-sm font-extrabold text-foreground">
                                                {formatPrice(order.net_amount)}
                                            </span>
                                            {order.discount_amount > 0 && (
                                                <span className="mt-0.5 block text-[9px] text-emerald-600">
                                                    setelah diskon{' '}
                                                    {Math.round(
                                                        (order.discount_amount /
                                                            (order.net_amount +
                                                                order.discount_amount)) *
                                                            100,
                                                    )}
                                                    %
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Action Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-4">
                                        {isPending && (
                                            <>
                                                <PaymentCountdown
                                                    validUntil={
                                                        order.valid_until
                                                    }
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="rounded-lg bg-[#B99430] text-xs font-bold text-white hover:bg-[#725a15]"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                        >
                                                            Lanjutkan pembayaran
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-lg text-xs font-bold"
                                                        disabled={
                                                            cancellingId ===
                                                            order.id
                                                        }
                                                        onClick={() =>
                                                            handleCancel(
                                                                order.id,
                                                            )
                                                        }
                                                    >
                                                        {cancellingId ===
                                                        order.id
                                                            ? 'Membatalkan...'
                                                            : 'Batalkan'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        {isPaid && (
                                            <>
                                                <span className="text-[10px] font-semibold text-muted-foreground">
                                                    Pembayaran terverifikasi
                                                    otomatis
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex items-center gap-1 rounded-lg text-xs font-bold"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Invoice
                                                        </Link>
                                                    </Button>
                                                    {firstCourseSlug && (
                                                        <Button
                                                            size="sm"
                                                            className="flex items-center gap-1 rounded-lg bg-[#B99430] text-xs font-bold text-white hover:bg-[#725a15]"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/courses/${firstCourseSlug}`}
                                                            >
                                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                                Lihat course
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {(isCancel || isExpired) && (
                                            <>
                                                <span className="text-[10px] font-semibold text-muted-foreground">
                                                    {isCancel
                                                        ? 'Pemesanan dibatalkan'
                                                        : 'Pemesanan kadaluarsa'}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex items-center gap-1 rounded-lg text-xs font-bold"
                                                    asChild
                                                >
                                                    <Link href="/courses">
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        Pesan lagi
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

OrdersIndex.layout = (page: React.ReactNode) => {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Riwayat Pesanan', href: '/orders' },
            ]}
        >
            {page}
        </AppLayout>
    );
};
