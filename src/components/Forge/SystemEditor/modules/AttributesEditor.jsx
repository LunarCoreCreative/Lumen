import React, { useState } from 'react';
import styles from './AttributesEditor.module.css';
import { Zap, Plus, Trash2, Eye, Edit, GripVertical, ChevronUp, ChevronDown, Calculator, Code } from 'lucide-react';
import { AttributeBuilderModal } from './AttributeBuilderModal';

const ATTRIBUTE_TYPES = [
    { value: 'number', label: 'Número', icon: '🔢' },
    { value: 'text', label: 'Texto', icon: '📝' },
    { value: 'boolean', label: 'Sim/Não', icon: '✓' },
    { value: 'select', label: 'Seleção', icon: '📋' },
    { value: 'derived', label: 'Calculado', icon: '🔄' }
];



export function AttributesEditor({ data, onChange }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState(null);

    const handleAddAttribute = () => {
        setEditingAttr(null);
        setModalOpen(true);
    };

    const handleEditAttribute = (attr) => {
        setEditingAttr(attr);
        setModalOpen(true);
    };

    const handleSaveAttribute = (newAttr) => {
        if (editingAttr) {
            // Update existing
            onChange(data.map(attr => attr.id === editingAttr.id ? newAttr : attr));
        } else {
            // Add new
            onChange([...data, { ...newAttr, id: `attr-${Date.now()}`, order: data.length }]);
        }
        setModalOpen(false);
        setEditingAttr(null);
    };

    const handleUpdateAttribute = (id, field, value) => {
        onChange(data.map(attr =>
            attr.id === id ? { ...attr, [field]: value } : attr
        ));
    };

    const handleDeleteAttribute = (id) => {
        onChange(data.filter(attr => attr.id !== id));
    };

    const handleMoveAttribute = (index, direction) => {
        const newData = [...data];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newData.length) return;

        [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
        newData.forEach((attr, idx) => attr.order = idx);
        onChange(newData);
    };

    // Calcular preview do modificador
    const calculateModifier = (value, formula) => {
        try {
            const result = eval(formula.replace('value', value));
            return Math.floor(result);
        } catch {
            return '?';
        }
    };

    // Variáveis disponíveis para fórmulas
    const getAvailableVariables = (currentAttrId) => {
        return data
            .filter(attr => attr.id !== currentAttrId && attr.type === 'number')
            .map(attr => ({
                name: attr.shortName || attr.name,
                id: attr.id,
                example: attr.default || 10
            }));
    };

    const dragItem = React.useRef(null);
    const dragOverItem = React.useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragEnabled, setDragEnabled] = useState(false);

    const handleDragStart = (e, index) => {
        if (!dragEnabled) {
            e.preventDefault();
            return;
        }
        dragItem.current = index;
        setIsDragging(true);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e, index) => {
        // Evitar reordenar se for o mesmo item
        if (dragItem.current === index) return;

        dragOverItem.current = index;

        // Reordenar array
        const newData = [...data];
        const draggedItemContent = newData[dragItem.current];
        newData.splice(dragItem.current, 1);
        newData.splice(dragOverItem.current, 0, draggedItemContent);

        // Atualizar referência do item arrastado para o novo índice
        dragItem.current = index;

        onChange(newData);
    };

    const handleDragEnd = (e) => {
        setIsDragging(false);
        dragItem.current = null;
        dragOverItem.current = null;
        e.target.style.opacity = '1';
        setDragEnabled(false);
    };

    return (
        <div className={styles.attributesEditor}>
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <Zap size={32} />
                </div>
                <div>
                    <h2 className={styles.moduleTitle}>Atributos & Cálculos</h2>
                    <p className={styles.moduleSubtitle}>Sistema completo de atributos com fórmulas e modificadores</p>
                </div>
                <button
                    className={`${styles.previewBtn} ${previewMode ? styles.active : ''}`}
                    onClick={() => setPreviewMode(!previewMode)}
                >
                    <Eye size={18} />
                    <span>{previewMode ? 'Modo Edição' : 'Preview'}</span>
                </button>
            </div>

            {/* Info Box */}
            <div className={styles.infoBox}>
                <div className={styles.infoIcon}>💡</div>
                <div>
                    <strong>Sistema de Engine Completo:</strong>
                    <ul>
                        <li><strong>Atributos Base:</strong> Valores principais (Força, Destreza, etc)</li>
                        <li><strong>Modificadores:</strong> Fórmulas para calcular bônus (ex: D&D usa (valor - 10) /  2)</li>
                        <li><strong>Atributos Derivados:</strong> Calculados a partir de outros (ex: PV = CON × 5 + nível × 3)</li>
                        <li><strong>Variáveis:</strong> Use {'{nome}'} nas fórmulas para referenciar outros atributos</li>
                    </ul>
                </div>
            </div>

            <div className={styles.attributesList}>
                {data.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>⚡</div>
                        <h3>Nenhum atributo definido</h3>
                        <p>Adicione atributos como Força, Destreza, Inteligência...</p>
                    </div>
                ) : previewMode ? (
                    <div className={styles.previewGrid}>
                        {data.map(attr => {
                            const modValue = attr.type === 'number' && attr.modifierFormula
                                ? calculateModifier(attr.default || 10, attr.modifierFormula)
                                : null;

                            return (
                                <div
                                    key={attr.id}
                                    className={styles.previewCard}
                                    style={{
                                        '--category-color': attr.color || '#8b5cf6',
                                        borderColor: attr.color || '#8b5cf6',
                                        boxShadow: `0 0 20px ${attr.color || '#8b5cf6'}40`
                                    }}
                                >
                                    <div className={styles.previewName}>{attr.name || 'Sem nome'}</div>
                                    <div className={styles.previewShort}>{attr.shortName}</div>
                                    <div className={styles.previewValue}>{attr.default || 10}</div>
                                    {modValue !== null && (
                                        <div className={styles.previewMod}>
                                            Mod: {modValue >= 0 ? '+' : ''}{modValue}
                                        </div>
                                    )}
                                    {attr.type === 'derived' && (
                                        <div className={styles.derivedBadge}>Calculado</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    data.map((attr, index) => {
                        const isExpanded = false;
                        const availableVars = getAvailableVariables(attr.id);

                        return (
                            <div
                                key={attr.id}
                                className={`${styles.attributeCard} ${isExpanded ? styles.expanded : ''}`}
                                style={{
                                    '--category-color': attr.color || '#8b5cf6',
                                    borderColor: attr.color || '#8b5cf6',
                                    opacity: isDragging && dragItem.current === index ? 0.5 : 1,
                                    cursor: 'default'
                                }}
                                draggable={dragEnabled}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <div className={styles.cardHeader}>
                                    <div
                                        className={styles.dragHandle}
                                        style={{ cursor: 'grab' }}
                                        onMouseEnter={() => setDragEnabled(true)}
                                        onMouseLeave={() => setDragEnabled(false)}
                                        onMouseDown={() => setDragEnabled(true)}
                                        onMouseUp={() => setDragEnabled(false)}
                                    >
                                        <GripVertical size={18} />
                                    </div>

                                    <div className={styles.headerContent}>
                                        <div className={styles.headerTop}>
                                            <div className={styles.headerInfo}>
                                                <h3 className={styles.attrName}>{attr.name || 'Sem nome'}</h3>
                                                <div className={styles.attrMeta}>
                                                    <span className={styles.shortName} style={{ color: attr.color || '#8b5cf6' }}>
                                                        {attr.shortName || 'ATR'}
                                                    </span>

                                                    {/* Badge de Tipo */}
                                                    <span className={styles.typeBadge} style={{
                                                        background: `${attr.color || '#8b5cf6'}20`,
                                                        borderColor: `${attr.color || '#8b5cf6'}40`
                                                    }}>
                                                        {attr.attributeType === 'pool' && '❤️ Pool'}
                                                        {attr.attributeType === 'dice_pool' && '🎲 Dados'}
                                                        {attr.attributeType === 'progress_bar' && '📊 Barra'}
                                                        {(!attr.attributeType || attr.attributeType === 'numeric') && '🔢 Numérico'}
                                                    </span>

                                                    {/* Categoria */}
                                                    {attr.category && (
                                                        <span className={styles.categoryBadge}>
                                                            {attr.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Preview Visual */}
                                            <div className={styles.quickPreview}>
                                                {attr.attributeType === 'pool' ? (
                                                    <div className={styles.poolPreview}>
                                                        <span className={styles.poolCurrent}>{attr.default || 10}</span>
                                                        <span className={styles.poolSep}>/</span>
                                                        <span className={styles.poolMax}>{attr.max || attr.default || 10}</span>
                                                    </div>
                                                ) : attr.attributeType === 'dice_pool' ? (
                                                    <div className={styles.dicePreview}>
                                                        🎲 {attr.default || 1}{attr.diceType || 'd6'}
                                                    </div>
                                                ) : attr.attributeType === 'progress_bar' ? (
                                                    <div className={styles.barPreview}>
                                                        <div className={styles.miniBar}>
                                                            <div className={styles.miniBarFill} style={{
                                                                width: `${((attr.default || 0) / (attr.max || 100)) * 100}%`,
                                                                background: attr.color || '#8b5cf6'
                                                            }} />
                                                        </div>
                                                        <span className={styles.barValue}>{attr.default || 0}/{attr.max || 100}</span>
                                                    </div>
                                                ) : (
                                                    <div className={styles.numericPreview}>
                                                        <span className={styles.mainValue}>{attr.default || 10}</span>
                                                        {attr.showModifier !== false && attr.modifierFormula && (
                                                            <span className={styles.modValue}>
                                                                Mod: {calculateModifier(attr.default || 10, attr.modifierFormula) >= 0 ? '+' : ''}
                                                                {calculateModifier(attr.default || 10, attr.modifierFormula)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info adicional */}
                                        {(attr.evolutionType || attr.min || attr.max) && (
                                            <div className={styles.headerBottom}>
                                                <div className={styles.infoTags}>
                                                    {attr.evolutionType && attr.evolutionType !== 'none' && (
                                                        <span className={styles.infoTag}>
                                                            ⚡ {attr.evolutionType === 'xp' && 'XP'}
                                                            {attr.evolutionType === 'points' && 'Pontos'}
                                                            {attr.evolutionType === 'milestone' && 'Milestone'}
                                                            {attr.evolutionType === 'training' && 'Treinamento'}
                                                        </span>
                                                    )}
                                                    {attr.evolutionType === 'none' && (
                                                        <span className={styles.infoTag} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                                            🚫 Não Evoluível
                                                        </span>
                                                    )}
                                                    {attr.min !== undefined && attr.max !== undefined && attr.attributeType !== 'pool' && (
                                                        <span className={styles.infoTag}>
                                                            📏 {attr.min}-{attr.max}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.headerActions}>
                                        <button
                                            className={styles.iconBtn}
                                            onClick={() => handleEditAttribute(attr)}
                                            title="Editar Atributo"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteAttribute(attr.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {false && (
                                    <div className={styles.cardBody}>
                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label>Nome Curto</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: FOR, DES, INT"
                                                    value={attr.shortName}
                                                    onChange={(e) => handleUpdateAttribute(attr.id, 'shortName', e.target.value)}
                                                    maxLength={5}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>Tipo</label>
                                                <select
                                                    value={attr.type}
                                                    onChange={(e) => handleUpdateAttribute(attr.id, 'type', e.target.value)}
                                                >
                                                    {ATTRIBUTE_TYPES.map(type => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.icon} {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label>Categoria</label>
                                                <select
                                                    value={attr.category}
                                                    onChange={(e) => handleUpdateAttribute(attr.id, 'category', e.target.value)}
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {attr.type === 'number' && (
                                                <>
                                                    <div className={styles.formGroup}>
                                                        <label>Valor Mínimo</label>
                                                        <input
                                                            type="number"
                                                            value={attr.min}
                                                            onChange={(e) => handleUpdateAttribute(attr.id, 'min', parseInt(e.target.value))}
                                                        />
                                                    </div>

                                                    <div className={styles.formGroup}>
                                                        <label>Valor Máximo</label>
                                                        <input
                                                            type="number"
                                                            value={attr.max}
                                                            onChange={(e) => handleUpdateAttribute(attr.id, 'max', parseInt(e.target.value))}
                                                        />
                                                    </div>

                                                    <div className={styles.formGroup}>
                                                        <label>Valor Padrão</label>
                                                        <input
                                                            type="number"
                                                            value={attr.default}
                                                            onChange={(e) => handleUpdateAttribute(attr.id, 'default', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label>Descrição</label>
                                            <textarea
                                                placeholder="Descreva o que este atributo representa..."
                                                value={attr.description}
                                                onChange={(e) => handleUpdateAttribute(attr.id, 'description', e.target.value)}
                                                rows={2}
                                            />
                                        </div>

                                        {/* Sistema de Modificadores */}
                                        {attr.type === 'number' && (
                                            <div className={styles.formulaSection}>
                                                <div className={styles.formulaHeader}>
                                                    <Calculator size={18} />
                                                    <span>Fórmula de Modificador</span>
                                                </div>
                                                <div className={styles.formulaGroup}>
                                                    <input
                                                        type="text"
                                                        className={styles.formulaInput}
                                                        placeholder="Ex: (value - 10) / 2"
                                                        value={attr.modifierFormula || ''}
                                                        onChange={(e) => handleUpdateAttribute(attr.id, 'modifierFormula', e.target.value)}
                                                    />
                                                    <div className={styles.formulaHelp}>
                                                        Use <code>value</code> para o valor do atributo
                                                    </div>
                                                    {attr.modifierFormula && (
                                                        <div className={styles.formulaPreview}>
                                                            <strong>Preview:</strong> Valor {attr.default || 10} → Modificador: {calculateModifier(attr.default || 10, attr.modifierFormula)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Atributos Derivados */}
                                        {attr.type === 'derived' && (
                                            <div className={styles.formulaSection}>
                                                <div className={styles.formulaHeader}>
                                                    <Code size={18} />
                                                    <span>Fórmula de Cálculo</span>
                                                </div>
                                                <div className={styles.formulaGroup}>
                                                    <textarea
                                                        className={styles.formulaInput}
                                                        placeholder="Ex: {FOR} * 2 + {CON} * 3 + level * 5"
                                                        value={attr.derivedFormula || ''}
                                                        onChange={(e) => handleUpdateAttribute(attr.id, 'derivedFormula', e.target.value)}
                                                        rows={3}
                                                    />
                                                    <div className={styles.formulaHelp}>
                                                        <strong>Variáveis Disponíveis:</strong>
                                                        {availableVars.length > 0 ? (
                                                            <div className={styles.variablesList}>
                                                                {availableVars.map(v => (
                                                                    <code key={v.id} className={styles.variableTag}>
                                                                        {'{' + v.name + '}'}
                                                                    </code>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className={styles.noVars}>Nenhum atributo numérico disponível</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <button className={styles.addButton} onClick={handleAddAttribute}>
                <Plus size={20} />
                <span>Adicionar Atributo</span>
            </button>

            {/* Modal */}
            {modalOpen && (
                <AttributeBuilderModal
                    attribute={editingAttr}
                    onSave={handleSaveAttribute}
                    onClose={() => setModalOpen(false)}
                    allAttributes={data}
                />
            )}
        </div>
    );
}
