import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update } from '@/actions/App/Http/Controllers/Internal/CategoryController';
import { slugify } from '@/lib/slugify';
import { edit, index } from '@/routes/internal/categories';

type CategoryProp = { id: number; name: string; slug: string };

export default function CategoriesEdit({ category }: { category: CategoryProp }) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Category</h1>
                    <p className="text-muted-foreground text-sm">Perbarui detail kategori.</p>
                </div>

                <div className="mx-auto w-full max-w-2xl rounded-xl border p-6">
                    <Form action={update(category.slug).url} method="put">
                        {({ errors, processing }) => (
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        defaultValue={category.name}
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
                                        defaultValue={category.slug}
                                        placeholder="url-friendly-slug"
                                    />
                                    {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
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
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

CategoriesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Categories', href: index.url() },
        { title: 'Edit Category', href: '#' },
    ],
};
