import React, { useState } from 'react';
import styles from './ChatSidebar.module.css';
import { Search, MessageCircle, Users, Settings, PlusCircle } from 'lucide-react';
import { useUserFriends } from '../../hooks/useUserFriends';
import { useIsUserOnline } from '../../hooks/useIsUserOnline';
import { useUserChats, useUnreadChatCount } from '../../hooks/useChat';

// Componente interno para item de contato
function ContactItem({ friend, isActive, onClick, chatData }) {
    const isOnline = useIsUserOnline(friend.uid);
    const unreadCount = chatData?.unreadCounts?.[friend.uid] || 0;
    const lastMessage = chatData?.lastMessage || '';
    const lastMessageTime = chatData?.updatedAt;

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;

        // Menos de 1 minuto
        if (diff < 60000) return 'agora';
        // Menos de 1 hora
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        // Menos de 24 horas
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        // Menos de 7 dias
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
        // Mais de 7 dias
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div
            className={`${styles.contactItem} ${isActive ? styles.active : ''}`}
            onClick={() => onClick(friend)}
        >
            <div className={styles.avatarWrapper}>
                {friend.photoURL ? (
                    <img src={friend.photoURL} alt={friend.displayName} className={styles.avatar} />
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        {friend.displayName?.charAt(0).toUpperCase()}
                    </div>
                )}
                {isOnline && <div className={styles.onlineIndicator} />}
            </div>

            <div className={styles.contactInfo}>
                <div className={styles.contactNameRow}>
                    <span className={styles.contactName}>{friend.displayName}</span>
                    {lastMessageTime && (
                        <span className={styles.timestamp}>{formatTime(lastMessageTime)}</span>
                    )}
                </div>
                <div className={styles.lastMessageRow}>
                    <span className={styles.lastMessage}>
                        {lastMessage || (isOnline ? '🟢 Online' : '⚫ Offline')}
                    </span>
                    {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ChatSidebar({ currentUser, activeChat, onSelectChat }) {
    const { friends, loading: friendsLoading } = useUserFriends(currentUser?.uid);
    const { chats } = useUserChats(currentUser?.uid);
    const totalUnread = useUnreadChatCount(currentUser?.uid);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'friends'

    const filteredFriends = friends.filter(friend =>
        friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Criar mapa de chats por friendId para fácil acesso
    const chatsByFriend = {};
    chats.forEach(chat => {
        const friendId = chat.participants.find(id => id !== currentUser?.uid);
        if (friendId) {
            const unreadKey = currentUser?.uid;
            chatsByFriend[friendId] = {
                ...chat,
                unreadCounts: { [friendId]: chat.unreadCounts?.[unreadKey] || 0 }
            };
        }
    });

    return (
        <div className={styles.sidebarContainer}>
            {/* Header com gradiente */}
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <div className={styles.titleWrapper}>
                        <MessageCircle size={24} className={styles.titleIcon} />
                        <h2 className={styles.title}>Mensagens</h2>
                    </div>
                    {totalUnread > 0 && (
                        <div className={styles.totalUnreadBadge}>{totalUnread > 99 ? '99+' : totalUnread}</div>
                    )}
                </div>

                {/* Search bar melhorado */}
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pesquisar conversas..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'messages' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        <MessageCircle size={16} />
                        Recentes
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'friends' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        <Users size={16} />
                        Amigos
                    </button>
                </div>
            </div>

            {/* Contact List */}
            <div className={styles.contactList}>
                {friendsLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Carregando...</p>
                    </div>
                ) : filteredFriends.length === 0 ? (
                    <div className={styles.empty}>
                        <MessageCircle size={48} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>
                            {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum amigo ainda'}
                        </p>
                        <p className={styles.emptySubtitle}>
                            {!searchTerm && 'Adicione amigos para começar a conversar'}
                        </p>
                    </div>
                ) : (
                    filteredFriends.map(friend => (
                        <ContactItem
                            key={friend.uid}
                            friend={friend}
                            chatData={chatsByFriend[friend.uid]}
                            isActive={activeChat?.uid === friend.uid}
                            onClick={onSelectChat}
                        />
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <button className={styles.actionBtn} title="Nova conversa">
                    <PlusCircle size={20} />
                </button>
                <button className={styles.actionBtn} title="Configurações">
                    <Settings size={20} />
                </button>
            </div>
        </div>
    );
}
