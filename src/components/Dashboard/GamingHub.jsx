import React, { useState } from 'react';
import styles from './GamingHub.module.css';
import { Gamepad2, Users, TrendingUp } from 'lucide-react';
import { NoMansSky } from './NoMansSky/NoMansSky';

export function GamingHub({ user }) {
    const [currentView, setCurrentView] = useState('hub'); // 'hub' | 'game'
    const [selectedGame, setSelectedGame] = useState(null);
    const [nmsRecipes, setNmsRecipes] = useState([]); // Estado persistente para receitas do NMS

    // Lista de jogos disponíveis (será expandida futuramente)
    const games = [
        {
            id: 'nomanssky',
            name: "No Man's Sky",
            slug: 'nomanssky',
            description: 'Receitas de refinamento, guias e recursos',
            bannerUrl: '/images/nms-card.jpg',
            logoUrl: null,
            contentCount: 9 + nmsRecipes.length, // Contar receitas customizadas
            color: '#ff4655'
        },
        {
            id: 'minecraft',
            name: 'Minecraft',
            slug: 'minecraft',
            description: 'Mods, plugins e conteúdos exclusivos Lumen',
            bannerUrl: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=800&h=400&fit=crop',
            logoUrl: null,
            contentCount: 0,
            color: '#62c462',
            comingSoon: true
        },
        {
            id: 'projectzomboid',
            name: 'Project Zomboid',
            slug: 'projectzomboid',
            description: 'Guias de sobrevivência e builds',
            bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=400&fit=crop',
            logoUrl: null,
            contentCount: 0,
            color: '#8b0000',
            comingSoon: true
        }
    ];

    const handleGameClick = (game) => {
        if (game.comingSoon) {
            return;
        }
        setSelectedGame(game);
        setCurrentView('game');
    };

    const handleBackToHub = () => {
        setCurrentView('hub');
        setSelectedGame(null);
    };

    const handleAddNmsRecipe = (recipe) => {
        setNmsRecipes([...nmsRecipes, recipe]);
        // TODO: Salvar no Firestore quando implementado
        console.log('Receita adicionada ao estado persistente:', recipe);
    };

    const handleDeleteNmsRecipe = (recipeId) => {
        setNmsRecipes(nmsRecipes.filter(r => r.id !== recipeId));
        // TODO: Deletar do Firestore quando implementado
        console.log('Receita removida do estado persistente:', recipeId);
    };

    // Renderizar view de jogo específico
    if (currentView === 'game' && selectedGame) {
        switch (selectedGame.slug) {
            case 'nomanssky':
                return (
                    <NoMansSky
                        user={user}
                        onBack={handleBackToHub}
                        customRecipes={nmsRecipes}
                        onAddRecipe={handleAddNmsRecipe}
                        onDeleteRecipe={handleDeleteNmsRecipe}
                    />
                );
            default:
                return null;
        }
    }

    // Renderizar hub principal

    return (
        <div className={styles.hubContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <Gamepad2 size={32} />
                    </div>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>Gaming Hub</h1>
                        <p className={styles.subtitle}>
                            Central de conteúdo para gamers da comunidade Lumen
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className={styles.statsBar}>
                <div className={styles.statItem}>
                    <Gamepad2 size={20} />
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{games.length}</span>
                        <span className={styles.statLabel}>Jogos</span>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <Users size={20} />
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>Em Breve</span>
                        <span className={styles.statLabel}>Contribuidores</span>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <TrendingUp size={20} />
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{9 + nmsRecipes.length}</span>
                        <span className={styles.statLabel}>Recursos</span>
                    </div>
                </div>
            </div>

            {/* Games Grid */}
            <div className={styles.gamesSection}>
                <h2 className={styles.sectionTitle}>Jogos Disponíveis</h2>
                <div className={styles.gamesGrid}>
                    {games.map(game => (
                        <div
                            key={game.id}
                            className={`${styles.gameCard} ${game.comingSoon ? styles.comingSoon : ''}`}
                            onClick={() => handleGameClick(game)}
                            style={{ '--game-color': game.color }}
                        >
                            {/* Banner */}
                            <div className={styles.gameBanner}>
                                <img src={game.bannerUrl} alt={game.name} />
                                <div className={styles.bannerOverlay}></div>
                                {game.comingSoon && (
                                    <div className={styles.comingSoonBadge}>
                                        Em Breve
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className={styles.gameContent}>
                                <h3 className={styles.gameName}>{game.name}</h3>
                                <p className={styles.gameDescription}>{game.description}</p>

                                <div className={styles.gameFooter}>
                                    <div className={styles.contentCount}>
                                        <span className={styles.count}>{game.contentCount}</span>
                                        <span className={styles.countLabel}>recursos</span>
                                    </div>
                                    {!game.comingSoon && (
                                        <div className={styles.viewButton}>
                                            Explorar →
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Community Section */}
            <div className={styles.communitySection}>
                <div className={styles.communityCard}>
                    <h3 className={styles.communityTitle}>
                        💡 Sugestões da Comunidade
                    </h3>
                    <p className={styles.communityText}>
                        Quer ver conteúdo de outro jogo? Vote em sugestões ou crie a sua própria!
                    </p>
                    <button className={styles.communityButton} disabled>
                        Ver Fórum de Sugestões (Em Breve)
                    </button>
                </div>
            </div>
        </div>
    );
}
