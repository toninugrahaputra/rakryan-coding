import { ArrowDown, ArrowUp } from 'lucide-react';

export default function ScrollToTopBottom() {
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
        });
    }

    return (
        <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 sm:right-6">
            <button
                type="button"
                onClick={scrollToTop}
                title="Scroll ke atas"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground shadow-md transition-colors hover:bg-muted hover:text-foreground"
            >
                <ArrowUp className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={scrollToBottom}
                title="Scroll ke bawah"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground shadow-md transition-colors hover:bg-muted hover:text-foreground"
            >
                <ArrowDown className="h-4 w-4" />
            </button>
        </div>
    );
}
