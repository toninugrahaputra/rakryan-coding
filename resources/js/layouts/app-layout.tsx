import { usePage } from '@inertiajs/react';
import AppAdminHeaderLayout from '@/layouts/app/app-admin-header-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem, Auth } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth?.user?.roles?.includes('admin');

    if (isAdmin) {
        return (
            <AppAdminHeaderLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppAdminHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>{children}</AppHeaderLayout>
    );
}
