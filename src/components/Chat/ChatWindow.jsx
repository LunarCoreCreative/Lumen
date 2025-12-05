import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ChatWindow.module.css';
import { MoreVertical, Reply, Copy, Trash2, Check, CheckCheck, MessageCircle, Image as ImageIcon, X, Search, BellOff, Bell, UserX, UserCheck, User, Download, Trash } from 'lucide-react';
import { useChatMessages, useTypingIndicator, useChatSettings, chatActions } from '../../hooks/useChat';
import { useIsUserOnline } from '../../hooks/useIsUserOnline';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatMessageInput } from './ChatMessageInput';
import { RichTextRenderer } from '../RichTextRenderer';
import { ConfirmationModal } from '../ConfirmationModal';
import { Toast } from '../Toast';

// Emojis para reações rápidas
const QUICK_REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

export function ChatWindow({ chat, currentUser, onViewProfile }) {
    const messagesEndRef = useRef(null);
    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [replyingTo, setReplyingTo] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [sendingImage, setSendingImage] = useState(false);

    // Novos estados para menu de opções
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const optionsMenuRef = useRef(null);

    // Estados para modal e toast
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDangerous: false });
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    // Helper para mostrar toast
    const showToast = useCallback((message, type = 'info') => {
        setToast({ show: true, message, type });
    }, []);

    const chatId = chat?.chatId;
    const { messages, loading } = useChatMessages(chatId);
    const isOnline = useIsUserOnline(chat?.uid);
    const isTyping = useTypingIndicator(chatId, chat?.uid);
    const chatSettings = useChatSettings(chatId, currentUser?.uid);

    // Extrair configurações do hook
    const { isMuted, isBlocked, isBlockedBy, clearedAt } = chatSettings;

    // Filtrar mensagens limpas (após clearedAt)
    const visibleMessages = clearedAt
        ? messages.filter(msg => {
            if (!msg.timestamp?.toMillis) return true;
            const clearedTime = clearedAt?.toMillis?.() || 0;
            return msg.timestamp.toMillis() > clearedTime;
        })
        : messages;

    // Scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Marcar como lido e marcar mensagens individuais
    useEffect(() => {
        if (chatId && currentUser?.uid) {
            chatActions.markChatAsRead(chatId, currentUser.uid);

            // Marcar mensagens não lidas como lidas
            const unreadMessages = messages.filter(
                msg => !msg.read && msg.senderId !== currentUser.uid
            );
            if (unreadMessages.length > 0) {
                chatActions.markMessagesAsRead(
                    chatId,
                    unreadMessages.map(m => m.id),
                    currentUser.uid
                );
            }
        }
    }, [chatId, currentUser?.uid, messages]);

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuOpenFor) setMenuOpenFor(null);
            if (showOptionsMenu && optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
                setShowOptionsMenu(false);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [menuOpenFor, showOptionsMenu]);

    // Reset states quando mudar de chat
    useEffect(() => {
        setShowSearchBar(false);
        setSearchQuery('');
        setShowOptionsMenu(false);
    }, [chatId]);

    // Handler para indicador de digitando
    const handleTyping = useCallback((isTyping) => {
        if (chatId && currentUser?.uid) {
            chatActions.setTypingIndicator(chatId, currentUser.uid, isTyping);
        }
    }, [chatId, currentUser?.uid]);

    // Handlers do menu de opções
    const handleToggleMute = async () => {
        if (!chatId || !currentUser?.uid) return;
        try {
            await chatActions.toggleMuteChat(chatId, currentUser.uid, !isMuted);
            showToast(isMuted ? 'Notificações ativadas' : 'Conversa silenciada', 'success');
        } catch (error) {
            console.error("Erro ao mutar:", error);
            showToast('Erro ao alterar notificações', 'error');
        }
        setShowOptionsMenu(false);
    };

    const handleSearchInChat = () => {
        setShowSearchBar(true);
        setShowOptionsMenu(false);
    };

    const handleClearChat = () => {
        if (!chatId || !currentUser?.uid) return;
        setShowOptionsMenu(false);

        setConfirmModal({
            isOpen: true,
            title: 'Limpar conversa',
            message: 'Tem certeza que deseja limpar toda a conversa? As mensagens não serão mais exibidas para você.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await chatActions.clearChat(chatId, currentUser.uid);
                    showToast('Conversa limpa com sucesso!', 'success');
                } catch (error) {
                    console.error("Erro ao limpar conversa:", error);
                    showToast('Erro ao limpar conversa', 'error');
                }
            }
        });
    };

    const handleBlockUser = () => {
        if (!chatId || !currentUser?.uid || !chat?.uid) return;
        setShowOptionsMenu(false);

        setConfirmModal({
            isOpen: true,
            title: 'Bloquear usuário',
            message: `Deseja bloquear ${chat?.displayName}? Você não poderá mais enviar ou receber mensagens desta pessoa.`,
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await chatActions.blockUser(chatId, currentUser.uid, chat.uid);
                    showToast(`${chat.displayName} foi bloqueado`, 'success');
                } catch (error) {
                    console.error("Erro ao bloquear:", error);
                    showToast('Erro ao bloquear usuário', 'error');
                }
            }
        });
    };

    const handleUnblockUser = () => {
        if (!chatId || !currentUser?.uid || !chat?.uid) return;

        setConfirmModal({
            isOpen: true,
            title: 'Desbloquear usuário',
            message: `Deseja desbloquear ${chat?.displayName}? Vocês poderão trocar mensagens novamente.`,
            isDangerous: false,
            onConfirm: async () => {
                try {
                    await chatActions.unblockUser(chatId, currentUser.uid, chat.uid);
                    showToast(`${chat.displayName} foi desbloqueado`, 'success');
                } catch (error) {
                    console.error("Erro ao desbloquear:", error);
                    showToast('Erro ao desbloquear usuário', 'error');
                }
            }
        });
    };

    const handleExportChat = () => {
        // Exportar conversa como texto
        const exportData = messages.map(msg => {
            const time = msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'dd/MM/yyyy HH:mm') : '';
            const sender = msg.senderId === currentUser?.uid ? 'Você' : chat?.displayName;
            return `[${time}] ${sender}: ${msg.isDeleted ? '(mensagem apagada)' : msg.content}`;
        }).join('\n');

        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversa_${chat?.displayName || 'chat'}_${format(new Date(), 'yyyy-MM-dd')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setShowOptionsMenu(false);
    };

    // Filtrar mensagens pela busca (usando visibleMessages que já filtra pelo clearedAt)
    const filteredMessages = searchQuery.trim()
        ? visibleMessages.filter(msg =>
            msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : visibleMessages;

    const handleSendMessage = async (messageText) => {
        if ((!messageText.trim() && !imagePreview) || !chatId || !currentUser) return;

        try {
            if (imagePreview) {
                setSendingImage(true);
                await chatActions.sendImageMessage(
                    chatId,
                    imagePreview.file,
                    messageText,
                    currentUser.uid,
                    chat.uid
                );
                setImagePreview(null);
                setSendingImage(false);
            } else {
                await chatActions.sendMessage(chatId, messageText, currentUser.uid, chat.uid, replyingTo);
            }
            setReplyingTo(null);
        } catch (error) {
            console.error("Erro ao enviar:", error);
            setSendingImage(false);
        }
    };

    const handleImageSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview({
                    file,
                    preview: e.target.result
                });
            };
            reader.readAsDataURL(file);
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

    const handleReaction = async (msgId, emoji) => {
        if (!chatId || !currentUser?.uid) return;
        try {
            await chatActions.toggleReaction(chatId, msgId, emoji, currentUser.uid);
        } catch (error) {
            console.error("Erro ao reagir:", error);
        }
    };

    const handleContextMenu = (e, msg) => {
        e.preventDefault();
        if (msg.isDeleted) return;

        const menuWidth = 160;
        const menuHeight = 180;
        const padding = 10;

        let x = e.clientX;
        let y = e.clientY;

        if (x + menuWidth + padding > window.innerWidth) {
            x = window.innerWidth - menuWidth - padding;
        }
        if (y + menuHeight + padding > window.innerHeight) {
            y = window.innerHeight - menuHeight - padding;
        }

        x = Math.max(padding, x);
        y = Math.max(padding, y);

        setMenuPosition({ x, y });
        setMenuOpenFor(msg.id);
    };

    const formatDateSeparator = (date) => {
        if (isToday(date)) return 'Hoje';
        if (isYesterday(date)) return 'Ontem';
        return format(date, "d 'de' MMMM", { locale: ptBR });
    };

    const getMessageDate = (msg) => {
        if (!msg.timestamp?.toDate) return null;
        const date = msg.timestamp.toDate();
        return format(date, 'yyyy-MM-dd');
    };

    // Empty state
    if (!chat) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.chatBackground}>
                    <div className={`${styles.bgOrb} ${styles.bgOrb1}`}></div>
                    <div className={`${styles.bgOrb} ${styles.bgOrb2}`}></div>
                </div>

                <div className={styles.emptyContent}>
                    <div className={styles.emptyIcon}>
                        <MessageCircle size={36} />
                    </div>
                    <h3>Suas Mensagens</h3>
                    <p>Selecione um contato para começar a conversar</p>
                </div>
            </div>
        );
    }

    let lastDate = null;

    return (
        <div className={styles.windowContainer}>
            {/* Background animado */}
            <div className={styles.chatBackground}>
                <div className={`${styles.bgOrb} ${styles.bgOrb1}`}></div>
                <div className={`${styles.bgOrb} ${styles.bgOrb2}`}></div>
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.userInfo} onClick={() => onViewProfile(chat)}>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.avatarRing}></div>
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
                        {isTyping ? (
                            <div className={styles.typingIndicator}>
                                <span>digitando</span>
                                <div className={styles.typingDots}>
                                    <span className={styles.typingDot}></span>
                                    <span className={styles.typingDot}></span>
                                    <span className={styles.typingDot}></span>
                                </div>
                            </div>
                        ) : (
                            <span className={`${styles.userStatus} ${!isOnline ? styles.offline : ''}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.headerActions} ref={optionsMenuRef}>
                    <button
                        className={`${styles.iconBtn} ${showOptionsMenu ? styles.active : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowOptionsMenu(!showOptionsMenu);
                        }}
                    >
                        <MoreVertical size={20} />
                    </button>

                    {/* Menu de Opções */}
                    {showOptionsMenu && (
                        <div className={styles.optionsMenu}>
                            <button onClick={handleSearchInChat}>
                                <Search size={16} />
                                Pesquisar na conversa
                            </button>
                            <button onClick={() => onViewProfile(chat)}>
                                <User size={16} />
                                Ver perfil
                            </button>
                            <button onClick={handleToggleMute}>
                                {isMuted ? <Bell size={16} /> : <BellOff size={16} />}
                                {isMuted ? 'Ativar notificações' : 'Silenciar conversa'}
                            </button>
                            <button onClick={handleExportChat}>
                                <Download size={16} />
                                Exportar conversa
                            </button>
                            <div className={styles.menuDivider}></div>
                            <button onClick={handleClearChat} className={styles.dangerBtn}>
                                <Trash size={16} />
                                Limpar conversa
                            </button>
                            {isBlocked ? (
                                <button onClick={handleUnblockUser} className={styles.successBtn}>
                                    <UserCheck size={16} />
                                    Desbloquear usuário
                                </button>
                            ) : (
                                <button onClick={handleBlockUser} className={styles.dangerBtn}>
                                    <UserX size={16} />
                                    Bloquear usuário
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Barra de Busca */}
            {showSearchBar && (
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pesquisar mensagens..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <span className={styles.searchCount}>
                        {searchQuery.trim() ? `${filteredMessages.length} resultados` : ''}
                    </span>
                    <button onClick={() => { setShowSearchBar(false); setSearchQuery(''); }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className={styles.messagesArea}>
                {loading ? (
                    <div className={styles.loading}>Carregando mensagens...</div>
                ) : filteredMessages.length === 0 ? (
                    <div className={styles.emptyMessages}>
                        <p>{searchQuery.trim() ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem ainda. Diga oi! 👋'}</p>
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser?.uid;
                        const messageDate = getMessageDate(msg);
                        let showDateSeparator = false;

                        if (messageDate && messageDate !== lastDate) {
                            showDateSeparator = true;
                            lastDate = messageDate;
                        }

                        return (
                            <React.Fragment key={msg.id}>
                                {showDateSeparator && msg.timestamp?.toDate && (
                                    <div className={styles.dateSeparator}>
                                        <div className={styles.dateLine}></div>
                                        <span className={styles.dateLabel}>
                                            {formatDateSeparator(msg.timestamp.toDate())}
                                        </span>
                                        <div className={styles.dateLine}></div>
                                    </div>
                                )}

                                <div className={`${styles.messageRow} ${isMe ? styles.me : styles.them}`}>
                                    <div
                                        className={`${styles.messageBubble} ${msg.isDeleted ? styles.deleted : ''}`}
                                        onContextMenu={(e) => handleContextMenu(e, msg)}
                                    >
                                        {/* Quick Reactions */}
                                        {!msg.isDeleted && (
                                            <div className={styles.quickReactions}>
                                                {QUICK_REACTIONS.map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        className={styles.quickReactionBtn}
                                                        onClick={() => handleReaction(msg.id, emoji)}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reply preview */}
                                        {msg.replyTo && !msg.isDeleted && (
                                            <div className={styles.replyPreview}>
                                                <Reply size={14} />
                                                <span>{msg.replyTo.content?.substring(0, 50)}{msg.replyTo.content?.length > 50 ? '...' : ''}</span>
                                            </div>
                                        )}

                                        {/* Message content */}
                                        {msg.isDeleted ? (
                                            <div className={styles.deletedMessage}>
                                                <span className={styles.deletedIcon}>🚫</span>
                                                <span className={styles.deletedText}>Mensagem apagada</span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Image */}
                                                {msg.imageUrl && (
                                                    <div className={styles.messageImage}>
                                                        <img
                                                            src={msg.imageUrl}
                                                            alt="Imagem"
                                                            onClick={() => window.open(msg.imageUrl, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                                {/* Text */}
                                                {msg.content && (
                                                    <div className={styles.messageText}>
                                                        <RichTextRenderer text={msg.content} />
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Reactions */}
                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                            <div className={styles.messageReactions}>
                                                {Object.entries(msg.reactions).map(([emoji, users]) => (
                                                    users && users.length > 0 && (
                                                        <button
                                                            key={emoji}
                                                            className={`${styles.reaction} ${users.includes(currentUser?.uid) ? styles.myReaction : ''}`}
                                                            onClick={() => handleReaction(msg.id, emoji)}
                                                        >
                                                            <span className={styles.reactionEmoji}>{emoji}</span>
                                                            <span className={styles.reactionCount}>{users.length}</span>
                                                        </button>
                                                    )
                                                ))}
                                            </div>
                                        )}

                                        {/* Time & read status */}
                                        <span className={styles.messageTime}>
                                            {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm') : ''}
                                            {isMe && !msg.isDeleted && (
                                                <span className={`${styles.readStatus} ${msg.read ? styles.read : ''}`}>
                                                    {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
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
                        <>
                            <div className={styles.contextMenuDivider}></div>
                            <button onClick={() => handleDelete(menuOpenFor)} className={styles.deleteBtn}>
                                <Trash2 size={16} />
                                Excluir
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
                <div className={styles.imagePreviewBar}>
                    <div className={styles.imagePreviewContent}>
                        <img src={imagePreview.preview} alt="Preview" className={styles.previewThumb} />
                        <span>Imagem selecionada</span>
                    </div>
                    <button onClick={() => setImagePreview(null)} className={styles.cancelPreview}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Reply Bar */}
            {replyingTo && (
                <div className={styles.replyBar}>
                    <div className={styles.replyContent}>
                        <Reply size={16} />
                        <span>Respondendo: {replyingTo.content?.substring(0, 50)}{replyingTo.content?.length > 50 ? '...' : ''}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className={styles.cancelReply}>×</button>
                </div>
            )}

            {/* Blocked Notice */}
            {(isBlocked || isBlockedBy) ? (
                <div className={styles.blockedNotice}>
                    <UserX size={20} />
                    <span>
                        {isBlocked
                            ? 'Você bloqueou este usuário. Desbloqueie para continuar a conversa.'
                            : 'Você foi bloqueado por este usuário.'
                        }
                    </span>
                </div>
            ) : (
                /* Message Input */
                <ChatMessageInput
                    onSend={handleSendMessage}
                    onImageSelect={handleImageSelect}
                    onTyping={handleTyping}
                    disabled={!chat || sendingImage}
                    sending={sendingImage}
                />
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
                confirmText={confirmModal.isDangerous ? 'Confirmar' : 'Sim'}
                cancelText="Cancelar"
            />

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
}
