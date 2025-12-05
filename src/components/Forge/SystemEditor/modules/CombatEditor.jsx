import React, { useState } from 'react';
import styles from './CombatEditor.module.css';
import { Swords, Shield, Zap, Clock, Target, Settings, ToggleLeft, ToggleRight, Plus, Trash2, Info } from 'lucide-react';

const INITIATIVE_TYPES = [
    { id: 'attribute', name: 'Baseado em Atributo', icon: '⚡', description: 'Atributo + dado (ex: DEX + d20)' },
    { id: 'roll', name: 'Apenas Dado', icon: '🎲', description: 'Rolagem simples sem modificador' },
    { id: 'fixed', name: 'Valor Fixo', icon: '📊', description: 'Ordem baseada em valor estático' },
    { id: 'popcorn', name: 'Popcorn/Narrative', icon: '🍿', description: 'Jogadores escolhem a ordem' }
];

const ACTION_TYPES = [
    { id: 'standard', name: 'Ação Padrão', icon: '⚔️', description: 'Ataque, lançar magia, usar habilidade' },
    { id: 'bonus', name: 'Ação Bônus', icon: '⚡', description: 'Ações rápidas secundárias' },
    { id: 'reaction', name: 'Reação', icon: '🛡️', description: 'Resposta a ações de outros' },
    { id: 'movement', name: 'Movimento', icon: '🏃', description: 'Deslocamento no campo' },
    { id: 'free', name: 'Ação Livre', icon: '💬', description: 'Falar, soltar item, etc' }
];

const DEFENSE_TYPES = [
    { id: 'static', name: 'Defesa Estática (AC)', icon: '🛡️', description: 'Valor fixo (ex: 10 + DEX + Armadura)' },
    { id: 'roll', name: 'Teste de Defesa', icon: '🎲', description: 'Rola dado para defender (ex: Esquiva vs Ataque)' },
    { id: 'contested', name: 'Teste Contestado', icon: '⚔️', description: 'Atacante e defensor rolam' }
];

export function CombatEditor({ data, onChange, attributes = [], dice = {} }) {
    const [activeTab, setActiveTab] = useState('general');

    const handleChange = (field, value) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    const handleNestedChange = (parent, field, value) => {
        onChange({
            ...data,
            [parent]: {
                ...data[parent],
                [field]: value
            }
        });
    };

    const toggleCombat = () => {
        handleChange('enabled', !data.enabled);
    };

    // Adicionar tipo de ação customizado
    const addCustomAction = () => {
        const newAction = {
            id: `action-${Date.now()}`,
            name: 'Nova Ação',
            description: '',
            count: 1
        };
        handleNestedChange('actions', 'custom', [...(data.actions?.custom || []), newAction]);
    };

    const removeCustomAction = (id) => {
        handleNestedChange('actions', 'custom', (data.actions?.custom || []).filter(a => a.id !== id));
    };

    return (
        <div className={styles.combatEditor}>
            {/* Header */}
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <Swords size={32} />
                </div>
                <div className={styles.headerContent}>
                    <h2 className={styles.moduleTitle}>Sistema de Combate</h2>
                    <p className={styles.moduleSubtitle}>Configure as mecânicas de combate do seu sistema</p>
                </div>
                <button
                    className={`${styles.toggleBtn} ${data.enabled ? styles.enabled : ''}`}
                    onClick={toggleCombat}
                >
                    {data.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    <span>{data.enabled ? 'Ativado' : 'Desativado'}</span>
                </button>
            </div>

            {!data.enabled ? (
                <div className={styles.disabledState}>
                    <div className={styles.disabledIcon}>⚔️</div>
                    <h3>Sistema de Combate Desativado</h3>
                    <p>Ative para configurar iniciativa, ações e defesas para seu sistema.</p>
                    <button className={styles.enableBtn} onClick={toggleCombat}>
                        <Swords size={20} />
                        Ativar Combate
                    </button>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
                            onClick={() => setActiveTab('general')}
                        >
                            <Settings size={16} />
                            <span>Geral</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'initiative' ? styles.active : ''}`}
                            onClick={() => setActiveTab('initiative')}
                        >
                            <Clock size={16} />
                            <span>Iniciativa</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'actions' ? styles.active : ''}`}
                            onClick={() => setActiveTab('actions')}
                        >
                            <Zap size={16} />
                            <span>Ações</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'defense' ? styles.active : ''}`}
                            onClick={() => setActiveTab('defense')}
                        >
                            <Shield size={16} />
                            <span>Defesa</span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className={styles.tabContent}>
                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className={styles.generalSection}>
                                <div className={styles.infoBox}>
                                    <Info size={20} />
                                    <div>
                                        <strong>Visão Geral do Combate</strong>
                                        <p>Configure as mecânicas básicas que definem como combates funcionam no seu sistema.</p>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Estilo de Combate</span>
                                    </label>
                                    <div className={styles.styleGrid}>
                                        <button
                                            className={`${styles.styleCard} ${data.style === 'tactical' ? styles.selected : ''}`}
                                            onClick={() => handleChange('style', 'tactical')}
                                        >
                                            <div className={styles.styleIcon}>🎯</div>
                                            <div className={styles.styleName}>Tático</div>
                                            <div className={styles.styleDesc}>Grid, posicionamento, flanquear</div>
                                        </button>
                                        <button
                                            className={`${styles.styleCard} ${data.style === 'theater' ? styles.selected : ''}`}
                                            onClick={() => handleChange('style', 'theater')}
                                        >
                                            <div className={styles.styleIcon}>🎭</div>
                                            <div className={styles.styleName}>Teatro da Mente</div>
                                            <div className={styles.styleDesc}>Narrativo, sem grid</div>
                                        </button>
                                        <button
                                            className={`${styles.styleCard} ${data.style === 'hybrid' ? styles.selected : ''}`}
                                            onClick={() => handleChange('style', 'hybrid')}
                                        >
                                            <div className={styles.styleIcon}>⚖️</div>
                                            <div className={styles.styleName}>Híbrido</div>
                                            <div className={styles.styleDesc}>Flexível conforme situação</div>
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Rodadas</span>
                                        <span className={styles.hint}>Duração de cada rodada em segundos (para referência)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.roundDuration || 6}
                                        onChange={(e) => handleChange('roundDuration', parseInt(e.target.value) || 6)}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Initiative Tab */}
                        {activeTab === 'initiative' && (
                            <div className={styles.initiativeSection}>
                                <h3 className={styles.sectionTitle}>Tipo de Iniciativa</h3>
                                <div className={styles.typeGrid}>
                                    {INITIATIVE_TYPES.map(type => (
                                        <button
                                            key={type.id}
                                            className={`${styles.typeCard} ${data.initiative?.type === type.id ? styles.selected : ''}`}
                                            onClick={() => handleNestedChange('initiative', 'type', type.id)}
                                        >
                                            <div className={styles.typeIcon}>{type.icon}</div>
                                            <div className={styles.typeName}>{type.name}</div>
                                            <div className={styles.typeDesc}>{type.description}</div>
                                        </button>
                                    ))}
                                </div>

                                {data.initiative?.type === 'attribute' && (
                                    <div className={styles.configSection}>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Atributo Base</label>
                                                <select
                                                    value={data.initiative?.attribute || ''}
                                                    onChange={(e) => handleNestedChange('initiative', 'attribute', e.target.value)}
                                                    className={styles.select}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {attributes.map(attr => (
                                                        <option key={attr.id} value={attr.id}>
                                                            {attr.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Dado</label>
                                                <select
                                                    value={data.initiative?.dice || 'd20'}
                                                    onChange={(e) => handleNestedChange('initiative', 'dice', e.target.value)}
                                                    className={styles.select}
                                                >
                                                    {(dice.available || ['d20']).map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className={styles.formulaPreview}>
                                            <span className={styles.formulaLabel}>Fórmula:</span>
                                            <code className={styles.formula}>
                                                {data.initiative?.dice || 'd20'} + {data.initiative?.attribute || 'ATR'}.mod
                                            </code>
                                        </div>
                                    </div>
                                )}

                                {data.initiative?.type === 'roll' && (
                                    <div className={styles.configSection}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Dado de Iniciativa</label>
                                            <select
                                                value={data.initiative?.dice || 'd20'}
                                                onChange={(e) => handleNestedChange('initiative', 'dice', e.target.value)}
                                                className={styles.select}
                                            >
                                                {(dice.available || ['d20']).map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions Tab */}
                        {activeTab === 'actions' && (
                            <div className={styles.actionsSection}>
                                <h3 className={styles.sectionTitle}>Ações por Turno</h3>
                                <p className={styles.sectionDesc}>
                                    Configure quantas ações cada personagem tem por turno.
                                </p>

                                <div className={styles.actionsList}>
                                    {ACTION_TYPES.map(action => (
                                        <div key={action.id} className={styles.actionRow}>
                                            <div className={styles.actionInfo}>
                                                <span className={styles.actionIcon}>{action.icon}</span>
                                                <div>
                                                    <div className={styles.actionName}>{action.name}</div>
                                                    <div className={styles.actionDesc}>{action.description}</div>
                                                </div>
                                            </div>
                                            <div className={styles.actionCount}>
                                                <button
                                                    className={styles.countBtn}
                                                    onClick={() => handleNestedChange('actions', action.id, Math.max(0, (data.actions?.[action.id] ?? 1) - 1))}
                                                >
                                                    -
                                                </button>
                                                <span className={styles.countValue}>{data.actions?.[action.id] ?? 1}</span>
                                                <button
                                                    className={styles.countBtn}
                                                    onClick={() => handleNestedChange('actions', action.id, (data.actions?.[action.id] ?? 1) + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Custom Actions */}
                                <div className={styles.customActions}>
                                    <div className={styles.customHeader}>
                                        <h4>Ações Customizadas</h4>
                                        <button className={styles.addBtn} onClick={addCustomAction}>
                                            <Plus size={16} />
                                            Adicionar
                                        </button>
                                    </div>
                                    {(data.actions?.custom || []).map(action => (
                                        <div key={action.id} className={styles.customActionRow}>
                                            <input
                                                type="text"
                                                value={action.name}
                                                onChange={(e) => {
                                                    const updated = (data.actions?.custom || []).map(a =>
                                                        a.id === action.id ? { ...a, name: e.target.value } : a
                                                    );
                                                    handleNestedChange('actions', 'custom', updated);
                                                }}
                                                className={styles.input}
                                                placeholder="Nome da ação"
                                            />
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => removeCustomAction(action.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Defense Tab */}
                        {activeTab === 'defense' && (
                            <div className={styles.defenseSection}>
                                <h3 className={styles.sectionTitle}>Sistema de Defesa</h3>
                                <div className={styles.typeGrid}>
                                    {DEFENSE_TYPES.map(type => (
                                        <button
                                            key={type.id}
                                            className={`${styles.typeCard} ${data.defense?.type === type.id ? styles.selected : ''}`}
                                            onClick={() => handleNestedChange('defense', 'type', type.id)}
                                        >
                                            <div className={styles.typeIcon}>{type.icon}</div>
                                            <div className={styles.typeName}>{type.name}</div>
                                            <div className={styles.typeDesc}>{type.description}</div>
                                        </button>
                                    ))}
                                </div>

                                {data.defense?.type === 'static' && (
                                    <div className={styles.configSection}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                <span>Fórmula de Defesa</span>
                                                <span className={styles.hint}>Use nomes de atributos e "armor" para bônus de armadura</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.defense?.formula || '10 + DEX.mod + armor'}
                                                onChange={(e) => handleNestedChange('defense', 'formula', e.target.value)}
                                                className={styles.input}
                                                placeholder="10 + DEX.mod + armor"
                                            />
                                        </div>
                                        <div className={styles.formulaPreview}>
                                            <span className={styles.formulaLabel}>Exemplo:</span>
                                            <code className={styles.formula}>
                                                AC = {data.defense?.formula || '10 + DEX.mod + armor'}
                                            </code>
                                        </div>
                                    </div>
                                )}

                                {data.defense?.type === 'roll' && (
                                    <div className={styles.configSection}>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Atributo de Defesa</label>
                                                <select
                                                    value={data.defense?.attribute || ''}
                                                    onChange={(e) => handleNestedChange('defense', 'attribute', e.target.value)}
                                                    className={styles.select}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {attributes.map(attr => (
                                                        <option key={attr.id} value={attr.id}>
                                                            {attr.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Dado</label>
                                                <select
                                                    value={data.defense?.dice || 'd20'}
                                                    onChange={(e) => handleNestedChange('defense', 'dice', e.target.value)}
                                                    className={styles.select}
                                                >
                                                    {(dice.available || ['d20']).map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Summary */}
            {data.enabled && (
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Estilo:</span>
                        <span className={styles.summaryValue}>
                            {data.style === 'tactical' ? 'Tático' : data.style === 'theater' ? 'Teatro da Mente' : 'Híbrido'}
                        </span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Iniciativa:</span>
                        <span className={styles.summaryValue}>
                            {INITIATIVE_TYPES.find(t => t.id === data.initiative?.type)?.name || 'Não configurada'}
                        </span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Defesa:</span>
                        <span className={styles.summaryValue}>
                            {DEFENSE_TYPES.find(t => t.id === data.defense?.type)?.name || 'Não configurada'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
