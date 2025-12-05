import React, { useState, useEffect, useRef } from 'react';
import styles from './ArtDetail.module.css';
import { X, Heart, Bookmark, MessageCircle, Share2, Eye, Calendar, Tag, Send, MoreHorizontal, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { artActions, useArtComments } from '../../../hooks/useArtGallery';
import { ConfirmationModal } from '../../ConfirmationModal';

export function ArtDetail({ art, currentUser, onClose, onShowAlert }) {
    const [isLiked, setIsLiked] = useState(art.likedBy?.includes(currentUser?.uid) || false);
    const [isSaved, setIsSaved] = useState(art.savedBy?.includes(currentUser?.uid) || false);
    const [likesCount, setLikesCount] = useState(art.likes || 0);
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState(false);

    // Zoom states
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);

    // Modal de confirmação
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    const { comments, loading: loadingComments, refresh: refreshComments } = useArtComments(art.id);

    // Incrementar views
    useEffect(() => {
        if (art.id && currentUser?.uid) {
            artActions.incrementViews(art.id, currentUser.uid);
        }
    }, [art.id, currentUser?.uid]);

    const handleLike = async () => {
        if (!currentUser) return;
        const newState = !isLiked;
        setIsLiked(newState);
        setLikesCount(prev => newState ? prev + 1 : prev - 1);
        try {
            await artActions.toggleLike(art.id, currentUser.uid, newState);
        } catch (error) {
            setIsLiked(!newState);
            setLikesCount(prev => newState ? prev - 1 : prev + 1);
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;
        const newState = !isSaved;
        setIsSaved(newState);
        try {
            await artActions.toggleSave(art.id, currentUser.uid, newState);
        } catch (error) {
            setIsSaved(!newState);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim() || !currentUser || sending) return;

        setSending(true);
        try {
            await artActions.addComment(art.id, {
                userId: currentUser.uid,
                authorName: currentUser.displayName,
                authorPhotoURL: currentUser.photoURL,
                content: comment.trim()
            });
            setComment('');
            refreshComments();
        } catch (error) {
            console.error('Erro ao comentar:', error);
        } finally {
            setSending(false);
        }
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            await artActions.deleteComment(art.id, commentToDelete);
            refreshComments();
            setDeleteModalOpen(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error('Erro ao deletar comentário:', error);
        }
    };

    const handleDeleteClick = (commentId) => {
        setCommentToDelete(commentId);
        setDeleteModalOpen(true);
    };

    const handleShareClick = () => {
        setShareModalOpen(true);
    };

    const confirmShare = async () => {
        if (!currentUser) return;
        try {
            await artActions.shareArtToFeed(
                art,
                currentUser.uid,
                currentUser.displayName,
                currentUser.photoURL
            );
            setShareModalOpen(false);
            if (onShowAlert) {
                onShowAlert('Sucesso', 'Arte compartilhada no seu feed!');
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
        }
    };

    // Zoom Handlers
    const handleWheel = (e) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newZoom = Math.min(Math.max(1, zoom + scaleAmount), 4);

        if (newZoom === 1) {
            setPosition({ x: 0, y: 0 });
        }

        setZoom(newZoom);
    };

    const handleMouseDown = (e) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoom > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const toggleZoom = () => {
        if (zoom > 1) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        } else {
            setZoom(2);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} />
                </button>

                <div className={styles.content}>
                    {/* Image Section */}
                    <div
                        className={styles.imageSection}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div
                            className={styles.imageContainer}
                            style={{
                                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                            }}
                        >
                            <img
                                ref={imageRef}
                                src={art.imageUrl}
                                alt={art.title}
                                className={styles.image}
                                onClick={zoom === 1 ? toggleZoom : undefined}
                                draggable={false}
                            />
                        </div>

                        {/* Zoom Controls Overlay */}
                        <div className={styles.zoomControls}>
                            <button className={styles.zoomBtn} onClick={toggleZoom}>
                                {zoom > 1 ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className={styles.infoSection}>
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.artist}>
                                {art.authorPhotoURL ? (
                                    <img src={art.authorPhotoURL} alt={art.authorName} className={styles.artistAvatar} />
                                ) : (
                                    <div className={styles.artistAvatarPlaceholder}>
                                        {art.authorName?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                <div className={styles.artistInfo}>
                                    <span className={styles.artistName}>{art.authorName}</span>
                                    <span className={styles.postDate}>
                                        <Calendar size={12} />
                                        {art.createdAt?.toDate
                                            ? format(art.createdAt.toDate(), "dd 'de' MMMM, yyyy", { locale: ptBR })
                                            : 'Data desconhecida'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className={styles.details}>
                            <h2 className={styles.title}>{art.title}</h2>
                            {art.description && (
                                <p className={styles.description}>{art.description}</p>
                            )}

                            {/* Tags */}
                            {art.tags && art.tags.length > 0 && (
                                <div className={styles.tags}>
                                    {art.tags.map((tag, i) => (
                                        <span key={i} className={styles.tag}>
                                            <Tag size={12} />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats & Actions */}
                        <div className={styles.statsBar}>
                            <div className={styles.stats}>
                                <span className={styles.stat}>
                                    <Heart size={16} />
                                    {likesCount}
                                </span>
                                <span className={styles.stat}>
                                    <Eye size={16} />
                                    {art.views || 0}
                                </span>
                                <span className={styles.stat}>
                                    <MessageCircle size={16} />
                                    {comments.length}
                                </span>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
                                    onClick={handleLike}
                                >
                                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`}
                                    onClick={handleSave}
                                >
                                    <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                                </button>
                                <button className={styles.actionBtn} onClick={handleShareClick}>
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className={styles.commentsSection}>
                            <h3 className={styles.commentsTitle}>
                                <MessageCircle size={18} />
                                Comentários ({comments.length})
                            </h3>

                            {/* Comment Input */}
                            <form onSubmit={handleComment} className={styles.commentForm}>
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Escreva um comentário..."
                                    className={styles.commentInput}
                                />
                                <button
                                    type="submit"
                                    className={styles.sendBtn}
                                    disabled={!comment.trim() || sending}
                                >
                                    <Send size={18} />
                                </button>
                            </form>

                            {/* Comments List */}
                            <div className={styles.commentsList}>
                                {loadingComments ? (
                                    <div className={styles.loadingComments}>Carregando...</div>
                                ) : comments.length === 0 ? (
                                    <div className={styles.noComments}>
                                        Seja o primeiro a comentar!
                                    </div>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className={styles.comment}>
                                            {c.authorPhotoURL ? (
                                                <img src={c.authorPhotoURL} alt={c.authorName} className={styles.commentAvatar} />
                                            ) : (
                                                <div className={styles.commentAvatarPlaceholder}>
                                                    {c.authorName?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentHeader}>
                                                    <span className={styles.commentAuthor}>{c.authorName}</span>
                                                    <span className={styles.commentTime}>
                                                        {c.createdAt?.toDate
                                                            ? format(c.createdAt.toDate(), 'dd/MM HH:mm')
                                                            : ''
                                                        }
                                                    </span>
                                                </div>
                                                <p className={styles.commentText}>{c.content}</p>
                                            </div>
                                            {currentUser && c.userId === currentUser.uid && (
                                                <button
                                                    className={styles.deleteCommentBtn}
                                                    onClick={() => handleDeleteClick(c.id)}
                                                    title="Excluir comentário"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteComment}
                title="Excluir Comentário"
                message="Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                isDangerous={true}
            />

            <ConfirmationModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                onConfirm={confirmShare}
                title="Compartilhar no Feed"
                message="Deseja compartilhar esta arte no seu feed para seus amigos verem?"
                confirmText="Compartilhar"
                isDangerous={false}
            />
        </div>
    );
}
