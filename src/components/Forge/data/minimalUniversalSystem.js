/**
 * Sistema Mínimo Universal - Template Base para o Forge Engine
 * 
 * Um sistema esqueleto que demonstra todas as capacidades da engine
 * sem ser específico para nenhum gênero. Ideal para customização.
 */

export const MINIMAL_UNIVERSAL_SYSTEM = {
    id: null,
    metadata: {
        name: 'Sistema Mínimo Universal',
        description: 'Um esqueleto de sistema para demonstrar a engine Forge. Customize para criar seu próprio RPG.',
        version: '1.0.0',
        author: 'Lumen Forge',
        icon: '⚙️',
        genre: ['universal'],
        tags: ['minimal', 'template', 'universal']
    },

    // ============================================================
    // FIELDS - Os blocos de dados do sistema
    // ============================================================
    fields: [
        // === ATRIBUTOS PRIMÁRIOS ===
        {
            id: 'field_corpo',
            codeId: 'corpo',
            name: 'Corpo',
            type: 'number',
            category: 'attributes',
            description: 'Força física, resistência, vitalidade',
            icon: '💪',
            defaultValue: 10,
            min: 1,
            max: 20,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#ef4444', showBar: true },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: true, triggers: [] },
            display: { mode: 'attribute_block', showLabel: true, showOnSheet: true, gridSize: 1, color: '#ef4444' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_mente',
            codeId: 'mente',
            name: 'Mente',
            type: 'number',
            category: 'attributes',
            description: 'Inteligência, raciocínio, memória',
            icon: '🧠',
            defaultValue: 10,
            min: 1,
            max: 20,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#3b82f6', showBar: true },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: true, triggers: [] },
            display: { mode: 'attribute_block', showLabel: true, showOnSheet: true, gridSize: 1, color: '#3b82f6' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_espirito',
            codeId: 'espirito',
            name: 'Espírito',
            type: 'number',
            category: 'attributes',
            description: 'Vontade, carisma, intuição',
            icon: '✨',
            defaultValue: 10,
            min: 1,
            max: 20,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#8b5cf6', showBar: true },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: true, triggers: [] },
            display: { mode: 'attribute_block', showLabel: true, showOnSheet: true, gridSize: 1, color: '#8b5cf6' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },

        // === RECURSOS ===
        {
            id: 'field_vida',
            codeId: 'vida',
            name: 'Vida',
            type: 'resource',
            category: 'resources',
            description: 'Pontos de vida do personagem',
            icon: '❤️',
            defaultValue: 20,
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: {
                maxFormula: '{corpo} * 2',
                currentFormula: '',
                allowOverflow: false,
                allowNegative: false,
                barColor: '#ef4444',
                showBar: true
            },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: false, triggers: ['onZero', 'onDecrease'] },
            display: { mode: 'bar', showLabel: true, showOnSheet: true, gridSize: 2, color: '#ef4444' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_energia',
            codeId: 'energia',
            name: 'Energia',
            type: 'resource',
            category: 'resources',
            description: 'Pontos de energia para habilidades',
            icon: '⚡',
            defaultValue: 10,
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: {
                maxFormula: '{mente} + {espirito}',
                currentFormula: '',
                allowOverflow: false,
                allowNegative: false,
                barColor: '#3b82f6',
                showBar: true
            },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: false, triggers: ['onZero'] },
            display: { mode: 'bar', showLabel: true, showOnSheet: true, gridSize: 2, color: '#3b82f6' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },

        // === COMBATE ===
        {
            id: 'field_defesa',
            codeId: 'defesa',
            name: 'Defesa',
            type: 'computed',
            category: 'combat',
            description: 'Dificuldade para ser atingido',
            icon: '🛡️',
            defaultValue: 0,
            min: null,
            max: null,
            step: 1,
            roundMode: 'floor',
            formula: '10 + floor({corpo} / 2)',
            showFormulaTooltip: true,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#6b7280', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: false, triggers: [] },
            display: { mode: 'number', showLabel: true, showOnSheet: true, gridSize: 1, color: '#6b7280' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: true, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_iniciativa',
            codeId: 'iniciativa',
            name: 'Iniciativa',
            type: 'computed',
            category: 'combat',
            description: 'Ordem de ação em combate',
            icon: '⚡',
            defaultValue: 0,
            min: null,
            max: null,
            step: 1,
            roundMode: 'floor',
            formula: 'floor({mente} / 2)',
            showFormulaTooltip: true,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#f59e0b', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: true, triggers: [] },
            display: { mode: 'number', showLabel: true, showOnSheet: true, gridSize: 1, color: '#f59e0b' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: true, hidden: false, scope: 'entity', priority: 0 }
        },

        // === DADOS ===
        {
            id: 'field_dado_ataque',
            codeId: 'dado_ataque',
            name: 'Dado de Ataque',
            type: 'dice',
            category: 'combat',
            description: 'Dado rolado para atacar (1d20)',
            icon: '🎯',
            defaultValue: 0,
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#ef4444', showBar: false },
            dice: { formula: '1d20', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: false, rollable: true, triggers: [] },
            display: { mode: 'dice', showLabel: true, showOnSheet: true, gridSize: 1, color: '#f59e0b' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_dado_dano',
            codeId: 'dado_dano',
            name: 'Dado de Dano',
            type: 'dice',
            category: 'combat',
            description: 'Dado rolado para calcular dano',
            icon: '💥',
            defaultValue: 0,
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#ef4444', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: true, triggers: [] },
            display: { mode: 'dice', showLabel: true, showOnSheet: true, gridSize: 1, color: '#ef4444' },
            validation: { required: false, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },

        // === INFO ===
        {
            id: 'field_nome',
            codeId: 'nome',
            name: 'Nome',
            type: 'text',
            category: 'info',
            description: 'Nome do personagem',
            icon: '📝',
            defaultValue: '',
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#ef4444', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: 50, markdown: false, placeholder: 'Nome do personagem' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: false, rollable: false, triggers: [] },
            display: { mode: 'text', showLabel: true, showOnSheet: true, gridSize: 2, color: null },
            validation: { required: true, integer: false, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_conceito',
            codeId: 'conceito',
            name: 'Conceito',
            type: 'text',
            category: 'info',
            description: 'Descrição breve do personagem',
            icon: '💭',
            defaultValue: '',
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#ef4444', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: 100, markdown: false, placeholder: 'Ex: Guerreiro anão honrado' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: false, rollable: false, triggers: [] },
            display: { mode: 'text', showLabel: true, showOnSheet: true, gridSize: 2, color: null },
            validation: { required: false, integer: false, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_nivel',
            codeId: 'nivel',
            name: 'Nível',
            type: 'number',
            category: 'info',
            description: 'Nível de poder do personagem',
            icon: '📊',
            defaultValue: 1,
            min: 1,
            max: 20,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#ef4444', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: false, rollable: false, triggers: ['onUpdate'] },
            display: { mode: 'number', showLabel: true, showOnSheet: true, gridSize: 1, color: '#8b5cf6' },
            validation: { required: true, integer: true, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },

        // === BOOLEAN ===
        {
            id: 'field_ferido',
            codeId: 'ferido',
            name: 'Ferido',
            type: 'boolean',
            category: 'combat',
            description: 'Se está com ferimento grave',
            icon: '🩹',
            defaultValue: false,
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#ef4444', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: false, triggers: [] },
            display: { mode: 'checkbox', showLabel: true, showOnSheet: true, gridSize: 1, color: '#ef4444' },
            validation: { required: false, integer: false, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        },
        {
            id: 'field_inspirado',
            codeId: 'inspirado',
            name: 'Inspirado',
            type: 'boolean',
            category: 'resources',
            description: 'Pode re-rolar um teste',
            icon: '🌟',
            defaultValue: false,
            min: null,
            max: null,
            step: 1,
            roundMode: null,
            formula: '',
            showFormulaTooltip: false,
            resource: { maxFormula: '', currentFormula: '', allowOverflow: false, allowNegative: false, barColor: '#f59e0b', showBar: false },
            dice: { formula: '1d6', exploding: false, autoRoll: false },
            text: { multiline: false, maxLength: null, markdown: false, placeholder: '' },
            options: [],
            list: { itemType: 'text', maxItems: null },
            behavior: { modifiable: true, rollable: false, triggers: [] },
            display: { mode: 'checkbox', showLabel: true, showOnSheet: true, gridSize: 1, color: '#f59e0b' },
            validation: { required: false, integer: false, pattern: null },
            meta: { tags: [], readonly: false, hidden: false, scope: 'entity', priority: 0 }
        }
    ],

    // ============================================================
    // ENTITY TYPES - Tipos de "coisas" no sistema
    // ============================================================
    entityTypes: [
        {
            id: 'entity_personagem',
            codeId: 'personagem',
            name: 'Personagem',
            namePlural: 'Personagens',
            icon: '👤',
            description: 'Um personagem jogável ou NPC',
            category: 'player',
            fields: [
                { fieldId: 'field_nome', label: null, required: true, visibility: 'all', editableBy: 'owner', group: '' },
                { fieldId: 'field_conceito', label: null, required: false, visibility: 'all', editableBy: 'owner', group: '' },
                { fieldId: 'field_nivel', label: null, required: true, visibility: 'all', editableBy: 'master', group: '' },
                { fieldId: 'field_corpo', label: null, required: true, visibility: 'all', editableBy: 'owner', group: 'atributos' },
                { fieldId: 'field_mente', label: null, required: true, visibility: 'all', editableBy: 'owner', group: 'atributos' },
                { fieldId: 'field_espirito', label: null, required: true, visibility: 'all', editableBy: 'owner', group: 'atributos' },
                { fieldId: 'field_vida', label: null, required: true, visibility: 'all', editableBy: 'owner', group: 'recursos' },
                { fieldId: 'field_energia', label: null, required: true, visibility: 'all', editableBy: 'owner', group: 'recursos' },
                { fieldId: 'field_defesa', label: null, required: false, visibility: 'all', editableBy: 'system', group: 'combate' },
                { fieldId: 'field_iniciativa', label: null, required: false, visibility: 'all', editableBy: 'system', group: 'combate' },
                { fieldId: 'field_ferido', label: null, required: false, visibility: 'all', editableBy: 'owner', group: 'status' },
                { fieldId: 'field_inspirado', label: null, required: false, visibility: 'all', editableBy: 'master', group: 'status' }
            ],
            behaviors: {
                playerControlled: true,
                showInMainList: true,
                participatesInCombat: true,
                canBeTargeted: true,
                canOwnEntities: true,
                ownableTypes: ['entity_item'],
                stackable: false,
                uniquePerPlayer: false
            },
            layout: {
                template: 'default',
                titleField: 'field_nome',
                avatarField: ''
            }
        },
        {
            id: 'entity_item',
            codeId: 'item',
            name: 'Item',
            namePlural: 'Itens',
            icon: '📦',
            description: 'Um objeto, equipamento ou consumível',
            category: 'item',
            fields: [
                { fieldId: 'field_nome', label: null, required: true, visibility: 'all', editableBy: 'owner', group: '' }
            ],
            behaviors: {
                playerControlled: false,
                showInMainList: false,
                participatesInCombat: false,
                canBeTargeted: false,
                canOwnEntities: false,
                ownableTypes: [],
                stackable: true,
                uniquePerPlayer: false
            },
            layout: {
                template: 'compact',
                titleField: 'field_nome',
                avatarField: ''
            }
        }
    ],

    // ============================================================
    // EVENTS - Gatilhos que disparam automações
    // ============================================================
    events: [
        {
            id: 'event_testar_atributo',
            codeId: 'testar_atributo',
            name: 'Testar Atributo',
            icon: '🎲',
            category: 'dice',
            description: 'Rola 1d20 + modificador do atributo',
            native: false,
            enabled: true,
            scope: {
                entityTypes: ['entity_personagem'],
                fields: ['field_corpo', 'field_mente', 'field_espirito']
            },
            trigger: {
                type: 'manual',
                fieldId: '',
                operator: 'eq',
                value: '',
                conditions: []
            },
            payload: {
                includeField: true,
                includeEntity: true,
                customFields: []
            }
        },
        {
            id: 'event_atacar',
            codeId: 'atacar',
            name: 'Atacar',
            icon: '⚔️',
            category: 'combat',
            description: 'Realiza um ataque contra um alvo',
            native: false,
            enabled: true,
            scope: {
                entityTypes: ['entity_personagem'],
                fields: []
            },
            trigger: {
                type: 'manual',
                fieldId: '',
                operator: 'eq',
                value: '',
                conditions: []
            },
            payload: {
                includeField: false,
                includeEntity: true,
                customFields: ['target_id']
            }
        },
        {
            id: 'event_receber_dano',
            codeId: 'receber_dano',
            name: 'Receber Dano',
            icon: '💥',
            category: 'combat',
            description: 'Quando o personagem recebe dano',
            native: false,
            enabled: true,
            scope: {
                entityTypes: ['entity_personagem'],
                fields: ['field_vida']
            },
            trigger: {
                type: 'fieldChange',
                fieldId: 'field_vida',
                operator: 'lt',
                value: '',
                conditions: []
            },
            payload: {
                includeField: true,
                includeEntity: true,
                customFields: ['damage_amount']
            }
        },
        {
            id: 'event_curar',
            codeId: 'curar',
            name: 'Curar',
            icon: '💚',
            category: 'combat',
            description: 'Quando o personagem é curado',
            native: false,
            enabled: true,
            scope: {
                entityTypes: ['entity_personagem'],
                fields: ['field_vida']
            },
            trigger: {
                type: 'fieldChange',
                fieldId: 'field_vida',
                operator: 'gt',
                value: '',
                conditions: []
            },
            payload: {
                includeField: true,
                includeEntity: true,
                customFields: []
            }
        },
        {
            id: 'event_morrer',
            codeId: 'morrer',
            name: 'Morrer',
            icon: '💀',
            category: 'combat',
            description: 'Quando vida chega a zero',
            native: false,
            enabled: true,
            scope: {
                entityTypes: ['entity_personagem'],
                fields: ['field_vida']
            },
            trigger: {
                type: 'comparison',
                fieldId: 'field_vida',
                operator: 'lte',
                value: '0',
                conditions: []
            },
            payload: {
                includeField: true,
                includeEntity: true,
                customFields: []
            }
        }
    ],

    // ============================================================
    // RULES - Automações "Quando X → faça Y"
    // ============================================================
    rules: [
        {
            id: 'rule_vida_zero',
            codeId: 'vida_50_ferido',
            name: 'Vida 50% = Ferido',
            icon: '🩹',
            category: 'combat',
            description: 'Quando vida chegar a 50% ou menos, marca como Ferido',
            enabled: true,
            priority: 1,
            nodes: [
                {
                    id: 'node_trigger_1',
                    type: 'event',
                    x: 50,
                    y: 150,
                    config: { eventId: 'event_receber_dano' },
                    connections: ['node_check_1']
                },
                {
                    id: 'node_check_1',
                    type: 'condition',
                    x: 250,
                    y: 150,
                    config: {
                        field: 'field_vida',
                        operator: 'lte',
                        value: '50%'
                    },
                    connections: ['node_action_1']
                },
                {
                    id: 'node_action_1',
                    type: 'action',
                    x: 450,
                    y: 150,
                    config: {
                        actionType: 'setValue',
                        field: 'field_ferido',
                        value: 'true'
                    },
                    connections: []
                }
            ]
        },
        {
            id: 'rule_curar_ferido',
            codeId: 'curar_remove_ferido',
            name: 'Curar Remove Ferido',
            icon: '💚',
            category: 'combat',
            description: 'Quando vida passar de 50%, remove Ferido',
            enabled: true,
            priority: 1,
            nodes: [
                {
                    id: 'node_trigger_2',
                    type: 'event',
                    x: 50,
                    y: 150,
                    config: { eventId: 'event_curar' },
                    connections: ['node_check_2']
                },
                {
                    id: 'node_check_2',
                    type: 'condition',
                    x: 250,
                    y: 150,
                    config: {
                        field: 'field_vida',
                        operator: 'gt',
                        value: '50%'
                    },
                    connections: ['node_action_2']
                },
                {
                    id: 'node_action_2',
                    type: 'action',
                    x: 450,
                    y: 150,
                    config: {
                        actionType: 'setValue',
                        field: 'field_ferido',
                        value: 'false'
                    },
                    connections: []
                }
            ]
        }
    ],

    // ============================================================
    // LAYOUTS - Estrutura visual das fichas (esqueleto)
    // ============================================================
    // ============================================================
    // LAYOUTS - Estrutura visual das fichas (esqueleto)
    // ============================================================
    layout: {
        projectAssets: [],
        projectFolders: [
            { id: 'root', name: 'Project', parentId: null },
            { id: 'presets', name: 'Presets', parentId: 'root' },
            { id: 'components', name: 'Components', parentId: 'root' }
        ],
        scenes: [
            {
                id: 'scene_main',
                name: 'Ficha Principal',
                widgets: [
                    {
                        id: 'root_panel',
                        type: 'panel',
                        name: 'Fundo',
                        x: 0,
                        y: 0,
                        w: 800,
                        h: 600,
                        props: {
                            backgroundColor: '#111827',
                            backgroundAlpha: 1,
                            borderRadius: 0,
                            padding: 24
                        },
                        widgets: [
                            // HEADER
                            {
                                id: 'header_panel',
                                type: 'panel',
                                name: 'Header',
                                x: 24,
                                y: 24,
                                w: 752,
                                h: 80,
                                props: {
                                    backgroundColor: '#1f2937',
                                    borderRadius: 12,
                                    borderAlpha: 0.1
                                },
                                widgets: [
                                    {
                                        id: 'char_name',
                                        type: 'attributeDisplay',
                                        name: 'Nome',
                                        x: 16,
                                        y: 16,
                                        w: 300,
                                        h: 48,
                                        props: {
                                            fieldId: 'field_nome',
                                            layout: 'card',
                                            showLabel: true,
                                            accentColor: '#fbbf24'
                                        }
                                    },
                                    {
                                        id: 'char_level',
                                        type: 'attributeDisplay',
                                        name: 'Nível',
                                        x: 680,
                                        y: 16,
                                        w: 56,
                                        h: 48,
                                        props: {
                                            fieldId: 'field_nivel',
                                            layout: 'circle',
                                            showLabel: true,
                                            accentColor: '#8b5cf6'
                                        }
                                    }
                                ]
                            },

                            // COLUNA 1 - ATRIBUTOS
                            {
                                id: 'col_attributes',
                                type: 'panel',
                                name: 'Atributos',
                                x: 24,
                                y: 120,
                                w: 200,
                                h: 456,
                                props: {
                                    backgroundColor: '#1f2937',
                                    borderRadius: 12,
                                    borderAlpha: 0.1
                                },
                                widgets: [
                                    {
                                        id: 'attr_corpo',
                                        type: 'attributeDisplay',
                                        name: 'Corpo',
                                        x: 16,
                                        y: 16,
                                        w: 168,
                                        h: 80,
                                        props: {
                                            fieldId: 'field_corpo',
                                            showModifier: true,
                                            modifierFormula: 'floor((value - 10) / 2)',
                                            layout: 'card',
                                            accentColor: '#ef4444'
                                        }
                                    },
                                    {
                                        id: 'attr_mente',
                                        type: 'attributeDisplay',
                                        name: 'Mente',
                                        x: 16,
                                        y: 112,
                                        w: 168,
                                        h: 80,
                                        props: {
                                            fieldId: 'field_mente',
                                            showModifier: true,
                                            modifierFormula: 'floor((value - 10) / 2)',
                                            layout: 'card',
                                            accentColor: '#3b82f6'
                                        }
                                    },
                                    {
                                        id: 'attr_espirito',
                                        type: 'attributeDisplay',
                                        name: 'Espírito',
                                        x: 16,
                                        y: 208,
                                        w: 168,
                                        h: 80,
                                        props: {
                                            fieldId: 'field_espirito',
                                            showModifier: true,
                                            modifierFormula: 'floor((value - 10) / 2)',
                                            layout: 'card',
                                            accentColor: '#8b5cf6'
                                        }
                                    }
                                ]
                            },

                            // COLUNA 2 - RECURSOS & COMBATE
                            {
                                id: 'col_center',
                                type: 'panel',
                                name: 'Centro',
                                x: 240,
                                y: 120,
                                w: 320,
                                h: 456,
                                props: {
                                    backgroundColor: 'transparent',
                                    borderAlpha: 0
                                },
                                widgets: [
                                    {
                                        id: 'res_vida',
                                        type: 'resourceBar',
                                        name: 'Vida',
                                        x: 0,
                                        y: 0,
                                        w: 320,
                                        h: 64,
                                        props: {
                                            fieldId: 'field_vida',
                                            barColor: '#ef4444',
                                            showNumbers: true
                                        }
                                    },
                                    {
                                        id: 'res_energia',
                                        type: 'resourceBar',
                                        name: 'Energia',
                                        x: 0,
                                        y: 80,
                                        w: 320,
                                        h: 64,
                                        props: {
                                            fieldId: 'field_energia',
                                            barColor: '#3b82f6',
                                            showNumbers: true
                                        }
                                    },
                                    {
                                        id: 'panel_defesa',
                                        type: 'panel',
                                        name: 'Status',
                                        x: 0,
                                        y: 160,
                                        w: 320,
                                        h: 120,
                                        props: {
                                            backgroundColor: '#1f2937',
                                            borderRadius: 12
                                        },
                                        widgets: [
                                            {
                                                id: 'stat_defesa',
                                                type: 'attributeDisplay',
                                                name: 'Defesa',
                                                x: 16,
                                                y: 20,
                                                w: 80,
                                                h: 80,
                                                props: { fieldId: 'field_defesa', layout: 'circle', accentColor: '#6b7280' }
                                            },
                                            {
                                                id: 'stat_iniciativa',
                                                type: 'attributeDisplay',
                                                name: 'Iniciativa',
                                                x: 112,
                                                y: 20,
                                                w: 80,
                                                h: 80,
                                                props: { fieldId: 'field_iniciativa', layout: 'circle', accentColor: '#f59e0b' }
                                            },
                                            {
                                                id: 'stat_ferido',
                                                type: 'attributeDisplay',
                                                name: 'Ferido',
                                                x: 208,
                                                y: 20,
                                                w: 96,
                                                h: 40,
                                                props: { fieldId: 'field_ferido', layout: 'compact', accentColor: '#ef4444' }
                                            },
                                            {
                                                id: 'stat_inspirado',
                                                type: 'attributeDisplay',
                                                name: 'Inspirado',
                                                x: 208,
                                                y: 70,
                                                w: 96,
                                                h: 40,
                                                props: { fieldId: 'field_inspirado', layout: 'compact', accentColor: '#f59e0b' }
                                            }
                                        ]
                                    }
                                ]
                            },

                            // COLUNA 3 - AÇÕES
                            {
                                id: 'col_actions',
                                type: 'panel',
                                name: 'Ações',
                                x: 576,
                                y: 120,
                                w: 200,
                                h: 456,
                                props: {
                                    backgroundColor: '#1f2937',
                                    borderRadius: 12,
                                    borderAlpha: 0.1
                                },
                                widgets: [
                                    {
                                        id: 'btn_attack',
                                        type: 'diceButton',
                                        name: 'Atacar',
                                        x: 16,
                                        y: 16,
                                        w: 168,
                                        h: 64,
                                        props: {
                                            eventId: 'event_atacar',
                                            label: 'Atacar',
                                            accentColor: '#ef4444'
                                        }
                                    },
                                    {
                                        id: 'btn_damage',
                                        type: 'diceButton',
                                        name: 'Dano',
                                        x: 16,
                                        y: 96,
                                        w: 168,
                                        h: 64,
                                        props: {
                                            eventId: 'event_receber_dano', // Simplificado para demo
                                            label: 'Rolar Dano',
                                            accentColor: '#f59e0b'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

export default MINIMAL_UNIVERSAL_SYSTEM;
