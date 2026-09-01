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
import { destroy, edit, reorder } from '@/actions/App/Http/Controllers/Internal/ProductGuideController';
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
import { index as productsIndex } from '@/routes/internal/products';
import { create } from '@/routes/internal/products/guides';

type Guide = { id: number; slug: string; title: string; order: number; is_published: boolean };
type Product = { id: number; slug: string; title: string };

function SortableGuideRow({
    guide,
    order,
    product,
    onDeleteClick,
}: {
    guide: Guide;
    order: number;
    product: Product;
    onDeleteClick: (guide: Guide) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: guide.id });

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
            <TableCell className="font-medium">{guide.title}</TableCell>
            <TableCell className="text-center">
                <Badge variant={guide.is_published ? 'default' : 'secondary'}>
                    {guide.is_published ? 'Published' : 'Draft'}
                </Badge>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={edit({ product: product.slug, guide: guide.slug }).url}>
                            <Pencil />
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDeleteClick(guide)}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </TableCell>
        </tr>
    );
}

export default function GuidesIndex({ product, guides }: { product: Product; guides: Guide[] }) {
    const [prevGuides, setPrevGuides] = useState(guides);
    const [orderedGuides, setOrderedGuides] = useState(guides);
    const [confirmDelete, setConfirmDelete] = useState<Guide | null>(null);

    if (guides !== prevGuides) {
        setPrevGuides(guides);
        setOrderedGuides(guides);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = orderedGuides.findIndex((g) => g.id === active.id);
        const newIndex = orderedGuides.findIndex((g) => g.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reordered = arrayMove(orderedGuides, oldIndex, newIndex);
        setOrderedGuides(reordered);

        router.patch(
            reorder({ product: product.slug }).url,
            { order: reordered.map((g) => g.id) },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    toast.error('Gagal menyimpan urutan panduan. Urutan dikembalikan seperti semula.');
                    setOrderedGuides(guides);
                },
            },
        );
    }

    function handleDelete() {
        if (!confirmDelete) {
            return;
        }

        router.delete(destroy({ product: product.slug, guide: confirmDelete.slug }).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title={`Panduan Instalasi — ${product.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Panduan Instalasi</h1>
                        <p className="text-muted-foreground text-sm">{product.title}</p>
                    </div>
                    <Button asChild>
                        <Link href={create(product.slug).url}>
                            <Plus />
                            Tambah Panduan
                        </Link>
                    </Button>
                </div>

                {orderedGuides.length > 1 && (
                    <p className="-mt-2 text-xs text-muted-foreground">
                        Geser ikon <GripVertical className="inline h-3 w-3 -mt-0.5" /> untuk mengubah urutan step.
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
                            {orderedGuides.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                                        Belum ada panduan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={orderedGuides.map((g) => g.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {orderedGuides.map((guide, idx) => (
                                            <SortableGuideRow
                                                key={guide.id}
                                                guide={guide}
                                                order={idx + 1}
                                                product={product}
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
                        <DialogTitle>Hapus Panduan</DialogTitle>
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

GuidesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Products', href: productsIndex.url() },
        { title: 'Panduan Instalasi', href: '#' },
    ],
};
