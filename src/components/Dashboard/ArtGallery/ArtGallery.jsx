import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ArtGallery.module.css';
import { Plus, Search, TrendingUp, Clock, Users, Heart, Grid3X3, LayoutGrid, Filter, X, Image as ImageIcon, Sparkles, Bookmark } from 'lucide-react';
import { ArtCard } from './ArtCard';
import { ArtUploadModal } from './ArtUploadModal';
import { ArtDetail } from './ArtDetail';
import { useArtGallery, artActions } from '../../../hooks/useArtGallery';

const CATEGORIES = [
    { id: 'all', label: 'Todas', icon: Grid3X3 },
    { id: 'saved', label: 'Salvos', icon: Bookmark },
    { id: 'digital', label: 'Arte Digital', icon: Sparkles },
    { id: 'traditional', label: 'Tradicional', icon: ImageIcon },
    { id: 'photography', label: 'Fotografia', icon: ImageIcon },
    { id: '3d', label: '3D / Render', icon: ImageIcon },
    { id: 'pixel', label: 'Pixel Art', icon: ImageIcon },
    { id: 'ui', label: 'UI/UX Design', icon: LayoutGrid },
    { id: 'illustration', label: 'Ilustração', icon: ImageIcon },
    { id: 'fanart', label: 'Fanart', icon: Heart },
];

const SORT_OPTIONS = [
    { id: 'recent', label: 'Recentes', icon: Clock },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'following', label: 'Seguindo', icon: Users },
];

export function ArtGallery({ user, initialArtId, onShowAlert }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedArt, setSelectedArt] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const { arts, loading, hasMore, loadMore, refresh } = useArtGallery({
        category: selectedCategory,
        sortBy,
        searchQuery,
        userId: user?.uid
    });

    const observerRef = useRef();
    const lastArtRef = useCallback(node => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observerRef.current.observe(node);
    }, [loading, hasMore, loadMore]);

    // Carregar arte inicial se houver ID
    useEffect(() => {
        const loadInitialArt = async () => {
            if (initialArtId) {
                // Tenta achar na lista carregada primeiro
                const found = arts.find(a => a.id === initialArtId);
                if (found) {
                    setSelectedArt(found);
                } else {
                    // Se não, busca no servidor
                    try {
                        const art = await artActions.getArtById(initialArtId);
                        if (art) {
                            setSelectedArt(art);
                        }
                    } catch (error) {
                        console.error("Erro ao carregar arte inicial:", error);
                    }
                }
            }
        };
        loadInitialArt();
    }, [initialArtId]); // Removi 'arts' das dependências para evitar loops ou re-renderizações desnecessárias. Se não achar na lista inicial, busca no servidor.

    const handleArtClick = (art) => {
        setSelectedArt(art);
    };

    const handleUploadSuccess = () => {
        setShowUploadModal(false);
        refresh();
    };

    return (
        <div className={styles.container}>
            {/* Background */}
            <div className={styles.background}>
                <div className={styles.bgOrb1}></div>
                <div className={styles.bgOrb2}></div>
            </div>

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>
                        <Sparkles className={styles.titleIcon} />
                        Galeria Criativa
                    </h1>
                    <p className={styles.subtitle}>Explore e compartilhe arte e portfólios</p>
                </div>

                <div className={styles.headerActions}>
                    {/* Search */}
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar artes, artistas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button
                                className={styles.clearSearch}
                                onClick={() => setSearchQuery('')}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <button
                        className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                    </button>

                    {/* Upload Button */}
                    <button
                        className={styles.uploadBtn}
                        onClick={() => setShowUploadModal(true)}
                    >
                        <Plus size={20} />
                        <span>Publicar</span>
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            {showFilters && (
                <div className={styles.filtersBar}>
                    {/* Categories */}
                    <div className={styles.categories}>
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <Icon size={16} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort Options */}
                    <div className={styles.sortOptions}>
                        {SORT_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    className={`${styles.sortBtn} ${sortBy === opt.id ? styles.active : ''}`}
                                    onClick={() => setSortBy(opt.id)}
                                >
                                    <Icon size={16} />
                                    <span>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Gallery Grid (Masonry) */}
            <div className={styles.galleryWrapper}>
                {loading && arts.length === 0 ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Carregando galeria...</p>
                    </div>
                ) : arts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <ImageIcon size={48} />
                        </div>
                        <h3>Nenhuma arte encontrada</h3>
                        <p>Seja o primeiro a compartilhar sua criatividade!</p>
                        <button
                            className={styles.emptyBtn}
                            onClick={() => setShowUploadModal(true)}
                        >
                            <Plus size={18} />
                            Publicar Arte
                        </button>
                    </div>
                ) : (
                    <div className={styles.masonryGrid}>
                        {arts.map((art, index) => (
                            <div
                                key={art.id}
                                ref={index === arts.length - 1 ? lastArtRef : null}
                            >
                                <ArtCard
                                    art={art}
                                    currentUser={user}
                                    onClick={() => handleArtClick(art)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {loading && arts.length > 0 && (
                    <div className={styles.loadingMore}>
                        <div className={styles.spinnerSmall}></div>
                    </div>
                )}
            </div>

            {/* FAB for mobile */}
            <button
                className={styles.fab}
                onClick={() => setShowUploadModal(true)}
            >
                <Plus size={24} />
            </button>

            {/* Upload Modal */}
            {showUploadModal && (
                <ArtUploadModal
                    user={user}
                    categories={CATEGORIES.filter(c => c.id !== 'all')}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {/* Art Detail Modal */}
            {selectedArt && (
                <ArtDetail
                    art={selectedArt}
                    currentUser={user}
                    onClose={() => setSelectedArt(null)}
                    onShowAlert={onShowAlert}
                />
            )}
        </div>
    );
}
