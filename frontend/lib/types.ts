export interface LoginCredentials {
    username: string;
    password: string;
    captchaResponse?: string;
}

export interface AccountSetup {
    username: string;
    password: string;
    retypePassword: string;
    token: string;
    email: string;
}

export interface ApiResponse {
    code: number;
    message: string;
}

export interface LoginResponse extends ApiResponse {
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

export enum UserRole {
    EMPLOYEE = 'employee',
    ADMIN = 'admin',
    MANAGER = 'manager',
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    username?: string;
    department?: string;
    role: UserRole;
    enabled?: boolean;
    deleted?: boolean;
}

export interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    done: boolean;
    createdBy: string;
    assignees: string[];
    createdAt: string;
    updatedAt: string;
}
