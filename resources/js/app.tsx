import { createInertiaApp, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Sesi/token CSRF bisa basi (mis. setelah logout meng-invalidate sesi lama, atau idle terlalu lama).
// Tanpa handler ini, request berikutnya (login/logout/submit form apa pun) gagal diam-diam dengan 419
// tanpa ada cara untuk pulih selain refresh manual. Reload halaman otomatis mengambil token CSRF baru.
// Catatan Inertia v3: event ini dulu bernama `invalid`, sekarang `httpException`.
router.on('httpException', (event) => {
    if (event.detail.response.status === 419) {
        event.preventDefault();
        toast.error('Sesi kamu sudah tidak berlaku. Memuat ulang halaman...');
        window.location.reload();
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name.startsWith('courses/'):
            case name.startsWith('articles/'):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
