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
import { destroy, edit } from '@/actions/App/Http/Controllers/Internal/CourseContentController';
import { create, index } from '@/routes/internal/courses/contents';
import { index as coursesIndex } from '@/routes/internal/courses';

type Content = { id: number; slug: string; title: string; order: number; is_published: boolean };
type Course = { id: number; slug: string; title: string };

export default function ContentsIndex({ course, contents }: { course: Course; contents: Content[] }) {
    const [confirmDelete, setConfirmDelete] = useState<Content | null>(null);

    function handleDelete() {
        if (!confirmDelete) return;
        router.delete(destroy({ course: course.slug, content: confirmDelete.slug }).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title={`Konten — ${course.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Konten Course</h1>
                        <p className="text-muted-foreground text-sm">{course.title}</p>
                    </div>
                    <Button asChild>
                        <Link href={create(course.slug).url}>
                            <Plus />
                            Tambah Konten
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">Urutan</TableHead>
                                <TableHead>Judul</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="w-28 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                                        Belum ada konten.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contents.map((content) => (
                                    <TableRow key={content.id}>
                                        <TableCell className="text-center font-mono text-sm">{content.order}</TableCell>
                                        <TableCell className="font-medium">{content.title}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={content.is_published ? 'default' : 'secondary'}>
                                                {content.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link href={edit({ course: course.slug, content: content.slug }).url}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setConfirmDelete(content)}
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
            </div>

            <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Konten</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>{confirmDelete?.title}</strong>? Tindakan ini tidak dapat dibatalkan.
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

ContentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Courses', href: coursesIndex.url() },
        { title: 'Konten', href: '#' },
    ],
};
