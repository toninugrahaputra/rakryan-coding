import { Head, Link, router } from '@inertiajs/react';
import { Clock, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface Voucher {
    id: number;
    code: string;
    name: string;
    type: 'flat' | 'percentage';
    value: number;
    max_discount: number;
    min_purchase: number;
    ends_at: string;
}

interface VouchersIndexProps {
    availableVouchers: Voucher[];
    usedVouchers: Voucher[];
    expiredVouchers: Voucher[];
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

export default function VouchersIndex({
    availableVouchers = [],
    usedVouchers = [],
    expiredVouchers = [],
}: VouchersIndexProps) {
    const [voucherInput, setVoucherInput] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);

    function fallbackCopyTextToClipboard(text: string) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');

            if (successful) {
                setCopiedCode(text);
                setTimeout(() => setCopiedCode(null), 2000);
            }
        } catch (err) {
            console.error('Fallback: Unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    function handleCopy(code: string) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard
                .writeText(code)
                .then(() => {
                    setCopiedCode(code);
                    setTimeout(() => setCopiedCode(null), 2000);
                })
                .catch(() => {
                    fallbackCopyTextToClipboard(code);
                });
        } else {
            fallbackCopyTextToClipboard(code);
        }
    }

    function handleRedeem() {
        const code = voucherInput.trim();

        if (!code) {
            return;
        }

        setIsRedeeming(true);
        router.post(
            '/vouchers/redeem',
            { code },
            {
                preserveScroll: true,
                onSuccess: () => {
                    sessionStorage.setItem(
                        'pending_voucher',
                        code.toUpperCase(),
                    );
                    setVoucherInput('');
                    router.visit('/courses');
                },
                onFinish: () => {
                    setIsRedeeming(false);
                },
            },
        );
    }

    const [activeTab, setActiveTab] = useState<
        'available' | 'used' | 'expired'
    >('available');

    return (
        <>
            <Head title="Voucher Saya — Rakryan Coding" />

            <div className="mx-auto max-w-4xl space-y-6 font-sans">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Voucher Saya
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        Pakai kode ini saat checkout buat hemat lebih banyak.
                    </p>
                </div>

                {/* Redeem Voucher Input Box */}
                <Card className="border-border/50 shadow-xs">
                    <CardContent className="flex flex-col items-end gap-3 p-5 sm:flex-row">
                        <div className="w-full flex-1 space-y-1.5">
                            <span className="block text-xs font-bold text-muted-foreground">
                                Punya kode voucher baru?
                            </span>
                            <Input
                                placeholder="Contoh: NGODING40"
                                value={voucherInput}
                                onChange={(e) =>
                                    setVoucherInput(
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                disabled={isRedeeming}
                                className="rounded-xl font-semibold tracking-wider uppercase"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleRedeem();
                                    }
                                }}
                            />
                        </div>
                        <Button
                            onClick={handleRedeem}
                            disabled={isRedeeming}
                            className="w-full shrink-0 rounded-xl bg-[#B99430] px-6 font-bold text-white hover:bg-[#725a15] sm:w-auto"
                        >
                            {isRedeeming ? 'Memproses...' : 'Tukarkan'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2 text-xs font-semibold text-muted-foreground sm:text-sm">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'available'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Tersedia ({availableVouchers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('used')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'used'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Terpakai ({usedVouchers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('expired')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'expired'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Kedaluwarsa ({expiredVouchers.length})
                    </button>
                </div>

                {/* Vouchers Grid */}
                {activeTab === 'available' && (
                    <div className="grid gap-4.5 sm:grid-cols-2">
                        {availableVouchers.length === 0 ? (
                            <p className="col-span-2 py-10 text-center text-sm text-muted-foreground">
                                Belum ada kupon tersedia.
                            </p>
                        ) : (
                            availableVouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 shadow-xs"
                                >
                                    {/* Left gold ticket strip bar */}
                                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#B99430]" />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="rounded border border-amber-500/15 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-600 uppercase">
                                                {voucher.type === 'percentage'
                                                    ? `${voucher.value}% OFF`
                                                    : `${formatPrice(voucher.value)} OFF`}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Hingga {voucher.ends_at}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-extrabold text-foreground">
                                            {voucher.name}
                                        </h3>
                                        <p className="text-[11px] leading-normal text-muted-foreground">
                                            Potongan{' '}
                                            {voucher.type === 'percentage'
                                                ? `${voucher.value}%`
                                                : formatPrice(voucher.value)}
                                            {voucher.max_discount > 0 &&
                                                ` (Maks ${formatPrice(voucher.max_discount)})`}{' '}
                                            dengan minimal belanja{' '}
                                            {formatPrice(voucher.min_purchase)}.
                                        </p>
                                    </div>

                                    {/* Promo Code Box & Action */}
                                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/40 pt-4">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded border border-border/80 bg-muted px-2.5 py-1 font-mono text-xs font-bold tracking-wide uppercase">
                                                {voucher.code}
                                            </span>
                                            <Button
                                                onClick={() =>
                                                    handleCopy(voucher.code)
                                                }
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 rounded-lg p-0 text-muted-foreground hover:text-foreground"
                                            >
                                                {copiedCode === voucher.code ? (
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="rounded-lg bg-[#B99430] text-xs font-bold text-white hover:bg-[#725a15]"
                                            asChild
                                        >
                                            <Link
                                                href="/courses"
                                                onClick={() => {
                                                    sessionStorage.setItem(
                                                        'pending_voucher',
                                                        voucher.code,
                                                    );
                                                }}
                                            >
                                                Pakai sekarang
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Used Vouchers View */}
                {activeTab === 'used' && (
                    <div className="grid gap-4.5 sm:grid-cols-2">
                        {usedVouchers.length === 0 ? (
                            <p className="col-span-2 py-10 text-center text-sm text-muted-foreground">
                                Belum ada kupon yang terpakai.
                            </p>
                        ) : (
                            usedVouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className="relative flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 opacity-65 shadow-xs"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                                {voucher.type === 'percentage'
                                                    ? `${voucher.value}% OFF`
                                                    : `${formatPrice(voucher.value)} OFF`}
                                            </span>
                                            <span className="rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                                                TERPAKAI
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground line-through">
                                            {voucher.name}
                                        </h3>
                                        <p className="text-[11px] leading-normal text-muted-foreground">
                                            Sudah digunakan pada transaksi
                                            pembelianmu.
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Expired Vouchers View */}
                {activeTab === 'expired' && (
                    <div className="grid gap-4.5 sm:grid-cols-2">
                        {expiredVouchers.length === 0 ? (
                            <p className="col-span-2 py-10 text-center text-sm text-muted-foreground">
                                Belum ada kupon kedaluwarsa.
                            </p>
                        ) : (
                            expiredVouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className="relative flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 opacity-65 shadow-xs"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                                {voucher.type === 'percentage'
                                                    ? `${voucher.value}% OFF`
                                                    : `${formatPrice(voucher.value)} OFF`}
                                            </span>
                                            <span className="rounded border border-red-500/15 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                                                KEDALUWARSA
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground line-through">
                                            {voucher.name}
                                        </h3>
                                        <p className="text-[11px] leading-normal text-muted-foreground">
                                            Masa berlaku kupon berakhir pada{' '}
                                            {voucher.ends_at}.
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

VouchersIndex.layout = (page: React.ReactNode) => {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Voucher Saya', href: '/vouchers' },
            ]}
        >
            {page}
        </AppLayout>
    );
};
