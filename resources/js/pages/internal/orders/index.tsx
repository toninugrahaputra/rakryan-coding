import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Eye, Plus, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AppPagination } from '@/components/app-pagination';
import { create, index, show } from '@/actions/App/Http/Controllers/Internal/OrderController';
import type { PaginatedResource } from '@/types/ui';

type Order = {
    id: number;
    order_number: string;
    status: 'pending' | 'paid' | 'cancel' | 'expired';
    user: { id: number; name: string; email: string } | null;
    product: { id: number; title: string } | null;
    channel_group: string;
    channel_name: string | null;
    total_amount: number;
    paid_at: string | null;
    created_at: string;
};

type Filters = { search?: string; status?: string; channel_group?: string };

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const },
    paid: { label: 'Paid', variant: 'default' as const },
    cancel: { label: 'Cancel', variant: 'destructive' as const },
    expired: { label: 'Expired', variant: 'destructive' as const },
};

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancel', label: 'Cancel' },
    { value: 'expired', label: 'Expired' },
];

const CHANNEL_OPTIONS = ['Transfer', 'Virtual Account', 'QRIS', 'E Wallet'];

function navigate(filters: Filters) {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    router.get(index.url(), params, { preserveState: true, preserveScroll: true, replace: true });
}

export default function OrdersIndex({ orders, filters }: { orders: PaginatedResource<Order>; filters: Filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timer = setTimeout(() => navigate({ ...filters, search: search || undefined }), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const hasFilters = !!(filters.search || filters.status || filters.channel_group);

    return (
        <>
            <Head title="Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Orders</h1>
                        <p className="text-muted-foreground text-sm">Kelola transaksi manual dari user.</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus />
                            Buat Order
                        </Link>
                    </Button>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Cari no. order, nama, atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border p-1">
                        <button
                            onClick={() => navigate({ ...filters, status: undefined })}
                            className={`rounded-md px-3 py-1 text-sm transition-colors ${!filters.status ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Semua
                        </button>
                        {STATUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => navigate({ ...filters, status: filters.status === opt.value ? undefined : opt.value })}
                                className={`rounded-md px-3 py-1 text-sm transition-colors ${filters.status === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <Select
                        value={filters.channel_group ?? ''}
                        onValueChange={(val) => navigate({ ...filters, channel_group: val || undefined })}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semua metode" />
                        </SelectTrigger>
                        <SelectContent>
                            {CHANNEL_OPTIONS.map((ch) => (
                                <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSearch(''); navigate({}); }}
                            className="text-muted-foreground gap-1"
                        >
                            <X className="size-3.5" />
                            Reset
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Order</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Produk</TableHead>
                                <TableHead>Channel</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Dibuat</TableHead>
                                <TableHead className="w-16 text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                                        {hasFilters ? 'Tidak ada order yang cocok dengan filter.' : 'Belum ada order.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm font-medium">
                                            {order.order_number}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{order.user?.name ?? '-'}</span>
                                                <span className="text-muted-foreground text-xs">{order.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.product?.title ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{order.channel_group}</span>
                                                {order.channel_name && (
                                                    <span className="text-muted-foreground text-xs">{order.channel_name}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatPrice(order.total_amount)}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={statusConfig[order.status].variant}>
                                                {statusConfig[order.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{order.created_at}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="outline" size="icon" asChild>
                                                <Link href={show(order.order_number).url}>
                                                    <Eye />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AppPagination meta={orders.meta} links={orders.links} />
            </div>
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: '/internal' },
        { title: 'Orders', href: index.url() },
    ],
};
