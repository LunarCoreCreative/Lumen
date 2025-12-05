import React, { useState } from 'react';
import styles from './CustomSectionsEditor.module.css';
import { Layers, Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronRight, Settings, X } from 'lucide-react';

// Tipos de campo disponíveis
const FIELD_TYPES = [
    { id: 'text', label: 'Texto Curto', icon: '📝' },
    { id: 'textarea', label: 'Texto Longo', icon: '📄' },
    { id: 'number', label: 'Número', icon: '🔢' },
    { id: 'select', label: 'Seleção', icon: '📋' },
    { id: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { id: 'dice', label: 'Dados', icon: '🎲' },
];

// Templates de seção
const SECTION_TEMPLATES = [
    {
        id: 'races', name: 'Raças', icon: '👤', fields: [
            { id: 'bonus', name: 'Bônus', type: 'text' },
            { id: 'extra_hp', name: 'Vida Extra', type: 'number' },
            { id: 'traits', name: 'Traços', type: 'textarea' }
        ]
    },
    {
        id: 'classes', name: 'Classes', icon: '⚔️', fields: [
            { id: 'hit_dice', name: 'Dado de Vida', type: 'dice' },
            { id: 'armor', name: 'Armaduras', type: 'text' },
            { id: 'features', name: 'Características', type: 'textarea' }
        ]
    },
    {
        id: 'equipment', name: 'Equipamentos', icon: '🛡️', fields: [
            { id: 'price', name: 'Preço', type: 'number' },
            { id: 'weight', name: 'Peso', type: 'number' },
            { id: 'properties', name: 'Propriedades', type: 'text' }
        ]
    },
    {
        id: 'spells', name: 'Magias', icon: '✨', fields: [
            { id: 'level', name: 'Nível', type: 'number' },
            { id: 'casting_time', name: 'Tempo de Conjuração', type: 'text' },
            { id: 'range', name: 'Alcance', type: 'text' },
            { id: 'effect', name: 'Efeito', type: 'textarea' }
        ]
    },
    { id: 'custom', name: 'Personalizado', icon: '⚙️', fields: [] }
];

// Ícones disponíveis
const AVAILABLE_ICONS = ['👤', '⚔️', '🛡️', '✨', '📜', '🏛️', '🌍', '👹', '💎', '🎭', '🏰', '⚗️', '🔮', '📿', '🗡️', '🏹', '🐉', '🌙', '☀️', '🔥'];

export function CustomSectionsEditor({ data = [], onChange }) {
    const [editingSection, setEditingSection] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Criar nova seção
    const handleAddSection = (template) => {
        const newSection = {
            id: `section-${Date.now()}`,
            name: template.name === 'Personalizado' ? 'Nova Seção' : template.name,
            icon: template.icon,
            type: 'list',
            fields: template.fields.map(f => ({ ...f, id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })),
            entries: []
        };
        onChange([...data, newSection]);
        if (template.id === 'custom') {
            setEditingSection(newSection);
        }
    };

    // Deletar seção
    const handleDeleteSection = (sectionId) => {
        if (!window.confirm('Tem certeza que deseja deletar esta seção e todo seu conteúdo?')) return;
        onChange(data.filter(s => s.id !== sectionId));
    };

    // Atualizar seção
    const handleUpdateSection = (sectionId, updates) => {
        onChange(data.map(s => s.id === sectionId ? { ...s, ...updates } : s));
    };

    // Toggle expandir seção
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    // Adicionar entry
    const handleAddEntry = (sectionId) => {
        const section = data.find(s => s.id === sectionId);
        const newEntry = {
            id: `entry-${Date.now()}`,
            title: 'Novo Item',
            fields: section.fields.reduce((acc, f) => ({ ...acc, [f.id]: '' }), {})
        };
        handleUpdateSection(sectionId, { entries: [...section.entries, newEntry] });
        setEditingEntry({ sectionId, entry: newEntry });
    };

    // Deletar entry
    const handleDeleteEntry = (sectionId, entryId) => {
        const section = data.find(s => s.id === sectionId);
        handleUpdateSection(sectionId, { entries: section.entries.filter(e => e.id !== entryId) });
    };

    // Atualizar entry
    const handleUpdateEntry = (sectionId, entryId, updates) => {
        const section = data.find(s => s.id === sectionId);
        const updatedEntries = section.entries.map(e => e.id === entryId ? { ...e, ...updates } : e);
        handleUpdateSection(sectionId, { entries: updatedEntries });
    };

    return (
        <div className={styles.customEditor}>
            {/* Header */}
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <Layers size={32} />
                </div>
                <div>
                    <h2 className={styles.moduleTitle}>Seções Customizadas</h2>
                    <p className={styles.moduleSubtitle}>Crie conteúdo personalizado para seu sistema</p>
                </div>
            </div>

            {/* Info Box */}
            <div className={styles.infoBox}>
                <div className={styles.infoIcon}>💡</div>
                <div>
                    <strong>Seções Flexíveis:</strong>
                    <ul>
                        <li><strong>Raças/Classes:</strong> Defina opções de personagem</li>
                        <li><strong>Equipamentos:</strong> Liste itens, armas, armaduras</li>
                        <li><strong>Magias/Poderes:</strong> Catálogo de habilidades</li>
                        <li><strong>Lore:</strong> Facções, religiões, locais</li>
                    </ul>
                </div>
            </div>

            {/* Lista de Seções */}
            <div className={styles.sectionsList}>
                {data.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📦</div>
                        <h3>Nenhuma seção criada</h3>
                        <p>Use os templates abaixo para começar</p>
                    </div>
                ) : (
                    data.map(section => (
                        <div key={section.id} className={styles.sectionCard}>
                            <div className={styles.sectionHeader} onClick={() => toggleSection(section.id)}>
                                <div className={styles.sectionDrag}>
                                    <GripVertical size={18} />
                                </div>
                                <div className={styles.sectionIcon}>{section.icon}</div>
                                <div className={styles.sectionInfo}>
                                    <h3 className={styles.sectionName}>{section.name}</h3>
                                    <span className={styles.sectionMeta}>
                                        {section.entries?.length || 0} itens • {section.fields?.length || 0} campos
                                    </span>
                                </div>
                                <div className={styles.sectionActions}>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={(e) => { e.stopPropagation(); setEditingSection(section); }}
                                        title="Configurar Seção"
                                    >
                                        <Settings size={16} />
                                    </button>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                        title="Deletar Seção"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedSections[section.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                            </div>

                            {/* Entries expandidos */}
                            {expandedSections[section.id] && (
                                <div className={styles.entriesContainer}>
                                    {section.entries?.length === 0 ? (
                                        <div className={styles.noEntries}>
                                            <p>Nenhum item adicionado</p>
                                        </div>
                                    ) : (
                                        <div className={styles.entriesList}>
                                            {section.entries.map(entry => (
                                                <div key={entry.id} className={styles.entryCard}>
                                                    <div className={styles.entryTitle}>{entry.title}</div>
                                                    <div className={styles.entryPreview}>
                                                        {section.fields.slice(0, 2).map(field => (
                                                            <span key={field.id} className={styles.entryField}>
                                                                {field.name}: {entry.fields?.[field.id] || '-'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className={styles.entryActions}>
                                                        <button
                                                            className={styles.entryBtn}
                                                            onClick={() => setEditingEntry({ sectionId: section.id, entry })}
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            className={styles.entryBtn}
                                                            onClick={() => handleDeleteEntry(section.id, entry.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        className={styles.addEntryBtn}
                                        onClick={() => handleAddEntry(section.id)}
                                    >
                                        <Plus size={16} />
                                        Adicionar Item
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Templates */}
            <div className={styles.templatesSection}>
                <h3 className={styles.templatesTitle}>Adicionar Seção</h3>
                <div className={styles.templatesGrid}>
                    {SECTION_TEMPLATES.map(template => (
                        <button
                            key={template.id}
                            className={styles.templateCard}
                            onClick={() => handleAddSection(template)}
                        >
                            <div className={styles.templateIcon}>{template.icon}</div>
                            <div className={styles.templateName}>{template.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal de Edição de Seção */}
            {editingSection && (
                <SectionEditorModal
                    section={editingSection}
                    onSave={(updates) => {
                        handleUpdateSection(editingSection.id, updates);
                        setEditingSection(null);
                    }}
                    onClose={() => setEditingSection(null)}
                />
            )}

            {/* Modal de Edição de Entry */}
            {editingEntry && (
                <EntryEditorModal
                    section={data.find(s => s.id === editingEntry.sectionId)}
                    entry={editingEntry.entry}
                    onSave={(updates) => {
                        handleUpdateEntry(editingEntry.sectionId, editingEntry.entry.id, updates);
                        setEditingEntry(null);
                    }}
                    onClose={() => setEditingEntry(null)}
                />
            )}
        </div>
    );
}

// Modal para editar configurações da seção
function SectionEditorModal({ section, onSave, onClose }) {
    const [formData, setFormData] = useState({ ...section });
    const [newField, setNewField] = useState({ name: '', type: 'text' });

    const addField = () => {
        if (!newField.name.trim()) return;
        const field = {
            id: `field-${Date.now()}`,
            name: newField.name,
            type: newField.type,
            options: newField.type === 'select' ? ['Opção 1', 'Opção 2'] : undefined
        };
        setFormData({ ...formData, fields: [...formData.fields, field] });
        setNewField({ name: '', type: 'text' });
    };

    const removeField = (fieldId) => {
        setFormData({ ...formData, fields: formData.fields.filter(f => f.id !== fieldId) });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Configurar Seção</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.modalContent}>
                    {/* Nome e Ícone */}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Nome da Seção</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ícone</label>
                            <div className={styles.iconPicker}>
                                {AVAILABLE_ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        className={`${styles.iconOption} ${formData.icon === icon ? styles.selected : ''}`}
                                        onClick={() => setFormData({ ...formData, icon })}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Campos */}
                    <div className={styles.fieldsSection}>
                        <h3>Campos Customizados</h3>
                        <p className={styles.fieldHelp}>Defina quais informações cada item terá</p>

                        <div className={styles.fieldsList}>
                            {formData.fields.map(field => (
                                <div key={field.id} className={styles.fieldItem}>
                                    <span className={styles.fieldIcon}>
                                        {FIELD_TYPES.find(f => f.id === field.type)?.icon}
                                    </span>
                                    <span className={styles.fieldName}>{field.name}</span>
                                    <span className={styles.fieldType}>{field.type}</span>
                                    <button className={styles.removeFieldBtn} onClick={() => removeField(field.id)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.addFieldRow}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Nome do campo..."
                                value={newField.name}
                                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && addField()}
                            />
                            <select
                                className={styles.select}
                                value={newField.type}
                                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                            >
                                {FIELD_TYPES.map(type => (
                                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                                ))}
                            </select>
                            <button className={styles.addFieldBtn} onClick={addField}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={() => onSave(formData)}>Salvar</button>
                </div>
            </div>
        </div>
    );
}

// Modal para editar entry
function EntryEditorModal({ section, entry, onSave, onClose }) {
    const [formData, setFormData] = useState({ ...entry });

    const updateField = (fieldId, value) => {
        setFormData({
            ...formData,
            fields: { ...formData.fields, [fieldId]: value }
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{section.icon} Editar Item</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.modalContent}>
                    <div className={styles.formGroup}>
                        <label>Título</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {section.fields.map(field => (
                        <div key={field.id} className={styles.formGroup}>
                            <label>{field.name}</label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    className={styles.textarea}
                                    rows={3}
                                    value={formData.fields?.[field.id] || ''}
                                    onChange={(e) => updateField(field.id, e.target.value)}
                                />
                            ) : field.type === 'number' ? (
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={formData.fields?.[field.id] || ''}
                                    onChange={(e) => updateField(field.id, e.target.value)}
                                />
                            ) : field.type === 'checkbox' ? (
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.fields?.[field.id] || false}
                                        onChange={(e) => updateField(field.id, e.target.checked)}
                                    />
                                    Ativo
                                </label>
                            ) : field.type === 'select' && field.options ? (
                                <select
                                    className={styles.select}
                                    value={formData.fields?.[field.id] || ''}
                                    onChange={(e) => updateField(field.id, e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {field.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder={field.type === 'dice' ? 'Ex: 2d6+2' : ''}
                                    value={formData.fields?.[field.id] || ''}
                                    onChange={(e) => updateField(field.id, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={() => onSave(formData)}>Salvar</button>
                </div>
            </div>
        </div>
    );
}
