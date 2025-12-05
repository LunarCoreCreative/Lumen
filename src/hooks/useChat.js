import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase';
import {
    collection,
    query,
    where,
    orderBy,
    addDoc,
    setDoc,
    doc,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    getDoc,
    increment,
    deleteDoc,
    limit,
    arrayUnion,
    arrayRemove,
    deleteField
} from 'firebase/firestore';

// Hook para listar as conversas do usuário
export function useUserChats(userId) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setChats([]);
            setLoading(false);
            return;
        }

        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('participants', 'array-contains', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Ordenar no cliente
            chatsData.sort((a, b) => {
                const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt ? Date.now() : 0);
                const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt ? Date.now() : 0);
                return timeB - timeA;
            });

            setChats(chatsData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar chats:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { chats, loading };
}

// Hook para contar total de mensagens não lidas
export function useUnreadChatCount(userId) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) {
            setUnreadCount(0);
            return;
        }

        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('participants', 'array-contains', userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let total = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.unreadCounts && data.unreadCounts[userId]) {
                    total += data.unreadCounts[userId];
                }
            });
            setUnreadCount(total);
        });

        return () => unsubscribe();
    }, [userId]);

    return unreadCount;
}

// Hook para listar mensagens de um chat específico
export function useChatMessages(chatId) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar mensagens:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    return { messages, loading };
}

// Hook para indicador de digitando
export function useTypingIndicator(chatId, otherUserId) {
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!chatId || !otherUserId) {
            setIsTyping(false);
            return;
        }

        const chatRef = doc(db, 'chats', chatId);

        const unsubscribe = onSnapshot(chatRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.typing && data.typing[otherUserId]) {
                const typingTime = data.typing[otherUserId]?.toMillis?.() || 0;
                const now = Date.now();
                // Considera digitando se < 5 segundos atrás
                setIsTyping(now - typingTime < 5000);
            } else {
                setIsTyping(false);
            }
        });

        return () => unsubscribe();
    }, [chatId, otherUserId]);

    return isTyping;
}

// Hook para configurações do chat (muted, blocked)
export function useChatSettings(chatId, userId) {
    const [settings, setSettings] = useState({
        isMuted: false,
        isBlocked: false,
        isBlockedBy: false,
        clearedAt: null
    });

    useEffect(() => {
        if (!chatId || !userId) {
            setSettings({ isMuted: false, isBlocked: false, isBlockedBy: false, clearedAt: null });
            return;
        }

        const chatRef = doc(db, 'chats', chatId);

        const unsubscribe = onSnapshot(chatRef, (snapshot) => {
            const data = snapshot.data();
            if (data) {
                setSettings({
                    isMuted: data.mutedBy?.includes(userId) || false,
                    isBlocked: data.blockedBy?.includes(userId) || false,
                    isBlockedBy: data.blockedBy?.length > 0 && !data.blockedBy?.includes(userId),
                    clearedAt: data.clearedAt?.[userId] || null
                });
            }
        });

        return () => unsubscribe();
    }, [chatId, userId]);

    return settings;
}

// Funções de ação do chat
export const chatActions = {
    // Enviar mensagem
    sendMessage: async (chatId, content, senderId, recipientId, replyTo = null, imageUrl = null) => {
        if (!content.trim() && !imageUrl) return;

        const chatRef = doc(db, 'chats', chatId);
        const messagesRef = collection(chatRef, 'messages');

        try {
            // 1. Adicionar mensagem na subcoleção
            const messageData = {
                senderId,
                content,
                imageUrl,
                timestamp: serverTimestamp(),
                read: false,
                reactions: {} // Objeto para armazenar reações {emoji: [userId1, userId2]}
            };

            if (replyTo) {
                messageData.replyTo = {
                    id: replyTo.id,
                    content: replyTo.content,
                    senderId: replyTo.senderId
                };
            }

            await addDoc(messagesRef, messageData);

            // 2. Atualizar o documento do chat
            const lastMessageText = imageUrl ? (content ? `📷 ${content}` : '📷 Imagem') : content;

            const updateData = {
                lastMessage: lastMessageText,
                updatedAt: serverTimestamp(),
                unreadCounts: {
                    [recipientId]: increment(1)
                },
                // Limpar indicador de digitando ao enviar
                [`typing.${senderId}`]: deleteField()
            };

            await setDoc(chatRef, updateData, { merge: true });

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            throw error;
        }
    },

    // Upload de imagem e enviar
    sendImageMessage: async (chatId, imageFile, content, senderId, recipientId) => {
        if (!imageFile) return;

        try {
            const { compressImage } = await import('../utils/compressImage');
            const compressedFile = await compressImage(imageFile, 1920, 1920, 0.7);

            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('upload_preset', 'lumen_uploads');

            const response = await fetch('https://api.cloudinary.com/v1_1/dasntpbd3/image/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Falha no upload da imagem');
            }

            const data = await response.json();
            const imageUrl = data.secure_url;

            // Enviar mensagem com imagem
            await chatActions.sendMessage(chatId, content, senderId, recipientId, null, imageUrl);

            return imageUrl;
        } catch (error) {
            console.error("Erro ao enviar imagem:", error);
            throw error;
        }
    },

    // Adicionar/Remover reação
    toggleReaction: async (chatId, messageId, emoji, userId) => {
        if (!chatId || !messageId || !emoji || !userId) return;

        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);

        try {
            const messageSnap = await getDoc(messageRef);
            if (!messageSnap.exists()) return;

            const data = messageSnap.data();
            const reactions = data.reactions || {};
            const emojiReactions = reactions[emoji] || [];

            if (emojiReactions.includes(userId)) {
                // Remover reação
                await updateDoc(messageRef, {
                    [`reactions.${emoji}`]: arrayRemove(userId)
                });

                // Se ficou vazio, remover o campo
                const updatedSnap = await getDoc(messageRef);
                const updatedReactions = updatedSnap.data()?.reactions?.[emoji] || [];
                if (updatedReactions.length === 0) {
                    await updateDoc(messageRef, {
                        [`reactions.${emoji}`]: deleteField()
                    });
                }
            } else {
                // Adicionar reação
                await updateDoc(messageRef, {
                    [`reactions.${emoji}`]: arrayUnion(userId)
                });
            }
        } catch (error) {
            console.error("Erro ao reagir:", error);
            throw error;
        }
    },

    // Deletar mensagem (Soft Delete)
    deleteMessage: async (chatId, messageId, userId) => {
        if (!chatId || !messageId || !userId) return;

        const chatRef = doc(db, 'chats', chatId);
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);

        try {
            const messageSnap = await getDoc(messageRef);
            if (!messageSnap.exists()) {
                throw new Error("Mensagem não encontrada");
            }

            const originalData = messageSnap.data();

            // 1. Soft Delete
            await updateDoc(messageRef, {
                deletedAt: serverTimestamp(),
                deletedBy: userId,
                originalContent: originalData.content,
                originalImageUrl: originalData.imageUrl || null,
                content: "Mensagem apagada",
                imageUrl: null,
                isDeleted: true,
                reactions: {} // Limpar reações
            });

            // 2. Atualizar lastMessage do Chat
            await updateDoc(chatRef, {
                lastMessage: "🚫 Mensagem apagada",
                updatedAt: serverTimestamp()
            });

        } catch (error) {
            console.error("Erro ao deletar mensagem:", error);
            throw error;
        }
    },

    // Marcar chat como lido
    markChatAsRead: async (chatId, userId) => {
        if (!chatId || !userId) return;

        const chatRef = doc(db, 'chats', chatId);
        try {
            await setDoc(chatRef, {
                unreadCounts: {
                    [userId]: 0
                }
            }, { merge: true });

            // Marcar todas as mensagens como lidas
            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const q = query(messagesRef, where('read', '==', false), where('senderId', '!=', userId));

            // Nota: Para performance, podemos usar batch ou apenas marcar as últimas N mensagens
            // Por enquanto, marcamos via listener no chat principal
        } catch (error) {
            console.error("Erro ao marcar como lido:", error);
        }
    },

    // Marcar mensagens específicas como lidas
    markMessagesAsRead: async (chatId, messageIds, recipientId) => {
        if (!chatId || !messageIds?.length) return;

        try {
            const promises = messageIds.map(msgId => {
                const messageRef = doc(db, 'chats', chatId, 'messages', msgId);
                return updateDoc(messageRef, { read: true, readAt: serverTimestamp() });
            });
            await Promise.all(promises);
        } catch (error) {
            console.error("Erro ao marcar mensagens como lidas:", error);
        }
    },

    // Atualizar indicador de digitando
    setTypingIndicator: async (chatId, userId, isTyping) => {
        if (!chatId || !userId) return;

        const chatRef = doc(db, 'chats', chatId);
        try {
            if (isTyping) {
                await setDoc(chatRef, {
                    typing: {
                        [userId]: serverTimestamp()
                    }
                }, { merge: true });
            } else {
                await setDoc(chatRef, {
                    typing: {
                        [userId]: deleteField()
                    }
                }, { merge: true });
            }
        } catch (error) {
            console.error("Erro ao atualizar typing:", error);
        }
    },

    // Criar ou obter chat existente
    createOrGetChat: async (currentUserId, friendId) => {
        const sortedIds = [currentUserId, friendId].sort();
        const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
        const chatRef = doc(db, 'chats', chatId);

        try {
            const chatSnap = await getDoc(chatRef);

            if (!chatSnap.exists()) {
                await setDoc(chatRef, {
                    participants: [currentUserId, friendId],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastMessage: '',
                    unreadCounts: {
                        [currentUserId]: 0,
                        [friendId]: 0
                    },
                    typing: {},
                    mutedBy: [],
                    blockedBy: []
                });
            }

            return chatId;
        } catch (error) {
            console.error("Erro ao criar/obter chat:", error);
            throw error;
        }
    },

    // Silenciar/Dessilenciar conversa
    toggleMuteChat: async (chatId, userId, mute) => {
        if (!chatId || !userId) return;

        const chatRef = doc(db, 'chats', chatId);
        try {
            if (mute) {
                await updateDoc(chatRef, {
                    mutedBy: arrayUnion(userId)
                });
            } else {
                await updateDoc(chatRef, {
                    mutedBy: arrayRemove(userId)
                });
            }
        } catch (error) {
            console.error("Erro ao mutar conversa:", error);
            throw error;
        }
    },

    // Limpar conversa (soft delete de todas as mensagens para o usuário)
    clearChat: async (chatId, userId) => {
        if (!chatId || !userId) return;

        const chatRef = doc(db, 'chats', chatId);
        try {
            // Marcar que o usuário "limpou" o chat a partir deste timestamp
            await setDoc(chatRef, {
                clearedAt: {
                    [userId]: serverTimestamp()
                }
            }, { merge: true });

            // Resetar unread count
            await setDoc(chatRef, {
                unreadCounts: {
                    [userId]: 0
                }
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao limpar conversa:", error);
            throw error;
        }
    },

    // Bloquear usuário
    blockUser: async (chatId, blockerUserId, blockedUserId) => {
        if (!chatId || !blockerUserId || !blockedUserId) return;

        const chatRef = doc(db, 'chats', chatId);
        const userRef = doc(db, 'users', blockerUserId);

        try {
            // Adicionar ao blockedBy no chat
            await updateDoc(chatRef, {
                blockedBy: arrayUnion(blockerUserId)
            });

            // Salvar na lista de bloqueados do usuário
            await setDoc(userRef, {
                blockedUsers: arrayUnion(blockedUserId)
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao bloquear usuário:", error);
            throw error;
        }
    },

    // Desbloquear usuário
    unblockUser: async (chatId, unblockerUserId, unblockedUserId) => {
        if (!chatId || !unblockerUserId || !unblockedUserId) return;

        const chatRef = doc(db, 'chats', chatId);
        const userRef = doc(db, 'users', unblockerUserId);

        try {
            await updateDoc(chatRef, {
                blockedBy: arrayRemove(unblockerUserId)
            });

            await updateDoc(userRef, {
                blockedUsers: arrayRemove(unblockedUserId)
            });
        } catch (error) {
            console.error("Erro ao desbloquear usuário:", error);
            throw error;
        }
    }
};
