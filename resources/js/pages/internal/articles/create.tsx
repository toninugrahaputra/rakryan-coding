import type { OutputData } from '@editorjs/editorjs';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { store } from '@/actions/App/Http/Controllers/Internal/ArticleController';
import { store as storeEditorImage } from '@/actions/App/Http/Controllers/Internal/EditorImageController';
import EditorJsComponent from '@/components/editor-js';
import type { EditorJsRef } from '@/components/editor-js';
import ThumbnailUpload from '@/components/thumbnail-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { slugify } from '@/lib/slugify';
import { uploadEditorImages } from '@/lib/uploadEditorImages';
import { index } from '@/routes/internal/articles';

export default function ArticlesCreate() {
    const editorRef = useRef<EditorJsRef>(null);

    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: null as OutputData | null,
        is_published: false,
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const title = e.target.value;
        setForm((prev) => ({ ...prev, title, slug: slugify(title) }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const { data: flushedContent, files: imageFiles } =
            await editorRef.current!.flush();

        let finalContent = flushedContent;

        if (imageFiles.length > 0) {
            const uploadUrl = storeEditorImage({
                context: 'articles',
                identifier: form.slug,
            }).url;
            const result = await uploadEditorImages(
                flushedContent,
                imageFiles,
                uploadUrl,
            );

            if (!result.ok) {
                setErrors({
                    content: `Gagal mengupload gambar ke-${result.failedIndexes.join(', ')}. Periksa koneksi dan coba lagi.`,
                });
                setProcessing(false);

                return;
            }

            finalContent = result.content;
        }

        router.post(
            store.url(),
            {
                title: form.title,
                slug: form.slug,
                excerpt: form.excerpt,
                content: finalContent,
                is_published: form.is_published,
                thumbnail: thumbnailFile,
            },
            {
                onError: (errs) => {
                    setErrors(errs);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <>
            <Head title="Tambah Artikel" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Artikel</h1>
                    <p className="text-sm text-muted-foreground">
                        Buat artikel baru.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl border p-6">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={handleTitleChange}
                                placeholder="Judul artikel"
                                autoFocus
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={form.slug}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        slug: e.target.value,
                                    }))
                                }
                                placeholder="judul-artikel"
                            />
                            {errors.slug && (
                                <p className="text-sm text-destructive">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="excerpt">Ringkasan</Label>
                            <textarea
                                id="excerpt"
                                value={form.excerpt}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        excerpt: e.target.value,
                                    }))
                                }
                                placeholder="Ringkasan singkat artikel, tampil di card..."
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.excerpt && (
                                <p className="text-sm text-destructive">
                                    {errors.excerpt}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Thumbnail</Label>
                            {errors.thumbnail && (
                                <p className="text-sm text-destructive">
                                    {errors.thumbnail}
                                </p>
                            )}
                            <ThumbnailUpload onFileChange={setThumbnailFile} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Konten</Label>
                            {errors.content && (
                                <p className="text-sm text-destructive">
                                    {errors.content}
                                </p>
                            )}
                            <EditorJsComponent
                                ref={editorRef}
                                value={form.content}
                                onChange={(data) =>
                                    setForm((p) => ({ ...p, content: data }))
                                }
                                deferUpload
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="is_published"
                                checked={form.is_published}
                                onCheckedChange={(val) =>
                                    setForm((p) => ({
                                        ...p,
                                        is_published: val,
                                    }))
                                }
                            />
                            <Label htmlFor="is_published">
                                Publish sekarang
                            </Label>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-2xl gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Tambah Artikel'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <a href={index.url()}>Batal</a>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ArticlesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Artikel', href: index.url() },
        { title: 'Tambah Artikel', href: '#' },
    ],
};
