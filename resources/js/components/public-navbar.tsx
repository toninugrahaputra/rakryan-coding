import { Link, usePage, router } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    ChevronDown,
    LayoutGrid,
    LogOut,
    Menu,
    X,
    Moon,
    Receipt,
    ShieldCheck,
    Sun,
    Search,
    Ticket,
    UserRound,
    Loader2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PublicUserMenu } from '@/components/public-user-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, logout } from '@/routes';
import { login, register } from '@/routes';
import { index as notificationsIndex } from '@/routes/notifications';
import { index as ordersIndex } from '@/routes/orders';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import { index as vouchersIndex } from '@/routes/vouchers';
import type { Auth } from '@/types';

interface SearchResult {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    category: string | null;
    price: number | null;
    price_strikethrough: number | null;
    is_free: boolean;
    has_product: boolean;
}

function formatPrice(price: number): string {
    if (price === 0) {
        return 'Gratis';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

export function PublicNavbar() {
    const { auth } = usePage<{
        auth: Auth & { unread_notifications_count?: number };
    }>().props;
    const getInitials = useInitials();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchModalOpen((prev) => !prev);
            }

            if (e.key === 'Escape') {
                setSearchModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.trim().length < 1) {
            setSearchResults([]);
            setHasSearched(false);

            return;
        }

        setSearching(true);
        setHasSearched(false);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/search/courses?q=${encodeURIComponent(value.trim())}`,
                );
                const data = await res.json();
                setSearchResults(data);
            } catch {
                setSearchResults([]);
            } finally {
                setHasSearched(true);
                setSearching(false);
            }
        }, 300);
    };

    const closeSearch = () => {
        setSearchModalOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const handleConfirmLogout = () => {
        setLogoutConfirmOpen(false);
        setMobileOpen(false);
        router.flushAll();
        router.post(logout().url, {}, {
            onFinish: () => {
                window.location.href = '/';
            },
        });
    };

    const courseLinks = [
        { label: 'Web Development', href: '/courses?category=Web+Dev' },
        { label: 'Mobile Development', href: '/courses?category=Mobile+Dev' },
    ];

    const isDark = appearance === 'dark';

    const toggleTheme = () => {
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4.5 lg:px-8">
                    {/* Left side: Logo + Nav links */}
                    <div className="flex items-center gap-12">
                        {/* Logo Section */}
                        <Link
                            href="/"
                            className="flex shrink-0 items-center transition-opacity hover:opacity-85"
                        >
                            <img
                                src="/assets/images/logo-full.svg"
                                alt="Rakryan Coding"
                                className="h-11 w-auto sm:h-12"
                            />
                        </Link>

                        {/* Desktop Nav Links */}
                        <nav className="hidden items-center gap-8 md:flex">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-base font-bold text-[#000000] transition-colors outline-none hover:text-primary dark:text-white dark:hover:text-primary">
                                    Course
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="min-w-52"
                                >
                                    {courseLinks.map(({ label, href }) => (
                                        <DropdownMenuItem key={href} asChild>
                                            <Link href={href}>{label}</Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link
                                href="/articles"
                                className="text-base font-bold text-[#000000] transition-colors hover:text-primary dark:text-white dark:hover:text-primary"
                            >
                                Artikel Belajar
                            </Link>
                        </nav>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden items-center gap-3.5 md:flex">
                        {/* Grup ikon utilitas — satu pill, bukan kotak terpisah-pisah */}
                        <div className="flex items-center overflow-hidden rounded-xl border border-border/40 text-muted-foreground">
                            <button
                                onClick={() => setSearchModalOpen(true)}
                                className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted"
                                title="Cari course (Cmd+K)"
                            >
                                <Search className="h-4.5 w-4.5" />
                            </button>

                            <div className="h-5 w-px bg-border/40" />

                            <button
                                onClick={toggleTheme}
                                className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted"
                                title={
                                    isDark
                                        ? 'Switch to Light Mode'
                                        : 'Switch to Dark Mode'
                                }
                            >
                                {isDark ? (
                                    <Sun className="h-4.5 w-4.5" />
                                ) : (
                                    <Moon className="h-4.5 w-4.5" />
                                )}
                            </button>
                        </div>

                        {auth.user ? (
                            <>
                                <Link
                                    href={dashboard()}
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#B99430] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-[#B99430]/15 transition-all hover:bg-[#725a15]"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    Dashboard
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1 rounded-xl border border-border/40 p-1 outline-none transition-colors hover:bg-muted">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64">
                                        <PublicUserMenu
                                            user={auth.user}
                                            unreadNotificationsCount={
                                                auth.unread_notifications_count
                                            }
                                            onLogoutClick={() =>
                                                setLogoutConfirmOpen(true)
                                            }
                                        />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="flex items-center justify-center rounded-xl border-2 border-[#1e1b4b]/20 bg-white px-5 py-2 text-base font-extrabold text-[#1e1b4b] transition-colors hover:bg-muted dark:border-white/30 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={register()}
                                    className="flex items-center justify-center rounded-xl bg-[#B99430] px-5 py-2 text-base font-extrabold text-white shadow-sm shadow-[#B99430]/15 transition-all hover:bg-[#725a15]"
                                >
                                    Daftar gratis
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Search & Hamburger Toggle */}
                    <div className="flex items-center gap-1.5 md:hidden">
                        <button
                            onClick={() => setSearchModalOpen(true)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                            aria-label="Cari course"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Sidebar/Menu */}
                {mobileOpen && (
                    <div className="border-t border-border/60 bg-background px-6 pb-4 md:hidden">
                        <nav className="flex flex-col gap-1 pt-3">
                            <span className="px-3 pt-1 text-base font-bold text-[#000000] dark:text-white">
                                Course
                            </span>
                            {courseLinks.map(({ label, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-lg px-3 py-2 text-xs font-semibold text-[#000000] hover:bg-muted hover:text-primary dark:text-white"
                                >
                                    {label}
                                </Link>
                            ))}

                            <div className="my-1 border-t border-border/50" />

                            <Link
                                href="/articles"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-lg px-3 py-2.5 text-base font-bold text-[#000000] hover:bg-muted hover:text-primary dark:text-white"
                            >
                                Artikel Belajar
                            </Link>
                        </nav>
                        <div className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-3">
                            {/* Mobile Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                                {isDark ? (
                                    <Sun className="h-4.5 w-4.5" />
                                ) : (
                                    <Moon className="h-4.5 w-4.5" />
                                )}
                                <span>Mode {isDark ? 'Terang' : 'Gelap'}</span>
                            </button>

                            {auth.user ? (
                                <>
                                    <div className="flex items-center gap-2.5 rounded-xl border border-border/50 px-3 py-2.5">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                {getInitials(auth.user.name)}
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

                                    {/* Quick-access buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href={dashboard()}
                                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#B99430] px-3 py-2.5 text-sm font-bold text-white"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/courses"
                                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border/50 px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            Katalog Course
                                        </Link>
                                        <Link
                                            href={vouchersIndex()}
                                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border/50 px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <Ticket className="h-4 w-4" />
                                            Voucher Saya
                                        </Link>
                                        <Link
                                            href={ordersIndex()}
                                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border/50 px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <Receipt className="h-4 w-4" />
                                            Pesanan
                                        </Link>
                                    </div>

                                    <div className="my-1 border-t border-border/50" />

                                    <Link
                                        href={notificationsIndex()}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#000000] hover:bg-muted hover:text-primary dark:text-white"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <Bell className="h-4 w-4" />
                                        Notifikasi
                                        {!!auth.unread_notifications_count && (
                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                                                {
                                                    auth.unread_notifications_count
                                                }
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href={profileEdit()}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#000000] hover:bg-muted hover:text-primary dark:text-white"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <UserRound className="h-4 w-4" />
                                        Profil Saya
                                    </Link>
                                    <Link
                                        href={securityEdit()}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#000000] hover:bg-muted hover:text-primary dark:text-white"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        Keamanan
                                    </Link>
                                    <button
                                        onClick={() =>
                                            setLogoutConfirmOpen(true)
                                        }
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-bold text-destructive hover:bg-destructive/10"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Keluar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#1e1b4b]/20 px-4 py-2.5 text-sm font-bold text-foreground dark:border-white/30 dark:bg-white/5"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#B99430] px-4 py-2.5 text-sm font-semibold text-white"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Daftar gratis
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Logout Confirmation Dialog */}
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
                            className="font-bold"
                            onClick={handleConfirmLogout}
                        >
                            Keluar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Search Modal — rendered OUTSIDE header to avoid stacking context issues */}
            {searchModalOpen && (
                <div
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-start bg-black/70 px-4 pt-[14vh] backdrop-blur-md"
                    onClick={closeSearch}
                >
                    <div
                        className="relative w-full max-w-2xl animate-in duration-200 zoom-in-95 fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search input */}
                        <div className="relative flex items-center rounded-2xl border border-border/60 bg-card shadow-2xl ring-1 ring-primary/30">
                            {searching ? (
                                <Loader2 className="absolute left-5 h-5 w-5 shrink-0 animate-spin text-primary" />
                            ) : (
                                <Search className="absolute left-5 h-5 w-5 shrink-0 text-muted-foreground" />
                            )}
                            <input
                                type="text"
                                autoFocus
                                placeholder="Cari course, teknologi, atau topik..."
                                className="w-full rounded-2xl bg-transparent py-5 pr-20 pl-14 text-lg font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (searchResults.length > 0) {
                                            closeSearch();
                                            router.visit(
                                                `/courses/${searchResults[0].slug}`,
                                            );
                                        } else if (searchQuery.trim()) {
                                            closeSearch();
                                            router.visit(
                                                `/courses?search=${encodeURIComponent(searchQuery.trim())}`,
                                            );
                                        }
                                    } else if (e.key === 'Escape') {
                                        closeSearch();
                                    }
                                }}
                            />
                            <button
                                onClick={closeSearch}
                                className="absolute right-4 rounded-lg border border-border/40 bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted/80"
                            >
                                ESC
                            </button>
                        </div>

                        {/* Results panel */}
                        {searchQuery.trim().length >= 1 && (
                            <div className="mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
                                {/* Loading */}
                                {searching ? (
                                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Mencari...</span>
                                    </div>
                                ) : hasSearched &&
                                  searchResults.length === 0 ? (
                                    /* Empty state */
                                    <div className="py-10 text-center">
                                        <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            Tidak ada course ditemukan
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground/60">
                                            Coba kata kunci lain
                                        </p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    /* Results */
                                    <>
                                        {searchResults.map((course, idx) => (
                                            <Link
                                                key={course.id}
                                                href={`/courses/${course.slug}`}
                                                onClick={closeSearch}
                                                className={`flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/60 ${idx < searchResults.length - 1 ? 'border-b border-border/40' : ''}`}
                                            >
                                                {/* Thumbnail */}
                                                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={
                                                                course.thumbnail
                                                            }
                                                            alt={course.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <BookOpen className="h-5 w-5 text-muted-foreground/40" />
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-foreground">
                                                        {course.title}
                                                    </p>
                                                    {course.category && (
                                                        <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                                            {course.category}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Price */}
                                                <div className="shrink-0 text-right">
                                                    {!course.has_product ? (
                                                        <span className="text-xs font-bold text-emerald-500">
                                                            Gratis
                                                        </span>
                                                    ) : course.is_free ? (
                                                        <span className="text-xs font-bold text-emerald-500">
                                                            Gratis
                                                        </span>
                                                    ) : course.price !==
                                                      null ? (
                                                        <div className="flex flex-col items-end gap-0.5">
                                                            <span className="text-sm font-extrabold text-foreground">
                                                                {formatPrice(
                                                                    course.price,
                                                                )}
                                                            </span>
                                                            {course.price_strikethrough && (
                                                                <span className="text-[10px] text-muted-foreground line-through">
                                                                    {formatPrice(
                                                                        course.price_strikethrough,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </Link>
                                        ))}
                                    </>
                                ) : null}
                            </div>
                        )}

                        {/* Default: quick category pills (only when no query) */}
                        {searchQuery.trim().length < 1 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {[
                                    'Web Dev',
                                    'Mobile Dev',
                                    'Backend & API',
                                    'Fundamental',
                                    'UI/UX',
                                ].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleSearchChange(cat)}
                                        className="rounded-full border border-border/50 bg-card/80 px-4 py-1.5 text-sm font-semibold text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Hint */}
                        <p className="mt-3 text-center text-xs font-semibold text-muted-foreground/40">
                            <kbd className="rounded border border-border/40 bg-card/60 px-1.5 py-0.5 font-mono">
                                Enter
                            </kbd>{' '}
                            buka course pertama &nbsp;•&nbsp;{' '}
                            <kbd className="rounded border border-border/40 bg-card/60 px-1.5 py-0.5 font-mono">
                                ESC
                            </kbd>{' '}
                            tutup &nbsp;•&nbsp;{' '}
                            <kbd className="rounded border border-border/40 bg-card/60 px-1.5 py-0.5 font-mono">
                                ⌘K
                            </kbd>{' '}
                            shortcut
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
