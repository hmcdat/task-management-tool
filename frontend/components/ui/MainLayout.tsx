'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import Sidebar from './Sidebar';
import TaskNotifications from '@/components/tasks/TaskNotifications';
import { Bell, User as UserIcon } from 'lucide-react';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const path = usePathname();
    const { logout } = useAuth();
    const { user, isLoading } = useUser();
    const { chats } = useSocket();

    const unreadCount = chats.reduce((count, chat) => {
        return count + (chat.messages?.length > 0 ? 0 : 0);
    }, 0);

    if (path === '/login' || path.startsWith('/account-setup')) return children;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Task Notifications */}
            <TaskNotifications />
            
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Task Management</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Notification Icon */}
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* User Avatar */}
                            {user && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar + Main Content */}
            <div className="flex">
                <Sidebar user={user} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
