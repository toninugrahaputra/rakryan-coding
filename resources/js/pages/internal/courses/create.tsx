import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { store } from '@/actions/App/Http/Controllers/Internal/CourseController';
import GalleryUpload from '@/components/gallery-upload';
import ThumbnailUpload from '@/components/thumbnail-upload';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { create, index } from '@/routes/internal/courses';

type Category = { id: number; name: string };
type Technology = { id: number; name: string; slug: string; logo_url: string | null };

export default function CoursesCreate({ categories, technologies }: { categories: Category[]; technologies: Technology[] }) {
    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        category_id: '',
        is_published: false,
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [technologyIds, setTechnologyIds] = useState<number[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const title = e.target.value;
        setForm((prev) => ({ ...prev, title, slug: slugify(title) }));
    }

    function toggleTechnology(id: number, checked: boolean) {
        setTechnologyIds((prev) => (checked ? [...prev, id] : prev.filter((tid) => tid !== id)));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(store.url(), { ...form, thumbnail: thumbnailFile, gallery: galleryFiles, technology_ids: technologyIds }, {
            onError: (errs) => {
 setErrors(errs); setProcessing(false);
},
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Tambah Course" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Course</h1>
                    <p className="text-muted-foreground text-sm">Buat course baru.</p>
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
                                placeholder="judul-course"
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
                            <ThumbnailUpload onFileChange={setThumbnailFile} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Galeri hasil project (maks. 4 gambar)</Label>
                            {errors.gallery && <p className="text-destructive text-sm">{errors.gallery}</p>}
                            <GalleryUpload onFilesChange={setGalleryFiles} maxImages={4} />
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

                        <div className="flex flex-col gap-2">
                            <Label>Tools yang digunakan</Label>
                            {errors.technology_ids && <p className="text-destructive text-sm">{errors.technology_ids}</p>}
                            {technologies.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    Belum ada tool. Tambahkan dulu di menu Technologies.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {technologies.map((tech) => (
                                        <label
                                            key={tech.id}
                                            htmlFor={`tech-${tech.id}`}
                                            className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border p-2"
                                        >
                                            <Checkbox
                                                id={`tech-${tech.id}`}
                                                checked={technologyIds.includes(tech.id)}
                                                onCheckedChange={(checked) => toggleTechnology(tech.id, checked === true)}
                                            />
                                            {tech.logo_url && (
                                                <img src={tech.logo_url} alt={tech.name} className="h-5 w-5 object-contain" />
                                            )}
                                            <span className="text-sm">{tech.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_published"
                                checked={form.is_published}
                                onCheckedChange={(val) => setForm((p) => ({ ...p, is_published: val }))}
                            />
                            <Label htmlFor="is_published">Publish sekarang</Label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Tambah Course'}
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

CoursesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Courses', href: index.url() },
        { title: 'Tambah Course', href: create.url() },
    ],
};
