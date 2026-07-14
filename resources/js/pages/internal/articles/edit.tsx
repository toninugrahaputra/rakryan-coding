import type { OutputData } from '@editorjs/editorjs';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Internal/ArticleController';
import { store as storeEditorImage } from '@/actions/App/Http/Controllers/Internal/EditorImageController';
import EditorJsComponent from '@/components/editor-js';
import type { EditorJsRef } from '@/components/editor-js';
import ThumbnailUpload from '@/components/thumbnail-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { uploadEditorImages } from '@/lib/uploadEditorImages';
import { index } from '@/routes/internal/articles';

type ArticleProp = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: OutputData | null;
    thumbnail: string | null;
    is_published: boolean;
};

export default function ArticlesEdit({ article }: { article: ArticleProp }) {
    const editorRef = useRef<EditorJsRef>(null);

    const [form, setForm] = useState({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt ?? '',
        content: article.content,
        is_published: article.is_published,
    });
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailCleared, setThumbnailCleared] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

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

        const data: Record<string, unknown> = {
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            content: finalContent,
            is_published: form.is_published,
        };

        if (thumbnailFile) {
            data.thumbnail = thumbnailFile;
        } else if (thumbnailCleared) {
            data.thumbnail = null;
        }

        router.put(update(article.slug).url, data, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title={`Edit — ${article.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Artikel</h1>
                    <p className="text-sm text-muted-foreground">
                        Perbarui detail artikel.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-xl border p-6">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        title: e.target.value,
                                    }))
                                }
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
                            <ThumbnailUpload
                                existingUrl={
                                    thumbnailCleared ? null : article.thumbnail
                                }
                                onFileChange={setThumbnailFile}
                                onClearExisting={() => {
                                    setThumbnailCleared(true);
                                    setThumbnailFile(null);
                                }}
                            />
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
                            <Label htmlFor="is_published">Published</Label>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-4xl gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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

ArticlesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Artikel', href: index.url() },
        { title: 'Edit Artikel', href: '#' },
    ],
};
