import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CourseSheetSelector } from '@/components/course-sheet-selector';
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
import { store } from '@/actions/App/Http/Controllers/Internal/ProductController';
import { slugify } from '@/lib/slugify';
import { create, index } from '@/routes/internal/products';

type Course = { id: number; title: string };

export default function ProductsCreate({ courses }: { courses: Course[] }) {
    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        type: 'single' as 'single' | 'bundle',
        price: '',
        price_strikethrough: '',
        is_published: false,
        is_favourite: false,
        course_ids: [] as number[],
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const title = e.target.value;
        setForm((prev) => ({ ...prev, title, slug: slugify(title) }));
    }

    function handleTypeChange(type: 'single' | 'bundle') {
        setForm((prev) => ({ ...prev, type, course_ids: [] }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(
            store.url(),
            {
                ...form,
                price: form.price === '' ? '' : Number(form.price),
                price_strikethrough: form.price_strikethrough === '' ? null : Number(form.price_strikethrough),
                thumbnail: thumbnailFile,
            },
            {
                onError: (errs) => { setErrors(errs); setProcessing(false); },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Tambah Produk" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Produk</h1>
                    <p className="text-muted-foreground text-sm">Buat produk baru.</p>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl rounded-xl border p-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input id="title" value={form.title} onChange={handleTitleChange} placeholder="Judul produk" autoFocus />
                            {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={form.slug}
                                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                                placeholder="judul-produk"
                            />
                            {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Deskripsi singkat produk..."
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

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="price">Harga (Rp)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    value={form.price}
                                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="0"
                                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                {errors.price && <p className="text-destructive text-sm">{errors.price}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="price_strikethrough">Harga Coret (Rp)</Label>
                                <Input
                                    id="price_strikethrough"
                                    type="number"
                                    min="0"
                                    value={form.price_strikethrough}
                                    onChange={(e) => setForm((p) => ({ ...p, price_strikethrough: e.target.value }))}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    placeholder="Kosongkan jika tidak ada"
                                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                {errors.price_strikethrough && <p className="text-destructive text-sm">{errors.price_strikethrough}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="type">Tipe</Label>
                            <Select value={form.type} onValueChange={handleTypeChange}>
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">Single (1 course)</SelectItem>
                                    <SelectItem value="bundle">Bundle (beberapa course)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>
                                Course{form.type === 'bundle' ? 's' : ''}
                                <span className="text-muted-foreground ml-1 text-xs">
                                    {form.type === 'single' ? '(pilih 1)' : '(pilih beberapa)'}
                                </span>
                            </Label>
                            <CourseSheetSelector
                                courses={courses}
                                value={form.course_ids}
                                onChange={(ids) => setForm((p) => ({ ...p, course_ids: ids }))}
                                type={form.type}
                                error={errors.course_ids}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_published"
                                    checked={form.is_published}
                                    onCheckedChange={(val) => setForm((p) => ({ ...p, is_published: val }))}
                                />
                                <Label htmlFor="is_published">Publish sekarang</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_favourite"
                                    checked={form.is_favourite}
                                    onCheckedChange={(val) => setForm((p) => ({ ...p, is_favourite: val }))}
                                />
                                <Label htmlFor="is_favourite">Tandai sebagai favorit</Label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Tambah Produk'}
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

ProductsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Products', href: index.url() },
        { title: 'Tambah Produk', href: create.url() },
    ],
};
