import React from 'react';
import { useUserFriends } from '../../hooks/useUserFriends';
import styles from './FriendsSidebar.module.css';
import { FriendCard } from './FriendCard';
import { Users, UserX } from 'lucide-react';

export function FriendsSidebar({ user, onUserClick, onMessageClick }) {
    const { friends, loading, error } = useUserFriends(user?.uid);

    if (loading) {
        return (
            <div className={styles.sidebar}>
                <div className={styles.header}>
                    <h3>Amigos</h3>
                </div>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <span>Carregando...</span>
                </div>
            </div>
        );
    }

    // Separar online e offline
    const onlineFriends = friends.filter(f => f.isOnline);
    const offlineFriends = friends.filter(f => !f.isOnline);

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <h3>Amigos</h3>
                <span className={styles.count}>{friends.length}</span>
            </div>

            <div className={styles.list}>
                {friends.length === 0 ? (
                    <div className={styles.empty}>
                        <UserX size={32} strokeWidth={1.5} />
                        <p>Nenhum amigo ainda</p>
                    </div>
                ) : (
                    friends.map(friend => (
                        <FriendCard
                            key={friend.uid}
                            userId={friend.uid}
                            initialData={friend}
                            onClick={onUserClick}
                            onMessageClick={onMessageClick}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
