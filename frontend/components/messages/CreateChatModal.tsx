'use client';

import { useState, useMemo } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { User, Search } from 'lucide-react';
import Modal from '@/components/common/Modal';

interface CreateChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateChatModal({ isOpen, onClose }: CreateChatModalProps) {
    const { availableUsers, createChat, createChatWithMessage, onlineUserIds } = useSocket();
    const [chatName, setChatName] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [initialMessage, setInitialMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onlineUsers = useMemo(() => {
        return availableUsers.filter(user => 
            onlineUserIds.includes(user._id)
        );
    }, [availableUsers, onlineUserIds]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return onlineUsers;
        return onlineUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [onlineUsers, searchTerm]);

    const toggleParticipant = (userId: string) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedParticipants.length === 0) {
            alert('Please select at least one participant');
            return;
        }

        setIsSubmitting(true);
        try {
            if (initialMessage.trim()) {
                createChatWithMessage(selectedParticipants, initialMessage.trim());
            } else {
                createChat(selectedParticipants);
            }

            setChatName('');
            setSelectedParticipants([]);
            setInitialMessage('');
            setSearchTerm('');
            onClose();
        } catch (err) {
            console.log(err);
            alert('Failed to create chat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setChatName('');
            setSelectedParticipants([]);
            setInitialMessage('');
            setSearchTerm('');
            onClose();
        }
    };

    return (
        <Modal show={isOpen} onClose={handleClose} title="Start New Conversation" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Chat Name */}
                <div>
                    <label htmlFor="chatName" className="block text-sm font-medium text-gray-700 mb-1">
                        Chat Name (Optional)
                    </label>
                    <input
                        type="text"
                        id="chatName"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        placeholder="Enter chat name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave empty to use participant names</p>
                </div>

                {/* Participants */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Participants (Online Users)
                    </label>
                    
                    {/* Search */}
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    {/* User List */}
                    <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {searchTerm ? 'No users found' : 'No online users available'}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredUsers.map(user => (
                                    <label
                                        key={user._id}
                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedParticipants.includes(user._id)}
                                            onChange={() => toggleParticipant(user._id)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <div className="ml-3 flex items-center flex-1">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                                                <User className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </p>
                                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                        user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {selectedParticipants.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                            {selectedParticipants.length} participant{selectedParticipants.length > 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                {/* Initial Message */}
                <div>
                    <label htmlFor="initialMessage" className="block text-sm font-medium text-gray-700 mb-1">
                        Initial Message (Optional)
                    </label>
                    <textarea
                        id="initialMessage"
                        value={initialMessage}
                        onChange={(e) => setInitialMessage(e.target.value)}
                        placeholder="Type your first message..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || selectedParticipants.length === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Start Chat'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
