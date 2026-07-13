// Credit: https://usehooks-ts.com/
import { useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

/**
 * Fallback untuk konteks tidak aman (http://, bukan https:///localhost) di mana
 * `navigator.clipboard` tidak tersedia sama sekali di browser modern.
 */
function copyWithLegacyFallback(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let success = false;

    try {
        success = document.execCommand('copy');
    } catch {
        success = false;
    }

    document.body.removeChild(textarea);

    return success;
}

export function useClipboard(): UseClipboardReturn {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = async (text) => {
        if (navigator?.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                setCopiedText(text);

                return true;
            } catch (error) {
                console.warn('Copy failed, trying fallback', error);
            }
        }

        const success = copyWithLegacyFallback(text);
        setCopiedText(success ? text : null);

        return success;
    };

    return [copiedText, copy];
}
