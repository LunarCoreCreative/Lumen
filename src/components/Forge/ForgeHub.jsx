import React, { useState } from 'react';
import styles from './ForgeHub.module.css';
import { Dices, Scroll, Map, Swords, Sparkles, TrendingUp, Zap, Shield, BookOpen, Users, Crown } from 'lucide-react';
import { MastersArea } from './MastersArea';
import { PlayerArea } from './PlayerArea';

export function ForgeHub({ user }) {
    const [editorView, setEditorView] = useState(null); // null | 'masters' | 'characters' | etc

    // Se estiver em uma view específica, renderiza o componente apropriado
    if (editorView === 'masters') {
        return <MastersArea user={user} onBack={() => setEditorView(null)} />;
    }

    if (editorView === 'characters') {
        return <PlayerArea user={user} onBack={() => setEditorView(null)} />;
    }

    // Mock de estatísticas (para versão futura com dados reais)
    const stats = {
        campaigns: 0,
        characters: 0,
        systems: 0,
        sessions: 0
    };

    const features = [
        {
            id: 'masters',
            icon: Crown,
            title: 'Área dos Mestres',
            description: 'Gerencie seus sistemas de RPG, crie campanhas e domine as ferramentas de narração.',
            color: '#fbbf24',
            gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            accentColor: '#fbbf24',
            comingSoon: false,
            pattern: 'dice',
            onClick: () => setEditorView('masters')
        },
        {
            id: 'characters',
            icon: Scroll,
            title: 'Fichas de Personagem',
            description: 'Fichas dinâmicas que se adaptam automaticamente ao sistema criado pelo mestre.',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            accentColor: '#60a5fa',
            comingSoon: false,
            pattern: 'lines',
            onClick: () => setEditorView('characters')
        },
        {
            id: 'campaigns',
            icon: Map,
            title: 'Campanhas',
            description: 'Gerencie mundos, sessões e histórias épicas. Convide jogadores e organize sua narrativa.',
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            accentColor: '#fbbf24',
            comingSoon: true,
            pattern: 'dots'
        },
        {
            id: 'table',
            icon: Swords,
            title: 'Mesa Virtual',
            description: 'Ferramentas para sessões ao vivo: rolador de dados, chat, iniciativa e muito mais.',
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            accentColor: '#f87171',
            comingSoon: true,
            pattern: 'grid'
        }
    ];

    return (
        <div className={styles.forgeHub}>
            {/* Animated Background */}
            <div className={styles.bgAnimated}>
                <div className={styles.bgGradient1}></div>
                <div className={styles.bgGradient2}></div>
                <div className={styles.bgGradient3}></div>
            </div>

            {/* Particles */}
            <div className={styles.particles}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={styles.particle} style={{
                        '--delay': `${i * 0.3}s`,
                        '--duration': `${15 + Math.random() * 10}s`,
                        '--x': `${Math.random() * 100}%`,
                        '--size': `${2 + Math.random() * 4}px`
                    }}></div>
                ))}
            </div>

            <div className={styles.content}>
                {/* Hero Section Ultra */}
                <div className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroIconsWrapper}>
                            <Sparkles className={styles.heroIcon} size={32} />
                            <Zap className={styles.heroIcon} size={28} style={{ animationDelay: '0.2s' }} />
                            <Shield className={styles.heroIcon} size={30} style={{ animationDelay: '0.4s' }} />
                        </div>
                        <h1 className={styles.heroTitle}>
                            <span className={styles.heroTitleMain}>RPG</span>
                            <span className={styles.heroTitleGradient}>FORGE</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            A plataforma definitiva para criar, jogar e gerenciar RPGs de mesa
                        </p>
                        <div className={styles.heroTags}>
                            <span className={styles.heroTag}><BookOpen size={14} /> Infinitamente Personalizável</span>
                            <span className={styles.heroTag}><Users size={14} /> Multiplayer</span>
                            <span className={styles.heroTag}><Zap size={14} /> Tempo Real</span>
                        </div>
                    </div>
                </div>

                {/* Estatísticas Premium */}
                <div className={styles.statsSection}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📚</div>
                            <div className={styles.statValue}>
                                <span className={styles.statNumber}>{stats.campaigns}</span>
                                <span className={styles.statIncrement}>+0</span>
                            </div>
                            <div className={styles.statLabel}>Campanhas Ativas</div>
                            <div className={styles.statBar}>
                                <div className={styles.statBarFill} style={{ '--width': '0%' }}></div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>⚔️</div>
                            <div className={styles.statValue}>
                                <span className={styles.statNumber}>{stats.characters}</span>
                                <span className={styles.statIncrement}>+0</span>
                            </div>
                            <div className={styles.statLabel}>Personagens Criados</div>
                            <div className={styles.statBar}>
                                <div className={styles.statBarFill} style={{ '--width': '0%' }}></div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🎲</div>
                            <div className={styles.statValue}>
                                <span className={styles.statNumber}>{stats.systems}</span>
                                <span className={styles.statIncrement}>+0</span>
                            </div>
                            <div className={styles.statLabel}>Sistemas Forjados</div>
                            <div className={styles.statBar}>
                                <div className={styles.statBarFill} style={{ '--width': '0%' }}></div>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🗡️</div>
                            <div className={styles.statValue}>
                                <span className={styles.statNumber}>{stats.sessions}</span>
                                <span className={styles.statIncrement}>+0</span>
                            </div>
                            <div className={styles.statLabel}>Sessões Jogadas</div>
                            <div className={styles.statBar}>
                                <div className={styles.statBarFill} style={{ '--width': '0%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards Premium 3D */}
                <div className={styles.featuresSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Ferramentas Épicas</h2>
                        <p className={styles.sectionSubtitle}>Cada módulo foi pensado para máxima flexibilidade</p>
                    </div>
                    <div className={styles.featuresGrid}>
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.id}
                                    className={`${styles.featureCard} ${feature.comingSoon ? styles.comingSoon : ''}`}
                                    style={{
                                        '--feature-color': feature.color,
                                        '--feature-gradient': feature.gradient,
                                        '--feature-accent': feature.accentColor,
                                        '--card-index': index
                                    }}
                                    onClick={feature.onClick || null}
                                >
                                    {/* Background Pattern */}
                                    <div className={`${styles.cardPattern} ${styles[`pattern${feature.pattern}`]}`}></div>

                                    {/* Glow Effect */}
                                    <div className={styles.cardGlow}></div>

                                    {/* Coming Soon Badge */}
                                    {feature.comingSoon && (
                                        <div className={styles.comingSoonBadge}>
                                            <TrendingUp size={12} />
                                            <span>Em Breve</span>
                                        </div>
                                    )}

                                    {/* Card Content */}
                                    <div className={styles.cardContent}>
                                        <div className={styles.featureIconWrapper}>
                                            <div className={styles.iconBg}></div>
                                            <Icon className={styles.featureIcon} size={48} />
                                        </div>
                                        <h3 className={styles.featureTitle}>{feature.title}</h3>
                                        <p className={styles.featureDescription}>{feature.description}</p>

                                        {/* Fake Progress Bar */}
                                        <div className={styles.featureProgress}>
                                            <div className={styles.progressLabel}>
                                                <span>Desenvolvimento</span>
                                                <span>0%</span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div className={styles.progressFill} style={{ '--progress': '0%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corner Accent */}
                                    <div className={styles.cardCorner}></div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA Premium */}
                <div className={styles.ctaSection}>
                    <div className={styles.ctaContent}>
                        <div className={styles.ctaIcon}>
                            <Sparkles size={40} />
                        </div>
                        <h2 className={styles.ctaTitle}>A Jornada Está Apenas Começando</h2>
                        <p className={styles.ctaText}>
                            Estamos forjando ferramentas revolucionárias que permitirão criar universos infinitos.
                            Em breve você terá o poder de materializar qualquer sistema de RPG que imaginar.
                        </p>
                        <div className={styles.ctaBadges}>
                            <div className={styles.ctaBadge}>
                                <div className={styles.badgeDot}></div>
                                <span>🔨 Em Desenvolvimento Ativo</span>
                            </div>
                            <div className={styles.ctaBadge}>
                                <div className={styles.badgeDot}></div>
                                <span>✨ Atualizações Frequentes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

