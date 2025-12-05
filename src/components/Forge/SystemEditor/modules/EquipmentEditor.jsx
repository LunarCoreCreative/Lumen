import React, { useState, useMemo } from 'react';
import styles from './EquipmentEditor.module.css';
import { Package, Plus, Edit, Trash2, Settings, X, ChevronDown, ChevronRight, Sword, Coins, Zap, ArrowUpDown } from 'lucide-react';
import { ConfirmDialog } from '../../../ConfirmDialog/ConfirmDialog';

// Categorias padrão
const DEFAULT_CATEGORIES = [
    { id: 'weapons', name: 'Armas', icon: '⚔️', color: '#ef4444' },
    { id: 'armor', name: 'Armaduras', icon: '🛡️', color: '#3b82f6' },
    { id: 'items', name: 'Itens', icon: '🎒', color: '#22c55e' },
    { id: 'materials', name: 'Materiais', icon: '💎', color: '#a855f7' }
];

// Propriedades de armas
const WEAPON_PROPERTIES = [
    { id: 'light', name: 'Leve' },
    { id: 'heavy', name: 'Pesada' },
    { id: 'finesse', name: 'Acuidade' },
    { id: 'versatile', name: 'Versátil' },
    { id: 'two-handed', name: 'Duas Mãos' },
    { id: 'reach', name: 'Alcance' },
    { id: 'thrown', name: 'Arremesso' },
    { id: 'ranged', name: 'Distância' },
    { id: 'ammunition', name: 'Munição' }
];

// Tipos de dano
const DAMAGE_TYPES = [
    { id: 'slashing', name: 'Cortante', icon: '🗡️' },
    { id: 'piercing', name: 'Perfurante', icon: '🏹' },
    { id: 'bludgeoning', name: 'Contundente', icon: '🔨' },
    { id: 'fire', name: 'Fogo', icon: '🔥' },
    { id: 'cold', name: 'Gelo', icon: '❄️' },
    { id: 'lightning', name: 'Elétrico', icon: '⚡' },
    { id: 'poison', name: 'Veneno', icon: '☠️' },
    { id: 'necrotic', name: 'Necrótico', icon: '💀' },
    { id: 'radiant', name: 'Radiante', icon: '✨' },
    { id: 'psychic', name: 'Psíquico', icon: '🧠' }
];

// Tipos de efeito de item
const EFFECT_TYPES = [
    { id: 'attribute_bonus', name: 'Bônus de Atributo', icon: '💪', description: 'Modifica um atributo' },
    { id: 'skill_bonus', name: 'Bônus de Perícia', icon: '🎯', description: 'Modifica uma perícia' },
    { id: 'defense', name: 'Defesa', icon: '🛡️', description: 'Modifica CA/Defesa' },
    { id: 'resistance', name: 'Resistência', icon: '🔰', description: 'Resistência a dano' },
    { id: 'speed', name: 'Velocidade', icon: '👟', description: 'Modifica movimento' },
    { id: 'damage_bonus', name: 'Dano Extra', icon: '⚔️', description: 'Adiciona dano' }
];

// Ícones de moedas disponíveis
const CURRENCY_ICONS = ['🥇', '🥈', '🥉', '💎', '💰', '🪙', '💵', '💴', '💶', '💷'];

// Valores padrão
const DEFAULT_CURRENCY = [
    { id: 'gold', name: 'Ouro', symbol: 'PO', icon: '🥇', conversionRate: 1, weight: 0.02 },
    { id: 'silver', name: 'Prata', symbol: 'PP', icon: '🥈', conversionRate: 10, weight: 0.02 },
    { id: 'copper', name: 'Cobre', symbol: 'PC', icon: '🥉', conversionRate: 100, weight: 0.02 }
];

const DEFAULT_INVENTORY_RULES = {
    capacityFormula: '',
    encumbrance: false,
    currency: DEFAULT_CURRENCY
};

export function EquipmentEditor({ data = {}, onChange, attributes = [], dice = {} }) {
    const [activeTab, setActiveTab] = useState('items');
    const [editingItem, setEditingItem] = useState(null);
    const [editingCurrency, setEditingCurrency] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [expandedCategories, setExpandedCategories] = useState({
        weapons: true,
        armor: true,
        items: true,
        materials: true
    });

    // Dados normalizados com fallbacks seguros
    const equipmentData = useMemo(() => ({
        categories: data?.categories?.length > 0 ? data.categories : DEFAULT_CATEGORIES,
        items: Array.isArray(data?.items) ? data.items : [],
        inventoryRules: {
            ...DEFAULT_INVENTORY_RULES,
            currency: data?.inventoryRules?.currency?.length > 0
                ? data.inventoryRules.currency
                : DEFAULT_CURRENCY,
            ...(data?.inventoryRules || {})
        }
    }), [data]);

    // Atributos disponíveis para fórmulas
    const availableAttributes = useMemo(() =>
        (attributes || []).map(attr => ({
            id: attr.id,
            shortName: attr.shortName || attr.name?.substring(0, 3).toUpperCase() || 'ATR',
            name: attr.name || 'Atributo'
        }))
        , [attributes]);

    // Dados disponíveis do sistema
    const availableDice = dice?.available || ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

    // Atualizar dados de forma segura
    const updateData = (updates) => {
        const newData = {
            categories: equipmentData.categories,
            items: equipmentData.items,
            inventoryRules: equipmentData.inventoryRules,
            ...updates
        };
        onChange(newData);
    };

    // Atualizar regras de inventário
    const updateInventoryRules = (ruleUpdates) => {
        updateData({
            inventoryRules: {
                ...equipmentData.inventoryRules,
                ...ruleUpdates
            }
        });
    };

    // === FUNÇÕES DE ITEM ===
    const handleAddItem = (category) => {
        const baseItem = {
            id: `item-${Date.now()}`,
            name: 'Novo Item',
            category,
            description: '',
            weight: 0,
            price: 0,
            effects: [] // Efeitos mecânicos
        };

        let newItem = { ...baseItem };

        if (category === 'weapons') {
            newItem = {
                ...baseItem,
                damage: '1d6',
                damageType: 'slashing',
                properties: [],
                range: '',
                requirements: {},
                bonuses: { toHit: '', toDamage: '' }
            };
        } else if (category === 'armor') {
            newItem = {
                ...baseItem,
                armorClass: 10,
                armorType: 'light',
                stealthDisadvantage: false,
                requirements: {}
            };
        }

        updateData({ items: [...equipmentData.items, newItem] });
        setEditingItem(newItem);
    };

    const handleDeleteItem = (itemId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Deletar Item',
            message: 'Tem certeza que deseja deletar este item?',
            onConfirm: () => {
                updateData({ items: equipmentData.items.filter(i => i.id !== itemId) });
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    const handleUpdateItem = (itemId, updates) => {
        updateData({
            items: equipmentData.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
        });
    };

    // === FUNÇÕES DE MOEDA ===
    const handleAddCurrency = () => {
        const newCurrency = {
            id: `currency-${Date.now()}`,
            name: 'Nova Moeda',
            symbol: 'NM',
            icon: '🪙',
            conversionRate: 1,
            weight: 0.02
        };
        const currencies = [...(equipmentData.inventoryRules.currency || []), newCurrency];
        updateInventoryRules({ currency: currencies });
        setEditingCurrency(newCurrency);
    };

    const handleUpdateCurrency = (currencyId, updates) => {
        const currencies = equipmentData.inventoryRules.currency.map(c =>
            c.id === currencyId ? { ...c, ...updates } : c
        );
        updateInventoryRules({ currency: currencies });
    };

    const handleDeleteCurrency = (currencyId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Deletar Moeda',
            message: 'Tem certeza que deseja deletar esta moeda?',
            onConfirm: () => {
                const currencies = equipmentData.inventoryRules.currency.filter(c => c.id !== currencyId);
                updateInventoryRules({ currency: currencies });
                setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
            }
        });
    };

    // Toggle categoria
    const toggleCategory = (catId) => {
        setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const getItemsByCategory = (catId) => equipmentData.items.filter(i => i.category === catId);

    // Moedas ordenadas por valor
    const currencies = useMemo(() => {
        return [...(equipmentData.inventoryRules.currency || [])].sort((a, b) => a.conversionRate - b.conversionRate);
    }, [equipmentData.inventoryRules.currency]);

    // Moeda base (menor taxa)
    const baseCurrency = currencies[0];

    return (
        <div className={styles.equipmentEditor}>
            {/* Header */}
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <Package size={32} />
                </div>
                <div>
                    <h2 className={styles.moduleTitle}>Extras</h2>
                    <p className={styles.moduleSubtitle}>Equipamentos, moedas e regras de inventário</p>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'items' ? styles.active : ''}`}
                    onClick={() => setActiveTab('items')}
                >
                    <Sword size={18} />
                    Equipamentos
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'currency' ? styles.active : ''}`}
                    onClick={() => setActiveTab('currency')}
                >
                    <Coins size={18} />
                    Moedas
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'rules' ? styles.active : ''}`}
                    onClick={() => setActiveTab('rules')}
                >
                    <Settings size={18} />
                    Regras
                </button>
            </div>

            {/* Tab: Equipamentos */}
            {activeTab === 'items' && (
                <div className={styles.tabContent}>
                    {availableAttributes.length === 0 && (
                        <div className={styles.warningBox}>
                            ⚠️ Crie atributos primeiro para definir efeitos mecânicos nos equipamentos.
                        </div>
                    )}

                    {equipmentData.categories.map(category => (
                        <div key={category.id} className={styles.categorySection}>
                            <div
                                className={styles.categoryHeader}
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className={styles.categoryIcon} style={{ background: `${category.color}20`, color: category.color }}>
                                    {category.icon}
                                </div>
                                <div className={styles.categoryInfo}>
                                    <h3>{category.name}</h3>
                                    <span>{getItemsByCategory(category.id).length} itens</span>
                                </div>
                                <button
                                    className={styles.addItemBtn}
                                    onClick={(e) => { e.stopPropagation(); handleAddItem(category.id); }}
                                >
                                    <Plus size={16} />
                                    Novo
                                </button>
                                {expandedCategories[category.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>

                            {expandedCategories[category.id] && (
                                <div className={styles.itemsGrid}>
                                    {getItemsByCategory(category.id).length === 0 ? (
                                        <div className={styles.emptyCategory}>
                                            Nenhum item. Clique em "Novo" para adicionar.
                                        </div>
                                    ) : (
                                        getItemsByCategory(category.id).map(item => (
                                            <div key={item.id} className={styles.itemCard}>
                                                <div className={styles.itemHeader}>
                                                    <span className={styles.itemIcon}>{category.icon}</span>
                                                    <h4>{item.name}</h4>
                                                </div>
                                                <div className={styles.itemStats}>
                                                    {item.damage && (
                                                        <span className={styles.itemStat}>🎲 {item.damage}</span>
                                                    )}
                                                    {item.armorClass && (
                                                        <span className={styles.itemStat}>🛡️ CA {item.armorClass}</span>
                                                    )}
                                                    {(item.effects?.length || 0) > 0 && (
                                                        <span className={styles.itemStat}>⚡ {item.effects.length} efeitos</span>
                                                    )}
                                                    {item.price > 0 && (
                                                        <span className={styles.itemStat}>💰 {item.price}</span>
                                                    )}
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <button onClick={() => setEditingItem(item)}>
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteItem(item.id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Tab: Moedas */}
            {activeTab === 'currency' && (
                <div className={styles.tabContent}>
                    <div className={styles.infoBox}>
                        <Coins size={20} />
                        <div>
                            <strong>Sistema de Conversão:</strong> Defina as moedas do sistema. A moeda com menor taxa de conversão (1) é a base.
                        </div>
                    </div>

                    <div className={styles.currencyGrid}>
                        {currencies.map((currency, index) => (
                            <div key={currency.id} className={styles.currencyCard}>
                                <div className={styles.currencyCardHeader}>
                                    <div className={styles.currencyMainIcon}>{currency.icon}</div>
                                    <div className={styles.currencyCardInfo}>
                                        <h4>{currency.name}</h4>
                                        <span className={styles.currencySymbol}>{currency.symbol}</span>
                                    </div>
                                    <div className={styles.currencyCardActions}>
                                        <button onClick={() => setEditingCurrency(currency)}>
                                            <Edit size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteCurrency(currency.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.currencyStats}>
                                    <div className={styles.currencyStat}>
                                        <ArrowUpDown size={14} />
                                        <span>
                                            {currency.conversionRate === 1
                                                ? '(Base)'
                                                : `${currency.conversionRate} = 1 ${baseCurrency?.symbol || 'Base'}`}
                                        </span>
                                    </div>
                                    <div className={styles.currencyStat}>
                                        <Package size={14} />
                                        <span>{currency.weight} por unidade</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className={styles.addCurrencyBtn} onClick={handleAddCurrency}>
                        <Plus size={18} />
                        Adicionar Moeda
                    </button>

                    {/* Preview de conversão */}
                    {currencies.length > 1 && (
                        <div className={styles.conversionPreview}>
                            <h4>📊 Tabela de Conversão</h4>
                            <div className={styles.conversionTable}>
                                {currencies.slice(1).map(curr => (
                                    <div key={curr.id} className={styles.conversionRow}>
                                        <span>{curr.conversionRate} {curr.symbol}</span>
                                        <span>=</span>
                                        <span>1 {baseCurrency?.symbol}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Regras */}
            {activeTab === 'rules' && (
                <div className={styles.tabContent}>
                    <div className={styles.rulesSection}>
                        <h3>⚖️ Capacidade de Carga</h3>
                        <p className={styles.ruleHelp}>
                            Fórmula para capacidade máxima. Use {'{ATRIBUTO}'} para referências.
                        </p>

                        <div className={styles.formGroup}>
                            <label>Fórmula de Capacidade</label>
                            <div className={styles.formulaInput}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Ex: {FOR} * 15"
                                    value={equipmentData.inventoryRules.capacityFormula || ''}
                                    onChange={(e) => updateInventoryRules({ capacityFormula: e.target.value })}
                                />
                                {availableAttributes.length > 0 && (
                                    <div className={styles.formulaHints}>
                                        {availableAttributes.map(attr => (
                                            <button
                                                key={attr.id}
                                                className={styles.hintBtn}
                                                onClick={() => updateInventoryRules({
                                                    capacityFormula: (equipmentData.inventoryRules.capacityFormula || '') + `{${attr.shortName}}`
                                                })}
                                            >
                                                {attr.shortName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={equipmentData.inventoryRules.encumbrance || false}
                                    onChange={(e) => updateInventoryRules({ encumbrance: e.target.checked })}
                                />
                                Usar sistema de Sobrecarga
                            </label>
                            <p className={styles.ruleHelp}>
                                Aplica penalidades quando ultrapassar capacidade
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Item */}
            {editingItem && (
                <ItemEditorModal
                    item={editingItem}
                    category={equipmentData.categories.find(c => c.id === editingItem.category)}
                    attributes={availableAttributes}
                    dice={availableDice}
                    onSave={(updates) => {
                        handleUpdateItem(editingItem.id, updates);
                        setEditingItem(null);
                    }}
                    onClose={() => setEditingItem(null)}
                />
            )}

            {/* Modal de Edição de Moeda */}
            {editingCurrency && (
                <CurrencyEditorModal
                    currency={editingCurrency}
                    onSave={(updates) => {
                        handleUpdateCurrency(editingCurrency.id, updates);
                        setEditingCurrency(null);
                    }}
                    onClose={() => setEditingCurrency(null)}
                />
            )}

            {/* Diálogo de Confirmação */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
            />
        </div>
    );
}

// Modal de edição de moeda
function CurrencyEditorModal({ currency, onSave, onClose }) {
    const [formData, setFormData] = useState({ ...currency });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>💰 Editar Moeda</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.modalContent}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Nome</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Símbolo</label>
                            <input
                                type="text"
                                className={styles.input}
                                maxLength={3}
                                value={formData.symbol || ''}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ícone</label>
                        <div className={styles.iconPicker}>
                            {CURRENCY_ICONS.map(icon => (
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

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Taxa de Conversão</label>
                            <input
                                type="number"
                                className={styles.input}
                                min="1"
                                value={formData.conversionRate || 1}
                                onChange={(e) => setFormData({ ...formData, conversionRate: parseInt(e.target.value) || 1 })}
                            />
                            <p className={styles.ruleHelp}>
                                1 = moeda base. 10 = precisa 10 para 1 base.
                            </p>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Peso por Unidade</label>
                            <input
                                type="number"
                                className={styles.input}
                                min="0"
                                step="0.01"
                                value={formData.weight || 0}
                                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                            />
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

// Modal de edição de item COM TABS
function ItemEditorModal({ item, category, attributes = [], dice = [], onSave, onClose }) {
    const [formData, setFormData] = useState({ ...item, effects: item.effects || [] });
    const [activeModalTab, setActiveModalTab] = useState('info');

    const isWeapon = category?.id === 'weapons';
    const isArmor = category?.id === 'armor';

    // Adicionar efeito
    const addEffect = () => {
        const newEffect = {
            id: `effect-${Date.now()}`,
            type: 'attribute_bonus',
            target: attributes[0]?.id || '',
            value: '+1',
            condition: 'equipped'
        };
        setFormData({ ...formData, effects: [...formData.effects, newEffect] });
    };

    // Remover efeito
    const removeEffect = (effectId) => {
        setFormData({ ...formData, effects: formData.effects.filter(e => e.id !== effectId) });
    };

    // Atualizar efeito
    const updateEffect = (effectId, updates) => {
        setFormData({
            ...formData,
            effects: formData.effects.map(e => e.id === effectId ? { ...e, ...updates } : e)
        });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{category?.icon} {isWeapon ? 'Arma' : isArmor ? 'Armadura' : 'Item'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                {/* TABS DO MODAL */}
                <div className={styles.modalTabs}>
                    <button
                        className={`${styles.modalTab} ${activeModalTab === 'info' ? styles.activeModalTab : ''}`}
                        onClick={() => setActiveModalTab('info')}
                    >
                        📋 Info
                    </button>
                    {(isWeapon || isArmor) && (
                        <button
                            className={`${styles.modalTab} ${activeModalTab === 'stats' ? styles.activeModalTab : ''}`}
                            onClick={() => setActiveModalTab('stats')}
                        >
                            {isWeapon ? '⚔️ Combate' : '🛡️ Defesa'}
                        </button>
                    )}
                    <button
                        className={`${styles.modalTab} ${activeModalTab === 'effects' ? styles.activeModalTab : ''}`}
                        onClick={() => setActiveModalTab('effects')}
                    >
                        ⚡ Efeitos
                        {formData.effects.length > 0 && (
                            <span className={styles.tabBadge}>{formData.effects.length}</span>
                        )}
                    </button>
                </div>

                <div className={styles.modalContent}>
                    {/* TAB: Info Básica */}
                    {activeModalTab === 'info' && (
                        <>
                            <div className={styles.formGroup}>
                                <label>Nome</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Descrição</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>💰 Preço</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        min="0"
                                        value={formData.price || 0}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>⚖️ Peso</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        min="0"
                                        step="0.1"
                                        value={formData.weight || 0}
                                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className={styles.infoBox}>
                                <Zap size={18} />
                                <span>Use a aba <strong>⚡ Efeitos</strong> para adicionar bônus automáticos quando equipado!</span>
                            </div>
                        </>
                    )}

                    {/* TAB: Combate (Armas) */}
                    {activeModalTab === 'stats' && isWeapon && (
                        <>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>🎲 Dano</label>
                                    <div className={styles.diceSelector}>
                                        <select
                                            className={styles.select}
                                            value={formData.damage?.match(/^\d+/)?.[0] || '1'}
                                            onChange={(e) => {
                                                const diceType = formData.damage?.match(/d\d+/)?.[0] || 'd6';
                                                setFormData({ ...formData, damage: `${e.target.value}${diceType}` });
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                        <select
                                            className={styles.select}
                                            value={formData.damage?.match(/d\d+/)?.[0] || 'd6'}
                                            onChange={(e) => {
                                                const num = formData.damage?.match(/^\d+/)?.[0] || '1';
                                                setFormData({ ...formData, damage: `${num}${e.target.value}` });
                                            }}
                                        >
                                            {dice.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Tipo de Dano</label>
                                    <select
                                        className={styles.select}
                                        value={formData.damageType || 'slashing'}
                                        onChange={(e) => setFormData({ ...formData, damageType: e.target.value })}
                                    >
                                        {DAMAGE_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Propriedades</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '16px',
                                    marginTop: '12px',
                                    padding: '8px'
                                }}>
                                    {WEAPON_PROPERTIES.map(prop => (
                                        <label
                                            key={prop.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px 18px',
                                                background: (formData.properties || []).includes(prop.id)
                                                    ? 'rgba(245, 158, 11, 0.15)'
                                                    : 'rgba(255, 255, 255, 0.04)',
                                                border: (formData.properties || []).includes(prop.id)
                                                    ? '1px solid rgba(245, 158, 11, 0.5)'
                                                    : '1px solid rgba(255, 255, 255, 0.12)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                color: (formData.properties || []).includes(prop.id) ? '#fff' : 'rgba(255,255,255,0.7)',
                                                fontSize: '0.95rem',
                                                fontWeight: 500,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={(formData.properties || []).includes(prop.id)}
                                                onChange={(e) => {
                                                    const props = formData.properties || [];
                                                    setFormData({
                                                        ...formData,
                                                        properties: e.target.checked
                                                            ? [...props, prop.id]
                                                            : props.filter(p => p !== prop.id)
                                                    });
                                                }}
                                                style={{
                                                    width: '44px',
                                                    height: '24px',
                                                    appearance: 'none',
                                                    WebkitAppearance: 'none',
                                                    background: (formData.properties || []).includes(prop.id)
                                                        ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                                                        : 'rgba(255,255,255,0.15)',
                                                    borderRadius: '12px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    flexShrink: 0
                                                }}
                                            />
                                            <span>{prop.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {attributes.length > 0 && (
                                <>
                                    <div className={styles.divider}>🔗 Bônus de Atributos</div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Bônus de Acerto</label>
                                            <select
                                                className={styles.select}
                                                value={formData.bonuses?.toHit || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    bonuses: { ...(formData.bonuses || {}), toHit: e.target.value }
                                                })}
                                            >
                                                <option value="">Nenhum</option>
                                                {attributes.map(attr => (
                                                    <option key={attr.id} value={`{${attr.shortName}.mod}`}>
                                                        +{attr.shortName} (mod)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Bônus de Dano</label>
                                            <select
                                                className={styles.select}
                                                value={formData.bonuses?.toDamage || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    bonuses: { ...(formData.bonuses || {}), toDamage: e.target.value }
                                                })}
                                            >
                                                <option value="">Nenhum</option>
                                                {attributes.map(attr => (
                                                    <option key={attr.id} value={`{${attr.shortName}.mod}`}>
                                                        +{attr.shortName} (mod)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* TAB: Defesa (Armaduras) */}
                    {activeModalTab === 'stats' && isArmor && (
                        <>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Classe de Armadura (CA)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        min="0"
                                        value={formData.armorClass || 10}
                                        onChange={(e) => setFormData({ ...formData, armorClass: parseInt(e.target.value) || 10 })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Tipo de Armadura</label>
                                    <select
                                        className={styles.select}
                                        value={formData.armorType || 'light'}
                                        onChange={(e) => setFormData({ ...formData, armorType: e.target.value })}
                                    >
                                        <option value="light">Leve</option>
                                        <option value="medium">Média</option>
                                        <option value="heavy">Pesada</option>
                                        <option value="shield">Escudo</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.stealthDisadvantage || false}
                                        onChange={(e) => setFormData({ ...formData, stealthDisadvantage: e.target.checked })}
                                    />
                                    Desvantagem em Furtividade
                                </label>
                            </div>

                            {attributes.length > 0 && (
                                <>
                                    <div className={styles.divider}>🔗 Modificador de DEX na CA</div>
                                    <div className={styles.formGroup}>
                                        <label>Limitar DEX na CA</label>
                                        <select
                                            className={styles.select}
                                            value={formData.maxDexBonus ?? 'none'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                maxDexBonus: e.target.value === 'none' ? null : parseInt(e.target.value)
                                            })}
                                        >
                                            <option value="none">Sem limite</option>
                                            <option value="0">+0 (Não usa DEX)</option>
                                            <option value="2">+2 máximo (Armadura média)</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* TAB: Efeitos Mecânicos */}
                    {activeModalTab === 'effects' && (
                        <>
                            <div className={styles.infoBox}>
                                <Zap size={18} />
                                <div>
                                    <strong>Efeitos Automáticos</strong><br />
                                    Quando equipado, o VTT aplica estes modificadores na ficha do personagem.
                                </div>
                            </div>

                            {attributes.length === 0 && (
                                <div className={styles.warningBox}>
                                    ⚠️ Crie atributos primeiro para usar bônus de atributo nos efeitos.
                                </div>
                            )}

                            <div className={styles.effectsList}>
                                {formData.effects.length === 0 ? (
                                    <div className={styles.emptyEffects}>
                                        Nenhum efeito. Clique abaixo para adicionar.
                                    </div>
                                ) : (
                                    formData.effects.map(effect => (
                                        <div key={effect.id} className={styles.effectRow}>
                                            <select
                                                className={styles.select}
                                                value={effect.type}
                                                onChange={(e) => updateEffect(effect.id, { type: e.target.value })}
                                            >
                                                {EFFECT_TYPES.map(type => (
                                                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                                                ))}
                                            </select>

                                            {effect.type === 'attribute_bonus' && attributes.length > 0 && (
                                                <select
                                                    className={styles.select}
                                                    value={effect.target}
                                                    onChange={(e) => updateEffect(effect.id, { target: e.target.value })}
                                                >
                                                    {attributes.map(attr => (
                                                        <option key={attr.id} value={attr.id}>{attr.name}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {effect.type === 'resistance' && (
                                                <select
                                                    className={styles.select}
                                                    value={effect.target}
                                                    onChange={(e) => updateEffect(effect.id, { target: e.target.value })}
                                                >
                                                    {DAMAGE_TYPES.map(type => (
                                                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                                                    ))}
                                                </select>
                                            )}

                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder="+2, -1, 50%..."
                                                value={effect.value || ''}
                                                onChange={(e) => updateEffect(effect.id, { value: e.target.value })}
                                                style={{ width: '100px' }}
                                            />

                                            <button className={styles.removeEffectBtn} onClick={() => removeEffect(effect.id)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className={styles.addEffectBtn} onClick={addEffect}>
                                <Zap size={16} />
                                Adicionar Efeito
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button className={styles.saveBtn} onClick={() => onSave(formData)}>Salvar</button>
                </div>
            </div>
        </div>
    );
}
