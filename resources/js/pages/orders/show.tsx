import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, Copy, FileText, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Course {
    id: number;
    title: string;
    slug: string;
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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
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

    // Countdown Timer: 24 jam dari order dibuat
    const [timeLeft, setTimeLeft] = useState('23:59:59');

    useEffect(() => {
        if (!isPending) {
            return;
        }

        const orderTime = new Date(order.created_at).getTime();
        const expiryTime = orderTime + 24 * 60 * 60 * 1000; // 24 jam

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
    }, [order.created_at, isPending]);

    function handleCopy() {
        navigator.clipboard.writeText('8077 0420 2026 0084');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleMockPay() {
        // Redirection simulator mock pay lunas
        router.get(`/orders/${order.id}?mock_pay=1`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Order #${order.order_number} — Rakryan Coding`} />

            <div className="flex min-h-screen flex-col bg-[#fcfcfd] dark:bg-background text-foreground font-sans">
                {/* Secure Top Bar */}
                <div className="bg-[#1e1b4b] text-white/80 py-2.5 text-center text-xs flex items-center justify-center gap-1.5 border-b border-white/5 print:hidden">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#eab308]" />
                    <span>Pembayaran aman</span>
                </div>

                <main className="flex-1 py-10">
                    <div className="mx-auto max-w-4xl px-6 lg:px-8">
                        {/* ─── Step progress bar indicator ─── */}
                        <div className="flex items-center justify-center gap-4 mb-10 text-xs sm:text-sm font-semibold border-b border-border/40 pb-6 print:hidden">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold">✓</span>
                                <span>Detail produk</span>
                            </div>
                            <div className="h-px w-12 bg-emerald-600/30" />
                            <div className="flex items-center gap-2 text-emerald-600">
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary text-white'
                                    }`}>
                                    {isPaid ? '✓' : '2'}
                                </span>
                                <span>{isPaid ? 'Bayar' : 'Selesaikan pembayaran'}</span>
                            </div>
                            <div className="h-px w-12 bg-border" />
                            <div className={`flex items-center gap-2 ${isPaid ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {isPaid ? '✓' : '3'}
                                </span>
                                <span>Akses terbuka</span>
                            </div>
                        </div>

                        {/* ─── PENDING PAYMENT STATE (Page 13) ─── */}
                        {isPending && (
                            <div className="space-y-6">
                                {/* Expiry Warning Bar */}
                                <div className="bg-red-500/5 border border-red-500/20 text-red-600 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-bold text-sm sm:text-base">
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Selesaikan sebelum pesanan kadaluarsa
                                    </span>
                                    <span className="font-mono text-lg">{timeLeft}</span>
                                </div>

                                {/* Order Number & Total Price Box */}
                                <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">NOMOR PESANAN</span>
                                        <span className="text-base font-bold text-foreground font-mono">{order.order_number}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">TOTAL TAGIHAN</span>
                                        <span className="text-xl font-extrabold text-primary">{formatPrice(order.net_amount)}</span>
                                    </div>
                                </div>

                                {/* Main Payment Panel */}
                                <Card className="border-border/50 shadow-sm overflow-hidden">
                                    <CardContent className="p-6 space-y-6">
                                        {/* Tabs Selector */}
                                        <div className="flex border-b border-border/40 pb-2">
                                            <button
                                                onClick={() => setActiveTab('va')}
                                                className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all ${activeTab === 'va' ? 'border-[#eab308] text-foreground' : 'border-transparent text-muted-foreground'
                                                    }`}
                                            >
                                                Virtual Account
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('qris')}
                                                className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all ${activeTab === 'qris' ? 'border-transparent text-muted-foreground' : 'border-transparent text-muted-foreground'
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
                                                    <div className="h-10 w-16 bg-blue-600/10 rounded-lg flex items-center justify-center font-extrabold text-blue-600 text-xs shadow-xs">
                                                        BCA
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-extrabold text-foreground">BCA Virtual Account</h4>
                                                        <span className="text-[10px] text-muted-foreground">Transfer otomatis dari m-BCA atau ATM</span>
                                                    </div>
                                                </div>

                                                {/* VA Number Card */}
                                                <div className="p-5.5 bg-muted/20 border border-border/60 rounded-xl flex items-center justify-between gap-4">
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground uppercase block font-medium">Nomor Virtual Account</span>
                                                        <strong className="text-xl sm:text-2xl font-mono text-foreground tracking-widest mt-1 block">
                                                            8077 0420 2026 0084
                                                        </strong>
                                                    </div>
                                                    <Button onClick={handleCopy} variant="outline" className="rounded-xl flex items-center gap-1.5 text-xs font-bold px-4 py-2 shrink-0">
                                                        <Copy className="h-3.5 w-3.5" />
                                                        {copied ? 'Tersalin!' : 'Salin'}
                                                    </Button>
                                                </div>

                                                {/* Instructions */}
                                                <div className="space-y-3">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Cara bayar via m-BCA:</span>
                                                    <ol className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                                                        <li className="flex gap-2.5 items-start">
                                                            <span className="h-5 w-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-foreground">1</span>
                                                            <span>Buka aplikasi m-BCA ➔ <strong>m-Transfer</strong> ➔ <strong>BCA Virtual Account</strong></span>
                                                        </li>
                                                        <li className="flex gap-2.5 items-start">
                                                            <span className="h-5 w-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-foreground">2</span>
                                                            <span>Masukkan nomor VA di atas, lalu klik <strong>Send</strong></span>
                                                        </li>
                                                        <li className="flex gap-2.5 items-start">
                                                            <span className="h-5 w-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-foreground">3</span>
                                                            <span>Konfirmasi nama & nominal — harus persis <strong>{formatPrice(order.net_amount)}</strong></span>
                                                        </li>
                                                        <li className="flex gap-2.5 items-start">
                                                            <span className="h-5 w-5 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-foreground">4</span>
                                                            <span>Masukkan PIN, tunggu notifikasi berhasil</span>
                                                        </li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status Check Note */}
                                        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-amber-500/10 bg-amber-500/5 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                            <span>Halaman ini cek status pembayaran otomatis tiap 10 detik...</span>
                                        </div>

                                        {/* Simulator Button (Mock Developer Gateway) */}
                                        <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={handleMockPay}
                                                className="flex-1 py-5 rounded-xl font-bold text-xs bg-[#B99430] hover:bg-[#725a15] text-white flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                Simulasi: pembayaran sukses ➔
                                            </Button>
                                            <Button variant="outline" className="flex-1 py-5 rounded-xl text-xs font-bold" asChild>
                                                <Link href="/courses">Ganti metode</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="text-center pt-2">
                                    <span className="text-xs text-muted-foreground">
                                        Butuh bantuan? <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary font-semibold">Chat CS kami</a>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ─── PAID / SUCCESS STATE (Page 14) ─── */}
                        {isPaid && (
                            <div className="space-y-6">
                                {/* Success Header Box */}
                                <div className="flex flex-col items-center text-center py-10 bg-emerald-500/5 border border-emerald-500/15 rounded-3xl p-6 space-y-4">
                                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                                        <CheckCircle className="h-9 w-9" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h2 className="text-2xl font-extrabold text-foreground">Pembayaran diterima! 🎉</h2>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                            Akses ke semua materi di paketmu sudah dibuka. Langsung mulai belajar!
                                        </p>
                                    </div>
                                </div>

                                {/* Order Invoice Info */}
                                <Card className="border-border/50 shadow-sm">
                                    <CardContent className="p-6 space-y-6">
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">RINGKASAN PESANAN</h3>
                                            <div className="space-y-3.5 text-xs sm:text-sm">
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">No. pesanan</span>
                                                    <span className="font-mono font-bold text-foreground">{order.order_number}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">Produk</span>
                                                    <span className="font-bold text-foreground">{order.product?.title || 'Paket Jago'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">Metode bayar</span>
                                                    <span className="font-bold text-foreground">BCA Virtual Account</span>
                                                </div>
                                                <div className="flex justify-between border-b border-border/40 pb-2.5">
                                                    <span className="text-muted-foreground">Waktu bayar</span>
                                                    <span className="font-bold text-foreground">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })} • 15:42
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-1 text-base font-extrabold">
                                                    <span className="text-foreground">Total dibayar</span>
                                                    <span className="text-primary">{formatPrice(order.net_amount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Opened Courses List */}
                                        <div className="border-t border-border/40 pt-6 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                {courses.length} materi terbuka
                                            </h4>

                                            <div className="grid gap-3.5">
                                                {courses.map((c) => (
                                                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/60">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                            <div>
                                                                <h5 className="text-xs sm:text-sm font-bold text-foreground leading-snug">{c.title}</h5>
                                                                <span className="text-[10px] text-muted-foreground mt-0.5 block">5 bab pembelajaran</span>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="ghost" className="rounded-lg text-primary text-xs font-bold hover:bg-primary/10 print:hidden" asChild>
                                                            <Link href={`/courses/${c.slug}`}>
                                                                Mulai ➔
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row gap-3 print:hidden">
                                            {firstCourse && (
                                                <Button className="flex-1 py-5 rounded-xl font-bold text-xs bg-[#B99430] hover:bg-[#725a15] text-white flex items-center justify-center gap-1.5" asChild>
                                                    <Link href={`/courses/${firstCourse.slug}`}>
                                                        Mulai belajar sekarang
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button onClick={() => window.print()} variant="outline" className="flex-1 py-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                                                <FileText className="h-4 w-4" />
                                                Cetak invoice
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="text-center pt-2 print:hidden">
                                    <span className="text-xs text-muted-foreground">
                                        Invoice dikirim ke <strong>{userEmail}</strong> • Ada pertanyaan? <a href="https://wa.me/6281234567890" className="underline hover:text-primary font-semibold">Hubungi kami</a>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ─── CANCELLED / EXPIRED STATE ─── */}
                        {(isCancel || isExpired) && (
                            <Card className="border-border/50 text-center py-16">
                                <CardContent className="space-y-4">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                        <AlertCircle className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-extrabold text-foreground">
                                            {isCancel ? 'Transaksi Dibatalkan' : 'Transaksi Kedaluwarsa'}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                                            Transaksi ini tidak dapat dilanjutkan karena statusnya sudah tidak aktif. Silakan pilih materi kembali di Katalog untuk melakukan pemesanan ulang.
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <Button asChild className="rounded-xl font-bold py-2.5">
                                            <Link href="/courses">Kembali ke Katalog</Link>
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
