import { Form, Head, useHttp } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { resend, store } from '@/routes/verification/code';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailCode() {
    const [code, setCode] = useState<string>('');
    const [cooldown, setCooldown] = useState<number>(RESEND_COOLDOWN_SECONDS);
    const [resending, setResending] = useState<boolean>(false);
    const { submit } = useHttp();

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setCooldown((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const handleResend = async (): Promise<void> => {
        setResending(true);

        try {
            await submit(resend());
            setCode('');
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            <Head title="Verifikasi email" />

            <div className="space-y-6">
                <Form {...store.form()} className="space-y-4" resetOnError>
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                <div className="flex w-full items-center justify-center">
                                    <InputOTP
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        disabled={processing}
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoFocus
                                    >
                                        <InputOTPGroup>
                                            {Array.from(
                                                { length: OTP_MAX_LENGTH },
                                                (_, index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                    />
                                                ),
                                            )}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <InputError message={errors.code} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    processing || code.length < OTP_MAX_LENGTH
                                }
                            >
                                Verifikasi
                            </Button>
                        </>
                    )}
                </Form>

                <div className="text-center text-sm text-muted-foreground">
                    {cooldown > 0 ? (
                        <span>Kirim ulang kode dalam {cooldown} detik</span>
                    ) : (
                        <button
                            type="button"
                            disabled={resending}
                            className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! disabled:pointer-events-none disabled:opacity-50 dark:decoration-neutral-500"
                            onClick={handleResend}
                        >
                            Kirim ulang kode
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    Belum nemu emailnya? Cek folder Spam atau Promosi juga, ya.
                </p>
            </div>
        </>
    );
}

VerifyEmailCode.layout = {
    title: 'Verifikasi email',
    description:
        'Masukkan kode 6 digit yang baru saja kami kirim ke email kamu.',
};
