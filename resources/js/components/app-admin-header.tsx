import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Bell,
    ChevronDown,
    LayoutGrid,
    LogOut,
    Menu,
    Moon,
    Newspaper,
    Receipt,
    Settings,
    ShoppingBag,
    Sun,
    Tag,
    Ticket,
    Users,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { index as ordersIndex } from '@/actions/App/Http/Controllers/Internal/OrderController';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/internal';
import { index as articlesIndex } from '@/routes/internal/articles';
import { index as categoriesIndex } from '@/routes/internal/categories';
import { index as coursesIndex } from '@/routes/internal/courses';
import { index as productsIndex } from '@/routes/internal/products';
import { profile as settingsProfile } from '@/routes/internal/settings';
import { index as technologiesIndex } from '@/routes/internal/technologies';
import { index as usersIndex } from '@/routes/internal/users';
import { index as visitsIndex } from '@/routes/internal/visits';
import { index as vouchersIndex } from '@/routes/internal/vouchers';
import type { Auth, BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

type NavGroup = {
    title: string;
    items: NavItem[];
};

/** Gaya baris navigasi desktop, disamakan dengan PublicNavbar. */
const desktopNavClass =
    'relative flex items-center gap-1.5 py-1 text-body font-medium whitespace-nowrap transition-colors';
const desktopNavIdleClass =
    'text-[#000000] hover:text-primary dark:text-white dark:hover:text-primary';
const desktopNavUnderline =
    'absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary';

function MobileNavLink({
    href,
    icon: Icon,
    active,
    onNavigate,
    children,
}: {
    href: NavItem['href'];
    icon?: NavItem['icon'];
    active: boolean;
    onNavigate: () => void;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted',
            )}
        >
            {Icon && <Icon className="h-4.5 w-4.5 shrink-0" />}
            {children}
        </Link>
    );
}

export function AppAdminHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage<{
        auth: Auth & { unread_notifications_count?: number };
    }>().props;
    const getInitials = useInitials();
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    /**
     * Dashboard admin beralamat di `/internal` — awalan dari seluruh halaman admin.
     * Kalau dicocokkan dengan isCurrentOrParentUrl(), ia ikut menyala di setiap
     * halaman, jadi di sini pencocokannya harus persis.
     */
    const isDashboardActive = isCurrentUrl(adminDashboard.url());
    const { appearance, updateAppearance } = useAppearance();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

    const handleConfirmLogout = () => {
        setLogoutConfirmOpen(false);
        setMobileNavOpen(false);
        router.flushAll();
        router.post(
            logout().url,
            {},
            {
                onFinish: () => {
                    window.location.href = '/';
                },
            },
        );
    };

    const navGroups: NavGroup[] = [
        {
            title: 'Analitik',
            items: [
                {
                    title: 'Kunjungan',
                    href: visitsIndex.url(),
                    icon: BarChart3,
                    matchPrefix: true,
                },
            ],
        },
        {
            title: 'Konten',
            items: [
                {
                    title: 'Courses',
                    href: coursesIndex.url(),
                    icon: BookOpen,
                    matchPrefix: true,
                },
                {
                    title: 'Categories',
                    href: categoriesIndex.url(),
                    icon: Tag,
                    matchPrefix: true,
                },
                {
                    title: 'Technologies',
                    href: technologiesIndex.url(),
                    icon: Wrench,
                    matchPrefix: true,
                },
                {
                    title: 'Articles',
                    href: articlesIndex.url(),
                    icon: Newspaper,
                    matchPrefix: true,
                },
            ],
        },
        {
            title: 'Transaksi',
            items: [
                {
                    title: 'Products',
                    href: productsIndex.url(),
                    icon: ShoppingBag,
                    matchPrefix: true,
                },
                {
                    title: 'Vouchers',
                    href: vouchersIndex.url(),
                    icon: Ticket,
                    matchPrefix: true,
                },
                {
                    title: 'Orders',
                    href: ordersIndex.url(),
                    icon: Receipt,
                    matchPrefix: true,
                },
            ],
        },
    ];

    return (
        <>
            {/* Bingkai header disamakan dengan PublicNavbar: menempel di atas, garis tepi
                dan latar semi-transparan yang sama. */}
            <div className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center px-6 py-4.5 lg:px-8">
                    {/* Menu mobile — hamburger di kanan & sheet dari kanan, disamakan
                        dengan navigasi sisi pengguna. Ditempatkan di akhir baris ini. */}
                    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                        <SheetContent
                            side="right"
                            className="flex h-full w-[88%] flex-col gap-0 p-0 sm:max-w-sm"
                        >
                            <SheetTitle className="sr-only">
                                Navigation menu
                            </SheetTitle>
                            <SheetDescription className="sr-only">
                                Menu navigasi admin
                            </SheetDescription>
                            <SheetHeader className="shrink-0 border-b px-5 py-4 pr-14 text-left">
                                <Link
                                    href={adminDashboard.url()}
                                    onClick={() => setMobileNavOpen(false)}
                                    className="flex items-center gap-2.5"
                                >
                                    <AppLogo />
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-bold tracking-widest uppercase"
                                    >
                                        Admin
                                    </Badge>
                                </Link>
                            </SheetHeader>

                            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                                <MobileNavLink
                                    href={adminDashboard.url()}
                                    icon={LayoutGrid}
                                    active={isDashboardActive}
                                    onNavigate={() => setMobileNavOpen(false)}
                                >
                                    Dashboard
                                </MobileNavLink>

                                {navGroups.map((group) => (
                                    <div
                                        key={group.title}
                                        className="mt-3 first:mt-0"
                                    >
                                        <span className="block px-3 pb-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                            {group.title}
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            {group.items.map((item) => (
                                                <MobileNavLink
                                                    key={item.title}
                                                    href={item.href}
                                                    icon={item.icon}
                                                    active={isCurrentOrParentUrl(
                                                        item.href,
                                                    )}
                                                    onNavigate={() =>
                                                        setMobileNavOpen(false)
                                                    }
                                                >
                                                    {item.title}
                                                </MobileNavLink>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-3">
                                    <MobileNavLink
                                        href={usersIndex.url()}
                                        icon={Users}
                                        active={isCurrentOrParentUrl(
                                            usersIndex.url(),
                                        )}
                                        onNavigate={() =>
                                            setMobileNavOpen(false)
                                        }
                                    >
                                        Users
                                    </MobileNavLink>
                                </div>

                                {/* Dropdown avatar disembunyikan di mobile, jadi
                                        Pengaturan & Keluar harus tersedia di sini. */}
                                <div className="my-2 border-t border-border/50" />

                                <MobileNavLink
                                    href={settingsProfile.url()}
                                    icon={Settings}
                                    active={isCurrentOrParentUrl(
                                        settingsProfile.url(),
                                    )}
                                    onNavigate={() => setMobileNavOpen(false)}
                                >
                                    Pengaturan
                                </MobileNavLink>

                                <button
                                    type="button"
                                    onClick={() => setLogoutConfirmOpen(true)}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </button>
                            </nav>

                            {/* Kartu akun terpatok di bawah, seperti menu sisi pengguna. */}
                            {auth.user && (
                                <div className="mt-auto shrink-0 border-t border-border/50 p-3">
                                    <div className="flex items-center gap-2.5 rounded-xl border border-border/50 px-3 py-2.5">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                {getInitials(
                                                    auth.user.name ?? '',
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-foreground">
                                                {auth.user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SheetContent>

                        <Link
                            href={adminDashboard.url()}
                            prefetch
                            className="flex items-center gap-2.5"
                        >
                            <AppLogo />
                            <Badge
                                variant="secondary"
                                className="hidden text-[10px] font-bold tracking-widest uppercase sm:inline-flex"
                            >
                                Admin
                            </Badge>
                        </Link>

                        {/* Desktop Navigation — gaya baris & penanda aktif disamakan dengan
                            PublicNavbar: teks emas plus garis bawah, bukan pill abu-abu. */}
                        <div className="ml-10 hidden items-center gap-6 lg:flex">
                            <Link
                                href={adminDashboard.url()}
                                className={cn(
                                    desktopNavClass,
                                    isDashboardActive
                                        ? 'text-primary'
                                        : desktopNavIdleClass,
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Dashboard
                                {isDashboardActive && (
                                    <span className={desktopNavUnderline} />
                                )}
                            </Link>

                            {navGroups.map((group) => {
                                const groupActive = group.items.some((item) =>
                                    isCurrentOrParentUrl(item.href),
                                );

                                return (
                                    <DropdownMenu key={group.title}>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className={cn(
                                                    desktopNavClass,
                                                    'outline-none',
                                                    groupActive
                                                        ? 'text-primary'
                                                        : desktopNavIdleClass,
                                                )}
                                            >
                                                {group.title}
                                                <ChevronDown className="h-3.5 w-3.5" />
                                                {groupActive && (
                                                    <span
                                                        className={
                                                            desktopNavUnderline
                                                        }
                                                    />
                                                )}
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="start"
                                            className="min-w-44"
                                        >
                                            {group.items.map((item) => (
                                                <DropdownMenuItem
                                                    key={item.title}
                                                    asChild
                                                >
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            isCurrentOrParentUrl(
                                                                item.href,
                                                            ) &&
                                                                'bg-accent text-accent-foreground',
                                                        )}
                                                    >
                                                        {item.icon && (
                                                            <item.icon className="h-4 w-4" />
                                                        )}
                                                        {item.title}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                );
                            })}

                            <Link
                                href={usersIndex.url()}
                                className={cn(
                                    desktopNavClass,
                                    isCurrentOrParentUrl(usersIndex.url())
                                        ? 'text-primary'
                                        : desktopNavIdleClass,
                                )}
                            >
                                <Users className="h-4 w-4" />
                                Users
                                {isCurrentOrParentUrl(usersIndex.url()) && (
                                    <span className={desktopNavUnderline} />
                                )}
                            </Link>
                        </div>

                        <div className="ml-auto flex items-center gap-3.5">
                            {/* Grup ikon utilitas — satu pill, mengikuti PublicNavbar */}
                            <div className="flex items-center overflow-hidden rounded-xl border border-border/40 text-muted-foreground">
                                <button
                                    onClick={() =>
                                        updateAppearance(
                                            appearance === 'dark'
                                                ? 'light'
                                                : 'dark',
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted"
                                    title={
                                        appearance === 'dark'
                                            ? 'Aktifkan mode terang'
                                            : 'Aktifkan mode gelap'
                                    }
                                >
                                    {appearance === 'dark' ? (
                                        <Sun className="h-4.5 w-4.5" />
                                    ) : (
                                        <Moon className="h-4.5 w-4.5" />
                                    )}
                                </button>

                                <div className="h-5 w-px bg-border/40" />

                                <Link
                                    href="/notifications"
                                    title="Notifikasi"
                                    className="relative flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted hover:text-primary"
                                >
                                    <Bell className="h-4.5 w-4.5" />
                                    {(auth?.unread_notifications_count ?? 0) >
                                        0 && (
                                        <span className="absolute top-1.5 right-1.5 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                    )}
                                </Link>
                            </div>

                            {/* Avatar hanya di desktop — di mobile identitas akun sudah
                            tampil sebagai kartu di dasar sheet. */}
                            <div className="hidden lg:block">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1 rounded-xl border border-border/40 p-1 transition-colors outline-none hover:bg-muted">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage
                                                src={auth.user?.avatar}
                                                alt={auth.user?.name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                {getInitials(
                                                    auth.user?.name ?? '',
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                    >
                                        {auth.user && (
                                            <UserMenuContent user={auth.user} />
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 lg:hidden"
                                    aria-label="Buka menu"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                        </div>
                    </Sheet>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}

            {/* Konfirmasi keluar untuk tombol di dalam sheet — dropdown avatar punya
                dialognya sendiri di UserMenuContent dan hanya tampil di desktop. */}
            <Dialog
                open={logoutConfirmOpen}
                onOpenChange={setLogoutConfirmOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Keluar</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin keluar dari akun Anda?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setLogoutConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            className="font-bold dark:bg-red-600 dark:hover:bg-red-500"
                            onClick={handleConfirmLogout}
                        >
                            Keluar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
