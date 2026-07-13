import { Head, router } from '@inertiajs/react';
import type { OutputData } from '@editorjs/editorjs';
import { useRef, useState } from 'react';
import EditorJsComponent, { type EditorJsRef } from '@/components/editor-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { update } from '@/actions/App/Http/Controllers/Internal/CourseContentController';
import { store as storeEditorImage } from '@/actions/App/Http/Controllers/Internal/EditorImageController';
import { uploadEditorImages } from '@/lib/uploadEditorImages';
import { index } from '@/routes/internal/courses/contents';
import { index as coursesIndex } from '@/routes/internal/courses';

type Course = { id: number; slug: string; title: string };
type ContentProp = {
    id: number;
    title: string;
    slug: string;
    content: OutputData | null;
    order: number;
    is_published: boolean;
};

export default function ContentsEdit({ course, content }: { course: Course; content: ContentProp }) {
    const editorRef = useRef<EditorJsRef>(null);

    const [form, setForm] = useState({
        title: content.title,
        slug: content.slug,
        content: content.content as OutputData | null,
        is_published: content.is_published,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const { data: flushedContent, files: imageFiles, deletedUrls } = await editorRef.current!.flush();

        let finalContent = flushedContent;

        if (imageFiles.length > 0) {
            const uploadUrl = storeEditorImage({ context: `courses/${course.slug}`, identifier: form.slug }).url;
            const result = await uploadEditorImages(flushedContent, imageFiles, uploadUrl);

            if (!result.ok) {
                setErrors({ content: `Gagal mengupload gambar ke-${result.failedIndexes.join(', ')}. Periksa koneksi dan coba lagi.` });
                setProcessing(false);
                return;
            }

            finalContent = result.content;
        }

        router.put(update({ course: course.slug, content: content.slug }).url, {
            title: form.title,
            slug: form.slug,
            content: finalContent,
            is_published: form.is_published,
            deleted_images: deletedUrls,
        }, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title={`Edit — ${content.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Konten</h1>
                    <p className="text-muted-foreground text-sm">{course.title}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="rounded-xl border p-6 flex flex-col gap-6">
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">Judul</Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                        placeholder="Judul konten"
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
                                        placeholder="slug-konten"
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
                                <Label htmlFor="is_published">Published</Label>
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
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <a href={index(course.slug).url}>Batal</a>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ContentsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Courses', href: coursesIndex.url() },
        { title: 'Konten', href: '#' },
        { title: 'Edit Konten', href: '#' },
    ],
};
