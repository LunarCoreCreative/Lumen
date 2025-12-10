import React, { useState, useMemo } from 'react';
import { sanitizeCodeId, normalizeEntity } from '../../../../forge/core/IdHelpers';
import styles from '../Editor.module.css';
import { Label } from '../components/HelpTip';
import {
    Plus, Trash2, Copy, Search, ChevronDown, ChevronRight,
    Zap, Target, Package, Play, GitBranch, AlertCircle,
    Heart, Sword, Sparkles, Dices, Shield, ArrowRight,
    UserCheck, Link2, Settings2, Eye, Check, X
} from 'lucide-react';

/**
 * EventEditor - Editor de Eventos do Sistema
 * 
 * Define QUANDO as coisas acontecem no sistema.
 * Eventos são triggers que disparam regras.
 */

// ========== CONSTANTS ==========

const NATIVE_EVENTS = [
    { id: 'onCreate', label: 'Ao Criar', icon: '🆕', category: 'lifecycle', description: 'Quando uma entidade é criada', native: true },
    { id: 'onDelete', label: 'Ao Remover', icon: '🗑️', category: 'lifecycle', description: 'Quando uma entidade é removida', native: true },
    { id: 'onChange', label: 'Ao Mudar', icon: '✏️', category: 'field', description: 'Quando qualquer campo muda de valor', native: true },
    { id: 'onTurnStart', label: 'Início do Turno', icon: '▶️', category: 'combat', description: 'Quando o turno de uma entidade começa', native: true },
    { id: 'onTurnEnd', label: 'Fim do Turno', icon: '⏹️', category: 'combat', description: 'Quando o turno de uma entidade termina', native: true },
    { id: 'onRoll', label: 'Ao Rolar', icon: '🎲', category: 'dice', description: 'Quando uma rolagem de dados é feita', native: true },
    { id: 'onDamage', label: 'Ao Receber Dano', icon: '💥', category: 'combat', description: 'Quando uma entidade recebe dano', native: true },
    { id: 'onHeal', label: 'Ao Curar', icon: '💚', category: 'combat', description: 'Quando uma entidade é curada', native: true },
    { id: 'onEquip', label: 'Ao Equipar', icon: '⚔️', category: 'inventory', description: 'Quando um item é equipado', native: true },
    { id: 'onUnequip', label: 'Ao Desequipar', icon: '📦', category: 'inventory', description: 'Quando um item é desequipado', native: true }
];

const EVENT_CATEGORIES = [
    { id: 'lifecycle', label: 'Ciclo de Vida', icon: '🔄', color: '#3b82f6' },
    { id: 'field', label: 'Campo', icon: '📝', color: '#10b981' },
    { id: 'combat', label: 'Combate', icon: '⚔️', color: '#ef4444' },
    { id: 'dice', label: 'Dados', icon: '🎲', color: '#f59e0b' },
    { id: 'inventory', label: 'Inventário', icon: '🎒', color: '#8b5cf6' },
    { id: 'resource', label: 'Recurso', icon: '❤️', color: '#ec4899' },
    { id: 'custom', label: 'Personalizado', icon: '⚡', color: '#14b8a6' }
];

const COMPARISON_OPERATORS = [
    { id: 'eq', label: '=', description: 'Igual a' },
    { id: 'neq', label: '≠', description: 'Diferente de' },
    { id: 'gt', label: '>', description: 'Maior que' },
    { id: 'gte', label: '≥', description: 'Maior ou igual' },
    { id: 'lt', label: '<', description: 'Menor que' },
    { id: 'lte', label: '≤', description: 'Menor ou igual' },
    { id: 'changed', label: 'Mudou', description: 'Valor alterou' }
];

const EVENT_ICONS = [
    '💔', '❤️', '💚', '💙', '💜', '🖤', '💛', '🧡',
    '⚔️', '🛡️', '🗡️', '🏹', '💥', '✨', '🔥', '❄️',
    '⚡', '🌟', '💀', '👁️', '🎯', '🎲', '📜', '🔮',
    '⚠️', '🚨', '✅', '❌', '🔄', '⏰', '🎭', '👑'
];

const DEFAULT_EVENT = {
    id: '',
    name: '',
    icon: '⚡',
    category: 'custom',
    description: '',
    native: false,
    enabled: true,

    // Escopo - quais entidades podem disparar
    scope: {
        entityTypes: [], // IDs das entidades que podem disparar
        fields: []       // IDs dos campos específicos (opcional)
    },

    // Trigger - condições para disparo
    trigger: {
        type: 'fieldChange', // 'fieldChange' | 'comparison' | 'system'
        fieldId: '',
        operator: 'eq',
        value: '',
        // Condições adicionais (AND)
        conditions: []
    },

    // Payload - dados enviados para regras
    payload: {
        includeEntity: true,
        includeField: true,
        includePrevValue: true,
        includeNewValue: true,
        customFields: []
    }
};

// ========== HELP TEXTS ==========

const EVENT_HELP = {
    name: 'Nome que aparece na interface e nas referências de regras',
    id: 'Identificador único usado no código. Minúsculo, sem espaços.',
    category: 'Agrupa eventos similares para organização',
    description: 'Explica quando e por que este evento dispara',
    scope: 'Quais entidades e campos podem disparar este evento',
    trigger: 'Condição que precisa ser verdadeira para o evento disparar',
    payload: 'Dados que são enviados junto com o evento para as regras'
};

// ========== COMPONENT ==========

export function EventEditor({ events = [], entityTypes = [], fields = [], rules = [], onChange }) {
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showNative, setShowNative] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        identity: true,
        scope: true,
        trigger: true,
        payload: false,
        preview: false,
        rules: false,
        meta: false
    });
    const [previewValues, setPreviewValues] = useState({ current: 10, new: 0 });

    // Combine native + custom events
    const allEvents = useMemo(() => {
        const customEvents = events.filter(e => !e.native);
        if (showNative) {
            return [...NATIVE_EVENTS, ...customEvents];
        }
        return customEvents;
    }, [events, showNative]);

    const selectedEvent = allEvents.find(e => e.id === selectedId);
    const isNativeEvent = selectedEvent?.native === true;

    // Filtered events
    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const matchesSearch = !searchQuery ||
                event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.label?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [allEvents, searchQuery, categoryFilter]);

    // Group events
    const groupedEvents = useMemo(() => {
        const native = filteredEvents.filter(e => e.native);
        const custom = filteredEvents.filter(e => !e.native);
        return { native, custom };
    }, [filteredEvents]);

    // Count connected rules
    const getConnectedRulesCount = (eventId) => {
        return rules.filter(r => r.trigger?.eventId === eventId).length;
    };

    // Toggle section
    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Add event
    const handleAddEvent = () => {
        const newEvent = normalizeEntity({
            ...JSON.parse(JSON.stringify(DEFAULT_EVENT)),
            id: `event_${Date.now()}`,
            name: `Novo Evento ${events.length + 1}`
        });
        onChange([...events, newEvent]);
        setSelectedId(newEvent.id);
    };

    // Duplicate event
    const handleDuplicateEvent = (event) => {
        const newEvent = normalizeEntity({
            ...JSON.parse(JSON.stringify(event)),
            internalId: null, // Force new ID
            codeId: `${event.codeId}_copy`,
            name: `${event.name || event.label} (Cópia)`,
            native: false
        });
        onChange([...events, newEvent]);
        setSelectedId(newEvent.id);
    };

    // Update event
    const handleUpdateEvent = (updates) => {
        if (isNativeEvent) return; // Can't edit native events

        if (updates.id && updates.id !== selectedId) {
            setSelectedId(updates.id);
        }
        onChange(events.map(e =>
            e.id === selectedId ? { ...e, ...updates } : e
        ));
    };

    // Deep update
    const handleDeepUpdate = (path, value) => {
        if (isNativeEvent) return;

        const keys = path.split('.');
        const updated = { ...selectedEvent };
        let current = updated;

        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        onChange(events.map(e => e.id === selectedId ? updated : e));
    };

    // Delete event
    const handleDeleteEvent = () => {
        if (isNativeEvent) return;
        onChange(events.filter(e => e.id !== selectedId));
        setSelectedId(null);
    };

    // Add trigger condition
    const handleAddCondition = () => {
        const conditions = selectedEvent.trigger?.conditions || [];
        handleDeepUpdate('trigger.conditions', [...conditions, {
            fieldId: '',
            operator: 'eq',
            value: ''
        }]);
    };

    // Check if event would trigger
    const checkTrigger = () => {
        const trigger = selectedEvent?.trigger;
        if (!trigger) return false;

        const { operator, value } = trigger;
        const newVal = previewValues.new;
        const numValue = Number(value);

        switch (operator) {
            case 'eq': return newVal === numValue;
            case 'neq': return newVal !== numValue;
            case 'gt': return newVal > numValue;
            case 'gte': return newVal >= numValue;
            case 'lt': return newVal < numValue;
            case 'lte': return newVal <= numValue;
            case 'changed': return previewValues.current !== newVal;
            default: return false;
        }
    };

    // Section Header
    const SectionHeader = ({ id, title, icon: Icon, disabled }) => (
        <button
            className={`${styles.sectionHeader} ${disabled ? styles.sectionDisabled : ''}`}
            onClick={() => !disabled && toggleSection(id)}
        >
            {expandedSections[id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {Icon && <Icon size={16} />}
            <span>{title}</span>
            {disabled && <span className={styles.nativeBadge}>Nativo</span>}
        </button>
    );

    return (
        <div className={styles.fieldEditorGrid}>
            {/* ========== LISTA DE EVENTOS ========== */}
            <div className={styles.fieldList}>
                <div className={styles.fieldListHeader}>
                    <h3>Eventos ({allEvents.length})</h3>
                    <button className={styles.addButton} onClick={handleAddEvent} title="Novo Evento">
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
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Todas</option>
                        {EVENT_CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* Event Items */}
                <div className={styles.fieldItems}>
                    {/* Native Events Group */}
                    {groupedEvents.native.length > 0 && (
                        <>
                            <div className={styles.eventGroupHeader}>
                                <span>Eventos Nativos</span>
                                <button onClick={() => setShowNative(!showNative)}>
                                    {showNative ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>
                            {showNative && groupedEvents.native.map(event => {
                                const catInfo = EVENT_CATEGORIES.find(c => c.id === event.category);
                                const rulesCount = getConnectedRulesCount(event.id);
                                return (
                                    <div
                                        key={event.id}
                                        className={`${styles.fieldItem} ${styles.nativeEvent} ${selectedId === event.id ? styles.fieldItemActive : ''}`}
                                        onClick={() => setSelectedId(event.id)}
                                    >
                                        <span className={styles.fieldIcon} style={{ background: `${catInfo?.color}20` }}>
                                            {event.icon}
                                        </span>
                                        <div className={styles.fieldItemInfo}>
                                            <div className={styles.fieldItemName}>{event.label}</div>
                                            <div className={styles.fieldItemMeta}>
                                                <span style={{ color: catInfo?.color }}>{catInfo?.label}</span>
                                                {rulesCount > 0 && (
                                                    <span className={styles.fieldBadge}>{rulesCount} regras</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Custom Events Group */}
                    {groupedEvents.custom.length > 0 && (
                        <>
                            <div className={styles.eventGroupHeader}>
                                <span>Eventos Personalizados</span>
                            </div>
                            {groupedEvents.custom.map(event => {
                                const catInfo = EVENT_CATEGORIES.find(c => c.id === event.category);
                                const rulesCount = getConnectedRulesCount(event.id);
                                return (
                                    <div
                                        key={event.id}
                                        className={`${styles.fieldItem} ${selectedId === event.id ? styles.fieldItemActive : ''} ${!event.enabled ? styles.disabledEvent : ''}`}
                                        onClick={() => setSelectedId(event.id)}
                                    >
                                        <span className={styles.fieldIcon} style={{ background: `${catInfo?.color}20`, color: catInfo?.color }}>
                                            {event.icon || '⚡'}
                                        </span>
                                        <div className={styles.fieldItemInfo}>
                                            <div className={styles.fieldItemName}>
                                                {event.name || 'Sem nome'}
                                                {!event.enabled && <span className={styles.disabledLabel}>Desativado</span>}
                                            </div>
                                            <div className={styles.fieldItemMeta}>
                                                <span style={{ color: catInfo?.color }}>{catInfo?.label}</span>
                                                {rulesCount > 0 && (
                                                    <span className={styles.fieldBadge}>{rulesCount} regras</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className={styles.fieldItemAction}
                                            onClick={(e) => { e.stopPropagation(); handleDuplicateEvent(event); }}
                                            title="Duplicar"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {filteredEvents.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>Nenhum evento encontrado</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== EDITOR PRINCIPAL ========== */}
            <div className={styles.fieldForm}>
                {selectedEvent ? (
                    <div className={styles.fieldFormScroll}>
                        {/* Header */}
                        <div className={styles.fieldFormHeader}>
                            <h3>
                                <span className={styles.fieldFormIcon}>{selectedEvent.icon}</span>
                                {selectedEvent.name || selectedEvent.label}
                                {isNativeEvent && <span className={styles.nativeTag}>Nativo</span>}
                            </h3>
                            {!isNativeEvent && (
                                <button className={styles.deleteButton} onClick={handleDeleteEvent}>
                                    <Trash2 size={16} /> Excluir
                                </button>
                            )}
                        </div>

                        {/* ===== A) IDENTIDADE ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="identity" title="Identidade" disabled={isNativeEvent} />
                            {expandedSections.identity && (
                                <div className={styles.sectionContent}>
                                    {isNativeEvent ? (
                                        <div className={styles.nativeInfo}>
                                            <div className={styles.nativeInfoRow}>
                                                <strong>ID:</strong> <code>{selectedEvent.id}</code>
                                            </div>
                                            <div className={styles.nativeInfoRow}>
                                                <strong>Descrição:</strong> {selectedEvent.description}
                                            </div>
                                            <p className={styles.sectionHint}>
                                                Eventos nativos não podem ser editados, mas você pode criar regras para eles.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Nome" help={EVENT_HELP.name} />
                                                    <input
                                                        type="text"
                                                        value={selectedEvent.name}
                                                        onChange={e => handleUpdateEvent({ name: e.target.value })}
                                                        placeholder="ex: HP Zerado"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="ID de Código" help={EVENT_HELP.id} />
                                                    <input
                                                        type="text"
                                                        value={selectedEvent.codeId || ''}
                                                        onChange={e => handleUpdateEvent({ codeId: sanitizeCodeId(e.target.value) })}
                                                        placeholder="ex: hp_zero"
                                                        className={styles.codeInput}
                                                        title="Identificador usado em regras"
                                                    />
                                                    {!selectedEvent.codeId && <small style={{ color: '#ef4444' }}>Obrigatório</small>}
                                                </div>
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <Label text="Categoria" help={EVENT_HELP.category} />
                                                    <select
                                                        value={selectedEvent.category}
                                                        onChange={e => handleUpdateEvent({ category: e.target.value })}
                                                    >
                                                        {EVENT_CATEGORIES.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <Label text="Ativo" />
                                                    <select
                                                        value={selectedEvent.enabled ? 'true' : 'false'}
                                                        onChange={e => handleUpdateEvent({ enabled: e.target.value === 'true' })}
                                                    >
                                                        <option value="true">Sim</option>
                                                        <option value="false">Não (desativado)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <Label text="Ícone" />
                                                <div className={styles.iconGrid}>
                                                    {EVENT_ICONS.map(icon => (
                                                        <button
                                                            key={icon}
                                                            className={`${styles.iconButton} ${selectedEvent.icon === icon ? styles.iconButtonActive : ''}`}
                                                            onClick={() => handleUpdateEvent({ icon })}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <Label text="Descrição" help={EVENT_HELP.description} />
                                                <textarea
                                                    value={selectedEvent.description || ''}
                                                    onChange={e => handleUpdateEvent({ description: e.target.value })}
                                                    placeholder="Descreva quando este evento dispara..."
                                                    rows={2}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== B) ESCOPO ===== */}
                        {!isNativeEvent && (
                            <div className={styles.formSection}>
                                <SectionHeader id="scope" title="Escopo (Quem dispara)" icon={Target} />
                                {expandedSections.scope && (
                                    <div className={styles.sectionContent}>
                                        <div className={styles.formGroup}>
                                            <Label text="Entidades que podem disparar" help={EVENT_HELP.scope} />
                                            <div className={styles.checkboxGrid}>
                                                {entityTypes.map(entity => (
                                                    <label key={entity.id} className={styles.checkboxItem}>
                                                        <input
                                                            type="checkbox"
                                                            checked={(selectedEvent.scope?.entityTypes || []).includes(entity.id)}
                                                            onChange={e => {
                                                                const types = selectedEvent.scope?.entityTypes || [];
                                                                if (e.target.checked) {
                                                                    handleDeepUpdate('scope.entityTypes', [...types, entity.id]);
                                                                } else {
                                                                    handleDeepUpdate('scope.entityTypes', types.filter(t => t !== entity.id));
                                                                }
                                                            }}
                                                        />
                                                        <span>{entity.icon} {entity.name}</span>
                                                    </label>
                                                ))}
                                                {entityTypes.length === 0 && (
                                                    <p className={styles.noEntities}>Crie entidades na aba Entidades primeiro</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <Label text="Campos específicos (opcional)" />
                                            <div className={styles.checkboxGrid}>
                                                {fields.slice(0, 12).map(field => (
                                                    <label key={field.id} className={styles.checkboxItem}>
                                                        <input
                                                            type="checkbox"
                                                            checked={(selectedEvent.scope?.fields || []).includes(field.id)}
                                                            onChange={e => {
                                                                const flds = selectedEvent.scope?.fields || [];
                                                                if (e.target.checked) {
                                                                    handleDeepUpdate('scope.fields', [...flds, field.id]);
                                                                } else {
                                                                    handleDeepUpdate('scope.fields', flds.filter(f => f !== field.id));
                                                                }
                                                            }}
                                                        />
                                                        <span>{field.icon || '📦'} {field.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== C) TRIGGER ===== */}
                        {!isNativeEvent && (
                            <div className={styles.formSection}>
                                <SectionHeader id="trigger" title="Gatilho (Quando dispara)" icon={Zap} />
                                {expandedSections.trigger && (
                                    <div className={styles.sectionContent}>
                                        <p className={styles.triggerLabel}>Este evento dispara quando:</p>

                                        <div className={styles.triggerBuilder}>
                                            <select
                                                value={selectedEvent.trigger?.fieldId || ''}
                                                onChange={e => handleDeepUpdate('trigger.fieldId', e.target.value)}
                                                className={styles.triggerField}
                                            >
                                                <option value="">Selecione um campo...</option>
                                                {fields.map(f => (
                                                    <option key={f.id} value={f.id}>{f.icon || '📦'} {f.name}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={selectedEvent.trigger?.operator || 'eq'}
                                                onChange={e => handleDeepUpdate('trigger.operator', e.target.value)}
                                                className={styles.triggerOperator}
                                            >
                                                {COMPARISON_OPERATORS.map(op => (
                                                    <option key={op.id} value={op.id}>{op.label} {op.description}</option>
                                                ))}
                                            </select>

                                            <input
                                                type="text"
                                                value={selectedEvent.trigger?.value || ''}
                                                onChange={e => handleDeepUpdate('trigger.value', e.target.value)}
                                                placeholder="Valor"
                                                className={styles.triggerValue}
                                            />
                                        </div>

                                        {/* Additional Conditions */}
                                        {(selectedEvent.trigger?.conditions || []).length > 0 && (
                                            <div className={styles.conditionList}>
                                                {selectedEvent.trigger.conditions.map((cond, idx) => (
                                                    <div key={idx} className={styles.conditionItem}>
                                                        <span className={styles.conditionAnd}>E</span>
                                                        <select
                                                            value={cond.fieldId}
                                                            onChange={e => {
                                                                const conditions = [...selectedEvent.trigger.conditions];
                                                                conditions[idx] = { ...cond, fieldId: e.target.value };
                                                                handleDeepUpdate('trigger.conditions', conditions);
                                                            }}
                                                        >
                                                            <option value="">Campo...</option>
                                                            {fields.map(f => (
                                                                <option key={f.id} value={f.id}>{f.name}</option>
                                                            ))}
                                                        </select>
                                                        <select
                                                            value={cond.operator}
                                                            onChange={e => {
                                                                const conditions = [...selectedEvent.trigger.conditions];
                                                                conditions[idx] = { ...cond, operator: e.target.value };
                                                                handleDeepUpdate('trigger.conditions', conditions);
                                                            }}
                                                        >
                                                            {COMPARISON_OPERATORS.map(op => (
                                                                <option key={op.id} value={op.id}>{op.label}</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={cond.value}
                                                            onChange={e => {
                                                                const conditions = [...selectedEvent.trigger.conditions];
                                                                conditions[idx] = { ...cond, value: e.target.value };
                                                                handleDeepUpdate('trigger.conditions', conditions);
                                                            }}
                                                            placeholder="Valor"
                                                        />
                                                        <button
                                                            className={styles.conditionRemove}
                                                            onClick={() => {
                                                                const conditions = [...selectedEvent.trigger.conditions];
                                                                conditions.splice(idx, 1);
                                                                handleDeepUpdate('trigger.conditions', conditions);
                                                            }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button className={styles.addConditionBtn} onClick={handleAddCondition}>
                                            <Plus size={14} /> Adicionar Condição (AND)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== D) PREVIEW ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="preview" title="Pré-visualização" icon={Play} />
                            {expandedSections.preview && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.previewSimulator}>
                                        <div className={styles.previewInputs}>
                                            <div className={styles.formGroup}>
                                                <label>Valor Atual</label>
                                                <input
                                                    type="number"
                                                    value={previewValues.current}
                                                    onChange={e => setPreviewValues(prev => ({ ...prev, current: Number(e.target.value) }))}
                                                />
                                            </div>
                                            <ArrowRight size={20} className={styles.previewArrow} />
                                            <div className={styles.formGroup}>
                                                <label>Novo Valor</label>
                                                <input
                                                    type="number"
                                                    value={previewValues.new}
                                                    onChange={e => setPreviewValues(prev => ({ ...prev, new: Number(e.target.value) }))}
                                                />
                                            </div>
                                        </div>

                                        <div className={`${styles.previewResult} ${checkTrigger() ? styles.previewTriggers : styles.previewNoTrigger}`}>
                                            {checkTrigger() ? (
                                                <>
                                                    <Check size={24} />
                                                    <span>Evento DISPARA!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <X size={24} />
                                                    <span>Evento não dispara</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== E) CONNECTED RULES ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader
                                id="rules"
                                title="Regras Conectadas"
                                icon={GitBranch}
                            />
                            {expandedSections.rules && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.connectedRules}>
                                        <div className={styles.rulesCount}>
                                            <GitBranch size={20} />
                                            <span>{getConnectedRulesCount(selectedEvent.id)} regras usam este evento</span>
                                        </div>
                                        <div className={styles.rulesActions}>
                                            <button className={styles.viewRulesBtn}>
                                                <Eye size={16} /> Ver Regras
                                            </button>
                                            <button className={styles.createRuleBtn}>
                                                <Plus size={16} /> Criar Regra
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== F) METADADOS ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="meta" title="Metadados Avançados" icon={Settings2} />
                            {expandedSections.meta && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formGroup}>
                                        <Label text="ID Interno (Sistema)" help={EVENT_HELP.id} />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input
                                                type="text"
                                                value={selectedEvent.internalId || selectedEvent.id}
                                                disabled
                                                className={styles.disabledInput}
                                                style={{ flex: 1, opacity: 0.7 }}
                                            />
                                            <button
                                                className={styles.iconButton}
                                                onClick={() => navigator.clipboard.writeText(selectedEvent.internalId || selectedEvent.id)}
                                                title="Copiar ID"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>
                                            Identificador único imutável do sistema.
                                        </small>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className={styles.noSelection}>
                        <Zap size={48} />
                        <h3>Nenhum evento selecionado</h3>
                        <p>Selecione um evento na lista ou crie um novo</p>
                        <button className={styles.createButton} onClick={handleAddEvent}>
                            <Plus size={18} />
                            Criar Evento
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
