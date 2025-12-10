import React, { useState, useMemo, useCallback } from 'react';
import { sanitizeCodeId, normalizeEntity } from '../../../../forge/core/IdHelpers';
import styles from '../Editor.module.css';
import { Label } from '../components/HelpTip';
import {
    Plus, Trash2, Copy, Search, ChevronDown, ChevronRight,
    Zap, Play, GitBranch, ArrowRight, Check, X, Settings2,
    Calculator, Code, Split, Repeat, Target, Wand2,
    Sword, Heart, Shield, Package, Eye, AlertCircle,
    MessageSquare, Sparkles, Move, Edit3
} from 'lucide-react';

/**
 * RuleEditor - Editor Visual de Regras (Node-Based)
 * 
 * Sistema de automação "Quando X acontecer → faça Y"
 * Interface visual estilo Blueprint/Node-RED
 */

// ========== CONSTANTS ==========

const RULE_CATEGORIES = [
    { id: 'combat', label: 'Combate', icon: Sword, color: '#ef4444' },
    { id: 'resources', label: 'Recursos', icon: Heart, color: '#10b981' },
    { id: 'attributes', label: 'Atributos', icon: Calculator, color: '#3b82f6' },
    { id: 'conditions', label: 'Condições', icon: AlertCircle, color: '#f59e0b' },
    { id: 'items', label: 'Itens', icon: Package, color: '#8b5cf6' },
    { id: 'custom', label: 'Personalizado', icon: Sparkles, color: '#ec4899' }
];

const NODE_TYPES = {
    event: {
        label: 'Evento',
        icon: Zap,
        color: '#8b5cf6',
        description: 'Gatilho que inicia a regra'
    },
    condition: {
        label: 'Condição',
        icon: GitBranch,
        color: '#f59e0b',
        description: 'Testa se algo é verdadeiro'
    },
    action: {
        label: 'Ação',
        icon: Play,
        color: '#10b981',
        description: 'Executa uma ação no sistema'
    },
    math: {
        label: 'Matemática',
        icon: Calculator,
        color: '#3b82f6',
        description: 'Cálculos numéricos'
    },
    formula: {
        label: 'Fórmula',
        icon: Code,
        color: '#06b6d4',
        description: 'Expressão personalizada'
    },
    branch: {
        label: 'Ramificação',
        icon: Split,
        color: '#ec4899',
        description: 'Se/Então/Senão'
    },
    loop: {
        label: 'Repetição',
        icon: Repeat,
        color: '#6366f1',
        description: 'Repete X vezes ou por duração'
    }
};

const ACTION_TYPES = [
    { id: 'setValue', label: 'Definir Valor', icon: Edit3 },
    { id: 'add', label: 'Adicionar', icon: Plus },
    { id: 'subtract', label: 'Subtrair', icon: X },
    { id: 'applyCondition', label: 'Aplicar Condição', icon: AlertCircle },
    { id: 'removeCondition', label: 'Remover Condição', icon: X },
    { id: 'addModifier', label: 'Adicionar Modificador', icon: Sparkles },
    { id: 'removeModifier', label: 'Remover Modificador', icon: X },
    { id: 'roll', label: 'Rolar Dados', icon: Target },
    { id: 'damage', label: 'Aplicar Dano', icon: Sword },
    { id: 'heal', label: 'Curar', icon: Heart },
    { id: 'log', label: 'Log/Toast', icon: MessageSquare },
    { id: 'equipItem', label: 'Equipar Item', icon: Shield },
    { id: 'unequipItem', label: 'Desequipar Item', icon: Package }
];

const COMPARISON_OPERATORS = [
    { id: 'eq', label: '=', desc: 'Igual' },
    { id: 'neq', label: '≠', desc: 'Diferente' },
    { id: 'gt', label: '>', desc: 'Maior' },
    { id: 'gte', label: '≥', desc: 'Maior ou igual' },
    { id: 'lt', label: '<', desc: 'Menor' },
    { id: 'lte', label: '≤', desc: 'Menor ou igual' }
];

const DEFAULT_RULE = {
    id: '',
    name: '',
    description: '',
    category: 'custom',
    enabled: true,
    eventId: '', // Evento que dispara a regra
    nodes: [],   // Lista de nodes
    connections: [] // Conexões entre nodes
};

const DEFAULT_NODE = {
    id: '',
    type: 'action',
    x: 100,
    y: 100,
    config: {}
};

// ========== COMPONENT ==========

export function RuleEditor({ rules = [], events = [], fields = [], entityTypes = [], onChange }) {
    const [selectedRuleId, setSelectedRuleId] = useState(null);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showNodePalette, setShowNodePalette] = useState(false);
    const [showTestPanel, setShowTestPanel] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        properties: true,
        test: false
    });
    const [testResult, setTestResult] = useState(null);

    // Test context - simulated entity values for testing
    const [testContext, setTestContext] = useState({});

    // ========== BLUEPRINT DRAG & CONNECT STATE ==========
    const canvasRef = React.useRef(null);

    // Dragging nodes
    const [draggingNode, setDraggingNode] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Creating connections
    const [connectingFrom, setConnectingFrom] = useState(null); // { nodeId, port: 'out' | 'true' | 'false' }
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const selectedRule = rules.find(r => r.id === selectedRuleId);
    const selectedNode = selectedRule?.nodes?.find(n => n.id === selectedNodeId);

    // Get all events (native + custom)
    const allEvents = useMemo(() => {
        const nativeEvents = [
            { id: 'onCreate', label: 'Ao Criar', category: 'lifecycle' },
            { id: 'onDelete', label: 'Ao Remover', category: 'lifecycle' },
            { id: 'onChange', label: 'Ao Mudar', category: 'field' },
            { id: 'onTurnStart', label: 'Início do Turno', category: 'combat' },
            { id: 'onTurnEnd', label: 'Fim do Turno', category: 'combat' },
            { id: 'onRoll', label: 'Ao Rolar', category: 'dice' },
            { id: 'onDamage', label: 'Ao Receber Dano', category: 'combat' },
            { id: 'onHeal', label: 'Ao Curar', category: 'combat' },
            { id: 'onEquip', label: 'Ao Equipar', category: 'inventory' },
            { id: 'onUnequip', label: 'Ao Desequipar', category: 'inventory' }
        ];
        return [...nativeEvents, ...events];
    }, [events]);

    // Filtered rules
    const filteredRules = useMemo(() => {
        return rules.filter(rule => {
            const matchesSearch = !searchQuery ||
                rule.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [rules, searchQuery, categoryFilter]);

    // Grouped rules
    const groupedRules = useMemo(() => {
        const groups = {};
        RULE_CATEGORIES.forEach(cat => {
            groups[cat.id] = filteredRules.filter(r => r.category === cat.id);
        });
        return groups;
    }, [filteredRules]);

    // Toggle section
    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Add rule
    const handleAddRule = () => {
        const newRule = normalizeEntity({
            ...JSON.parse(JSON.stringify(DEFAULT_RULE)),
            id: `rule_${Date.now()}`,
            name: `Nova Regra ${rules.length + 1}`,
            nodes: [{
                id: `node_${Date.now()}`,
                type: 'event',
                x: 50,
                y: 150,
                config: { eventId: '' }
            }]
        });
        onChange([...rules, newRule]);
        setSelectedRuleId(newRule.id);
    };

    // Duplicate rule
    const handleDuplicateRule = (rule, e) => {
        e?.stopPropagation();
        const newRule = normalizeEntity({
            ...JSON.parse(JSON.stringify(rule)),
            internalId: null, // Force new ID
            codeId: `${rule.codeId}_copy`,
            name: `${rule.name} (Cópia)`
        });
        onChange([...rules, newRule]);
        setSelectedRuleId(newRule.id);
    };

    // Update rule
    const handleUpdateRule = (updates) => {
        if (updates.id && updates.id !== selectedRuleId) {
            setSelectedRuleId(updates.id);
        }
        onChange(rules.map(r =>
            r.id === selectedRuleId ? { ...r, ...updates } : r
        ));
    };

    // Delete rule
    const handleDeleteRule = () => {
        onChange(rules.filter(r => r.id !== selectedRuleId));
        setSelectedRuleId(null);
    };

    // Add node
    const handleAddNode = (type) => {
        const nodes = selectedRule?.nodes || [];
        const newNode = {
            ...JSON.parse(JSON.stringify(DEFAULT_NODE)),
            id: `node_${Date.now()}`,
            type,
            x: 250 + (nodes.length * 50),
            y: 150,
            config: getDefaultNodeConfig(type)
        };
        handleUpdateRule({ nodes: [...nodes, newNode] });
        setSelectedNodeId(newNode.id);
        setShowNodePalette(false);
    };

    // Get default config for node type
    const getDefaultNodeConfig = (type) => {
        switch (type) {
            case 'event': return { eventId: '' };
            case 'condition': return { field: '', operator: 'eq', value: '' };
            case 'action': return { actionType: 'setValue', field: '', value: '' };
            case 'math': return { operation: 'add', a: '', b: '' };
            case 'formula': return { expression: '' };
            case 'branch': return { condition: '' };
            case 'loop': return { count: 1, perTurn: false };
            default: return {};
        }
    };

    // Update node
    const handleUpdateNode = (nodeId, updates) => {
        const nodes = selectedRule?.nodes?.map(n =>
            n.id === nodeId ? { ...n, ...updates } : n
        ) || [];
        handleUpdateRule({ nodes });
    };

    // Update node config
    const handleUpdateNodeConfig = (key, value) => {
        if (!selectedNode) return;
        const config = { ...selectedNode.config, [key]: value };
        handleUpdateNode(selectedNode.id, { config });
    };

    // Delete node
    const handleDeleteNode = () => {
        if (!selectedNode) return;
        const nodes = selectedRule?.nodes?.filter(n => n.id !== selectedNodeId) || [];
        const connections = selectedRule?.connections?.filter(
            c => c.from !== selectedNodeId && c.to !== selectedNodeId
        ) || [];
        handleUpdateRule({ nodes, connections });
        setSelectedNodeId(null);
    };

    // ========== BLUEPRINT DRAG & CONNECT HANDLERS ==========

    // Start dragging a node
    const handleNodeMouseDown = (e, node) => {
        e.stopPropagation();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scrollLeft = canvas.scrollLeft;
        const scrollTop = canvas.scrollTop;

        setDraggingNode(node.id);
        setDragOffset({
            x: e.clientX - rect.left + scrollLeft - (node.x || 0),
            y: e.clientY - rect.top + scrollTop - (node.y || 0)
        });
    };

    // Handle mouse move for dragging nodes or creating connections
    const handleCanvasMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scrollLeft = canvas.scrollLeft;
        const scrollTop = canvas.scrollTop;
        const x = e.clientX - rect.left + scrollLeft;
        const y = e.clientY - rect.top + scrollTop;

        // Update mouse position for connection preview
        setMousePos({ x, y });

        // If dragging a node, update its position
        if (draggingNode) {
            const newX = Math.max(0, x - dragOffset.x);
            const newY = Math.max(0, y - dragOffset.y);
            handleUpdateNode(draggingNode, { x: newX, y: newY });
        }
    };

    // Stop dragging
    const handleCanvasMouseUp = (e) => {
        // If we were connecting and released on empty space, cancel
        if (connectingFrom) {
            setConnectingFrom(null);
        }
        setDraggingNode(null);
    };

    // Start creating a connection from an output port
    const handlePortMouseDown = (e, nodeId, portType) => {
        e.stopPropagation();
        setConnectingFrom({ nodeId, port: portType });
    };

    // Complete a connection to an input port
    const handlePortMouseUp = (e, targetNodeId) => {
        e.stopPropagation();
        if (!connectingFrom || connectingFrom.nodeId === targetNodeId) {
            setConnectingFrom(null);
            return;
        }

        // Create the connection
        const newConnection = {
            id: `conn_${Date.now()}`,
            from: connectingFrom.nodeId,
            fromPort: connectingFrom.port,
            to: targetNodeId,
            toPort: 'in'
        };

        const connections = [...(selectedRule?.connections || [])];

        // Remove existing connection to this target's input (only one input allowed)
        const filtered = connections.filter(c => c.to !== targetNodeId);
        filtered.push(newConnection);

        handleUpdateRule({ connections: filtered });
        setConnectingFrom(null);
    };

    // Delete a connection
    const handleDeleteConnection = (connId) => {
        const connections = selectedRule?.connections?.filter(c => c.id !== connId) || [];
        handleUpdateRule({ connections });
    };

    // Get node position helper
    const getNodePosition = (nodeId) => {
        const node = selectedRule?.nodes?.find(n => n.id === nodeId);
        return node ? { x: node.x || 0, y: node.y || 0 } : { x: 0, y: 0 };
    };

    // Get port position for drawing connections
    const getPortPosition = (nodeId, portType) => {
        const pos = getNodePosition(nodeId);
        const nodeWidth = 180;
        const nodeHeight = 80;

        switch (portType) {
            case 'in':
                return { x: pos.x, y: pos.y + nodeHeight / 2 };
            case 'out':
                return { x: pos.x + nodeWidth, y: pos.y + nodeHeight / 2 };
            case 'true':
                return { x: pos.x + nodeWidth, y: pos.y + nodeHeight / 3 };
            case 'false':
                return { x: pos.x + nodeWidth, y: pos.y + (nodeHeight * 2) / 3 };
            default:
                return { x: pos.x + nodeWidth, y: pos.y + nodeHeight / 2 };
        }
    };

    // ========== RULE EXECUTOR ==========

    // Evaluate a comparison
    const evaluateComparison = (value, operator, target) => {
        const numValue = Number(value);
        const numTarget = Number(target);

        switch (operator) {
            case 'eq': return numValue === numTarget;
            case 'neq': return numValue !== numTarget;
            case 'gt': return numValue > numTarget;
            case 'gte': return numValue >= numTarget;
            case 'lt': return numValue < numTarget;
            case 'lte': return numValue <= numTarget;
            default: return false;
        }
    };

    // Resolve a value (could be field reference or literal)
    const resolveValue = (expr, context) => {
        if (expr === undefined || expr === null || expr === '') return 0;

        // Convert to string to handle references
        let exprStr = String(expr);

        // 1. Replace all field references {fieldId} with values
        let hasReplacements = false;
        const resolvedStr = exprStr.replace(/\{(\w+)\}/g, (match, fieldId) => {
            hasReplacements = true;
            const val = context[fieldId];
            return val !== undefined ? val : 0;
        });

        // 2. If it is a simple number, return it
        const num = Number(resolvedStr);
        if (!isNaN(num) && resolvedStr.trim() !== '') return num;

        // 3. If it looks like a math expression, try to evaluate
        // Allow digits, operators, parentheses, decimal points, and spaces
        if (/^[\d\s\.\+\-\*\/\(\)%]+$/.test(resolvedStr)) {
            try {
                // Safe-ish eval for math only
                // eslint-disable-next-line no-new-func
                return new Function(`return ${resolvedStr}`)();
            } catch (e) {
                // If eval fails, return the string (might be part of a text message)
                return resolvedStr;
            }
        }

        return resolvedStr;
    };

    // Execute a math operation
    const executeMath = (operation, a, b) => {
        switch (operation) {
            case 'add': return a + b;
            case 'subtract': return a - b;
            case 'multiply': return a * b;
            case 'divide': return b !== 0 ? a / b : 0;
            case 'floor': return Math.floor(a);
            case 'ceil': return Math.ceil(a);
            case 'max': return Math.max(a, b);
            case 'min': return Math.min(a, b);
            case 'random': return Math.floor(Math.random() * (b - a + 1)) + a;
            default: return a;
        }
    };

    // Run test - REAL EXECUTION
    const handleRunTest = () => {
        if (!selectedRule || !selectedRule.nodes?.length) {
            setTestResult({
                success: false,
                error: 'Nenhum nó na regra',
                steps: [],
                changes: []
            });
            return;
        }

        const nodes = selectedRule.nodes;
        const steps = [];
        const changes = [];
        let context = { ...testContext };
        let continueExecution = true;
        let loopCount = 1;

        // Execute each node in sequence
        for (let i = 0; i < nodes.length && continueExecution; i++) {
            const node = nodes[i];
            const nodeType = NODE_TYPES[node.type];

            switch (node.type) {
                case 'event': {
                    const eventLabel = getEventLabel(node.config?.eventId);
                    steps.push({
                        node: nodeType.label,
                        result: `Gatilho: ${eventLabel}`,
                        status: 'triggered'
                    });
                    break;
                }

                case 'condition': {
                    const fieldValue = context[node.config?.field] ?? 0;
                    const targetValue = resolveValue(node.config?.value, context);
                    const result = evaluateComparison(fieldValue, node.config?.operator, targetValue);
                    const opLabel = COMPARISON_OPERATORS.find(o => o.id === node.config?.operator)?.label || '=';
                    const fieldName = fields.find(f => f.id === node.config?.field)?.name || node.config?.field;

                    steps.push({
                        node: nodeType.label,
                        result: `${fieldName} (${fieldValue}) ${opLabel} ${targetValue}: ${result ? 'VERDADEIRO' : 'FALSO'}`,
                        status: result ? 'passed' : 'failed'
                    });

                    if (!result) {
                        continueExecution = false;
                    }
                    break;
                }

                case 'action': {
                    const actionType = node.config?.actionType;
                    const targetField = node.config?.field;
                    const value = resolveValue(node.config?.value, context);
                    const fieldName = fields.find(f => f.id === targetField)?.name || targetField;
                    const actionLabel = ACTION_TYPES.find(a => a.id === actionType)?.label || actionType;
                    const oldValue = context[targetField];

                    switch (actionType) {
                        case 'setValue':
                            context[targetField] = value;
                            break;
                        case 'add':
                            context[targetField] = (context[targetField] || 0) + value;
                            break;
                        case 'subtract':
                            context[targetField] = (context[targetField] || 0) - value;
                            break;
                        case 'applyCondition':
                            context[`condition_${node.config?.value}`] = true;
                            break;
                        case 'removeCondition':
                            context[`condition_${node.config?.value}`] = false;
                            break;
                        case 'log':
                            // Log action - just record it
                            break;
                        default:
                            break;
                    }

                    const newValue = context[targetField];
                    steps.push({
                        node: nodeType.label,
                        result: `${actionLabel}: ${fieldName} ${oldValue !== undefined ? `(${oldValue} → ${newValue})` : ''}`,
                        status: 'executed'
                    });

                    if (oldValue !== newValue && targetField) {
                        changes.push({
                            field: fieldName || targetField,
                            from: oldValue ?? '(vazio)',
                            to: newValue ?? '(vazio)'
                        });
                    }
                    break;
                }

                case 'math': {
                    const a = resolveValue(node.config?.a, context);
                    const b = resolveValue(node.config?.b, context);
                    const result = executeMath(node.config?.operation, a, b);
                    context['_mathResult'] = result;

                    steps.push({
                        node: nodeType.label,
                        result: `${a} ${node.config?.operation} ${b} = ${result}`,
                        status: 'calculated'
                    });
                    break;
                }

                case 'formula': {
                    // Simple formula evaluation (just show what it would do)
                    const expression = node.config?.expression || '';
                    steps.push({
                        node: nodeType.label,
                        result: `Expressão: ${expression}`,
                        status: 'evaluated'
                    });
                    break;
                }

                case 'branch': {
                    const condition = node.config?.condition || '';
                    // Simple parsing for {field} <= value pattern
                    const match = condition.match(/\{(\w+)\}\s*([<>=!]+)\s*(\d+)/);
                    let result = true;
                    if (match) {
                        const [, fieldId, op, val] = match;
                        const fieldValue = context[fieldId] ?? 0;
                        const opMap = { '<=': 'lte', '>=': 'gte', '<': 'lt', '>': 'gt', '==': 'eq', '!=': 'neq', '=': 'eq' };
                        result = evaluateComparison(fieldValue, opMap[op] || 'eq', Number(val));
                    }

                    steps.push({
                        node: nodeType.label,
                        result: `${condition}: ${result ? '✓ Verdadeiro' : '✗ Falso'}`,
                        status: result ? 'true-branch' : 'false-branch'
                    });

                    if (!result) {
                        continueExecution = false;
                    }
                    break;
                }

                case 'loop': {
                    loopCount = node.config?.count || 1;
                    steps.push({
                        node: nodeType.label,
                        result: `Repetir ${loopCount}x ${node.config?.perTurn ? '(por turno)' : '(agora)'}`,
                        status: 'loop'
                    });
                    break;
                }

                default:
                    steps.push({
                        node: node.type,
                        result: 'Nó não reconhecido',
                        status: 'unknown'
                    });
            }
        }

        setTestResult({
            success: continueExecution,
            steps,
            changes,
            finalContext: context
        });
    };

    // Initialize test context with field defaults
    const initializeTestContext = useCallback(() => {
        const ctx = {};
        fields.forEach(field => {
            if (field.type === 'number' || field.type === 'resource') {
                ctx[field.id] = field.default || 0;
            } else if (field.type === 'boolean') {
                ctx[field.id] = field.default || false;
            } else {
                ctx[field.id] = field.default || '';
            }
        });
        setTestContext(ctx);
    }, [fields]);

    // Get event label
    const getEventLabel = (eventId) => {
        const event = allEvents.find(e => e.id === eventId);
        return event?.label || event?.name || eventId || 'Sem evento';
    };

    return (
        <div className={styles.ruleEditorContainer}>
            {/* ========== LISTA DE REGRAS ========== */}
            <div className={styles.ruleList}>
                <div className={styles.fieldListHeader}>
                    <h3>Regras ({rules.length})</h3>
                    <button className={styles.addButton} onClick={handleAddRule} title="Nova Regra">
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
                        {RULE_CATEGORIES.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* Rule Items */}
                <div className={styles.fieldItems}>
                    {RULE_CATEGORIES.map(category => {
                        const categoryRules = groupedRules[category.id] || [];
                        if (categoryRules.length === 0) return null;

                        const Icon = category.icon;
                        return (
                            <div key={category.id}>
                                <div className={styles.ruleGroupHeader} style={{ color: category.color }}>
                                    <Icon size={14} />
                                    <span>{category.label}</span>
                                    <span className={styles.ruleGroupCount}>{categoryRules.length}</span>
                                </div>
                                {categoryRules.map(rule => (
                                    <div
                                        key={rule.id}
                                        className={`${styles.ruleItem} ${selectedRuleId === rule.id ? styles.ruleItemActive : ''} ${!rule.enabled ? styles.ruleItemDisabled : ''}`}
                                        onClick={() => { setSelectedRuleId(rule.id); setSelectedNodeId(null); }}
                                    >
                                        <Zap size={16} style={{ color: category.color }} />
                                        <div className={styles.ruleItemInfo}>
                                            <div className={styles.ruleItemName}>{rule.name}</div>
                                            <div className={styles.ruleItemMeta}>
                                                <span>{getEventLabel(rule.eventId || rule.nodes?.[0]?.config?.eventId)}</span>
                                                <span className={styles.nodeCount}>{rule.nodes?.length || 0} nodes</span>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.fieldItemAction}
                                            onClick={(e) => handleDuplicateRule(rule, e)}
                                            title="Duplicar"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                    {filteredRules.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>{rules.length === 0 ? 'Nenhuma regra criada' : 'Nenhum resultado'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== EDITOR VISUAL ========== */}
            <div className={styles.ruleEditor}>
                {selectedRule ? (
                    <>
                        {/* Rule Header */}
                        <div className={styles.ruleEditorHeader}>
                            <div className={styles.ruleEditorTitle}>
                                <input
                                    type="text"
                                    value={selectedRule.name}
                                    onChange={e => handleUpdateRule({ name: e.target.value })}
                                    className={styles.ruleTitleInput}
                                    placeholder="Nome da Regra"
                                />
                                <select
                                    value={selectedRule.category}
                                    onChange={e => handleUpdateRule({ category: e.target.value })}
                                    className={styles.ruleCategorySelect}
                                >
                                    {RULE_CATEGORIES.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.ruleEditorActions}>
                                <button
                                    className={styles.addNodeBtn}
                                    onClick={() => setShowNodePalette(!showNodePalette)}
                                >
                                    <Plus size={16} /> Adicionar Nó
                                </button>
                                <button
                                    className={`${styles.testRuleBtn} ${showTestPanel ? styles.active : ''}`}
                                    onClick={() => { setShowTestPanel(!showTestPanel); if (!showTestPanel) initializeTestContext(); }}
                                >
                                    <Play size={16} /> Testar
                                </button>
                                <button className={styles.deleteButton} onClick={handleDeleteRule}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Node Palette */}
                        {showNodePalette && (
                            <div className={styles.nodePalette}>
                                {Object.entries(NODE_TYPES).map(([type, info]) => {
                                    const Icon = info.icon;
                                    return (
                                        <button
                                            key={type}
                                            className={styles.nodePaletteItem}
                                            onClick={() => handleAddNode(type)}
                                            style={{ '--node-color': info.color }}
                                        >
                                            <Icon size={18} />
                                            <span>{info.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Test Configuration Panel */}
                        {showTestPanel && (
                            <div className={styles.testConfigPanel}>
                                <div className={styles.testConfigHeader}>
                                    <h4><Settings2 size={16} /> Configurar Valores de Teste</h4>
                                    <button onClick={() => setShowTestPanel(false)}>
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className={styles.testConfigBody}>
                                    <div className={styles.testFieldsGrid}>
                                        {fields.slice(0, 8).map(field => (
                                            <div key={field.id} className={styles.testFieldInput}>
                                                <label>{field.icon} {field.name}</label>
                                                <input
                                                    type={field.type === 'number' || field.type === 'resource' ? 'number' : 'text'}
                                                    value={testContext[field.id] ?? ''}
                                                    onChange={e => setTestContext(prev => ({
                                                        ...prev,
                                                        [field.id]: field.type === 'number' || field.type === 'resource'
                                                            ? Number(e.target.value)
                                                            : e.target.value
                                                    }))}
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.testActions}>
                                        <button className={styles.runTestBtn} onClick={handleRunTest}>
                                            <Play size={16} /> Executar Regra
                                        </button>
                                        <button className={styles.resetTestBtn} onClick={initializeTestContext}>
                                            <Repeat size={14} /> Resetar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Node Canvas - Blueprint Style */}
                        <div
                            ref={canvasRef}
                            className={`${styles.nodeCanvas} ${draggingNode ? styles.canvasDragging : ''}`}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                        >
                            <div className={styles.nodeCanvasGrid}>
                                {/* Nodes */}
                                {(selectedRule.nodes || []).map((node, idx) => {
                                    const nodeType = NODE_TYPES[node.type] || NODE_TYPES.action;
                                    const Icon = nodeType.icon;
                                    const isSelected = selectedNodeId === node.id;
                                    const isBranch = node.type === 'branch';

                                    return (
                                        <div
                                            key={node.id}
                                            className={`${styles.node} ${isSelected ? styles.nodeSelected : ''} ${draggingNode === node.id ? styles.nodeDragging : ''}`}
                                            style={{
                                                left: node.x || (50 + idx * 220),
                                                top: node.y || 100,
                                                '--node-color': nodeType.color
                                            }}
                                            onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); }}
                                            onMouseDown={(e) => handleNodeMouseDown(e, node)}
                                        >
                                            <div className={styles.nodeHeader}>
                                                <Icon size={14} />
                                                <span>{nodeType.label}</span>
                                            </div>
                                            <div className={styles.nodeBody}>
                                                {node.type === 'event' && (
                                                    <span className={styles.nodeValue}>
                                                        {getEventLabel(node.config?.eventId)}
                                                    </span>
                                                )}
                                                {node.type === 'condition' && (
                                                    <span className={styles.nodeValue}>
                                                        {node.config?.field || 'Campo'} {
                                                            COMPARISON_OPERATORS.find(o => o.id === node.config?.operator)?.label || '='
                                                        } {node.config?.value || '?'}
                                                    </span>
                                                )}
                                                {node.type === 'action' && (
                                                    <span className={styles.nodeValue}>
                                                        {ACTION_TYPES.find(a => a.id === node.config?.actionType)?.label || 'Ação'}
                                                    </span>
                                                )}
                                                {node.type === 'formula' && (
                                                    <span className={styles.nodeValue}>
                                                        {node.config?.expression || 'Expressão...'}
                                                    </span>
                                                )}
                                                {node.type === 'branch' && (
                                                    <span className={styles.nodeValue}>Se/Então/Senão</span>
                                                )}
                                                {node.type === 'math' && (
                                                    <span className={styles.nodeValue}>
                                                        {node.config?.operation || 'Calcular'}
                                                    </span>
                                                )}
                                                {node.type === 'loop' && (
                                                    <span className={styles.nodeValue}>
                                                        {node.config?.count || 1}x
                                                    </span>
                                                )}
                                            </div>

                                            {/* Input Port - All nodes except Event can have input */}
                                            {node.type !== 'event' && (
                                                <div
                                                    className={styles.nodePortIn}
                                                    onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                                                    title="Entrada"
                                                />
                                            )}

                                            {/* Output Ports */}
                                            {isBranch ? (
                                                <>
                                                    {/* True branch port */}
                                                    <div
                                                        className={`${styles.nodePortOut} ${styles.portTrue}`}
                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, 'true')}
                                                        title="Verdadeiro"
                                                    >
                                                        <span>✓</span>
                                                    </div>
                                                    {/* False branch port */}
                                                    <div
                                                        className={`${styles.nodePortOut} ${styles.portFalse}`}
                                                        onMouseDown={(e) => handlePortMouseDown(e, node.id, 'false')}
                                                        title="Falso"
                                                    >
                                                        <span>✗</span>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Regular output port */
                                                <div
                                                    className={styles.nodePortOut}
                                                    onMouseDown={(e) => handlePortMouseDown(e, node.id, 'out')}
                                                    title="Saída"
                                                />
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Connection Lines SVG */}
                                <svg className={styles.nodeConnections}>
                                    {/* Existing connections */}
                                    {(selectedRule.connections || []).map((conn) => {
                                        const fromPos = getPortPosition(conn.from, conn.fromPort || 'out');
                                        const toPos = getPortPosition(conn.to, 'in');
                                        const color = conn.fromPort === 'true' ? '#10b981' :
                                            conn.fromPort === 'false' ? '#ef4444' : '#8b5cf6';

                                        return (
                                            <g key={conn.id}>
                                                <path
                                                    d={`M${fromPos.x},${fromPos.y} C${fromPos.x + 80},${fromPos.y} ${toPos.x - 80},${toPos.y} ${toPos.x},${toPos.y}`}
                                                    className={styles.connectionLine}
                                                    style={{ stroke: color }}
                                                />
                                                {/* Click target for deletion */}
                                                <path
                                                    d={`M${fromPos.x},${fromPos.y} C${fromPos.x + 80},${fromPos.y} ${toPos.x - 80},${toPos.y} ${toPos.x},${toPos.y}`}
                                                    className={styles.connectionLineHitArea}
                                                    onClick={() => handleDeleteConnection(conn.id)}
                                                    title="Clique para remover"
                                                />
                                            </g>
                                        );
                                    })}

                                    {/* Connection being created (preview) */}
                                    {connectingFrom && (
                                        <path
                                            d={`M${getPortPosition(connectingFrom.nodeId, connectingFrom.port).x},${getPortPosition(connectingFrom.nodeId, connectingFrom.port).y} C${getPortPosition(connectingFrom.nodeId, connectingFrom.port).x + 50},${getPortPosition(connectingFrom.nodeId, connectingFrom.port).y} ${mousePos.x - 50},${mousePos.y} ${mousePos.x},${mousePos.y}`}
                                            className={`${styles.connectionLine} ${styles.connectionPreview}`}
                                            style={{
                                                stroke: connectingFrom.port === 'true' ? '#10b981' :
                                                    connectingFrom.port === 'false' ? '#ef4444' : '#8b5cf6'
                                            }}
                                        />
                                    )}
                                </svg>

                                {(selectedRule.nodes || []).length === 0 && (
                                    <div className={styles.emptyCanvas}>
                                        <Zap size={48} />
                                        <p>Adicione nós para construir a regra</p>
                                        <button onClick={() => setShowNodePalette(true)}>
                                            <Plus size={16} /> Adicionar Primeiro Nó
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Properties Panel */}
                        {(selectedNode || selectedRule) && (
                            <div className={styles.propertiesPanel}>
                                {selectedNode && (
                                    <>
                                        <div className={styles.propertiesHeader}>
                                            <h4>
                                                {NODE_TYPES[selectedNode.type]?.icon &&
                                                    React.createElement(NODE_TYPES[selectedNode.type].icon, { size: 16 })
                                                }
                                                {NODE_TYPES[selectedNode.type]?.label || 'Nó'}
                                            </h4>
                                            <button onClick={handleDeleteNode} className={styles.deleteNodeBtn}>
                                                <Trash2 size={14} /> Remover
                                            </button>
                                        </div>
                                        <div className={styles.propertiesBody}>
                                            {/* Event Node Config */}
                                            {selectedNode.type === 'event' && (
                                                <div className={styles.formGroup}>
                                                    <Label text="Evento Gatilho" />
                                                    <select
                                                        value={selectedNode.config?.eventId || ''}
                                                        onChange={e => handleUpdateNodeConfig('eventId', e.target.value)}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {allEvents.map(ev => (
                                                            <option key={ev.id} value={ev.id}>
                                                                {ev.label || ev.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Condition Node Config */}
                                            {selectedNode.type === 'condition' && (
                                                <>
                                                    <div className={styles.formGroup}>
                                                        <Label text="Campo" />
                                                        <select
                                                            value={selectedNode.config?.field || ''}
                                                            onChange={e => handleUpdateNodeConfig('field', e.target.value)}
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {fields.map(f => (
                                                                <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className={styles.formRow}>
                                                        <div className={styles.formGroup}>
                                                            <Label text="Operador" />
                                                            <select
                                                                value={selectedNode.config?.operator || 'eq'}
                                                                onChange={e => handleUpdateNodeConfig('operator', e.target.value)}
                                                            >
                                                                {COMPARISON_OPERATORS.map(op => (
                                                                    <option key={op.id} value={op.id}>{op.label} {op.desc}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <Label text="Valor" />
                                                            <input
                                                                type="text"
                                                                value={selectedNode.config?.value || ''}
                                                                onChange={e => handleUpdateNodeConfig('value', e.target.value)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Action Node Config */}
                                            {selectedNode.type === 'action' && (
                                                <>
                                                    <div className={styles.formGroup}>
                                                        <Label text="Tipo de Ação" />
                                                        <select
                                                            value={selectedNode.config?.actionType || 'setValue'}
                                                            onChange={e => handleUpdateNodeConfig('actionType', e.target.value)}
                                                        >
                                                            {ACTION_TYPES.map(a => (
                                                                <option key={a.id} value={a.id}>{a.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <Label text="Campo Alvo" />
                                                        <select
                                                            value={selectedNode.config?.field || ''}
                                                            onChange={e => handleUpdateNodeConfig('field', e.target.value)}
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {fields.map(f => (
                                                                <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <Label text="Valor / Fórmula" />
                                                        <input
                                                            type="text"
                                                            value={selectedNode.config?.value || ''}
                                                            onChange={e => handleUpdateNodeConfig('value', e.target.value)}
                                                            placeholder="{roll} + {STR_mod}"
                                                            className={styles.formulaInput}
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Formula Node Config */}
                                            {selectedNode.type === 'formula' && (
                                                <div className={styles.formGroup}>
                                                    <Label text="Expressão" />
                                                    <textarea
                                                        value={selectedNode.config?.expression || ''}
                                                        onChange={e => handleUpdateNodeConfig('expression', e.target.value)}
                                                        placeholder="floor(({strength} - 10) / 2)"
                                                        rows={3}
                                                        className={styles.formulaInput}
                                                    />
                                                    <p className={styles.formulaHint}>
                                                        Use {'{campo}'} para referências. Funções: floor, ceil, max, min, round
                                                    </p>
                                                </div>
                                            )}

                                            {/* Branch Node Config */}
                                            {selectedNode.type === 'branch' && (
                                                <div className={styles.formGroup}>
                                                    <Label text="Condição" />
                                                    <input
                                                        type="text"
                                                        value={selectedNode.config?.condition || ''}
                                                        onChange={e => handleUpdateNodeConfig('condition', e.target.value)}
                                                        placeholder="{HP} <= 0"
                                                        className={styles.formulaInput}
                                                    />
                                                    <p className={styles.branchHint}>
                                                        <span className={styles.trueBranch}>✓ Verdadeiro</span> → próximo nó
                                                        <span className={styles.falseBranch}>✗ Falso</span> → pula
                                                    </p>
                                                </div>
                                            )}

                                            {/* Loop Node Config */}
                                            {selectedNode.type === 'loop' && (
                                                <>
                                                    <div className={styles.formGroup}>
                                                        <Label text="Repetições" />
                                                        <input
                                                            type="number"
                                                            value={selectedNode.config?.count || 1}
                                                            onChange={e => handleUpdateNodeConfig('count', Number(e.target.value))}
                                                            min={1}
                                                        />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <Label text="Por Turno" />
                                                        <select
                                                            value={selectedNode.config?.perTurn ? 'true' : 'false'}
                                                            onChange={e => handleUpdateNodeConfig('perTurn', e.target.value === 'true')}
                                                        >
                                                            <option value="false">Não - executar tudo agora</option>
                                                            <option value="true">Sim - 1x por turno</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}

                                            {/* Math Node Config */}
                                            {selectedNode.type === 'math' && (
                                                <>
                                                    <div className={styles.formGroup}>
                                                        <Label text="Operação" />
                                                        <select
                                                            value={selectedNode.config?.operation || 'add'}
                                                            onChange={e => handleUpdateNodeConfig('operation', e.target.value)}
                                                        >
                                                            <option value="add">Somar (+)</option>
                                                            <option value="subtract">Subtrair (-)</option>
                                                            <option value="multiply">Multiplicar (×)</option>
                                                            <option value="divide">Dividir (÷)</option>
                                                            <option value="floor">Arredondar ↓</option>
                                                            <option value="ceil">Arredondar ↑</option>
                                                            <option value="max">Máximo</option>
                                                            <option value="min">Mínimo</option>
                                                            <option value="random">Aleatório</option>
                                                        </select>
                                                    </div>
                                                    <div className={styles.formRow}>
                                                        <div className={styles.formGroup}>
                                                            <Label text="A" />
                                                            <input
                                                                type="text"
                                                                value={selectedNode.config?.a || ''}
                                                                onChange={e => handleUpdateNodeConfig('a', e.target.value)}
                                                                placeholder="{campo} ou número"
                                                            />
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <Label text="B" />
                                                            <input
                                                                type="text"
                                                                value={selectedNode.config?.b || ''}
                                                                onChange={e => handleUpdateNodeConfig('b', e.target.value)}
                                                                placeholder="{campo} ou número"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                                {/* Rule Properties - shown when no node is selected but rule is selected */}
                                {!selectedNode && selectedRule && (
                                    <>
                                        <div className={styles.propertiesHeader}>
                                            <h4><Settings2 size={16} /> Propriedades da Regra</h4>
                                        </div>
                                        <div className={styles.propertiesBody}>
                                            <div className={styles.formGroup}>
                                                <Label text="ID de Código" />
                                                <input
                                                    type="text"
                                                    value={selectedRule.codeId || ''}
                                                    onChange={e => handleUpdateRule({ codeId: sanitizeCodeId(e.target.value) })}
                                                    className={styles.codeInput}
                                                    placeholder="ex: regra_combate"
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <Label text="ID Interno" />
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <input
                                                        type="text"
                                                        value={selectedRule.internalId || selectedRule.id}
                                                        disabled
                                                        className={styles.disabledInput}
                                                        style={{ flex: 1, opacity: 0.7 }}
                                                    />
                                                    <button
                                                        className={styles.iconButton}
                                                        onClick={() => navigator.clipboard.writeText(selectedRule.internalId || selectedRule.id)}
                                                        title="Copiar ID"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <Label text="Descrição" />
                                                <textarea
                                                    value={selectedRule.description || ''}
                                                    onChange={e => handleUpdateRule({ description: e.target.value })}
                                                    rows={3}
                                                    placeholder="Descreva o propósito desta regra..."
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <div className={styles.checkboxRow}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRule.enabled !== false}
                                                        onChange={e => handleUpdateRule({ enabled: e.target.checked })}
                                                        id="ruleEnabled"
                                                    />
                                                    <label htmlFor="ruleEnabled">Regra Ativa</label>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {/* Test Results */}
                                {testResult && (
                                    <div className={styles.testResults}>
                                        <div className={styles.testResultsHeader}>
                                            <h4>
                                                {testResult.success ? <Check size={16} /> : <X size={16} />}
                                                Resultado do Teste
                                            </h4>
                                            <button onClick={() => setTestResult(null)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <div className={styles.testResultsBody}>
                                            <div className={styles.testSteps}>
                                                <h5>Passos Executados:</h5>
                                                {testResult.steps.map((step, i) => (
                                                    <div key={i} className={styles.testStep}>
                                                        <span className={styles.testStepNode}>{step.node}</span>
                                                        <span>{step.result}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.testChanges}>
                                                <h5>Alterações:</h5>
                                                {testResult.changes.map((change, i) => (
                                                    <div key={i} className={styles.testChange}>
                                                        <code>{change.field}</code>
                                                        <span>{change.from} → {change.to}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.noSelection}>
                        <GitBranch size={48} />
                        <h3>Nenhuma regra selecionada</h3>
                        <p>Selecione uma regra na lista ou crie uma nova</p>
                        <button className={styles.createButton} onClick={handleAddRule}>
                            <Plus size={18} />
                            Criar Regra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
