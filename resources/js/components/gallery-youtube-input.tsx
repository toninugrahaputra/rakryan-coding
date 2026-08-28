import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    urls: string[];
    onChange: (urls: string[]) => void;
    remainingSlots: number;
};

export default function GalleryYoutubeInput({ urls, onChange, remainingSlots }: Props) {
    const [value, setValue] = useState('');

    function handleAdd() {
        const trimmed = value.trim();
        if (!trimmed || remainingSlots <= 0) return;

        onChange([...urls, trimmed]);
        setValue('');
    }

    function handleRemove(index: number) {
        onChange(urls.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-col gap-3">
            {urls.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {urls.map((url, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                        >
                            <span className="truncate">{url}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black/60 text-white hover:bg-black/80"
                                aria-label="Hapus video"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {remainingSlots > 0 ? (
                <div className="flex gap-2">
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAdd();
                            }
                        }}
                        placeholder="Tempel link YouTube, mis. https://youtu.be/xxxxxxxxxxx"
                    />
                    <Button type="button" variant="outline" onClick={handleAdd}>
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>
            ) : (
                <p className="text-muted-foreground text-xs">
                    Sudah mencapai batas maksimum item galeri.
                </p>
            )}
        </div>
    );
}
