import type { OutputData } from '@editorjs/editorjs';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { store as storeEditorImage } from '@/actions/App/Http/Controllers/Internal/EditorImageController';
import { store } from '@/actions/App/Http/Controllers/Internal/ProductGuideController';
import EditorJsComponent from '@/components/editor-js';
import type {EditorJsRef} from '@/components/editor-js';
import ScrollToTopBottom from '@/components/scroll-to-top-bottom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { slugify } from '@/lib/slugify';
import { uploadEditorImages } from '@/lib/uploadEditorImages';
import { index as productsIndex } from '@/routes/internal/products';
import { index } from '@/routes/internal/products/guides';

type Product = { id: number; slug: string; title: string };

export default function GuidesCreate({ product }: { product: Product }) {
    const editorRef = useRef<EditorJsRef>(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: null as OutputData | null,
        is_published: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const { data: flushedContent, files: imageFiles } = await editorRef.current!.flush();

        let finalContent = flushedContent;

        if (imageFiles.length > 0) {
            const uploadUrl = storeEditorImage({ context: `products/${product.slug}/guides`, identifier: form.slug }).url;
            const result = await uploadEditorImages(flushedContent, imageFiles, uploadUrl);

            if (!result.ok) {
                setErrors({ content: `Gagal mengupload gambar ke-${result.failedIndexes.join(', ')}. Periksa koneksi dan coba lagi.` });
                setProcessing(false);

                return;
            }

            finalContent = result.content;
        }

        router.post(store(product.slug).url, {
            title: form.title,
            slug: form.slug,
            content: finalContent as any,
            is_published: form.is_published,
        }, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
                toast.error(Object.values(errs)[0] ?? 'Gagal menyimpan panduan. Periksa isian form.');
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Tambah Panduan" />

            <ScrollToTopBottom />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Panduan Instalasi</h1>
                    <p className="text-muted-foreground text-sm">{product.title}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="rounded-xl border p-6 flex flex-col gap-6">
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">Judul Step</Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={(e) => {
                                            const title = e.target.value;
                                            setForm((p) => ({ ...p, title, slug: slugify(title) }));
                                        }}
                                        placeholder="Contoh: Ekstrak & Buka Project"
                                        autoFocus
                                    />
                                    {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={form.slug}
                                        onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                                        placeholder="slug-step"
                                    />
                                    {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    id="is_published"
                                    checked={form.is_published}
                                    onCheckedChange={(val) => setForm((p) => ({ ...p, is_published: val }))}
                                />
                                <Label htmlFor="is_published">Publish sekarang</Label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Konten</Label>
                            {errors.content && <p className="text-destructive text-sm">{errors.content}</p>}
                            <EditorJsComponent
                                ref={editorRef}
                                value={form.content}
                                onChange={(data) => setForm((p) => ({ ...p, content: data }))}
                                deferUpload
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Tambah Panduan'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <a href={index(product.slug).url}>Batal</a>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

GuidesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Products', href: productsIndex.url() },
        { title: 'Panduan Instalasi', href: '#' },
        { title: 'Tambah Panduan', href: '#' },
    ],
};
