import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { AuthData, logout, setAuth, verifyAuth } from '@/lib/auth';
import { authAPI } from '@/lib/api';

export function useAuth() {
    const router = useRouter();

    const loginFunc = useCallback(async (authData: AuthData) => {
        setAuth(authData);
        router.push('/');
        router.refresh();
    }, [router]);

    const logoutFunc = useCallback(() => {
        logout();
        router.push('/login');
    }, [router]);

    const verifyFunc = useCallback(async () => {
        return await verifyAuth();
    }, []);

    const refreshTokenFunc = useCallback(async (refreshToken: string) => {
        try {
            const result = await authAPI.refreshToken(refreshToken);
            if (result.code === 200) {
                setAuth(result.data);
                return true;
            }
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    }, []);

    return {
        login: loginFunc,
        logout: logoutFunc,
        verify: verifyFunc,
        refreshToken: refreshTokenFunc,
    };
}
