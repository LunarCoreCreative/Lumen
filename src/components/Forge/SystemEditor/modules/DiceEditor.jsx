import React, { useState } from 'react';
import styles from './DiceEditor.module.css';
import { Dices, Plus, Check } from 'lucide-react';

const STANDARD_DICE = [
    { id: 'd4', name: 'd4', sides: 4, icon: '🔷', color: '#3b82f6' },
    { id: 'd6', name: 'd6', sides: 6, icon: '🎲', color: '#10b981' },
    { id: 'd8', name: 'd8', sides: 8, icon: '🔶', color: '#f59e0b' },
    { id: 'd10', name: 'd10', sides: 10, icon: '🔟', color: '#8b5cf6' },
    { id: 'd12', name: 'd12', sides: 12, icon: '⬢', color: '#ec4899' },
    { id: 'd20', name: 'd20', sides: 20, icon: '🎯', color: '#ef4444' },
    { id: 'd100', name: 'd100', sides: 100, icon: '💯', color: '#06b6d4' }
];

export function DiceEditor({ data, onChange }) {
    const handleToggleDice = (diceId) => {
        const available = data.available || [];
        const newAvailable = available.includes(diceId)
            ? available.filter(d => d !== diceId)
            : [...available, diceId];

        onChange({
            ...data,
            available: newAvailable
        });
    };

    const handleSetPrimary = (diceId) => {
        onChange({
            ...data,
            primary: diceId
        });
    };

    return (
        <div className={styles.diceEditor}>
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <Dices size={32} />
                </div>
                <div>
                    <h2 className={styles.moduleTitle}>Sistema de Dados</h2>
                    <p className={styles.moduleSubtitle}>Escolha quais dados seu sistema utiliza</p>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Dados Padrão</h3>
                <p className={styles.sectionDesc}>
                    Selecione os dados que farão parte do seu sistema. Marque o dado principal (usado por padrão nos testes).
                </p>

                <div className={styles.diceGrid}>
                    {STANDARD_DICE.map(dice => {
                        const isAvailable = (data.available || []).includes(dice.id);
                        const isPrimary = data.primary === dice.id;

                        return (
                            <div
                                key={dice.id}
                                className={`${styles.diceCard} ${isAvailable ? styles.active : ''} ${isPrimary ? styles.primary : ''}`}
                                style={{ '--dice-color': dice.color }}
                                onClick={() => !isAvailable && handleToggleDice(dice.id)}
                            >
                                <div className={styles.diceIcon}>{dice.icon}</div>
                                <div className={styles.diceName}>{dice.name}</div>
                                <div className={styles.diceSides}>{dice.sides} lados</div>

                                {isAvailable && (
                                    <div className={styles.diceActions}>
                                        <button
                                            className={`${styles.primaryBtn} ${isPrimary ? styles.selected : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetPrimary(dice.id);
                                            }}
                                        >
                                            {isPrimary ? (
                                                <>
                                                    <Check size={14} />
                                                    <span>Principal</span>
                                                </>
                                            ) : (
                                                <span>Marcar como Principal</span>
                                            )}
                                        </button>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleDice(dice.id);
                                            }}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                )}

                                {!isAvailable && (
                                    <div className={styles.addOverlay}>
                                        <Plus size={24} />
                                        <span>Adicionar</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {(data.available || []).length > 0 && (
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Dados Habilitados:</span>
                        <span className={styles.summaryValue}>{(data.available || []).length}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Dado Principal:</span>
                        <span className={styles.summaryValue}>{data.primary || 'Nenhum'}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
