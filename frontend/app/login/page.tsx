'use client';

import { useState } from 'react';
import CredentialsForm from '@/components/login/CredentialsForm';
import PasswordlessForm from '@/components/login/PasswordlessForm';

type LoginMode = 'credentials' | 'passwordless';

export default function LoginPage() {
    const [mode, setMode] = useState<LoginMode>('credentials');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
            <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                Sign In
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
                {mode === 'credentials' 
                ? 'Please enter your credentials to sign in'
                : 'Choose your preferred authentication method'
                }
            </p>
            </div>

            {mode === 'credentials' ? (
                <CredentialsForm
                    onSwitchToPasswordless={() => setMode('passwordless')}
                />
                ) : (
                <PasswordlessForm
                    onBack={() => setMode('credentials')}
                />
            )}
        </div>
        </div>
    );
}
