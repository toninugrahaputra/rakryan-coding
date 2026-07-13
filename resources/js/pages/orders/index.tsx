import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Calendar, CreditCard, Clock, FileText, Play, RotateCcw } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    discount_amount: number;
    net_amount: number;
    status: 'pending' | 'paid' | 'cancel' | 'expired';
    payment_url: string | null;
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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

export default function OrdersIndex({ orders }: OrdersIndexProps) {
    const allOrders = orders.data;

    // Filter tab state
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'cancel'>('all');

    // Filter counts computed
    const countAll = allOrders.length;
    const countPending = allOrders.filter((o) => o.status === 'pending').length;
    const countPaid = allOrders.filter((o) => o.status === 'paid').length;
    const countCancel = allOrders.filter((o) => o.status === 'cancel' || o.status === 'expired').length;

    const filteredOrders = allOrders.filter((o) => {
        if (activeTab === 'pending') return o.status === 'pending';
        if (activeTab === 'paid') return o.status === 'paid';
        if (activeTab === 'cancel') return o.status === 'cancel' || o.status === 'expired';
        return true;
    });

    return (
        <>
            <Head title="Riwayat Pesanan — Rakryan Coding" />

            <div className="space-y-6 max-w-4xl mx-auto font-sans">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Riwayat Pesanan</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Semua transaksi & status pembayaranmu ada di sini.
                    </p>
                </div>

                {/* Filter Tabs (BWA Page 26) */}
                <div className="flex border-b border-border/40 pb-2 flex-wrap gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-2.5 px-3 border-b-2 transition-all ${activeTab === 'all' ? 'border-[#eab308] text-foreground font-bold' : 'border-transparent hover:text-foreground'
                            }`}
                    >
                        Semua ({countAll})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-2.5 px-3 border-b-2 transition-all ${activeTab === 'pending' ? 'border-[#eab308] text-foreground font-bold' : 'border-transparent hover:text-foreground'
                            }`}
                    >
                        Menunggu ({countPending})
                    </button>
                    <button
                        onClick={() => setActiveTab('paid')}
                        className={`pb-2.5 px-3 border-b-2 transition-all ${activeTab === 'paid' ? 'border-[#eab308] text-foreground font-bold' : 'border-transparent hover:text-foreground'
                            }`}
                    >
                        Berhasil ({countPaid})
                    </button>
                    <button
                        onClick={() => setActiveTab('cancel')}
                        className={`pb-2.5 px-3 border-b-2 transition-all ${activeTab === 'cancel' ? 'border-[#eab308] text-foreground font-bold' : 'border-transparent hover:text-foreground'
                            }`}
                    >
                        Dibatalkan ({countCancel})
                    </button>
                </div>

                {/* Orders List Container */}
                {filteredOrders.length === 0 ? (
                    <Card className="border-border/50 text-center py-16">
                        <CardContent className="space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Receipt className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <h3 className="font-bold text-foreground">Tidak ada pesanan</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                                Belum ada riwayat transaksi untuk kategori status pembayaran ini.
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
                            const courseNames = order.product?.courses?.map((c) => c.title).join(', ') || 'Untitled Course';
                            const firstCourseSlug = order.product?.courses[0]?.slug;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xs hover:border-border/80 transition-all space-y-4 p-5"
                                >
                                    {/* Card Header: Order Number, Date, Status Badge */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold text-foreground tracking-wider uppercase">
                                                {order.order_number}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
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
                                        <div className="h-14 w-20 shrink-0 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-center font-bold text-[#eab308] text-xs">
                                            &lt;/&gt;
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[9px] font-bold text-primary uppercase block tracking-wider">
                                                PAKET • {order.product?.courses?.length || 1} MATERI
                                            </span>
                                            <h4 className="text-sm font-extrabold text-foreground leading-snug mt-0.5 truncate">
                                                {order.product?.title || 'Paket Jago'}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                BCA Virtual Account {order.discount_amount > 0 ? '• voucher NGODING40' : ''}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-sm font-extrabold text-foreground block">
                                                {formatPrice(order.net_amount)}
                                            </span>
                                            {order.discount_amount > 0 && (
                                                <span className="text-[9px] text-emerald-600 block mt-0.5">
                                                    setelah diskon {Math.round((order.discount_amount / (order.net_amount + order.discount_amount)) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Action Bar */}
                                    <div className="border-t border-border/40 pt-4 flex flex-wrap items-center justify-between gap-4">
                                        {isPending && (
                                            <>
                                                <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Bayar sebelum 23:59:00
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="rounded-lg text-xs font-bold bg-[#B99430] hover:bg-[#725a15] text-white" asChild>
                                                        <Link href={`/orders/${order.id}`}>
                                                            Lanjutkan pembayaran
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold">
                                                        Batalkan
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        {isPaid && (
                                            <>
                                                <span className="text-[10px] text-muted-foreground font-semibold">
                                                    Pembayaran terverifikasi otomatis
                                                </span>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold flex items-center gap-1" asChild>
                                                        <Link href={`/orders/${order.id}`}>
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Invoice
                                                        </Link>
                                                    </Button>
                                                    {firstCourseSlug && (
                                                        <Button size="sm" className="rounded-lg text-xs font-bold bg-[#B99430] hover:bg-[#725a15] text-white flex items-center gap-1" asChild>
                                                            <Link href={`/courses/${firstCourseSlug}`}>
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
                                                <span className="text-[10px] text-muted-foreground font-semibold">
                                                    {isCancel ? 'Pemesanan dibatalkan' : 'Pemesanan kadaluarsa'}
                                                </span>
                                                <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold flex items-center gap-1" asChild>
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
