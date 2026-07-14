import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Internal/CourseController';
import GalleryUpload from '@/components/gallery-upload';
import ThumbnailUpload from '@/components/thumbnail-upload';
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
import { slugify } from '@/lib/slugify';
import { index } from '@/routes/internal/courses';

type Category = { id: number; name: string };

type CourseProp = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    category_id: number | null;
    is_published: boolean;
    gallery?: Array<{ id: number; url: string }>;
};


export default function CoursesEdit({ course, categories }: { course: CourseProp; categories: Category[] }) {
    const [form, setForm] = useState({
        title: course.title,
        slug: course.slug,
        description: course.description ?? '',
        category_id: course.category_id ? String(course.category_id) : '',
        is_published: course.is_published,
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailCleared, setThumbnailCleared] = useState(false);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [removedGalleryIds, setRemovedGalleryIds] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const title = e.target.value;
        setForm((prev) => ({ ...prev, title, slug: slugify(title) }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const data: Record<string, unknown> = { ...form, gallery: galleryFiles, remove_gallery_ids: removedGalleryIds };

        if (thumbnailFile) {
            data.thumbnail = thumbnailFile;
        } else if (thumbnailCleared) {
            data.thumbnail = null;
        }

        router.put(update(course.slug).url, data, {
            onError: (errs) => {
 setErrors(errs); setProcessing(false); 
},
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title={`Edit ${course.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Course</h1>
                    <p className="text-muted-foreground text-sm">Perbarui detail course.</p>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl rounded-xl border p-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input id="title" value={form.title} onChange={handleTitleChange} placeholder="Judul course" autoFocus />
                            {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={form.slug}
                                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                                placeholder="url-friendly-slug"
                            />
                            {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Deskripsi singkat course..."
                                rows={3}
                                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Thumbnail</Label>
                            {errors.thumbnail && <p className="text-destructive text-sm">{errors.thumbnail}</p>}
                            <ThumbnailUpload
                                existingUrl={thumbnailCleared ? null : course.thumbnail}
                                onFileChange={setThumbnailFile}
                                onClearExisting={() => {
                                    setThumbnailCleared(true);
                                    setThumbnailFile(null);
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Galeri hasil project (maks. 4 gambar)</Label>
                            {errors.gallery && <p className="text-destructive text-sm">{errors.gallery}</p>}
                            <GalleryUpload
                                existingImages={course.gallery ?? []}
                                removedIds={removedGalleryIds}
                                onRemoveExisting={(id) => setRemovedGalleryIds((prev) => [...prev, id])}
                                onFilesChange={setGalleryFiles}
                                maxImages={4}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="category_id">Kategori</Label>
                            <Select
                                value={form.category_id}
                                onValueChange={(val) => setForm((p) => ({ ...p, category_id: val }))}
                            >
                                <SelectTrigger id="category_id">
                                    <SelectValue placeholder="Pilih kategori (opsional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-destructive text-sm">{errors.category_id}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_published"
                                checked={form.is_published}
                                onCheckedChange={(val) => setForm((p) => ({ ...p, is_published: val }))}
                            />
                            <Label htmlFor="is_published">Published</Label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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

CoursesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Courses', href: index.url() },
        { title: 'Edit Course', href: '#' },
    ],
};
