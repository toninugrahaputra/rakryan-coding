import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { create, destroy, edit } from '@/actions/App/Http/Controllers/Internal/CourseController';
import { index as contentsIndex } from '@/routes/internal/courses/contents';
import { index } from '@/routes/internal/courses';
import type { PaginatedResource } from '@/types/ui';

type Course = {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    is_published: boolean;
    category?: string | null;
    contents_count: number;
    created_at: string;
};

export default function CoursesIndex({ courses }: { courses: PaginatedResource<Course> }) {
    const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);

    function handleDelete() {
        if (!confirmDelete) return;
        router.delete(destroy(confirmDelete.slug).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title="Courses" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Courses</h1>
                        <p className="text-muted-foreground text-sm">Kelola semua course yang tersedia.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tambah Course
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-center">Konten</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Dibuat</TableHead>
                                <TableHead className="w-32 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                                        Belum ada course.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.data.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell>
                                            {course.category ? (
                                                <Badge variant="outline">{course.category}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{course.contents_count}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={course.is_published ? 'default' : 'secondary'}>
                                                {course.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{course.created_at}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="outline" size="icon" asChild title="Kelola konten">
                                                    <Link href={contentsIndex(course.slug).url}>
                                                        <BookOpen />
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link href={edit(course.slug).url}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => setConfirmDelete(course)}
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

                <AppPagination meta={courses.meta} links={courses.links} />
            </div>

            <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Course</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus <strong>{confirmDelete?.title}</strong>? Semua konten di dalamnya juga akan dihapus.
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

CoursesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Courses', href: index.url() },
    ],
};
