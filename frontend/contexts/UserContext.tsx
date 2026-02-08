'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/lib/types';

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setIsLoading: (loading: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <UserContext.Provider value={{ user, isLoading, setUser, setIsLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error();
    }
    return context;
}
