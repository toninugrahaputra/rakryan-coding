import { Link, router } from '@inertiajs/react';
import { User, Shield, Palette, LogOut } from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '@/components/scroll-reveal';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit as appearanceEdit } from '@/routes/appearance';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Tab = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    matchPaths?: string[];
};

const TABS: Tab[] = [
    {
        title: 'Profil',
        href: profileEdit().url,
        icon: User,
        matchPaths: ['/settings/profile', '/settings'],
    },
    {
        title: 'Keamanan',
        href: securityEdit().url,
        icon: Shield,
        matchPaths: ['/settings/security'],
    },
    {
        title: 'Tampilan',
        href: appearanceEdit().url,
        icon: Palette,
        matchPaths: ['/settings/appearance'],
    },
];

type Props = {
    children: React.ReactNode;
};

export default function SettingsLayout({ children }: Props) {
    const currentPath = window.location.pathname;
    const [isOpen, setIsOpen] = useState(false);

    function isTabActive(tab: Tab): boolean {
        if (tab.matchPaths) {
            return tab.matchPaths.some((p) => currentPath === p || currentPath.startsWith(p + '?'));
        }

        return currentPath === tab.href;
    }

    function handleLogout() {
        setIsOpen(true);
    }

    function handleConfirmLogout() {
        setIsOpen(false);
        router.post(logout().url, {}, {
            onFinish: () => {
                window.location.href = '/';
            }
        });
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Pengaturan', href: '/settings/profile' },
            ]}
        >
            <div className="px-4 py-6 font-sans">
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <ScrollReveal animation="fade-up">
                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Pengaturan Akun</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola profil, keamanan, dan tampilan akunmu.
                        </p>
                    </div>
                    </ScrollReveal>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* ── Tab Navigasi Kiri ── */}
                        <ScrollReveal animation="slide-right" delay={100}>
                        <nav className="hidden w-52 shrink-0 lg:block">
                            <ul className="space-y-1">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const active = isTabActive(tab);

                                    return (
                                        <li key={tab.href}>
                                            <Link
                                                href={tab.href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                                                    active
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                )}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />
                                                {tab.title}
                                            </Link>
                                        </li>
                                    );
                                })}

                                {/* Divider */}
                                <li className="pt-2">
                                    <div className="border-t border-border/50" />
                                </li>

                                {/* Keluar */}
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                                    >
                                        <LogOut className="h-4 w-4 shrink-0" />
                                        Keluar
                                    </button>
                                </li>
                            </ul>

                            {/* Mobile tab strip (visible below lg) */}
                        </nav>
                        </ScrollReveal>

                        {/* Mobile: horizontal scroll tab */}
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const active = isTabActive(tab);

                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={cn(
                                            'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                                            active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-border text-muted-foreground hover:bg-muted',
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        {tab.title}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* ── Konten Halaman ── */}
                        <ScrollReveal animation="fade-up" delay={150} className="min-w-0 flex-1">
                        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-xs">
                            {children}
                        </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Keluar</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin keluar dari akun Anda?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmLogout}>
                            Keluar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
