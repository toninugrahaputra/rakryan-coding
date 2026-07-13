import EditorJS, { type OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code2,
    FileUp,
    Heading2,
    ImageIcon,
    Italic,
    Link2,
    List as ListIcon,
    ListOrdered,
    Redo2,
    Rows3,
    Strikethrough,
    Table2,
    Type,
    Underline,
    Undo2,
} from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('php', php);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);

// ── Custom Code Tool ──────────────────────────────────────────────────────
const LANGUAGES = [
    { value: '', label: 'Auto Detect' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'php', label: 'PHP' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash / Shell' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
];

class CustomCodeTool {
    private _data: { code: string; language: string };
    private _textarea: HTMLTextAreaElement | null = null;
    private _select: HTMLSelectElement | null = null;

    static get toolbox() {
        return {
            title: 'Code',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        };
    }

    static get enableLineBreaks() {
        return true;
    }

    constructor({ data }: any) {
        this._data = { code: data?.code ?? '', language: data?.language ?? '' };
    }

    render() {
        const wrap = document.createElement('div');
        wrap.className = 'ce-code-custom';

        const bar = document.createElement('div');
        bar.className = 'ce-code-langbar';

        this._select = document.createElement('select');
        this._select.className = 'ce-code-langselect';
        LANGUAGES.forEach(({ value, label }) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            if (value === this._data.language) opt.selected = true;
            this._select!.appendChild(opt);
        });
        bar.appendChild(this._select);
        wrap.appendChild(bar);

        this._textarea = document.createElement('textarea');
        this._textarea.className = 'ce-code__textarea';
        this._textarea.value = this._data.code;
        this._textarea.placeholder = 'Tulis kode di sini...';
        this._textarea.setAttribute('autocomplete', 'off');
        this._textarea.setAttribute('autocorrect', 'off');
        this._textarea.setAttribute('autocapitalize', 'off');
        this._textarea.setAttribute('spellcheck', 'false');
        wrap.appendChild(this._textarea);

        return wrap;
    }

    save() {
        return {
            code: this._textarea?.value ?? this._data.code,
            language: this._select?.value ?? this._data.language,
        };
    }
}

// ── Custom inline tools ───────────────────────────────────────────────────
class BoldInlineTool {
    private _btn: HTMLButtonElement | null = null;
    static get isInline() { return true; }
    static get title() { return 'Bold'; }
    render() {
        this._btn = document.createElement('button');
        this._btn.type = 'button';
        this._btn.classList.add('ce-inline-tool');
        this._btn.innerHTML = '<b style="font-weight:700;font-style:normal">B</b>';
        return this._btn;
    }
    surround(range: Range) {
        const sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        document.execCommand('bold');
    }
    checkState() {
        const on = document.queryCommandState('bold');
        this._btn?.classList.toggle('ce-inline-tool--active', on);
        return on;
    }
}

class ItalicInlineTool {
    private _btn: HTMLButtonElement | null = null;
    static get isInline() { return true; }
    static get title() { return 'Italic'; }
    render() {
        this._btn = document.createElement('button');
        this._btn.type = 'button';
        this._btn.classList.add('ce-inline-tool');
        this._btn.innerHTML = '<i style="font-style:italic">i</i>';
        return this._btn;
    }
    surround(range: Range) {
        const sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        document.execCommand('italic');
    }
    checkState() {
        const on = document.queryCommandState('italic');
        this._btn?.classList.toggle('ce-inline-tool--active', on);
        return on;
    }
}

class UnderlineInlineTool {
    private _btn: HTMLButtonElement | null = null;
    static get isInline() { return true; }
    static get title() { return 'Underline'; }
    render() {
        this._btn = document.createElement('button');
        this._btn.type = 'button';
        this._btn.classList.add('ce-inline-tool');
        this._btn.innerHTML = '<u style="font-weight:600;font-style:normal">U</u>';
        return this._btn;
    }
    surround(range: Range) {
        const sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        document.execCommand('underline');
    }
    checkState() {
        const on = document.queryCommandState('underline');
        this._btn?.classList.toggle('ce-inline-tool--active', on);
        return on;
    }
}

class StrikethroughInlineTool {
    private _btn: HTMLButtonElement | null = null;
    static get isInline() { return true; }
    static get title() { return 'Strikethrough'; }
    static get sanitize() { return { s: true, strike: true }; }
    render() {
        this._btn = document.createElement('button');
        this._btn.type = 'button';
        this._btn.classList.add('ce-inline-tool');
        this._btn.innerHTML = '<s style="font-style:normal">S</s>';
        return this._btn;
    }
    surround(range: Range) {
        const sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        document.execCommand('strikeThrough');
    }
    checkState() {
        const on = document.queryCommandState('strikeThrough');
        this._btn?.classList.toggle('ce-inline-tool--active', on);
        return on;
    }
}

class LinkInlineTool {
    private _btn: HTMLButtonElement | null = null;
    static get isInline() { return true; }
    static get title() { return 'Link'; }
    static get sanitize() { return { a: { href: true } }; }
    render() {
        this._btn = document.createElement('button');
        this._btn.type = 'button';
        this._btn.classList.add('ce-inline-tool');
        this._btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
        return this._btn;
    }
    surround(range: Range) {
        const node = range.commonAncestorContainer;
        const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
        const sel = window.getSelection();
        if (el?.closest('a')) {
            const anchor = el.closest('a')!;
            if (sel) {
                const r = document.createRange();
                r.selectNodeContents(anchor);
                sel.removeAllRanges();
                sel.addRange(r);
            }
            document.execCommand('unlink');
        } else {
            if (sel) { sel.removeAllRanges(); sel.addRange(range); }
            const url = prompt('URL:');
            if (url) document.execCommand('createLink', false, url);
        }
    }
    checkState(selection: Selection) {
        if (!selection?.rangeCount) { this._btn?.classList.remove('ce-inline-tool--active'); return false; }
        const node = selection.getRangeAt(0).commonAncestorContainer;
        const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
        const on = !!el?.closest('a');
        this._btn?.classList.toggle('ce-inline-tool--active', on);
        return on;
    }
}

function _makeAlignTool(align: 'left' | 'center' | 'right', svg: string) {
    return class {
        private _btn: HTMLButtonElement | null = null;
        static get isInline() { return true; }
        static get title() { return `Align ${align[0].toUpperCase() + align.slice(1)}`; }
        render() {
            this._btn = document.createElement('button');
            this._btn.type = 'button';
            this._btn.classList.add('ce-inline-tool');
            this._btn.innerHTML = svg;
            return this._btn;
        }
        surround(range: Range) {
            const node = range.commonAncestorContainer;
            const contentEl = (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement))
                ?.closest<HTMLElement>('[contenteditable="true"]');
            if (!contentEl) return;
            const first = contentEl.firstElementChild as HTMLElement | null;
            if (first?.tagName === 'DIV' && first.style.textAlign && contentEl.children.length === 1) {
                contentEl.innerHTML = first.innerHTML;
            }
            if (align !== 'left') {
                contentEl.innerHTML = `<div style="text-align:${align}">${contentEl.innerHTML}</div>`;
            }
            contentEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        checkState(selection: Selection) {
            if (!selection?.rangeCount) { this._btn?.classList.remove('ce-inline-tool--active'); return false; }
            const node = selection.getRangeAt(0).commonAncestorContainer;
            const contentEl = (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement))
                ?.closest<HTMLElement>('[contenteditable="true"]');
            const first = contentEl?.firstElementChild as HTMLElement | null;
            const cur = (first?.tagName === 'DIV' && first.style.textAlign) ? first.style.textAlign : 'left';
            const on = cur === align;
            this._btn?.classList.toggle('ce-inline-tool--active', on);
            return on;
        }
    };
}

const _SVG = {
    alignLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',
    alignCenter: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>',
    alignRight: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>',
};

const AlignLeftInlineTool = _makeAlignTool('left', _SVG.alignLeft);
const AlignCenterInlineTool = _makeAlignTool('center', _SVG.alignCenter);
const AlignRightInlineTool = _makeAlignTool('right', _SVG.alignRight);

// ── Image alignment block tune ────────────────────────────────────────────
const _ALIGN_SVG = {
    left:   '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',
    center: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>',
    right:  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>',
};

const _ALIGN_JUSTIFY: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };

class ImageAlignTune {
    private _api: any;
    private _data: 'left' | 'center' | 'right';
    private _block: any;
    private _blockContent: HTMLElement | null = null;

    static get isTune() { return true; }

    constructor({ api, data, block }: any) {
        this._api = api;
        this._data = (data as 'left' | 'center' | 'right') ?? 'left';
        this._block = block;
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-align-tune';

        const OPTIONS = [
            { value: 'left' as const, title: 'Rata kiri' },
            { value: 'center' as const, title: 'Rata tengah' },
            { value: 'right' as const, title: 'Rata kanan' },
        ];

        OPTIONS.forEach(({ value, title }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `ce-settings__button${this._data === value ? ' ce-settings__button--active' : ''}`;
            btn.title = title;
            btn.innerHTML = _ALIGN_SVG[value];
            btn.addEventListener('click', () => {
                this._data = value;
                wrapper.querySelectorAll('.ce-settings__button').forEach((b, i) => {
                    b.classList.toggle('ce-settings__button--active', OPTIONS[i].value === value);
                });
                if (this._blockContent) this._applyWrap(this._blockContent);
                try { this._block.dispatchChange(); } catch { /* silently ignore */ }
            });
            wrapper.appendChild(btn);
        });

        return wrapper;
    }

    private _applyWrap(el: HTMLElement) {
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.alignItems = _ALIGN_JUSTIFY[this._data] ?? 'flex-start';
    }

    wrap(blockContent: HTMLElement) {
        this._blockContent = blockContent;
        this._applyWrap(blockContent);
        return blockContent;
    }

    save() { return this._data; }
}

// ── Types ─────────────────────────────────────────────────────────────────
export type EditorJsRef = {
    flush: () => Promise<{ data: OutputData; files: File[]; deletedUrls: string[] }>;
};

type Props = {
    value?: OutputData | null;
    onChange?: (data: OutputData) => void;
    disabled?: boolean;
    error?: boolean;
    placeholder?: string;
    uploadUrl?: string;
    deferUpload?: boolean;
};

// ── Word import helpers ───────────────────────────────────────────────────
function cleanInline(html: string): string {
    return html
        .replace(/<img\b[^>]*>/gi, '')
        .replace(/<a\b[^>]*>\s*<\/a>/gi, '') // strip Word bookmark anchors (e.g. <a id="_xyz"></a>)
        .trim();
}

// Strip Microsoft AI auto-generated alt text (e.g. "A screenshot of a computer\n\nDescription automatically generated")
function cleanImageCaption(alt: string): string {
    if (!alt) return '';
    if (/automatically generated/i.test(alt)) return '';
    if (/^a (screenshot|screen shot|computer screen)\b/i.test(alt)) return '';
    return alt.trim();
}

// Paragraph where ALL visible text is bold → Word heading using bold style instead of Heading style
function isBoldOnlyParagraph(node: HTMLElement): boolean {
    const strongs = [...node.querySelectorAll('strong')];
    if (!strongs.length) return false;
    const nodeText = (node.textContent ?? '').trim();
    const strongText = strongs.map((s) => s.textContent ?? '').join('').trim();
    return nodeText.length > 0 && nodeText === strongText;
}

// Bold-only paragraphs that look like code/commands should NOT become headers
function looksLikeCode(text: string): boolean {
    return /[{};()\\/]/.test(text) || / --/.test(text) || /->/.test(text);
}

function isHtmlBoldOnly(html: string): boolean {
    const div = document.createElement('div');
    div.innerHTML = html;
    return isBoldOnlyParagraph(div);
}

function dataUriToFile(dataUri: string, alt: string): File | null {
    try {
        const [header, base64] = dataUri.split(',');
        if (!base64) return null;
        const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
        const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        const name = (alt.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 40) || 'image') + '.' + ext;
        return new File([bytes], name, { type: mimeType });
    } catch {
        return null;
    }
}

async function htmlToEditorBlocks(
    html: string,
    imageUploader?: (file: File) => Promise<string>,
): Promise<any[]> {
    const root = document.createElement('div');
    root.innerHTML = html;
    const blocks: any[] = [];

    for (const node of [...root.childNodes]) {
        if (!(node instanceof HTMLElement)) continue;
        const tag = node.tagName.toLowerCase();

        if (/^h[1-6]$/.test(tag)) {
            const text = cleanInline(node.innerHTML);
            if (text) {
                blocks.push({ type: 'header', data: { text, level: Math.min(Math.max(parseInt(tag[1], 10), 2), 4) } });
            }
        } else if (tag === 'p') {
            const hasImages = !!node.querySelector('img[src^="data:"]');
            if (hasImages && imageUploader) {
                let currentHtml = '';
                for (const child of [...node.childNodes]) {
                    if (
                        child instanceof HTMLElement &&
                        child.tagName.toLowerCase() === 'img' &&
                        child.getAttribute('src')?.startsWith('data:')
                    ) {
                        const text = cleanInline(currentHtml);
                        if (text && text !== '&nbsp;') {
                            if (isHtmlBoldOnly(currentHtml) && !looksLikeCode(text)) {
                                blocks.push({ type: 'header', data: { text, level: 2 } });
                            } else {
                                blocks.push({ type: 'paragraph', data: { text } });
                            }
                        }
                        currentHtml = '';

                        const file = dataUriToFile(child.getAttribute('src') || '', child.getAttribute('alt') || '');
                        if (file) {
                            try {
                                const uploadedUrl = await imageUploader(file);
                                blocks.push({
                                    type: 'image',
                                    data: {
                                        file: { url: uploadedUrl },
                                        caption: cleanImageCaption(child.getAttribute('alt') || ''),
                                        withBorder: false,
                                        withBackground: false,
                                        stretched: false
                                    },
                                });
                            } catch (err) {
                                console.error('Failed to upload inline image:', err);
                            }
                        }
                    } else {
                        if (child instanceof HTMLElement) {
                            currentHtml += child.outerHTML;
                        } else {
                            currentHtml += child.nodeValue || '';
                        }
                    }
                }
                const text = cleanInline(currentHtml);
                if (text && text !== '&nbsp;') {
                    if (isHtmlBoldOnly(currentHtml) && !looksLikeCode(text)) {
                        blocks.push({ type: 'header', data: { text, level: 2 } });
                    } else {
                        blocks.push({ type: 'paragraph', data: { text } });
                    }
                }
            } else {
                const textAfterStrip = cleanInline(node.innerHTML);
                const visibleText = textAfterStrip.replace(/<[^>]+>/g, '').trim();
                if (!visibleText || textAfterStrip === '&nbsp;') continue;
                if (isBoldOnlyParagraph(node) && !looksLikeCode(node.textContent ?? '')) {
                    const headingHtml = [...node.querySelectorAll('strong')].map((s) => s.innerHTML).join('').trim();
                    if (headingHtml) {
                        blocks.push({ type: 'header', data: { text: headingHtml, level: 2 } });
                        continue;
                    }
                }
                blocks.push({ type: 'paragraph', data: { text: textAfterStrip } });
            }
        } else if (tag === 'img' && node.getAttribute('src')?.startsWith('data:') && imageUploader) {
            const file = dataUriToFile(node.getAttribute('src') || '', node.getAttribute('alt') || '');
            if (file) {
                try {
                    const uploadedUrl = await imageUploader(file);
                    blocks.push({
                        type: 'image',
                        data: {
                            file: { url: uploadedUrl },
                            caption: cleanImageCaption(node.getAttribute('alt') || ''),
                            withBorder: false,
                            withBackground: false,
                            stretched: false
                        },
                    });
                } catch (err) {
                    console.error('Failed to upload standalone image:', err);
                }
            }
        } else if (tag === 'ul' || tag === 'ol') {
            const items = [...node.querySelectorAll<HTMLElement>(':scope > li')].map((li) => ({
                content: cleanInline(li.innerHTML),
                meta: {},
                items: [],
            }));
            if (items.length) {
                blocks.push({ type: 'list', data: { style: tag === 'ol' ? 'ordered' : 'unordered', meta: {}, items } });
            }
        } else if (tag === 'table') {
            const rows = [...node.querySelectorAll('tr')];
            const allCells = [...node.querySelectorAll('td, th')];
            if (rows.length === 1 && allCells.length === 1) {
                const cell = allCells[0] as HTMLElement;
                const cellParas = [...cell.querySelectorAll('p')];
                const firstStrongText = (cell.querySelector('strong')?.textContent ?? '').trim();
                if (/^(note|catatan|info|penting|warning|tips)/i.test(firstStrongText)) {
                    const noteText = cellParas.length
                        ? cellParas.map((p) => cleanInline(p.innerHTML)).filter(Boolean).join('<br>')
                        : cleanInline(cell.innerHTML);
                    if (noteText) blocks.push({ type: 'quote', data: { text: noteText, caption: '', alignment: 'left' } });
                } else if (cellParas.length > 1) {
                    const code = cellParas.map((p) => p.textContent ?? '').join('\n').trimEnd();
                    if (code) blocks.push({ type: 'code', data: { code, language: '' } });
                } else {
                    const text = cellParas.length ? cleanInline(cellParas[0].innerHTML) : cleanInline(cell.innerHTML);
                    if (text) blocks.push({ type: 'paragraph', data: { text } });
                }
            } else {
                const tableRows = rows.map((tr) =>
                    [...tr.querySelectorAll('td, th')].map((cell) => cleanInline((cell as HTMLElement).innerHTML))
                );
                const withHeadings = !!node.querySelector('th');
                if (tableRows.length) blocks.push({ type: 'table', data: { withHeadings, content: tableRows } });
            }
        } else if (tag === 'blockquote') {
            const text = cleanInline(node.innerHTML);
            if (text) {
                blocks.push({ type: 'quote', data: { text, caption: '', alignment: 'left' } });
            }
        }
    }

    // Merge consecutive ordered lists — fixes fragmented numbered steps caused by interleaved images in Word
    const merged: any[] = [];
    for (const block of blocks) {
        const prev = merged[merged.length - 1];
        if (block.type === 'list' && block.data.style === 'ordered' &&
            prev?.type === 'list' && prev.data.style === 'ordered') {
            prev.data.items.push(...block.data.items);
        } else {
            merged.push(block);
        }
    }
    return merged;
}

// ── Data normalizer ───────────────────────────────────────────────────────
function normalizeEditorData(data: OutputData | null | undefined): OutputData | undefined {
    if (!data) return undefined;
    const raw: OutputData = JSON.parse(JSON.stringify(data));
    const normalizeItem = (item: any): any => {
        if (typeof item === 'string') return { content: item, meta: {}, items: [] };
        return { content: item.content ?? '', meta: item.meta ?? {}, items: (item.items ?? []).map(normalizeItem) };
    };
    const blocks = (raw.blocks ?? []).map((block: any) => {
        if (block.type !== 'list') return block;
        return { ...block, data: { ...block.data, meta: block.data.meta ?? {}, items: (block.data.items ?? []).map(normalizeItem) } };
    });
    return { ...raw, blocks };
}

// ── Table popover portal ──────────────────────────────────────────────────
function portalPopover(pop: HTMLElement) {
    if (pop.dataset.ejsPortaled === '1') return;
    const rect = pop.getBoundingClientRect();
    if (!rect.width) { requestAnimationFrame(() => portalPopover(pop)); return; }

    pop.dataset.ejsPortaled = '1';
    (pop as any)._ejsParent = pop.parentElement;
    (pop as any)._ejsNextSib = pop.nextSibling;

    document.body.appendChild(pop);
    pop.style.setProperty('position', 'fixed', 'important');
    pop.style.setProperty('top', rect.top + 'px', 'important');
    pop.style.setProperty('left', rect.left + 'px', 'important');
    pop.style.setProperty('z-index', '999999', 'important');
    pop.style.setProperty('margin', '0', 'important');

    const closeObs = new MutationObserver(() => {
        if (!pop.classList.contains('tc-popover--opened')) {
            closeObs.disconnect();
            deportalPopover(pop);
        }
    });
    closeObs.observe(pop, { attributes: true, attributeFilter: ['class'] });
    (pop as any)._ejsCloseObs = closeObs;

    requestAnimationFrame(() => {
        if (pop.dataset.ejsPortaled !== '1') return;
        const r2 = pop.getBoundingClientRect();
        if (r2.right > window.innerWidth - 8) pop.style.setProperty('left', (window.innerWidth - r2.width - 8) + 'px', 'important');
        if (r2.top < 8) pop.style.setProperty('top', '8px', 'important');
    });
}

function deportalPopover(pop: HTMLElement) {
    if (pop.dataset.ejsPortaled !== '1') return;
    (pop as any)._ejsCloseObs?.disconnect();
    const parent: HTMLElement | null = (pop as any)._ejsParent;
    const nextSib: Node | null = (pop as any)._ejsNextSib;
    delete pop.dataset.ejsPortaled;
    delete (pop as any)._ejsParent;
    delete (pop as any)._ejsNextSib;
    delete (pop as any)._ejsCloseObs;
    pop.style.removeProperty('position');
    pop.style.removeProperty('top');
    pop.style.removeProperty('left');
    pop.style.removeProperty('z-index');
    pop.style.removeProperty('margin');
    if (parent) parent.insertBefore(pop, nextSib);
}

// ── Preview renderer ──────────────────────────────────────────────────────
function esc(s: string) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s: string) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function blockToHtml(block: any, olStart = 1): string {
    switch (block.type) {
        case 'paragraph':
            return `<div class="ejs-p">${block.data.text ?? ''}</div>`;
        case 'header':
            return `<h${block.data.level}>${block.data.text ?? ''}</h${block.data.level}>`;
        case 'list': {
            const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const startAttr = block.data.style === 'ordered' && olStart > 1 ? ` start="${olStart}"` : '';
            const items = (block.data.items ?? [])
                .map((it: any) => `<li>${typeof it === 'string' ? it : (it.content ?? '')}</li>`)
                .join('');
            return `<${tag}${startAttr}>${items}</${tag}>`;
        }
        case 'quote':
            return `<blockquote>${block.data.text ?? ''}</blockquote>`;
        case 'code': {
            const raw = block.data.code ?? '';
            const explicitLang = block.data.language ?? '';
            let highlighted = '';
            let detectedLang = explicitLang;
            try {
                if (explicitLang && hljs.getLanguage(explicitLang)) {
                    highlighted = hljs.highlight(raw, { language: explicitLang }).value;
                } else {
                    const result = hljs.highlightAuto(raw);
                    highlighted = result.value;
                    detectedLang = result.language ?? '';
                }
            } catch {
                highlighted = esc(raw);
            }
            const langBadge = detectedLang ? `<span class="ejs-code-lang">${esc(detectedLang)}</span>` : '';
            return `<div class="ejs-code-wrap"><div class="ejs-code-toolbar">${langBadge}<button type="button" class="ejs-copy-btn" data-code="${escAttr(raw)}">Copy</button></div><pre><code class="hljs">${highlighted}</code></pre></div>`;
        }
        case 'table': {
            const withHeadings = block.data.withHeadings ?? false;
            const content: string[][] = block.data.content ?? [];
            if (!content.length) return '';
            let rows = '';
            content.forEach((row: string[], ri: number) => {
                const tag = withHeadings && ri === 0 ? 'th' : 'td';
                const cells = row.map((cell: string) => `<${tag}>${cell}</${tag}>`).join('');
                rows += `<tr>${cells}</tr>`;
            });
            return `<div class="ejs-table-wrap"><table class="ejs-table"><tbody>${rows}</tbody></table></div>`;
        }
        case 'image': {
            const url = block.data.file?.url;
            if (!url) return '';
            const alignment = (block as any).tunes?.imageAlign ?? 'left';
            const alignItems = _ALIGN_JUSTIFY[alignment] ?? 'flex-start';
            const caption = block.data.caption
                ? `<figcaption class="ejs-caption">${esc(block.data.caption)}</figcaption>`
                : '';
            return `<figure class="ejs-figure" style="display:flex;flex-direction:column;align-items:${alignItems}"><img src="${escAttr(url)}" alt="${escAttr(block.data.caption ?? '')}" />${caption}</figure>`;
        }
        default:
            return '';
    }
}

// ── Component ─────────────────────────────────────────────────────────────
const EditorJsComponent = forwardRef<EditorJsRef, Props>(function EditorJsComponent(
    { value, onChange, disabled = false, error = false, placeholder, uploadUrl, deferUpload = false },
    ref,
) {
    const holderRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorJS | null>(null);
    const savedRangeRef = useRef<Range | null>(null);
    const tablePopoverObserverRef = useRef<MutationObserver | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingFilesRef = useRef<Map<string, File>>(new Map());
    const blobToIdRef = useRef<Map<string, string>>(new Map());
    const initialImageUrlsRef = useRef<Set<string>>(new Set());
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [activeBlockType, setActiveBlockType] = useState('paragraph');
    const [activeListStyle, setActiveListStyle] = useState('unordered');
    const [tableWithHeadings, setTableWithHeadings] = useState(false);
    const [inlineBold, setInlineBold] = useState(false);
    const [inlineItalic, setInlineItalic] = useState(false);
    const [inlineUnderline, setInlineUnderline] = useState(false);
    const [inlineStrike, setInlineStrike] = useState(false);
    const [imageAlignment, setImageAlignment] = useState<'left' | 'center' | 'right'>('left');
    const [isImporting, setIsImporting] = useState(false);

    // ── Image URL tracking (for delete detection) ─────────────────────────
    useEffect(() => {
        // Snapshot permanent image URLs from initial value so flush() can detect deletions
        const urls = (value?.blocks ?? [])
            .filter((b: any) => b.type === 'image')
            .map((b: any) => b.data?.file?.url ?? '')
            .filter((url: string) => url && !url.startsWith('blob:') && !url.startsWith('__PENDING_'));
        initialImageUrlsRef.current = new Set(urls);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        return () => {
            // Revoke any remaining blob URLs to prevent memory leaks on unmount
            blobToIdRef.current.forEach((_, blobUrl) => URL.revokeObjectURL(blobUrl));
        };
    }, []);

    // ── Deferred upload helpers ───────────────────────────────────────────
    async function addPendingBlob(file: File): Promise<string> {
        const tempId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const blobUrl = URL.createObjectURL(file);
        pendingFilesRef.current.set(tempId, file);
        blobToIdRef.current.set(blobUrl, tempId);
        return blobUrl;
    }

    useImperativeHandle(ref, () => ({
        async flush() {
            const editor = editorRef.current;
            if (!editor) return { data: { time: Date.now(), blocks: [], version: '2.31.6' } as OutputData, files: [], deletedUrls: [] };

            const outputData = await editor.save();
            const files: File[] = [];
            const activeBlobUrls = new Set<string>();

            const blocks = outputData.blocks.map((block) => {
                if (block.type !== 'image') return block;
                const url: string = (block.data as any)?.file?.url ?? '';
                if (!url.startsWith('blob:')) return block;

                activeBlobUrls.add(url);

                const tempId = blobToIdRef.current.get(url);
                const file = tempId ? pendingFilesRef.current.get(tempId) : undefined;
                if (!file) return block;

                const idx = files.length;
                files.push(file);

                return { ...block, data: { ...block.data, file: { url: `__PENDING_${idx}__` } } };
            });

            // Revoke only blob URLs that are no longer in the editor (user deleted them)
            blobToIdRef.current.forEach((tempId, blobUrl) => {
                if (!activeBlobUrls.has(blobUrl)) {
                    URL.revokeObjectURL(blobUrl);
                    pendingFilesRef.current.delete(tempId);
                    blobToIdRef.current.delete(blobUrl);
                }
            });

            // Detect permanent image URLs removed since initial load → send to backend for deletion
            const currentPermanentUrls = new Set(
                blocks
                    .filter((b) => b.type === 'image')
                    .map((b) => (b.data as any)?.file?.url ?? '')
                    .filter((url: string) => url && !url.startsWith('__PENDING_')),
            );
            const deletedUrls = [...initialImageUrlsRef.current].filter((url) => !currentPermanentUrls.has(url));

            return { data: { ...outputData, blocks }, files, deletedUrls };
        },
    }));

    // ── Word import ───────────────────────────────────────────────────────
    async function handleWordImport(file: File) {
        const editor = editorRef.current;
        if (!editor) return;

        const existing = await editor.save();
        if (existing.blocks.length > 0 && !confirm('Konten editor saat ini akan diganti dengan isi file Word. Lanjutkan?')) {
            return;
        }

        setIsImporting(true);
        try {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const { value: html } = await (mammoth.convertToHtml ?? (mammoth as any).default?.convertToHtml)({ arrayBuffer });

            const imageHandler = deferUpload
                ? addPendingBlob
                : uploadUrl
                ? async (file: File) => {
                      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
                      const xsrfCookie = document.cookie
                          .split('; ')
                          .find(row => row.startsWith('XSRF-TOKEN='))
                          ?.split('=')[1] ?? '';
                      const decodedXsrf = decodeURIComponent(xsrfCookie);
                      const headers: Record<string, string> = {};
                      if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
                      if (decodedXsrf) headers['X-XSRF-TOKEN'] = decodedXsrf;

                      const body = new FormData();
                      body.append('image', file);
                      const res = await fetch(uploadUrl, { method: 'POST', headers, body });
                      const data = await res.json();
                      if (data.success && data.file?.url) {
                          return data.file.url;
                      }
                      throw new Error('Upload failed');
                  }
                : undefined;

            const blocks = await htmlToEditorBlocks(html, imageHandler);
            if (!blocks.length) {
                alert('Tidak ada konten yang dapat diimpor dari file ini.');
                return;
            }
            await editor.render({ time: Date.now(), blocks, version: '2.31.6' });
            const data = await editor.save();
            onChangeRef.current?.(data);
        } catch {
            alert('Gagal mengimpor file Word. Pastikan file berformat .docx.');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    // ── Image alignment from toolbar ──────────────────────────────────────
    async function setImageAlignFromToolbar(alignment: 'left' | 'center' | 'right') {
        const editor = editorRef.current;
        if (!editor) return;
        const idx = editor.blocks.getCurrentBlockIndex();
        if (idx < 0) return;
        try {
            const saved = await editor.save();
            const block = saved.blocks[idx];
            if (!block || block.type !== 'image') return;
            await (editor.blocks as any).update(block.id, block.data, { imageAlign: alignment });
            setImageAlignment(alignment);
        } catch { /* silently ignore */ }
    }

    // ── Toolbar state sync ────────────────────────────────────────────────
    function syncToolbarState() {
        const focused = document.activeElement as HTMLElement | null;
        if (!focused || !holderRef.current?.contains(focused)) return;
        let el: HTMLElement | null = focused;
        while (el && el !== holderRef.current && !el.classList.contains('ce-block')) {
            el = el.parentElement;
        }
        if (!el?.classList.contains('ce-block')) return;

        if (el.querySelector('.cdx-list')) {
            setActiveBlockType('list');
            setActiveListStyle(el.querySelector('.cdx-list-ordered') ? 'ordered' : 'unordered');
        } else if (el.querySelector('h1,h2,h3,h4,h5,h6')) {
            setActiveBlockType('header');
        } else if (el.querySelector('.cdx-simple-image, .image-tool')) {
            setActiveBlockType('image');
            // Read current alignment from the style applied by ImageAlignTune.wrap()
            const wrapEl = el.querySelector<HTMLElement>('[style*="align-items"]');
            const alignItems = wrapEl?.style.alignItems ?? 'flex-start';
            setImageAlignment(alignItems === 'center' ? 'center' : alignItems === 'flex-end' ? 'right' : 'left');
        } else if (el.querySelector('.ce-code, .cdx-code')) {
            setActiveBlockType('code');
        } else if (el.querySelector('.tc-wrap, .tc-table')) {
            setActiveBlockType('table');
            setTableWithHeadings(!!el.querySelector('.tc-cell--head'));
        } else {
            setActiveBlockType('paragraph');
        }

        setInlineBold(document.queryCommandState('bold'));
        setInlineItalic(document.queryCommandState('italic'));
        setInlineUnderline(document.queryCommandState('underline'));
        setInlineStrike(document.queryCommandState('strikeThrough'));
    }

    function onEditorInteract() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (holderRef.current?.contains(range.commonAncestorContainer)) {
            savedRangeRef.current = range.cloneRange();
            syncToolbarState();
        }
    }

    function restoreSelection() {
        if (!savedRangeRef.current) return;
        const node = savedRangeRef.current.commonAncestorContainer;
        const el = node instanceof HTMLElement ? node : node.parentElement;
        el?.closest<HTMLElement>('[contenteditable="true"]')?.focus();
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(savedRangeRef.current);
        }
    }

    // ── Toolbar actions ───────────────────────────────────────────────────
    function applyInline(command: string) {
        if (command === 'undo' || command === 'redo') {
            const el = holderRef.current?.querySelector<HTMLElement>('[contenteditable="true"]');
            el?.focus();
            document.execCommand(command, false);
            return;
        }
        if (command === 'createLink') {
            restoreSelection();
            const url = prompt('URL:');
            if (url) document.execCommand('createLink', false, url);
            return;
        }
        if (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight') {
            const align = command === 'justifyLeft' ? 'left' : command === 'justifyCenter' ? 'center' : 'right';
            // Image blocks can't be text-selected — route through the tune API instead
            if (activeBlockType === 'image') {
                setImageAlignFromToolbar(align as 'left' | 'center' | 'right');
                return;
            }
            const contentEl = document.activeElement as HTMLElement | null;
            if (!contentEl?.isContentEditable || !holderRef.current?.contains(contentEl)) return;
            const first = contentEl.firstElementChild as HTMLElement | null;
            if (first?.tagName === 'DIV' && first.style.textAlign && contentEl.children.length === 1) {
                contentEl.innerHTML = first.innerHTML;
            }
            if (align !== 'left') {
                contentEl.innerHTML = `<div style="text-align:${align}">${contentEl.innerHTML}</div>`;
            }
            contentEl.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        restoreSelection();
        document.execCommand(command, false);
        const postSel = window.getSelection();
        if (postSel?.rangeCount) savedRangeRef.current = postSel.getRangeAt(0).cloneRange();
        requestAnimationFrame(() => syncToolbarState());
    }

    function convertBlock(type: string, extra: Record<string, unknown> = {}) {
        const editor = editorRef.current;
        if (!editor) return;
        const idx = editor.blocks.getCurrentBlockIndex();
        const blockEls = holderRef.current?.querySelectorAll('.ce-block');
        const contentEl = blockEls?.[idx]?.querySelector<HTMLElement>('[contenteditable="true"]');

        let data: Record<string, unknown>;
        if (type === 'list') {
            const plain = contentEl?.innerText?.trim() ?? '';
            data = { style: extra.style ?? 'unordered', meta: {}, items: [{ content: plain, meta: {}, items: [] }] };
        } else {
            data = { ...extra, text: contentEl?.innerHTML ?? '' };
        }

        editor.blocks.insert(type, data, {}, idx, true, true);

        setTimeout(() => {
            const blocks = holderRef.current?.querySelectorAll('.ce-block');
            const newCE = blocks?.[idx]?.querySelector<HTMLElement>('[contenteditable="true"]');
            if (newCE) {
                newCE.focus();
                const r = document.createRange();
                r.selectNodeContents(newCE);
                r.collapse(false);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(r);
                savedRangeRef.current = r.cloneRange();
            }
            syncToolbarState();
        }, 50);
    }

    async function toggleTableHeadings() {
        const editor = editorRef.current;
        if (!editor) return;
        const idx = editor.blocks.getCurrentBlockIndex();
        if (idx < 0) return;
        const output = await editor.save();
        const blockData = output.blocks[idx];
        if (blockData?.type !== 'table') return;
        const newVal = !blockData.data.withHeadings;
        editor.blocks.insert('table', { ...blockData.data, withHeadings: newVal }, {}, idx, true, true);
        setTableWithHeadings(newVal);
    }

    // ── EditorJS init ─────────────────────────────────────────────────────
    useEffect(() => {
        const container = holderRef.current;
        if (!container) return;

        // Give each EditorJS instance its own child div so that concurrent
        // async initializations (React Strict Mode double-invoke) don't share
        // the same DOM node. A stale instance's destroy() only affects its own
        // isolated div and cannot corrupt the live instance.
        container.innerHTML = '';
        const holder = document.createElement('div');
        container.appendChild(holder);

        let isMounted = true;

        const editor = new EditorJS({
            holder,
            readOnly: disabled,
            data: normalizeEditorData(value) as any,
            placeholder: placeholder ?? 'Mulai menulis...',
            tools: {
                header: { class: Header as any, inlineToolbar: true, config: { levels: [2, 3, 4], defaultLevel: 2 } },
                list: { class: List as any, inlineToolbar: true },
                quote: { class: Quote as any, inlineToolbar: true },
                code: { class: CustomCodeTool as any },
                table: { class: Table as any, inlineToolbar: true, config: { rows: 2, cols: 3, withHeadings: false } },
                bold: { class: BoldInlineTool as any },
                italic: { class: ItalicInlineTool as any },
                link: { class: LinkInlineTool as any },
                underline: { class: UnderlineInlineTool as any },
                strikethrough: { class: StrikethroughInlineTool as any },
                alignLeft: { class: AlignLeftInlineTool as any },
                alignCenter: { class: AlignCenterInlineTool as any },
                alignRight: { class: AlignRightInlineTool as any },
                imageAlign: { class: ImageAlignTune as any },
                ...(deferUpload ? {
                    image: {
                        class: ImageTool as any,
                        tunes: ['imageAlign'],
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const blobUrl = await addPendingBlob(file);
                                    return { success: 1, file: { url: blobUrl } };
                                },
                            },
                        },
                    },
                } : uploadUrl ? {
                    image: {
                        class: ImageTool as any,
                        tunes: ['imageAlign'],
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
                                    const xsrfCookie = document.cookie
                                        .split('; ')
                                        .find(row => row.startsWith('XSRF-TOKEN='))
                                        ?.split('=')[1] ?? '';
                                    const decodedXsrf = decodeURIComponent(xsrfCookie);
                                    const headers: Record<string, string> = {};
                                    if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
                                    if (decodedXsrf) headers['X-XSRF-TOKEN'] = decodedXsrf;
                                    const body = new FormData();
                                    body.append('image', file);
                                    const res = await fetch(uploadUrl, { method: 'POST', headers, body });
                                    return res.json();
                                },
                            },
                        },
                    },
                } : {}),
            },
            onChange: async () => {
                const data = await editor.save();
                onChangeRef.current?.(data);
            },
        });

        editor.isReady.then(() => {
            if (!isMounted) { editor.destroy(); return; }
            editorRef.current = editor;

            holder.addEventListener('mouseup', onEditorInteract);
            holder.addEventListener('keyup', onEditorInteract);

            const obs = new MutationObserver((mutations) => {
                for (const mut of mutations) {
                    if (mut.type === 'attributes' && mut.attributeName === 'class') {
                        const el = mut.target as HTMLElement;
                        if (!el.classList.contains('tc-popover')) continue;
                        if (el.classList.contains('tc-popover--opened')) portalPopover(el);
                    }
                    if (mut.type === 'childList') {
                        mut.addedNodes.forEach((node) => {
                            if (!(node instanceof HTMLElement)) return;
                            const pops = node.classList?.contains('tc-popover') ? [node] : [...node.querySelectorAll<HTMLElement>('.tc-popover')];
                            pops.filter((p) => p.classList.contains('tc-popover--opened')).forEach(portalPopover);
                        });
                    }
                }
            });
            obs.observe(holder, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
            tablePopoverObserverRef.current = obs;
        });

        return () => {
            isMounted = false;
            holder.removeEventListener('mouseup', onEditorInteract);
            holder.removeEventListener('keyup', onEditorInteract);
            tablePopoverObserverRef.current?.disconnect();
            tablePopoverObserverRef.current = null;
            editorRef.current?.destroy();
            editorRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        editorRef.current?.readOnly?.toggle(disabled);
    }, [disabled]);

    // ── Preview HTML ──────────────────────────────────────────────────────
    const previewHtml = useMemo(() => {
        if (!value?.blocks?.length) return '<p class="empty-hint">Belum ada konten.</p>';
        // Track ordered list numbering across blocks — images between steps don't reset the counter
        let olStart = 1;
        let lastSignificantWasOl = false;
        return value.blocks.map((block) => {
            if (block.type === 'list' && block.data.style === 'ordered') {
                if (!lastSignificantWasOl) olStart = 1;
                const html = blockToHtml(block, olStart);
                olStart += (block.data.items ?? []).length;
                lastSignificantWasOl = true;
                return html;
            }
            if (block.type === 'image') {
                return blockToHtml(block); // images don't break the numbered list sequence
            }
            lastSignificantWasOl = false;
            olStart = 1;
            return blockToHtml(block);
        }).join('\n');
    }, [value]);

    async function handlePreviewClick(e: React.MouseEvent) {
        const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
        if (link) { e.preventDefault(); window.open(link.href, '_blank', 'noopener,noreferrer'); return; }
        const btn = (e.target as HTMLElement).closest<HTMLElement>('.ejs-copy-btn');
        if (!btn) return;
        const code = btn.dataset.code ?? '';
        try {
            await navigator.clipboard.writeText(code);
            btn.classList.add('ejs-copy-btn--copied');
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.classList.remove('ejs-copy-btn--copied'); btn.textContent = 'Copy'; }, 2000);
        } catch { /* silent */ }
    }

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className={`ejs-wrap rounded-lg border ${error ? 'border-red-400 ring-1 ring-red-400' : 'border-input'}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWordImport(f); }}
            />
            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 pt-2 gap-1 rounded-t-lg">
                <button type="button" className={`tab-btn ${activeTab === 'editor' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('editor')}>
                    Editor
                </button>
                <button type="button" className={`tab-btn ${activeTab === 'preview' ? 'tab-active' : 'tab-inactive'}`} onClick={() => setActiveTab('preview')}>
                    Preview
                </button>
            </div>

            {/* Toolbar */}
            {activeTab === 'editor' && !disabled && (
                <div className="ejs-toolbar flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <button type="button" className="tbtn" title="Undo" onMouseDown={(e) => { e.preventDefault(); applyInline('undo'); }}><Undo2 className="h-4 w-4" /></button>
                    <button type="button" className="tbtn" title="Redo" onMouseDown={(e) => { e.preventDefault(); applyInline('redo'); }}><Redo2 className="h-4 w-4" /></button>
                    <span className="tbtn-sep" />
                    <button type="button" className={`tbtn ${inlineBold ? 'tbtn-active' : ''}`} title="Bold" onMouseDown={(e) => { e.preventDefault(); applyInline('bold'); }}><Bold className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${inlineItalic ? 'tbtn-active' : ''}`} title="Italic" onMouseDown={(e) => { e.preventDefault(); applyInline('italic'); }}><Italic className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${inlineUnderline ? 'tbtn-active' : ''}`} title="Underline" onMouseDown={(e) => { e.preventDefault(); applyInline('underline'); }}><Underline className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${inlineStrike ? 'tbtn-active' : ''}`} title="Strikethrough" onMouseDown={(e) => { e.preventDefault(); applyInline('strikeThrough'); }}><Strikethrough className="h-4 w-4" /></button>
                    <button type="button" className="tbtn" title="Link" onMouseDown={(e) => { e.preventDefault(); applyInline('createLink'); }}><Link2 className="h-4 w-4" /></button>
                    <span className="tbtn-sep" />
                    <button type="button" className={`tbtn ${activeBlockType === 'image' && imageAlignment === 'left' ? 'tbtn-active' : ''}`} title="Rata kiri" onMouseDown={(e) => { e.preventDefault(); applyInline('justifyLeft'); }}><AlignLeft className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${activeBlockType === 'image' && imageAlignment === 'center' ? 'tbtn-active' : ''}`} title="Rata tengah" onMouseDown={(e) => { e.preventDefault(); applyInline('justifyCenter'); }}><AlignCenter className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${activeBlockType === 'image' && imageAlignment === 'right' ? 'tbtn-active' : ''}`} title="Rata kanan" onMouseDown={(e) => { e.preventDefault(); applyInline('justifyRight'); }}><AlignRight className="h-4 w-4" /></button>
                    <span className="tbtn-sep" />
                    <button type="button" className={`tbtn ${activeBlockType === 'paragraph' ? 'tbtn-active' : ''}`} title="Paragraf" onMouseDown={(e) => { e.preventDefault(); convertBlock('paragraph'); }}><Type className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${activeBlockType === 'header' ? 'tbtn-active' : ''}`} title="Heading 2" onMouseDown={(e) => { e.preventDefault(); convertBlock('header', { level: 2 }); }}><Heading2 className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${activeBlockType === 'list' && activeListStyle === 'unordered' ? 'tbtn-active' : ''}`} title="Bullet list" onMouseDown={(e) => { e.preventDefault(); convertBlock('list', { style: 'unordered' }); }}><ListIcon className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${activeBlockType === 'list' && activeListStyle === 'ordered' ? 'tbtn-active' : ''}`} title="Numbered list" onMouseDown={(e) => { e.preventDefault(); convertBlock('list', { style: 'ordered' }); }}><ListOrdered className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${activeBlockType === 'code' ? 'tbtn-active' : ''}`} title="Code" onMouseDown={(e) => { e.preventDefault(); editorRef.current?.blocks.insert('code', { code: '' }, {}, (editorRef.current?.blocks.getCurrentBlockIndex() ?? 0) + 1, true); }}><Code2 className="h-4 w-4" /></button>
                    <button type="button" className={`tbtn ${activeBlockType === 'table' ? 'tbtn-active' : ''}`} title="Tabel" onMouseDown={(e) => { e.preventDefault(); editorRef.current?.blocks.insert('table', { withHeadings: true, content: [['', '', ''], ['', '', '']] }, {}, (editorRef.current?.blocks.getCurrentBlockIndex() ?? 0) + 1, true); }}><Table2 className="h-4 w-4" /></button>
                    {activeBlockType === 'table' && (
                        <button type="button" className={`tbtn ${tableWithHeadings ? 'tbtn-active' : ''}`} title="Toggle baris judul" onMouseDown={(e) => { e.preventDefault(); toggleTableHeadings(); }}><Rows3 className="h-4 w-4" /></button>
                    )}
                    <span className="tbtn-sep" />
                    {deferUpload || uploadUrl ? (
                        <button type="button" className="tbtn" title="Gambar" onMouseDown={(e) => { e.preventDefault(); editorRef.current?.blocks.insert('image', {}, {}, (editorRef.current?.blocks.getCurrentBlockIndex() ?? 0) + 1, true); }}><ImageIcon className="h-4 w-4" /></button>
                    ) : (
                        <button type="button" className="tbtn tbtn-dim" title="Gambar (perlu uploadUrl atau deferUpload)" onMouseDown={(e) => e.preventDefault()}><ImageIcon className="h-4 w-4" /></button>
                    )}
                    <span className="tbtn-sep" />
                    <button
                        type="button"
                        className="tbtn flex items-center gap-1.5 px-2 text-xs font-medium"
                        title="Import dari Word (.docx)"
                        disabled={isImporting}
                        onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                    >
                        <FileUp className="h-4 w-4" />
                        {isImporting ? 'Mengimpor...' : 'Import Word'}
                    </button>
                </div>
            )}

            {/* Editor area — always rendered, hidden via CSS when on preview tab to keep EditorJS DOM alive */}
            <div
                ref={holderRef}
                className="ejs-editor min-h-48 text-base rounded-b-lg"
                style={{ display: activeTab === 'editor' ? 'block' : 'none' }}
            />

            {/* Preview area */}
            {activeTab === 'preview' && (
                <div className="ejs-preview min-h-48 rounded-b-lg">
                    <div
                        className="mx-auto max-w-2xl bg-white dark:bg-gray-950 rounded-lg px-6 py-8 text-base text-gray-800 dark:text-gray-200"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                        onClick={handlePreviewClick}
                    />
                </div>
            )}
        </div>
    );
});

export default EditorJsComponent;
