import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/actions/App/Http/Controllers/Internal/CategoryController';
import { slugify } from '@/lib/slugify';
import { create, index } from '@/routes/internal/categories';

export default function CategoriesCreate() {
    return (
        <>
            <Head title="Tambah Category" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Tambah Category</h1>
                    <p className="text-muted-foreground text-sm">Buat kategori course baru.</p>
                </div>

                <div className="mx-auto w-full max-w-lg rounded-xl border p-6">
                    <Form action={store.url()} method="post">
                        {({ errors, processing }) => (
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Nama kategori"
                                        autoFocus
                                        onChange={(e) => {
                                            const slug = document.getElementById('slug') as HTMLInputElement;
                                            if (slug) slug.value = slugify(e.target.value);
                                        }}
                                    />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        type="text"
                                        placeholder="url-friendly-slug"
                                    />
                                    {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Tambah Category'}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <a href={index.url()}>Batal</a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

CategoriesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Categories', href: index.url() },
        { title: 'Tambah Category', href: create.url() },
    ],
};
