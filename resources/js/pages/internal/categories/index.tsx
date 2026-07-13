import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { create, destroy, edit } from '@/actions/App/Http/Controllers/Internal/CategoryController';
import { index } from '@/routes/internal/categories';
import type { PaginatedResource } from '@/types/ui';

type Category = {
    id: number;
    name: string;
    slug: string;
    courses_count: number;
    created_at: string;
};

export default function CategoriesIndex({ categories }: { categories: PaginatedResource<Category> }) {
    const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

    function handleDelete() {
        if (!confirmDelete) return;
        router.delete(destroy(confirmDelete.slug).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Categories</h1>
                        <p className="text-muted-foreground text-sm">Kelola kategori course.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tambah Category
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-center">Courses</TableHead>
                                <TableHead className="text-center">Dibuat</TableHead>
                                <TableHead className="w-24 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                                        Belum ada category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-sm">{category.slug}</TableCell>
                                        <TableCell className="text-center">{category.courses_count}</TableCell>
                                        <TableCell className="text-center">{category.created_at}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link href={edit(category.slug).url}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setConfirmDelete(category)}
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

                <AppPagination meta={categories.meta} links={categories.links} />
            </div>

            <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Category</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>{confirmDelete?.name}</strong>? Course yang terkait tidak akan ikut terhapus.
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

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Categories', href: index.url() },
    ],
};
