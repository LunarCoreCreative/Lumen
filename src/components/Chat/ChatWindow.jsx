import React, { useEffect, useRef, useState } from 'react';
import styles from './ChatWindow.module.css';
import { MoreVertical, Reply, Copy, Trash2 } from 'lucide-react';
import { useChatMessages, chatActions } from '../../hooks/useChat';
import { useIsUserOnline } from '../../hooks/useIsUserOnline';
import { format } from 'date-fns';
import { ChatMessageInput } from './ChatMessageInput';
import { RichTextRenderer } from '../RichTextRenderer';

export function ChatWindow({ chat, currentUser, onViewProfile }) {
    const messagesEndRef = useRef(null);
    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [replyingTo, setReplyingTo] = useState(null);

    const chatId = chat?.chatId;
    const { messages, loading } = useChatMessages(chatId);
    const isOnline = useIsUserOnline(chat?.uid);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (chatId && currentUser?.uid) {
            chatActions.markChatAsRead(chatId, currentUser.uid);
        }
    }, [chatId, currentUser?.uid, messages]);

    useEffect(() => {
        const handleClickOutside = () => {
            if (menuOpenFor) setMenuOpenFor(null);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [menuOpenFor]);

    const handleSendMessage = async (messageText) => {
        if (!messageText.trim() || !chatId || !currentUser) return;
        try {
            await chatActions.sendMessage(chatId, messageText, currentUser.uid, chat.uid, replyingTo);
            setReplyingTo(null);
        } catch (error) {
            console.error("Erro ao enviar:", error);
        }
    };

    const handleReply = (msg) => {
        setReplyingTo(msg);
        setMenuOpenFor(null);
    };

    const handleCopy = (msg) => {
        navigator.clipboard.writeText(msg.content);
        setMenuOpenFor(null);
    };

    const handleDelete = async (msgId) => {
        if (!chatId || !currentUser?.uid) return;
        try {
            await chatActions.deleteMessage(chatId, msgId, currentUser.uid);
            setMenuOpenFor(null);
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    };

    const handleContextMenu = (e, msg) => {
        e.preventDefault();

        // Não abrir menu para mensagens deletadas
        if (msg.isDeleted) {
            return;
        }

        const menuWidth = 150;
        const menuHeight = 150;
        const padding = 10;

        let x = e.clientX;
        let y = e.clientY;

        // Ajustar X se sair pela direita
        if (x + menuWidth + padding > window.innerWidth) {
            x = window.innerWidth - menuWidth - padding;
        }

        // Ajustar Y se sair pela baixo
        if (y + menuHeight + padding > window.innerHeight) {
            y = window.innerHeight - menuHeight - padding;
        }

        // Garantir que não saia pela esquerda ou topo
        x = Math.max(padding, x);
        y = Math.max(padding, y);

        setMenuPosition({ x, y });
        setMenuOpenFor(msg.id);
    };

    if (!chat) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyContent}>
                    <h3>Suas Mensagens</h3>
                    <p>Selecione um contato para começar a conversar</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.windowContainer}>
            <div className={styles.header}>
                <div className={styles.userInfo} onClick={() => onViewProfile(chat)}>
                    <div className={styles.avatarWrapper}>
                        {chat.photoURL ? (
                            <img src={chat.photoURL} alt={chat.displayName} className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {chat.displayName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {isOnline && <div className={styles.onlineIndicator} />}
                    </div>
                    <div className={styles.userDetails}>
                        <h3 className={styles.userName}>{chat.displayName}</h3>
                        <span className={styles.userStatus}>{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.iconBtn}><MoreVertical size={20} /></button>
                </div>
            </div>

            <div className={styles.messagesArea}>
                {loading ? (
                    <div className={styles.loading}>Carregando mensagens...</div>
                ) : messages.length === 0 ? (
                    <div className={styles.emptyMessages}>
                        <p>Nenhuma mensagem ainda. Diga oi! 👋</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.senderId === currentUser?.uid;
                        return (
                            <div key={msg.id} className={`${styles.messageRow} ${isMe ? styles.me : styles.them}`}>
                                <div
                                    className={`${styles.messageBubble} ${msg.isDeleted ? styles.deleted : ''}`}
                                    onContextMenu={(e) => handleContextMenu(e, msg)}
                                >
                                    {msg.replyTo && !msg.isDeleted && (
                                        <div className={styles.replyPreview}>
                                            <Reply size={14} />
                                            <span>{msg.replyTo.content?.substring(0, 50)}{msg.replyTo.content?.length > 50 ? '...' : ''}</span>
                                        </div>
                                    )}

                                    {msg.isDeleted ? (
                                        <div className={styles.deletedMessage}>
                                            <span className={styles.deletedIcon}>🚫</span>
                                            <span className={styles.deletedText}>Mensagem apagada</span>
                                        </div>
                                    ) : (
                                        <RichTextRenderer text={msg.content} />
                                    )}

                                    <span className={styles.messageTime}>
                                        {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm') : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {menuOpenFor && (
                <div
                    className={styles.contextMenu}
                    style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => handleReply(messages.find(m => m.id === menuOpenFor))}>
                        <Reply size={16} />
                        Responder
                    </button>
                    <button onClick={() => handleCopy(messages.find(m => m.id === menuOpenFor))}>
                        <Copy size={16} />
                        Copiar
                    </button>
                    {messages.find(m => m.id === menuOpenFor)?.senderId === currentUser?.uid && (
                        <button onClick={() => handleDelete(menuOpenFor)} className={styles.deleteBtn}>
                            <Trash2 size={16} />
                            Excluir
                        </button>
                    )}
                </div>
            )}

            {replyingTo && (
                <div className={styles.replyBar}>
                    <div className={styles.replyContent}>
                        <Reply size={16} />
                        <span>Respondendo: {replyingTo.content?.substring(0, 50)}{replyingTo.content?.length > 50 ? '...' : ''}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className={styles.cancelReply}>×</button>
                </div>
            )}

            <ChatMessageInput onSend={handleSendMessage} disabled={!chat} />
        </div>
    );
}
