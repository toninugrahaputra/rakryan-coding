import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

interface LoggedInVisit {
    id: number;
    user_name: string;
    user_email: string;
    path: string;
    visited_at: string;
}

interface LoggedInVisitsPage {
    data: LoggedInVisit[];
    current_page: number;
    last_page: number;
    total: number;
}

interface HourlyVisit {
    hour: number;
    total_visits: number;
    guest_visits: number;
    logged_in_visits: number;
}

interface VisitsIndexProps {
    stats: {
        date: string;
        total_visits: number;
        guest_visits: number;
        unique_logged_in_visitors: number;
        hourly: HourlyVisit[];
    };
}

const todayString = new Date().toISOString().split('T')[0];

function formatHour(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
}

export default function VisitsIndex({ stats }: VisitsIndexProps) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detail, setDetail] = useState<LoggedInVisitsPage | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    function handleDateChange(date: string) {
        router.get(
            index.url(),
            { date },
            { preserveState: true, preserveScroll: true },
        );
    }

    async function fetchDetail(page: number) {
        setDetailLoading(true);
        try {
            const response = await fetch(
                `/internal/visits/logged-in?date=${stats.date}&page=${page}`,
                { headers: { Accept: 'application/json' } },
            );
            const json = await response.json();
            setDetail(json);
        } finally {
            setDetailLoading(false);
        }
    }

    function openDetail() {
        setIsDetailOpen(true);
        fetchDetail(1);
    }

    const statCards = [
        {
            label: 'Total Kunjungan',
            hint: 'Per akun/sesi unik, bukan per halaman diakses',
            value: stats.total_visits,
            icon: Eye,
        },
        {
            label: 'Pengunjung Terdaftar',
            hint: 'Jumlah akun unik yang login',
            value: stats.unique_logged_in_visitors,
            icon: UserCheck,
            onClick: openDetail,
        },
        {
            label: 'Kunjungan Tamu',
            hint: 'Jumlah sesi tamu unik',
            value: stats.guest_visits,
            icon: Users,
        },
    ];

    const maxHourlyVisits = Math.max(
        ...stats.hourly.map((h) => h.total_visits),
        1,
    );

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
                            Pantau tren kunjungan website per jam untuk
                            tanggal yang dipilih.
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
                            <Card
                                key={card.label}
                                onClick={card.onClick}
                                className={`py-3 sm:py-6 ${card.onClick ? 'cursor-pointer transition-colors hover:bg-muted/40' : ''}`}
                            >
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
                                        <p className="truncate text-[10px] text-muted-foreground">
                                            {card.hint}
                                        </p>
                                        {card.onClick && (
                                            <p className="text-[10px] text-primary">
                                                Klik untuk detail
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Kunjungan per Jam
                    </h2>
                    <div className="overflow-x-auto rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jam</TableHead>
                                    <TableHead>Tren</TableHead>
                                    <TableHead className="text-center">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Tamu
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Terdaftar
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.total_visits === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada kunjungan website di
                                            tanggal ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.hourly.map((row) => (
                                        <TableRow key={row.hour}>
                                            <TableCell className="font-mono text-xs">
                                                {formatHour(row.hour)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-2 w-full max-w-40 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary"
                                                        style={{
                                                            width: `${(row.total_visits / maxHourlyVisits) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {row.total_visits}
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {row.guest_visits}
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {row.logged_in_visits}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Pengunjung Terdaftar</DialogTitle>
                        <DialogDescription>
                            Daftar user login yang mengunjungi website pada{' '}
                            {stats.date}
                            {detail ? ` — total ${detail.total} kunjungan` : ''}
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <div className="overflow-x-auto rounded-xl border [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
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
                                {detailLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            Memuat...
                                        </TableCell>
                                    </TableRow>
                                ) : !detail || detail.data.length === 0 ? (
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
                                    detail.data.map((visit) => (
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

                    {detail && detail.last_page > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={
                                    detailLoading || detail.current_page <= 1
                                }
                                onClick={() =>
                                    fetchDetail(detail.current_page - 1)
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Halaman {detail.current_page} dari{' '}
                                {detail.last_page}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={
                                    detailLoading ||
                                    detail.current_page >= detail.last_page
                                }
                                onClick={() =>
                                    fetchDetail(detail.current_page + 1)
                                }
                            >
                                Berikutnya
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

VisitsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: dashboard.url() },
        { title: 'Kunjungan', href: index.url() },
    ],
};
