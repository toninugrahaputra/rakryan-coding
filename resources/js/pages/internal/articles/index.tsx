import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    create,
    destroy,
    edit,
} from '@/actions/App/Http/Controllers/Internal/ArticleController';
import { AppPagination } from '@/components/app-pagination';
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
import { index } from '@/routes/internal/articles';
import type { PaginatedResource } from '@/types/ui';

type Article = {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
};

export default function ArticlesIndex({
    articles,
}: {
    articles: PaginatedResource<Article>;
}) {
    const [confirmDelete, setConfirmDelete] = useState<Article | null>(null);

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
            <Head title="Artikel" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Artikel</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola artikel yang tampil di landing page.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tambah Artikel
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul</TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-center">
                                    Dibuat
                                </TableHead>
                                <TableHead className="w-24 text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Belum ada artikel.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                articles.data.map((article) => (
                                    <TableRow key={article.id}>
                                        <TableCell className="font-medium">
                                            {article.title}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    article.is_published
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {article.is_published
                                                    ? 'Published'
                                                    : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {article.created_at}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            edit(article.slug)
                                                                .url
                                                        }
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() =>
                                                        setConfirmDelete(
                                                            article,
                                                        )
                                                    }
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

                <AppPagination meta={articles.meta} links={articles.links} />
            </div>

            <Dialog
                open={!!confirmDelete}
                onOpenChange={(open) => !open && setConfirmDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Artikel</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus{' '}
                            <strong>{confirmDelete?.title}</strong>? Tindakan
                            ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDelete(null)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ArticlesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Artikel', href: index.url() },
    ],
};
