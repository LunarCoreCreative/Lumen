import React, { useState, useEffect } from 'react';
import styles from './GamingHub.module.css';
import { Gamepad2, Users, TrendingUp, Sparkles, Zap, Trophy, Rocket, ChevronRight, Star, Clock, Flame } from 'lucide-react';
import { NoMansSky } from './NoMansSky/NoMansSky';
import { subscribeToRecipes } from './NoMansSky/recipeService';

export function GamingHub({ user }) {
    const [currentView, setCurrentView] = useState('hub');
    const [selectedGame, setSelectedGame] = useState(null);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [nmsRecipeCount, setNmsRecipeCount] = useState(0);

    // Buscar contagem de receitas do Firebase
    useEffect(() => {
        const unsubscribe = subscribeToRecipes((recipes) => {
            setNmsRecipeCount(recipes.length);
        });
        return () => unsubscribe();
    }, []);

    // Lista de jogos disponíveis
    const games = [
        {
            id: 'nomanssky',
            name: "No Man's Sky",
            slug: 'nomanssky',
            description: 'Receitas de refinamento, guias e recursos para explorar o universo infinito.',
            bannerUrl: '/images/nms-card.jpg',
            contentCount: nmsRecipeCount,
            color: '#ff4655',
            gradient: 'linear-gradient(135deg, #ff4655, #ff6b7a)',
            tags: ['Exploração', 'Crafting', 'Survival']
        },
        {
            id: 'minecraft',
            name: 'Minecraft',
            slug: 'minecraft',
            description: 'Mods, plugins e conteúdos exclusivos para sua experiência Minecraft.',
            bannerUrl: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=800&h=400&fit=crop',
            contentCount: 0,
            color: '#62c462',
            gradient: 'linear-gradient(135deg, #62c462, #8dd58d)',
            tags: ['Sandbox', 'Mods', 'Criativo'],
            comingSoon: true
        },
        {
            id: 'projectzomboid',
            name: 'Project Zomboid',
            slug: 'projectzomboid',
            description: 'Guias de sobrevivência, builds e estratégias para o apocalipse.',
            bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=400&fit=crop',
            contentCount: 0,
            color: '#8b0000',
            gradient: 'linear-gradient(135deg, #8b0000, #b22222)',
            tags: ['Survival', 'Horror', 'Estratégia'],
            comingSoon: true
        }
    ];

    const stats = {
        totalGames: games.length,
        activeGames: games.filter(g => !g.comingSoon).length,
        totalResources: nmsRecipeCount
    };

    const handleGameClick = (game) => {
        if (game.comingSoon) return;
        setSelectedGame(game);
        setCurrentView('game');
    };

    const handleBackToHub = () => {
        setCurrentView('hub');
        setSelectedGame(null);
    };

    // View de jogo específico
    if (currentView === 'game' && selectedGame) {
        if (selectedGame.slug === 'nomanssky') {
            return (
                <NoMansSky
                    user={user}
                    onBack={handleBackToHub}
                />
            );
        }
        return null;
    }


    const featuredGame = games[0]; // NMS como featured

    return (
        <div className={styles.hubContainer}>
            {/* Ambient Background */}
            <div className={styles.ambientBg}>
                <div className={styles.ambientOrb1}></div>
                <div className={styles.ambientOrb2}></div>
            </div>

            {/* Floating Particles */}
            <div className={styles.particles}>
                {[...Array(15)].map((_, i) => (
                    <div key={i} className={styles.particle} style={{
                        '--delay': `${i * 0.5}s`,
                        '--duration': `${20 + Math.random() * 10}s`,
                        '--x': `${Math.random() * 100}%`,
                        '--size': `${3 + Math.random() * 3}px`
                    }}></div>
                ))}
            </div>

            <div className={styles.content}>
                {/* Compact Header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.logoMark}>
                            <Gamepad2 size={24} />
                        </div>
                        <div>
                            <h1 className={styles.headerTitle}>Gaming Hub</h1>
                            <p className={styles.headerSubtitle}>Recursos exclusivos para gamers</p>
                        </div>
                    </div>
                    <div className={styles.quickStats}>
                        <div className={styles.quickStat}>
                            <Flame size={16} />
                            <span>{stats.activeGames} ativo</span>
                        </div>
                        <div className={styles.quickStat}>
                            <Star size={16} />
                            <span>{stats.totalResources} recursos</span>
                        </div>
                    </div>
                </header>

                {/* Featured Game - Hero Card */}
                <section className={styles.featuredSection}>
                    <div
                        className={styles.featuredCard}
                        style={{ '--accent': featuredGame.color }}
                        onClick={() => handleGameClick(featuredGame)}
                    >
                        <div className={styles.featuredImage}>
                            <img src={featuredGame.bannerUrl} alt={featuredGame.name} />
                            <div className={styles.featuredOverlay}></div>
                        </div>
                        <div className={styles.featuredContent}>
                            <div className={styles.featuredBadge}>
                                <Sparkles size={14} />
                                Em Destaque
                            </div>
                            <h2 className={styles.featuredTitle}>{featuredGame.name}</h2>
                            <p className={styles.featuredDesc}>{featuredGame.description}</p>
                            <div className={styles.featuredMeta}>
                                <div className={styles.featuredTags}>
                                    {featuredGame.tags.map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                                <div className={styles.featuredStats}>
                                    <span className={styles.resourceCount}>
                                        <Trophy size={16} />
                                        {featuredGame.contentCount} recursos
                                    </span>
                                </div>
                            </div>
                            <button className={styles.featuredCta}>
                                Explorar <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className={styles.featuredGlow}></div>
                    </div>
                </section>

                {/* Games Grid - Horizontal Scroll */}
                <section className={styles.gamesSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <Gamepad2 size={22} />
                            Todos os Jogos
                        </h2>
                        <span className={styles.gameCount}>{games.length} jogos</span>
                    </div>

                    <div className={styles.gamesScroll}>
                        {games.slice(1).map(game => (
                            <div
                                key={game.id}
                                className={`${styles.gameCard} ${game.comingSoon ? styles.comingSoon : ''}`}
                                style={{ '--accent': game.color }}
                                onClick={() => handleGameClick(game)}
                            >
                                <div className={styles.gameImage}>
                                    <img src={game.bannerUrl} alt={game.name} />
                                    <div className={styles.gameImageOverlay}></div>
                                    {game.comingSoon && (
                                        <div className={styles.comingSoonTag}>
                                            <Clock size={12} />
                                            Em Breve
                                        </div>
                                    )}
                                </div>
                                <div className={styles.gameInfo}>
                                    <h3 className={styles.gameName}>{game.name}</h3>
                                    <p className={styles.gameDesc}>{game.description}</p>
                                    <div className={styles.gameMeta}>
                                        <div className={styles.gameTags}>
                                            {game.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className={styles.miniTag}>{tag}</span>
                                            ))}
                                        </div>
                                        {!game.comingSoon && (
                                            <span className={styles.exploreLink}>
                                                Ver mais <ChevronRight size={14} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.cardAccent}></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Community CTA - Compact */}
                <section className={styles.ctaSection}>
                    <div className={styles.ctaCard}>
                        <div className={styles.ctaIcon}>
                            <Users size={28} />
                        </div>
                        <div className={styles.ctaContent}>
                            <h3 className={styles.ctaTitle}>Contribua com a Comunidade</h3>
                            <p className={styles.ctaText}>
                                Em breve você poderá sugerir novos jogos e contribuir com conteúdo!
                            </p>
                        </div>
                        <div className={styles.ctaStatus}>
                            <div className={styles.statusDot}></div>
                            <span>Em desenvolvimento</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
