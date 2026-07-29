import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, router } from '@inertiajs/react';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { destroy, edit, reorder } from '@/actions/App/Http/Controllers/Internal/CourseContentController';
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
import { index as coursesIndex } from '@/routes/internal/courses';
import { create } from '@/routes/internal/courses/contents';

type Content = { id: number; slug: string; title: string; order: number; is_published: boolean };
type Course = { id: number; slug: string; title: string };

function SortableContentRow({
    content,
    order,
    course,
    onDeleteClick,
}: {
    content: Content;
    order: number;
    course: Course;
    onDeleteClick: (content: Content) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: content.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`border-b transition-colors hover:bg-muted/50 ${isDragging ? 'relative z-10 bg-muted/50' : ''}`}
        >
            <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
                        title="Geser untuk mengubah urutan"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-sm">{order}</span>
                </div>
            </TableCell>
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
                        onClick={() => onDeleteClick(content)}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </TableCell>
        </tr>
    );
}

export default function ContentsIndex({ course, contents }: { course: Course; contents: Content[] }) {
    const [prevContents, setPrevContents] = useState(contents);
    const [orderedContents, setOrderedContents] = useState(contents);
    const [confirmDelete, setConfirmDelete] = useState<Content | null>(null);

    if (contents !== prevContents) {
        setPrevContents(contents);
        setOrderedContents(contents);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = orderedContents.findIndex((c) => c.id === active.id);
        const newIndex = orderedContents.findIndex((c) => c.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reordered = arrayMove(orderedContents, oldIndex, newIndex);
        setOrderedContents(reordered);

        router.patch(
            reorder({ course: course.slug }).url,
            { order: reordered.map((c) => c.id) },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    toast.error('Gagal menyimpan urutan konten. Urutan dikembalikan seperti semula.');
                    setOrderedContents(contents);
                },
            },
        );
    }

    function handleDelete() {
        if (!confirmDelete) {
            return;
        }

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

                {orderedContents.length > 1 && (
                    <p className="-mt-2 text-xs text-muted-foreground">
                        Geser ikon <GripVertical className="inline h-3 w-3 -mt-0.5" /> untuk mengubah urutan modul.
                    </p>
                )}

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20 text-center">Urutan</TableHead>
                                <TableHead>Judul</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="w-28 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderedContents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                                        Belum ada konten.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={orderedContents.map((c) => c.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {orderedContents.map((content, idx) => (
                                            <SortableContentRow
                                                key={content.id}
                                                content={content}
                                                order={idx + 1}
                                                course={course}
                                                onDeleteClick={setConfirmDelete}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
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
