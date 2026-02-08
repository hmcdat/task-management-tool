/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';
import type { AccountSetup, ApiResponse, LoginCredentials, LoginResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class APIError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (res) => res.data,
  (error: AxiosError<any>) => {
        if (error.response) {
        const { code, message } = error.response.data;
        throw new APIError(code || error.response.status, message || 'Request failed');
        }
        if (error.request) throw new APIError(500, 'Unable to connect to server');
        throw new APIError(500, error.message || 'An error occurred');
    }
);

function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    const auth = localStorage.getItem('auth');
    if (!auth) return null;
    try {
        return JSON.parse(auth).accessToken || null;
    } catch {
        return null;
    }
}

export const authAPI = {
    loginWithCredentials: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        return client.post('/auth/login/credentials', credentials );
    },

    sendCodeToEmail: async (email: string, captchaResponse: string): Promise<ApiResponse> => {
        return client.post('/auth/login/email/send-code', { email, captchaResponse });
    },

    verifyEmailCode: async (email: string, code: string, captchaResponse: string): Promise<LoginResponse> => {
        return client.post('/auth/login/email/verify', { email, code, captchaResponse });
    },

    sendCodeToPhone: async (phone: string, captchaResponse: string): Promise<ApiResponse> => {
        return client.post('/auth/login/phone/send-code', { phone, captchaResponse });
    },

    verifyPhoneCode: async (phone: string, code: string, captchaResponse: string): Promise<LoginResponse> => {
        return client.post('/auth/login/phone/verify', { phone, code, captchaResponse });
    },

    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        return client.post('/auth/refresh', { refreshToken });
    },

    logout: async (): Promise<ApiResponse> => {
        return client.post('/auth/logout');
    },

    verifySetupToken: async (email: string, token: string): Promise<ApiResponse> => {
        return client.post('/auth/setup/verify', { email, token });
    },

    saveAccountSetup: async (data: AccountSetup): Promise<ApiResponse> => {
        return client.put('/auth/setup/save', data);
    },
};

export const userAPI = {
    getCurrentUser: async () => client.get('/users/me'),
    getProfile: async () => client.get('/users/profile'),
    updateProfile: async (data: Partial<{ name: string; phone: string }>) => client.put('/users/profile', data),
    getAllUsers: async () => client.get('/users'),
    getUserById: async (id: string) => client.get(`/users/${id}`),
    createUser: async (data: { name: string; phone: string; email: string; role: string }) => client.post('/users', data),
    updateUser: async (id: string, data: any) => client.put(`/users/${id}`, data),
    deleteUser: async (id: string) => client.delete(`/users/${id}`),
};

export const taskAPI = {
    getTasks: async () => client.get('/tasks'),
    getTask: async (id: string) => client.get(`/tasks/${id}`),
    createTask: async (data: { title: string; description: string; assignees: string[]; dueDate: string }) => client.post('/tasks', data),
    updateTask: async (id: string, data: { title?: string; description?: string }) => client.put(`/tasks/${id}`, data),
    assignEmployees: async (id: string, assignees: string[]) => client.put(`/tasks/${id}/assign-employees`, { assignees }),
    markTaskStatus: async (id: string, status: 'done' | 'undone') => client.post(`/tasks/${id}/${status}`),
};

export { client, API_URL };
