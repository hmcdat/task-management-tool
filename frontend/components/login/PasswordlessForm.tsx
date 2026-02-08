'use client';

import { useRef, useState } from 'react';
import { z } from 'zod';
import { Mail, Phone } from 'lucide-react';
import Turnstile, { TurnstileRef } from '@/components/security/Turnstile';
import { APIError, authAPI } from '../../lib/api';
import { LoginResponse } from '../../lib/types';
import { useAuth } from '@/hooks/useAuth';

type AuthMethod = 'email' | 'phone';

const emailSchema = z.email('Invalid email address');
const phoneSchema = z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Invalid phone number format');
const codeSchema = z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers');

interface PasswordlessFormProps {
    onBack: () => void;
}

export default function PasswordlessForm({ onBack }: PasswordlessFormProps) {
    const turnstileRef = useRef<TurnstileRef>(null);
    const { login } = useAuth();
    const [method, setMethod] = useState<AuthMethod | null>(null);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'select' | 'input' | 'verify'>('select');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [captchaResponse, setCaptchaResponse] = useState('');

    const handleMethodSelect = (selectedMethod: AuthMethod) => {
        setMethod(selectedMethod);
        setStep('input');
        setError('');
    };

    const handleSendCode = async () => {
        if (!captchaResponse) {
            setError('Please complete the CAPTCHA verification');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            if (method === 'email') {
                emailSchema.parse(email);
                await authAPI.sendCodeToEmail(email, captchaResponse);
            } else if (method === 'phone') {
                phoneSchema.parse(phone);
                await authAPI.sendCodeToPhone(phone, captchaResponse);
            } else {
                setError('Please select a valid authentication method');
                return;
            }

            setStep('verify');
            setCode('');
            setCaptchaResponse('');
        } catch (err) {
            if (err instanceof APIError) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
            setCaptchaResponse('');
            turnstileRef.current?.reset();
        }
    };

    const handleVerifyCode = async () => {
        if (!captchaResponse) {
            setError('Please complete the CAPTCHA verification');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            codeSchema.parse(code);

            let result: LoginResponse;
            if (method === 'email') {
                result = await authAPI.verifyEmailCode(email, code, captchaResponse);
            } else {
                result = await authAPI.verifyPhoneCode(phone, code, captchaResponse);
            }

            if (result.code === 200) {
                await login(result.data);
            } else {
                setError(result.message || 'Verification failed');
            }
        } catch (err) {
            if (err instanceof APIError) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
            setCaptchaResponse('');
            turnstileRef.current?.reset();
        }
    };

    const handleBackStep = () => {
        if (step === 'verify') {
            setStep('input');
            setCode('');
        } else if (step === 'input') {
            setStep('select');
            setMethod(null);
            setEmail('');
            setPhone('');
        } else {
            onBack();
        }
        setError('');
    };

    return (
        <div className="mt-8 space-y-6">
            {step === 'select' && (
                <div className="space-y-4">
                    <button
                        onClick={() => handleMethodSelect('email')}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Mail className="w-5 h-5 mr-3" />
                        Continue with Email
                    </button>

                    <button
                        onClick={() => handleMethodSelect('phone')}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Phone className="w-5 h-5 mr-3" />
                        Continue with Phone
                    </button>

                    <div className="text-center pt-4">
                        <button
                            onClick={onBack}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            ← Back to password login
                        </button>
                    </div>
                </div>
            )}

            {step === 'input' && (
                <div className="space-y-4">
                    {method === 'email' ? (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                onBlur={(e) => {
                                    if (e.target.value) setEmail(e.target.value);
                                }}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="foo@example.com"
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                required
                                placeholder="XXXXXXXXXX"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    setError('');
                                }}
                                onBlur={(e) => {
                                    if (e.target.value) setPhone(e.target.value);
                                }}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    )}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSendCode}
                        disabled={isLoading || (method === 'email' ? !email : !phone) || !captchaResponse}
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>

                    <div className="flex justify-center">
                        <Turnstile
                            ref={turnstileRef}
                            onVerify={(token) => setCaptchaResponse(token)}
                            onError={() => setCaptchaResponse('')}
                        />
                    </div>

                    <button
                        onClick={handleBackStep}
                        className="w-full text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back
                    </button>
                </div>
            )}

            {step === 'verify' && (
                <div className="space-y-4">
                    <div className="text-center text-sm text-gray-600 mb-4">
                        We sent a verification code to <strong>{method === 'email' ? email : phone}</strong>
                    </div>

                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-2xl tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleVerifyCode}
                        disabled={isLoading || code.length !== 6 || !captchaResponse}
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                    </button>

                    <div className="flex justify-center">
                        <Turnstile
                            ref={turnstileRef}
                            onVerify={(token) => setCaptchaResponse(token)}
                            onError={() => setCaptchaResponse('')}
                        />
                    </div>

                    <button
                        onClick={handleSendCode}
                        disabled={isLoading || !captchaResponse}
                        className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Resend Code
                    </button>

                    <button
                        onClick={handleBackStep}
                        className="w-full text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back
                    </button>
                </div>
            )}
        </div>
    );
}
