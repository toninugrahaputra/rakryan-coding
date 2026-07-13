import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { approve, cancel, destroy, edit, index } from '@/actions/App/Http/Controllers/Internal/OrderController';

type Order = {
    id: number;
    order_number: string;
    status: 'pending' | 'paid' | 'cancel' | 'expired';
    user: { id: number; name: string; email: string } | null;
    product: { id: number; title: string; slug: string; thumbnail: string | null } | null;
    items: {
        product_id: number;
        product_name: string;
        product_type: 'single' | 'bundle';
        product_price: number;
        product_price_strikethrough: number | null;
    } | null;
    provider: string | null;
    payment_reference: string | null;
    channel_group: string;
    channel_code: string | null;
    channel_name: string | null;
    payment_fee: number;
    payment_code: string | null;
    payment_metadata: Record<string, string> | null;
    valid_until: string | null;
    total_amount: number;
    net_amount: number;
    paid_at: string | null;
    approved_by: string | null;
    created_at: string;
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

const statusConfig = {
    pending: { label: 'Menunggu', variant: 'secondary' as const },
    paid: { label: 'Lunas', variant: 'default' as const },
    cancel: { label: 'Dibatalkan', variant: 'destructive' as const },
    expired: { label: 'Kadaluarsa', variant: 'destructive' as const },
};

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <dt className="text-muted-foreground shrink-0">{label}</dt>
            <dd className={mono ? 'font-mono text-right' : 'text-right font-medium'}>{value}</dd>
        </div>
    );
}

export default function OrdersShow({ order }: { order: Order }) {
    const [confirmAction, setConfirmAction] = useState<'approve' | 'cancel' | 'delete' | null>(null);
    const [processing, setProcessing] = useState(false);

    const productName = order.items?.product_name ?? order.product?.title ?? '-';
    const productPrice = order.items?.product_price ?? null;
    const productStrikethrough = order.items?.product_price_strikethrough ?? null;
    const productType = order.items?.product_type ?? null;
    const thumbnail = order.product?.thumbnail ?? null;
    const methodLabel = [order.channel_group, order.channel_name].filter(Boolean).join(' – ');

    function handleApprove() {
        setProcessing(true);
        router.patch(approve(order.order_number).url, {}, {
            onFinish: () => { setProcessing(false); setConfirmAction(null); },
        });
    }

    function handleCancel() {
        setProcessing(true);
        router.patch(cancel(order.order_number).url, {}, {
            onFinish: () => { setProcessing(false); setConfirmAction(null); },
        });
    }

    function handleDelete() {
        setProcessing(true);
        router.delete(destroy(order.order_number).url, {
            onFinish: () => { setProcessing(false); setConfirmAction(null); },
        });
    }

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="mx-auto w-full max-w-2xl">

                    {/* Invoice card */}
                    <div className="rounded-2xl border shadow-sm">

                        {/* Header */}
                        <div className="flex items-start justify-between px-8 pt-8 pb-6">
                            <div>
                                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Invoice</p>
                                <p className="font-mono text-xl font-bold">{order.order_number}</p>
                                <p className="text-muted-foreground mt-1 text-xs">{order.created_at}</p>
                            </div>
                            <Badge variant={statusConfig[order.status].variant} className="text-sm px-3 py-1">
                                {statusConfig[order.status].label}
                            </Badge>
                        </div>

                        <div className="border-t" />

                        {/* Bill to + Payment method */}
                        <div className="grid grid-cols-2 gap-6 px-8 py-6">
                            <div>
                                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-widest">Tagihan kepada</p>
                                <p className="font-semibold">{order.user?.name ?? '-'}</p>
                                <p className="text-muted-foreground text-sm">{order.user?.email ?? '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-widest">Metode Pembayaran</p>
                                <p className="font-semibold">{methodLabel || '-'}</p>
                                {order.provider && (
                                    <p className="text-muted-foreground text-sm">{order.provider}</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t" />

                        {/* Product */}
                        <div className="px-8 py-6">
                            <p className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-widest">Paket</p>
                            <div className="flex items-start gap-4">
                                {thumbnail && (
                                    <img
                                        src={thumbnail}
                                        alt={productName}
                                        className="aspect-video h-20 shrink-0 rounded-lg object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold">{productName}</p>
                                    {productType && (
                                        <span className="text-muted-foreground mt-0.5 inline-block text-xs capitalize">{productType}</span>
                                    )}
                                    {productPrice != null && (
                                        <div className="mt-2 flex items-baseline gap-2">
                                            <span className="font-semibold">{formatPrice(productPrice)}</span>
                                            {productStrikethrough != null && productStrikethrough > productPrice && (
                                                <span className="text-sm text-red-500 line-through">{formatPrice(productStrikethrough)}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment data — only if any sender/reference fields filled */}
                        {(order.payment_metadata?.sender_name ||
                          order.payment_metadata?.sender_account ||
                          order.payment_metadata?.sender_phone ||
                          order.payment_code ||
                          order.payment_reference) && (
                            <>
                                <div className="border-t" />
                                <div className="px-8 py-6">
                                    <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-widest">Data Transaksi</p>
                                    <dl className="divide-y">
                                        {order.payment_metadata?.sender_name && (
                                            <Row label="Nama pengirim" value={order.payment_metadata.sender_name} />
                                        )}
                                        {order.payment_metadata?.sender_account && (
                                            <Row label="No. rekening" value={order.payment_metadata.sender_account} mono />
                                        )}
                                        {order.payment_metadata?.sender_phone && (
                                            <Row label="No. HP" value={order.payment_metadata.sender_phone} mono />
                                        )}
                                        {order.payment_code && (
                                            <Row label="No. VA" value={order.payment_code} mono />
                                        )}
                                        {order.payment_reference && (
                                            <Row label="Referensi" value={order.payment_reference} mono />
                                        )}
                                    </dl>
                                </div>
                            </>
                        )}

                        <div className="border-t" />

                        {/* Totals */}
                        <div className="px-8 py-6">
                            <dl className="divide-y">
                                <Row label="Total pembayaran" value={formatPrice(order.total_amount)} />
                                <Row label="Biaya admin" value={formatPrice(order.payment_fee)} />
                            </dl>
                            <div className="mt-3 flex justify-between rounded-lg bg-black px-4 py-3 text-sm text-white dark:bg-white dark:text-black">
                                <span className="font-semibold">Net diterima</span>
                                <span className="font-bold">{formatPrice(order.net_amount)}</span>
                            </div>
                        </div>

                        {/* Status footer */}
                        <div className="border-t" />
                        <div className="px-8 py-6">
                            {order.status === 'pending' && (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex gap-2">
                                        <Button variant="outline" asChild>
                                            <a href={edit(order.order_number).url}>Edit</a>
                                        </Button>
                                        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmAction('delete')}>
                                            Hapus
                                        </Button>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setConfirmAction('cancel')}>
                                            Batalkan
                                        </Button>
                                        <Button onClick={() => setConfirmAction('approve')}>
                                            Setujui
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {order.status === 'paid' && (
                                <div className="text-sm">
                                    <p className="font-medium text-green-600 dark:text-green-400">Pembayaran telah dikonfirmasi</p>
                                    {order.approved_by && order.paid_at && (
                                        <p className="text-muted-foreground mt-0.5">
                                            Disetujui oleh <span className="font-medium">{order.approved_by}</span> pada {order.paid_at}
                                        </p>
                                    )}
                                </div>
                            )}
                            {(order.status === 'cancel' || order.status === 'expired') && (
                                <p className="text-muted-foreground text-sm">
                                    {order.status === 'cancel' ? 'Order ini telah dibatalkan.' : 'Order ini telah kadaluarsa.'}
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <Dialog open={confirmAction === 'approve'} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui Order</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menyetujui order <strong>{order.order_number}</strong>? User akan mendapat akses ke produk secara otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
                        <Button onClick={handleApprove} disabled={processing}>
                            {processing ? 'Memproses...' : 'Ya, Setujui'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmAction === 'cancel'} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batalkan Order</DialogTitle>
                        <DialogDescription>
                            Yakin ingin membatalkan order <strong>{order.order_number}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Tutup</Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={processing}>
                            {processing ? 'Memproses...' : 'Ya, Batalkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmAction === 'delete'} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Order</DialogTitle>
                        <DialogDescription>
                            Order <strong>{order.order_number}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

OrdersShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Orders', href: index.url() },
        { title: 'Detail Order' },
    ],
};
