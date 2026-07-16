import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    ShieldCheck,
    Copy,
    FileText,
    CheckCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Course {
    id: number;
    title: string;
    slug: string;
    contents_count: number;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    discount_amount: number;
    net_amount: number;
    status: 'pending' | 'paid' | 'cancel' | 'expired';
    payment_url: string | null;
    payment_reference: string | null;
    channel_group: string | null;
    channel_name: string | null;
    valid_until: string | null;
    paid_at: string | null;
    created_at: string;
    product: {
        id: number;
        title: string;
        courses: Course[];
    };
}

interface OrdersShowProps {
    order: Order;
    auth: {
        user: { email: string } | null;
    };
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

export default function OrdersShow({ order, auth }: OrdersShowProps) {
    const isPending = order.status === 'pending';
    const isPaid = order.status === 'paid';
    const isCancel = order.status === 'cancel';
    const isExpired = order.status === 'expired';

    const courses = order.product?.courses || [];
    const firstCourse = courses[0];
    const userEmail = auth?.user?.email || 'user@rakryancoding.id';

    const [activeTab, setActiveTab] = useState<'va' | 'qris'>('va');
    const [copied, setCopied] = useState(false);

    // Countdown Timer: pakai valid_until asli dari invoice Xendit,
    // fallback 24 jam dari order dibuat untuk order lama yang belum punya valid_until.
    const [timeLeft, setTimeLeft] = useState('23:59:59');

    // Poll halaman ini selagi pending — begitu webhook Xendit mengubah status,
    // props ter-refresh otomatis dan tampilan pindah ke state sukses tanpa reload manual.
    const { stop: stopPolling } = usePoll(5000);

    useEffect(() => {
        if (!isPending) {
            stopPolling();

            return;
        }

        const expiryTime = order.valid_until
            ? new Date(order.valid_until).getTime()
            : new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = expiryTime - now;

            if (difference <= 0) {
                setTimeLeft('00:00:00');
                clearInterval(timer);
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                const pad = (num: number) => String(num).padStart(2, '0');
                setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [order.created_at, order.valid_until, isPending, stopPolling]);

    function handleCopy() {
        navigator.clipboard.writeText('8077 0420 2026 0084');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleMockPay() {
        // Redirection simulator mock pay lunas
        router.get(
            `/orders/${order.id}?mock_pay=1`,
            {},
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title={`Order #${order.order_number}`} />

            <div className="flex min-h-screen flex-col bg-[#fcfcfd] font-sans text-foreground dark:bg-background">
                {/* Secure Top Bar */}
                <div className="flex items-center justify-center gap-1.5 border-b border-white/5 bg-[#1e1b4b] py-2.5 text-center text-xs text-white/80 print:hidden">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#eab308]" />
                    <span>Pembayaran aman</span>
                </div>

                <main className="flex-1 py-10">
                    <div className="mx-auto max-w-4xl px-6 lg:px-8">
                        {/* ─── Step progress bar indicator ─── */}
                        <div className="mb-10 flex items-center justify-center gap-4 border-b border-border/40 pb-6 text-xs font-semibold sm:text-sm print:hidden">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold">
                                    ✓
                                </span>
                                <span>Detail produk</span>
                            </div>
                            <div className="h-px w-12 bg-emerald-600/30" />
                            <div className="flex items-center gap-2 text-emerald-600">
                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                        isPaid
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : 'bg-primary text-white'
                                    }`}
                                >
                                    {isPaid ? '✓' : '2'}
                                </span>
                                <span>
                                    {isPaid ? 'Bayar' : 'Selesaikan pembayaran'}
                                </span>
                            </div>
                            <div className="h-px w-12 bg-border" />
                            <div
                                className={`flex items-center gap-2 ${isPaid ? 'text-emerald-600' : 'text-muted-foreground'}`}
                            >
                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                        isPaid
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {isPaid ? '✓' : '3'}
                                </span>
                                <span>Akses terbuka</span>
                            </div>
                        </div>

                        {/* ─── PENDING PAYMENT STATE (Page 13) ─── */}
                        {isPending && (
                            <div className="space-y-6">
                                {/* Expiry Warning Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm font-bold text-red-600 sm:text-base">
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Selesaikan sebelum pesanan kadaluarsa
                                    </span>
                                    <span className="font-mono text-lg">
                                        {timeLeft}
                                    </span>
                                </div>

                                {/* Order Number & Total Price Box */}
                                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
                                    <div>
                                        <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            NOMOR PESANAN
                                        </span>
                                        <span className="font-mono text-base font-bold text-foreground">
                                            {order.order_number}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                            TOTAL TAGIHAN
                                        </span>
                                        <span className="text-xl font-extrabold text-primary">
                                            {formatPrice(order.net_amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Main Payment Panel */}
                                <Card className="overflow-hidden border-border/50 shadow-sm">
                                    <CardContent className="space-y-6 p-6">
                                        {/* Tabs Selector */}
                                        <div className="flex border-b border-border/40 pb-2">
                                            <button
                                                onClick={() =>
                                                    setActiveTab('va')
                                                }
                                                className={`flex-1 border-b-2 pb-3 text-center text-sm font-bold transition-all ${
                                                    activeTab === 'va'
                                                        ? 'border-[#eab308] text-foreground'
                                                        : 'border-transparent text-muted-foreground'
                                                }`}
                                            >
                                                Virtual Account
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setActiveTab('qris')
                                                }
                                                className={`flex-1 border-b-2 pb-3 text-center text-sm font-bold transition-all ${
                                                    activeTab === 'qris'
                                                        ? 'border-transparent text-muted-foreground'
                                                        : 'border-transparent text-muted-foreground'
                                                }`}
                                            >
                                                QRIS
                                            </button>
                                        </div>

                                        {/* Virtual Account Panel */}
                                        {activeTab === 'va' && (
                                            <div className="space-y-6">
                                                {/* Bank VA Box */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-blue-600/10 text-xs font-extrabold text-blue-600 shadow-xs">
                                                        BCA
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-extrabold text-foreground">
                                                            BCA Virtual Account
                                                        </h4>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            Transfer otomatis
                                                            dari m-BCA atau ATM
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* VA Number Card */}
                                                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-5.5">
                                                    <div>
                                                        <span className="block text-[10px] font-medium text-muted-foreground uppercase">
                                                            Nomor Virtual
                                                            Account
                                                        </span>
                                                        <strong className="mt-1 block font-mono text-xl tracking-widest text-foreground sm:text-2xl">
                                                            8077 0420 2026 0084
                                                        </strong>
                                                    </div>
                                                    <Button
                                                        onClick={handleCopy}
                                                        variant="outline"
                                                        className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                        {copied
                                                            ? 'Tersalin!'
                                                            : 'Salin'}
                                                    </Button>
                                                </div>

                                                {/* Instructions */}
                                                <div className="space-y-3">
                                                    <span className="block text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                                        Cara bayar via m-BCA:
                                                    </span>
                                                    <ol className="space-y-2 text-xs text-muted-foreground sm:text-sm">
                                                        <li className="flex items-start gap-2.5">
                                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                                                1
                                                            </span>
                                                            <span>
                                                                Buka aplikasi
                                                                m-BCA ➔{' '}
                                                                <strong>
                                                                    m-Transfer
                                                                </strong>{' '}
                                                                ➔{' '}
                                                                <strong>
                                                                    BCA Virtual
                                                                    Account
                                                                </strong>
                                                            </span>
                                                        </li>
                                                        <li className="flex items-start gap-2.5">
                                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                                                2
                                                            </span>
                                                            <span>
                                                                Masukkan nomor
                                                                VA di atas, lalu
                                                                klik{' '}
                                                                <strong>
                                                                    Send
                                                                </strong>
                                                            </span>
                                                        </li>
                                                        <li className="flex items-start gap-2.5">
                                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                                                3
                                                            </span>
                                                            <span>
                                                                Konfirmasi nama
                                                                & nominal —
                                                                harus persis{' '}
                                                                <strong>
                                                                    {formatPrice(
                                                                        order.net_amount,
                                                                    )}
                                                                </strong>
                                                            </span>
                                                        </li>
                                                        <li className="flex items-start gap-2.5">
                                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                                                                4
                                                            </span>
                                                            <span>
                                                                Masukkan PIN,
                                                                tunggu
                                                                notifikasi
                                                                berhasil
                                                            </span>
                                                        </li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Check Note */}
                                        <div className="flex items-center gap-2 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5 text-xs text-amber-800 sm:text-sm dark:text-amber-300">
                                            <div className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                                            <span>
                                                Halaman ini cek status
                                                pembayaran otomatis tiap 10
                                                detik...
                                            </span>
                                        </div>

                                        {/* Simulator Button (Mock Developer Gateway) */}
                                        <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row">
                                            <Button
                                                onClick={handleMockPay}
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#B99430] py-5 text-xs font-bold text-white shadow-sm hover:bg-[#725a15]"
                                            >
                                                Simulasi: pembayaran sukses ➔
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-xl py-5 text-xs font-bold"
                                                asChild
                                            >
                                                <Link href="/courses">
                                                    Ganti metode
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="pt-2 text-center">
                                    <span className="text-xs text-muted-foreground">
                                        Butuh bantuan?{' '}
                                        <a
                                            href="https://wa.me/6281234567890"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold underline hover:text-primary"
                                        >
                                            Chat CS kami
                                        </a>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ─── PAID / SUCCESS STATE (Page 14) ─── */}
                        {isPaid && (
                            <div className="space-y-6">
                                {/* Success Header Box */}
                                <div className="flex flex-col items-center space-y-4 rounded-3xl border border-emerald-500/15 bg-emerald-500/5 p-6 py-10 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shadow-sm">
                                        <CheckCircle className="h-9 w-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h2 className="text-2xl font-extrabold text-foreground">
                                            Pembayaran diterima! 🎉
                                        </h2>
                                        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                            Akses ke semua materi di paketmu
                                            sudah dibuka. Langsung mulai
                                            belajar!
                                        </p>
                                    </div>
                                </div>

                                {/* Order Invoice Info */}
                                <Card className="border-border/50 shadow-sm">
                                    <CardContent className="space-y-6 p-6">
                                        <div>
                                            <h3 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                RINGKASAN PESANAN
                                            </h3>
                                            <div className="space-y-3.5 text-xs sm:text-sm">
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">
                                                        No. pesanan
                                                    </span>
                                                    <span className="font-mono font-bold text-foreground">
                                                        {order.order_number}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">
                                                        Produk
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {order.product?.title ||
                                                            'Paket Jago'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">
                                                        Metode bayar
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {order.channel_name ||
                                                            order.channel_group ||
                                                            '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">
                                                        Waktu bayar
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {order.paid_at
                                                            ? new Date(
                                                                  order.paid_at,
                                                              ).toLocaleString(
                                                                  'id-ID',
                                                                  {
                                                                      day: 'numeric',
                                                                      month: 'short',
                                                                      year: 'numeric',
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                  },
                                                              )
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-1 text-base font-extrabold">
                                                    <span className="text-foreground">
                                                        Total dibayar
                                                    </span>
                                                    <span className="text-primary">
                                                        {formatPrice(
                                                            order.net_amount,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Opened Courses List */}
                                        <div className="space-y-4 border-t border-border/40 pt-6">
                                            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                {courses.length} materi terbuka
                                            </h4>

                                            <div className="grid gap-3.5">
                                                {courses.map((c) => (
                                                    <div
                                                        key={c.id}
                                                        className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                            <div>
                                                                <h5 className="text-xs leading-snug font-bold text-foreground sm:text-sm">
                                                                    {c.title}
                                                                </h5>
                                                                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                                                    {
                                                                        c.contents_count
                                                                    }{' '}
                                                                    bab
                                                                    pembelajaran
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="rounded-lg text-xs font-bold text-primary hover:bg-primary/10 print:hidden"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/courses/${c.slug}`}
                                                            >
                                                                Mulai ➔
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row print:hidden">
                                            {firstCourse && (
                                                <Button
                                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#B99430] py-5 text-xs font-bold text-white hover:bg-[#725a15]"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/courses/${firstCourse.slug}`}
                                                    >
                                                        Mulai belajar sekarang
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => window.print()}
                                                variant="outline"
                                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-5 text-xs font-bold"
                                            >
                                                <FileText className="h-4 w-4" />
                                                Cetak invoice
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="pt-2 text-center print:hidden">
                                    <span className="text-xs text-muted-foreground">
                                        Invoice dikirim ke{' '}
                                        <strong>{userEmail}</strong> • Ada
                                        pertanyaan?{' '}
                                        <a
                                            href="https://wa.me/6281234567890"
                                            className="font-semibold underline hover:text-primary"
                                        >
                                            Hubungi kami
                                        </a>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ─── CANCELLED / EXPIRED STATE ─── */}
                        {(isCancel || isExpired) && (
                            <Card className="border-border/50 py-16 text-center">
                                <CardContent className="space-y-4">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                        <AlertCircle className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-extrabold text-foreground">
                                            {isCancel
                                                ? 'Transaksi Dibatalkan'
                                                : 'Transaksi Kedaluwarsa'}
                                        </h3>
                                        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                            Transaksi ini tidak dapat
                                            dilanjutkan karena statusnya sudah
                                            tidak aktif. Silakan pilih materi
                                            kembali di Katalog untuk melakukan
                                            pemesanan ulang.
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <Button
                                            asChild
                                            className="rounded-xl py-2.5 font-bold"
                                        >
                                            <Link href="/courses">
                                                Kembali ke Katalog
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

OrdersShow.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Riwayat Pesanan', href: '/orders' },
            { title: 'Status Pembayaran', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
