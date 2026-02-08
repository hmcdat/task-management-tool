'use client';

import { useState } from 'react';
import MessagesList from '@/components/messages/MessagesList';
import ChatArea from '@/components/messages/ChatArea';
import CreateChatModal from '@/components/messages/CreateChatModal';

export default function MessagesPage() {
    const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);

    return (
        <>
            <div className="flex h-[calc(100vh-64px)]">
                <MessagesList onCreateChat={() => setIsCreateChatModalOpen(true)} />
                <ChatArea />
            </div>
            
            <CreateChatModal
                isOpen={isCreateChatModalOpen}
                onClose={() => setIsCreateChatModalOpen(false)}
            />
        </>
    );
}
