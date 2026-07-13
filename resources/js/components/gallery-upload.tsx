import { registerPlugin } from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import { X } from 'lucide-react';
import { FilePond } from 'react-filepond';

registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginFileValidateType,
);

type ExistingImage = {
    id: number;
    url: string;
};

type Props = {
    existingImages?: ExistingImage[];
    removedIds?: number[];
    onRemoveExisting?: (id: number) => void;
    onFilesChange: (files: File[]) => void;
    maxImages?: number;
};

export default function GalleryUpload({
    existingImages = [],
    removedIds = [],
    onRemoveExisting,
    onFilesChange,
    maxImages = 4,
}: Props) {
    const visibleExisting = existingImages.filter((img) => !removedIds.includes(img.id));
    const remainingSlots = Math.max(maxImages - visibleExisting.length, 0);

    return (
        <div className="flex flex-col gap-3">
            {visibleExisting.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {visibleExisting.map((img) => (
                        <div key={img.id} className="relative overflow-hidden rounded-md border">
                            <img src={img.url} alt="Galeri" className="h-24 w-full object-cover" />
                            {onRemoveExisting && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveExisting(img.id)}
                                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white hover:bg-black/80"
                                    aria-label="Hapus gambar"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {remainingSlots > 0 ? (
                <FilePond
                    allowMultiple
                    maxFiles={remainingSlots}
                    acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                    imageResizeTargetWidth={1280}
                    imageResizeTargetHeight={720}
                    imageResizeMode="contain"
                    imageResizeUpscale={false}
                    labelIdle={`Drag & drop atau <span class="filepond--label-action">pilih gambar</span> (maks ${remainingSlots} lagi)`}
                    labelFileProcessing="Memproses..."
                    labelFileProcessingComplete="Selesai"
                    labelTapToCancel=""
                    labelTapToRetry="Coba lagi"
                    labelTapToUndo="Hapus"
                    onupdatefiles={(fileItems) => {
                        const files = fileItems.map((item) => item.file as File).filter(Boolean);
                        onFilesChange(files);
                    }}
                />
            ) : (
                <p className="text-muted-foreground text-xs">
                    Sudah mencapai batas maksimum {maxImages} gambar galeri.
                </p>
            )}
        </div>
    );
}
