import React from 'react';
import styles from './NMSHub.module.css';
import { Beaker, BookOpen, Lightbulb, Map, ChevronRight, Sparkles, Zap, Database } from 'lucide-react';

export function NMSHub({ onNavigate, recipeCount = 0 }) {
    const featuredSection = {
        id: 'recipes',
        name: 'Receitas de Refinamento',
        description: 'Todas as receitas de refinamento, processamento e crafting. Otimize sua produção e maximize recursos.',
        icon: Beaker,
        count: recipeCount,
        available: true,
        gradient: 'linear-gradient(135deg, #ff4655 0%, #ff6b7a 50%, #ff4655 100%)'
    };

    const otherSections = [
        {
            id: 'guides',
            name: 'Guias',
            description: 'Guias completos sobre mecânicas e progressão',
            icon: BookOpen,
            count: 0,
            available: false
        },
        {
            id: 'tips',
            name: 'Dicas & Truques',
            description: 'Dicas úteis para melhorar sua experiência',
            icon: Lightbulb,
            count: 0,
            available: false
        },
        {
            id: 'maps',
            name: 'Localizações',
            description: 'Pontos de interesse e recursos raros',
            icon: Map,
            count: 0,
            available: false
        }
    ];

    const FeaturedIcon = featuredSection.icon;

    return (
        <div className={styles.hubContainer}>
            {/* Stats Bar */}
            <div className={styles.statsBar}>
                <div className={styles.statItem}>
                    <Database size={16} />
                    <span>{recipeCount} registros</span>
                </div>
                <div className={styles.statItem}>
                    <Zap size={16} />
                    <span>Sistema Ativo</span>
                </div>
            </div>

            {/* Featured Card */}
            <div
                className={styles.featuredCard}
                onClick={() => onNavigate('recipes')}
            >
                <div className={styles.featuredGlow}></div>
                <div className={styles.featuredScanline}></div>

                <div className={styles.featuredContent}>
                    <div className={styles.featuredIcon}>
                        <FeaturedIcon size={48} />
                    </div>

                    <div className={styles.featuredInfo}>
                        <div className={styles.featuredBadge}>
                            <Sparkles size={12} />
                            <span>Principal</span>
                        </div>
                        <h2 className={styles.featuredTitle}>{featuredSection.name}</h2>
                        <p className={styles.featuredDescription}>{featuredSection.description}</p>

                        <div className={styles.featuredMeta}>
                            <span className={styles.featuredCount}>
                                {featuredSection.count} {featuredSection.count === 1 ? 'receita' : 'receitas'}
                            </span>
                            <span className={styles.featuredAction}>
                                Acessar <ChevronRight size={16} />
                            </span>
                        </div>
                    </div>
                </div>

                <div className={styles.featuredPattern}></div>
            </div>

            {/* Section Title */}
            <div className={styles.sectionDivider}>
                <span className={styles.sectionTitle}>Mais Conteúdo</span>
                <div className={styles.sectionLine}></div>
            </div>

            {/* Other Sections Grid */}
            <div className={styles.sectionsGrid}>
                {otherSections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.id}
                            className={`${styles.sectionCard} ${!section.available ? styles.sectionCardDisabled : ''}`}
                            onClick={() => section.available && onNavigate(section.id)}
                        >
                            <div className={styles.sectionIcon}>
                                <Icon size={24} />
                            </div>

                            <div className={styles.sectionContent}>
                                <h3 className={styles.sectionName}>{section.name}</h3>
                                <p className={styles.sectionDescription}>{section.description}</p>
                            </div>

                            {!section.available && (
                                <span className={styles.comingSoonBadge}>
                                    Em breve
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
