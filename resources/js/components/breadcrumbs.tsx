import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

/**
 * Jejak navigasi yang melipat sendiri di layar sempit.
 *
 * Di layar kecil, judul halaman bisa panjang sehingga seluruh jejaknya turun ke baris
 * kedua. Karena itu semua induknya diringkas jadi satu tombol "…" yang membuka daftar
 * lengkapnya — pola yang sama dipakai Google Drive. Mulai `sm` jejaknya tampil utuh.
 *
 * Peringkasan hanya berlaku bila ada lebih dari dua tingkat; pada dua tingkat, jejak
 * penuh justru lebih informatif dan tetap muat.
 */
export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    if (breadcrumbs.length === 0) {
        return null;
    }

    const collapsible = breadcrumbs.length > 2;
    const parents = breadcrumbs.slice(0, -1);

    return (
        <Breadcrumb>
            <BreadcrumbList className="flex-nowrap sm:flex-wrap">
                {collapsible && (
                    <>
                        <BreadcrumbItem className="sm:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    className="flex items-center rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    aria-label="Lihat halaman induk"
                                >
                                    <BreadcrumbEllipsis className="size-5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {parents.map((item, index) => (
                                        <DropdownMenuItem key={index} asChild>
                                            <Link href={item.href}>
                                                {item.title}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="sm:hidden" />
                    </>
                )}

                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    // Induk disembunyikan di layar sempit karena sudah diwakili tombol "…".
                    const hiddenOnMobile = collapsible && !isLast;

                    return (
                        <Fragment key={index}>
                            <BreadcrumbItem
                                className={
                                    hiddenOnMobile
                                        ? 'hidden sm:inline-flex'
                                        : // `min-w-0` wajib agar `truncate` di dalamnya
                                          // benar-benar memotong; tanpa itu item flex
                                          // menolak menyusut dan teksnya meluber.
                                          'min-w-0'
                                }
                            >
                                {isLast ? (
                                    <BreadcrumbPage className="truncate">
                                        {item.title}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>
                                            {item.title}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator
                                    className={
                                        hiddenOnMobile
                                            ? 'hidden sm:block'
                                            : undefined
                                    }
                                />
                            )}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
