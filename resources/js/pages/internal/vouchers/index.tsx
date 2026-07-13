import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AppPagination } from '@/components/app-pagination';
import { create, destroy, edit } from '@/actions/App/Http/Controllers/Internal/VoucherController';
import { index } from '@/routes/internal/vouchers';
import type { PaginatedResource } from '@/types/ui';

type Voucher = {
    id: number;
    code: string;
    name: string | null;
    type: 'percentage' | 'flat';
    value: number;
    max_discount: number | null;
    min_purchase: number | null;
    quota: number | null;
    usage_count: number;
    per_user_limit: number | null;
    applies_to_all_products: boolean;
    products_count: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

function formatValue(voucher: Voucher): string {
    return voucher.type === 'percentage' ? `${voucher.value}%` : formatPrice(voucher.value);
}

export default function VouchersIndex({ vouchers }: { vouchers: PaginatedResource<Voucher> }) {
    const [confirmDelete, setConfirmDelete] = useState<Voucher | null>(null);

    function handleDelete() {
        if (!confirmDelete) return;
        router.delete(destroy(confirmDelete.code).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title="Vouchers" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Vouchers</h1>
                        <p className="text-muted-foreground text-sm">Kelola voucher diskon.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tambah Voucher
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Diskon</TableHead>
                                <TableHead>Min. Beli</TableHead>
                                <TableHead className="text-center">Berlaku</TableHead>
                                <TableHead className="text-center">Pemakaian</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="w-28 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vouchers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                                        Belum ada voucher.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vouchers.data.map((voucher) => (
                                    <TableRow key={voucher.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-mono">{voucher.code}</span>
                                                {voucher.name && (
                                                    <span className="text-muted-foreground text-xs">{voucher.name}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{formatValue(voucher)}</span>
                                                {voucher.type === 'percentage' && voucher.max_discount && (
                                                    <span className="text-muted-foreground text-xs">
                                                        maks {formatPrice(voucher.max_discount)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {voucher.min_purchase ? formatPrice(voucher.min_purchase) : '—'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">
                                                {voucher.applies_to_all_products
                                                    ? 'Semua produk'
                                                    : `${voucher.products_count} produk`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {voucher.usage_count}
                                            {voucher.quota ? ` / ${voucher.quota}` : ''}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={voucher.is_active ? 'default' : 'secondary'}>
                                                {voucher.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link href={edit(voucher.code).url}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setConfirmDelete(voucher)}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AppPagination meta={vouchers.meta} links={vouchers.links} />
            </div>

            <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Voucher</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus voucher <strong>{confirmDelete?.code}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

VouchersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Vouchers', href: index.url() },
    ],
};
