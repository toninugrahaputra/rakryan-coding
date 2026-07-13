import { useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
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

type Course = { id: number; title: string };

interface Props {
    courses: Course[];
    value: number[];
    onChange: (ids: number[]) => void;
    type: 'single' | 'bundle';
    error?: string;
}

export function CourseSheetSelector({ courses, value, onChange, type, error }: Props) {
    const [search, setSearch] = useState('');

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
    );

    const selected = courses.filter((c) => value.includes(c.id));

    function toggle(id: number) {
        if (type === 'single') {
            onChange([id]);
        } else {
            onChange(value.includes(id) ? value.filter((i) => i !== id) : [...value, id]);
        }
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
                            <BookOpen className="size-4" />
                            Pilih Course
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col gap-0 p-0">
                        <SheetHeader className="border-b p-4">
                            <SheetTitle>Pilih Course</SheetTitle>
                            <div className="relative mt-2">
                                <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                                <Input
                                    className="pl-8"
                                    placeholder="Cari course..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-2">
                            {filtered.length === 0 ? (
                                <p className="text-muted-foreground py-8 text-center text-sm">
                                    Course tidak ditemukan.
                                </p>
                            ) : (
                                filtered.map((course) => (
                                    <label
                                        key={course.id}
                                        className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-3"
                                    >
                                        <Checkbox
                                            checked={value.includes(course.id)}
                                            onCheckedChange={() => toggle(course.id)}
                                        />
                                        <span className="text-sm leading-snug">{course.title}</span>
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
                                    {selected.map((course) => (
                                        <Badge key={course.id} variant="secondary" className="gap-1 pr-1">
                                            {course.title}
                                            <button
                                                type="button"
                                                onClick={() => remove(course.id)}
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
                        ? 'Belum ada course dipilih'
                        : `${selected.length} course dipilih`}
                </span>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selected.map((course) => (
                        <Badge key={course.id} variant="secondary" className="gap-1 pr-1">
                            {course.title}
                            <button
                                type="button"
                                onClick={() => remove(course.id)}
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
