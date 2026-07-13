import { router } from '@inertiajs/react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import type { PaginationLinks, PaginationMeta } from '@/types/ui';

type Props = {
    meta: PaginationMeta;
    links: PaginationLinks;
};

function pageUrl(path: string, page: number) {
    return `${path}?page=${page}`;
}

function getPageRange(current: number, last: number): (number | 'ellipsis')[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    if (current > 3) pages.push('ellipsis');

    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < last - 2) pages.push('ellipsis');

    pages.push(last);

    return pages;
}

export function AppPagination({ meta, links }: Props) {
    if (meta.last_page <= 1) return null;

    const pages = getPageRange(meta.current_page, meta.last_page);

    function visit(url: string | null) {
        if (url) router.visit(url, { preserveScroll: true });
    }

    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
                {meta.from}–{meta.to} dari {meta.total} data
            </span>

            <Pagination className="w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => visit(links.prev)}
                            aria-disabled={!links.prev}
                            className={!links.prev ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>

                    {pages.map((page, i) =>
                        page === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${i}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === meta.current_page}
                                    onClick={() => visit(pageUrl(meta.path, page))}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ),
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => visit(links.next)}
                            aria-disabled={!links.next}
                            className={!links.next ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
