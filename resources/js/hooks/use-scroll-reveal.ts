import { useEffect, useRef } from 'react';

/**
 * Adds `is-visible` class to referenced element when it enters the viewport.
 * Uses IntersectionObserver with threshold=0.12 so the animation triggers
 * when ~12% of the element is visible.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // Unobserve after first trigger (animate once)
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return ref;
}
