import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
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
import { create, destroy, edit } from '@/actions/App/Http/Controllers/Internal/ProductController';
import { index } from '@/routes/internal/products';
import type { PaginatedResource } from '@/types/ui';

type Product = {
    id: number;
    title: string;
    slug: string;
    type: 'single' | 'bundle';
    thumbnail: string | null;
    price: number;
    price_strikethrough: number | null;
    is_published: boolean;
    is_favourite: boolean;
    courses_count: number;
    created_at: string;
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

export default function ProductsIndex({ products }: { products: PaginatedResource<Product> }) {
    const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

    function handleDelete() {
        if (!confirmDelete) return;
        router.delete(destroy(confirmDelete.slug).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Products</h1>
                        <p className="text-muted-foreground text-sm">Kelola semua produk yang tersedia.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tambah Produk
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead className="text-center">Courses</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Dibuat</TableHead>
                                <TableHead className="w-28 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                                        Belum ada produk.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {product.is_favourite && (
                                                    <Star className="text-amber-400 size-4 shrink-0 fill-amber-400" />
                                                )}
                                                {product.title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {product.type === 'single' ? 'Single' : 'Bundle'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{formatPrice(product.price)}</span>
                                                {product.price_strikethrough && (
                                                    <span className="text-xs text-red-500 line-through">
                                                        {formatPrice(product.price_strikethrough)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{product.courses_count}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={product.is_published ? 'default' : 'secondary'}>
                                                {product.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{product.created_at}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link href={edit(product.slug).url}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setConfirmDelete(product)}
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

                <AppPagination meta={products.meta} links={products.links} />
            </div>

            <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Produk</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>{confirmDelete?.title}</strong>?
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

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Products', href: index.url() },
    ],
};
