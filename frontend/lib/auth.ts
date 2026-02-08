/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { userAPI, authAPI } from './api';

export interface AuthData {
  accessToken: string;
  refreshToken: string;
}

export function setAuth(auth: AuthData) {
    localStorage.setItem('auth', JSON.stringify(auth));
}

export function getAuth(): AuthData | null {
    const auth = localStorage.getItem('auth');
    if (!auth) return null;
    try {
        return JSON.parse(auth);
    } catch {
        return null;
    }
}

export const getAccessToken = (): string | null => getAuth()?.accessToken || null;
export const getRefreshToken = (): string | null => getAuth()?.refreshToken || null;

export function logout() {
    localStorage.removeItem('auth');
}

export async function verifyAuth(): Promise<{ isValid: boolean; user?: any }> {
    const auth = getAuth();
    if (!auth) {
        return { isValid: false };
    }

    try {
        const userData = await userAPI.getCurrentUser();
        return { isValid: true, user: userData.data };
    } catch (error: any) {
        if (error.code === 401 || error.code === 403) {
            try {
                const result = await authAPI.refreshToken(auth.refreshToken);
                
                if (result.code === 200) {
                    setAuth(result.data);
                    const userData = await userAPI.getCurrentUser();
                    return { isValid: true, user: userData.data };
                } else {
                    logout();
                    return { isValid: false };
                }
            } catch (refreshError) {
                logout();
                return { isValid: false };
            }
        }
        
        logout();
        return { isValid: false };
    }
}
