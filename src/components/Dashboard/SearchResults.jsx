import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { PostCard } from './PostCard';
import styles from './SearchResults.module.css';

export function SearchResults({ searchQuery, user, onUserClick, onShowAlert, onShowConfirm }) {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery || searchQuery.trim() === '') {
                setUsers([]);
                setPosts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const term = searchQuery.toLowerCase();

            try {
                // 1. Buscar Usuários (Client-side filtering for simplicity/flexibility or prefix search)
                // Firestore prefix search: where('displayName', '>=', Term).where('displayName', '<=', Term + '\uf8ff')
                // Mas como queremos case-insensitive e 'contains', melhor buscar recentes e filtrar ou usar solução de busca real (Algolia).
                // Para este teste, vamos buscar todos (se forem poucos) ou limitar e filtrar.
                // Vamos tentar prefix search com Capitalização correta se possível, ou buscar um lote e filtrar.

                // Estratégia MVP: Buscar últimos 50 usuários e filtrar no cliente
                const usersRef = collection(db, 'users');
                const usersQuery = query(usersRef, limit(50));
                const usersSnapshot = await getDocs(usersQuery);

                const filteredUsers = usersSnapshot.docs
                    .map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() }))
                    .filter(u =>
                        (u.displayName && u.displayName.toLowerCase().includes(term)) ||
                        (u.email && u.email.toLowerCase().includes(term))
                    );

                setUsers(filteredUsers);

                // 2. Buscar Posts (Client-side filtering)
                const postsRef = collection(db, 'posts');
                const postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(50));
                const postsSnapshot = await getDocs(postsQuery);

                const filteredPosts = postsSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(p =>
                        (p.text && p.text.toLowerCase().includes(term)) ||
                        (p.author?.name && p.author.name.toLowerCase().includes(term))
                    );

                setPosts(filteredPosts);

            } catch (error) {
                console.error("Erro na busca:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce simples
        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    if (loading) {
        return <div className={styles.loading}>Pesquisando por "{searchQuery}"...</div>;
    }

    return (
        <div className={styles.searchResultsContainer}>
            <h2 className={styles.sectionTitle}>Usuários</h2>
            {users.length > 0 ? (
                <div className={styles.usersGrid}>
                    {users.map(u => (
                        <div key={u.id} className={styles.userCard} onClick={() => onUserClick(u)}>
                            <img
                                src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}&background=random`}
                                alt={u.displayName}
                                className={styles.userAvatar}
                            />
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{u.displayName}</span>
                                <span className={styles.userRole}>{u.email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.noResults}>Nenhum usuário encontrado.</div>
            )}

            <h2 className={styles.sectionTitle}>Posts</h2>
            {posts.length > 0 ? (
                <div className={styles.postsList}>
                    {posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            user={user}
                            onShowAlert={onShowAlert}
                            onShowConfirm={onShowConfirm}
                            onUserClick={onUserClick}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.noResults}>Nenhum post encontrado.</div>
            )}
        </div>
    );
}
