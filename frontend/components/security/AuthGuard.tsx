'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';

const PUBLIC_ROUTES = ['/login', '/account-setup'];

const isPublicRoute = (pathname: string) =>
    PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { verify } = useAuth();
    const { setUser, setIsLoading } = useUser();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const isPublic = isPublicRoute(pathname);

            if (isPublic) {
                if (pathname === '/login') {
                    const auth = localStorage.getItem('auth');
                    if (auth) {
                        const { isValid, user } = await verify();
                        if (isValid) {
                            setUser(user);
                            router.push('/');
                        }
                    }
                }
                setIsLoading(false);
                setIsChecking(false);
                return;
            }
            
            const { isValid, user } = await verify();
            if (!isValid) {
                setIsLoading(false);
                router.push('/login');
                return;
            }
            setUser(user);
            setIsLoading(false);
            setIsChecking(false);
        };

        checkAuth();
    }, [pathname, router, verify, setUser, setIsLoading]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return children;
}
