import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    create,
    destroy,
    edit,
} from '@/actions/App/Http/Controllers/Internal/UserController';
import { AppPagination } from '@/components/app-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/internal/users';
import { ONBOARDING_STATUS_LABELS } from '@/types/onboarding';
import type { Onboarding } from '@/types/onboarding';
import type { PaginatedResource } from '@/types/ui';

type User = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: string[];
    onboarding: Onboarding;
};

export default function UsersIndex({
    users,
}: {
    users: PaginatedResource<User>;
}) {
    const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
    const [viewOnboarding, setViewOnboarding] = useState<User | null>(null);

    function handleDelete() {
        if (!confirmDelete) {
            return;
        }

        router.delete(destroy(confirmDelete.id).url, {
            onSuccess: () => setConfirmDelete(null),
        });
    }

    return (
        <>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Users</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua user yang terdaftar.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Tambah User
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-center">
                                    Role
                                </TableHead>
                                <TableHead className="text-center">
                                    Onboarding
                                </TableHead>
                                <TableHead className="text-center">
                                    Terdaftar
                                </TableHead>
                                <TableHead className="w-24 text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        Belum ada user.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-center">
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant={
                                                        role === 'admin'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {role}
                                                </Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    user.onboarding
                                                        .onboarded_at &&
                                                    setViewOnboarding(user)
                                                }
                                                disabled={
                                                    !user.onboarding
                                                        .onboarded_at
                                                }
                                                className="disabled:cursor-not-allowed"
                                            >
                                                <Badge
                                                    variant={
                                                        user.onboarding
                                                            .onboarded_at
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {user.onboarding
                                                        .onboarded_at
                                                        ? 'Sudah — lihat detail'
                                                        : 'Belum'}
                                                </Badge>
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {user.created_at}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(user.id).url}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() =>
                                                        setConfirmDelete(user)
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AppPagination meta={users.meta} links={users.links} />
            </div>

            <Dialog
                open={!!confirmDelete}
                onOpenChange={(open) => !open && setConfirmDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus User</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus{' '}
                            <strong>{confirmDelete?.name}</strong>? Tindakan ini
                            tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDelete(null)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!viewOnboarding}
                onOpenChange={(open) => !open && setViewOnboarding(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Data Onboarding — {viewOnboarding?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Data demografi yang diisi user saat pertama kali
                            daftar.
                        </DialogDescription>
                    </DialogHeader>
                    {viewOnboarding && (
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-muted-foreground">
                                    Asal Wilayah
                                </dt>
                                <dd className="text-sm font-medium">
                                    {viewOnboarding.onboarding.region}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">
                                    Dari Mana Tahu Rakryan Coding
                                </dt>
                                <dd className="text-sm font-medium">
                                    {viewOnboarding.onboarding.info_source}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">
                                    Status
                                </dt>
                                <dd className="text-sm font-medium">
                                    {ONBOARDING_STATUS_LABELS[
                                        viewOnboarding.onboarding.status ?? ''
                                    ] ?? viewOnboarding.onboarding.status}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-muted-foreground">
                                    Mengisi Pada
                                </dt>
                                <dd className="text-sm font-medium">
                                    {viewOnboarding.onboarding.onboarded_at}
                                </dd>
                            </div>
                            {viewOnboarding.onboarding.additional_notes && (
                                <div className="sm:col-span-2">
                                    <dt className="text-xs text-muted-foreground">
                                        Catatan Tambahan
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {
                                            viewOnboarding.onboarding
                                                .additional_notes
                                        }
                                    </dd>
                                </div>
                            )}
                        </dl>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setViewOnboarding(null)}
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Users', href: index.url() },
    ],
};
