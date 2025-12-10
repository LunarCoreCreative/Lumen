import React, { useState, useCallback } from 'react';
import {
    Box, Type, Image as ImageIcon, Monitor, Layers, Folder,
    ChevronDown, ChevronRight, Eye, MousePointer,
    Settings, Copy, Trash2, X, AlertTriangle, Move, Palette, Edit3,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Plus, LayoutGrid, ScrollText,
    ArrowRight, ArrowDown, Link,
    // Ícones para widgets RPG
    Gauge, Target, Heart, Dices
} from 'lucide-react';
import styles from './InspectorPanel.module.css';

// === FIELD COMPONENTS MOVED OUTSIDE ===
const NumberField = React.memo(({ label, value, onChange, step = 1, min, max }) => {
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.value = value ?? 0;
        }
    }, [value]);

    return (
        <div className={styles.field}>
            <label>{label}</label>
            <input
                ref={inputRef}
                type="number"
                defaultValue={value ?? 0}
                step={step}
                min={min}
                max={max}
                onBlur={(e) => onChange(Number(e.target.value))}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onChange(Number(e.target.value));
                    }
                }}
            />
        </div>
    );
});

const ColorField = ({ label, value, onChange }) => (
    <div className={styles.field}>
        <label>{label}</label>
        <div className={styles.colorInput}>
            <input
                type="color"
                value={value || '#ffffff'}
                onChange={(e) => onChange(e.target.value)}
            />
            <span className={styles.colorValue}>{value || '#ffffff'}</span>
        </div>
    </div>
);

const SliderField = React.memo(({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => {
    const numberRef = React.useRef(null);

    const handleInput = (e) => {
        if (numberRef.current) {
            numberRef.current.value = e.target.value;
        }
    };

    const handleRelease = (e) => {
        onChange(parseFloat(e.target.value));
    };

    return (
        <div className={styles.field}>
            <label>{label}</label>
            <div className={styles.sliderWrapper}>
                <input
                    type="range"
                    className={styles.rangeInput}
                    defaultValue={value ?? max}
                    min={min}
                    max={max}
                    step={step}
                    onInput={handleInput}
                    onMouseUp={handleRelease}
                    onTouchEnd={handleRelease}
                />
                <input
                    ref={numberRef}
                    type="number"
                    className={styles.sliderInput}
                    defaultValue={value ?? max}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                />
            </div>
        </div>
    );
});

const TextField = React.memo(({ label, value, onChange, placeholder }) => {
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.value = value || '';
        }
    }, [value]);

    return (
        <div className={styles.field}>
            <label>{label}</label>
            <input
                ref={inputRef}
                type="text"
                defaultValue={value || ''}
                placeholder={placeholder}
                onBlur={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onChange(e.target.value);
                    }
                }}
            />
        </div>
    );
});

const SelectField = ({ label, value, options, onChange }) => (
    <div className={styles.field}>
        <label>{label}</label>
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);


/**
 * InspectorPanel - Unity-style Inspector / Properties Panel
 * 
 * Features:
 * - Collapsible sections with headers
 * - Property editors per widget type
 * - Transform section (x, y, w, h)
 * - Type-specific property sections
 * - Component system (like Unity)
 * - Clean Unity-inspired styling
 */

// Widget type icons
const WIDGET_ICONS = {
    container: Folder,
    scrollView: ScrollText,
    panel: Box,
    text: Type,
    image: ImageIcon,
    canvas: Monitor,
    // Widgets RPG
    attributeDisplay: Gauge,
    skillDisplay: Target,
    resourceBar: Heart,
    diceButton: Dices,
};

// Componentes disponíveis (estilo Unity)
const COMPONENT_TYPES = {
    layoutGroup: {
        id: 'layoutGroup',
        label: 'Grupo de Layout',
        icon: LayoutGrid,
        description: 'Organiza filhos em linha ou coluna',
        defaultConfig: {
            direction: 'vertical',
            spacing: 8,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            alignItems: 'stretch',
            justifyContent: 'start',
            childControlWidth: false,
            childControlHeight: false,
        }
    },
};

export function InspectorPanel({
    selectedWidget,
    selectedWidgetCount = 0,
    onUpdateWidget,
    fields = [],
    events = [],
    style = {},
}) {
    // Collapsed sections state
    const [collapsedSections, setCollapsedSections] = useState({});

    // Helper: Filtrar fields por tipo (para dropdowns)
    const getFieldOptions = useCallback((typeFilter = null) => {
        const filtered = typeFilter
            ? fields.filter(f => {
                if (typeFilter === 'numeric') return ['number', 'computed', 'resource', 'dice'].includes(f.type);
                return f.type === typeFilter || f.category === typeFilter;
            })
            : fields;
        return [
            { value: '', label: '-- Selecione --' },
            ...filtered.map(f => ({ value: f.id, label: f.name || f.codeId || f.id }))
        ];
    }, [fields]);

    // Helper: Buscar dados de um field pelo ID
    const getFieldData = useCallback((fieldId) => {
        return fields.find(f => f.id === fieldId) || null;
    }, [fields]);

    // Helper: Filtrar eventos por tipo (para dropdowns)
    const getEventOptions = useCallback((typeFilter = null) => {
        const filtered = typeFilter
            ? events.filter(e => e.type === typeFilter || e.category === typeFilter)
            : events;
        return [
            { value: '', label: '-- Selecione --' },
            ...filtered.map(e => ({ value: e.id, label: e.name || e.id }))
        ];
    }, [events]);

    // Helper: Buscar dados de um evento pelo ID
    const getEventData = useCallback((eventId) => {
        return events.find(e => e.id === eventId) || null;
    }, [events]);

    const toggleSection = useCallback((section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    // Update widget handler
    const updateProp = useCallback((key, value) => {
        if (!selectedWidget) return;
        onUpdateWidget?.(selectedWidget.id, {
            props: { ...selectedWidget.props, [key]: value }
        });
    }, [selectedWidget, onUpdateWidget]);

    const updateTransform = useCallback((key, value) => {
        if (!selectedWidget) return;
        onUpdateWidget?.(selectedWidget.id, { [key]: value });
    }, [selectedWidget, onUpdateWidget]);

    // Component management
    const addComponent = useCallback((componentId) => {
        if (!selectedWidget) return;
        const componentType = COMPONENT_TYPES[componentId];
        if (!componentType) return;

        const existingComponents = selectedWidget.components || [];
        // Don't add duplicate
        if (existingComponents.some(c => c.type === componentId)) return;

        const newComponent = {
            type: componentId,
            config: { ...componentType.defaultConfig }
        };
        onUpdateWidget?.(selectedWidget.id, {
            components: [...existingComponents, newComponent]
        });
        setShowComponentMenu(false);
    }, [selectedWidget, onUpdateWidget]);

    const updateComponent = useCallback((componentType, configKey, value) => {
        if (!selectedWidget) return;
        const components = (selectedWidget.components || []).map(comp => {
            if (comp.type === componentType) {
                return { ...comp, config: { ...comp.config, [configKey]: value } };
            }
            return comp;
        });
        onUpdateWidget?.(selectedWidget.id, { components });
    }, [selectedWidget, onUpdateWidget]);

    const removeComponent = useCallback((componentType) => {
        if (!selectedWidget) return;
        const components = (selectedWidget.components || []).filter(c => c.type !== componentType);
        onUpdateWidget?.(selectedWidget.id, { components });
    }, [selectedWidget, onUpdateWidget]);

    // Show component menu state
    const [showComponentMenu, setShowComponentMenu] = useState(false);

    // === SECTION COMPONENT ===
    const Section = ({ title, icon: IconComp, id, children }) => {
        const isCollapsed = collapsedSections[id];

        return (
            <div className={styles.section}>
                <div
                    className={styles.sectionHeader}
                    onClick={() => toggleSection(id)}
                >
                    <span className={styles.sectionToggle}>
                        {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </span>
                    {IconComp && <IconComp size={14} className={styles.sectionIcon} />}
                    <span className={styles.sectionTitle}>{title}</span>
                </div>
                {!isCollapsed && (
                    <div className={styles.sectionBody}>
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // === RENDER WIDGET INFO ===
    const renderWidgetHeader = () => {
        if (!selectedWidget) return null;

        const IconComp = WIDGET_ICONS[selectedWidget.type] || Box;
        const typeName = selectedWidget.type.charAt(0).toUpperCase() + selectedWidget.type.slice(1);

        return (
            <div className={styles.widgetHeader}>
                <div className={styles.widgetIcon}>
                    <IconComp size={18} />
                </div>
                <div className={styles.widgetInfo}>
                    <span className={styles.widgetName}>{selectedWidget.name || typeName}</span>
                    <span className={styles.widgetType}>{typeName}</span>
                </div>
            </div>
        );
    };

    // === TRANSFORM SECTION ===
    const renderTransformSection = () => (
        <Section title="Transform" icon={Move} id="transform">
            <div className={styles.fieldRow}>
                <NumberField
                    label="X"
                    value={selectedWidget.x}
                    onChange={(v) => updateTransform('x', v)}
                />
                <NumberField
                    label="Y"
                    value={selectedWidget.y}
                    onChange={(v) => updateTransform('y', v)}
                />
            </div>
            <div className={styles.fieldRow}>
                <NumberField
                    label="W"
                    value={selectedWidget.w}
                    onChange={(v) => updateTransform('w', v)}
                    min={10}
                />
                <NumberField
                    label="H"
                    value={selectedWidget.h}
                    onChange={(v) => updateTransform('h', v)}
                    min={10}
                />
            </div>
        </Section>
    );

    // === PANEL PROPERTIES ===
    const renderPanelProperties = () => (
        <>
            <Section title="Background" icon={Palette} id="background">
                <ColorField
                    label="Color"
                    value={selectedWidget.props?.backgroundColor}
                    onChange={(v) => updateProp('backgroundColor', v)}
                />
                <SliderField
                    label="Opacity"
                    value={selectedWidget.props?.backgroundAlpha}
                    onChange={(v) => updateProp('backgroundAlpha', v)}
                />
            </Section>

            <Section title="Border" icon={Box} id="border">
                <div className={styles.fieldRow}>
                    <NumberField
                        label="TL"
                        value={selectedWidget.props?.borderRadiusTL}
                        onChange={(v) => updateProp('borderRadiusTL', v)}
                        min={0}
                    />
                    <NumberField
                        label="TR"
                        value={selectedWidget.props?.borderRadiusTR}
                        onChange={(v) => updateProp('borderRadiusTR', v)}
                        min={0}
                    />
                </div>
                <div className={styles.fieldRow}>
                    <NumberField
                        label="BL"
                        value={selectedWidget.props?.borderRadiusBL}
                        onChange={(v) => updateProp('borderRadiusBL', v)}
                        min={0}
                    />
                    <NumberField
                        label="BR"
                        value={selectedWidget.props?.borderRadiusBR}
                        onChange={(v) => updateProp('borderRadiusBR', v)}
                        min={0}
                    />
                </div>
                <div className={styles.fieldRow}>
                    <NumberField
                        label="Width"
                        value={selectedWidget.props?.borderWidth ?? 1}
                        onChange={(v) => updateProp('borderWidth', v)}
                        min={0}
                        max={20}
                    />
                </div>
                <ColorField
                    label="Border Color"
                    value={selectedWidget.props?.borderColor}
                    onChange={(v) => updateProp('borderColor', v)}
                />
                <SliderField
                    label="Border Alpha"
                    value={selectedWidget.props?.borderAlpha}
                    onChange={(v) => updateProp('borderAlpha', v)}
                />
            </Section>

            <Section title="Effects" icon={Settings} id="effects">
                <SliderField
                    label="Blur"
                    value={selectedWidget.props?.blurAmount || 0}
                    onChange={(v) => updateProp('blurAmount', v)}
                    min={0}
                    max={50}
                    step={1}
                />
            </Section>
        </>
    );

    // === TEXT PROPERTIES ===
    const renderTextProperties = () => (
        <>
            <Section title="Text Content" icon={Edit3} id="text-content">
                <TextField
                    label="Text"
                    value={selectedWidget.props?.text}
                    onChange={(v) => updateProp('text', v)}
                    placeholder="Enter text..."
                />
            </Section>

            <Section title="Typography" icon={Type} id="typography">
                <div className={styles.fieldRow}>
                    <NumberField
                        label="Size"
                        value={selectedWidget.props?.fontSize}
                        onChange={(v) => updateProp('fontSize', v)}
                        min={8}
                        max={200}
                    />
                    <SelectField
                        label="Weight"
                        value={selectedWidget.props?.fontWeight}
                        options={[
                            { value: 'normal', label: 'Normal' },
                            { value: 'bold', label: 'Bold' },
                            { value: '300', label: 'Light' },
                            { value: '500', label: 'Medium' },
                            { value: '600', label: 'Semi Bold' },
                        ]}
                        onChange={(v) => updateProp('fontWeight', v)}
                    />
                </div>
                <SelectField
                    label="Font Family"
                    value={selectedWidget.props?.fontFamily || 'Inter, system-ui, sans-serif'}
                    options={[
                        { value: 'Inter, system-ui, sans-serif', label: 'Default (Sans)' },
                        { value: 'Times New Roman, serif', label: 'Serif' },
                        { value: 'Courier New, monospace', label: 'Monospace' },
                        { value: 'Brush Script MT, cursive', label: 'Cursive' },
                        { value: 'Impact, sans-serif', label: 'Impact' },
                    ]}
                    onChange={(v) => updateProp('fontFamily', v)}
                />
                <ColorField
                    label="Color"
                    value={selectedWidget.props?.color}
                    onChange={(v) => updateProp('color', v)}
                />
                <div className={styles.alignButtons}>
                    <label>Align</label>
                    <div className={styles.buttonGroup}>
                        <button
                            className={selectedWidget.props?.textAlign === 'left' ? styles.active : ''}
                            onClick={() => updateProp('textAlign', 'left')}
                        >
                            <AlignLeft size={14} />
                        </button>
                        <button
                            className={selectedWidget.props?.textAlign === 'center' ? styles.active : ''}
                            onClick={() => updateProp('textAlign', 'center')}
                        >
                            <AlignCenter size={14} />
                        </button>
                        <button
                            className={selectedWidget.props?.textAlign === 'right' ? styles.active : ''}
                            onClick={() => updateProp('textAlign', 'right')}
                        >
                            <AlignRight size={14} />
                        </button>
                    </div>
                </div>
            </Section>
        </>
    );

    // === IMAGE PROPERTIES ===
    const renderImageProperties = () => (
        <Section title="Image" icon={ImageIcon} id="image">
            <TextField
                label="Source URL"
                value={selectedWidget.props?.src}
                onChange={(v) => updateProp('src', v)}
                placeholder="https://..."
            />
            <SelectField
                label="Fit"
                value={selectedWidget.props?.fit}
                options={[
                    { value: 'cover', label: 'Cover' },
                    { value: 'contain', label: 'Contain' },
                    { value: 'fill', label: 'Fill' },
                    { value: 'none', label: 'None' },
                ]}
                onChange={(v) => updateProp('fit', v)}
            />
            <SliderField
                label="Opacity"
                value={selectedWidget.props?.opacity}
                onChange={(v) => updateProp('opacity', v)}
            />
            <NumberField
                label="Border Radius"
                value={selectedWidget.props?.borderRadius}
                onChange={(v) => updateProp('borderRadius', v)}
                min={0}
            />
        </Section>
    );

    // === SCROLL VIEW PROPERTIES ===
    const renderScrollViewProperties = () => (
        <Section title="Scroll View" icon={ScrollText} id="scrollView">
            <SelectField
                label="Direção"
                value={selectedWidget.props?.scrollDirection || 'vertical'}
                options={[
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'horizontal', label: 'Horizontal' },
                    { value: 'both', label: 'Ambos' },
                ]}
                onChange={(v) => updateProp('scrollDirection', v)}
            />
            <div className={styles.checkboxField}>
                <input
                    type="checkbox"
                    checked={selectedWidget.props?.showScrollbar ?? true}
                    onChange={(e) => updateProp('showScrollbar', e.target.checked)}
                />
                <label>Mostrar Barra de Rolagem</label>
            </div>
            {(selectedWidget.props?.showScrollbar ?? true) && (
                <>
                    <ColorField
                        label="Cor da Barra"
                        value={selectedWidget.props?.scrollbarColor || '#ffffff'}
                        onChange={(v) => updateProp('scrollbarColor', v)}
                    />
                    <SliderField
                        label="Opacidade da Barra"
                        value={selectedWidget.props?.scrollbarAlpha ?? 0.3}
                        onChange={(v) => updateProp('scrollbarAlpha', v)}
                    />
                </>
            )}
        </Section>
    );

    // === ATTRIBUTE DISPLAY PROPERTIES (Widget RPG) ===
    const renderAttributeDisplayProperties = () => {
        const selectedField = getFieldData(selectedWidget.props?.fieldId);
        const modifierField = getFieldData(selectedWidget.props?.modifierFieldId);
        const displayValue = selectedField?.default ?? 10;
        const displayModifier = modifierField?.default ?? null;

        return (
            <>
                <Section title="Dados" icon={Gauge} id="attribute-data">
                    <SelectField
                        label="Field (Valor)"
                        value={selectedWidget.props?.fieldId || ''}
                        options={getFieldOptions('numeric')}
                        onChange={(v) => updateProp('fieldId', v)}
                    />
                    <SelectField
                        label="Field (Modificador)"
                        value={selectedWidget.props?.modifierFieldId || ''}
                        options={getFieldOptions('numeric')}
                        onChange={(v) => updateProp('modifierFieldId', v)}
                    />
                </Section>
                <Section title="Visual" icon={Eye} id="attribute-visual">
                    <SelectField
                        label="Layout"
                        value={selectedWidget.props?.layout || 'card'}
                        options={[
                            { value: 'card', label: 'Card' },
                            { value: 'circle', label: 'Círculo' },
                            { value: 'compact', label: 'Compacto' },
                        ]}
                        onChange={(v) => updateProp('layout', v)}
                    />
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.showModifier ?? true}
                            onChange={(e) => updateProp('showModifier', e.target.checked)}
                        />
                        <label>Exibir Modificador</label>
                    </div>
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.showLabel ?? true}
                            onChange={(e) => updateProp('showLabel', e.target.checked)}
                        />
                        <label>Exibir Label</label>
                    </div>
                    <ColorField
                        label="Cor de Destaque"
                        value={selectedWidget.props?.accentColor || '#8b5cf6'}
                        onChange={(v) => updateProp('accentColor', v)}
                    />
                </Section>
                {selectedField && (
                    <Section title="Preview" icon={Eye} id="attribute-preview">
                        <div className={styles.fieldPreview}>
                            <span className={styles.previewLabel}>Campo:</span>
                            <span>{selectedField.name || selectedField.id}</span>
                        </div>
                        <div className={styles.fieldPreview}>
                            <span className={styles.previewLabel}>Valor:</span>
                            <span>{displayValue}</span>
                        </div>
                        {modifierField && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Modificador:</span>
                                <span>{displayModifier !== null ? (displayModifier >= 0 ? `+${displayModifier}` : displayModifier) : '-'}</span>
                            </div>
                        )}
                    </Section>
                )}
            </>
        );
    };

    // === SKILL DISPLAY PROPERTIES (Widget RPG) ===
    const renderSkillDisplayProperties = () => {
        const selectedField = getFieldData(selectedWidget.props?.fieldId);
        const bonusField = getFieldData(selectedWidget.props?.bonusFieldId);
        const proficiencyField = getFieldData(selectedWidget.props?.proficiencyFieldId);
        const rollEvent = getEventData(selectedWidget.props?.rollEventId);

        return (
            <>
                <Section title="Dados" icon={Target} id="skill-data">
                    <SelectField
                        label="Field (Nome)"
                        value={selectedWidget.props?.fieldId || ''}
                        options={getFieldOptions()}
                        onChange={(v) => updateProp('fieldId', v)}
                    />
                    <SelectField
                        label="Field (Bônus)"
                        value={selectedWidget.props?.bonusFieldId || ''}
                        options={getFieldOptions('numeric')}
                        onChange={(v) => updateProp('bonusFieldId', v)}
                    />
                    <SelectField
                        label="Field (Proficiência)"
                        value={selectedWidget.props?.proficiencyFieldId || ''}
                        options={getFieldOptions('boolean')}
                        onChange={(v) => updateProp('proficiencyFieldId', v)}
                    />
                </Section>
                <Section title="Interação" icon={Dices} id="skill-interaction">
                    <SelectField
                        label="Evento (Rolagem)"
                        value={selectedWidget.props?.rollEventId || ''}
                        options={getEventOptions()}
                        onChange={(v) => updateProp('rollEventId', v)}
                    />
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.clickToRoll ?? true}
                            onChange={(e) => updateProp('clickToRoll', e.target.checked)}
                        />
                        <label>Clicar para Rolar</label>
                    </div>
                </Section>
                <Section title="Visual" icon={Eye} id="skill-visual">
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.showProficiency ?? true}
                            onChange={(e) => updateProp('showProficiency', e.target.checked)}
                        />
                        <label>Exibir Proficiência (●/○)</label>
                    </div>
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.showBonus ?? true}
                            onChange={(e) => updateProp('showBonus', e.target.checked)}
                        />
                        <label>Exibir Bônus</label>
                    </div>
                    <ColorField
                        label="Cor de Destaque"
                        value={selectedWidget.props?.accentColor || '#22c55e'}
                        onChange={(v) => updateProp('accentColor', v)}
                    />
                </Section>
                {(selectedField || bonusField || proficiencyField || rollEvent) && (
                    <Section title="Preview" icon={Eye} id="skill-preview">
                        {selectedField && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Perícia:</span>
                                <span>{selectedField.name || selectedField.id}</span>
                            </div>
                        )}
                        {bonusField && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Bônus:</span>
                                <span>{bonusField.default !== undefined ? (bonusField.default >= 0 ? `+${bonusField.default}` : bonusField.default) : '-'}</span>
                            </div>
                        )}
                        {proficiencyField && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Proficiência:</span>
                                <span>{proficiencyField.name || proficiencyField.id}</span>
                            </div>
                        )}
                        {rollEvent && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Evento:</span>
                                <span>{rollEvent.name || rollEvent.id}</span>
                            </div>
                        )}
                    </Section>
                )}
            </>
        );
    };

    // === RESOURCE BAR PROPERTIES (Widget RPG) ===
    const renderResourceBarProperties = () => {
        const currentField = getFieldData(selectedWidget.props?.currentFieldId);
        const maxField = getFieldData(selectedWidget.props?.maxFieldId);
        const hasSystemConnection = currentField || maxField;

        return (
            <>
                <Section title="Conexão com Sistema" icon={Link} id="resource-connection">
                    <SelectField
                        label="Field Atual"
                        value={selectedWidget.props?.currentFieldId || ''}
                        options={getFieldOptions('numeric')}
                        onChange={(v) => updateProp('currentFieldId', v)}
                    />
                    <SelectField
                        label="Field Máximo"
                        value={selectedWidget.props?.maxFieldId || ''}
                        options={getFieldOptions('numeric')}
                        onChange={(v) => updateProp('maxFieldId', v)}
                    />
                </Section>
                <Section title="Visual" icon={Heart} id="resource-visual">
                    <SelectField
                        label="Estilo da Barra"
                        value={selectedWidget.props?.barStyle || 'smooth'}
                        options={[
                            { value: 'smooth', label: 'Suave' },
                            { value: 'segmented', label: 'Segmentada' },
                            { value: 'hearts', label: 'Corações' },
                        ]}
                        onChange={(v) => updateProp('barStyle', v)}
                    />
                    <ColorField
                        label="Cor da Barra"
                        value={selectedWidget.props?.barColor || '#ef4444'}
                        onChange={(v) => updateProp('barColor', v)}
                    />
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.showNumbers ?? true}
                            onChange={(e) => updateProp('showNumbers', e.target.checked)}
                        />
                        <label>Exibir Números (45/60)</label>
                    </div>
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.showLabel ?? true}
                            onChange={(e) => updateProp('showLabel', e.target.checked)}
                        />
                        <label>Exibir Label</label>
                    </div>
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.editable ?? true}
                            onChange={(e) => updateProp('editable', e.target.checked)}
                        />
                        <label>Editável</label>
                    </div>
                </Section>
                {!hasSystemConnection && (
                    <Section title="Preview (Mock)" icon={Eye} id="resource-mock">
                        <NumberField
                            label="Valor Atual"
                            value={selectedWidget.props?.mockCurrent ?? 45}
                            onChange={(v) => updateProp('mockCurrent', v)}
                        />
                        <NumberField
                            label="Valor Máximo"
                            value={selectedWidget.props?.mockMax ?? 60}
                            onChange={(v) => updateProp('mockMax', v)}
                        />
                        <TextField
                            label="Label Mock"
                            value={selectedWidget.props?.mockLabel || 'Pontos de Vida'}
                            onChange={(v) => updateProp('mockLabel', v)}
                        />
                    </Section>
                )}
                {hasSystemConnection && (
                    <Section title="Preview do Sistema" icon={Eye} id="resource-preview">
                        {currentField && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Valor Atual:</span>
                                <span>{currentField.name} ({currentField.defaultValue ?? 0})</span>
                            </div>
                        )}
                        {maxField && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Valor Máximo:</span>
                                <span>{maxField.name} ({maxField.defaultValue ?? 0})</span>
                            </div>
                        )}
                    </Section>
                )}
            </>
        );
    };

    // === DICE BUTTON PROPERTIES (Widget RPG) ===
    const renderDiceButtonProperties = () => {
        const selectedEvent = getEventData(selectedWidget.props?.eventId);
        const hasEventConnection = !!selectedEvent;

        return (
            <>
                <Section title="Conexão com Sistema" icon={Link} id="dice-connection">
                    <SelectField
                        label="Evento de Rolagem"
                        value={selectedWidget.props?.eventId || ''}
                        options={getEventOptions()}
                        onChange={(v) => updateProp('eventId', v)}
                    />
                </Section>
                {!hasEventConnection && (
                    <Section title="Fórmula Manual" icon={Dices} id="dice-formula">
                        <TextField
                            label="Fórmula"
                            value={selectedWidget.props?.formula || '1d20'}
                            onChange={(v) => updateProp('formula', v)}
                            placeholder="ex: 1d20+5, 2d6"
                        />
                    </Section>
                )}
                <Section title="Aparência" icon={Palette} id="dice-appearance">
                    <TextField
                        label="Texto do Botão"
                        value={selectedWidget.props?.label || 'Rolar'}
                        onChange={(v) => updateProp('label', v)}
                    />
                    <TextField
                        label="Ícone (Emoji)"
                        value={selectedWidget.props?.icon || '🎲'}
                        onChange={(v) => updateProp('icon', v)}
                    />
                    <SelectField
                        label="Tipo de Rolagem"
                        value={selectedWidget.props?.rollType || 'normal'}
                        options={[
                            { value: 'normal', label: 'Normal' },
                            { value: 'advantage', label: 'Vantagem' },
                            { value: 'disadvantage', label: 'Desvantagem' },
                        ]}
                        onChange={(v) => updateProp('rollType', v)}
                    />
                    <ColorField
                        label="Cor de Destaque"
                        value={selectedWidget.props?.accentColor || '#f59e0b'}
                        onChange={(v) => updateProp('accentColor', v)}
                    />
                    <div className={styles.checkboxField}>
                        <input
                            type="checkbox"
                            checked={selectedWidget.props?.showFormula ?? true}
                            onChange={(e) => updateProp('showFormula', e.target.checked)}
                        />
                        <label>Mostrar Fórmula/Evento</label>
                    </div>
                </Section>
                {hasEventConnection && (
                    <Section title="Preview do Sistema" icon={Eye} id="dice-preview">
                        <div className={styles.fieldPreview}>
                            <span className={styles.previewLabel}>Evento:</span>
                            <span>{selectedEvent.name || selectedEvent.id}</span>
                        </div>
                        {selectedEvent.description && (
                            <div className={styles.fieldPreview}>
                                <span className={styles.previewLabel}>Descrição:</span>
                                <span>{selectedEvent.description}</span>
                            </div>
                        )}
                    </Section>
                )}
            </>
        );
    };

    // === RENDER COMPONENTS ===
    const renderComponents = () => {
        const components = selectedWidget?.components || [];
        if (components.length === 0) return null;

        return components.map(comp => {
            const compType = COMPONENT_TYPES[comp.type];
            if (!compType) return null;

            if (comp.type === 'layoutGroup') {
                return (
                    <div key={comp.type} className={styles.componentSection}>
                        <div className={styles.componentHeader}>
                            <LayoutGrid size={14} className={styles.componentIcon} />
                            <span>{compType.label}</span>
                            <button
                                className={styles.removeComponentBtn}
                                onClick={() => removeComponent(comp.type)}
                                title="Remover Componente"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                        <div className={styles.componentBody}>
                            {/* Direction Toggle */}
                            <div className={styles.field}>
                                <label>Direção</label>
                                <div className={styles.toggleGroup}>
                                    <button
                                        className={`${styles.toggleBtn} ${comp.config.direction === 'horizontal' ? styles.active : ''}`}
                                        onClick={() => updateComponent('layoutGroup', 'direction', 'horizontal')}
                                    >
                                        <ArrowRight size={14} /> Horizontal
                                    </button>
                                    <button
                                        className={`${styles.toggleBtn} ${comp.config.direction === 'vertical' ? styles.active : ''}`}
                                        onClick={() => updateComponent('layoutGroup', 'direction', 'vertical')}
                                    >
                                        <ArrowDown size={14} /> Vertical
                                    </button>
                                </div>
                            </div>

                            {/* Spacing */}
                            <NumberField
                                label="Espaçamento"
                                value={comp.config.spacing}
                                onChange={(v) => updateComponent('layoutGroup', 'spacing', v)}
                                min={0}
                            />

                            {/* Alignment */}
                            <SelectField
                                label="Alinhar Itens"
                                value={comp.config.alignItems}
                                options={[
                                    { value: 'start', label: 'Início' },
                                    { value: 'center', label: 'Centro' },
                                    { value: 'end', label: 'Fim' },
                                    { value: 'stretch', label: 'Esticar' },
                                ]}
                                onChange={(v) => updateComponent('layoutGroup', 'alignItems', v)}
                            />

                            <SelectField
                                label="Distribuir Conteúdo"
                                value={comp.config.justifyContent}
                                options={[
                                    { value: 'start', label: 'Início' },
                                    { value: 'center', label: 'Centro' },
                                    { value: 'end', label: 'Fim' },
                                    { value: 'space-between', label: 'Espaço Entre' },
                                    { value: 'space-around', label: 'Espaço Ao Redor' },
                                ]}
                                onChange={(v) => updateComponent('layoutGroup', 'justifyContent', v)}
                            />

                            {/* Padding */}
                            <div className={styles.fieldRow}>
                                <NumberField
                                    label="Pad Superior"
                                    value={comp.config.paddingTop}
                                    onChange={(v) => updateComponent('layoutGroup', 'paddingTop', v)}
                                    min={0}
                                />
                                <NumberField
                                    label="Pad Direita"
                                    value={comp.config.paddingRight}
                                    onChange={(v) => updateComponent('layoutGroup', 'paddingRight', v)}
                                    min={0}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <NumberField
                                    label="Pad Inferior"
                                    value={comp.config.paddingBottom}
                                    onChange={(v) => updateComponent('layoutGroup', 'paddingBottom', v)}
                                    min={0}
                                />
                                <NumberField
                                    label="Pad Esquerda"
                                    value={comp.config.paddingLeft}
                                    onChange={(v) => updateComponent('layoutGroup', 'paddingLeft', v)}
                                    min={0}
                                />
                            </div>

                            {/* Options */}
                            <div className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={comp.config.childControlWidth}
                                    onChange={(e) => updateComponent('layoutGroup', 'childControlWidth', e.target.checked)}
                                />
                                <label>Controlar Largura dos Filhos</label>
                            </div>
                            <div className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={comp.config.childControlHeight}
                                    onChange={(e) => updateComponent('layoutGroup', 'childControlHeight', e.target.checked)}
                                />
                                <label>Controlar Altura dos Filhos</label>
                            </div>
                        </div>
                    </div>
                );
            }

            return null;
        });
    };

    return (
        <div className={styles.inspector} style={style}>
            {/* Header */}
            <div className={styles.header}>
                <span>Inspector</span>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {selectedWidget ? (
                    <>
                        {renderWidgetHeader()}
                        {renderTransformSection()}

                        {selectedWidget.type === 'panel' && renderPanelProperties()}
                        {selectedWidget.type === 'scrollView' && renderScrollViewProperties()}
                        {selectedWidget.type === 'text' && renderTextProperties()}
                        {selectedWidget.type === 'image' && renderImageProperties()}

                        {/* Widgets RPG */}
                        {selectedWidget.type === 'attributeDisplay' && renderAttributeDisplayProperties()}
                        {selectedWidget.type === 'skillDisplay' && renderSkillDisplayProperties()}
                        {selectedWidget.type === 'resourceBar' && renderResourceBarProperties()}
                        {selectedWidget.type === 'diceButton' && renderDiceButtonProperties()}

                        {/* Seção de Componentes */}
                        {renderComponents()}

                        {/* Botão Adicionar Componente */}
                        <div className={styles.addComponentWrapper}>
                            <button
                                className={styles.addComponentBtn}
                                onClick={() => setShowComponentMenu(!showComponentMenu)}
                            >
                                <Plus size={14} /> Adicionar Componente
                            </button>

                            {showComponentMenu && (
                                <div className={styles.componentMenu}>
                                    {Object.values(COMPONENT_TYPES).map(comp => {
                                        const IconComp = comp.icon;
                                        const hasComponent = selectedWidget.components?.some(c => c.type === comp.id);
                                        return (
                                            <button
                                                key={comp.id}
                                                className={`${styles.componentMenuItem} ${hasComponent ? styles.disabled : ''}`}
                                                onClick={() => !hasComponent && addComponent(comp.id)}
                                                disabled={hasComponent}
                                            >
                                                <IconComp size={16} />
                                                <div className={styles.componentMenuInfo}>
                                                    <span>{comp.label}</span>
                                                    <small>{comp.description}</small>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                ) : selectedWidgetCount > 1 ? (
                    <div className={styles.empty}>
                        <Layers size={32} />
                        <span>{selectedWidgetCount} widgets selected</span>
                        <p>Select a single widget to edit properties</p>
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <MousePointer size={32} />
                        <span>No Selection</span>
                        <p>Select a widget to view properties</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InspectorPanel;
