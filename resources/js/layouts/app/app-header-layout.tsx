import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PublicFooter } from '@/components/public-footer';
import { PublicNavbar } from '@/components/public-navbar';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            {/* Navigasi yang sama dengan halaman publik, supaya tampilannya tidak berubah
                saat pengguna masuk ke dashboard. */}
            <PublicNavbar />

            {/* Breadcrumb sebelumnya dirender di dalam AppHeader; dipindah ke sini supaya
                halaman yang mengirimkannya tidak kehilangan jejak navigasi. */}
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}

            <AppContent variant="header">{children}</AppContent>
            <PublicFooter />
        </AppShell>
    );
}
