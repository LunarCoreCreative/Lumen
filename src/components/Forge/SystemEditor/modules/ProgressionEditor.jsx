import React, { useState } from 'react';
import styles from './ProgressionEditor.module.css';
import { TrendingUp, Settings, Plus, Trash2, Info, Zap, BookOpen } from 'lucide-react';

const PROGRESSION_TYPES = [
    {
        id: 'levels',
        name: 'Sistema de Níveis',
        icon: '📈',
        description: 'Personagens ganham XP e sobem de nível (D&D, Pathfinder)'
    },
    {
        id: 'xp_free',
        name: 'XP Livre',
        icon: '💰',
        description: 'Gaste XP diretamente em melhorias (M&M, WoD)'
    },
    {
        id: 'milestone',
        name: 'Milestones',
        icon: '🏆',
        description: 'Progressão narrativa por conquistas (PbtA, Fate)'
    }
];

const XP_PRESETS = [
    { id: 'dnd5e', name: 'D&D 5e', description: 'Curva exponencial padrão' },
    { id: 'linear', name: 'Linear', description: '1000 XP por nível' },
    { id: 'fast', name: 'Rápida', description: 'Metade do XP normal' },
    { id: 'custom', name: 'Customizada', description: 'Defina manualmente' }
];

// XP table para D&D 5e
const DND5E_XP = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export function ProgressionEditor({ data, onChange, attributes = [] }) {
    const [activeTab, setActiveTab] = useState('type');

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

    // Gerar tabela de XP baseada no preset
    const generateXpTable = (preset, maxLevel) => {
        switch (preset) {
            case 'dnd5e':
                return DND5E_XP.slice(0, maxLevel);
            case 'linear':
                return Array.from({ length: maxLevel }, (_, i) => i * 1000);
            case 'fast':
                return DND5E_XP.slice(0, maxLevel).map(xp => Math.floor(xp / 2));
            default:
                return data.xpTable || Array.from({ length: maxLevel }, (_, i) => i * 1000);
        }
    };

    // Adicionar benefício por nível
    const addLevelBenefit = () => {
        const newBenefit = {
            id: `benefit-${Date.now()}`,
            level: 1,
            type: 'attribute_increase',
            description: '',
            value: 2
        };
        handleChange('benefits', [...(data.benefits || []), newBenefit]);
    };

    // Remover benefício
    const removeBenefit = (id) => {
        handleChange('benefits', (data.benefits || []).filter(b => b.id !== id));
    };

    // Atualizar benefício
    const updateBenefit = (id, field, value) => {
        handleChange('benefits', (data.benefits || []).map(b =>
            b.id === id ? { ...b, [field]: value } : b
        ));
    };

    return (
        <div className={styles.progressionEditor}>
            {/* Header */}
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <TrendingUp size={32} />
                </div>
                <div>
                    <h2 className={styles.moduleTitle}>Sistema de Progressão</h2>
                    <p className={styles.moduleSubtitle}>Configure como personagens evoluem no seu sistema</p>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'type' ? styles.active : ''}`}
                    onClick={() => setActiveTab('type')}
                >
                    <Settings size={16} />
                    <span>Tipo</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'config' ? styles.active : ''}`}
                    onClick={() => setActiveTab('config')}
                >
                    <Zap size={16} />
                    <span>Configuração</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'benefits' ? styles.active : ''}`}
                    onClick={() => setActiveTab('benefits')}
                >
                    <BookOpen size={16} />
                    <span>Benefícios</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {/* Type Selection Tab */}
                {activeTab === 'type' && (
                    <div className={styles.typeSection}>
                        <h3 className={styles.sectionTitle}>Escolha o Tipo de Progressão</h3>
                        <div className={styles.typeGrid}>
                            {PROGRESSION_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    className={`${styles.typeCard} ${data.type === type.id ? styles.selected : ''}`}
                                    onClick={() => handleChange('type', type.id)}
                                >
                                    <div className={styles.typeIcon}>{type.icon}</div>
                                    <div className={styles.typeName}>{type.name}</div>
                                    <div className={styles.typeDesc}>{type.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Configuration Tab */}
                {activeTab === 'config' && (
                    <div className={styles.configSection}>
                        {data.type === 'levels' && (
                            <>
                                {/* Max Level */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Nível Máximo</span>
                                        <span className={styles.hint}>Até que nível personagens podem chegar</span>
                                    </label>
                                    <div className={styles.levelInput}>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={data.maxLevel || 20}
                                            onChange={(e) => handleChange('maxLevel', parseInt(e.target.value) || 20)}
                                            className={styles.input}
                                        />
                                        <div className={styles.presetButtons}>
                                            {[10, 20, 30, 50].map(level => (
                                                <button
                                                    key={level}
                                                    className={`${styles.presetBtn} ${data.maxLevel === level ? styles.active : ''}`}
                                                    onClick={() => handleChange('maxLevel', level)}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* XP Preset */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Curva de XP</span>
                                        <span className={styles.hint}>Como o XP escala entre níveis</span>
                                    </label>
                                    <div className={styles.xpPresets}>
                                        {XP_PRESETS.map(preset => (
                                            <button
                                                key={preset.id}
                                                className={`${styles.xpPresetCard} ${data.xpPreset === preset.id ? styles.selected : ''}`}
                                                onClick={() => {
                                                    handleChange('xpPreset', preset.id);
                                                    handleChange('xpTable', generateXpTable(preset.id, data.maxLevel || 20));
                                                }}
                                            >
                                                <div className={styles.presetName}>{preset.name}</div>
                                                <div className={styles.presetDesc}>{preset.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* XP Preview Table */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Tabela de XP</span>
                                        <span className={styles.hint}>XP necessário para cada nível</span>
                                    </label>
                                    <div className={styles.xpTable}>
                                        {(data.xpTable || generateXpTable(data.xpPreset || 'dnd5e', Math.min(data.maxLevel || 20, 10))).slice(0, 10).map((xp, index) => (
                                            <div key={index} className={styles.xpRow}>
                                                <span className={styles.xpLevel}>Nível {index + 1}</span>
                                                <span className={styles.xpValue}>{xp.toLocaleString()} XP</span>
                                            </div>
                                        ))}
                                        {(data.maxLevel || 20) > 10 && (
                                            <div className={styles.xpMore}>
                                                ... e mais {(data.maxLevel || 20) - 10} níveis
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {data.type === 'xp_free' && (
                            <>
                                <div className={styles.infoBox}>
                                    <Info size={20} />
                                    <div>
                                        <strong>Sistema de XP Livre</strong>
                                        <p>Personagens gastam pontos diretamente em atributos, habilidades e poderes. Não há níveis fixos.</p>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Pontos Iniciais</span>
                                        <span className={styles.hint}>Quanto XP/pontos um personagem começa</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.startingPoints || 150}
                                        onChange={(e) => handleChange('startingPoints', parseInt(e.target.value) || 0)}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Limite de Poder</span>
                                        <span className={styles.hint}>Rank máximo por categoria (Power Level)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={data.powerLevel || 10}
                                        onChange={(e) => handleChange('powerLevel', parseInt(e.target.value) || 10)}
                                        className={styles.input}
                                    />
                                </div>
                            </>
                        )}

                        {data.type === 'milestone' && (
                            <>
                                <div className={styles.infoBox}>
                                    <Info size={20} />
                                    <div>
                                        <strong>Sistema de Milestones</strong>
                                        <p>Personagens evoluem quando a narrativa permite. Ideal para jogos focados em história.</p>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span>Avanços por Milestone</span>
                                        <span className={styles.hint}>Quantos pontos/melhorias ganham por marco</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.advancesPerMilestone || 1}
                                        onChange={(e) => handleChange('advancesPerMilestone', parseInt(e.target.value) || 1)}
                                        className={styles.input}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Benefits Tab */}
                {activeTab === 'benefits' && (
                    <div className={styles.benefitsSection}>
                        <div className={styles.benefitsHeader}>
                            <h3 className={styles.sectionTitle}>Benefícios por Nível</h3>
                            <button className={styles.addBtn} onClick={addLevelBenefit}>
                                <Plus size={16} />
                                <span>Adicionar Benefício</span>
                            </button>
                        </div>

                        {(data.benefits || []).length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>🎯</div>
                                <h4>Nenhum benefício configurado</h4>
                                <p>Adicione benefícios que personagens ganham ao subir de nível</p>
                                <button className={styles.emptyButton} onClick={addLevelBenefit}>
                                    <Plus size={16} />
                                    Adicionar Primeiro Benefício
                                </button>
                            </div>
                        ) : (
                            <div className={styles.benefitsList}>
                                {(data.benefits || []).map((benefit, index) => (
                                    <div key={benefit.id} className={styles.benefitCard}>
                                        <div className={styles.benefitHeader}>
                                            <span className={styles.benefitIndex}>#{index + 1}</span>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => removeBenefit(benefit.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className={styles.benefitForm}>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label>Nível(is)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: 4, 8, 12, 16, 19"
                                                        value={benefit.levels || benefit.level || ''}
                                                        onChange={(e) => updateBenefit(benefit.id, 'levels', e.target.value)}
                                                        className={styles.input}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Tipo</label>
                                                    <select
                                                        value={benefit.type || 'attribute_increase'}
                                                        onChange={(e) => updateBenefit(benefit.id, 'type', e.target.value)}
                                                        className={styles.select}
                                                    >
                                                        <option value="attribute_increase">Aumento de Atributo</option>
                                                        <option value="skill_points">Pontos de Habilidade</option>
                                                        <option value="feat_slot">Slot de Talento</option>
                                                        <option value="hp_increase">Aumento de HP</option>
                                                        <option value="custom">Customizado</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label>Valor/Quantidade</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={benefit.value || 1}
                                                        onChange={(e) => updateBenefit(benefit.id, 'value', parseInt(e.target.value) || 1)}
                                                        className={styles.input}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Descrição (opcional)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: +2 em qualquer atributo"
                                                        value={benefit.description || ''}
                                                        onChange={(e) => updateBenefit(benefit.id, 'description', e.target.value)}
                                                        className={styles.input}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Templates */}
                        <div className={styles.templates}>
                            <h4 className={styles.templatesTitle}>Templates Rápidos</h4>
                            <div className={styles.templateButtons}>
                                <button
                                    className={styles.templateBtn}
                                    onClick={() => {
                                        handleChange('benefits', [
                                            { id: 'asi', levels: '4, 8, 12, 16, 19', type: 'attribute_increase', value: 2, description: '+2 em qualquer atributo' },
                                            { id: 'feat', levels: '1, 4, 8, 12, 16, 20', type: 'feat_slot', value: 1, description: 'Novo talento' }
                                        ]);
                                    }}
                                >
                                    ⚔️ D&D 5e Style
                                </button>
                                <button
                                    className={styles.templateBtn}
                                    onClick={() => {
                                        handleChange('benefits', [
                                            { id: 'skill', levels: '1-20', type: 'skill_points', value: 4, description: 'Pontos por nível' }
                                        ]);
                                    }}
                                >
                                    📖 Skill-based
                                </button>
                                <button
                                    className={styles.templateBtn}
                                    onClick={() => {
                                        handleChange('benefits', []);
                                    }}
                                >
                                    🧹 Limpar Tudo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className={styles.summary}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Tipo:</span>
                    <span className={styles.summaryValue}>
                        {PROGRESSION_TYPES.find(t => t.id === data.type)?.name || 'Níveis'}
                    </span>
                </div>
                {data.type === 'levels' && (
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Max Nível:</span>
                        <span className={styles.summaryValue}>{data.maxLevel || 20}</span>
                    </div>
                )}
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Benefícios:</span>
                    <span className={styles.summaryValue}>{(data.benefits || []).length}</span>
                </div>
            </div>
        </div>
    );
}
