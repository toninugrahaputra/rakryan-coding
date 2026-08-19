import { Head, router } from '@inertiajs/react';
import { Eye, UserCheck, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/internal';
import { index } from '@/routes/internal/visits';

interface Visit {
    id: number;
    user_name: string;
    user_email: string;
    path: string;
    visited_at: string;
}

interface VisitsIndexProps {
    stats: {
        date: string;
        total_visits: number;
        guest_visits: number;
        unique_logged_in_visitors: number;
        visits: Visit[];
    };
}

const todayString = new Date().toISOString().split('T')[0];

export default function VisitsIndex({ stats }: VisitsIndexProps) {
    function handleDateChange(date: string) {
        router.get(
            index.url(),
            { date },
            { preserveState: true, preserveScroll: true },
        );
    }

    const statCards = [
        { label: 'Total Kunjungan', value: stats.total_visits, icon: Eye },
        {
            label: 'Pengunjung Terdaftar',
            value: stats.unique_logged_in_visitors,
            icon: UserCheck,
        },
        { label: 'Kunjungan Tamu', value: stats.guest_visits, icon: Users },
    ];

    return (
        <>
            <Head title="Kunjungan Website" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold sm:text-2xl">
                            Kunjungan Website
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pantau siapa saja yang login dan mengunjungi
                            website per hari.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="date">Tanggal</Label>
                        <Input
                            id="date"
                            type="date"
                            max={todayString}
                            value={stats.date}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-40"
                        />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                    {statCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card key={card.label} className="py-3 sm:py-6">
                                <CardContent className="flex items-center gap-3 px-4 sm:gap-4 sm:px-6">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {card.label}
                                        </p>
                                        <p className="truncate text-xl font-bold text-foreground">
                                            {card.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Pengunjung Terdaftar
                    </h2>
                    <div className="overflow-hidden rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Halaman</TableHead>
                                    <TableHead className="text-center">
                                        Jam
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.visits.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada user login yang
                                            mengunjungi website di tanggal
                                            ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.visits.map((visit) => (
                                        <TableRow key={visit.id}>
                                            <TableCell className="font-medium">
                                                {visit.user_name}
                                            </TableCell>
                                            <TableCell>
                                                {visit.user_email}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {visit.path}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {visit.visited_at}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

VisitsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard.url() },
        { title: 'Kunjungan', href: index.url() },
    ],
};
