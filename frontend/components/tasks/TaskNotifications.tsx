'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export default function TaskNotifications() {
    const { taskNotifications, clearTaskNotification } = useSocket();
    const [visible, setVisible] = useState<string[]>([]);

    useEffect(() => {
        if (taskNotifications.length > 0) {
            const latestNotification = taskNotifications[0];
            
            const showTimer = setTimeout(() => {
                setVisible(prev => [...prev, latestNotification.task._id]);
            }, 0);

            const hideTimer = setTimeout(() => {
                setVisible(prev => prev.filter(id => id !== latestNotification.task._id));
                clearTaskNotification(latestNotification.task._id);
            }, 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [taskNotifications, clearTaskNotification]);

    const getNotificationMessage = (updateType: string) => {
        switch (updateType) {
            case 'details-updated':
                return 'Task details have been updated';
            case 'assignees-updated':
                return 'Task assignees have been changed';
            case 'status-updated':
                return 'Task status has been changed';
            default:
                return 'Task has been updated';
        }
    };

    const handleDismiss = (taskId: string) => {
        setVisible(prev => prev.filter(id => id !== taskId));
        clearTaskNotification(taskId);
    };

    if (taskNotifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
            {taskNotifications.map(notification => (
                visible.includes(notification.task._id) && (
                    <div
                        key={notification.task._id}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-start justify-between animate-slide-in"
                    >
                        <div className="flex-1">
                            <p className="font-semibold">{notification.task.title}</p>
                            <p className="text-sm text-blue-100 mt-1">
                                {getNotificationMessage(notification.updateType)}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDismiss(notification.task._id)}
                            className="ml-4 text-white hover:text-blue-200 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                )
            ))}
        </div>
    );
}
