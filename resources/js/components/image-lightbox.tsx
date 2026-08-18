import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type LightboxImage = {
    src: string;
    caption?: string;
};

/**
 * Isi lightbox dipisah jadi komponen sendiri supaya bisa di-remount lewat `key`
 * saat gambarnya berganti. Dengan begitu mode perbesar kembali ke keadaan awal
 * tanpa perlu useEffect yang menyetel state.
 */
function LightboxFigure({ image }: { image: LightboxImage }) {
    const [magnified, setMagnified] = useState(false);

    return (
        <figure className="flex h-[85vh] flex-col">
            <div className="min-h-0 flex-1 overflow-auto p-3 pt-10">
                <img
                    src={image.src}
                    alt={image.caption ?? ''}
                    onClick={() => setMagnified((v) => !v)}
                    className={cn(
                        'mx-auto rounded-md',
                        magnified
                            ? 'w-[220%] max-w-none cursor-zoom-out sm:w-[150%]'
                            : 'h-full w-full cursor-zoom-in object-contain',
                    )}
                />
            </div>

            <figcaption className="shrink-0 border-t border-border/50 px-4 py-3 text-caption text-muted-foreground">
                {image.caption || (
                    <span className="text-muted-foreground/70">
                        Ketuk gambar untuk{' '}
                        {magnified ? 'memperkecil' : 'memperbesar'}
                    </span>
                )}
            </figcaption>
        </figure>
    );
}

/**
 * Pratinjau gambar ukuran besar untuk konten modul dan artikel.
 *
 * Di dalam dialog, gesture pinch-to-zoom bawaan browser sering tidak sampai ke gambar
 * karena scroll halaman dikunci. Karena itu disediakan mode perbesar eksplisit: gambar
 * ditampilkan melebihi lebar wadahnya lalu digeser lewat scroll — cara yang bekerja
 * sama andalnya di ponsel maupun desktop.
 */
export function ImageLightbox({
    image,
    onClose,
}: {
    image: LightboxImage | null;
    onClose: () => void;
}) {
    return (
        <Dialog
            open={image !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent
                className="max-w-[100vw] gap-0 p-0 sm:max-w-5xl"
                aria-describedby={undefined}
            >
                <DialogTitle className="sr-only">
                    {image?.caption || 'Pratinjau gambar'}
                </DialogTitle>

                {image && <LightboxFigure key={image.src} image={image} />}
            </DialogContent>
        </Dialog>
    );
}
