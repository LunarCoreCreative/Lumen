import React from 'react';
import styles from './EditorPreview.module.css';
import { Eye, Maximize2 } from 'lucide-react';

export function EditorPreview({ systemData }) {
    // Formatar números grandes (1000 -> 1K, 1000000 -> 1M)
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
        return num;
    };

    return (
        <div className={styles.editorPreview}>
            <div className={styles.previewHeader}>
                <div className={styles.headerTitle}>
                    <Eye size={18} />
                    <span>Preview</span>
                </div>
                <button className={styles.expandBtn}>
                    <Maximize2 size={16} />
                </button>
            </div>

            <div className={styles.previewContent}>
                <div className={styles.characterSheet}>
                    {/* Header da Ficha */}
                    <div className={styles.sheetHeader}>
                        <div className={styles.sheetIcon}>{systemData.metadata.icon}</div>
                        <div className={styles.sheetTitle}>
                            <h2>{systemData.metadata.name || 'Nome do Personagem'}</h2>
                            <p className={styles.systemName}>
                                Sistema: {systemData.metadata.name || 'Sem nome'}
                            </p>
                        </div>
                    </div>

                    {/* Atributos Preview */}
                    {systemData.attributes.length > 0 ? (
                        <div className={styles.sheetSection}>
                            <h3 className={styles.sectionTitle}>Atributos</h3>
                            <div className={styles.attributesGrid}>
                                {systemData.attributes.map(attr => {
                                    // Renderizar baseado no tipo de atributo
                                    const renderValue = () => {
                                        switch (attr.attributeType) {
                                            case 'pool':
                                                // Recurso/Pool: 100/100 ou 10/10K
                                                const current = attr.default || 10;
                                                const max = attr.max || current;
                                                const fontSize = (current > 999 || max > 999) ? '1.2rem' : '1.5rem';

                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize, fontWeight: 700 }}>
                                                        <span style={{ color: '#a78bfa' }}>{formatNumber(current)}</span>
                                                        <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 400 }}>/</span>
                                                        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: fontSize === '1.2rem' ? '1rem' : '1.2rem' }}>{formatNumber(max)}</span>
                                                    </div>
                                                );

                                            case 'dice_pool':
                                                // Dice Pool: 5d6
                                                const diceCount = attr.default || 1;
                                                const diceType = attr.diceType || 'd6';
                                                return (
                                                    <div className={styles.dicePoolValue}>
                                                        🎲 {diceCount}{diceType}
                                                    </div>
                                                );

                                            case 'progress_bar':
                                                // Barra de Progresso
                                                const value = attr.default || 0;
                                                const maxValue = attr.max || 100;
                                                const percentage = (value / maxValue) * 100;
                                                return (
                                                    <div className={styles.progressBarContainer}>
                                                        <div className={styles.progressBarValue}>{formatNumber(value)}/{formatNumber(maxValue)}</div>
                                                        <div className={styles.progressBar}>
                                                            <div
                                                                className={styles.progressBarFill}
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    background: `linear-gradient(90deg, ${attr.color || '#8b5cf6'}, ${attr.color || '#8b5cf6'}80)`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );

                                            default:
                                                // Numérico: 12 ou 1.5K
                                                const numValue = attr.default || 10;
                                                const numFontSize = numValue > 999 ? '1.5rem' : '2rem';
                                                return (
                                                    <div className={styles.numericValue} style={{ fontSize: numFontSize }}>
                                                        {formatNumber(numValue)}
                                                    </div>
                                                );
                                        }
                                    };

                                    return (
                                        <div
                                            key={attr.id}
                                            className={styles.attributeCard}
                                            style={{
                                                borderColor: attr.color || '#8b5cf6',
                                                boxShadow: `0 0 20px ${attr.color || '#8b5cf6'}40`
                                            }}
                                        >
                                            <div className={styles.attrLabel} style={{ color: attr.color || '#8b5cf6' }}>
                                                {attr.shortName || attr.name || 'Sem nome'}
                                            </div>
                                            <div
                                                className={styles.attrValue}
                                                style={{
                                                    background: `linear-gradient(135deg, ${attr.color || '#8b5cf6'}30, ${attr.color || '#8b5cf6'}10)`
                                                }}
                                            >
                                                {renderValue()}
                                            </div>
                                            {attr.showModifier !== false && attr.attributeType === 'numeric' && (
                                                <div className={styles.attrModifier} style={{ color: attr.color || '#8b5cf6' }}>
                                                    Mod: {attr.modifierPreview || '+0'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>💡 Configure atributos no editor</p>
                        </div>
                    )}

                    {/* Skills Preview */}
                    {systemData.skills.length > 0 && (
                        <div className={styles.sheetSection}>
                            <h3 className={styles.sectionTitle}>Habilidades</h3>
                            <div className={styles.skillsList}>
                                {systemData.skills.map(skill => (
                                    <div key={skill.id} className={styles.skillItem}>
                                        <span>{skill.name}</span>
                                        <span className={styles.skillBonus}>+0</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info adicional */}
                    <div className={styles.sheetFooter}>
                        <div className={styles.footerInfo}>
                            <span>🎲 Dados: {systemData.dice.primary}</span>
                            <span>📊 Progressão: {systemData.progression.type}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
