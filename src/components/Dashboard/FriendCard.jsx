import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './FriendsSidebar.module.css';
import { useIsUserOnline } from '../../hooks/useIsUserOnline';
import { MessageCircle, Gamepad2 } from 'lucide-react';

export function FriendCard({ userId, initialData, onClick, onMessageClick }) {
    const [userData, setUserData] = useState(initialData);
    const isOnline = useIsUserOnline(userId);

    useEffect(() => {
        if (!userId) return;

        const unsubscribeFirestore = onSnapshot(doc(db, 'users', userId), (doc) => {
            if (doc.exists()) {
                setUserData({ id: doc.id, uid: doc.id, ...doc.data() });
            }
        });

        return () => {
            unsubscribeFirestore();
        };
    }, [userId]);

    const themeColor = userData?.themeColor || '#3b82f6';
    const displayName = userData?.displayName || 'Usuário';
    const initial = displayName.charAt(0).toUpperCase();

    const handleMessageClick = (e) => {
        e.stopPropagation(); // Evitar abrir perfil
        if (onMessageClick) {
            onMessageClick({ ...userData, uid: userId });
        }
    };

    return (
        <div
            className={`${styles.friendCard} ${!isOnline ? styles.offline : ''}`}
            onClick={() => onClick({ ...userData, uid: userId })}
            style={{ '--friend-theme': themeColor }}
        >
            {/* Avatar with status indicator */}
            <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>
                    {userData?.photoURL ? (
                        <img src={userData.photoURL} alt={displayName} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {initial}
                        </div>
                    )}
                </div>
                <span className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offlineIndicator}`}></span>
            </div>

            {/* User Info */}
            <div className={styles.userInfo}>
                <span className={styles.name}>{displayName}</span>
                <span className={styles.status}>
                    {isOnline ? (
                        <>
                            <span className={styles.statusText}>Online</span>
                        </>
                    ) : (
                        <span className={styles.statusText}>Offline</span>
                    )}
                </span>
            </div>

            {/* Quick Action - opcional */}
            {isOnline && (
                <div
                    className={styles.quickAction}
                    onClick={handleMessageClick}
                    title="Enviar mensagem"
                >
                    <MessageCircle size={16} />
                </div>
            )}
        </div>
    );
}
