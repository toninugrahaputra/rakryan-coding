import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck, Clock, CreditCard, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    raw_date: string;
}

interface NotificationsIndexProps {
    notifications: Notification[];
}

export default function NotificationsIndex({
    notifications = [],
}: NotificationsIndexProps) {
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const [activeTab, setActiveTab] = useState<
        'all' | 'unread' | 'transaction' | 'activity'
    >('all');

    function handleMarkRead(id: number) {
        router.post(`/notifications/${id}/read`);
    }

    function handleMarkAllRead() {
        router.post('/notifications/read-all');
    }

    const isTransaction = (title: string, message: string) => {
        const keywords = [
            /bayar/i,
            /transaksi/i,
            /tagihan/i,
            /invoice/i,
            /pembayaran/i,
            /order/i,
            /pesanan/i,
        ];

        return keywords.some((kw) => kw.test(title) || kw.test(message));
    };

    const filteredNotifications = notifications.filter((notif) => {
        if (activeTab === 'unread') {
            return !notif.is_read;
        }

        if (activeTab === 'transaction') {
            return isTransaction(notif.title, notif.message);
        }

        if (activeTab === 'activity') {
            return !isTransaction(notif.title, notif.message);
        }

        return true;
    });

    // Grouping by Date
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const groupsOrder = ['Hari Ini', 'Kemarin', 'Lebih Lama'];
    const groupedNotifications: { [key: string]: Notification[] } = {
        'Hari Ini': [],
        Kemarin: [],
        'Lebih Lama': [],
    };

    filteredNotifications.forEach((notif) => {
        if (notif.raw_date === todayStr) {
            groupedNotifications['Hari Ini'].push(notif);
        } else if (notif.raw_date === yesterdayStr) {
            groupedNotifications['Kemarin'].push(notif);
        } else {
            groupedNotifications['Lebih Lama'].push(notif);
        }
    });

    return (
        <>
            <Head title="Notifikasi — Rakryan Coding" />

            <div className="mx-auto max-w-4xl space-y-6 font-sans">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                            <Bell className="h-6 w-6 text-[#B99430]" />
                            Notifikasi
                        </h1>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                            Semua update aktivitas belajar dan transaksimu ada
                            di sini.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllRead}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5 rounded-xl text-xs font-bold text-muted-foreground"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>

                {/* Tabs Filter */}
                <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2 text-xs font-semibold text-muted-foreground sm:text-sm">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'all'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Semua ({notifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'unread'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Belum Dibaca ({unreadCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('transaction')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'transaction'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Transaksi (
                        {
                            notifications.filter((n) =>
                                isTransaction(n.title, n.message),
                            ).length
                        }
                        )
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`border-b-2 px-3 pb-2.5 transition-all ${
                            activeTab === 'activity'
                                ? 'border-[#eab308] font-bold text-foreground'
                                : 'border-transparent hover:text-foreground'
                        }`}
                    >
                        Aktivitas Belajar (
                        {
                            notifications.filter(
                                (n) => !isTransaction(n.title, n.message),
                            ).length
                        }
                        )
                    </button>
                </div>

                {/* Notifications list grouped by time */}
                {filteredNotifications.length === 0 ? (
                    <Card className="border-border/50 py-16 text-center">
                        <CardContent className="space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Bell className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <h3 className="font-bold text-foreground">
                                Tidak ada notifikasi
                            </h3>
                            <p className="mx-auto max-w-xs text-xs text-muted-foreground sm:text-sm">
                                Belum ada pemberitahuan terkait filter kategori
                                yang kamu pilih.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {groupsOrder.map((groupKey) => {
                            const groupList = groupedNotifications[groupKey];

                            if (groupList.length === 0) {
                                return null;
                            }

                            return (
                                <div key={groupKey} className="space-y-3">
                                    <h3 className="px-1 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        {groupKey}
                                    </h3>
                                    <div className="space-y-3">
                                        {groupList.map((notif) => {
                                            const isTx = isTransaction(
                                                notif.title,
                                                notif.message,
                                            );

                                            return (
                                                <div
                                                    key={notif.id}
                                                    onClick={() =>
                                                        !notif.is_read &&
                                                        handleMarkRead(notif.id)
                                                    }
                                                    className={`flex cursor-pointer gap-4 rounded-2xl border p-4.5 transition-all ${
                                                        notif.is_read
                                                            ? 'border-border/50 bg-card opacity-75'
                                                            : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                                                    }`}
                                                >
                                                    {/* Categorized Icons */}
                                                    <div className="mt-1 shrink-0">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                                                notif.is_read
                                                                    ? 'bg-muted text-muted-foreground'
                                                                    : 'bg-amber-500/10 text-amber-600'
                                                            }`}
                                                        >
                                                            {isTx ? (
                                                                <CreditCard className="h-4 w-4" />
                                                            ) : (
                                                                <BookOpen className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <h4
                                                                className={`text-sm ${notif.is_read ? 'font-semibold text-foreground/80' : 'font-extrabold text-foreground'}`}
                                                            >
                                                                {notif.title}
                                                            </h4>
                                                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                {
                                                                    notif.created_at
                                                                }
                                                            </span>
                                                        </div>
                                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                                            {notif.message}
                                                        </p>
                                                    </div>

                                                    {/* Unread dot indicator */}
                                                    {!notif.is_read && (
                                                        <div className="mt-2 shrink-0">
                                                            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

NotificationsIndex.layout = (page: React.ReactNode) => {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Notifikasi', href: '/notifications' },
            ]}
        >
            {page}
        </AppLayout>
    );
};
