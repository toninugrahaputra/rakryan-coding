import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index, show, update } from '@/actions/App/Http/Controllers/Internal/OrderController';

type Order = {
    order_number: string;
    user: { name: string; email: string } | null;
    items: { product_name: string; product_price: number } | null;
    channel_group: string;
    channel_name: string | null;
    payment_fee: number;
    total_amount: number;
    payment_reference: string | null;
    payment_code: string | null;
    payment_metadata: Record<string, string> | null;
};

const CHANNEL_GROUPS = ['Transfer', 'Virtual Account', 'QRIS', 'E Wallet'] as const;
type ChannelGroup = typeof CHANNEL_GROUPS[number];

const numberInputClass = '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

const PAYMENT_FIELDS: Record<ChannelGroup, { label: string; field: string; placeholder: string }[]> = {
    'Transfer': [
        { label: 'Nama pengirim', field: 'sender_name', placeholder: 'Nama lengkap pengirim' },
        { label: 'No. rekening pengirim', field: 'sender_account', placeholder: 'Nomor rekening' },
        { label: 'Referensi transfer', field: 'payment_reference', placeholder: 'Nomor referensi / bukti' },
    ],
    'Virtual Account': [
        { label: 'Nama pengirim', field: 'sender_name', placeholder: 'Nama lengkap pengirim' },
        { label: 'No. VA', field: 'payment_code', placeholder: 'Nomor VA' },
        { label: 'Referensi', field: 'payment_reference', placeholder: 'Nomor referensi / bukti' },
    ],
    'QRIS': [
        { label: 'Nama pengirim', field: 'sender_name', placeholder: 'Nama lengkap pengirim' },
        { label: 'Referensi QRIS', field: 'payment_reference', placeholder: 'Nomor referensi / bukti' },
    ],
    'E Wallet': [
        { label: 'Nama akun', field: 'sender_name', placeholder: 'Nama lengkap pengirim' },
        { label: 'No. HP', field: 'sender_phone', placeholder: 'Contoh: 08xxxxxxxxxx' },
        { label: 'Referensi', field: 'payment_reference', placeholder: 'Nomor referensi / bukti' },
    ],
};

export default function OrdersEdit({ order }: { order: Order }) {
    const [form, setForm] = useState({
        channel_group: order.channel_group as ChannelGroup | '',
        channel_name: order.channel_name ?? '',
        payment_fee: String(order.payment_fee),
        total_amount: String(order.total_amount),
        payment_reference: order.payment_reference ?? '',
        payment_code: order.payment_code ?? '',
        sender_name: order.payment_metadata?.sender_name ?? '',
        sender_account: order.payment_metadata?.sender_account ?? '',
        sender_phone: order.payment_metadata?.sender_phone ?? '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const netAmount = Number(form.total_amount || 0) - Number(form.payment_fee || 0);
    const paymentFields = form.channel_group ? PAYMENT_FIELDS[form.channel_group] : null;

    function handleChannelGroupChange(val: ChannelGroup) {
        setForm((prev) => ({
            ...prev,
            channel_group: val,
            payment_reference: '',
            payment_code: '',
            sender_name: '',
            sender_account: '',
            sender_phone: '',
        }));
    }

    function buildPayload() {
        const payload: Record<string, unknown> = {
            channel_group: form.channel_group,
            channel_name: form.channel_name || null,
            payment_fee: Number(form.payment_fee),
            total_amount: Number(form.total_amount),
            payment_reference: form.payment_reference || null,
            payment_code: form.payment_code || null,
        };

        const metadata: Record<string, string> = {};
        if (form.sender_name) metadata.sender_name = form.sender_name;
        if (form.channel_group === 'Transfer' && form.sender_account) metadata.sender_account = form.sender_account;
        if (form.channel_group === 'E Wallet' && form.sender_phone) metadata.sender_phone = form.sender_phone;
        if (Object.keys(metadata).length > 0) payload.payment_metadata = metadata;

        return payload;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.patch(update(order.order_number).url, buildPayload(), {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title={`Edit Order ${order.order_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Order</h1>
                    <p className="font-mono text-sm text-muted-foreground">{order.order_number}</p>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg rounded-xl border p-6">
                    <div className="flex flex-col gap-5">

                        {/* Read-only: user & product */}
                        <div className="bg-muted rounded-lg px-4 py-3 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">User</span>
                                <span className="font-medium">{order.user?.name} — {order.user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Produk</span>
                                <span className="font-medium">
                                    {order.items?.product_name}
                                    {order.items?.product_price != null && (
                                        <span className="text-muted-foreground ml-1">({formatPrice(order.items.product_price)})</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="channel_group">Metode Pembayaran</Label>
                                <Select
                                    value={form.channel_group}
                                    onValueChange={(val) => handleChannelGroupChange(val as ChannelGroup)}
                                >
                                    <SelectTrigger id="channel_group">
                                        <SelectValue placeholder="Pilih metode..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CHANNEL_GROUPS.map((group) => (
                                            <SelectItem key={group} value={group}>{group}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.channel_group && <p className="text-destructive text-sm">{errors.channel_group}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="channel_name">Nama Channel</Label>
                                <Input
                                    id="channel_name"
                                    value={form.channel_name}
                                    onChange={(e) => setForm((p) => ({ ...p, channel_name: e.target.value }))}
                                    placeholder="BCA, OVO, dll."
                                />
                                {errors.channel_name && <p className="text-destructive text-sm">{errors.channel_name}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="total_amount">Total Pembayaran (Rp)</Label>
                                <Input
                                    id="total_amount"
                                    type="number"
                                    min="0"
                                    value={form.total_amount}
                                    onChange={(e) => setForm((p) => ({ ...p, total_amount: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="0"
                                    className={numberInputClass}
                                />
                                {errors.total_amount && <p className="text-destructive text-sm">{errors.total_amount}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="payment_fee">Biaya Admin (Rp)</Label>
                                <Input
                                    id="payment_fee"
                                    type="number"
                                    min="0"
                                    value={form.payment_fee}
                                    onChange={(e) => setForm((p) => ({ ...p, payment_fee: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="0"
                                    className={numberInputClass}
                                />
                                {errors.payment_fee && <p className="text-destructive text-sm">{errors.payment_fee}</p>}
                            </div>
                        </div>

                        <div className="bg-muted rounded-lg px-4 py-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Diterima (net)</span>
                                <span className="font-semibold">{formatPrice(netAmount)}</span>
                            </div>
                        </div>

                        {paymentFields && (
                            <>
                                <div className="border-t pt-1">
                                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Data Transaksi</p>
                                </div>
                                {paymentFields.map(({ label, field: fieldKey, placeholder }) => (
                                    <div key={fieldKey} className="flex flex-col gap-2">
                                        <Label htmlFor={fieldKey}>{label}</Label>
                                        <Input
                                            id={fieldKey}
                                            value={form[fieldKey as keyof typeof form]}
                                            onChange={(e) => setForm((p) => ({ ...p, [fieldKey]: e.target.value }))}
                                            placeholder={placeholder}
                                        />
                                        {errors[fieldKey] && <p className="text-destructive text-sm">{errors[fieldKey]}</p>}
                                    </div>
                                ))}
                            </>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <a href={show(order.order_number).url}>Batal</a>
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

OrdersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Orders', href: index.url() },
        { title: 'Edit Order', href: '#' },
    ],
};
