import { Form, Head } from '@inertiajs/react';
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
import { update } from '@/actions/App/Http/Controllers/Internal/UserController';
import { edit, index } from '@/routes/internal/users';

type UserProp = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function UsersEdit({ user, roles }: { user: UserProp; roles: string[] }) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Edit User</h1>
                    <p className="text-muted-foreground text-sm">Perbarui detail dan peran user.</p>
                </div>

                <div className="mx-auto w-full max-w-lg rounded-xl border p-6">
                    <Form action={update(user.id).url} method="put">
                        {({ errors, processing }) => (
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        defaultValue={user.name}
                                        placeholder="Nama lengkap"
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="text-destructive text-sm">{errors.name}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={user.email}
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-destructive text-sm">{errors.email}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">
                                        Kata Sandi Baru{' '}
                                        <span className="text-muted-foreground font-normal">(opsional)</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Kosongkan jika tidak diubah"
                                    />
                                    {errors.password && (
                                        <p className="text-destructive text-sm">{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi Baru</Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        placeholder="Ulangi kata sandi baru"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select name="role" defaultValue={user.role}>
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Pilih peran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role} value={role} className="capitalize">
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-destructive text-sm">{errors.role}</p>
                                    )}
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

UsersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'User', href: index.url() },
        { title: 'Edit User', href: '#' },
    ],
};
