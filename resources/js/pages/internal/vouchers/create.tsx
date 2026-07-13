import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ProductSheetSelector } from '@/components/product-sheet-selector';
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
import { Switch } from '@/components/ui/switch';
import { store } from '@/actions/App/Http/Controllers/Internal/VoucherController';
import { create, index } from '@/routes/internal/vouchers';

type Product = { id: number; title: string; price: number };

const numberInputClass =
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export default function VouchersCreate({ products }: { products: Product[] }) {
    const [form, setForm] = useState({
        code: '',
        name: '',
        type: 'percentage' as 'percentage' | 'flat',
        value: '',
        max_discount: '',
        min_purchase: '',
        quota: '',
        per_user_limit: '',
        applies_to_all_products: true,
        product_ids: [] as number[],
        starts_at: '',
        ends_at: '',
        is_active: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const toNullableInt = (v: string) => (v === '' ? null : Number(v));

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(
            store.url(),
            {
                ...form,
                value: form.value === '' ? '' : Number(form.value),
                max_discount: toNullableInt(form.max_discount),
                min_purchase: toNullableInt(form.min_purchase),
                quota: toNullableInt(form.quota),
                per_user_limit: toNullableInt(form.per_user_limit),
                product_ids: form.applies_to_all_products ? [] : form.product_ids,
                starts_at: form.starts_at || null,
                ends_at: form.ends_at || null,
            },
            {
                onError: (errs) => { setErrors(errs); setProcessing(false); },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Tambah Voucher" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Voucher</h1>
                    <p className="text-muted-foreground text-sm">Buat voucher diskon baru.</p>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg rounded-xl border p-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="code">Kode</Label>
                            <Input
                                id="code"
                                value={form.code}
                                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                                placeholder="DISKON50"
                                className="font-mono"
                                autoFocus
                            />
                            {errors.code && <p className="text-destructive text-sm">{errors.code}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nama <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Diskon Akhir Tahun"
                            />
                            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="type">Tipe</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(type: 'percentage' | 'flat') => setForm((p) => ({ ...p, type }))}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="flat">Flat (Rp)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="value">{form.type === 'percentage' ? 'Nilai (%)' : 'Nominal (Rp)'}</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    min="1"
                                    value={form.value}
                                    onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder={form.type === 'percentage' ? '10' : '50000'}
                                    className={numberInputClass}
                                />
                                {errors.value && <p className="text-destructive text-sm">{errors.value}</p>}
                            </div>
                        </div>

                        {form.type === 'percentage' && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="max_discount">Maksimum Diskon (Rp) <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                <Input
                                    id="max_discount"
                                    type="number"
                                    min="0"
                                    value={form.max_discount}
                                    onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="Batas nominal diskon"
                                    className={numberInputClass}
                                />
                                {errors.max_discount && <p className="text-destructive text-sm">{errors.max_discount}</p>}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="min_purchase">Minimum Pembelian (Rp) <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                            <Input
                                id="min_purchase"
                                type="number"
                                min="0"
                                value={form.min_purchase}
                                onChange={(e) => setForm((p) => ({ ...p, min_purchase: e.target.value }))}
                                onWheel={(e) => e.currentTarget.blur()}
                                placeholder="Kosongkan jika tidak ada"
                                className={numberInputClass}
                            />
                            {errors.min_purchase && <p className="text-destructive text-sm">{errors.min_purchase}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="quota">Kuota Global <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                <Input
                                    id="quota"
                                    type="number"
                                    min="1"
                                    value={form.quota}
                                    onChange={(e) => setForm((p) => ({ ...p, quota: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="Unlimited"
                                    className={numberInputClass}
                                />
                                {errors.quota && <p className="text-destructive text-sm">{errors.quota}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="per_user_limit">Limit / User <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                <Input
                                    id="per_user_limit"
                                    type="number"
                                    min="1"
                                    value={form.per_user_limit}
                                    onChange={(e) => setForm((p) => ({ ...p, per_user_limit: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="Unlimited"
                                    className={numberInputClass}
                                />
                                {errors.per_user_limit && <p className="text-destructive text-sm">{errors.per_user_limit}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="starts_at">Mulai <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                <Input
                                    id="starts_at"
                                    type="date"
                                    value={form.starts_at}
                                    onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
                                />
                                {errors.starts_at && <p className="text-destructive text-sm">{errors.starts_at}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="ends_at">Berakhir <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                                <Input
                                    id="ends_at"
                                    type="date"
                                    value={form.ends_at}
                                    onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
                                />
                                {errors.ends_at && <p className="text-destructive text-sm">{errors.ends_at}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="applies_to_all_products"
                                checked={form.applies_to_all_products}
                                onCheckedChange={(val) => setForm((p) => ({ ...p, applies_to_all_products: val }))}
                            />
                            <Label htmlFor="applies_to_all_products">Berlaku untuk semua produk</Label>
                        </div>

                        {!form.applies_to_all_products && (
                            <div className="flex flex-col gap-2">
                                <Label>Produk yang berlaku</Label>
                                <ProductSheetSelector
                                    products={products}
                                    value={form.product_ids}
                                    onChange={(ids) => setForm((p) => ({ ...p, product_ids: ids }))}
                                    error={errors.product_ids}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_active"
                                checked={form.is_active}
                                onCheckedChange={(val) => setForm((p) => ({ ...p, is_active: val }))}
                            />
                            <Label htmlFor="is_active">Aktifkan voucher</Label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Tambah Voucher'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <a href={index.url()}>Batal</a>
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

VouchersCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Vouchers', href: index.url() },
        { title: 'Tambah Voucher', href: create.url() },
    ],
};
