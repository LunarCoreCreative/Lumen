import React, { useState, useEffect } from 'react';
import styles from './ProfileHub.module.css';
import {
    FileText, MessageSquare, Users, ArrowLeft, Pencil, Camera,
    UserPlus, UserMinus, UserCheck, Clock, Check, X, Sparkles,
    Trophy, Flame, Star, ChevronRight, Activity, Gamepad2,
    Calendar, MapPin, Zap, TrendingUp, Palette, Crown, Shield, Rocket
} from 'lucide-react';
import { ConfirmationModal } from '../ConfirmationModal';
import { UserPostsSection } from './UserPostsSection';
import { UserCommentsSection } from './UserCommentsSection';
import { UserFriendsSection } from './UserFriendsSection';
import { usePosts } from '../../hooks/usePosts';
import { useUserComments } from '../../hooks/useUserComments';
import { useUserData } from '../../hooks/useUserData';
import { useFriendship } from '../../hooks/useFriendship';
import { useUserFriends } from '../../hooks/useUserFriends';
import { auth } from '../../firebase';

export function ProfileHub({ user: authUser, onBack, onNavigateToPost, onUserClick }) {
    const [activeSection, setActiveSection] = useState('overview');

    // Internal Friendship Actions Component
    const FriendshipActions = ({ targetUserId }) => {
        const {
            friendshipStatus,
            loading,
            sendFriendRequest,
            acceptFriendRequest,
            rejectFriendRequest,
            cancelFriendRequest,
            removeFriend
        } = useFriendship(targetUserId);

        const [showUnfriendModal, setShowUnfriendModal] = useState(false);

        if (loading) return null;

        switch (friendshipStatus) {
            case 'none':
                return (
                    <button onClick={sendFriendRequest} className={styles.actionButton}>
                        <UserPlus size={16} /> Adicionar
                    </button>
                );
            case 'pending_sent':
                return (
                    <button onClick={cancelFriendRequest} className={`${styles.actionButton} ${styles.pending}`}>
                        <Clock size={16} /> Pendente
                    </button>
                );
            case 'pending_received':
                return (
                    <div className={styles.actionButtons}>
                        <button onClick={acceptFriendRequest} className={`${styles.actionButton} ${styles.accept}`}>
                            <Check size={16} />
                        </button>
                        <button onClick={rejectFriendRequest} className={`${styles.actionButton} ${styles.reject}`}>
                            <X size={16} />
                        </button>
                    </div>
                );
            case 'accepted':
                return (
                    <>
                        <button
                            onClick={() => setShowUnfriendModal(true)}
                            className={`${styles.actionButton} ${styles.friends}`}
                        >
                            <UserCheck size={16} /> Amigos
                        </button>
                        <ConfirmationModal
                            isOpen={showUnfriendModal}
                            onClose={() => setShowUnfriendModal(false)}
                            onConfirm={removeFriend}
                            title="Desfazer Amizade"
                            message="Tem certeza que deseja desfazer a amizade?"
                            confirmText="Desfazer"
                            isDangerous={true}
                        />
                    </>
                );
            default:
                return null;
        }
    };

    // Data hooks
    const { userData, loading: userLoading, updateUserData, uploadImage } = useUserData(authUser.uid);
    const { posts, loading: postsLoading } = usePosts(authUser.uid);
    const { comments, loading: commentsLoading } = useUserComments(authUser.uid);
    const { friends, loading: friendsLoading } = useUserFriends(authUser.uid);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (userData) {
            setEditName(userData.displayName || '');
            setEditBio(userData.bio || '');
        }
    }, [userData]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const isOwner = auth.currentUser && auth.currentUser.uid === authUser.uid;
    const displayUser = userData || authUser;
    const displayName = displayUser.displayName || 'Usuário';
    const photoURL = displayUser.photoURL;
    const bannerURL = displayUser.bannerURL;
    const bio = displayUser.bio || 'Sem descrição';

    const handleSave = async () => {
        setUploading(true);
        try {
            await updateUserData({ displayName: editName, bio: editBio });
            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao salvar:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadImage(file);
            await updateUserData({ [type === 'avatar' ? 'photoURL' : 'bannerURL']: url });
        } catch (error) {
            console.error(`Erro ao enviar ${type}:`, error);
        } finally {
            setUploading(false);
        }
    };

    // Stats data
    const stats = [
        { id: 'posts', label: 'Posts', value: postsLoading ? '-' : posts.length, icon: FileText, color: '#8b5cf6' },
        { id: 'comments', label: 'Comentários', value: commentsLoading ? '-' : comments.length, icon: MessageSquare, color: '#3b82f6' },
        { id: 'friends', label: 'Amigos', value: friendsLoading ? '-' : friends.length, icon: Users, color: '#10b981' }
    ];

    // Quick actions / sections
    const sections = [
        { id: 'posts', name: 'Meus Posts', desc: 'Publicações na comunidade', icon: FileText, count: posts.length },
        { id: 'comments', name: 'Comentários', desc: 'Interações em posts', icon: MessageSquare, count: comments.length },
        { id: 'friends', name: 'Amigos', desc: 'Sua rede de conexões', icon: Users, count: friends.length },
        { id: 'activity', name: 'Atividade', desc: 'Histórico recente', icon: Activity, count: 0, soon: true }
    ];

    // Profile Themes
    const themes = [
        {
            id: 'cosmic',
            name: 'Cosmic Purple',
            colors: { primary: '#8b5cf6', secondary: '#3b82f6', accent: '#a78bfa' },
            orbs: ['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.1)', 'rgba(167, 139, 250, 0.08)'],
            particle: 'rgba(139, 92, 246, 0.8)',
            ring: ['#8b5cf6', '#3b82f6']
        },
        {
            id: 'neon',
            name: 'Neon Cyberpunk',
            colors: { primary: '#ff00ff', secondary: '#00ffff', accent: '#ff6b9d' },
            orbs: ['rgba(255, 0, 255, 0.15)', 'rgba(0, 255, 255, 0.1)', 'rgba(255, 107, 157, 0.08)'],
            particle: 'rgba(255, 0, 255, 0.8)',
            ring: ['#ff00ff', '#00ffff']
        },
        {
            id: 'sunset',
            name: 'Sunset Fire',
            colors: { primary: '#f59e0b', secondary: '#ef4444', accent: '#fbbf24' },
            orbs: ['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.1)', 'rgba(251, 191, 36, 0.08)'],
            particle: 'rgba(245, 158, 11, 0.8)',
            ring: ['#f59e0b', '#ef4444']
        },
        {
            id: 'ocean',
            name: 'Deep Ocean',
            colors: { primary: '#06b6d4', secondary: '#0ea5e9', accent: '#22d3ee' },
            orbs: ['rgba(6, 182, 212, 0.15)', 'rgba(14, 165, 233, 0.1)', 'rgba(34, 211, 238, 0.08)'],
            particle: 'rgba(6, 182, 212, 0.8)',
            ring: ['#06b6d4', '#0ea5e9']
        },
        {
            id: 'emerald',
            name: 'Emerald Forest',
            colors: { primary: '#10b981', secondary: '#059669', accent: '#34d399' },
            orbs: ['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.1)', 'rgba(52, 211, 153, 0.08)'],
            particle: 'rgba(16, 185, 129, 0.8)',
            ring: ['#10b981', '#059669']
        },
        {
            id: 'bloodmoon',
            name: 'Blood Moon',
            colors: { primary: '#dc2626', secondary: '#991b1b', accent: '#f87171' },
            orbs: ['rgba(220, 38, 38, 0.15)', 'rgba(153, 27, 27, 0.1)', 'rgba(248, 113, 113, 0.08)'],
            particle: 'rgba(220, 38, 38, 0.8)',
            ring: ['#dc2626', '#991b1b']
        }
    ];

    // Selected theme
    const [selectedTheme, setSelectedTheme] = useState('cosmic');
    const currentTheme = themes.find(t => t.id === (userData?.profileTheme || selectedTheme)) || themes[0];

    // Theme CSS variables
    const themeStyle = {
        '--theme-primary': currentTheme.colors.primary,
        '--theme-secondary': currentTheme.colors.secondary,
        '--theme-accent': currentTheme.colors.accent,
        '--theme-orb1': currentTheme.orbs[0],
        '--theme-orb2': currentTheme.orbs[1],
        '--theme-orb3': currentTheme.orbs[2],
        '--theme-particle': currentTheme.particle,
        '--theme-ring1': currentTheme.ring[0],
        '--theme-ring2': currentTheme.ring[1]
    };

    const handleThemeChange = async (themeId) => {
        setSelectedTheme(themeId);
        if (isOwner) {
            try {
                await updateUserData({ profileTheme: themeId });
            } catch (error) {
                console.error('Erro ao salvar tema:', error);
            }
        }
    };

    return (
        <div className={styles.profileHub} style={themeStyle}>
            {/* Animated Background */}
            <div className={styles.bgAnimated}>
                <div className={styles.bgOrb1}></div>
                <div className={styles.bgOrb2}></div>
                <div className={styles.bgOrb3}></div>
            </div>

            {/* Floating Particles */}
            <div className={styles.particles}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.particle}
                        style={{
                            '--x': `${Math.random() * 100}%`,
                            '--delay': `${Math.random() * 10}s`,
                            '--duration': `${15 + Math.random() * 20}s`,
                            '--size': `${2 + Math.random() * 4}px`
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Header Controls */}
                <div className={styles.headerControls}>
                    <button onClick={onBack} className={styles.backBtn}>
                        <ArrowLeft size={18} />
                        <span>Voltar</span>
                    </button>
                    {isOwner && !isEditing && (
                        <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                            <Pencil size={16} />
                            <span>Editar</span>
                        </button>
                    )}
                </div>

                {/* Hero Banner */}
                <div className={styles.heroBanner}>
                    {bannerURL && <img src={bannerURL} alt="Banner" className={styles.bannerImage} />}
                    <div className={styles.bannerOverlay}></div>
                    <div className={styles.bannerPattern}></div>

                    {isEditing && (
                        <label className={styles.bannerEditBtn}>
                            <Camera size={18} />
                            <span>Alterar Capa</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} hidden />
                        </label>
                    )}
                </div>

                {/* Profile Card */}
                <div className={styles.profileCard}>
                    <div className={styles.profileCardGlow}></div>
                    <div className={styles.profileCardScanline}></div>

                    {/* Avatar Section */}
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            <div className={styles.avatarRing}></div>
                            <div className={styles.avatarGlow}></div>
                            {photoURL ? (
                                <img src={photoURL} alt={displayName} className={styles.avatar} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {isEditing && (
                                <label className={styles.avatarEdit}>
                                    <Camera size={20} />
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} hidden />
                                </label>
                            )}
                            <div className={styles.onlineIndicator}></div>
                        </div>

                        {/* User Info */}
                        <div className={styles.userInfo}>
                            {isEditing ? (
                                <div className={styles.editForm}>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Seu nome"
                                        className={styles.editInput}
                                    />
                                    <textarea
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        placeholder="Sua bio"
                                        className={styles.editTextarea}
                                        rows={2}
                                    />

                                    {/* Theme Selector */}
                                    <div className={styles.themeSelector}>
                                        <label className={styles.themeSelectorLabel}>
                                            <Palette size={14} /> Escolha seu Tema
                                        </label>
                                        <div className={styles.themeGrid}>
                                            {themes.map((theme) => (
                                                <button
                                                    key={theme.id}
                                                    className={`${styles.themeOption} ${selectedTheme === theme.id ? styles.themeActive : ''}`}
                                                    onClick={() => handleThemeChange(theme.id)}
                                                    style={{
                                                        '--preview-primary': theme.colors.primary,
                                                        '--preview-secondary': theme.colors.secondary
                                                    }}
                                                >
                                                    <div className={styles.themePreview}>
                                                        <div className={styles.themePreviewOrb}></div>
                                                    </div>
                                                    <span className={styles.themeName}>{theme.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.editActions}>
                                        <button onClick={handleSave} className={styles.saveBtn} disabled={uploading}>
                                            {uploading ? 'Salvando...' : 'Salvar'}
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.nameRow}>
                                        <h1 className={styles.userName}>{displayName}</h1>

                                        {/* Role Badges */}
                                        {userData?.isOwner && (
                                            <span className={`${styles.roleBadge} ${styles.ownerBadge}`}>
                                                <Crown size={12} /> Owner
                                            </span>
                                        )}
                                        {userData?.isAdmin && !userData?.isOwner && (
                                            <span className={`${styles.roleBadge} ${styles.adminBadge}`}>
                                                <Shield size={12} /> Admin
                                            </span>
                                        )}
                                        {userData?.isNMSDev && (
                                            <span className={`${styles.roleBadge} ${styles.nmsDevBadge}`}>
                                                <Rocket size={12} /> NMS Dev
                                            </span>
                                        )}

                                        <span className={styles.levelBadge}>
                                            <Star size={12} /> Nível 1
                                        </span>
                                    </div>
                                    <p className={styles.userBio}>{bio}</p>

                                    <div className={styles.userMeta}>
                                        <span className={styles.metaItem}>
                                            <Calendar size={14} /> Membro desde 2024
                                        </span>
                                        <span className={styles.metaItem}>
                                            <Flame size={14} /> 7 dias de streak
                                        </span>
                                    </div>

                                    {!isOwner && (
                                        <div className={styles.profileActions}>
                                            <FriendshipActions targetUserId={authUser.uid} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className={styles.sectionDivider}>
                    <span className={styles.dividerLabel}>Conteúdo</span>
                    <div className={styles.dividerLine}></div>
                </div>

                {/* Sections Grid */}
                <div className={styles.sectionsGrid}>
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={section.id}
                                className={`${styles.sectionCard} ${section.soon ? styles.sectionDisabled : ''} ${activeSection === section.id ? styles.sectionActive : ''}`}
                                onClick={() => !section.soon && setActiveSection(section.id)}
                            >
                                <div className={styles.sectionCardGlow}></div>
                                <div className={styles.sectionIcon}>
                                    <Icon size={24} />
                                </div>
                                <div className={styles.sectionInfo}>
                                    <h3 className={styles.sectionName}>{section.name}</h3>
                                    <p className={styles.sectionDesc}>{section.desc}</p>
                                </div>
                                <div className={styles.sectionMeta}>
                                    {section.soon ? (
                                        <span className={styles.soonBadge}>Em breve</span>
                                    ) : (
                                        <>
                                            <span className={styles.sectionCount}>{section.count}</span>
                                            <ChevronRight size={16} className={styles.sectionArrow} />
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className={styles.contentArea}>
                    {activeSection === 'posts' && (
                        <UserPostsSection
                            posts={posts}
                            loading={postsLoading}
                            userId={authUser.uid}
                            onPostClick={onNavigateToPost}
                        />
                    )}
                    {activeSection === 'comments' && (
                        <UserCommentsSection
                            comments={comments}
                            loading={commentsLoading}
                            onCommentClick={onNavigateToPost}
                        />
                    )}
                    {activeSection === 'friends' && (
                        <UserFriendsSection
                            friends={friends}
                            loading={friendsLoading}
                            onFriendClick={onUserClick}
                        />
                    )}
                    {activeSection === 'overview' && (
                        <div className={styles.overviewSection}>
                            <div className={styles.welcomeCard}>
                                <div className={styles.welcomeIcon}>
                                    <Sparkles size={32} />
                                </div>
                                <h2>Bem-vindo ao seu perfil!</h2>
                                <p>Selecione uma seção acima para ver seu conteúdo.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
