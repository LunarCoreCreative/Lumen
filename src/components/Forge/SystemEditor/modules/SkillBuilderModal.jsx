import React, { useState, useEffect } from 'react';
import styles from './SkillBuilderModal.module.css';
import { X, Info, Zap, Settings, DollarSign, Dices, TrendingUp, AlertCircle } from 'lucide-react';
import { EFFECTS_LIBRARY, getAllEffects } from '../data/EffectsLibrary';
import { MODIFIERS_LIBRARY, calculateModifierCost } from '../data/ModifiersLibrary';

const TABS = [
    { id: 'basic', label: '📝 Básico', icon: Info },
    { id: 'effects', label: '⚡ Efeitos', icon: Zap },
    { id: 'mechanics', label: '🎛️ Mecânicas', icon: Settings },
    { id: 'modifiers', label: '🔧 Modificadores', icon: AlertCircle },
    { id: 'requirements', label: '💎 Requisitos', icon: TrendingUp },
    { id: 'costs', label: '💰 Custos', icon: DollarSign },
    { id: 'rolls', label: '🎲 Testes', icon: Dices },
    { id: 'progression', label: '📈 Progressão', icon: TrendingUp }
];

const INITIAL_SKILL = {
    id: '',
    name: '',
    description: '',
    category: '',
    icon: '⚡',
    tags: [],
    color: '#8b5cf6',
    baseEffects: [],
    mechanics: {
        range: 'ranged_short',
        duration: 'instant',
        actionType: 'standard',
        areaEffect: {
            type: 'none',
            radius: 0
        }
    },
    modifiers: {
        extras: [],
        flaws: []
    },
    requirements: {
        attributes: {},
        prerequisiteSkills: [],
        level: 1
    },
    costs: {
        activation: {
            resource: 'mp',
            amount: 0
        },
        maintenance: {
            resource: 'mp',
            amountPerRound: 0
        },
        cooldown: 0
    },
    rolls: {
        checkType: 'none',
        baseAttribute: '',
        bonus: 0,
        diceFormula: '',
        dc: 0,
        criticalEffect: '',
        fumbleEffect: ''
    },
    progression: {
        enabled: false,
        maxLevel: 1,
        levels: [],
        branches: []
    }
};

export function SkillBuilderModal({ skill, onSave, onClose, systemAttributes = [], systemDice = {}, systemProgression = {} }) {
    const [currentTab, setCurrentTab] = useState('basic');
    const [formData, setFormData] = useState(skill || { ...INITIAL_SKILL, id: `skill-${Date.now()}` });
    const [errors, setErrors] = useState({});

    // Calcula custo total da habilidade
    const calculateTotalCost = () => {
        if (formData.baseEffects.length === 0) return 0;

        // Soma o custo de TODOS os efeitos
        const totalCost = formData.baseEffects.reduce((total, effect) => {
            const baseRank = effect.rank || 0;
            const enabledExtras = formData.modifiers.extras.filter(e => e.enabled);
            const enabledFlaws = formData.modifiers.flaws.filter(f => f.enabled);

            return total + calculateModifierCost(baseRank, enabledExtras, enabledFlaws);
        }, 0);

        return totalCost;
    };

    const handleSave = () => {
        // Validação básica
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Nome é obrigatório';
        if (formData.baseEffects.length === 0) newErrors.effects = 'Pelo menos um efeito é necessário';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setCurrentTab('basic'); // Volta para aba básico se houver erro
            return;
        }

        onSave(formData);
    };

    const updateFormData = (path, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerIcon}>
                            <Zap size={28} />
                        </div>
                        <div>
                            <h2 className={styles.modalTitle}>
                                {skill ? 'Editar Habilidade' : 'Nova Habilidade'}
                            </h2>
                            <p className={styles.modalSubtitle}>
                                Construtor modular de habilidades
                            </p>
                        </div>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    <div className={styles.tabs}>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.tab} ${currentTab === tab.id ? styles.active : ''}`}
                                onClick={() => setCurrentTab(tab.id)}
                            >
                                <span className={styles.tabLabel}>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className={styles.modalContent}>
                    {currentTab === 'basic' && (
                        <BasicTab formData={formData} updateFormData={updateFormData} errors={errors} />
                    )}
                    {currentTab === 'effects' && (
                        <EffectsTab formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentTab === 'mechanics' && (
                        <MechanicsTab formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentTab === 'modifiers' && (
                        <ModifiersTab formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentTab === 'requirements' && (
                        <RequirementsTab formData={formData} updateFormData={updateFormData} systemAttributes={systemAttributes} />
                    )}
                    {currentTab === 'costs' && (
                        <CostsTab formData={formData} updateFormData={updateFormData} systemAttributes={systemAttributes} />
                    )}
                    {currentTab === 'rolls' && (
                        <RollsTab formData={formData} updateFormData={updateFormData} systemAttributes={systemAttributes} />
                    )}
                    {currentTab === 'progression' && (
                        <ProgressionTab formData={formData} updateFormData={updateFormData} />
                    )}
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <div className={styles.costPreview}>
                        <div className={styles.costLabel}>Custo Total:</div>
                        <div className={styles.costValue}>{calculateTotalCost()} PP</div>
                    </div>
                    <div className={styles.footerActions}>
                        <button className={styles.cancelButton} onClick={onClose}>
                            Cancelar
                        </button>
                        <button className={styles.saveButton} onClick={handleSave}>
                            {skill ? 'Salvar Alterações' : 'Criar Habilidade'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// === TAB COMPONENTS ===

function BasicTab({ formData, updateFormData, errors }) {
    const EMOJI_SUGGESTIONS = ['⚡', '🔥', '❄️', '💧', '🌪️', '⚔️', '🛡️', '❤️', '💚', '🧠', '👁️', '✨', '🌟', '💫', '⭐'];
    const CATEGORY_SUGGESTIONS = ['Ataque', 'Defesa', 'Suporte', 'Movimento', 'Utilidade', 'Controle'];

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Informações Básicas</h3>

                {/* Nome */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Nome da Habilidade <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Ex: Bola de Fogo Suprema"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                {/* Descrição */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Descrição</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Descreva a habilidade de forma narrativa..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                    />
                </div>

                {/* Categoria & Ícone Row */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Categoria</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Ex: Ataque Mágico"
                            value={formData.category}
                            onChange={(e) => updateFormData('category', e.target.value)}
                            list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                            {CATEGORY_SUGGESTIONS.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ícone</label>
                        <div className={styles.emojiPicker}>
                            <input
                                type="text"
                                className={styles.emojiInput}
                                value={formData.icon}
                                onChange={(e) => updateFormData('icon', e.target.value)}
                                maxLength={2}
                            />
                            <div className={styles.emojiSuggestions}>
                                {EMOJI_SUGGESTIONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        className={styles.emojiButton}
                                        onClick={() => updateFormData('icon', emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cor */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Cor Temática</label>
                    <div className={styles.colorPicker}>
                        <input
                            type="color"
                            className={styles.colorInput}
                            value={formData.color}
                            onChange={(e) => updateFormData('color', e.target.value)}
                        />
                        <span className={styles.colorValue}>{formData.color}</span>
                    </div>
                </div>

                {/* Tags */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Tags</label>
                    <div className={styles.tagsInput}>
                        {formData.tags?.map((tag, index) => (
                            <span key={index} className={styles.tagChip}>
                                {tag}
                                <button
                                    className={styles.tagRemove}
                                    onClick={() => {
                                        const newTags = formData.tags.filter((_, i) => i !== index);
                                        updateFormData('tags', newTags);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            className={styles.tagInput}
                            placeholder="Adicionar tag..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    e.preventDefault();
                                    const newTags = [...(formData.tags || []), e.target.value.trim()];
                                    updateFormData('tags', newTags);
                                    e.target.value = '';
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EffectsTab({ formData, updateFormData }) {
    const allEffects = getAllEffects();
    const [selectedEffect, setSelectedEffect] = useState(null);
    const [rank, setRank] = useState(10);
    const [subtype, setSubtype] = useState('');

    const addEffect = () => {
        if (!selectedEffect) return;

        const newEffect = {
            type: selectedEffect.id,
            subtype: subtype || (selectedEffect.subtypes?.[0]?.id || ''),
            rank: rank,
            descriptor: ''
        };

        updateFormData('baseEffects', [...formData.baseEffects, newEffect]);
        setSelectedEffect(null);
        setRank(10);
        setSubtype('');
    };

    const removeEffect = (index) => {
        const newEffects = formData.baseEffects.filter((_, i) => i !== index);
        updateFormData('baseEffects', newEffects);
    };

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Efeitos Base</h3>
                <p className={styles.sectionDescription}>
                    Selecione um ou mais efeitos que compõem esta habilidade
                </p>

                {/* Efeitos Adicionados */}
                {formData.baseEffects.length > 0 && (
                    <div className={styles.effectsList}>
                        {formData.baseEffects.map((effect, index) => {
                            const effectData = EFFECTS_LIBRARY[effect.type];
                            return (
                                <div key={index} className={styles.effectCard}>
                                    <div className={styles.effectIcon}>{effectData?.icon}</div>
                                    <div className={styles.effectInfo}>
                                        <div className={styles.effectName}>{effectData?.label}</div>
                                        <div className={styles.effectDetails}>
                                            Rank {effect.rank} • {effect.subtype}
                                        </div>
                                    </div>
                                    <button
                                        className={styles.removeEffect}
                                        onClick={() => removeEffect(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Adicionar Novo Efeito */}
                <div className={styles.addEffectSection}>
                    <h4 className={styles.subtitle}>Adicionar Efeito</h4>

                    <div className={styles.effectsGrid}>
                        {allEffects.map(effect => (
                            <button
                                key={effect.id}
                                className={`${styles.effectOption} ${selectedEffect?.id === effect.id ? styles.selected : ''}`}
                                onClick={() => setSelectedEffect(effect)}
                            >
                                <div className={styles.effectOptionIcon}>{effect.icon}</div>
                                <div className={styles.effectOptionLabel}>{effect.label}</div>
                            </button>
                        ))}
                    </div>

                    {selectedEffect && (
                        <div className={styles.effectConfig}>
                            {/* Subtipo */}
                            {selectedEffect.subtypes && (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Subtipo</label>
                                    <select
                                        className={styles.select}
                                        value={subtype || selectedEffect.subtypes[0]?.id}
                                        onChange={(e) => setSubtype(e.target.value)}
                                    >
                                        {selectedEffect.subtypes.map(st => (
                                            <option key={st.id} value={st.id}>
                                                {st.icon} {st.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Rank */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Graduação (Rank): {rank}
                                </label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="1"
                                    max="20"
                                    value={rank}
                                    onChange={(e) => setRank(parseInt(e.target.value))}
                                />
                                <div className={styles.sliderMarks}>
                                    <span>1</span>
                                    <span>10</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <button className={styles.addButton} onClick={addEffect}>
                                Adicionar Efeito
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Aba de Mecânicas
function MechanicsTab({ formData, updateFormData }) {
    const RANGE_OPTIONS = [
        { id: 'personal', label: '👤 Pessoal', description: 'Afeta apenas você' },
        { id: 'touch', label: '🤝 Toque', description: 'Deve tocar o alvo' },
        { id: 'close', label: '📏 Curto', description: 'Até 10m de distância' },
        { id: 'ranged_short', label: '🎯 Médio', description: 'Até 30m de distância' },
        { id: 'ranged_long', label: '🏹 Longo', description: 'Até 100m+ de distância' },
        { id: 'perception', label: '👁️ Percepção', description: 'Qualquer alvo que você possa perceber' },
        { id: 'ranged_visual', label: '🔭 Visual', description: 'Qualquer lugar que você possa ver' }
    ];

    const DURATION_OPTIONS = [
        { id: 'instant', label: '⚡ Instantâneo', description: 'Efeito imediato' },
        { id: 'concentration', label: '🧠 Concentração', description: 'Dura enquanto concentrar (ação padrão)' },
        { id: 'sustained', label: '🔄 Sustentado', description: 'Dura enquanto mantiver (ação livre)' },
        { id: 'continuous', label: '♾️ Contínuo', description: 'Sempre ativo, permanente' },
        { id: 'rounds', label: '⏱️ Rodadas', description: 'Dura X rodadas/turnos' }
    ];

    const ACTION_TYPE_OPTIONS = [
        { id: 'free', label: '🆓 Livre', description: 'Não consome ação' },
        { id: 'reaction', label: '⚡ Reação', description: 'Resposta a um gatilho' },
        { id: 'move', label: '🏃 Movimento', description: 'Usa ação de movimento' },
        { id: 'standard', label: '⚔️ Padrão', description: 'Usa ação padrão' },
        { id: 'full', label: '⏰ Completa', description: 'Usa rodada inteira' }
    ];

    const AREA_TYPE_OPTIONS = [
        { id: 'none', label: '🎯 Nenhuma', description: 'Afeta um único alvo' },
        { id: 'burst', label: '💥 Explosão', description: 'Área circular centrada em um ponto' },
        { id: 'cone', label: '📐 Cone', description: 'Área em formato de cone' },
        { id: 'line', label: '➡️ Linha', description: 'Linha reta' },
        { id: 'cloud', label: '☁️ Nuvem', description: 'Nuvem/névoa que permanece' },
        { id: 'wall', label: '🧱 Barreira', description: 'Parede ou barreira' }
    ];

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Mecânicas de Uso</h3>
                <p className={styles.sectionDescription}>
                    Defina como a habilidade funciona em termos de alcance, duração, ação e área
                </p>

                {/* Alcance */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Alcance</label>
                    <div className={styles.optionsGrid}>
                        {RANGE_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                className={`${styles.optionCard} ${formData.mechanics.range === option.id ? styles.selected : ''
                                    }`}
                                onClick={() => updateFormData('mechanics.range', option.id)}
                            >
                                <div className={styles.optionLabel}>{option.label}</div>
                                <div className={styles.optionDesc}>{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duração */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Duração</label>
                    <div className={styles.optionsGrid}>
                        {DURATION_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                className={`${styles.optionCard} ${formData.mechanics.duration === option.id ? styles.selected : ''
                                    }`}
                                onClick={() => updateFormData('mechanics.duration', option.id)}
                            >
                                <div className={styles.optionLabel}>{option.label}</div>
                                <div className={styles.optionDesc}>{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duração em Rodadas (se selecionado) */}
                {formData.mechanics.duration === 'rounds' && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Número de Rodadas</label>
                        <input
                            type="number"
                            min="1"
                            className={styles.input}
                            placeholder="Ex: 10"
                            value={formData.mechanics.durationRounds || ''}
                            onChange={(e) => updateFormData('mechanics.durationRounds', parseInt(e.target.value))}
                        />
                    </div>
                )}

                {/* Tipo de Ação */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de Ação</label>
                    <div className={styles.optionsGrid}>
                        {ACTION_TYPE_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                className={`${styles.optionCard} ${formData.mechanics.actionType === option.id ? styles.selected : ''
                                    }`}
                                onClick={() => updateFormData('mechanics.actionType', option.id)}
                            >
                                <div className={styles.optionLabel}>{option.label}</div>
                                <div className={styles.optionDesc}>{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Área de Efeito */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Área de Efeito</label>
                    <div className={styles.optionsGrid}>
                        {AREA_TYPE_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                className={`${styles.optionCard} ${formData.mechanics.areaEffect.type === option.id ? styles.selected : ''
                                    }`}
                                onClick={() => updateFormData('mechanics.areaEffect.type', option.id)}
                            >
                                <div className={styles.optionLabel}>{option.label}</div>
                                <div className={styles.optionDesc}>{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Raio da Área (se não for "none") */}
                {formData.mechanics.areaEffect.type !== 'none' && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Tamanho da Área (metros): {formData.mechanics.areaEffect.radius || 0}m
                        </label>
                        <input
                            type="range"
                            className={styles.slider}
                            min="0"
                            max="100"
                            step="5"
                            value={formData.mechanics.areaEffect.radius || 0}
                            onChange={(e) => updateFormData('mechanics.areaEffect.radius', parseInt(e.target.value))}
                        />
                        <div className={styles.sliderMarks}>
                            <span>0m</span>
                            <span>50m</span>
                            <span>100m</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Aba de Modificadores
function ModifiersTab({ formData, updateFormData }) {
    const toggleExtra = (extraId) => {
        const currentExtras = formData.modifiers.extras || [];
        const exists = currentExtras.find(e => e.id === extraId);

        if (exists) {
            // Remove
            const newExtras = currentExtras.filter(e => e.id !== extraId);
            updateFormData('modifiers.extras', newExtras);
        } else {
            // Adiciona
            const extraData = MODIFIERS_LIBRARY.extras.find(e => e.id === extraId);
            const newExtras = [...currentExtras, { ...extraData, enabled: true }];
            updateFormData('modifiers.extras', newExtras);
        }
    };

    const toggleFlaw = (flawId) => {
        const currentFlaws = formData.modifiers.flaws || [];
        const exists = currentFlaws.find(f => f.id === flawId);

        if (exists) {
            // Remove
            const newFlaws = currentFlaws.filter(f => f.id !== flawId);
            updateFormData('modifiers.flaws', newFlaws);
        } else {
            // Adiciona
            const flawData = MODIFIERS_LIBRARY.flaws.find(f => f.id === flawId);
            const newFlaws = [...currentFlaws, { ...flawData, enabled: true }];
            updateFormData('modifiers.flaws', newFlaws);
        }
    };

    const isExtraSelected = (extraId) => {
        return (formData.modifiers.extras || []).some(e => e.id === extraId);
    };

    const isFlawSelected = (flawId) => {
        return (formData.modifiers.flaws || []).some(f => f.id === flawId);
    };

    // Agrupar modificadores por categoria
    const extrasByCategory = MODIFIERS_LIBRARY.extras.reduce((acc, extra) => {
        if (!acc[extra.category]) acc[extra.category] = [];
        acc[extra.category].push(extra);
        return acc;
    }, {});

    const flawsByCategory = MODIFIERS_LIBRARY.flaws.reduce((acc, flaw) => {
        if (!acc[flaw.category]) acc[flaw.category] = [];
        acc[flaw.category].push(flaw);
        return acc;
    }, {});

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Modificadores</h3>
                <p className={styles.sectionDescription}>
                    Adicione Extras para aumentar o poder ou Falhas para reduzir o custo
                </p>

                {/* Extras */}
                <div className={styles.modifierSection}>
                    <h4 className={styles.modifierTitle}>
                        ✨ Extras <span className={styles.modifierBadge}>Aumentam Poder</span>
                    </h4>
                    <p className={styles.helperText}>
                        Extras adicionam funcionalidades e poder à habilidade, aumentando seu custo
                    </p>

                    {Object.entries(extrasByCategory).map(([category, extras]) => (
                        <div key={category} className={styles.categoryGroup}>
                            <div className={styles.categoryLabel}>{category}</div>
                            <div className={styles.modifiersGrid}>
                                {extras.map(extra => (
                                    <label
                                        key={extra.id}
                                        className={`${styles.modifierCard} ${isExtraSelected(extra.id) ? styles.selected : ''
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.modifierCheckbox}
                                            checked={isExtraSelected(extra.id)}
                                            onChange={() => toggleExtra(extra.id)}
                                        />
                                        <div className={styles.modifierContent}>
                                            <div className={styles.modifierName}>{extra.name}</div>
                                            <div className={styles.modifierCost}>
                                                +{extra.costModifier} custo/rank
                                            </div>
                                            <div className={styles.modifierDesc}>{extra.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Flaws */}
                <div className={styles.modifierSection}>
                    <h4 className={styles.modifierTitle}>
                        ⚠️ Falhas <span className={styles.modifierBadge}>Reduzem Custo</span>
                    </h4>
                    <p className={styles.helperText}>
                        Falhas adicionam limitações à habilidade, reduzindo seu custo
                    </p>

                    {Object.entries(flawsByCategory).map(([category, flaws]) => (
                        <div key={category} className={styles.categoryGroup}>
                            <div className={styles.categoryLabel}>{category}</div>
                            <div className={styles.modifiersGrid}>
                                {flaws.map(flaw => (
                                    <label
                                        key={flaw.id}
                                        className={`${styles.modifierCard} ${isFlawSelected(flaw.id) ? styles.selected : ''
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className={styles.modifierCheckbox}
                                            checked={isFlawSelected(flaw.id)}
                                            onChange={() => toggleFlaw(flaw.id)}
                                        />
                                        <div className={styles.modifierContent}>
                                            <div className={styles.modifierName}>{flaw.name}</div>
                                            <div className={styles.modifierCost}>
                                                {flaw.costReduction} custo/rank
                                            </div>
                                            <div className={styles.modifierDesc}>{flaw.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumo */}
                {(formData.modifiers.extras?.length > 0 || formData.modifiers.flaws?.length > 0) && (
                    <div className={styles.modifiersSummary}>
                        <h5>📊 Resumo de Modificadores</h5>
                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>Extras Ativos:</div>
                                <div className={styles.summaryValue}>
                                    {formData.modifiers.extras?.length || 0}
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>Falhas Ativas:</div>
                                <div className={styles.summaryValue}>
                                    {formData.modifiers.flaws?.length || 0}
                                </div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>Impacto no Custo:</div>
                                <div className={styles.summaryValue}>
                                    {(() => {
                                        const extrasCost = formData.modifiers.extras?.reduce(
                                            (sum, e) => sum + e.costModifier, 0
                                        ) || 0;
                                        const flawsReduction = formData.modifiers.flaws?.reduce(
                                            (sum, f) => sum + f.costReduction, 0
                                        ) || 0;
                                        const total = extrasCost + flawsReduction;
                                        return total > 0 ? `+${total}×` : total < 0 ? `${total}×` : '0×';
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Aba de Requisitos
function RequirementsTab({ formData, updateFormData, systemAttributes = [] }) {
    // Usa atributos do sistema ao invés de hardcoded
    const availableAttributes = systemAttributes.map(attr => ({
        id: attr.id,
        label: attr.name,
        shortName: attr.shortName || attr.name?.substring(0, 3).toUpperCase(),
        icon: attr.icon || '⚡'
    }));

    const updateAttribute = (attrId, value) => {
        const newAttributes = { ...formData.requirements.attributes };
        if (value > 0) {
            newAttributes[attrId] = value;
        } else {
            delete newAttributes[attrId];
        }
        updateFormData('requirements.attributes', newAttributes);
    };

    const addPrerequisite = (skillName) => {
        if (!skillName.trim()) return;
        const newPrereqs = [...(formData.requirements.prerequisiteSkills || []), skillName];
        updateFormData('requirements.prerequisiteSkills', newPrereqs);
    };

    const removePrerequisite = (index) => {
        const newPrereqs = formData.requirements.prerequisiteSkills.filter((_, i) => i !== index);
        updateFormData('requirements.prerequisiteSkills', newPrereqs);
    };

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Requisitos</h3>
                <p className={styles.sectionDescription}>
                    Defina os requisitos necessários para adquirir ou usar esta habilidade
                </p>

                {/* Nível Mínimo */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Nível Mínimo</label>
                    <input
                        type="number"
                        className={styles.input}
                        min="1"
                        placeholder="Ex: 1, 5, 20, 100..."
                        value={formData.requirements.level}
                        onChange={(e) => updateFormData('requirements.level', parseInt(e.target.value) || 1)}
                    />
                    <p className={styles.helperText}>
                        Defina o nível mínimo necessário (sem limite máximo)
                    </p>
                </div>

                {/* Atributos Mínimos */}
                <div className={styles.formGroup}>
                    <h4 className={styles.subtitle}>Atributos Mínimos</h4>
                    <p className={styles.helperText}>
                        Defina os valores mínimos de atributos necessários para usar esta habilidade
                    </p>

                    {availableAttributes.length === 0 ? (
                        <div className={styles.emptyWarning}>
                            ⚠️ Nenhum atributo definido no sistema. Crie atributos primeiro na aba "Atributos".
                        </div>
                    ) : (
                        <div className={styles.attributesGrid}>
                            {availableAttributes.map(attr => (
                                <div key={attr.id} className={styles.attributeItem}>
                                    <div className={styles.attributeLabel}>
                                        <span className={styles.attributeIcon}>{attr.icon}</span>
                                        {attr.label}
                                    </div>
                                    <input
                                        type="number"
                                        className={styles.attributeInput}
                                        min="0"
                                        placeholder="0"
                                        value={formData.requirements.attributes[attr.id] || ''}
                                        onChange={(e) => updateAttribute(attr.id, parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Habilidades Prerequisitas */}
                <div className={styles.formGroup}>
                    <h4 className={styles.subtitle}>Habilidades Prerequisitas</h4>
                    <p className={styles.helperText}>
                        Liste outras habilidades que o personagem deve possuir antes de adquirir esta
                    </p>

                    {/* Lista de Prerequisitos */}
                    {formData.requirements.prerequisiteSkills?.length > 0 && (
                        <div className={styles.prerequisitesList}>
                            {formData.requirements.prerequisiteSkills.map((skill, index) => (
                                <div key={index} className={styles.prerequisiteChip}>
                                    <span>{skill}</span>
                                    <button
                                        className={styles.removePrerequisite}
                                        onClick={() => removePrerequisite(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Adicionar Novo */}
                    <div className={styles.addPrerequisite}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Nome da habilidade prerequisita..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addPrerequisite(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                        />
                        <p className={styles.inputHint}>Pressione Enter para adicionar</p>
                    </div>
                </div>

                {/* Resumo de Requisitos */}
                {(formData.requirements.level > 1 ||
                    Object.keys(formData.requirements.attributes).length > 0 ||
                    formData.requirements.prerequisiteSkills?.length > 0) && (
                        <div className={styles.requirementsSummary}>
                            <h5>📋 Resumo de Requisitos</h5>
                            <div className={styles.summaryList}>
                                {formData.requirements.level > 1 && (
                                    <div className={styles.summaryLine}>
                                        • Nível mínimo: <strong>{formData.requirements.level}</strong>
                                    </div>
                                )}
                                {Object.entries(formData.requirements.attributes).map(([attr, value]) => {
                                    const attrData = COMMON_ATTRIBUTES.find(a => a.id === attr);
                                    return (
                                        <div key={attr} className={styles.summaryLine}>
                                            • {attrData?.icon} {attrData?.label}: <strong>{value}+</strong>
                                        </div>
                                    );
                                })}
                                {formData.requirements.prerequisiteSkills?.map((skill, i) => (
                                    <div key={i} className={styles.summaryLine}>
                                        • Requer: <strong>{skill}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}

function CostsTab({ formData, updateFormData, systemAttributes = [] }) {
    // Filtra atributos que são pools/recursos do sistema
    const poolAttributes = systemAttributes.filter(attr =>
        attr.attributeType === 'pool' ||
        attr.category === 'Recurso' ||
        attr.category === 'Resource' ||
        ['hp', 'mp', 'mana', 'stamina', 'ki', 'focus', 'energy', 'pv', 'pm'].some(
            keyword => attr.name?.toLowerCase().includes(keyword) || attr.shortName?.toLowerCase().includes(keyword)
        )
    );

    // Cria lista de recursos dinâmica
    const RESOURCE_TYPES = [
        { id: 'none', label: '🆓 Nenhum', description: 'Sem custo de recurso' },
        ...poolAttributes.map(attr => ({
            id: attr.id,
            label: `${attr.icon || '💎'} ${attr.name}`,
            description: attr.description || `Usa ${attr.name} como recurso`
        }))
    ];

    // Se não tem pools detectados, adiciona aviso
    const noPoolsWarning = poolAttributes.length === 0;

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Custos de Ativação</h3>
                <p className={styles.sectionDescription}>
                    Configure os recursos necessários para usar esta habilidade
                </p>

                {/* Tipo de Recurso */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Recurso Principal</label>
                    {noPoolsWarning && (
                        <div className={styles.emptyWarning}>
                            💡 Dica: Crie atributos do tipo "Pool" (HP, MP, etc.) na aba de Atributos para definir recursos.
                        </div>
                    )}
                    <div className={styles.optionsGrid}>
                        {RESOURCE_TYPES.map(resource => (
                            <button
                                key={resource.id}
                                className={`${styles.optionCard} ${formData.costs?.activation?.resource === resource.id ? styles.selected : ''}`}
                                onClick={() => updateFormData('costs.activation.resource', resource.id)}
                            >
                                <div className={styles.optionLabel}>{resource.label}</div>
                                <div className={styles.optionDesc}>{resource.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custo de Ativação */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Custo de Ativação</label>
                        <input
                            type="number"
                            min="0"
                            className={styles.input}
                            placeholder="0"
                            value={formData.costs?.activation?.amount || 0}
                            onChange={(e) => updateFormData('costs.activation.amount', parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Custo por Rodada (sustentado)</label>
                        <input
                            type="number"
                            min="0"
                            className={styles.input}
                            placeholder="0"
                            value={formData.costs?.maintenance?.amountPerRound || 0}
                            onChange={(e) => updateFormData('costs.maintenance.amountPerRound', parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>

                {/* Cooldown */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Cooldown: {formData.costs?.cooldown || 0} rodada(s)
                    </label>
                    <input
                        type="range"
                        className={styles.slider}
                        min="0"
                        max="10"
                        value={formData.costs?.cooldown || 0}
                        onChange={(e) => updateFormData('costs.cooldown', parseInt(e.target.value))}
                    />
                    <div className={styles.sliderMarks}>
                        <span>Sem CD</span>
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>

                {/* Usos por Descanso */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Limite de Usos</label>
                    <div className={styles.formRow}>
                        <input
                            type="number"
                            min="0"
                            className={styles.input}
                            placeholder="Ilimitado"
                            value={formData.costs?.usesPerRest || ''}
                            onChange={(e) => updateFormData('costs.usesPerRest', parseInt(e.target.value) || 0)}
                        />
                        <select
                            className={styles.select}
                            value={formData.costs?.restType || 'none'}
                            onChange={(e) => updateFormData('costs.restType', e.target.value)}
                        >
                            <option value="none">Sem limite</option>
                            <option value="short">por Descanso Curto</option>
                            <option value="long">por Descanso Longo</option>
                            <option value="day">por Dia</option>
                        </select>
                    </div>
                </div>

                {/* Resumo */}
                <div className={styles.costsSummary}>
                    <h4>📊 Resumo</h4>
                    <p>
                        {formData.costs?.activation?.resource === 'none' || !formData.costs?.activation?.resource
                            ? 'Sem custo de recurso para ativar'
                            : `${formData.costs?.activation?.amount || 0} ${systemAttributes.find(a => a.id === formData.costs?.activation?.resource)?.name || 'Recurso'
                            } para ativar`}
                        {formData.costs?.cooldown > 0 && `, ${formData.costs.cooldown} rodadas de cooldown`}
                    </p>
                </div>
            </div>
        </div>
    );
}

function RollsTab({ formData, updateFormData, systemAttributes = [] }) {
    const CHECK_TYPES = [
        { id: 'none', label: '🚫 Nenhum', description: 'Sem teste necessário' },
        { id: 'attack', label: '⚔️ Ataque', description: 'Teste de ataque vs defesa' },
        { id: 'save', label: '🛡️ Resistência', description: 'Alvo faz teste para resistir' },
        { id: 'skill', label: '🎯 Perícia', description: 'Teste de perícia/habilidade' },
        { id: 'opposed', label: '⚖️ Contestado', description: 'Ambos rolam dados' }
    ];

    // Usa siglas dinâmicas dos atributos do sistema
    const ATTRIBUTE_SUGGESTIONS = systemAttributes.map(attr => attr.shortName || attr.name?.substring(0, 3).toUpperCase());

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Testes e Rolagens</h3>
                <p className={styles.sectionDescription}>
                    Configure como a habilidade interage com o sistema de dados
                </p>

                {/* Tipo de Teste */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de Teste</label>
                    <div className={styles.optionsGrid}>
                        {CHECK_TYPES.map(check => (
                            <button
                                key={check.id}
                                className={`${styles.optionCard} ${formData.rolls?.checkType === check.id ? styles.selected : ''}`}
                                onClick={() => updateFormData('rolls.checkType', check.id)}
                            >
                                <div className={styles.optionLabel}>{check.label}</div>
                                <div className={styles.optionDesc}>{check.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {formData.rolls?.checkType && formData.rolls.checkType !== 'none' && (
                    <>
                        {/* Atributo Base */}
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Atributo Base</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Ex: DEX, STR, INT..."
                                    value={formData.rolls?.baseAttribute || ''}
                                    onChange={(e) => updateFormData('rolls.baseAttribute', e.target.value)}
                                    list="attribute-list"
                                />
                                <datalist id="attribute-list">
                                    {ATTRIBUTE_SUGGESTIONS.map(attr => (
                                        <option key={attr} value={attr} />
                                    ))}
                                </datalist>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Bônus Adicional</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    placeholder="0"
                                    value={formData.rolls?.bonus || 0}
                                    onChange={(e) => updateFormData('rolls.bonus', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        {/* Fórmula de Dados */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Fórmula de Dados (opcional)</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Ex: 1d20, 2d6+3, 1d20+DEX..."
                                value={formData.rolls?.diceFormula || ''}
                                onChange={(e) => updateFormData('rolls.diceFormula', e.target.value)}
                            />
                        </div>

                        {/* DC para Resistência */}
                        {(formData.rolls?.checkType === 'save' || formData.rolls?.checkType === 'skill') && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Dificuldade (DC): {formData.rolls?.dc || 10}
                                </label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="5"
                                    max="30"
                                    value={formData.rolls?.dc || 10}
                                    onChange={(e) => updateFormData('rolls.dc', parseInt(e.target.value))}
                                />
                                <div className={styles.sliderMarks}>
                                    <span>Fácil (5)</span>
                                    <span>Médio (15)</span>
                                    <span>Épico (30)</span>
                                </div>
                            </div>
                        )}

                        {/* Efeitos de Crítico e Fumble */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>✨ Efeito de Crítico (20 natural)</label>
                            <textarea
                                className={styles.textarea}
                                rows={2}
                                placeholder="Ex: Dano dobrado, efeito estendido..."
                                value={formData.rolls?.criticalEffect || ''}
                                onChange={(e) => updateFormData('rolls.criticalEffect', e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>💀 Efeito de Fumble (1 natural)</label>
                            <textarea
                                className={styles.textarea}
                                rows={2}
                                placeholder="Ex: Habilidade falha, afeta aliado..."
                                value={formData.rolls?.fumbleEffect || ''}
                                onChange={(e) => updateFormData('rolls.fumbleEffect', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ProgressionTab({ formData, updateFormData }) {
    const [newLevel, setNewLevel] = React.useState({ level: 2, benefit: '' });

    const addLevelBenefit = () => {
        if (!newLevel.benefit.trim()) return;
        const levels = [...(formData.progression?.levels || []), newLevel].sort((a, b) => a.level - b.level);
        updateFormData('progression.levels', levels);
        setNewLevel({ level: newLevel.level + 1, benefit: '' });
    };

    const removeBenefit = (i) => {
        updateFormData('progression.levels', (formData.progression?.levels || []).filter((_, idx) => idx !== i));
    };

    return (
        <div className={styles.tabContent}>
            <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Progressão da Habilidade</h3>
                <p className={styles.sectionDescription}>
                    Configure como esta habilidade pode evoluir
                </p>

                {/* Toggle */}
                <div className={styles.toggleSection}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={formData.progression?.enabled || false}
                            onChange={(e) => updateFormData('progression.enabled', e.target.checked)}
                        />
                        <span>📈 Habilidade pode evoluir</span>
                    </label>
                </div>

                {formData.progression?.enabled && (
                    <>
                        {/* Nível Máximo */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Nível Máximo: {formData.progression?.maxLevel || 5}
                            </label>
                            <input
                                type="range"
                                className={styles.slider}
                                min="1"
                                max="10"
                                value={formData.progression?.maxLevel || 5}
                                onChange={(e) => updateFormData('progression.maxLevel', parseInt(e.target.value))}
                            />
                        </div>

                        {/* Lista de benefícios */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>🌟 Benefícios por Nível</label>
                            {(formData.progression?.levels || []).map((lv, i) => (
                                <div key={i} className={styles.benefitRow}>
                                    <span className={styles.benefitLevel}>Nv.{lv.level}</span>
                                    <span className={styles.benefitText}>{lv.benefit}</span>
                                    <button className={styles.removeBtn} onClick={() => removeBenefit(i)}>×</button>
                                </div>
                            ))}
                        </div>

                        {/* Adicionar */}
                        <div className={styles.formRow}>
                            <select
                                className={styles.select}
                                value={newLevel.level}
                                onChange={(e) => setNewLevel({ ...newLevel, level: parseInt(e.target.value) })}
                            >
                                {Array.from({ length: 9 }, (_, i) => i + 2).map(l => (
                                    <option key={l} value={l}>Nível {l}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Ex: +2 dano, +1 alcance..."
                                value={newLevel.benefit}
                                onChange={(e) => setNewLevel({ ...newLevel, benefit: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && addLevelBenefit()}
                            />
                            <button className={styles.addButton} onClick={addLevelBenefit}>+</button>
                        </div>

                        {/* Templates */}
                        <div className={styles.templatesRow}>
                            <button
                                className={styles.templateBtn}
                                onClick={() => updateFormData('progression.levels', [
                                    { level: 2, benefit: '+1 Rank' },
                                    { level: 3, benefit: '+1 Alcance' },
                                    { level: 4, benefit: '+2 Rank' },
                                    { level: 5, benefit: 'Efeito extra' }
                                ])}
                            >
                                ⚔️ Combate
                            </button>
                            <button
                                className={styles.templateBtn}
                                onClick={() => updateFormData('progression.levels', [
                                    { level: 2, benefit: '-1 Custo' },
                                    { level: 3, benefit: '+1 alvo' },
                                    { level: 4, benefit: 'Duração 2x' },
                                    { level: 5, benefit: 'Sem manutenção' }
                                ])}
                            >
                                💙 Magia
                            </button>
                            <button className={styles.templateBtn} onClick={() => updateFormData('progression.levels', [])}>
                                🧹 Limpar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
