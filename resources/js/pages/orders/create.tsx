import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Ticket, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface Course {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
}

interface Product {
    id: number;
    title: string;
    price: number;
}

interface OrdersCreateProps {
    course: Course;
    product: Product;
}

function formatPrice(price: number): string {
    if (price === 0) {
        return 'Gratis';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

export default function OrdersCreate({ course, product }: OrdersCreateProps) {
    const [voucherCode, setVoucherCode] = useState(() => {
        const pending = sessionStorage.getItem('pending_voucher');

        if (pending) {
            sessionStorage.removeItem('pending_voucher');

            return pending;
        }

        return 'NGODING40'; // Pre-fill voucher dari PDF
    });
    const [appliedVoucher, setAppliedVoucher] = useState<{
        code: string;
        discount: number;
    } | null>(null);
    const [voucherError, setVoucherError] = useState('');
    const [voucherSuccess, setVoucherSuccess] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Course gratis — tidak perlu voucher maupun metode pembayaran
    const isFree = product.price === 0;

    // Hitung rincian harga
    const originalPrice = product.price;
    const discount = appliedVoucher?.discount ?? 0;
    const basePriceAfterDiscount = Math.max(0, originalPrice - discount);
    const totalPrice = basePriceAfterDiscount;

    // Terapkan voucher otomatis jika prefilled (tidak relevan untuk course gratis)
    useEffect(() => {
        if (!isFree && voucherCode) {
            handleApplyVoucher();
        }
    }, []);

    async function handleApplyVoucher() {
        const codeToValidate = voucherCode.trim();

        if (!codeToValidate) {
            setVoucherError('Masukkan kode voucher.');

            return;
        }

        setIsValidating(true);
        setVoucherError('');
        setVoucherSuccess('');

        try {
            const xsrfCookie =
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1] ?? '';
            const decodedXsrf = decodeURIComponent(xsrfCookie);
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };

            if (decodedXsrf) {
                headers['X-XSRF-TOKEN'] = decodedXsrf;
            }

            const response = await fetch('/orders/apply-voucher', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    voucher_code: codeToValidate,
                    product_id: product.id,
                }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setAppliedVoucher({
                    code: codeToValidate,
                    discount: data.discount,
                });
                setVoucherSuccess(
                    `Voucher berhasil diterapkan! Potongan ${formatPrice(data.discount)}`,
                );
            } else {
                setVoucherError(data.message || 'Kode voucher tidak valid.');
            }
        } catch {
            setVoucherError('Gagal memverifikasi voucher. Coba lagi.');
        } finally {
            setIsValidating(false);
        }
    }

    function handleRemoveVoucher() {
        setAppliedVoucher(null);
        setVoucherCode('');
        setVoucherSuccess('');
        setVoucherError('');
    }

    function handleSubmitOrder() {
        setIsSubmitting(true);
        router.post(
            '/orders',
            {
                product_id: product.id,
                voucher_code: appliedVoucher?.code || null,
            },
            {
                onError: () => setIsSubmitting(false),
                onFinish: () => setIsSubmitting(false),
            },
        );
    }

    return (
        <>
            <Head title="Checkout & Bayar" />

            <div className="flex min-h-screen flex-col bg-[#fcfcfd] font-sans text-foreground dark:bg-background">
                {/* Secure checkout indicator top bar */}
                <div className="flex items-center justify-center gap-1.5 border-b border-white/5 bg-[#1e1b4b] py-2.5 text-center text-xs text-white/80">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#eab308]" />
                    <span>Checkout aman — SSL terenkripsi</span>
                </div>

                <main className="flex-1 py-10">
                    <div className="mx-auto max-w-5xl px-6 lg:px-8">
                        {/* ─── Step progress bar indicator ─── */}
                        <div className="mb-10 flex items-center justify-center gap-4 border-b border-border/40 pb-6 text-xs font-semibold sm:text-sm">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold">
                                    ✓
                                </span>
                                <span>Detail produk</span>
                            </div>
                            <div className="h-px w-12 bg-emerald-600/30" />
                            <div className="flex items-center gap-2 text-primary">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                    2
                                </span>
                                <span>Selesaikan Pembayaran</span>
                            </div>
                            <div className="h-px w-12 bg-border" />
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                                    3
                                </span>
                                <span>Akses terbuka</span>
                            </div>
                        </div>

                        <div className="grid items-start gap-8 lg:grid-cols-12">
                            {/* Left Side: Order summary & voucher input (8 cols) */}
                            <div className="space-y-6 lg:col-span-8">
                                {/* Order Summary */}
                                <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
                                    <h3 className="mb-4 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                        Ringkasan pesanan
                                    </h3>
                                    <div className="flex gap-4">
                                        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted">
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-primary/5 text-xs font-bold text-primary/30">
                                                    &lt;Coder/&gt;
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                                                PAKET • 6 MATERI
                                            </span>
                                            <h4 className="mt-0.5 truncate text-base leading-snug font-extrabold text-foreground">
                                                {product.title}
                                            </h4>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                62 bab • ±52 jam baca • akses
                                                sampai lulus
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="block text-sm font-extrabold text-foreground">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="mt-0.5 block text-[10px] text-muted-foreground line-through">
                                                Rp 1.100.000
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Voucher code — tidak relevan untuk course gratis */}
                                {!isFree && (
                                    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-xs">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                            <Ticket className="h-4 w-4 text-primary" />
                                            Kode voucher
                                        </h3>

                                        {appliedVoucher ? (
                                            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
                                                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Voucher "
                                                    {appliedVoucher.code}" Aktif
                                                    (-
                                                    {formatPrice(
                                                        appliedVoucher.discount,
                                                    )}
                                                    )
                                                </div>
                                                <button
                                                    onClick={
                                                        handleRemoveVoucher
                                                    }
                                                    className="text-xs font-semibold text-destructive hover:underline"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Contoh: NGODING40"
                                                    value={voucherCode}
                                                    onChange={(e) =>
                                                        setVoucherCode(
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    disabled={isValidating}
                                                    className="rounded-xl font-semibold tracking-wide uppercase"
                                                />
                                                <Button
                                                    onClick={handleApplyVoucher}
                                                    disabled={isValidating}
                                                    variant="outline"
                                                    className="shrink-0 rounded-xl px-6 font-bold"
                                                >
                                                    {isValidating
                                                        ? 'Checking...'
                                                        : 'Pakai'}
                                                </Button>
                                            </div>
                                        )}

                                        {voucherError && (
                                            <p className="mt-2 text-xs font-medium text-destructive">
                                                {voucherError}
                                            </p>
                                        )}
                                        {voucherSuccess && (
                                            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                {voucherSuccess}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Sticky Checkout Pricing details card (4 cols) */}
                            <div className="lg:col-span-4">
                                <Card className="sticky top-24 border-border/60 bg-muted/15 shadow-sm">
                                    <CardContent className="space-y-6 p-5.5">
                                        {/* Logo Box */}
                                        <div className="relative overflow-hidden rounded-xl bg-[#1e1b4b] p-4.5 text-center font-bold tracking-wider text-white">
                                            <div className="absolute right-0 bottom-0 h-12 w-12 translate-x-4 translate-y-4 rounded-full bg-white/5" />
                                            <span className="block font-mono text-sm text-amber-400">
                                                &lt;Web Dev/&gt;
                                            </span>
                                            <span className="mt-0.5 block text-base font-extrabold">
                                                Paket Jago
                                            </span>
                                        </div>

                                        {/* Pricing Details */}
                                        <div className="space-y-3.5 border-b border-border/40 pb-4.5 text-xs sm:text-sm">
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Harga</span>
                                                <span className="font-bold text-foreground">
                                                    {formatPrice(
                                                        basePriceAfterDiscount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Net Total */}
                                        <div className="mb-4 flex items-baseline justify-between">
                                            <span className="text-sm font-bold text-foreground">
                                                Total
                                            </span>
                                            <span className="text-xl font-extrabold text-primary">
                                                {formatPrice(totalPrice)}
                                            </span>
                                        </div>

                                        {/* Pay Button */}
                                        <Button
                                            onClick={handleSubmitOrder}
                                            disabled={isSubmitting}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B99430] py-6 text-xs font-bold text-white shadow-md hover:bg-[#725a15]"
                                        >
                                            {isSubmitting
                                                ? 'Memproses...'
                                                : isFree
                                                  ? 'Daftar Course Gratis'
                                                  : 'Bayar sekarang'}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>

                                        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
                                            {isFree ? (
                                                <>
                                                    Dengan klik Daftar, kamu
                                                    setuju{' '}
                                                    <span className="cursor-pointer underline">
                                                        S&K
                                                    </span>{' '}
                                                    kami.
                                                </>
                                            ) : (
                                                <>
                                                    Dengan klik Bayar, kamu
                                                    setuju{' '}
                                                    <span className="cursor-pointer underline">
                                                        S&K
                                                    </span>{' '}
                                                    kami. Garansi uang kembali 7
                                                    hari.
                                                </>
                                            )}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

OrdersCreate.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Checkout', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
