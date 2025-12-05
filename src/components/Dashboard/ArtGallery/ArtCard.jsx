import React, { useState } from 'react';
import styles from './ArtCard.module.css';
import { Heart, Bookmark, Eye, MessageCircle, MoreHorizontal } from 'lucide-react';
import { artActions } from '../../../hooks/useArtGallery';

export function ArtCard({ art, currentUser, onClick }) {
    const [isLiked, setIsLiked] = useState(art.likedBy?.includes(currentUser?.uid) || false);
    const [isSaved, setIsSaved] = useState(art.savedBy?.includes(currentUser?.uid) || false);
    const [likesCount, setLikesCount] = useState(art.likes || 0);
    const [isHovered, setIsHovered] = useState(false);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!currentUser) return;

        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

        try {
            await artActions.toggleLike(art.id, currentUser.uid, newLikedState);
        } catch (error) {
            // Reverter em caso de erro
            setIsLiked(!newLikedState);
            setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
            console.error('Erro ao curtir:', error);
        }
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        if (!currentUser) return;

        const newSavedState = !isSaved;
        setIsSaved(newSavedState);

        try {
            await artActions.toggleSave(art.id, currentUser.uid, newSavedState);
        } catch (error) {
            setIsSaved(!newSavedState);
            console.error('Erro ao salvar:', error);
        }
    };

    return (
        <div
            className={styles.card}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image */}
            <div className={styles.imageWrapper}>
                <img
                    src={art.imageUrl}
                    alt={art.title}
                    className={styles.image}
                    loading="lazy"
                />

                {/* Overlay on hover */}
                <div className={`${styles.overlay} ${isHovered ? styles.visible : ''}`}>
                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                        <button
                            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
                            onClick={handleLike}
                            title="Curtir"
                        >
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`}
                            onClick={handleSave}
                            title="Salvar"
                        >
                            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className={styles.stats}>
                        <span className={styles.stat}>
                            <Heart size={14} />
                            {likesCount}
                        </span>
                        <span className={styles.stat}>
                            <Eye size={14} />
                            {art.views || 0}
                        </span>
                        {art.commentsCount > 0 && (
                            <span className={styles.stat}>
                                <MessageCircle size={14} />
                                {art.commentsCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Category Badge */}
                {art.category && (
                    <span className={styles.categoryBadge}>
                        {art.category}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className={styles.info}>
                <h3 className={styles.title}>{art.title}</h3>

                <div className={styles.artist}>
                    {art.authorPhotoURL ? (
                        <img
                            src={art.authorPhotoURL}
                            alt={art.authorName}
                            className={styles.artistAvatar}
                        />
                    ) : (
                        <div className={styles.artistAvatarPlaceholder}>
                            {art.authorName?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    <span className={styles.artistName}>{art.authorName}</span>
                </div>
            </div>
        </div>
    );
}
