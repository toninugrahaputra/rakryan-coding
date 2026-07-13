import type { OutputData } from '@editorjs/editorjs';

type UploadResult =
    | { ok: true; content: OutputData }
    | { ok: false; failedIndexes: number[] };

export async function uploadEditorImages(content: OutputData, files: File[], uploadUrl: string): Promise<UploadResult> {
    const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
    const xsrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] ?? '';
    const decodedXsrf = decodeURIComponent(xsrfCookie);

    const urlMap: Record<string, string> = {};
    const failedIndexes: number[] = [];

    for (let i = 0; i < files.length; i++) {
        try {
            const body = new FormData();
            body.append('image', files[i]);
            
            const headers: Record<string, string> = {};
            if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
            if (decodedXsrf) headers['X-XSRF-TOKEN'] = decodedXsrf;

            const res = await fetch(uploadUrl, { 
                method: 'POST', 
                headers, 
                body 
            });
            
            if (res.ok) {
                const json = await res.json();
                urlMap[`__PENDING_${i}__`] = json.file.url;
            } else {
                failedIndexes.push(i + 1);
            }
        } catch {
            failedIndexes.push(i + 1);
        }
    }

    if (failedIndexes.length > 0) {
        return { ok: false, failedIndexes };
    }

    return {
        ok: true,
        content: {
            ...content,
            blocks: content.blocks.map((block) => {
                if (block.type !== 'image') return block;
                const url: string = (block.data as any)?.file?.url ?? '';
                return urlMap[url] ? { ...block, data: { ...block.data, file: { url: urlMap[url] } } } : block;
            }),
        },
    };
}
