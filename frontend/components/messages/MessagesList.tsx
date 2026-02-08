'use client';

import { useSocket } from '@/contexts/SocketContext';
import { useUser } from '@/contexts/UserContext';
import { User, MessageCircle, Plus } from 'lucide-react';
import { useMemo } from 'react';

interface MessagesListProps {
    onCreateChat: () => void;
}

export default function MessagesList({ onCreateChat }: MessagesListProps) {
    const { chats, currentChat, isConnected, setCurrentChat } = useSocket();
    const { user: currentUser } = useUser();

    const sortedChats = useMemo(() => {
        return [...chats].sort((a, b) => {
            const aTime = a.updatedAt || a.createdAt || '';
            const bTime = b.updatedAt || b.createdAt || '';
            return bTime.localeCompare(aTime);
        });
    }, [chats]);

    const getOtherParticipant = (chat: typeof chats[0]) => {
        if (!currentUser) return null;
        return chat.participants.find(p => p._id !== currentUser._id);
    };

    const getLastMessage = (chat: typeof chats[0]) => {
        if (chat.messages && chat.messages.length > 0) {
            return chat.messages[chat.messages.length - 1].content;
        }
        return 'No messages yet';
    };

    return (
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                    <button
                        onClick={onCreateChat}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Start new chat"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {isConnected ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {sortedChats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No conversations yet</p>
                        <button
                            onClick={onCreateChat}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Start a conversation
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {sortedChats.map(chat => {
                            const otherParticipant = getOtherParticipant(chat);
                            if (!otherParticipant) return null;

                            return (
                                <button
                                    key={chat._id}
                                    onClick={() => setCurrentChat(chat)}
                                    className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${
                                        currentChat?._id === chat._id ? 'bg-gray-100' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Avatar */}
                                        <div className="shrink-0 relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-600" />
                                            </div>
                                        </div>

                                        {/* Chat Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {otherParticipant.name}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                {getLastMessage(chat)}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
