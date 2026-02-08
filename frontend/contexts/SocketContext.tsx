'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface Chat {
    _id: string;
    participants: Array<{
        _id: string;
        name: string;
        email: string;
    }>;
    messages: Array<{
        _id?: string;
        sender: {
            _id: string;
            name: string;
            email: string;
        };
        content: string;
        timestamp: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

interface TaskNotification {
    task: {
        _id: string;
        title: string;
        description: string;
        assignees: string[];
        done: boolean;
        dueDate: string;
        createdBy: string;
    };
    updateType: 'details-updated' | 'assignees-updated' | 'status-updated';
    updatedBy: string;
    timestamp: Date;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    chats: Chat[];
    currentChat: Chat | null;
    setCurrentChat: (chat: Chat | null) => void;
    sendMessage: (chatId: string, content: string) => void;
    createChat: (participantIds: string[]) => void;
    createChatWithMessage: (participantIds: string[], initialMessage: string) => void;
    onlineUserIds: string[];
    availableUsers: Array<{
        _id: string;
        name: string;
        email: string;
        role: string;
        isOnline: boolean;
    }>;
    startChatWithUser: (userId: string) => void;
    taskNotifications: TaskNotification[];
    clearTaskNotification: (taskId: string) => void;
    clearAllTaskNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [availableUsers, setAvailableUsers] = useState<Array<{
        _id: string;
        name: string;
        email: string;
        role: string;
        isOnline: boolean;
    }>>([]);
    const [taskNotifications, setTaskNotifications] = useState<TaskNotification[]>([]);

    useEffect(() => {
        if (currentChat) {
            const updatedChat = chats.find(chat => chat._id === currentChat._id);
            if (updatedChat) {
                setCurrentChat(updatedChat);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chats]);

    const fetchChats = async (token: string) => {
        try {
            const response = await fetch(`${SOCKET_URL}/chats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            
            if (result.success) {
                setChats(result.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const fetchAvailableUsers = async (token: string) => {
        try {
            const response = await fetch(`${SOCKET_URL}/chats/available-users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            
            if (result.success) {
                setAvailableUsers(result.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const getToken = () => {
            if (typeof window === 'undefined') return null;
            const auth = localStorage.getItem('auth');
            if (!auth) return null;
            try {
                return JSON.parse(auth).accessToken || null;
            } catch {
                return null;
            }
        };

        const token = getToken();
        
        if (!token) {
            return;
        }

        const newSocket = io(SOCKET_URL, {
            query: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            autoConnect: true
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.log(err);
            setIsConnected(false);
        });

        newSocket.on('user-chats-synced', () => {
            fetchChats(token);
            fetchAvailableUsers(token);
        });

        newSocket.on('online-users-updated', (data) => {
            setOnlineUserIds(data.onlineUserIds);
            fetchAvailableUsers(token);
        });

        newSocket.on('chat-created', (data) => {
            setChats(prev => {
                const exists = prev.some(c => c._id === data.chat._id);
                if (exists) return prev;
                return [data.chat, ...prev];
            });
            setCurrentChat(data.chat);
        });

        newSocket.on('new-message', (data) => {
            
            setChats(prev => {
                const chatExists = prev.some(chat => chat._id === data.chatId);
                
                if (!chatExists) {
                    return prev;
                }
                
                return prev.map(chat => {
                    if (chat._id === data.chatId) {
                        const messageExists = chat.messages.some(
                            msg => msg._id && msg._id === data.message._id
                        );
                        
                        if (messageExists) {
                            return chat;
                        }
                        
                        return {
                            ...chat,
                            messages: [...chat.messages, data.message],
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return chat;
                });
            });
        });

        newSocket.on('error', (data) => {
            console.log(data);
        });

        newSocket.on('task-updated', (data: TaskNotification) => {
            setTaskNotifications(prev => [data, ...prev]);
        });

        setSocket(newSocket);

        fetchChats(token);
        fetchAvailableUsers(token);

        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = (chatId: string, content: string) => {
        if (socket && isConnected) {
            socket.emit('send-message', { chatId, content });
        }
    };

    const createChat = (participantIds: string[]) => {
        if (socket && isConnected) {
            socket.emit('create-chat', { participantIds });
        }
    };

    const createChatWithMessage = (participantIds: string[], initialMessage: string) => {
        if (socket && isConnected) {
            socket.emit('create-chat', { participantIds });
            
            const handleChatCreated = (data: { chat: Chat }) => {
                if (initialMessage.trim()) {
                    socket.emit('send-message', { 
                        chatId: data.chat._id, 
                        content: initialMessage.trim() 
                    });
                }
                socket.off('chat-created', handleChatCreated);
            };
            
            socket.once('chat-created', handleChatCreated);
        }
    };

    const startChatWithUser = async (userId: string) => {
        try {
            const auth = localStorage.getItem('auth');
            if (!auth) return;
            const token = JSON.parse(auth).accessToken;

            const response = await fetch(`${SOCKET_URL}/chats/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();

            if (result.success) {
                setCurrentChat(result.data);
                setChats(prev => {
                    const exists = prev.some(c => c._id === result.data._id);
                    if (exists) return prev;
                    return [result.data, ...prev];
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    const clearTaskNotification = (taskId: string) => {
        setTaskNotifications(prev => prev.filter(notif => notif.task._id !== taskId));
    };

    const clearAllTaskNotifications = () => {
        setTaskNotifications([]);
    };

    const value = {
        socket,
        isConnected,
        chats,
        currentChat,
        setCurrentChat,
        sendMessage,
        createChat,
        createChatWithMessage,
        onlineUserIds,
        availableUsers,
        startChatWithUser,
        taskNotifications,
        clearTaskNotification,
        clearAllTaskNotifications
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
}
