import React from 'react';
import styles from './EditorSidebar.module.css';
import { Info, Zap, Dices, BookOpen, TrendingUp, Swords, Grid3x3, Check } from 'lucide-react';

export function EditorSidebar({ currentStep, onStepChange, systemData }) {
    const steps = [
        {
            id: 0,
            icon: Info,
            label: 'Informações',
            shortLabel: 'Info',
            color: '#3b82f6',
            isComplete: systemData.metadata.name !== ''
        },
        {
            id: 1,
            icon: Zap,
            label: 'Atributos',
            shortLabel: 'Attrs',
            color: '#8b5cf6',
            isComplete: systemData.attributes.length > 0
        },
        {
            id: 2,
            icon: Dices,
            label: 'Dados',
            shortLabel: 'Dice',
            color: '#10b981',
            isComplete: systemData.dice.available.length > 0
        },
        {
            id: 3,
            icon: BookOpen,
            label: 'Habilidades',
            shortLabel: 'Skills',
            color: '#06b6d4',
            isComplete: systemData.skills.length > 0
        },
        {
            id: 4,
            icon: TrendingUp,
            label: 'Progressão',
            shortLabel: 'Prog',
            color: '#f59e0b',
            isComplete: systemData.progression.type !== null
        },
        {
            id: 5,
            icon: Swords,
            label: 'Combate',
            shortLabel: 'Combat',
            color: '#ef4444',
            isComplete: systemData.combat.enabled,
            optional: true
        },
        {
            id: 6,
            icon: Grid3x3,
            label: 'Customizado',
            shortLabel: 'Custom',
            color: '#ec4899',
            isComplete: systemData.customSections.length > 0,
            optional: true
        }
    ];

    return (
        <div className={styles.editorSidebar}>
            <div className={styles.sidebarHeader}>
                <h3>Blueprint</h3>
                <div className={styles.progress}>
                    <span>{steps.filter(s => s.isComplete).length}</span>
                    <span className={styles.separator}>/</span>
                    <span>{steps.filter(s => !s.optional).length}</span>
                </div>
            </div>

            <nav className={styles.stepsNav}>
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isAccessible = true; // Permitir acesso livre durante desenvolvimento

                    return (
                        <button
                            key={step.id}
                            className={`${styles.stepItem} ${isActive ? styles.active : ''} ${!isAccessible ? styles.locked : ''}`}
                            onClick={() => isAccessible && onStepChange(step.id)}
                            disabled={!isAccessible}
                            style={{ '--step-color': step.color }}
                        >
                            <div className={styles.stepNumber}>
                                {step.isComplete ? (
                                    <Check size={14} className={styles.checkIcon} />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>

                            <div className={styles.stepIcon}>
                                <Icon size={20} />
                            </div>

                            <div className={styles.stepContent}>
                                <div className={styles.stepLabel}>{step.label}</div>
                                {step.optional && (
                                    <div className={styles.stepBadge}>Opcional</div>
                                )}
                            </div>

                            <div className={styles.stepIndicator}></div>
                        </button>
                    );
                })}
            </nav>

            <div className={styles.sidebarFooter}>
                <div className={styles.tipCard}>
                    <div className={styles.tipIcon}>💡</div>
                    <p className={styles.tipText}>
                        Preencha os módulos obrigatórios para publicar seu sistema
                    </p>
                </div>
            </div>
        </div>
    );
}
