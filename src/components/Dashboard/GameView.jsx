import React, { useState } from 'react';
import styles from './GameView.module.css';
import { ArrowLeft, Search, Filter, Plus, Sparkles, Rocket } from 'lucide-react';
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
    const { isAdmin, loading } = useIsAdmin(user?.uid);

    return (
        <div className={styles.gameViewContainer}>
            {/* Ambient Background */}
            <div className={styles.ambientBg}>
                <div className={styles.ambientOrb1} style={{ '--accent': game.color }}></div>
                <div className={styles.ambientOrb2} style={{ '--accent': game.color }}></div>
            </div>

            {/* Floating Particles */}
            <div className={styles.particles}>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={styles.particle} style={{
                        '--delay': `${i * 0.4}s`,
                        '--duration': `${18 + Math.random() * 8}s`,
                        '--x': `${Math.random() * 100}%`,
                        '--size': `${2 + Math.random() * 3}px`,
                        '--accent': game.color
                    }}></div>
                ))}
            </div>

            {/* Hero Header */}
            <header className={styles.header}>
                <div
                    className={styles.heroBanner}
                    style={{ backgroundImage: `url(${game.bannerUrl})` }}
                >
                    <div className={styles.heroOverlay}></div>

                    {/* Back Button */}
                    <button className={styles.backButton} onClick={onBack}>
                        <ArrowLeft size={18} />
                        <span>Voltar ao Hub</span>
                    </button>

                    {/* Hero Content */}
                    <div className={styles.heroContent}>
                        <div className={styles.heroMeta}>
                            <span className={styles.heroBadge} style={{ '--accent': game.color }}>
                                <Rocket size={14} />
                                Recursos Exclusivos
                            </span>
                        </div>
                        <h1 className={styles.heroTitle}>{game.name}</h1>
                        <p className={styles.heroSubtitle}>{game.description}</p>
                    </div>
                </div>
            </header>

            {/* Sticky Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar receitas, materiais..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.toolbarActions}>
                    <button
                        className={`${styles.toolbarBtn} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} />
                        <span>Filtros</span>
                    </button>

                    {!loading && isAdmin && showAddButton && onAddContent && (
                        <button
                            className={styles.addBtn}
                            onClick={onAddContent}
                            style={{ '--accent': game.color }}
                        >
                            <Plus size={18} />
                            <span>Adicionar Conteúdo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <main className={styles.content}>
                {React.Children.map(children, child =>
                    React.cloneElement(child, { searchQuery, showFilters, isAdmin, gameColor: game.color })
                )}
            </main>
        </div>
    );
}
