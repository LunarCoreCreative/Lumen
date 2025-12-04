import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

export function useNativeNotifications(userId) {
    const previousUnreadCounts = useRef({});
    const permissionRequested = useRef(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Carregar configuração do usuário
    useEffect(() => {
        if (!userId) return;

        const loadSettings = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    const settings = userDoc.data()?.settings;
                    setNotificationsEnabled(settings?.notifications?.native !== false);
                    console.log('🔔 Notificações nativas:', settings?.notifications?.native !== false ? 'ATIVADAS' : 'DESATIVADAS');
                }
            } catch (error) {
                console.error('Erro ao carregar configurações de notificação:', error);
            }
        };

        loadSettings();

        const unsubscribe = onSnapshot(doc(db, 'users', userId), (docSnap) => {
            if (docSnap.exists()) {
                const settings = docSnap.data()?.settings;
                setNotificationsEnabled(settings?.notifications?.native !== false);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        if (!userId || !notificationsEnabled) {
            console.log('⚠️ Hook de notificações não ativo. UserId:', !!userId, 'Enabled:', notificationsEnabled);
            return;
        }

        console.log('✅ Hook de notificações ATIVO para user:', userId);

        if (!permissionRequested.current && 'Notification' in window) {
            console.log('🔐 Permissão atual:', Notification.permission);
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(perm => {
                    console.log('🔐 Nova permissão:', perm);
                });
            }
            permissionRequested.current = true;
        }

        // 1. Listener para CHATS (Mensagens)
        const chatsRef = collection(db, 'chats');
        const qChats = query(
            chatsRef,
            where('participants', 'array-contains', userId)
        );

        const unsubscribeChats = onSnapshot(qChats, async (snapshot) => {
            for (const docSnap of snapshot.docs) {
                const chatData = docSnap.data();
                const chatId = docSnap.id;
                const currentUnread = chatData.unreadCounts?.[userId] || 0;
                const previousUnread = previousUnreadCounts.current[chatId] || 0;

                if (currentUnread > previousUnread && Notification.permission === 'granted') {
                    const otherUserId = chatData.participants.find(p => p !== userId);

                    if (otherUserId) {
                        try {
                            const userDoc = await getDoc(doc(db, 'users', otherUserId));
                            const senderName = userDoc.exists() ? userDoc.data().displayName : 'Alguém';

                            console.log('💬 Disparando notificação de MENSAGEM:', senderName);

                            const notification = new Notification(`Nova mensagem de ${senderName}`, {
                                body: chatData.lastMessage || 'Você recebeu uma nova mensagem',
                                icon: userDoc.exists() && userDoc.data().photoURL
                                    ? userDoc.data().photoURL
                                    : '/icon.png',
                                tag: chatId,
                                requireInteraction: false
                            });

                            notification.onclick = () => {
                                window.focus();
                                notification.close();
                            };
                        } catch (error) {
                            console.error('Erro ao exibir notificação:', error);
                        }
                    }
                }
                previousUnreadCounts.current[chatId] = currentUnread;
            }
        });

        // 2. Listener para OUTRAS NOTIFICAÇÕES (Likes, Comentários, etc)
        const notifsQuery = query(
            collection(db, 'notifications'),
            where('recipientId', '==', userId)
        );

        let isInitialLoad = true;

        const unsubscribeNotifs = onSnapshot(notifsQuery, (snapshot) => {
            console.log('📬 Listener de notificações ativado. Docs:', snapshot.docs.length, 'isInitialLoad:', isInitialLoad);

            if (isInitialLoad) {
                console.log('⏭️ Primeira carga, ignorando notificações existentes.');
                isInitialLoad = false;
                return;
            }

            const changes = snapshot.docChanges();
            console.log('🔔 Mudanças detectadas:', changes.length);

            changes.forEach((change) => {
                console.log('📝 Tipo de mudança:', change.type, 'Permission:', Notification.permission);

                if (change.type === "added" && Notification.permission === 'granted') {
                    const notif = change.doc.data();
                    console.log('✅ Nova notificação detectada! Tipo:', notif.type, 'De:', notif.senderName);

                    let title = 'Nova Notificação';
                    let body = 'Você tem uma nova interação.';

                    switch (notif.type) {
                        case 'like':
                            title = 'Nova Curtida';
                            body = `${notif.senderName} curtiu seu post: "${notif.content || ''}"`;
                            break;
                        case 'comment':
                            title = 'Novo Comentário';
                            body = `${notif.senderName} comentou: "${notif.content || ''}"`;
                            break;
                        case 'reply':
                            title = 'Nova Resposta';
                            body = `${notif.senderName} respondeu seu comentário.`;
                            break;
                        case 'friend_request':
                            title = 'Solicitação de Amizade';
                            body = `${notif.senderName} quer ser seu amigo.`;
                            break;
                        case 'friend_accepted':
                            title = 'Amizade Aceita';
                            body = `${notif.senderName} aceitou seu pedido de amizade.`;
                            break;
                        case 'friend_post':
                            title = 'Novo Post de Amigo';
                            body = `${notif.senderName} publicou algo novo.`;
                            break;
                    }

                    console.log('🚀 Disparando notificação:', title, '|', body);

                    try {
                        const notification = new Notification(title, {
                            body: body,
                            icon: notif.senderAvatar || '/icon.png',
                            tag: change.doc.id,
                            requireInteraction: false
                        });

                        notification.onclick = () => {
                            window.focus();
                            notification.close();
                        };

                        console.log('✅ Notificação disparada com sucesso!');
                    } catch (err) {
                        console.error('❌ Erro ao criar notificação:', err);
                    }
                }
            });
        });

        return () => {
            console.log('🛑 Desconectando listeners de notificações');
            unsubscribeChats();
            unsubscribeNotifs();
        };
    }, [userId, notificationsEnabled]);
}
