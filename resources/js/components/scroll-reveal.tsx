import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-right';
type DelayKey = 100 | 150 | 200 | 250 | 300 | 350;

interface ScrollRevealProps {
    children: React.ReactNode;
    animation?: AnimationType;
    delay?: DelayKey;
    className?: string;
    as?: keyof React.JSX.IntrinsicElements;
}

const DELAY_CLASS: Record<DelayKey, string> = {
    100: 'reveal-delay-100',
    150: 'reveal-delay-150',
    200: 'reveal-delay-200',
    250: 'reveal-delay-250',
    300: 'reveal-delay-300',
    350: 'reveal-delay-350',
};

/**
 * Wrapper component that animates its children when they scroll into view.
 *
 * Usage:
 * ```tsx
 * <ScrollReveal animation="fade-up" delay={100}>
 *   <MyCard />
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
    children,
    animation = 'fade-up',
    delay,
    className,
    as: Tag = 'div',
}: ScrollRevealProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const classes = cn(
        'reveal',
        `reveal-${animation}`,
        delay ? DELAY_CLASS[delay] : undefined,
        className,
    );

    return (
        // @ts-expect-error -- dynamic tag with ref
        <Tag ref={ref} className={classes}>
            {children}
        </Tag>
    );
}
