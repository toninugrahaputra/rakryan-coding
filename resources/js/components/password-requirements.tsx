import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PasswordRequirementsData = {
    min: number;
    letters: boolean;
    mixedCase: boolean;
    numbers: boolean;
    symbols: boolean;
    uncompromised: boolean;
};

type Rule = {
    label: string;
    test: ((value: string) => boolean) | null;
};

/**

 */
const SYMBOL_PATTERN = /[^\p{L}\p{N}]/u;

function buildRules(requirements: PasswordRequirementsData): Rule[] {
    const rules: Rule[] = [
        {
            label: `Minimal ${requirements.min} karakter`,
            test: (value) => value.length >= requirements.min,
        },
    ];

    if (requirements.letters) {
        rules.push({
            label: 'Mengandung huruf',
            test: (value) => /\p{L}/u.test(value),
        });
    }

    if (requirements.mixedCase) {
        rules.push({
            label: 'Ada huruf besar dan huruf kecil',
            test: (value) => /\p{Lu}/u.test(value) && /\p{Ll}/u.test(value),
        });
    }

    if (requirements.numbers) {
        rules.push({
            label: 'Mengandung angka',
            test: (value) => /\p{N}/u.test(value),
        });
    }

    if (requirements.symbols) {
        rules.push({
            label: 'Mengandung simbol (mis. ! @ # $)',
            test: (value) => SYMBOL_PATTERN.test(value),
        });
    }

    if (requirements.uncompromised) {
        
        rules.push({
            label: 'Bukan password yang pernah bocor di internet',
            test: null,
        });
    }

    return rules;
}

export function PasswordRequirements({
    requirements,
    value,
    className,
    id,
}: {
    requirements: PasswordRequirementsData;
    value: string;
    className?: string;
    id?: string;
}) {
    const rules = buildRules(requirements);
    const hasInput = value.length > 0;

    return (
        <ul id={id} className={cn('flex flex-col gap-1.5', className)}>
            {rules.map(({ label, test }) => {
                const checkable = test !== null;
                const passed = checkable && test(value);

                return (
                    <li
                        key={label}
                        className={cn(
                            'flex items-center gap-2 text-caption transition-colors',
                            passed
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-muted-foreground',
                        )}
                    >
                        {passed ? (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                        ) : checkable && hasInput ? (
                            <X className="h-3.5 w-3.5 shrink-0 text-destructive" />
                        ) : (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        )}
                        <span>{label}</span>
                    </li>
                );
            })}
        </ul>
    );
}
