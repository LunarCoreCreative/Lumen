import React, { useState } from 'react';
import styles from './GameView.module.css';
import { ArrowLeft, Search, Filter, Plus } from 'lucide-react';
import { useIsAdmin } from '../../hooks/useIsAdmin';

export function GameView({
    game,
    user,
    onBack,
    children,
    showAddButton = false,
    onAddContent = null
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Buscar status de admin do Firestore
    const { isAdmin, loading } = useIsAdmin(user?.uid);

    return (
        <div className={styles.gameViewContainer}>
            {/* Header com Banner */}
            <div className={styles.header}>
                <div
                    className={styles.banner}
                    style={{ backgroundImage: `url(${game.bannerUrl})` }}
                >
                    <div className={styles.bannerOverlay}></div>
                    <div className={styles.bannerContent}>
                        <button className={styles.backButton} onClick={onBack}>
                            <ArrowLeft size={20} />
                            Voltar ao Hub
                        </button>

                        <div className={styles.gameInfo}>
                            <h1 className={styles.gameName}>{game.name}</h1>
                            <p className={styles.gameDescription}>{game.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBar}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.toolbarActions}>
                    <button
                        className={styles.filterButton}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={20} />
                        Filtros
                    </button>

                    {!loading && isAdmin && showAddButton && onAddContent && (
                        <button
                            className={styles.addButton}
                            onClick={onAddContent}
                        >
                            <Plus size={20} />
                            Adicionar Conteúdo
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className={styles.content}>
                {/* Passar searchQuery, showFilters e isAdmin para os children */}
                {React.Children.map(children, child =>
                    React.cloneElement(child, { searchQuery, showFilters, isAdmin })
                )}
            </div>
        </div>
    );
}
