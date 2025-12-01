import React from 'react';
import { TextWithEmojis } from '../TextWithEmojis';
import styles from './TopBar.module.css';

export function TopBar({ user, onLogout, onNavigate, unreadCount }) {
    return (
        <header className={styles.topBar}>
            <h2
                className={styles.pageTitle}
                onClick={() => onNavigate && onNavigate('feed')}
                title="Voltar para o Feed"
            >
                Página Inicial
            </h2>

            <div className={styles.userProfileHeader}>
                <button
                    className={styles.iconBtn}
                    onClick={() => onNavigate && onNavigate('notifications')}
                    title="Notificações"
                    style={{ position: 'relative', marginRight: '1rem' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </button>

                <div
                    className={styles.userInfoContainer}
                    onClick={() => onNavigate && onNavigate('profile')}
                    title="Ver Perfil"
                >
                    <div className={styles.headerUserInfo}>
                        <span className={styles.headerName}>{user.displayName || 'Usuário'}</span>
                        <span className={styles.headerRole}>Membro</span>
                    </div>
                    <div className={styles.headerAvatar}>
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className={styles.avatarImg} />
                        ) : (
                            user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
                </div>


            </div>
        </header>
    );
}
