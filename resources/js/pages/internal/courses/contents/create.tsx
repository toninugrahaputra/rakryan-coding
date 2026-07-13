import { Head, router } from '@inertiajs/react';
import type { OutputData } from '@editorjs/editorjs';
import { useRef, useState } from 'react';
import EditorJsComponent, { type EditorJsRef } from '@/components/editor-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { store } from '@/actions/App/Http/Controllers/Internal/CourseContentController';
import { store as storeEditorImage } from '@/actions/App/Http/Controllers/Internal/EditorImageController';
import { uploadEditorImages } from '@/lib/uploadEditorImages';
import { slugify } from '@/lib/slugify';
import { index } from '@/routes/internal/courses/contents';
import { index as coursesIndex } from '@/routes/internal/courses';

type Course = { id: number; slug: string; title: string };

export default function ContentsCreate({ course }: { course: Course }) {
    const editorRef = useRef<EditorJsRef>(null);

    const [form, setForm] = useState({
        section_name: '',
        title: '',
        slug: '',
        content: null as OutputData | null,
        sub_topics: '',
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
            const uploadUrl = storeEditorImage({ context: `courses/${course.slug}`, identifier: form.slug }).url;
            const result = await uploadEditorImages(flushedContent, imageFiles, uploadUrl);

            if (!result.ok) {
                setErrors({ content: `Gagal mengupload gambar ke-${result.failedIndexes.join(', ')}. Periksa koneksi dan coba lagi.` });
                setProcessing(false);
                return;
            }

            finalContent = result.content;
        }

        router.post(store(course.slug).url, {
            section_name: form.section_name,
            title: form.title,
            slug: form.slug,
            content: finalContent as any,
            sub_topics: form.sub_topics,
            is_published: form.is_published,
        }, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Tambah Konten" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Konten</h1>
                    <p className="text-muted-foreground text-sm">{course.title}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="rounded-xl border p-6 flex flex-col gap-6">
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="section_name">Nama Grup / Bab Besar (Section) - Opsional</Label>
                                <Input
                                    id="section_name"
                                    value={form.section_name}
                                    onChange={(e) => setForm((p) => ({ ...p, section_name: e.target.value }))}
                                    placeholder="Contoh: Persiapan Awal"
                                />
                                {errors.section_name && <p className="text-destructive text-sm">{errors.section_name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">Judul</Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={(e) => {
                                            const title = e.target.value;
                                            setForm((p) => ({ ...p, title, slug: slugify(title) }));
                                        }}
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

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="sub_topics">Rincian Sub-Materi (tulis satu per baris) - Opsional</Label>
                                <textarea
                                    id="sub_topics"
                                    value={form.sub_topics}
                                    onChange={(e) => setForm((p) => ({ ...p, sub_topics: e.target.value }))}
                                    placeholder="Contoh:&#10;pengenalan project&#10;Penjelasan Desain Database"
                                    className="border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[100px] w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                    rows={4}
                                />
                                {errors.sub_topics && <p className="text-destructive text-sm">{errors.sub_topics}</p>}
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
                            {processing ? 'Menyimpan...' : 'Tambah Konten'}
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

ContentsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Courses', href: coursesIndex.url() },
        { title: 'Konten', href: '#' },
        { title: 'Tambah Konten', href: '#' },
    ],
};
