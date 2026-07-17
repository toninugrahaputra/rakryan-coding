import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { store } from '@/actions/App/Http/Controllers/Internal/TechnologyController';
import ThumbnailUpload from '@/components/thumbnail-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { slugify } from '@/lib/slugify';
import { create, index } from '@/routes/internal/technologies';

export default function TechnologiesCreate() {
    const [form, setForm] = useState({ name: '', slug: '' });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value;
        setForm((prev) => ({ ...prev, name, slug: slugify(name) }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(store.url(), { ...form, logo: logoFile }, {
            onError: (errs) => {
 setErrors(errs); setProcessing(false);
},
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Tambah Tool" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Tool</h1>
                    <p className="text-muted-foreground text-sm">Buat tool/teknologi baru untuk dipakai di course.</p>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl rounded-xl border p-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input id="name" value={form.name} onChange={handleNameChange} placeholder="mis. Laravel" autoFocus />
                            {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={form.slug}
                                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                                placeholder="laravel"
                            />
                            {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Logo</Label>
                            {errors.logo && <p className="text-destructive text-sm">{errors.logo}</p>}
                            <ThumbnailUpload onFileChange={setLogoFile} aspectRatio="1:1" />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Tambah Tool'}
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

TechnologiesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Technologies', href: index.url() },
        { title: 'Tambah Tool', href: create.url() },
    ],
};
