import type { OutputData, OutputBlockData } from '@editorjs/editorjs';

type Props = {
    data?: OutputData | null;
};

function listItemText(item: unknown): string {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && 'content' in item) return (item as any).content ?? '';
    return '';
}

function renderBlock(block: OutputBlockData, olStart: number): React.ReactNode {
    const key = block.id ?? Math.random().toString();

    switch (block.type) {
        case 'header': {
            const Tag = `h${block.data.level}` as keyof React.JSX.IntrinsicElements;
            const sizes: Record<number, string> = {
                2: 'text-2xl font-bold mt-8 mb-3',
                3: 'text-xl font-semibold mt-6 mb-2',
                4: 'text-lg font-semibold mt-5 mb-2',
            };
            return (
                <Tag
                    key={key}
                    className={`leading-tight ${sizes[block.data.level] ?? 'text-lg font-semibold mt-4 mb-2'}`}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
            );
        }

        case 'paragraph':
            return (
                <p
                    key={key}
                    className="mb-4 leading-7"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: block.data.text }}
                />
            );

        case 'list': {
            const items: unknown[] = block.data.items ?? [];
            if (block.data.style === 'ordered') {
                return (
                    <ol key={key} className="list-decimal pl-6 mb-4 space-y-1" start={olStart > 1 ? olStart : undefined}>
                        {items.map((item, i) => (
                            // eslint-disable-next-line react/no-danger
                            <li key={i} dangerouslySetInnerHTML={{ __html: listItemText(item) }} />
                        ))}
                    </ol>
                );
            }
            return (
                <ul key={key} className="list-disc pl-6 mb-4 space-y-1">
                    {items.map((item, i) => (
                        // eslint-disable-next-line react/no-danger
                        <li key={i} dangerouslySetInnerHTML={{ __html: listItemText(item) }} />
                    ))}
                </ul>
            );
        }

        case 'image': {
            const url = block.data.file?.url;
            if (!url) return null;
            return (
                <figure key={key} className="my-6">
                    <img
                        src={url}
                        alt={block.data.caption ?? ''}
                        className="rounded-lg max-w-full"
                    />
                    {block.data.caption && (
                        <figcaption className="mt-2 text-sm text-muted-foreground">
                            {block.data.caption}
                        </figcaption>
                    )}
                </figure>
            );
        }

        case 'quote':
            return (
                <blockquote key={key} className="border-l-4 border-border pl-4 italic text-muted-foreground my-6">
                    {/* eslint-disable-next-line react/no-danger */}
                    <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                    {block.data.caption && (
                        <cite className="text-sm not-italic font-medium">— {block.data.caption}</cite>
                    )}
                </blockquote>
            );

        case 'code':
            return (
                <pre key={key} className="bg-muted rounded-lg p-4 overflow-x-auto my-6 text-sm font-mono leading-relaxed">
                    <code>{block.data.code}</code>
                </pre>
            );

        case 'table': {
            const rows: string[][] = block.data.content ?? [];
            if (!rows.length) return null;
            const withHeadings: boolean = block.data.withHeadings ?? false;
            return (
                <div key={key} className="overflow-x-auto my-6 rounded-lg border border-border">
                    <table className="w-full text-sm border-collapse">
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri} className={ri % 2 === 1 ? 'bg-muted/50' : ''}>
                                    {row.map((cell, ci) => {
                                        const Tag = withHeadings && ri === 0 ? 'th' : 'td';
                                        return (
                                            <Tag
                                                key={ci}
                                                className={`border border-border px-3 py-2 text-left ${withHeadings && ri === 0 ? 'font-semibold bg-muted' : ''}`}
                                                // eslint-disable-next-line react/no-danger
                                                dangerouslySetInnerHTML={{ __html: cell }}
                                            />
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        case 'delimiter':
            return <hr key={key} className="my-8 border-border" />;

        default:
            return null;
    }
}

export default function EditorJsRenderer({ data }: Props) {
    if (!data?.blocks?.length) {
        return <p className="text-muted-foreground italic">Belum ada konten.</p>;
    }

    // Track ordered list numbering across blocks (images between steps don't reset counter)
    let olStart = 1;
    let lastSignificantWasOl = false;

    return (
        <div className="mx-auto max-w-2xl text-base leading-7 text-foreground">
            {data.blocks.map((block) => {
                if (block.type === 'list' && block.data.style === 'ordered') {
                    if (!lastSignificantWasOl) olStart = 1;
                    const start = olStart;
                    olStart += (block.data.items ?? []).length;
                    lastSignificantWasOl = true;
                    return renderBlock(block, start);
                }
                if (block.type === 'image') {
                    return renderBlock(block, 1); // images don't break numbering
                }
                lastSignificantWasOl = false;
                olStart = 1;
                return renderBlock(block, 1);
            })}
        </div>
    );
}
