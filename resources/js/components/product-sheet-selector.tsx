import { useState } from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

type Product = { id: number; title: string; price: number };

interface Props {
    products: Product[];
    value: number[];
    onChange: (ids: number[]) => void;
    error?: string;
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

export function ProductSheetSelector({ products, value, onChange, error }: Props) {
    const [search, setSearch] = useState('');

    const filtered = products.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()),
    );

    const selected = products.filter((p) => value.includes(p.id));

    function toggle(id: number) {
        onChange(value.includes(id) ? value.filter((i) => i !== id) : [...value, id]);
    }

    function remove(id: number) {
        onChange(value.filter((i) => i !== id));
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button type="button" variant="outline" className="gap-2">
                            <ShoppingBag className="size-4" />
                            Pilih Produk
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col gap-0 p-0">
                        <SheetHeader className="border-b p-4">
                            <SheetTitle>Pilih Produk</SheetTitle>
                            <div className="relative mt-2">
                                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                                <Input
                                    className="pl-8"
                                    placeholder="Cari produk..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-2">
                            {filtered.length === 0 ? (
                                <p className="text-muted-foreground py-8 text-center text-sm">
                                    Produk tidak ditemukan.
                                </p>
                            ) : (
                                filtered.map((product) => (
                                    <label
                                        key={product.id}
                                        className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-3"
                                    >
                                        <Checkbox
                                            checked={value.includes(product.id)}
                                            onCheckedChange={() => toggle(product.id)}
                                        />
                                        <span className="flex flex-1 flex-col">
                                            <span className="text-sm leading-snug">{product.title}</span>
                                            <span className="text-muted-foreground text-xs">{formatPrice(product.price)}</span>
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>

                        {selected.length > 0 && (
                            <div className="border-t p-4">
                                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                                    {selected.length} dipilih
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selected.map((product) => (
                                        <Badge key={product.id} variant="secondary" className="gap-1 pr-1">
                                            {product.title}
                                            <button
                                                type="button"
                                                onClick={() => remove(product.id)}
                                                className="hover:text-foreground text-muted-foreground rounded-full"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SheetContent>
                </Sheet>

                <span className="text-muted-foreground text-sm">
                    {selected.length === 0
                        ? 'Belum ada produk dipilih'
                        : `${selected.length} produk dipilih`}
                </span>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selected.map((product) => (
                        <Badge key={product.id} variant="secondary" className="gap-1 pr-1">
                            {product.title}
                            <button
                                type="button"
                                onClick={() => remove(product.id)}
                                className="hover:text-foreground text-muted-foreground rounded-full"
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
