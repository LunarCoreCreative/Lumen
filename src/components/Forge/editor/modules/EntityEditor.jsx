import React, { useState, useMemo } from 'react';
import { sanitizeCodeId, normalizeEntity } from '../../../../forge/core/IdHelpers';
import styles from '../Editor.module.css';
import { Label, HELP } from '../components/HelpTip';
import {
    Plus, Trash2, Copy, Search, Crown, Sword, BookOpen, FlaskConical,
    Sparkles, MapPin, Users, Package, ChevronDown, ChevronRight,
    GripVertical, Eye, EyeOff, Lock, Unlock, Shield, Zap, Layout,
    Play, Settings2, User, Skull, Wand2
} from 'lucide-react';

/**
 * EntityEditor - Editor de Tipos de Entidade
 * 
 * Define os "tipos de ficha" do sistema usando Fields como blocos de construção.
 * Exemplos: Personagem, NPC, Criatura, Item, Magia, Efeito, Cenário
 */

// ========== CONSTANTS ==========

const ENTITY_CATEGORIES = [
    { id: 'player', label: 'Jogador', icon: User, color: '#3b82f6' },
    { id: 'npc', label: 'NPC', icon: Users, color: '#10b981' },
    { id: 'creature', label: 'Criatura', icon: Skull, color: '#ef4444' },
    { id: 'item', label: 'Item', icon: Package, color: '#f59e0b' },
    { id: 'spell', label: 'Magia', icon: Wand2, color: '#8b5cf6' },
    { id: 'effect', label: 'Efeito', icon: Sparkles, color: '#ec4899' },
    { id: 'location', label: 'Local', icon: MapPin, color: '#14b8a6' }
];

const ENTITY_ICONS = [
    '👤', '👥', '🧙', '🧝', '🧛', '🧟', '👹', '🐉', '🐺', '🦅',
    '⚔️', '🛡️', '🗡️', '🏹', '🪄', '📜', '📖', '💎', '🔮', '🧪',
    '🏰', '🏠', '⛺', '🌲', '🌋', '🏔️', '🌊', '🔥', '❄️', '⚡',
    '❤️', '💀', '👑', '🎭', '🎪', '💰', '🎒', '📦', '🗝️', '🚪'
];

const VISIBILITY_OPTIONS = [
    { id: 'all', label: 'Todos', icon: Eye },
    { id: 'master', label: 'Somente Mestre', icon: Crown },
    { id: 'owner', label: 'Somente Dono', icon: User }
];

const EDITABLE_OPTIONS = [
    { id: 'owner', label: 'Dono', icon: Unlock },
    { id: 'master', label: 'Mestre', icon: Crown },
    { id: 'none', label: 'Ninguém (Somente Leitura)', icon: Lock }
];

const ENTITY_EVENTS = [
    { id: 'onCreate', label: 'Ao Criar', description: 'Quando a entidade é criada' },
    { id: 'onDelete', label: 'Ao Remover', description: 'Quando a entidade é removida' },
    { id: 'onValueChange', label: 'Ao Mudar Valor', description: 'Qualquer campo alterado' },
    { id: 'onTurnStart', label: 'Início do Turno', description: 'Se participa de combate' },
    { id: 'onTurnEnd', label: 'Fim do Turno', description: 'Se participa de combate' },
    { id: 'onResourceEmpty', label: 'Recurso Zerado', description: 'Ex: HP = 0' }
];

const DEFAULT_ENTITY_TYPE = {
    id: '',
    name: '',
    namePlural: '',
    icon: '📦',
    description: '',
    category: 'item',

    fields: [],

    behaviors: {
        playerControlled: false,
        showInMainList: true,
        participatesInCombat: false,
        canBeTargeted: true,
        canOwnEntities: false,
        ownableTypes: [],
        stackable: false,
        uniquePerPlayer: false
    },

    layout: {
        template: 'default',
        titleField: '',
        avatarField: ''
    }
};

// ========== HELP TEXTS ==========

const ENTITY_HELP = {
    id: 'Identificador único usado internamente. Minúsculo, sem espaços. Ex: character, item, spell',
    name: 'Nome que aparece na interface. Ex: Personagem, Item, Magia',
    namePlural: 'Forma plural para listas. Ex: Personagens, Itens, Magias',
    icon: 'Ícone visual que representa esta entidade',
    description: 'Explica o propósito desta entidade no sistema',
    category: 'Agrupa entidades similares para organização',

    fieldRequired: 'Se marcado, este campo não pode ficar vazio ao criar a entidade',
    fieldVisibility: 'Controla quem pode ver este campo na ficha',
    fieldEditable: 'Controla quem pode editar este campo',
    fieldGroup: 'Agrupa campos para organização no layout',

    playerControlled: 'Se marcado, jogadores podem controlar entidades deste tipo',
    showInMainList: 'Se marcado, aparece na lista principal do sistema',
    participatesInCombat: 'Se marcado, pode participar de encontros de combate',
    canBeTargeted: 'Se marcado, pode ser alvo de efeitos e magias',
    canOwnEntities: 'Se marcado, pode possuir outras entidades (ex: inventário)',
    stackable: 'Se marcado, múltiplas instâncias podem ser empilhadas (ex: 10x Poção)',
    uniquePerPlayer: 'Se marcado, cada jogador pode ter apenas uma entidade deste tipo',

    titleField: 'Qual campo aparece como título da ficha',
    avatarField: 'Qual campo de imagem usar como avatar'
};

// ========== COMPONENT ==========

export function EntityEditor({ entityTypes = [], fields = [], onChange }) {
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFieldPicker, setShowFieldPicker] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        identity: true,
        fields: true,
        behaviors: false,
        events: false,
        layout: false,
        meta: false
    });

    const selectedEntity = entityTypes.find(e => e.id === selectedId);

    // Filtered entities
    const filteredEntities = useMemo(() => {
        return entityTypes.filter(entity => {
            const matchesSearch = !searchQuery ||
                entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entity.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || entity.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [entityTypes, searchQuery, categoryFilter]);

    // Toggle section
    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Add entity
    const handleAddEntity = () => {
        const newEntity = normalizeEntity({
            ...JSON.parse(JSON.stringify(DEFAULT_ENTITY_TYPE)),
            id: `entity_${Date.now()}`,
            name: `Nova Entidade ${entityTypes.length + 1}`
        });
        onChange([...entityTypes, newEntity]);
        setSelectedId(newEntity.id);
    };

    // Duplicate entity
    const handleDuplicateEntity = (entity) => {
        const newEntity = normalizeEntity({
            ...JSON.parse(JSON.stringify(entity)),
            internalId: null, // Force new GUID
            codeId: `${entity.codeId}_copy`,
            name: `${entity.name} (Cópia)`
        });
        onChange([...entityTypes, newEntity]);
        setSelectedId(newEntity.id);
    };

    // Update entity
    const handleUpdateEntity = (updates) => {
        if (updates.id && updates.id !== selectedId) {
            setSelectedId(updates.id);
        }
        onChange(entityTypes.map(e =>
            e.id === selectedId ? { ...e, ...updates } : e
        ));
    };

    // Deep update
    const handleDeepUpdate = (path, value) => {
        const keys = path.split('.');
        const updated = { ...selectedEntity };
        let current = updated;

        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        onChange(entityTypes.map(e => e.id === selectedId ? updated : e));
    };

    // Delete entity
    const handleDeleteEntity = () => {
        onChange(entityTypes.filter(e => e.id !== selectedId));
        setSelectedId(null);
    };

    // Add field to entity
    const handleAddField = (fieldId) => {
        const entityFields = selectedEntity.fields || [];
        if (entityFields.some(f => f.fieldId === fieldId)) return; // Already added

        handleUpdateEntity({
            fields: [...entityFields, {
                fieldId,
                label: null,
                required: false,
                visibility: 'all',
                editableBy: 'owner',
                group: ''
            }]
        });
        setShowFieldPicker(false);
    };

    // Update field config
    const handleUpdateFieldConfig = (index, updates) => {
        const entityFields = [...(selectedEntity.fields || [])];
        entityFields[index] = { ...entityFields[index], ...updates };
        handleUpdateEntity({ fields: entityFields });
    };

    // Remove field from entity
    const handleRemoveField = (index) => {
        const entityFields = [...(selectedEntity.fields || [])];
        entityFields.splice(index, 1);
        handleUpdateEntity({ fields: entityFields });
    };

    // Get available fields (not yet added to entity)
    const availableFields = useMemo(() => {
        const addedIds = (selectedEntity?.fields || []).map(f => f.fieldId);
        return fields.filter(f => !addedIds.includes(f.id));
    }, [fields, selectedEntity]);

    // Section Header
    const SectionHeader = ({ id, title, icon: Icon, badge }) => (
        <button
            className={styles.sectionHeader}
            onClick={() => toggleSection(id)}
        >
            {expandedSections[id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {Icon && <Icon size={16} />}
            <span>{title}</span>
            {badge !== undefined && <span className={styles.sectionBadge}>{badge}</span>}
        </button>
    );

    return (
        <div className={styles.fieldEditorGrid}>
            {/* ========== LISTA DE ENTIDADES ========== */}
            <div className={styles.fieldList}>
                <div className={styles.fieldListHeader}>
                    <h3>Entidades ({entityTypes.length})</h3>
                    <button className={styles.addButton} onClick={handleAddEntity} title="Nova Entidade">
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
                        {ENTITY_CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* Entity Items */}
                <div className={styles.fieldItems}>
                    {filteredEntities.map(entity => {
                        const catInfo = ENTITY_CATEGORIES.find(c => c.id === entity.category);
                        return (
                            <div
                                key={entity.id}
                                className={`${styles.fieldItem} ${selectedId === entity.id ? styles.fieldItemActive : ''}`}
                                onClick={() => setSelectedId(entity.id)}
                            >
                                <span
                                    className={styles.fieldIcon}
                                    style={{ background: `${catInfo?.color}20`, color: catInfo?.color }}
                                >
                                    {entity.icon || '📦'}
                                </span>
                                <div className={styles.fieldItemInfo}>
                                    <div className={styles.fieldItemName}>{entity.name || 'Sem nome'}</div>
                                    <div className={styles.fieldItemMeta}>
                                        <span style={{ color: catInfo?.color }}>{catInfo?.label}</span>
                                        {entity.fields?.length > 0 && (
                                            <span className={styles.fieldBadge}>{entity.fields.length} campos</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className={styles.fieldItemAction}
                                    onClick={(e) => { e.stopPropagation(); handleDuplicateEntity(entity); }}
                                    title="Duplicar"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        );
                    })}
                    {filteredEntities.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>{entityTypes.length === 0 ? 'Nenhuma entidade criada' : 'Nenhum resultado'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== EDITOR PRINCIPAL ========== */}
            <div className={styles.fieldForm}>
                {selectedEntity ? (
                    <div className={styles.fieldFormScroll}>
                        {/* Header */}
                        <div className={styles.fieldFormHeader}>
                            <h3>
                                <span className={styles.fieldFormIcon}>{selectedEntity.icon || '📦'}</span>
                                {selectedEntity.name || 'Entidade sem nome'}
                            </h3>
                            <button className={styles.deleteButton} onClick={handleDeleteEntity}>
                                <Trash2 size={16} /> Excluir
                            </button>
                        </div>

                        {/* ===== A) IDENTIDADE ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="identity" title="Identidade" />
                            {expandedSections.identity && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Nome" help={ENTITY_HELP.name} />
                                            <input
                                                type="text"
                                                value={selectedEntity.name}
                                                onChange={e => handleUpdateEntity({ name: e.target.value })}
                                                placeholder="ex: Personagem"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Nome Plural" help={ENTITY_HELP.namePlural} />
                                            <input
                                                type="text"
                                                value={selectedEntity.namePlural || ''}
                                                onChange={e => handleUpdateEntity({ namePlural: e.target.value })}
                                                placeholder="ex: Personagens"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="ID de Código" help={ENTITY_HELP.id} />
                                            <input
                                                type="text"
                                                value={selectedEntity.codeId || ''}
                                                onChange={e => handleUpdateEntity({ codeId: sanitizeCodeId(e.target.value) })}
                                                placeholder="ex: character"
                                                className={styles.codeInput}
                                                title="Usado em scripts: entities.character"
                                            />
                                            {!selectedEntity.codeId && <small style={{ color: '#ef4444' }}>Obrigatório</small>}
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Categoria" help={ENTITY_HELP.category} />
                                            <select
                                                value={selectedEntity.category}
                                                onChange={e => handleUpdateEntity({ category: e.target.value })}
                                            >
                                                {ENTITY_CATEGORIES.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Ícone" help={ENTITY_HELP.icon} />
                                            <div className={styles.iconGrid}>
                                                {ENTITY_ICONS.map(icon => (
                                                    <button
                                                        key={icon}
                                                        className={`${styles.iconButton} ${selectedEntity.icon === icon ? styles.iconButtonActive : ''}`}
                                                        onClick={() => handleUpdateEntity({ icon })}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <Label text="Descrição" help={ENTITY_HELP.description} />
                                        <textarea
                                            value={selectedEntity.description || ''}
                                            onChange={e => handleUpdateEntity({ description: e.target.value })}
                                            placeholder="Descreva o propósito desta entidade..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== B) CAMPOS ASSOCIADOS ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader
                                id="fields"
                                title="Campos da Entidade"
                                icon={Package}
                                badge={selectedEntity.fields?.length || 0}
                            />
                            {expandedSections.fields && (
                                <div className={styles.sectionContent}>
                                    {/* Lista de campos */}
                                    {(selectedEntity.fields || []).length > 0 ? (
                                        <div className={styles.entityFieldList}>
                                            {selectedEntity.fields.map((ef, idx) => {
                                                const field = fields.find(f => f.id === ef.fieldId);
                                                if (!field) return null;
                                                return (
                                                    <div key={ef.fieldId} className={styles.entityFieldItem}>
                                                        <div className={styles.entityFieldDrag}>
                                                            <GripVertical size={14} />
                                                        </div>
                                                        <div className={styles.entityFieldInfo}>
                                                            <span className={styles.entityFieldIcon}>{field.icon || '📦'}</span>
                                                            <div>
                                                                <div className={styles.entityFieldName}>
                                                                    {ef.label || field.name}
                                                                </div>
                                                                <div className={styles.entityFieldMeta}>
                                                                    <code>{field.id}</code>
                                                                    <span>• {field.type}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={styles.entityFieldConfig}>
                                                            <select
                                                                value={ef.visibility}
                                                                onChange={e => handleUpdateFieldConfig(idx, { visibility: e.target.value })}
                                                                title="Visibilidade"
                                                            >
                                                                {VISIBILITY_OPTIONS.map(o => (
                                                                    <option key={o.id} value={o.id}>{o.label}</option>
                                                                ))}
                                                            </select>
                                                            <select
                                                                value={ef.editableBy}
                                                                onChange={e => handleUpdateFieldConfig(idx, { editableBy: e.target.value })}
                                                                title="Editável por"
                                                            >
                                                                {EDITABLE_OPTIONS.map(o => (
                                                                    <option key={o.id} value={o.id}>{o.label}</option>
                                                                ))}
                                                            </select>
                                                            <label className={styles.entityFieldCheck}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={ef.required}
                                                                    onChange={e => handleUpdateFieldConfig(idx, { required: e.target.checked })}
                                                                />
                                                                <span>Obrigatório</span>
                                                            </label>
                                                        </div>
                                                        <button
                                                            className={styles.entityFieldRemove}
                                                            onClick={() => handleRemoveField(idx)}
                                                            title="Remover campo"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className={styles.emptyFieldList}>
                                            <Package size={32} />
                                            <p>Nenhum campo associado</p>
                                            <small>Adicione campos para definir a estrutura desta entidade</small>
                                        </div>
                                    )}

                                    {/* Botões de ação */}
                                    <div className={styles.entityFieldActions}>
                                        <button
                                            className={styles.addFieldButton}
                                            onClick={() => setShowFieldPicker(true)}
                                            disabled={availableFields.length === 0}
                                        >
                                            <Plus size={16} />
                                            Adicionar Campo Existente
                                        </button>
                                    </div>

                                    {/* Field Picker Modal */}
                                    {showFieldPicker && (
                                        <div className={styles.modalOverlay} onClick={() => setShowFieldPicker(false)}>
                                            <div className={styles.fieldPickerModal} onClick={e => e.stopPropagation()}>
                                                <h4>Selecionar Campo</h4>
                                                <div className={styles.fieldPickerList}>
                                                    {availableFields.map(field => (
                                                        <button
                                                            key={field.id}
                                                            className={styles.fieldPickerItem}
                                                            onClick={() => handleAddField(field.id)}
                                                        >
                                                            <span className={styles.fieldPickerIcon}>{field.icon || '📦'}</span>
                                                            <div>
                                                                <div>{field.name}</div>
                                                                <small>{field.type}</small>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {availableFields.length === 0 && (
                                                        <p className={styles.noFields}>Todos os campos já foram adicionados</p>
                                                    )}
                                                </div>
                                                <button className={styles.modalClose} onClick={() => setShowFieldPicker(false)}>
                                                    Fechar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== C) COMPORTAMENTOS ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="behaviors" title="Comportamentos" icon={Zap} />
                            {expandedSections.behaviors && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.behaviorGrid}>
                                        <label className={styles.behaviorItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntity.behaviors?.playerControlled}
                                                onChange={e => handleDeepUpdate('behaviors.playerControlled', e.target.checked)}
                                            />
                                            <div>
                                                <span>Controlável por Jogador</span>
                                                <small>Jogadores podem controlar entidades deste tipo</small>
                                            </div>
                                        </label>
                                        <label className={styles.behaviorItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntity.behaviors?.showInMainList}
                                                onChange={e => handleDeepUpdate('behaviors.showInMainList', e.target.checked)}
                                            />
                                            <div>
                                                <span>Aparece na Lista Principal</span>
                                                <small>Visível na lista principal do sistema</small>
                                            </div>
                                        </label>
                                        <label className={styles.behaviorItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntity.behaviors?.participatesInCombat}
                                                onChange={e => handleDeepUpdate('behaviors.participatesInCombat', e.target.checked)}
                                            />
                                            <div>
                                                <span>Participa de Combate</span>
                                                <small>Pode entrar em encontros de combate</small>
                                            </div>
                                        </label>
                                        <label className={styles.behaviorItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntity.behaviors?.canBeTargeted}
                                                onChange={e => handleDeepUpdate('behaviors.canBeTargeted', e.target.checked)}
                                            />
                                            <div>
                                                <span>Pode Ser Alvo</span>
                                                <small>Pode receber efeitos e magias</small>
                                            </div>
                                        </label>
                                        <label className={styles.behaviorItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntity.behaviors?.canOwnEntities}
                                                onChange={e => handleDeepUpdate('behaviors.canOwnEntities', e.target.checked)}
                                            />
                                            <div>
                                                <span>Pode Possuir Entidades</span>
                                                <small>Inventário, spellbook, etc.</small>
                                            </div>
                                        </label>
                                        <label className={styles.behaviorItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntity.behaviors?.stackable}
                                                onChange={e => handleDeepUpdate('behaviors.stackable', e.target.checked)}
                                            />
                                            <div>
                                                <span>Empilhável (Stack)</span>
                                                <small>Múltiplas instâncias podem ser agrupadas</small>
                                            </div>
                                        </label>
                                        <label className={styles.behaviorItem}>
                                            <input
                                                type="checkbox"
                                                checked={selectedEntity.behaviors?.uniquePerPlayer}
                                                onChange={e => handleDeepUpdate('behaviors.uniquePerPlayer', e.target.checked)}
                                            />
                                            <div>
                                                <span>Única por Jogador</span>
                                                <small>Cada jogador pode ter apenas uma</small>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Ownable Types (if canOwnEntities is true) */}
                                    {selectedEntity.behaviors?.canOwnEntities && (
                                        <div className={styles.formGroup}>
                                            <Label text="Tipos que pode possuir" />
                                            <div className={styles.ownableTypes}>
                                                {entityTypes.filter(e => e.id !== selectedEntity.id).map(entity => (
                                                    <label key={entity.id} className={styles.ownableTypeItem}>
                                                        <input
                                                            type="checkbox"
                                                            checked={(selectedEntity.behaviors?.ownableTypes || []).includes(entity.id)}
                                                            onChange={e => {
                                                                const types = selectedEntity.behaviors?.ownableTypes || [];
                                                                if (e.target.checked) {
                                                                    handleDeepUpdate('behaviors.ownableTypes', [...types, entity.id]);
                                                                } else {
                                                                    handleDeepUpdate('behaviors.ownableTypes', types.filter(t => t !== entity.id));
                                                                }
                                                            }}
                                                        />
                                                        <span>{entity.icon} {entity.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ===== D) EVENTOS ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="events" title="Eventos" icon={Sparkles} />
                            {expandedSections.events && (
                                <div className={styles.sectionContent}>
                                    <p className={styles.sectionHint}>
                                        Eventos são ganchos para o Rule Engine. Configure as regras na aba Regras.
                                    </p>
                                    <div className={styles.eventList}>
                                        {ENTITY_EVENTS.map(event => (
                                            <div key={event.id} className={styles.eventItem}>
                                                <div className={styles.eventInfo}>
                                                    <span className={styles.eventName}>{event.label}</span>
                                                    <small>{event.description}</small>
                                                </div>
                                                <span className={styles.eventBadge}>0 regras</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===== E) LAYOUT ===== */}
                        <div className={styles.formSection}>
                            <SectionHeader id="layout" title="Layout da Ficha" icon={Layout} />
                            {expandedSections.layout && (
                                <div className={styles.sectionContent}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <Label text="Campo Título" help={ENTITY_HELP.titleField} />
                                            <select
                                                value={selectedEntity.layout?.titleField || ''}
                                                onChange={e => handleDeepUpdate('layout.titleField', e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                {(selectedEntity.fields || []).map(ef => {
                                                    const field = fields.find(f => f.id === ef.fieldId);
                                                    return field ? (
                                                        <option key={ef.fieldId} value={ef.fieldId}>
                                                            {field.icon} {ef.label || field.name}
                                                        </option>
                                                    ) : null;
                                                })}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <Label text="Campo Avatar" help={ENTITY_HELP.avatarField} />
                                            <select
                                                value={selectedEntity.layout?.avatarField || ''}
                                                onChange={e => handleDeepUpdate('layout.avatarField', e.target.value)}
                                            >
                                                <option value="">Nenhum</option>
                                                {(selectedEntity.fields || []).map(ef => {
                                                    const field = fields.find(f => f.id === ef.fieldId);
                                                    return field && field.type === 'text' ? (
                                                        <option key={ef.fieldId} value={ef.fieldId}>
                                                            {field.icon} {ef.label || field.name}
                                                        </option>
                                                    ) : null;
                                                })}
                                            </select>
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
                                        <Label text="ID Interno (Sistema)" help={ENTITY_HELP.id} />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input
                                                type="text"
                                                value={selectedEntity.internalId || selectedEntity.id}
                                                disabled
                                                className={styles.disabledInput}
                                                style={{ flex: 1, opacity: 0.7 }}
                                            />
                                            <button
                                                className={styles.iconButton}
                                                onClick={() => navigator.clipboard.writeText(selectedEntity.internalId || selectedEntity.id)}
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
                        <Crown size={48} />
                        <h3>Nenhuma entidade selecionada</h3>
                        <p>Selecione uma entidade na lista ou crie uma nova</p>
                        <button className={styles.createButton} onClick={handleAddEntity}>
                            <Plus size={18} />
                            Criar Entidade
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
