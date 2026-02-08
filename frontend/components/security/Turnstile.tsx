'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile as TurnstileWidget, TurnstileInstance } from '@marsidev/react-turnstile';

interface TurnstileProps {
    onVerify: (token: string) => void;
    onError?: () => void;
}

export interface TurnstileRef {
    reset: () => void;
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(({ onVerify, onError }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    useImperativeHandle(ref, () => ({
        reset: () => {
            turnstileRef.current?.reset();
        },
    }));

    if (!siteKey) {
        console.log("Turnstile site key is not defined");
        return null;
    }

    return (
        <TurnstileWidget
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        options={{
            theme: 'light',
            size: 'normal',
        }}
        />
    );
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;
