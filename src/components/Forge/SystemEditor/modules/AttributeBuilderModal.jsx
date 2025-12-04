import React, { useState } from 'react';
import styles from './AttributeBuilderModal.module.css';
import { X, Sparkles, TrendingUp, Target, Calculator, Info, Plus, Trash2, Palette, Zap } from 'lucide-react';

const MODIFIER_TEMPLATES = [
    { id: 'dnd', name: 'D&D Style', description: 'Modificador de -5 a +10', icon: '🎲', formula: '(value - 10) / 2', preview: (val) => Math.floor((val - 10) / 2) },
    { id: 'linear', name: 'Linear Simples', description: 'Valor direto do atributo', icon: '📈', formula: 'value', preview: (val) => val },
    { id: 'percentage', name: 'Porcentagem', description: 'Valor × 5 (para %)', icon: '💯', formula: 'value * 5', preview: (val) => val * 5 },
    { id: 'custom', name: 'Personalizado', description: 'Builder visual customizado', icon: '⚙️', formula: null, preview: null }
];

const VISUAL_OPERATORS = [
    { id: 'add', label: '+', symbol: '+' },
    { id: 'subtract', label: '−', symbol: '-' },
    { id: 'multiply', label: '×', symbol: '*' },
    { id: 'divide', label: '÷', symbol: '/' }
];

const ATTRIBUTE_TYPES = [
    { id: 'numeric', name: 'Numérico', icon: '🔢', description: 'Valor simples (ex: Força, Destreza)' },
    { id: 'pool', name: 'Recurso/Pool', icon: '❤️', description: 'Tem atual e máximo (ex: HP, Mana)' },
    { id: 'dice_pool', name: 'Dice Pool', icon: '🎲', description: 'Define quantos dados rolar' },
    { id: 'progress', name: 'Barra de Progresso', icon: '📊', description: 'Para XP, limites, etc' }
];

const PRESET_COLORS = [
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Laranja', value: '#f97316' },
    { name: 'Amarelo', value: '#eab308' },
    { name: 'Verde', value: '#22c55e' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Roxo', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Ciano', value: '#06b6d4' }
];

export function AttributeBuilderModal({ attribute, onSave, onClose, allAttributes }) {
    const [localAttr, setLocalAttr] = useState(attribute || {
        name: '', shortName: '', type: 'numeric',
        attributeType: 'numeric',
        min: 1, max: 20, default: 10,
        modifierTemplate: 'dnd',
        customModifier: { steps: [{ type: 'value', operation: null, value: null }] },
        description: '',
        tier: 'primary',
        dependencies: [],
        connections: [],
        showOnSheet: true,
        showModifier: true,
        editable: true,
        color: '#8b5cf6',
        xpCostFormula: 'value * 5',
        levelCaps: []
    });

    const [currentTab, setCurrentTab] = useState('basic');
    const [previewValue, setPreviewValue] = useState(localAttr.default || 10);

    const handleSave = () => {
        const template = MODIFIER_TEMPLATES.find(t => t.id === localAttr.modifierTemplate);
        const formulaFromSteps = localAttr.customModifier.steps.map((step, i) => {
            if (step.type === 'value') return 'value';
            if (step.type === 'operation' && i > 0) return ` ${step.operation} ${step.value || 0}`;
            return '';
        }).join('');

        onSave({
            ...localAttr,
            modifierFormula: template?.formula || formulaFromSteps || 'value'
        });
        onClose();
    };

    const calculatePreview = () => {
        const template = MODIFIER_TEMPLATES.find(t => t.id === localAttr.modifierTemplate);
        return template?.preview ? template.preview(previewValue) : '?';
    };

    const addModifierStep = () => {
        setLocalAttr({
            ...localAttr,
            customModifier: {
                steps: [...localAttr.customModifier.steps, { type: 'operation', operation: '+', value: 0 }]
            }
        });
    };

    const removeModifierStep = (index) => {
        if (localAttr.customModifier.steps.length <= 1) return;
        const newSteps = localAttr.customModifier.steps.filter((_, i) => i !== index);
        setLocalAttr({ ...localAttr, customModifier: { steps: newSteps } });
    };

    const addConnection = () => {
        setLocalAttr({
            ...localAttr,
            connections: [
                ...(localAttr.connections || []),
                { attributeId: '', multiplier: 1, operation: 'add' }
            ]
        });
    };

    const removeConnection = (index) => {
        setLocalAttr({
            ...localAttr,
            connections: (localAttr.connections || []).filter((_, i) => i !== index)
        });
    };

    const updateConnection = (index, field, value) => {
        const newConnections = [...(localAttr.connections || [])];
        newConnections[index] = { ...newConnections[index], [field]: value };
        setLocalAttr({ ...localAttr, connections: newConnections });
    };

    const addLevelCap = () => {
        setLocalAttr({
            ...localAttr,
            levelCaps: [...(localAttr.levelCaps || []), { level: 1, maxValue: 15 }]
        });
    };

    const removeLevelCap = (index) => {
        setLocalAttr({
            ...localAttr,
            levelCaps: (localAttr.levelCaps || []).filter((_, i) => i !== index)
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerIcon}><Sparkles size={24} /></div>
                    <div>
                        <h2 className={styles.modalTitle}>{attribute ? 'Editar Atributo' : 'Criar Novo Atributo'}</h2>
                        <p className={styles.modalSubtitle}>Configure todos os aspectos do atributo de forma visual</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${currentTab === 'basic' ? styles.active : ''}`} onClick={() => setCurrentTab('basic')}>
                        <Info size={16} /> Básico
                    </button>
                    <button className={`${styles.tab} ${currentTab === 'type' ? styles.active : ''}`} onClick={() => setCurrentTab('type')}>
                        <Zap size={16} /> Tipo
                    </button>
                    <button className={`${styles.tab} ${currentTab === 'modifier' ? styles.active : ''}`} onClick={() => setCurrentTab('modifier')}>
                        <Calculator size={16} /> Modificador
                    </button>
                    <button className={`${styles.tab} ${currentTab === 'connections' ? styles.active : ''}`} onClick={() => setCurrentTab('connections')}>
                        <Target size={16} /> Conexões
                    </button>
                    <button className={`${styles.tab} ${currentTab === 'visual' ? styles.active : ''}`} onClick={() => setCurrentTab('visual')}>
                        <Palette size={16} /> Visual
                    </button>
                    <button className={`${styles.tab} ${currentTab === 'advanced' ? styles.active : ''}`} onClick={() => setCurrentTab('advanced')}>
                        <TrendingUp size={16} /> Avançado
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {currentTab === 'basic' && (
                        <div className={styles.tabContent}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Nome do Atributo</label>
                                    <input type="text" placeholder="Ex: Força, Destreza" value={localAttr.name} onChange={e => setLocalAttr({ ...localAttr, name: e.target.value })} className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Abreviação</label>
                                    <input type="text" placeholder="Ex: FOR, DES" value={localAttr.shortName} onChange={e => setLocalAttr({ ...localAttr, shortName: e.target.value.toUpperCase() })} maxLength={5} className={styles.input} />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Valor Mínimo</label>
                                    <input type="number" value={localAttr.min} onChange={e => setLocalAttr({ ...localAttr, min: parseInt(e.target.value) })} className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Valor Padrão</label>
                                    <input type="number" value={localAttr.default} onChange={e => setLocalAttr({ ...localAttr, default: parseInt(e.target.value) })} className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Valor Máximo</label>
                                    <input type="number" value={localAttr.max} onChange={e => setLocalAttr({ ...localAttr, max: parseInt(e.target.value) })} className={styles.input} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Descrição</label>
                                <textarea placeholder="Descreva o atributo..." value={localAttr.description} onChange={e => setLocalAttr({ ...localAttr, description: e.target.value })} className={styles.textarea} rows={3} />
                            </div>
                        </div>
                    )}

                    {currentTab === 'type' && (
                        <div className={styles.tabContent}>
                            <div className={styles.infoCard}>
                                <Zap size={20} />
                                <div>
                                    <strong>Tipos de Atributos</strong>
                                    <p>Escolha como este atributo funciona. Pools têm valor atual/máximo, Dice Pools definem dados.</p>
                                </div>
                            </div>

                            <h3 className={styles.sectionTitle}>Escolha o Tipo</h3>
                            <div className={styles.typeGrid}>
                                {ATTRIBUTE_TYPES.map(type => (
                                    <div key={type.id} className={`${styles.typeCard} ${localAttr.attributeType === type.id ? styles.selected : ''}`} onClick={() => setLocalAttr({ ...localAttr, attributeType: type.id })}>
                                        <div className={styles.typeIcon}>{type.icon}</div>
                                        <div className={styles.typeName}>{type.name}</div>
                                        <div className={styles.typeDesc}>{type.description}</div>
                                    </div>
                                ))}
                            </div>

                            {localAttr.attributeType === 'dice_pool' && (
                                <div className={styles.typeOptions}>
                                    <h3 className={styles.sectionTitle}>Configurar Dice Pool</h3>
                                    <div className={styles.formGroup}>
                                        <label>Tipo de Dado</label>
                                        <select className={styles.input} value={localAttr.diceType || 'd6'} onChange={e => setLocalAttr({ ...localAttr, diceType: e.target.value })}>
                                            <option value="d4">d4 (4 lados)</option>
                                            <option value="d6">d6 (6 lados)</option>
                                            <option value="d8">d8 (8 lados)</option>
                                            <option value="d10">d10 (10 lados)</option>
                                            <option value="d12">d12 (12 lados)</option>
                                            <option value="d20">d20 (20 lados)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentTab === 'modifier' && (
                        <div className={styles.tabContent}>
                            <div className={styles.infoCard}>
                                <TrendingUp size={20} />
                                <div>
                                    <strong>Modificadores</strong>
                                    <p>Valores derivados que facilitam cálculos. Ex: no D&D, atributo 16 = modificador +3</p>
                                </div>
                            </div>

                            <h3 className={styles.sectionTitle}>Escolha um Template</h3>
                            <div className={styles.templatesGrid}>
                                {MODIFIER_TEMPLATES.map(template => (
                                    <div key={template.id} className={`${styles.templateCard} ${localAttr.modifierTemplate === template.id ? styles.selected : ''}`} onClick={() => setLocalAttr({ ...localAttr, modifierTemplate: template.id })}>
                                        <div className={styles.templateIcon}>{template.icon}</div>
                                        <div className={styles.templateName}>{template.name}</div>
                                        <div className={styles.templateDesc}>{template.description}</div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.previewSection}>
                                <h3 className={styles.sectionTitle}>Preview do Modificador</h3>
                                <input type="range" min={localAttr.min} max={localAttr.max} value={previewValue} onChange={e => setPreviewValue(parseInt(e.target.value))} className={styles.slider} />
                                <div className={styles.previewValues}>
                                    <div className={styles.previewBox}>
                                        <span className={styles.previewLabel}>Valor</span>
                                        <span className={styles.previewNumber}>{previewValue}</span>
                                    </div>
                                    <span className={styles.arrow}>→</span>
                                    <div className={styles.previewBox}>
                                        <span className={styles.previewLabel}>Modificador</span>
                                        <span className={styles.previewNumber}>{calculatePreview()}</span>
                                    </div>
                                </div>
                            </div>

                            {localAttr.modifierTemplate === 'custom' && (
                                <div className={styles.customBuilder}>
                                    <h3 className={styles.sectionTitle}>Builder Visual Customizado</h3>
                                    <p className={styles.sectionDesc}>Monte sua fórmula visualmente</p>
                                    <div className={styles.builderSteps}>
                                        {localAttr.customModifier.steps.map((step, index) => (
                                            <div key={index} className={styles.builderStep}>
                                                {step.type === 'value' ? (
                                                    <div className={styles.valueBlock}>Valor do Atributo</div>
                                                ) : (
                                                    <>
                                                        <select value={step.operation || '+'} onChange={e => {
                                                            const newSteps = [...localAttr.customModifier.steps];
                                                            newSteps[index].operation = e.target.value;
                                                            setLocalAttr({ ...localAttr, customModifier: { steps: newSteps } });
                                                        }} className={styles.operatorSelect}>
                                                            {VISUAL_OPERATORS.map(op => (<option key={op.id} value={op.symbol}>{op.label}</option>))}
                                                        </select>
                                                        <input type="number" value={step.value || 0} onChange={e => {
                                                            const newSteps = [...localAttr.customModifier.steps];
                                                            newSteps[index].value = parseFloat(e.target.value);
                                                            setLocalAttr({ ...localAttr, customModifier: { steps: newSteps } });
                                                        }} className={styles.numberInput} />
                                                        <button className={styles.removeStepBtn} onClick={() => removeModifierStep(index)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                        <button className={styles.addStepBtn} onClick={addModifierStep}>
                                            <Plus size={16} /> Adicionar Operação
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentTab === 'connections' && (
                        <div className={styles.tabContent}>
                            <div className={styles.infoCard}>
                                <Target size={20} />
                                <div>
                                    <strong>Conexões Entre Atributos</strong>
                                    <p>Defina como este atributo se relaciona com outros. Ex: PV = 2×CON + 1×FOR</p>
                                </div>
                            </div>

                            <h3 className={styles.sectionTitle}>Configurar Conexões</h3>
                            <div className={styles.connectionsList}>
                                {(localAttr.connections || []).map((conn, index) => (
                                    <div key={index} className={styles.connectionCard}>
                                        <div className={styles.connectionRow}>
                                            <select
                                                value={conn.attributeId}
                                                onChange={e => updateConnection(index, 'attributeId', e.target.value)}
                                                className={styles.input}
                                            >
                                                <option value="">Selecione um atributo</option>
                                                {allAttributes.filter(a => a.id !== attribute?.id).map(attr => (
                                                    <option key={attr.id} value={attr.id}>{attr.name || 'Sem nome'} ({attr.shortName})</option>
                                                ))}
                                            </select>
                                            <select
                                                value={conn.operation || 'add'}
                                                onChange={e => updateConnection(index, 'operation', e.target.value)}
                                                className={styles.operatorSelect}
                                            >
                                                <option value="add">+</option>
                                                <option value="subtract">−</option>
                                                <option value="multiply">×</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Multiplicador"
                                                value={conn.multiplier}
                                                onChange={e => updateConnection(index, 'multiplier', parseFloat(e.target.value))}
                                                className={styles.numberInput}
                                                step="0.1"
                                            />
                                            <button className={styles.removeStepBtn} onClick={() => removeConnection(index)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className={styles.addStepBtn} onClick={addConnection}>
                                    <Plus size={16} /> Adicionar Conexão
                                </button>
                            </div>
                        </div>
                    )}

                    {currentTab === 'visual' && (
                        <div className={styles.tabContent}>
                            <div className={styles.infoCard}>
                                <Palette size={20} />
                                <div>
                                    <strong>Personalização Visual</strong>
                                    <p>Defina a cor temática deste atributo para destacá-lo na ficha de personagem</p>
                                </div>
                            </div>

                            <h3 className={styles.sectionTitle}>Cor do Atributo</h3>
                            <div className={styles.colorGrid}>
                                {PRESET_COLORS.map(color => (
                                    <div
                                        key={color.value}
                                        className={`${styles.colorOption} ${localAttr.color === color.value ? styles.selected : ''}`}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => setLocalAttr({ ...localAttr, color: color.value })}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Ou escolha uma cor personalizada</label>
                                <div className={styles.colorPickerRow}>
                                    <input
                                        type="color"
                                        value={localAttr.color || '#8b5cf6'}
                                        onChange={e => setLocalAttr({ ...localAttr, color: e.target.value })}
                                        className={styles.colorPicker}
                                    />
                                    <input
                                        type="text"
                                        value={localAttr.color || '#8b5cf6'}
                                        onChange={e => setLocalAttr({ ...localAttr, color: e.target.value })}
                                        className={styles.input}
                                        placeholder="#8b5cf6"
                                    />
                                </div>
                            </div>

                            <div className={styles.previewSection}>
                                <h3 className={styles.sectionTitle}>Preview</h3>
                                <div className={styles.attributePreview} style={{ borderColor: localAttr.color, boxShadow: `0 0 20px ${localAttr.color}40` }}>
                                    <div className={styles.previewShort} style={{ color: localAttr.color }}>{localAttr.shortName || 'ATR'}</div>
                                    <div className={styles.previewName}>{localAttr.name || 'Atributo'}</div>
                                    <div className={styles.previewValue} style={{ background: `linear-gradient(135deg, ${localAttr.color}30, ${localAttr.color}10)` }}>
                                        {localAttr.default || 10}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'advanced' && (
                        <div className={styles.tabContent}>
                            {/* Hierarquia */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Categoria do Atributo</h3>
                                <p className={styles.sectionDesc}>Organize seus atributos em categorias personalizadas</p>

                                <div className={styles.formGroup}>
                                    <label>Categoria / Tipo</label>
                                    <input
                                        type="text"
                                        value={localAttr.category || ''}
                                        onChange={e => setLocalAttr({ ...localAttr, category: e.target.value })}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && localAttr.category?.trim()) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={styles.input}
                                        placeholder="Digite e pressione Enter (ex: Atributo Base, Perícia, Proficiência...)"
                                    />

                                    {localAttr.category && (
                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(139, 92, 246, 0.2)',
                                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                                borderRadius: '20px',
                                                color: '#a78bfa',
                                                fontSize: '0.9rem',
                                                fontWeight: '500'
                                            }}>
                                                <span>{localAttr.category}</span>
                                                <button
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#a78bfa',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        lineHeight: '1',
                                                        padding: '0',
                                                        width: '20px',
                                                        height: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onClick={() => setLocalAttr({ ...localAttr, category: '' })}
                                                    type="button"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <small className={styles.hint}>
                                        💡 Exemplos: "Atributo Base", "Perícia", "Proficiência", "Recurso", "Habilidade Especial"
                                    </small>
                                </div>
                            </div>

                            {/* Evolução */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Regras de Evolução</h3>
                                <p className={styles.sectionDesc}>Defina como este atributo evolui ao longo do jogo</p>

                                <div className={styles.formGroup}>
                                    <label>Método de Evolução</label>
                                    <select
                                        value={localAttr.evolutionType || 'xp'}
                                        onChange={e => setLocalAttr({ ...localAttr, evolutionType: e.target.value })}
                                        className={styles.input}
                                    >
                                        <option value="none">🚫 Não Evoluível (Calculado/Derivado)</option>
                                        <option value="xp">📈 Custo de XP (Experiência)</option>
                                        <option value="points">💎 Pontos de Atributo (Build Points)</option>
                                        <option value="milestone">🚩 Milestone / Manual (Sem custo)</option>
                                        <option value="training">⚔️ Treinamento (Tempo/Recursos)</option>
                                    </select>
                                    <small className={styles.hint}>
                                        💡 Use "Não Evoluível" para atributos calculados via Conexões (ex: Vida = CON × 2)
                                    </small>
                                </div>

                                {/* None Config */}
                                {localAttr.evolutionType === 'none' && (
                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', alignItems: 'flex-start', lineHeight: '1.6' }}>
                                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#fca5a5' }}>Atributo Não Evoluível</p>
                                            <p style={{ margin: 0 }}>Este atributo não pode ser evoluído diretamente. Use a aba <strong>Conexões</strong> para definir como ele é calculado a partir de outros atributos (ex: Vida = Constituição × 2 + Nível × 3).</p>
                                        </div>
                                    </div>
                                )}

                                {/* XP Config */}
                                {(!localAttr.evolutionType || localAttr.evolutionType === 'xp') && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div className={styles.formGroup}>
                                            <label>Fórmula de Custo de XP</label>
                                            <div className={styles.xpFormulaBuilder}>
                                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Custo =</span>
                                                <select
                                                    value={localAttr.xpBase || 'value'}
                                                    onChange={e => setLocalAttr({ ...localAttr, xpBase: e.target.value })}
                                                    className={styles.input}
                                                >
                                                    <option value="value">Valor Atual</option>
                                                    <option value="fixed">Valor Fixo</option>
                                                </select>
                                                {localAttr.xpBase === 'fixed' && (
                                                    <input
                                                        type="number"
                                                        value={localAttr.xpFixed || 10}
                                                        onChange={e => setLocalAttr({ ...localAttr, xpFixed: parseInt(e.target.value) })}
                                                        className={styles.numberInput}
                                                        style={{ width: '100px' }}
                                                    />
                                                )}
                                                <select
                                                    value={localAttr.xpOperation || 'multiply'}
                                                    onChange={e => setLocalAttr({ ...localAttr, xpOperation: e.target.value })}
                                                    className={styles.input}
                                                >
                                                    <option value="multiply">×</option>
                                                    <option value="add">+</option>
                                                    <option value="power">^</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={localAttr.xpMultiplier || 5}
                                                    onChange={e => setLocalAttr({ ...localAttr, xpMultiplier: parseFloat(e.target.value) })}
                                                    className={styles.numberInput}
                                                    step="0.1"
                                                    style={{ width: '100px' }}
                                                />
                                            </div>
                                            <div className={styles.xpFormulaPreview}>
                                                <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#60a5fa' }}>Preview:</strong>
                                                <small style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                    Para subir de 10 → 11 custará:
                                                    <span style={{ color: '#fff', fontWeight: 'bold', marginLeft: '5px' }}>
                                                        {localAttr.xpOperation === 'multiply' ? (10 * (localAttr.xpMultiplier || 5)) : localAttr.xpOperation === 'add' ? (10 + (localAttr.xpMultiplier || 5)) : Math.pow(10, (localAttr.xpMultiplier || 5))} XP
                                                    </span>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Points Config */}
                                {localAttr.evolutionType === 'points' && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div className={styles.formGroup}>
                                            <label>Custo em Pontos</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <input
                                                    type="number"
                                                    value={localAttr.pointsCost || 1}
                                                    onChange={e => setLocalAttr({ ...localAttr, pointsCost: parseInt(e.target.value) })}
                                                    className={styles.input}
                                                    style={{ width: '120px' }}
                                                />
                                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>pontos por nível</span>
                                            </div>
                                            <small className={styles.hint}>Ex: Custa 1 ponto de atributo para aumentar em +1</small>
                                        </div>
                                    </div>
                                )}

                                {/* Milestone Config */}
                                {localAttr.evolutionType === 'milestone' && (
                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', alignItems: 'flex-start', lineHeight: '1.6' }}>
                                        <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <p style={{ margin: 0 }}>Neste método, o atributo só aumenta quando o Mestre permitir ou em momentos específicos da história. Não há custo automático.</p>
                                    </div>
                                )}

                                {/* Training Config */}
                                {localAttr.evolutionType === 'training' && (
                                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className={styles.formGroup}>
                                            <label>Tempo Necessário (Dias)</label>
                                            <input
                                                type="number"
                                                value={localAttr.trainingTime || 7}
                                                onChange={e => setLocalAttr({ ...localAttr, trainingTime: parseInt(e.target.value) })}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Custo em Ouro</label>
                                            <input
                                                type="number"
                                                value={localAttr.trainingCost || 100}
                                                onChange={e => setLocalAttr({ ...localAttr, trainingCost: parseInt(e.target.value) })}
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Limites por Nível */}
                                <h3 className={styles.subsectionTitle}>Limites por Nível</h3>
                                <div className={styles.levelCapsList}>
                                    {(localAttr.levelCaps || []).map((cap, index) => (
                                        <div key={index} className={styles.levelCapRow}>
                                            <input
                                                type="number"
                                                placeholder="Nível"
                                                value={cap.level}
                                                onChange={e => {
                                                    const newCaps = [...(localAttr.levelCaps || [])];
                                                    newCaps[index].level = parseInt(e.target.value);
                                                    setLocalAttr({ ...localAttr, levelCaps: newCaps });
                                                }}
                                                className={styles.numberInput}
                                            />
                                            <span>→</span>
                                            <input
                                                type="number"
                                                placeholder="Máximo"
                                                value={cap.maxValue}
                                                onChange={e => {
                                                    const newCaps = [...(localAttr.levelCaps || [])];
                                                    newCaps[index].maxValue = parseInt(e.target.value);
                                                    setLocalAttr({ ...localAttr, levelCaps: newCaps });
                                                }}
                                                className={styles.numberInput}
                                            />
                                            <button className={styles.removeStepBtn} onClick={() => removeLevelCap(index)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button className={styles.addStepBtn} onClick={addLevelCap}>
                                        <Plus size={16} /> Adicionar Limite
                                    </button>
                                </div>
                            </div>

                            {/* Configurações de Exibição */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Configurações de Exibição</h3>
                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" checked={localAttr.showOnSheet !== false} onChange={e => setLocalAttr({ ...localAttr, showOnSheet: e.target.checked })} />
                                        <span>Exibir na ficha de personagem</span>
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" checked={localAttr.showModifier !== false} onChange={e => setLocalAttr({ ...localAttr, showModifier: e.target.checked })} />
                                        <span>Exibir modificador</span>
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" checked={localAttr.editable !== false} onChange={e => setLocalAttr({ ...localAttr, editable: e.target.checked })} />
                                        <span>Jogador pode editar</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        <Sparkles size={16} />
                        Salvar Atributo
                    </button>
                </div>
            </div>
        </div >
    );
}
