import React, { useState } from 'react';
import styles from './ChatView.module.css';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { chatActions } from '../../hooks/useChat';

export function ChatView({ user, onViewProfile }) {
    const [activeChat, setActiveChat] = useState(null);
    const [loadingChat, setLoadingChat] = useState(false);

    const handleSelectChat = async (friend) => {
        if (!user?.uid || !friend?.uid) return;

        setLoadingChat(true);
        try {
            // Criar ou obter o chat existente
            const chatId = await chatActions.createOrGetChat(user.uid, friend.uid);

            // Atualizar o estado com o chat completo (chatId + friend data)
            setActiveChat({
                chatId,
                uid: friend.uid,
                displayName: friend.displayName,
                photoURL: friend.photoURL,
                email: friend.email
            });
        } catch (error) {
            console.error("Erro ao abrir chat:", error);
        } finally {
            setLoadingChat(false);
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.sidebarArea}>
                <ChatSidebar
                    currentUser={user}
                    activeChat={activeChat}
                    onSelectChat={handleSelectChat}
                />
            </div>
            <div className={styles.windowArea}>
                {loadingChat ? (
                    <div className={styles.loadingChat}>Abrindo conversa...</div>
                ) : (
                    <ChatWindow
                        chat={activeChat}
                        currentUser={user}
                        onViewProfile={onViewProfile}
                    />
                )}
            </div>
        </div>
    );
}
