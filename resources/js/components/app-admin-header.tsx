import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Bell,
    ChevronDown,
    LayoutGrid,
    Menu,
    Moon,
    Newspaper,
    Receipt,
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
import { dashboard as adminDashboard } from '@/routes/internal';
import { index as articlesIndex } from '@/routes/internal/articles';
import { index as categoriesIndex } from '@/routes/internal/categories';
import { index as coursesIndex } from '@/routes/internal/courses';
import { index as productsIndex } from '@/routes/internal/products';
import { index as technologiesIndex } from '@/routes/internal/technologies';
import { index as usersIndex } from '@/routes/internal/users';
import { index as vouchersIndex } from '@/routes/internal/vouchers';
import type { Auth, BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

type NavGroup = {
    title: string;
    items: NavItem[];
};

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
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { appearance, updateAppearance } = useAppearance();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const navGroups: NavGroup[] = [
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
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet
                            open={mobileNavOpen}
                            onOpenChange={setMobileNavOpen}
                        >
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-72 gap-0 border-r p-0"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetDescription className="sr-only">
                                    Menu navigasi admin
                                </SheetDescription>
                                <SheetHeader className="border-b px-4 py-4 text-left">
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

                                <nav className="flex flex-col gap-1 overflow-y-auto p-3">
                                    <MobileNavLink
                                        href={adminDashboard.url()}
                                        icon={LayoutGrid}
                                        active={isCurrentOrParentUrl(
                                            adminDashboard.url(),
                                        )}
                                        onNavigate={() =>
                                            setMobileNavOpen(false)
                                        }
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
                                                            setMobileNavOpen(
                                                                false,
                                                            )
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
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

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

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center gap-1 lg:flex">
                        <Link
                            href={adminDashboard.url()}
                            className={cn(
                                'flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors',
                                isCurrentOrParentUrl(adminDashboard.url())
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Dashboard
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
                                                'flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors',
                                                groupActive
                                                    ? 'bg-muted text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            {group.title}
                                            <ChevronDown className="h-3.5 w-3.5" />
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
                                'flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors',
                                isCurrentOrParentUrl(usersIndex.url())
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Users
                        </Link>
                    </div>

                    <div className="ml-auto flex items-center space-x-3">
                        <div className="relative flex items-center space-x-1.5">
                            {/* Notifikasi Bell */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-9 w-9 cursor-pointer rounded-full"
                                asChild
                            >
                                <Link href="/notifications">
                                    <Bell className="size-5 opacity-80 hover:opacity-100" />
                                    {(auth?.unread_notifications_count ?? 0) >
                                        0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                    )}
                                </Link>
                            </Button>

                            {/* Tema Switcher */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    updateAppearance(
                                        appearance === 'dark'
                                            ? 'light'
                                            : 'dark',
                                    )
                                }
                                className="h-9 w-9 cursor-pointer rounded-full"
                            >
                                {appearance === 'dark' ? (
                                    <Sun className="size-5 text-amber-400 opacity-80 hover:opacity-100" />
                                ) : (
                                    <Moon className="size-5 text-slate-700 opacity-80 hover:opacity-100" />
                                )}
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
