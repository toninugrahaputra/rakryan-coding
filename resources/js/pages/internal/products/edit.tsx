import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Internal/ProductController';
import { CourseSheetSelector } from '@/components/course-sheet-selector';
import GalleryUpload from '@/components/gallery-upload';
import GalleryYoutubeInput from '@/components/gallery-youtube-input';
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
import { edit, index } from '@/routes/internal/products';

type Course = { id: number; title: string };

const MAX_GALLERY_ITEMS = 4;

type ProductProp = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    type: 'single' | 'bundle' | 'source_code';
    platform: 'web' | 'mobile' | null;
    thumbnail: string | null;
    has_source_code_file: boolean;
    price: number;
    price_strikethrough: number | null;
    is_published: boolean;
    is_favourite: boolean;
    course_ids: number[];
    bonus_course_ids: number[];
    gallery?: Array<{ id: number; url: string; type?: 'image' | 'video' }>;
};

export default function ProductsEdit({ product, courses }: { product: ProductProp; courses: Course[] }) {
    const [form, setForm] = useState({
        title: product.title,
        slug: product.slug,
        description: product.description ?? '',
        type: product.type,
        platform: (product.platform ?? '') as '' | 'web' | 'mobile',
        price: String(product.price),
        price_strikethrough: product.price_strikethrough ? String(product.price_strikethrough) : '',
        is_published: product.is_published,
        is_favourite: product.is_favourite,
        course_ids: product.course_ids,
        bonus_course_ids: product.bonus_course_ids,
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailCleared, setThumbnailCleared] = useState(false);
    const [sourceCodeFile, setSourceCodeFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [removedGalleryIds, setRemovedGalleryIds] = useState<number[]>([]);
    const [galleryYoutubeUrls, setGalleryYoutubeUrls] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const title = e.target.value;
        setForm((prev) => ({ ...prev, title, slug: slugify(title) }));
    }

    function handleTypeChange(type: 'single' | 'bundle' | 'source_code') {
        setForm((prev) => ({ ...prev, type, course_ids: [], bonus_course_ids: [], platform: type === 'source_code' ? prev.platform : '' }));

        if (type !== 'source_code') {
            setSourceCodeFile(null);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const data: Record<string, unknown> = {
            ...form,
            price: form.price === '' ? '' : Number(form.price),
            price_strikethrough: form.price_strikethrough === '' ? null : Number(form.price_strikethrough),
            source_code_file: sourceCodeFile,
            gallery: galleryFiles,
            remove_gallery_ids: removedGalleryIds,
            gallery_youtube_urls: galleryYoutubeUrls,
        };

        if (thumbnailFile) {
            data.thumbnail = thumbnailFile;
        } else if (thumbnailCleared) {
            data.thumbnail = null;
        }

        router.put(update(product.slug).url, data, {
            onError: (errs) => {
 setErrors(errs); setProcessing(false); 
},
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title={`Edit ${product.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Produk</h1>
                    <p className="text-muted-foreground text-sm">Perbarui detail produk.</p>
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
                                placeholder="Deskripsi singkat produk..."
                                rows={3}
                                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Thumbnail</Label>
                            {errors.thumbnail && <p className="text-destructive text-sm">{errors.thumbnail}</p>}
                            <ThumbnailUpload
                                existingUrl={thumbnailCleared ? null : product.thumbnail}
                                onFileChange={setThumbnailFile}
                                onClearExisting={() => {
                                    setThumbnailCleared(true);
                                    setThumbnailFile(null);
                                }}
                            />
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
                                    <SelectItem value="source_code">Source Code (tanpa course)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-destructive text-sm">{errors.type}</p>}
                        </div>

                        {form.type === 'source_code' && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="platform">Platform</Label>
                                <Select
                                    value={form.platform}
                                    onValueChange={(val) => setForm((p) => ({ ...p, platform: val as 'web' | 'mobile' }))}
                                >
                                    <SelectTrigger id="platform">
                                        <SelectValue placeholder="Pilih platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="web">Web Development</SelectItem>
                                        <SelectItem value="mobile">Mobile Development</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.platform && <p className="text-destructive text-sm">{errors.platform}</p>}
                            </div>
                        )}

                        {form.type === 'source_code' ? (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="source_code_file">File Source Code (.zip, maks 50MB)</Label>
                                <input
                                    id="source_code_file"
                                    type="file"
                                    accept=".zip"
                                    onChange={(e) => setSourceCodeFile(e.target.files?.[0] ?? null)}
                                    className="border-input file:bg-primary file:text-primary-foreground flex w-full rounded-md border bg-transparent text-sm shadow-xs file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:text-xs file:font-semibold"
                                />
                                {sourceCodeFile ? (
                                    <p className="text-muted-foreground text-xs">{sourceCodeFile.name}</p>
                                ) : product.has_source_code_file ? (
                                    <p className="text-muted-foreground text-xs">File sudah ada. Kosongkan jika tidak ingin menggantinya.</p>
                                ) : null}
                                {errors.source_code_file && <p className="text-destructive text-sm">{errors.source_code_file}</p>}
                            </div>
                        ) : null}

                        {form.type === 'source_code' && (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label>Galeri screenshot/demo (maks. {MAX_GALLERY_ITEMS} item — gambar/video)</Label>
                                    {errors.gallery && <p className="text-destructive text-sm">{errors.gallery}</p>}
                                    <GalleryUpload
                                        existingImages={product.gallery ?? []}
                                        removedIds={removedGalleryIds}
                                        onRemoveExisting={(id) => setRemovedGalleryIds((prev) => [...prev, id])}
                                        onFilesChange={setGalleryFiles}
                                        maxImages={MAX_GALLERY_ITEMS - galleryYoutubeUrls.length}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Video YouTube (opsional)</Label>
                                    {errors.gallery_youtube_urls && (
                                        <p className="text-destructive text-sm">{errors.gallery_youtube_urls}</p>
                                    )}
                                    <GalleryYoutubeInput
                                        urls={galleryYoutubeUrls}
                                        onChange={setGalleryYoutubeUrls}
                                        remainingSlots={
                                            MAX_GALLERY_ITEMS -
                                            (product.gallery ?? []).filter((g) => !removedGalleryIds.includes(g.id)).length -
                                            galleryFiles.length -
                                            galleryYoutubeUrls.length
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {form.type !== 'source_code' && (
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
                        )}

                        {form.type !== 'source_code' && (
                            <div className="flex flex-col gap-2">
                                <Label>
                                    Course Bonus
                                    <span className="text-muted-foreground ml-1 text-xs">
                                        (gratis, tidak tampil di katalog)
                                    </span>
                                </Label>
                                <CourseSheetSelector
                                    courses={courses}
                                    value={form.bonus_course_ids}
                                    onChange={(ids) => setForm((p) => ({ ...p, bonus_course_ids: ids }))}
                                    type="bundle"
                                    error={errors.bonus_course_ids}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_published"
                                    checked={form.is_published}
                                    onCheckedChange={(val) => setForm((p) => ({ ...p, is_published: val }))}
                                />
                                <Label htmlFor="is_published">Published</Label>
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

ProductsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Products', href: index.url() },
        { title: 'Edit Produk', href: '#' },
    ],
};
