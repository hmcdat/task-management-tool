'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Users, MessageCircle } from 'lucide-react';
import { User, UserRole } from '@/lib/types';

interface SidebarProps {
    user: User | null;
}

interface MenuItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
}

const menuItems: MenuItem[] = [
    {
        name: 'Manage Tasks',
        href: '/tasks',
        icon: CheckSquare,
        roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN],
    },
    {
        name: 'Manage Employees',
        href: '/employees',
        icon: Users,
        roles: [UserRole.MANAGER, UserRole.ADMIN],
    },
    {
        name: 'Message',
        href: '/messages',
        icon: MessageCircle,
        roles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN],
    },
];

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const items = menuItems.filter(item => user?.role && item.roles.includes(user.role));

    return (
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
            <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
            </div>
            <nav className="px-3 space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
