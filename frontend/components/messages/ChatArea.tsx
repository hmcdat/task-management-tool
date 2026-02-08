'use client';

import { useSocket } from '@/contexts/SocketContext';
import { useState, useEffect, useRef } from 'react';
import { User, Send } from 'lucide-react';

export default function ChatArea() {
    const { currentChat, sendMessage } = useSocket();
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentChat?.messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !currentChat) return;

        sendMessage(currentChat._id, messageInput.trim());
        setMessageInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!currentChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                    <p className="text-lg">Select a conversation to start messaging</p>
                </div>
            </div>
        );
    }

    const getOtherParticipants = () => {
        return currentChat.participants.map(p => p.name).join(', ');
    };

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {getOtherParticipants()}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {currentChat.participants.length} participants
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {currentChat.messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {currentChat.messages.map((message, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>
                                <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {message.sender.name}
                                        </p>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                    <div className="flex-1">
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Reply message"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={1}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
