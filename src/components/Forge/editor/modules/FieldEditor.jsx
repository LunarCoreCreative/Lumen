import React, { useState, useMemo } from 'react';
import { sanitizeCodeId, normalizeField } from '../../../../forge/core/IdHelpers';
import styles from '../Editor.module.css';
import { Label, HELP } from '../components/HelpTip';
import {
    Plus, Trash2, Hash, Type, ToggleLeft, List, Gauge, Calculator,
    Settings2, Eye, EyeOff, Sparkles, Copy, Search, Filter, Dices,
    Layers, Zap, Palette, Shield, ChevronDown, ChevronRight, Play
} from 'lucide-react';

/**
 * FieldEditor - Editor de Campos DEFINITIVO
 * 
 * A versão perfeita que permite criar qualquer tipo de informação para RPG.
 */

// ========== CONSTANTS ==========

const FIELD_TYPES = [
    { id: 'number', label: 'Número', icon: Hash, color: '#3b82f6', description: 'Valor numérico simples', example: 'Força, Nível, CA' },
    { id: 'resource', label: 'Recurso', icon: Gauge, color: '#ef4444', description: 'Atual/Máximo com barra', example: 'HP, Mana, Slots' },
    { id: 'dice', label: 'Dado', icon: Dices, color: '#f59e0b', description: 'Rolagem (1d8+2)', example: 'Dano, Dado de Vida' },
    { id: 'computed', label: 'Fórmula', icon: Calculator, color: '#8b5cf6', description: 'Calculado automaticamente', example: 'Mod. Força, Bônus' },
    { id: 'text', label: 'Texto', icon: Type, color: '#10b981', description: 'Texto livre', example: 'Nome, Notas' },
    { id: 'boolean', label: 'Booleano', icon: ToggleLeft, color: '#6366f1', description: 'Sim/Não', example: 'Inspiração, Inconsciente' },
    { id: 'select', label: 'Seleção', icon: List, color: '#ec4899', description: 'Lista de opções', example: 'Classe, Alinhamento' },
    { id: 'list', label: 'Lista', icon: Layers, color: '#14b8a6', description: 'Coleção de itens', example: 'Inventário, Magias' }
];

const FIELD_CATEGORIES = [
    { id: 'attributes', label: 'Atributos', icon: '💪', color: '#ef4444' },
    { id: 'combat', label: 'Combate', icon: '⚔️', color: '#f59e0b' },
    { id: 'resources', label: 'Recursos', icon: '❤️', color: '#10b981' },
    { id: 'skills', label: 'Perícias', icon: '🎯', color: '#3b82f6' },
    { id: 'magic', label: 'Magia', icon: '✨', color: '#8b5cf6' },
    { id: 'info', label: 'Informações', icon: '📋', color: '#6b7280' },
    { id: 'inventory', label: 'Inventário', icon: '🎒', color: '#a855f7' },
    { id: 'meta', label: 'Meta', icon: '⚙️', color: '#64748b' }
];

const DISPLAY_MODES = [
    { id: 'number', label: 'Número simples' },
    { id: 'bar', label: 'Barra de progresso' },
    { id: 'attribute_block', label: 'Bloco de atributo' },
    { id: 'dice', label: 'Dado clicável' },
    { id: 'icon_number', label: 'Ícone + Número' },
    { id: 'text', label: 'Campo de texto' },
    { id: 'checkbox', label: 'Checkbox' },
    { id: 'hidden', label: 'Oculto' }
];

const TRIGGERS = [
    { id: 'onUpdate', label: 'Ao Atualizar', description: 'Quando o valor muda' },
    { id: 'onIncrease', label: 'Ao Aumentar', description: 'Quando o valor sobe' },
    { id: 'onDecrease', label: 'Ao Diminuir', description: 'Quando o valor desce' },
    { id: 'onZero', label: 'Ao Zerar', description: 'Quando chega a zero' },
    { id: 'onMax', label: 'Ao Maximizar', description: 'Quando atinge o máximo' }
];

const DEFAULT_FIELD = {
    id: '',
    name: '',
    type: 'number',
    category: 'attributes',
    description: '',
    icon: '',

    // Número
    defaultValue: 0,
    min: null,
    max: null,
    step: 1,
    roundMode: null, // 'floor' | 'ceil' | 'round'

    // Recurso
    resource: {
        maxFormula: '',
        currentFormula: '',
        allowOverflow: false,
        allowNegative: false,
        barColor: '#ef4444',
        showBar: true
    },

    // Dado
    dice: {
        formula: '1d6',
        exploding: false,
        autoRoll: false
    },

    // Fórmula/Calculado
    formula: '',
    showFormulaTooltip: false,

    // Texto
    text: {
        multiline: false,
        maxLength: null,
        markdown: false,
        placeholder: ''
    },

    // Seleção
    options: [],

    // Lista
    list: {
        itemType: 'text',
        maxItems: null
    },

    // Comportamento
    behavior: {
        modifiable: true,  // Pode receber modificadores
        rollable: false,   // Pode ser usado em rolagens
        triggers: []       // Eventos nativos
    },

    // Visualização
    display: {
        mode: 'number',
        showLabel: true,
        showOnSheet: true,
        gridSize: 1,
        color: null
    },

    // Validação
    validation: {
        required: false,
        integer: false,
        pattern: null
    },

    // Metadados
    meta: {
        tags: [],
        readonly: false,
        hidden: false,
        scope: 'entity', // 'entity' | 'global' | 'session'
        priority: 0
    }
};

// ========== COMPONENT ==========

export function FieldEditor({ fields = [], onChange }) {
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [expandedSections, setExpandedSections] = useState({
        identification: true,
        type: true,
        config: true,
        behavior: false,
        display: false,
        validation: false,
        meta: false,
        preview: true
    });

    const selectedField = fields.find(f => f.id === selectedId);

    // Filtered fields
    const filteredFields = useMemo(() => {
        return fields.filter(field => {
            const matchesSearch = !searchQuery ||
                field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                field.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'all' || field.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [fields, searchQuery, typeFilter]);

    // Toggle section
    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Add field
    const handleAddField = () => {
        const newField = {
            ...JSON.parse(JSON.stringify(DEFAULT_FIELD)),
            id: `field_${Date.now()}`,
            name: `Novo Campo ${fields.length + 1}`
        };
        onChange([...fields, newField]);
        setSelectedId(newField.id);
    };

    // Duplicate field
    const handleDuplicateField = (field) => {
        const newField = {
            ...JSON.parse(JSON.stringify(field)),
            id: `${field.id}_copy`,
            name: `${field.name} (Cópia)`
        };
        onChange([...fields, newField]);
        setSelectedId(newField.id);
    };

    // Update field
    const handleUpdateField = (updates) => {
        // If we're updating the ID, we need to also update selectedId
        if (updates.id && updates.id !== selectedId) {
            setSelectedId(updates.id);
        }
        onChange(fields.map(f =>
            f.id === selectedId ? { ...f, ...updates } : f
        ));
    };

    // Deep update (for nested objects)
    const handleDeepUpdate = (path, value) => {
        const keys = path.split('.');
        const updated = { ...selectedField };
        let current = updated;

        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        onChange(fields.map(f => f.id === selectedId ? updated : f));
    };

    // Delete field
    const handleDeleteField = () => {
        onChange(fields.filter(f => f.id !== selectedId));
        setSelectedId(null);
    };

    // Options management
    const handleAddOption = () => {
        const options = selectedField.options || [];
        handleUpdateField({
            options: [...options, { value: `opt_${options.length}`, label: `Opção ${options.length + 1}`, icon: '' }]
        });
    };

    const handleUpdateOption = (index, updates) => {
        const options = [...(selectedField.options || [])];
        options[index] = { ...options[index], ...updates };
        handleUpdateField({ options });
    };

    const handleRemoveOption = (index) => {
        const options = [...(selectedField.options || [])];
        options.splice(index, 1);
        handleUpdateField({ options });
    };

    // Render Section Header
    const SectionHeader = ({ id, title, icon: Icon }) => (
        <button
            className={styles.sectionHeader}
            onClick={() => toggleSection(id)}
        >
            {expandedSections[id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {Icon && <Icon size={16} />}
            <span>{title}</span>
        </button>
    );

    return (
        <div className={styles.fieldEditorGrid}>
            {/* ========== LISTA DE CAMPOS ========== */}
            <div className={styles.fieldList}>
                <div className={styles.fieldListHeader}>
                    <h3>Campos ({fields.length})</h3>
                    <button className={styles.addButton} onClick={handleAddField} title="Adicionar campo">
                        <Plus size={18} />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className={styles.fieldListFilters}>
                    <div className={styles.searchBox}>
                        <Search size={14} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className={styles.typeFilterSelect}
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        {FIELD_TYPES.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {/* Field Items */}
                <div className={styles.fieldItems}>
                    {filteredFields.map(field => {
                        const typeInfo = FIELD_TYPES.find(t => t.id === field.type);
                        const catInfo = FIELD_CATEGORIES.find(c => c.id === field.category);
                        return (
                            <div
                                key={field.id}
                                className={`${styles.fieldItem} ${selectedId === field.id ? styles.fieldItemActive : ''}`}
                                onClick={() => setSelectedId(field.id)}
                            >
                                <span
                                    className={styles.fieldIcon}
                                    style={{ background: `${typeInfo?.color}20`, color: typeInfo?.color }}
                                >
                                    {field.icon || catInfo?.icon || '📦'}
                                </span>
                                <div className={styles.fieldItemInfo}>
                                    <div className={styles.fieldItemName}>{field.name || 'Sem nome'}</div>
                                    <div className={styles.fieldItemMeta}>
                                        <span style={{ color: typeInfo?.color }}>{typeInfo?.label}</span>
                                        {field.formula && <span className={styles.fieldBadge}>ƒx</span>}
                                        {field.behavior?.triggers?.length > 0 && <span className={styles.fieldBadge}>⚡</span>}
                                    </div>
                                </div>
                                <button
                                    className={styles.fieldItemAction}
                                    onClick={(e) => { e.stopPropagation(); handleDuplicateField(field); }}
                                    title="Duplicar"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        );
                    })}
                    {filteredFields.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>{fields.length === 0 ? 'Nenhum campo criado' : 'Nenhum resultado'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== EDITOR PRINCIPAL ========== */}
            <div className={styles.fieldForm}>
                {selectedField ? (
                    <div className={styles.fieldFormScroll}>
                        {/* Header */}
                        <div className={styles.fieldFormHeader}>
                            <h3>
                                <span className={styles.fieldFormIcon}>{selectedField.icon || FIELD_CATEGORIES.find(c => c.id === selectedField.category)?.icon || '📦'}</span>
                                {selectedField.name || 'Campo sem nome'}
                            </h3>
                            <button className={styles.deleteButton} onClick={handleDeleteField}>
                                <Trash2 size={16} /> Excluir
                            </button>
                        </div>

                        {/* ===== A) IDENTIFICAÇÃO ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="identification" title="Identificação" />
                            {expandedSections.identification && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Nome de Exibição" help={HELP.displayName} />
                                            <input
                                                type="text"
                                                value={selectedField.name}
                                                onChange={e => handleUpdateField({ name: e.target.value })}
                                                placeholder="ex: Pontos de Vida"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="ID de Código (Fórmulas)" help={HELP.codeId} />
                                            <input
                                                type="text"
                                                value={selectedField.codeId || ''}
                                                onChange={e => handleUpdateField({ codeId: sanitizeCodeId(e.target.value) })}
                                                placeholder="ex: hp_max"
                                                className={styles.codeInput}
                                                title="Usado em fórmulas como: {hp_max}"
                                            />
                                            {!selectedField.codeId && <small style={{ color: '#ef4444' }}>Obrigatório</small>}
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Categoria" help={HELP.category} />
                                            <select
                                                value={selectedField.category}
                                                onChange={e => handleUpdateField({ category: e.target.value })}
                                            >
                                                {FIELD_CATEGORIES.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Ícone" help={HELP.icon} />
                                            <input
                                                type="text"
                                                value={selectedField.icon || ''}
                                                onChange={e => handleUpdateField({ icon: e.target.value })}
                                                placeholder="💪 ❤️ ⚔️"
                                                maxLength={4}
                                                className={styles.iconInput}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <Label text="Descrição" help={HELP.description} />
                                        <textarea
                                            value={selectedField.description || ''}
                                            onChange={e => handleUpdateField({ description: e.target.value })}
                                            placeholder="Descreva o propósito deste campo..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== B) TIPO DE CAMPO ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="type" title="Tipo de Campo" />
                            {expandedSections.type && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.typeGrid}>
                                        {FIELD_TYPES.map(type => {
                                            const Icon = type.icon;
                                            const isActive = selectedField.type === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    className={`${styles.typeCard} ${isActive ? styles.typeCardActive : ''}`}
                                                    style={{ '--type-color': type.color }}
                                                    onClick={() => handleUpdateField({ type: type.id })}
                                                >
                                                    <Icon size={22} style={{ color: isActive ? type.color : 'inherit' }} />
                                                    <span className={styles.typeLabel}>{type.label}</span>
                                                    <span className={styles.typeExample}>{type.example}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== C) CONFIGURAÇÃO DO TIPO ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="config" title={`Configuração: ${FIELD_TYPES.find(t => t.id === selectedField.type)?.label}`} icon={Settings2} />
                            {expandedSections.config && (
                                <div className={styles.sectionContent}>
                                    {/* NUMBER */}
                                    {selectedField.type === 'number' && (
                                        <>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Valor Padrão" help={HELP.defaultValue} />
                                                    <input type="number" value={selectedField.defaultValue || 0} onChange={e => handleUpdateField({ defaultValue: Number(e.target.value) })} />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="Incremento" help={HELP.step} />
                                                    <input type="number" value={selectedField.step || 1} onChange={e => handleUpdateField({ step: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Mínimo" help={HELP.min} />
                                                    <input type="number" value={selectedField.min ?? ''} onChange={e => handleUpdateField({ min: e.target.value ? Number(e.target.value) : null })} placeholder="Sem limite" />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="Máximo" help={HELP.max} />
                                                    <input type="number" value={selectedField.max ?? ''} onChange={e => handleUpdateField({ max: e.target.value ? Number(e.target.value) : null })} placeholder="Sem limite" />
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <Label text="Arredondamento" help={HELP.roundMode} />
                                                <select value={selectedField.roundMode || ''} onChange={e => handleUpdateField({ roundMode: e.target.value || null })}>
                                                    <option value="">Nenhum</option>
                                                    <option value="floor">Para baixo (floor)</option>
                                                    <option value="ceil">Para cima (ceil)</option>
                                                    <option value="round">Mais próximo (round)</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {/* RESOURCE */}
                                    {selectedField.type === 'resource' && (
                                        <>
                                            <div className={styles.formGroup}>
                                                <Label text="Fórmula do Máximo" help={HELP.maxFormula}><Sparkles size={14} /></Label>
                                                <input
                                                    type="text"
                                                    className={styles.formulaInput}
                                                    value={selectedField.resource?.maxFormula || ''}
                                                    onChange={e => handleDeepUpdate('resource.maxFormula', e.target.value)}
                                                    placeholder="{constitution} + ({level} * 8)"
                                                />
                                                <p className={styles.formulaHint}>Deixe vazio para valor manual. Use <code>{'{campo}'}</code> para referências.</p>
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Valor Inicial" help={HELP.defaultValue} />
                                                    <input type="number" value={selectedField.defaultValue || 0} onChange={e => handleUpdateField({ defaultValue: Number(e.target.value) })} />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="Cor da Barra" help={HELP.barColor} />
                                                    <input type="color" value={selectedField.resource?.barColor || '#ef4444'} onChange={e => handleDeepUpdate('resource.barColor', e.target.value)} className={styles.colorInput} />
                                                </div>
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Permitir Overflow" help={HELP.allowOverflow} />
                                                    <select value={selectedField.resource?.allowOverflow ? 'true' : 'false'} onChange={e => handleDeepUpdate('resource.allowOverflow', e.target.value === 'true')}>
                                                        <option value="false">Não</option>
                                                        <option value="true">Sim (passar do máximo)</option>
                                                    </select>
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="Permitir Negativo" help={HELP.allowNegative} />
                                                    <select value={selectedField.resource?.allowNegative ? 'true' : 'false'} onChange={e => handleDeepUpdate('resource.allowNegative', e.target.value === 'true')}>
                                                        <option value="false">Não</option>
                                                        <option value="true">Sim</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* DICE */}
                                    {selectedField.type === 'dice' && (
                                        <>
                                            <div className={styles.formGroup}>
                                                <Label text="Fórmula do Dado" help={HELP.diceFormula}><Dices size={14} /></Label>
                                                <input
                                                    type="text"
                                                    className={styles.formulaInput}
                                                    value={selectedField.dice?.formula || '1d6'}
                                                    onChange={e => handleDeepUpdate('dice.formula', e.target.value)}
                                                    placeholder="1d8+{strength_mod}"
                                                />
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Dados Explosivos" help={HELP.exploding} />
                                                    <select value={selectedField.dice?.exploding ? 'true' : 'false'} onChange={e => handleDeepUpdate('dice.exploding', e.target.value === 'true')}>
                                                        <option value="false">Não</option>
                                                        <option value="true">Sim (rolar novamente no máximo)</option>
                                                    </select>
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="Rolagem Automática" help={HELP.autoRoll} />
                                                    <select value={selectedField.dice?.autoRoll ? 'true' : 'false'} onChange={e => handleDeepUpdate('dice.autoRoll', e.target.value === 'true')}>
                                                        <option value="false">Não (clique para rolar)</option>
                                                        <option value="true">Sim</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* COMPUTED/FORMULA */}
                                    {selectedField.type === 'computed' && (
                                        <>
                                            <div className={styles.formGroup}>
                                                <Label text="Fórmula" help={HELP.formula}><Calculator size={14} /></Label>
                                                <input
                                                    type="text"
                                                    className={styles.formulaInput}
                                                    value={selectedField.formula || ''}
                                                    onChange={e => handleUpdateField({ formula: e.target.value })}
                                                    placeholder="floor(({strength} - 10) / 2)"
                                                />
                                                <p className={styles.formulaHint}>
                                                    Funções: <code>floor</code> <code>ceil</code> <code>max</code> <code>min</code> <code>round</code> <code>abs</code>
                                                </p>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <Label text="Mostrar Fórmula no Tooltip" help={HELP.showFormulaTooltip} />
                                                <select value={selectedField.showFormulaTooltip ? 'true' : 'false'} onChange={e => handleUpdateField({ showFormulaTooltip: e.target.value === 'true' })}>
                                                    <option value="false">Não</option>
                                                    <option value="true">Sim</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {/* TEXT */}
                                    {selectedField.type === 'text' && (
                                        <>
                                            <div className={styles.formGroup}>
                                                <Label text="Placeholder" help={HELP.placeholder} />
                                                <input type="text" value={selectedField.text?.placeholder || ''} onChange={e => handleDeepUpdate('text.placeholder', e.target.value)} placeholder="Texto de exemplo..." />
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Multilinha" help={HELP.multiline} />
                                                    <select value={selectedField.text?.multiline ? 'true' : 'false'} onChange={e => handleDeepUpdate('text.multiline', e.target.value === 'true')}>
                                                        <option value="false">Não</option>
                                                        <option value="true">Sim (área de texto)</option>
                                                    </select>
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="Suporte Markdown" help={HELP.markdown} />
                                                    <select value={selectedField.text?.markdown ? 'true' : 'false'} onChange={e => handleDeepUpdate('text.markdown', e.target.value === 'true')}>
                                                        <option value="false">Não</option>
                                                        <option value="true">Sim</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <Label text="Comprimento Máximo" help={HELP.maxLength} />
                                                <input type="number" value={selectedField.text?.maxLength ?? ''} onChange={e => handleDeepUpdate('text.maxLength', e.target.value ? Number(e.target.value) : null)} placeholder="Sem limite" />
                                            </div>
                                        </>
                                    )}

                                    {/* BOOLEAN */}
                                    {selectedField.type === 'boolean' && (
                                        <div className={styles.formGroup}>
                                            <Label text="Valor Padrão" help={HELP.defaultValue} />
                                            <select value={selectedField.defaultValue ? 'true' : 'false'} onChange={e => handleUpdateField({ defaultValue: e.target.value === 'true' })}>
                                                <option value="false">Não (desmarcado)</option>
                                                <option value="true">Sim (marcado)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* SELECT */}
                                    {selectedField.type === 'select' && (
                                        <div className={styles.optionsList}>
                                            <label>Opções</label>
                                            {(selectedField.options || []).map((opt, idx) => (
                                                <div key={idx} className={styles.optionItem}>
                                                    <input type="text" value={opt.icon || ''} onChange={e => handleUpdateOption(idx, { icon: e.target.value })} placeholder="🎯" className={styles.optionIcon} maxLength={4} />
                                                    <input type="text" value={opt.value} onChange={e => handleUpdateOption(idx, { value: e.target.value })} placeholder="valor" className={styles.optionValue} />
                                                    <input type="text" value={opt.label} onChange={e => handleUpdateOption(idx, { label: e.target.value })} placeholder="Rótulo" className={styles.optionLabel} />
                                                    <button className={styles.optionRemove} onClick={() => handleRemoveOption(idx)}><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            <button className={styles.optionAdd} onClick={handleAddOption}><Plus size={14} /> Adicionar Opção</button>
                                        </div>
                                    )}

                                    {/* LIST */}
                                    {selectedField.type === 'list' && (
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Tipo de Item</label>
                                                <select value={selectedField.list?.itemType || 'text'} onChange={e => handleDeepUpdate('list.itemType', e.target.value)}>
                                                    <option value="text">Texto simples</option>
                                                    <option value="entity">Referência a entidade</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Máximo de Itens</label>
                                                <input type="number" value={selectedField.list?.maxItems ?? ''} onChange={e => handleDeepUpdate('list.maxItems', e.target.value ? Number(e.target.value) : null)} placeholder="Sem limite" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== D) COMPORTAMENTO ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="behavior" title="Comportamento Dinâmico" icon={Zap} />
                            {expandedSections.behavior && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Pode Receber Modificadores" help={HELP.modifiable} />
                                            <select value={selectedField.behavior?.modifiable ? 'true' : 'false'} onChange={e => handleDeepUpdate('behavior.modifiable', e.target.value === 'true')}>
                                                <option value="true">Sim (buffs, debuffs)</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Pode Ser Usado em Rolagens" help={HELP.rollable} />
                                            <select value={selectedField.behavior?.rollable ? 'true' : 'false'} onChange={e => handleDeepUpdate('behavior.rollable', e.target.value === 'true')}>
                                                <option value="false">Não</option>
                                                <option value="true">Sim</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <Label text="Triggers Nativos" help={HELP.triggers} />
                                        <div className={styles.triggerList}>
                                            {TRIGGERS.map(trigger => (
                                                <label key={trigger.id} className={styles.triggerItem}>
                                                    <input
                                                        type="checkbox"
                                                        checked={(selectedField.behavior?.triggers || []).includes(trigger.id)}
                                                        onChange={e => {
                                                            const triggers = selectedField.behavior?.triggers || [];
                                                            if (e.target.checked) {
                                                                handleDeepUpdate('behavior.triggers', [...triggers, trigger.id]);
                                                            } else {
                                                                handleDeepUpdate('behavior.triggers', triggers.filter(t => t !== trigger.id));
                                                            }
                                                        }}
                                                    />
                                                    <span>{trigger.label}</span>
                                                    <small>{trigger.description}</small>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== E) VISUALIZAÇÃO ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="display" title="Visualização na Ficha" icon={Eye} />
                            {expandedSections.display && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Modo de Exibição" help={HELP.displayMode} />
                                            <select value={selectedField.display?.mode || 'number'} onChange={e => handleDeepUpdate('display.mode', e.target.value)}>
                                                {DISPLAY_MODES.map(mode => (
                                                    <option key={mode.id} value={mode.id}>{mode.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Tamanho na Grade" help={HELP.gridSize} />
                                            <select value={selectedField.display?.gridSize || 1} onChange={e => handleDeepUpdate('display.gridSize', Number(e.target.value))}>
                                                <option value={1}>1 coluna</option>
                                                <option value={2}>2 colunas</option>
                                                <option value={3}>3 colunas</option>
                                                <option value={4}>Linha inteira</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Mostrar na Ficha" help={HELP.showOnSheet} />
                                            <select value={selectedField.display?.showOnSheet ? 'true' : 'false'} onChange={e => handleDeepUpdate('display.showOnSheet', e.target.value === 'true')}>
                                                <option value="true">Sim</option>
                                                <option value="false">Não (interno)</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Mostrar Label" help={HELP.showLabel} />
                                            <select value={selectedField.display?.showLabel !== false ? 'true' : 'false'} onChange={e => handleDeepUpdate('display.showLabel', e.target.value === 'true')}>
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <Label text="Cor Customizada" help={HELP.customColor} />
                                        <div className={styles.colorRow}>
                                            <input type="color" value={selectedField.display?.color || '#8b5cf6'} onChange={e => handleDeepUpdate('display.color', e.target.value)} className={styles.colorInput} />
                                            <button className={styles.colorClear} onClick={() => handleDeepUpdate('display.color', null)}>Limpar</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== F) VALIDAÇÃO ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="validation" title="Validação" icon={Shield} />
                            {expandedSections.validation && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Campo Obrigatório" help={HELP.required} />
                                            <select value={selectedField.validation?.required ? 'true' : 'false'} onChange={e => handleDeepUpdate('validation.required', e.target.value === 'true')}>
                                                <option value="false">Não</option>
                                                <option value="true">Sim</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Somente Inteiros" help={HELP.integer} />
                                            <select value={selectedField.validation?.integer ? 'true' : 'false'} onChange={e => handleDeepUpdate('validation.integer', e.target.value === 'true')}>
                                                <option value="false">Não</option>
                                                <option value="true">Sim</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== G) METADADOS ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="meta" title="Metadados Avançados" icon={Settings2} />
                            {expandedSections.meta && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formGroup}>
                                        <Label text="ID Interno (Sistema)" help={HELP.internalId} />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input
                                                type="text"
                                                value={selectedField.internalId || selectedField.id}
                                                disabled
                                                className={styles.disabledInput}
                                                style={{ flex: 1, opacity: 0.7 }}
                                            />
                                            <button
                                                className={styles.iconButton}
                                                onClick={() => navigator.clipboard.writeText(selectedField.internalId || selectedField.id)}
                                                title="Copiar ID"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>
                                            Este é o identificador único usado pelo banco de dados. Nunca deve ser alterado manualmente.
                                        </small>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Tags" help={HELP.tags} />
                                            <input
                                                type="text"
                                                placeholder="Separadas por vírgula..."
                                                value={(selectedField.meta?.tags || []).join(', ')}
                                                onChange={e => handleDeepUpdate('meta.tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Escopo" help={HELP.scope} />
                                            <select value={selectedField.meta?.scope || 'entity'} onChange={e => handleDeepUpdate('meta.scope', e.target.value)}>
                                                <option value="entity">Entidade (Padrão)</option>
                                                <option value="global">Global</option>
                                                <option value="session">Sessão</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== H) PREVIEW ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="preview" title="Pré-visualização" icon={Play} />
                            {expandedSections.preview && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.previewBox}>
                                        <div className={styles.previewLabel}>{selectedField.name}</div>
                                        <div className={styles.previewValue}>
                                            {selectedField.type === 'number' && <span className={styles.previewNumber}>{selectedField.defaultValue || 0}</span>}
                                            {selectedField.type === 'resource' && (
                                                <div className={styles.previewResource}>
                                                    <div className={styles.previewBar} style={{ '--bar-color': selectedField.resource?.barColor || '#ef4444' }}>
                                                        <div className={styles.previewBarFill} style={{ width: '75%' }}></div>
                                                    </div>
                                                    <span>15 / 20</span>
                                                </div>
                                            )}
                                            {selectedField.type === 'dice' && <span className={styles.previewDice}>🎲 {selectedField.dice?.formula || '1d6'}</span>}
                                            {selectedField.type === 'computed' && <span className={styles.previewComputed}>ƒ = {selectedField.formula || '?'}</span>}
                                            {selectedField.type === 'text' && <span className={styles.previewText}>{selectedField.text?.placeholder || 'Texto...'}</span>}
                                            {selectedField.type === 'boolean' && <span className={styles.previewBoolean}>{selectedField.defaultValue ? '✓' : '○'}</span>}
                                            {selectedField.type === 'select' && <span className={styles.previewSelect}>{selectedField.options?.[0]?.label || 'Selecione...'}</span>}
                                            {selectedField.type === 'list' && <span className={styles.previewList}>[ Lista vazia ]</span>}
                                        </div>
                                        <div className={styles.previewMeta}>
                                            <code>{selectedField.id}</code>
                                            <span>{FIELD_CATEGORIES.find(c => c.id === selectedField.category)?.label}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <Sparkles size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <h4>Nenhum campo selecionado</h4>
                        <p>Selecione um campo na lista ou crie um novo</p>
                    </div>
                )}
            </div>
        </div>
    );
}
