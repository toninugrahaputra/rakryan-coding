import { registerPlugin } from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import { useState } from 'react';
import { FilePond } from 'react-filepond';

registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
    FilePondPluginFileValidateType,
);

type Props = {
    existingUrl?: string | null;
    onFileChange: (file: File | null) => void;
    onClearExisting?: () => void;
    aspectRatio?: string;
};

export default function ThumbnailUpload({ existingUrl, onFileChange, onClearExisting, aspectRatio = '16:9' }: Props) {
    const [hasFile, setHasFile] = useState(false);

    return (
        <div className="flex flex-col gap-3">
            <FilePond
                allowMultiple={false}
                acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                imageCropAspectRatio={aspectRatio}
                imageResizeTargetWidth={1280}
                imageResizeTargetHeight={720}
                imageResizeMode="cover"
                imageResizeUpscale={false}
                labelIdle='Drag & drop atau <span class="filepond--label-action">pilih gambar</span>'
                labelFileProcessing="Memproses..."
                labelFileProcessingComplete="Selesai"
                labelTapToCancel=""
                labelTapToRetry="Coba lagi"
                labelTapToUndo="Hapus"
                onupdatefiles={(fileItems) => {
                    const file = fileItems[0]?.file as File | undefined;
                    setHasFile(!!file);
                    onFileChange(file ?? null);
                }}
            />

            {existingUrl && !hasFile && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-muted-foreground text-xs">Thumbnail saat ini:</p>
                    <div className="relative w-full overflow-hidden rounded-md border">
                        <img src={existingUrl} alt="Thumbnail saat ini" className="h-36 w-full object-cover" />
                        {onClearExisting && (
                            <button
                                type="button"
                                onClick={onClearExisting}
                                className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
                            >
                                Hapus
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
