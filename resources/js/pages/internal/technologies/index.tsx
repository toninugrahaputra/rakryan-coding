import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { useState } from 'react';
import { create, destroy, edit } from '@/actions/App/Http/Controllers/Internal/TechnologyController';
import { AppPagination } from '@/components/app-pagination';
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
import { index } from '@/routes/internal/technologies';
import type { PaginatedResource } from '@/types/ui';

type Technology = {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    courses_count: number;
    created_at: string;
};

export default function TechnologiesIndex({ technologies }: { technologies: PaginatedResource<Technology> }) {
    const [confirmDelete, setConfirmDelete] = useState<Technology | null>(null);

    function handleDelete() {
        if (!confirmDelete) {
return;
}

        router.delete(destroy(confirmDelete.slug).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title="Technologies" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Technologies</h1>
                        <p className="text-muted-foreground text-sm">Kelola tools/teknologi yang bisa dipasangkan ke course.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tambah Tool
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-14">Logo</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-center">Courses</TableHead>
                                <TableHead className="text-center">Dibuat</TableHead>
                                <TableHead className="w-24 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {technologies.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                                        Belum ada tool.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                technologies.data.map((technology) => (
                                    <TableRow key={technology.id}>
                                        <TableCell>
                                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                                {technology.logo_url ? (
                                                    <img src={technology.logo_url} alt={technology.name} className="h-full w-full object-contain p-1" />
                                                ) : (
                                                    <Wrench className="text-muted-foreground h-4 w-4" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{technology.name}</TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-sm">{technology.slug}</TableCell>
                                        <TableCell className="text-center">{technology.courses_count}</TableCell>
                                        <TableCell className="text-center">{technology.created_at}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link href={edit(technology.slug).url}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setConfirmDelete(technology)}
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

                <AppPagination meta={technologies.meta} links={technologies.links} />
            </div>

            <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Tool</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>{confirmDelete?.name}</strong>? Tool ini akan dilepas dari semua course yang memakainya.
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

TechnologiesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Technologies', href: index.url() },
    ],
};
