/**
 * System Templates - Dados pré-configurados para criar sistemas rapidamente
 */

// Schema version for compatibility checking
const CURRENT_SCHEMA_VERSION = '2.0.0';

import { MINIMAL_UNIVERSAL_SYSTEM } from './minimalUniversalSystem';

// ============================================================
// TEMPLATE: D&D 5e COMPLETO
// ============================================================
export const DND_TEMPLATE = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    metadata: {
        name: 'Meu Sistema D&D 5e',
        description: 'Sistema completo baseado em D&D 5ª Edição com atributos, perícias, classes, raças e mecânicas de combate.',
        genre: ['fantasy', 'adventure'],
        complexity: 'moderate',
        tags: ['d20', 'fantasy', 'classes', 'races', 'd&d', '5e'],
        icon: '⚔️'
    },

    // === ATRIBUTOS ===
    attributes: [
        // Atributos Primários
        {
            id: 'attr-str', name: 'Força', shortName: 'FOR',
            type: 'numeric', attributeType: 'numeric',
            min: 1, max: 30, default: 10,
            modifierTemplate: 'dnd', modifierFormula: '(value - 10) / 2',
            color: '#ef4444', tier: 'primary',
            description: 'Poder físico bruto, capacidade atlética e força de ataque corpo a corpo.',
            showOnSheet: true, showModifier: true, editable: true,
            connections: [], levelCaps: []
        },
        {
            id: 'attr-dex', name: 'Destreza', shortName: 'DES',
            type: 'numeric', attributeType: 'numeric',
            min: 1, max: 30, default: 10,
            modifierTemplate: 'dnd', modifierFormula: '(value - 10) / 2',
            color: '#22c55e', tier: 'primary',
            description: 'Agilidade, reflexos, equilíbrio e precisão.',
            showOnSheet: true, showModifier: true, editable: true,
            connections: [], levelCaps: []
        },
        {
            id: 'attr-con', name: 'Constituição', shortName: 'CON',
            type: 'numeric', attributeType: 'numeric',
            min: 1, max: 30, default: 10,
            modifierTemplate: 'dnd', modifierFormula: '(value - 10) / 2',
            color: '#f59e0b', tier: 'primary',
            description: 'Saúde, resistência, vigor e vitalidade.',
            showOnSheet: true, showModifier: true, editable: true,
            connections: [], levelCaps: []
        },
        {
            id: 'attr-int', name: 'Inteligência', shortName: 'INT',
            type: 'numeric', attributeType: 'numeric',
            min: 1, max: 30, default: 10,
            modifierTemplate: 'dnd', modifierFormula: '(value - 10) / 2',
            color: '#3b82f6', tier: 'primary',
            description: 'Raciocínio, memória, lógica e capacidade de aprendizado.',
            showOnSheet: true, showModifier: true, editable: true,
            connections: [], levelCaps: []
        },
        {
            id: 'attr-wis', name: 'Sabedoria', shortName: 'SAB',
            type: 'numeric', attributeType: 'numeric',
            min: 1, max: 30, default: 10,
            modifierTemplate: 'dnd', modifierFormula: '(value - 10) / 2',
            color: '#8b5cf6', tier: 'primary',
            description: 'Percepção, intuição, discernimento e força de vontade.',
            showOnSheet: true, showModifier: true, editable: true,
            connections: [], levelCaps: []
        },
        {
            id: 'attr-cha', name: 'Carisma', shortName: 'CAR',
            type: 'numeric', attributeType: 'numeric',
            min: 1, max: 30, default: 10,
            modifierTemplate: 'dnd', modifierFormula: '(value - 10) / 2',
            color: '#ec4899', tier: 'primary',
            description: 'Força de personalidade, presença, liderança e eloquência.',
            showOnSheet: true, showModifier: true, editable: true,
            connections: [], levelCaps: []
        },

        // Atributos Derivados
        {
            id: 'attr-hp', name: 'Pontos de Vida', shortName: 'PV',
            type: 'pool', attributeType: 'pool',
            min: 0, max: 999, default: 10,
            formula: null, // Calculado via classe no CharacterSheet
            modifierTemplate: 'linear', modifierFormula: 'value',
            color: '#dc2626', tier: 'derived',
            description: 'Vitalidade do personagem. Calculado: Dado de Vida + mod.CON por nível.',
            showOnSheet: true, showModifier: false, editable: false,
            connections: [{ attributeId: 'attr-con', multiplier: 1, operation: 'add' }],
            levelCaps: []
        },
        {
            id: 'attr-ac', name: 'Classe de Armadura', shortName: 'CA',
            type: 'numeric', attributeType: 'numeric',
            min: 0, max: 30, default: 10,
            modifierTemplate: 'linear', modifierFormula: 'value',
            color: '#6b7280', tier: 'derived',
            description: 'Dificuldade para ser atingido. Base: 10 + mod.DES + bônus de armadura.',
            showOnSheet: true, showModifier: false, editable: false,
            connections: [{ attributeId: 'attr-dex', multiplier: 1, operation: 'add' }],
            levelCaps: []
        },
        {
            id: 'attr-init', name: 'Iniciativa', shortName: 'INI',
            type: 'numeric', attributeType: 'numeric',
            min: -10, max: 30, default: 0,
            modifierTemplate: 'linear', modifierFormula: 'value',
            color: '#0ea5e9', tier: 'derived',
            description: 'Determina ordem de turno em combate. Base: mod.DES.',
            showOnSheet: true, showModifier: false, editable: false,
            connections: [{ attributeId: 'attr-dex', multiplier: 1, operation: 'add' }],
            levelCaps: []
        },
        {
            id: 'attr-prof', name: 'Bônus de Proficiência', shortName: 'PRO',
            type: 'numeric', attributeType: 'numeric',
            min: 2, max: 6, default: 2,
            modifierTemplate: 'linear', modifierFormula: 'value',
            color: '#a855f7', tier: 'derived',
            description: 'Bônus adicionado a testes em que você é proficiente. Aumenta por nível.',
            showOnSheet: true, showModifier: false, editable: false,
            connections: [],
            levelCaps: [
                { level: 1, maxValue: 2 }, { level: 5, maxValue: 3 },
                { level: 9, maxValue: 4 }, { level: 13, maxValue: 5 },
                { level: 17, maxValue: 6 }
            ]
        },
        {
            id: 'attr-speed', name: 'Deslocamento', shortName: 'DES',
            type: 'numeric', attributeType: 'numeric',
            min: 0, max: 120, default: 30,
            modifierTemplate: 'linear', modifierFormula: 'value',
            color: '#14b8a6', tier: 'derived',
            description: 'Distância em pés (ft) que você pode se mover por turno.',
            showOnSheet: true, showModifier: false, editable: true,
            connections: [], levelCaps: []
        }
    ],

    // === REGRAS DE GERAÇÃO DE ATRIBUTOS ===
    attributeGeneration: {
        methods: {
            pointBuy: { enabled: true, points: 27 },
            standardArray: { enabled: true, values: [15, 14, 13, 12, 10, 8] },
            roll: { enabled: true, formula: '4d6kh3' },
            free: { enabled: false }
        },
        limits: { min: 8, max: 15 },
        pointBuyCosts: { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
    },

    // === PERÍCIAS ===
    proficiencies: [
        // Força
        { id: 'prof-athletics', name: 'Atletismo', description: 'Corrida, escalada, natação e proezas físicas.', attributeId: 'attr-str', category: 'physical', requiresTraining: false },
        // Destreza
        { id: 'prof-acrobatics', name: 'Acrobacia', description: 'Equilíbrio, manobras acrobáticas e quedas controladas.', attributeId: 'attr-dex', category: 'physical', requiresTraining: false },
        { id: 'prof-sleight', name: 'Prestidigitação', description: 'Truques de mão, furtar objetos e esconder itens.', attributeId: 'attr-dex', category: 'stealth', requiresTraining: true },
        { id: 'prof-stealth', name: 'Furtividade', description: 'Mover-se silenciosamente e esconder-se.', attributeId: 'attr-dex', category: 'stealth', requiresTraining: false },
        // Inteligência
        { id: 'prof-arcana', name: 'Arcanismo', description: 'Conhecimento sobre magia, planos e tradições arcanas.', attributeId: 'attr-int', category: 'knowledge', requiresTraining: true },
        { id: 'prof-history', name: 'História', description: 'Conhecimento sobre eventos históricos e civilizações.', attributeId: 'attr-int', category: 'knowledge', requiresTraining: true },
        { id: 'prof-investigation', name: 'Investigação', description: 'Deduzir pistas, buscar informações e resolver mistérios.', attributeId: 'attr-int', category: 'mental', requiresTraining: false },
        { id: 'prof-nature', name: 'Natureza', description: 'Conhecimento sobre fauna, flora, clima e terrenos.', attributeId: 'attr-int', category: 'knowledge', requiresTraining: true },
        { id: 'prof-religion', name: 'Religião', description: 'Conhecimento sobre deidades, rituais e organizações religiosas.', attributeId: 'attr-int', category: 'knowledge', requiresTraining: true },
        // Sabedoria
        { id: 'prof-animal', name: 'Lidar com Animais', description: 'Acalmar, treinar e entender comportamento animal.', attributeId: 'attr-wis', category: 'social', requiresTraining: false },
        { id: 'prof-insight', name: 'Intuição', description: 'Detectar mentiras e discernir intenções ocultas.', attributeId: 'attr-wis', category: 'social', requiresTraining: false },
        { id: 'prof-medicine', name: 'Medicina', description: 'Estabilizar feridos, diagnosticar doenças e tratar venenos.', attributeId: 'attr-wis', category: 'knowledge', requiresTraining: true },
        { id: 'prof-perception', name: 'Percepção', description: 'Notar detalhes, ouvir sons e identificar perigos.', attributeId: 'attr-wis', category: 'mental', requiresTraining: false },
        { id: 'prof-survival', name: 'Sobrevivência', description: 'Rastrear criaturas, caçar, navegar e sobreviver na natureza.', attributeId: 'attr-wis', category: 'physical', requiresTraining: false },
        // Carisma
        { id: 'prof-deception', name: 'Enganação', description: 'Mentir convincentemente e ocultar a verdade.', attributeId: 'attr-cha', category: 'social', requiresTraining: false },
        { id: 'prof-intimidation', name: 'Intimidação', description: 'Influenciar através de ameaças e demonstração de força.', attributeId: 'attr-cha', category: 'social', requiresTraining: false },
        { id: 'prof-performance', name: 'Atuação', description: 'Entreter, atuar, cantar e tocar instrumentos.', attributeId: 'attr-cha', category: 'social', requiresTraining: false },
        { id: 'prof-persuasion', name: 'Persuasão', description: 'Influenciar com diplomacia, tato e boas maneiras.', attributeId: 'attr-cha', category: 'social', requiresTraining: false }
    ],

    // === DADOS ===
    dice: {
        available: ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'],
        primary: 'd20',
        customDice: []
    },
    // === HABILIDADES (Magias e Poderes) ===
    skills: [
        // Truques
        { id: 'skill-firebolt', name: 'Rajada de Fogo', description: 'Projétil de fogo: 1d10 dano (aumenta por nível).', category: 'Evocação', icon: '🔥', tags: ['truque', 'fogo'], color: '#ef4444', source: 'choice', skillType: 'spell', spellSchool: 'evocation', baseEffects: [{ type: 'damage', subtype: 'fire', rank: 1 }], mechanics: { range: 'ranged_long', duration: 'instant', actionType: 'standard', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 1 }, costs: { activation: { resource: 'none', amount: 0 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'attack', baseAttribute: 'attr-int', bonus: 0, diceFormula: '1d10', dc: 0, criticalEffect: 'Dano dobrado', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 17, scaling: { diceFormula: '{{level}}d10' }, levels: [{ level: 5, description: '+1d10 dano', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }, { level: 11, description: '+1d10 dano', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }, { level: 17, description: '+1d10 dano', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }], branches: [] } },
        { id: 'skill-light', name: 'Luz', description: 'Objeto brilha como tocha por 1 hora.', category: 'Evocação', icon: '💡', tags: ['truque', 'utilidade'], color: '#fbbf24', source: 'choice', skillType: 'spell', spellSchool: 'evocation', baseEffects: [{ type: 'feature', subtype: 'custom', rank: 1 }], mechanics: { range: 'touch', duration: 'hours', actionType: 'standard', areaEffect: { type: 'sphere', radius: 20 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 1 }, costs: { activation: { resource: 'none', amount: 0 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'none', baseAttribute: '', bonus: 0, diceFormula: '', dc: 0, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: false, maxLevel: 1, levels: [], branches: [] } },
        // 1º Nível
        { id: 'skill-magic-missile', name: 'Mísseis Mágicos', description: '3 dardos de força (1d4+1 cada), acerto automático.', category: 'Evocação', icon: '✨', tags: ['1º nível', 'força'], color: '#8b5cf6', source: 'choice', skillType: 'spell', spellSchool: 'evocation', baseEffects: [{ type: 'damage', subtype: 'force', rank: 3 }], mechanics: { range: 'ranged_long', duration: 'instant', actionType: 'standard', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 1 }, costs: { activation: { resource: 'spell_slot', amount: 1 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'none', baseAttribute: '', bonus: 0, diceFormula: '3d4+3', dc: 0, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 9, scaling: { diceFormula: '{{slot+2}}d4+{{slot+2}}' }, levels: [{ level: 2, description: '+1 míssil (4 total)', effects: [{ type: 'targets', value: 1 }] }, { level: 3, description: '+1 míssil (5 total)', effects: [{ type: 'targets', value: 1 }] }], branches: [] } },
        { id: 'skill-cure-wounds', name: 'Curar Ferimentos', description: 'Toque restaura 1d8 + mod.SAB PV.', category: 'Evocação', icon: '❤️', tags: ['1º nível', 'cura'], color: '#22c55e', source: 'choice', skillType: 'spell', spellSchool: 'evocation', baseEffects: [{ type: 'healing', subtype: 'standard', rank: 1 }], mechanics: { range: 'touch', duration: 'instant', actionType: 'standard', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 1 }, costs: { activation: { resource: 'spell_slot', amount: 1 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'healing', baseAttribute: 'attr-wis', bonus: 0, diceFormula: '1d8', dc: 0, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 9, scaling: { diceFormula: '{{slot}}d8' }, levels: [{ level: 2, description: '+1d8 cura', effects: [{ type: 'dice_bonus', target: 'healing', value: 1 }] }], branches: [] } },
        { id: 'skill-shield', name: 'Escudo', description: 'Reação: +5 CA até próximo turno.', category: 'Abjuração', icon: '🛡️', tags: ['1º nível', 'defesa', 'reação'], color: '#3b82f6', source: 'choice', skillType: 'spell', spellSchool: 'abjuration', baseEffects: [{ type: 'protection', subtype: 'dodge', rank: 5 }], mechanics: { range: 'self', duration: 'round', actionType: 'reaction', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 1 }, costs: { activation: { resource: 'spell_slot', amount: 1 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'none', baseAttribute: '', bonus: 0, diceFormula: '', dc: 0, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: false, maxLevel: 1, levels: [], branches: [] } },
        // 2º Nível
        { id: 'skill-hold-person', name: 'Imobilizar Pessoa', description: 'Salvaguarda SAB ou paralisa humanoide (concentração).', category: 'Encantamento', icon: '🧊', tags: ['2º nível', 'controle'], color: '#06b6d4', source: 'choice', skillType: 'spell', spellSchool: 'enchantment', baseEffects: [{ type: 'control', subtype: 'paralyze', rank: 2 }], mechanics: { range: 'ranged_medium', duration: 'concentration', actionType: 'standard', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 3 }, costs: { activation: { resource: 'spell_slot', amount: 2 }, maintenance: { resource: 'concentration', amountPerRound: 1 }, cooldown: 0 }, rolls: { checkType: 'save', baseAttribute: 'attr-wis', bonus: 0, diceFormula: '', dc: 8, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 9, levels: [{ level: 3, description: '+1 alvo adicional', effects: [{ type: 'targets', value: 1 }] }, { level: 4, description: '+1 alvo adicional', effects: [{ type: 'targets', value: 1 }] }], branches: [] } },
        // 3º Nível - Bola de Fogo com escalonamento mecânico
        { id: 'skill-fireball', name: 'Bola de Fogo', description: 'Esfera de 6m: 8d6 dano de fogo (DES reduz metade).', category: 'Evocação', icon: '💥', tags: ['3º nível', 'fogo', 'área'], color: '#f97316', source: 'choice', skillType: 'spell', spellSchool: 'evocation', baseEffects: [{ type: 'damage', subtype: 'fire', rank: 8 }], mechanics: { range: 'ranged_long', duration: 'instant', actionType: 'standard', areaEffect: { type: 'sphere', radius: 20 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 5 }, costs: { activation: { resource: 'spell_slot', amount: 3 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'save', baseAttribute: 'attr-dex', bonus: 0, diceFormula: '8d6', dc: 8, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 9, scaling: { diceFormula: '{{slot+5}}d6' }, levels: [{ level: 4, description: '+1d6 dano (9d6)', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }, { level: 5, description: '+1d6 dano (10d6)', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }], branches: [] } },
        { id: 'skill-lightning-bolt', name: 'Relâmpago', description: 'Linha de 30m: 8d6 dano elétrico.', category: 'Evocação', icon: '⚡', tags: ['3º nível', 'elétrico', 'área'], color: '#facc15', source: 'choice', skillType: 'spell', spellSchool: 'evocation', baseEffects: [{ type: 'damage', subtype: 'electricity', rank: 8 }], mechanics: { range: 'ranged_long', duration: 'instant', actionType: 'standard', areaEffect: { type: 'line', radius: 100 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 5 }, costs: { activation: { resource: 'spell_slot', amount: 3 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'save', baseAttribute: 'attr-dex', bonus: 0, diceFormula: '8d6', dc: 8, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 9, scaling: { diceFormula: '{{slot+5}}d6' }, levels: [{ level: 4, description: '+1d6 dano', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }], branches: [] } },
        // 4º e 5º Nível
        { id: 'skill-dimension-door', name: 'Porta Dimensional', description: 'Teleporta você e aliado até 150m.', category: 'Conjuração', icon: '🌀', tags: ['4º nível', 'teleporte'], color: '#a855f7', source: 'choice', skillType: 'spell', spellSchool: 'conjuration', baseEffects: [{ type: 'movement', subtype: 'teleport', rank: 6 }], mechanics: { range: 'ranged_long', duration: 'instant', actionType: 'standard', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 7 }, costs: { activation: { resource: 'spell_slot', amount: 4 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'none', baseAttribute: '', bonus: 0, diceFormula: '', dc: 0, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: false, maxLevel: 1, levels: [], branches: [] } },
        { id: 'skill-raise-dead', name: 'Reviver os Mortos', description: 'Ressuscita criatura morta há até 10 dias.', category: 'Necromancia', icon: '✝️', tags: ['5º nível', 'ressurreição'], color: '#fbbf24', source: 'choice', skillType: 'spell', spellSchool: 'necromancy', baseEffects: [{ type: 'healing', subtype: 'resurrection', rank: 10 }], mechanics: { range: 'touch', duration: 'instant', actionType: 'standard', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 9 }, costs: { activation: { resource: 'spell_slot', amount: 5 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'none', baseAttribute: '', bonus: 0, diceFormula: '', dc: 0, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: false, maxLevel: 1, levels: [], branches: [] } },
        // Habilidades Marciais com escalonamento mecânico
        { id: 'skill-sneak-attack', name: 'Ataque Furtivo', description: 'Dano extra com vantagem ou aliado adjacente.', category: 'Marcial', icon: '🗡️', tags: ['ladino', 'passivo'], color: '#22c55e', source: 'class', skillType: 'passive', spellSchool: '', baseEffects: [{ type: 'damage', subtype: 'physical', rank: 1 }], mechanics: { range: 'melee', duration: 'instant', actionType: 'free', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 1 }, costs: { activation: { resource: 'none', amount: 0 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'none', baseAttribute: '', bonus: 0, diceFormula: '1d6', dc: 0, criticalEffect: 'Dados dobrados', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 20, scaling: { diceFormula: '{{ceil(level/2)}}d6' }, levels: [{ level: 3, description: '+1d6 (2d6 total)', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }, { level: 5, description: '+1d6 (3d6 total)', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }, { level: 7, description: '+1d6 (4d6 total)', effects: [{ type: 'dice_bonus', target: 'damage', value: 1 }] }], branches: [] } },
        { id: 'skill-second-wind', name: 'Retomar Fôlego', description: 'Ação bônus: recupera 1d10 + nível PV.', category: 'Marcial', icon: '💨', tags: ['guerreiro', 'cura'], color: '#ef4444', source: 'class', skillType: 'active', spellSchool: '', baseEffects: [{ type: 'healing', subtype: 'standard', rank: 1 }], mechanics: { range: 'self', duration: 'instant', actionType: 'bonus', areaEffect: { type: 'none', radius: 0 } }, modifiers: { extras: [], flaws: [] }, requirements: { attributes: {}, prerequisiteSkills: [], level: 1 }, costs: { activation: { resource: 'short_rest', amount: 1 }, maintenance: { resource: 'none', amountPerRound: 0 }, cooldown: 0 }, rolls: { checkType: 'healing', baseAttribute: '', bonus: 0, diceFormula: '1d10', dc: 0, criticalEffect: '', fumbleEffect: '' }, progression: { enabled: true, maxLevel: 20, scaling: { diceFormula: '1d10+{{level}}' }, levels: [], branches: [] } }
    ],

    // === PROGRESSÃO ===
    progression: {
        type: 'levels',
        maxLevel: 20,
        xpPreset: 'dnd5e',
        xpTable: [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
            85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000],
        benefits: [
            { id: 'ben-prof-1', level: 1, type: 'stat', attributeId: 'attr-prof', value: 2, description: 'Bônus de Proficiência +2' },
            { id: 'ben-prof-5', level: 5, type: 'stat', attributeId: 'attr-prof', value: 3, description: 'Bônus de Proficiência +3' },
            { id: 'ben-prof-9', level: 9, type: 'stat', attributeId: 'attr-prof', value: 4, description: 'Bônus de Proficiência +4' },
            { id: 'ben-prof-13', level: 13, type: 'stat', attributeId: 'attr-prof', value: 5, description: 'Bônus de Proficiência +5' },
            { id: 'ben-prof-17', level: 17, type: 'stat', attributeId: 'attr-prof', value: 6, description: 'Bônus de Proficiência +6' },
            { id: 'ben-asi-4', level: 4, type: 'choice', description: 'Aumento de Atributo ou Talento' },
            { id: 'ben-asi-8', level: 8, type: 'choice', description: 'Aumento de Atributo ou Talento' },
            { id: 'ben-asi-12', level: 12, type: 'choice', description: 'Aumento de Atributo ou Talento' },
            { id: 'ben-asi-16', level: 16, type: 'choice', description: 'Aumento de Atributo ou Talento' },
            { id: 'ben-asi-19', level: 19, type: 'choice', description: 'Aumento de Atributo ou Talento' }
        ]
    },

    // === COMBATE ===
    combat: {
        enabled: true,
        style: 'hybrid',
        roundDuration: 6,
        initiative: {
            type: 'attribute',
            attribute: 'attr-dex',
            dice: 'd20'
        },
        defense: {
            type: 'static',
            formula: '10 + DES.mod + armor'
        },
        actions: {
            standard: 1,
            bonus: 1,
            reaction: 1,
            movement: 1,
            free: 99,
            custom: []
        }
    },

    // === EQUIPAMENTOS ===
    equipment: {
        categories: [
            { id: 'weapons', name: 'Armas', icon: '⚔️', color: '#ef4444' },
            { id: 'armor', name: 'Armaduras', icon: '🛡️', color: '#3b82f6' },
            { id: 'items', name: 'Itens', icon: '🎒', color: '#22c55e' },
            { id: 'magic-items', name: 'Itens Mágicos', icon: '✨', color: '#a855f7' }
        ],
        // Slots de equipamento - configuráveis por sistema
        slots: [
            { id: 'armor', name: 'Armadura', limit: 1, icon: '🛡️' },
            { id: 'shield', name: 'Escudo', limit: 1, icon: '🛡️' },
            { id: 'main-hand', name: 'Mão Principal', limit: 1, icon: '🖐️' },
            { id: 'off-hand', name: 'Mão Secundária', limit: 1, icon: '✋' },
            { id: 'attunement', name: 'Sintonização', limit: 3, icon: '✨' },
            { id: 'accessory', name: 'Acessórios', limit: 99, icon: '💍' }
        ],
        items: [
            // ARMAS
            {
                id: 'longsword',
                name: 'Espada Longa',
                category: 'weapons',
                type: 'weapon',
                icon: '⚔️',
                description: 'Arma marcial corpo-a-corpo versátil',
                damage: '1d8',
                damageType: 'slashing',
                properties: ['versatile'],
                range: '',
                weight: 3,
                price: 15,
                requirements: {},
                bonuses: { toHit: 'attr-str', toDamage: 'attr-str' },
                effects: []
            },

            {
                id: 'longbow',
                name: 'Arco Longo',
                category: 'weapons',
                type: 'weapon',
                icon: '🏹',
                description: 'Arma marcial à distância, requer duas mãos',
                damage: '1d8',
                damageType: 'piercing',
                properties: ['two-handed', 'ranged', 'ammunition'],
                range: '45/180m',
                weight: 2,
                price: 50,
                requirements: {},
                bonuses: { toHit: 'attr-dex', toDamage: 'attr-dex' },
                effects: []
            },

            // ADAGA
            {
                id: 'dagger',
                name: 'Adaga',
                category: 'weapons',
                type: 'weapon',
                icon: '🗡️',
                description: 'Arma simples leve com acuidade, pode ser arremessada',
                damage: '1d4',
                damageType: 'piercing',
                properties: ['light', 'finesse', 'thrown'],
                range: '6/18m',
                weight: 1,
                price: 2,
                requirements: {},
                bonuses: { toHit: 'attr-dex', toDamage: 'attr-dex' },
                effects: []
            },

            // MACHADO GRANDE
            {
                id: 'greataxe',
                name: 'Machado Grande',
                category: 'weapons',
                type: 'weapon',
                icon: '🪓',
                description: 'Arma marcial pesada de duas mãos',
                damage: '1d12',
                damageType: 'slashing',
                properties: ['heavy', 'two-handed'],
                range: '',
                weight: 7,
                price: 30,
                requirements: {},
                bonuses: { toHit: 'attr-str', toDamage: 'attr-str' },
                effects: []
            },


            // ARMADURAS
            {
                id: 'leather-armor',
                name: 'Armadura de Couro',
                category: 'armor',
                type: 'armor',
                icon: '🧥',
                description: 'Armadura leve, permite total modificador de DES na CA',
                armorClass: 11,
                armorType: 'light',
                stealthDisadvantage: false,
                weight: 10,
                price: 10,
                requirements: {},
                effects: []
            },
            {
                id: 'chain-shirt',
                name: 'Camisão de Malha',
                category: 'armor',
                type: 'armor',
                icon: '🔗',
                description: 'Armadura média, +2 DES máximo na CA',
                armorClass: 13,
                armorType: 'medium',
                stealthDisadvantage: false,
                weight: 20,
                price: 50,
                requirements: {},
                effects: []
            },
            {
                id: 'chain-mail',
                name: 'Cota de Malha',
                category: 'armor',
                type: 'armor',
                icon: '🛡️',
                description: 'Armadura pesada, ignora modificador de DES',
                armorClass: 16,
                armorType: 'heavy',
                stealthDisadvantage: true,
                weight: 55,
                price: 75,
                requirements: { 'attr-str': 13 },
                effects: []
            },
            {
                id: 'plate-armor',
                name: 'Armadura de Placas',
                category: 'armor',
                type: 'armor',
                icon: '⚔️',
                description: 'Armadura pesada superior, máxima proteção',
                armorClass: 18,
                armorType: 'heavy',
                stealthDisadvantage: true,
                weight: 65,
                price: 1500,
                requirements: { 'attr-str': 15 },
                effects: []
            },

            // ESCUDOS
            {
                id: 'shield',
                name: 'Escudo',
                category: 'armor',
                type: 'shield',
                icon: '🛡️',
                description: 'Escudo de madeira ou metal, +2 CA',
                armorClass: 2,
                armorType: 'shield',
                stealthDisadvantage: false,
                weight: 6,
                price: 10,
                requirements: {},
                effects: []
            },

            // ITENS MÁGICOS
            {
                id: 'ring-of-protection',
                name: 'Anel de Proteção',
                category: 'magic-items',
                type: 'magic-item',
                icon: '💍',
                description: 'Anel mágico que concede +1 em CA e testes de resistência. Requer sintonização.',
                rarity: 'rare',
                attunement: true,
                weight: 0,
                price: 3500,
                effects: [
                    { id: 'ring-ac', type: 'defense', target: 'attr-ac', value: '+1', condition: 'equipped' },
                    { id: 'ring-saves', type: 'attribute_bonus', target: 'all_saves', value: '+1', condition: 'equipped' }
                ]
            },
            {
                id: 'cloak-of-protection',
                name: 'Manto de Proteção',
                category: 'magic-items',
                type: 'magic-item',
                icon: '🧥',
                description: 'Manto mágico que concede +1 em CA e testes de resistência. Requer sintonização.',
                rarity: 'uncommon',
                attunement: true,
                weight: 1,
                price: 1500,
                effects: [
                    { id: 'cloak-ac', type: 'defense', target: 'attr-ac', value: '+1', condition: 'equipped' },
                    { id: 'cloak-saves', type: 'attribute_bonus', target: 'all_saves', value: '+1', condition: 'equipped' }
                ]
            },
            {
                id: 'boots-of-speed',
                name: 'Botas da Velocidade',
                category: 'magic-items',
                type: 'magic-item',
                icon: '👢',
                description: 'Botas mágicas que dobram seu deslocamento por 10 minutos. Requer sintonização.',
                rarity: 'rare',
                attunement: true,
                weight: 1,
                price: 4000,
                effects: [
                    { id: 'boots-speed', type: 'speed', target: 'attr-speed', value: 'x2', condition: 'activated' }
                ]
            },
            {
                id: 'bag-of-holding',
                name: 'Bolsa de Acumulação',
                category: 'magic-items',
                type: 'magic-item',
                icon: '🎒',
                description: 'Bolsa mágica que pode armazenar até 500 libras sem peso. Interior dimensional.',
                rarity: 'uncommon',
                attunement: false,
                weight: 15,
                price: 2500,
                effects: []
            }

        ],
        inventoryRules: {
            capacityFormula: '{FOR} * 15',
            encumbrance: true,
            currency: [
                { id: 'gold', name: 'Ouro', symbol: 'PO', icon: '🥇', conversionRate: 1, weight: 0.02 },
                { id: 'silver', name: 'Prata', symbol: 'PP', icon: '🥈', conversionRate: 10, weight: 0.02 },
                { id: 'copper', name: 'Cobre', symbol: 'PC', icon: '🥉', conversionRate: 100, weight: 0.02 }
            ]
        }
    },

    // === RAÇAS ===
    races: [
        {
            id: 'race-human', name: 'Humano', pluralName: 'Humanos',
            description: 'Versáteis e ambiciosos, humanos são a raça mais diversa e adaptável. Recebem +1 em todos os atributos.',
            icon: '👤', size: 'medium', speed: 30,
            abilityBonuses: [
                { attributeId: 'attr-str', value: 1 }, { attributeId: 'attr-dex', value: 1 },
                { attributeId: 'attr-con', value: 1 }, { attributeId: 'attr-int', value: 1 },
                { attributeId: 'attr-wis', value: 1 }, { attributeId: 'attr-cha', value: 1 }
            ],
            traits: [{ id: 'trait-versatile', name: 'Versátil', description: '+1 em todos os atributos e 1 idioma extra.', type: 'passive' }],
            languages: ['Comum'], extraLanguages: 1, subraces: [], racialSkills: [],
            proficiencies: { weapons: [], armor: [], tools: [], skills: [], savingThrows: [] }
        },
        {
            id: 'race-elf', name: 'Elfo', pluralName: 'Elfos',
            description: 'Seres graciosos e longevos com afinidade natural para magia. +2 Destreza, visão no escuro e resistência a encantamentos.',
            icon: '🧝', size: 'medium', speed: 30,
            abilityBonuses: [{ attributeId: 'attr-dex', value: 2 }],
            traits: [
                { id: 'trait-darkvision', name: 'Visão no Escuro', description: 'Enxerga na escuridão até 18m como luz fraca.', type: 'passive' },
                { id: 'trait-fey-ancestry', name: 'Ancestralidade Feérica', description: 'Vantagem em testes contra encantamentos e imunidade a sono mágico.', type: 'resistance' },
                { id: 'trait-trance', name: 'Transe', description: 'Medita por 4h ao invés de dormir 8h.', type: 'passive' },
                { id: 'trait-keen-senses', name: 'Sentidos Aguçados', description: 'Proficiência em Percepção.', type: 'proficiency' }
            ],
            languages: ['Comum', 'Élfico'], extraLanguages: 0, subraces: [], racialSkills: [],
            proficiencies: { weapons: [], armor: [], tools: [], skills: ['prof-perception'], savingThrows: [] }
        },
        {
            id: 'race-dwarf', name: 'Anão', pluralName: 'Anões',
            description: 'Resistentes e teimosos, anões são mestres artesãos. +2 Constituição, visão no escuro e resistência a veneno.',
            icon: '⛏️', size: 'medium', speed: 25,
            abilityBonuses: [{ attributeId: 'attr-con', value: 2 }],
            traits: [
                { id: 'trait-darkvision-d', name: 'Visão no Escuro', description: 'Enxerga na escuridão até 18m.', type: 'passive' },
                { id: 'trait-dwarven-resilience', name: 'Resiliência Anã', description: 'Vantagem em testes contra veneno e resistência a dano de veneno.', type: 'resistance' },
                { id: 'trait-stonecunning', name: 'Especialização em Pedra', description: 'Dobra proficiência em História relacionada a pedras.', type: 'proficiency' }
            ],
            languages: ['Comum', 'Anão'], extraLanguages: 0, subraces: [], racialSkills: [],
            proficiencies: { weapons: ['battleaxe', 'handaxe', 'light_hammer', 'warhammer'], armor: [], tools: [], skills: [], savingThrows: [] }
        },
        {
            id: 'race-halfling', name: 'Halfling', pluralName: 'Halflings',
            description: 'Pequenos e sortudos, halflings são corajosos apesar do tamanho. +2 Destreza e podem re-rolar 1s naturais.',
            icon: '🍀', size: 'small', speed: 25,
            abilityBonuses: [{ attributeId: 'attr-dex', value: 2 }],
            traits: [
                { id: 'trait-lucky', name: 'Sortudo', description: 'Quando rolar 1 natural em ataque/teste/salvaguarda, pode re-rolar.', type: 'passive' },
                { id: 'trait-brave', name: 'Corajoso', description: 'Vantagem em testes contra efeitos de medo.', type: 'resistance' },
                { id: 'trait-nimble', name: 'Agilidade Halfling', description: 'Pode mover através do espaço de criaturas maiores.', type: 'passive' }
            ],
            languages: ['Comum', 'Halfling'], extraLanguages: 0, subraces: [], racialSkills: [],
            proficiencies: { weapons: [], armor: [], tools: [], skills: [], savingThrows: [] }
        }
    ],

    // === CLASSES ===
    classes: [
        {
            id: 'class-fighter', name: 'Guerreiro',
            description: 'Mestres de combate, especialistas em todas as armas e armaduras. Excelentes em combate sustentado.',
            icon: '⚔️', color: '#ef4444',
            hitDie: 'd10', hitPointsAtFirst: 10, hitPointsPerLevel: 6,
            primaryAttributes: ['attr-str', 'attr-con'],
            proficiencies: {
                armor: ['light', 'medium', 'heavy', 'shields'],
                weapons: ['simple', 'martial'],
                tools: [],
                savingThrows: ['attr-str', 'attr-con'],
                skillChoices: 2,
                skillOptions: ['prof-acrobatics', 'prof-animal', 'prof-athletics', 'prof-history', 'prof-insight', 'prof-intimidation', 'prof-perception', 'prof-survival']
            },
            features: [
                { id: 'feat-fighting-style', name: 'Estilo de Luta', description: 'Escolha uma especialização: Arquearia, Defesa, Duelismo, Combate com Arma Grande, Proteção ou Combate com Duas Armas.', level: 1, type: 'choice' },
                { id: 'feat-second-wind', name: 'Retomar Fôlego', description: 'Ação bônus: recupera 1d10 + nível de guerreiro PV. 1x por descanso curto.', level: 1, type: 'resource' },
                { id: 'feat-action-surge', name: 'Surto de Ação', description: 'Ganha uma ação extra no turno. 1x por descanso curto (2x no nível 17).', level: 2, type: 'resource' },
                { id: 'feat-martial-archetype', name: 'Arquétipo Marcial', description: 'Escolha: Campeão, Mestre de Batalha ou Cavaleiro Arcano.', level: 3, type: 'subclass' },
                { id: 'feat-extra-attack-1', name: 'Ataque Extra', description: 'Ataca 2 vezes com a ação de Ataque.', level: 5, type: 'passive' },
                { id: 'feat-indomitable', name: 'Indomável', description: 'Re-rola uma salvaguarda falhada. 1x por descanso longo.', level: 9, type: 'resource' },
                { id: 'feat-extra-attack-2', name: 'Ataque Extra (2)', description: 'Ataca 3 vezes com a ação de Ataque.', level: 11, type: 'passive' },
                { id: 'feat-extra-attack-3', name: 'Ataque Extra (3)', description: 'Ataca 4 vezes com a ação de Ataque.', level: 20, type: 'passive' }
            ],
            subclasses: [
                {
                    id: 'sub-champion', name: 'Campeão', description: 'Foco em críticos devastadores e proezas físicas.', features: [
                        { id: 'feat-improved-crit', name: 'Crítico Aprimorado', description: 'Crítico em 19-20.', level: 3, type: 'passive' }
                    ]
                },
                {
                    id: 'sub-battlemaster', name: 'Mestre de Batalha', description: 'Manobras táticas e superioridade em combate.', features: [
                        { id: 'feat-combat-superiority', name: 'Superioridade em Combate', description: '4 dados de superioridade (d8) e 3 manobras.', level: 3, type: 'resource' }
                    ]
                }
            ],
            subclassLevel: 3
        },
        {
            id: 'class-wizard', name: 'Mago',
            description: 'Estudioso das artes arcanas. Possui o maior repertório de magias e versatilidade mágica.',
            icon: '🔮', color: '#3b82f6',
            hitDie: 'd6', hitPointsAtFirst: 6, hitPointsPerLevel: 4,
            primaryAttributes: ['attr-int'],
            spellcasting: {
                type: 'full',
                attribute: 'attr-int',
                preparedFormula: '{INT.mod} + {level}'
            },
            proficiencies: {
                armor: [],
                weapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light_crossbows'],
                tools: [],
                savingThrows: ['attr-int', 'attr-wis'],
                skillChoices: 2,
                skillOptions: ['prof-arcana', 'prof-history', 'prof-insight', 'prof-investigation', 'prof-medicine', 'prof-religion']
            },
            features: [
                { id: 'feat-spellcasting-w', name: 'Conjuração', description: 'Lança magias arcanas usando Inteligência. Começa com grimório contendo 6 magias.', level: 1, type: 'passive' },
                { id: 'feat-arcane-recovery', name: 'Recuperação Arcana', description: 'Recupera slots de magia (nível/2 arredondado para cima) em descanso curto. 1x por dia.', level: 1, type: 'resource' },
                { id: 'feat-arcane-tradition', name: 'Tradição Arcana', description: 'Escolha uma escola de magia para se especializar.', level: 2, type: 'subclass' },
                { id: 'feat-spell-mastery', name: 'Maestria em Magia', description: 'Escolha 1 magia de 1º e 1 de 2º nível para conjurar à vontade.', level: 18, type: 'passive' },
                { id: 'feat-signature-spells', name: 'Magias Assinatura', description: '2 magias de 3º nível podem ser conjuradas 1x sem gastar slot.', level: 20, type: 'passive' }
            ],
            subclasses: [
                {
                    id: 'sub-evocation', name: 'Escola de Evocação', description: 'Magias de dano e energia destrutiva.', features: [
                        { id: 'feat-sculpt-spells', name: 'Esculpir Magias', description: 'Aliados passam automaticamente em salvaguardas de suas evocações.', level: 2, type: 'passive' }
                    ]
                },
                {
                    id: 'sub-abjuration', name: 'Escola de Abjuração', description: 'Magias de proteção e anulação.', features: [
                        { id: 'feat-arcane-ward', name: 'Proteção Arcana', description: 'Cria um escudo mágico quando conjura abjurações.', level: 2, type: 'passive' }
                    ]
                }
            ],
            subclassLevel: 2
        },
        {
            id: 'class-rogue', name: 'Ladino',
            description: 'Especialista em furtividade, habilidades e ataques precisos. Mestre do ataque furtivo.',
            icon: '🗡️', color: '#22c55e',
            hitDie: 'd8', hitPointsAtFirst: 8, hitPointsPerLevel: 5,
            primaryAttributes: ['attr-dex'],
            proficiencies: {
                armor: ['light'],
                weapons: ['simple', 'hand_crossbows', 'longswords', 'rapiers', 'shortswords'],
                tools: ['thieves_tools'],
                savingThrows: ['attr-dex', 'attr-int'],
                skillChoices: 4,
                skillOptions: ['prof-acrobatics', 'prof-athletics', 'prof-deception', 'prof-insight', 'prof-intimidation', 'prof-investigation', 'prof-perception', 'prof-performance', 'prof-persuasion', 'prof-sleight', 'prof-stealth']
            },
            features: [
                { id: 'feat-expertise-1', name: 'Especialização', description: 'Dobra bônus de proficiência em 2 perícias ou ferramentas.', level: 1, type: 'choice' },
                { id: 'feat-sneak-attack', name: 'Ataque Furtivo', description: '+1d6 dano extra quando tem vantagem ou aliado adjacente ao alvo. Aumenta por nível.', level: 1, type: 'passive' },
                { id: 'feat-thieves-cant', name: 'Gíria de Ladrão', description: 'Linguagem secreta de sinais e códigos.', level: 1, type: 'passive' },
                { id: 'feat-cunning-action', name: 'Ação Ardilosa', description: 'Ação bônus para Disparar, Desengajar ou Esconder.', level: 2, type: 'passive' },
                { id: 'feat-roguish-archetype', name: 'Arquétipo Ladino', description: 'Escolha: Ladrão, Assassino ou Trapaceiro Arcano.', level: 3, type: 'subclass' },
                { id: 'feat-uncanny-dodge', name: 'Esquiva Sobrenatural', description: 'Reação: reduz dano de ataque pela metade.', level: 5, type: 'reaction' },
                { id: 'feat-evasion', name: 'Evasão', description: 'Dano 0 em testes de DES bem-sucedidos, metade em falha.', level: 7, type: 'passive' },
                { id: 'feat-reliable-talent', name: 'Talento Confiável', description: 'Mínimo 10 em testes de perícia com proficiência.', level: 11, type: 'passive' }
            ],
            subclasses: [
                {
                    id: 'sub-thief', name: 'Ladrão', description: 'Agilidade suprema e uso de itens mágicos.', features: [
                        { id: 'feat-fast-hands', name: 'Mãos Rápidas', description: 'Ação Ardilosa para usar objetos e desarmar armadilhas.', level: 3, type: 'passive' }
                    ]
                },
                {
                    id: 'sub-assassin', name: 'Assassino', description: 'Mestre em infiltração e eliminação.', features: [
                        { id: 'feat-assassinate', name: 'Assassinar', description: 'Vantagem contra quem não agiu. Crítico automático em surpresos.', level: 3, type: 'passive' }
                    ]
                }
            ],
            subclassLevel: 3
        },
        {
            id: 'class-cleric', name: 'Clérigo',
            description: 'Servo divino com poderes de cura e destruição. Canaliza a energia de sua divindade.',
            icon: '✝️', color: '#f59e0b',
            hitDie: 'd8', hitPointsAtFirst: 8, hitPointsPerLevel: 5,
            primaryAttributes: ['attr-wis'],
            spellcasting: {
                type: 'full',
                attribute: 'attr-wis',
                preparedFormula: '{WIS.mod} + {level}'
            },
            proficiencies: {
                armor: ['light', 'medium', 'shields'],
                weapons: ['simple'],
                tools: [],
                savingThrows: ['attr-wis', 'attr-cha'],
                skillChoices: 2,
                skillOptions: ['prof-history', 'prof-insight', 'prof-medicine', 'prof-persuasion', 'prof-religion']
            },
            features: [
                { id: 'feat-spellcasting-c', name: 'Conjuração', description: 'Lança magias divinas usando Sabedoria. Prepara magias da lista de clérigo.', level: 1, type: 'passive' },
                { id: 'feat-divine-domain', name: 'Domínio Divino', description: 'Escolha um domínio que define seus poderes: Vida, Luz, Guerra, etc.', level: 1, type: 'subclass' },
                { id: 'feat-channel-divinity', name: 'Canalizar Divindade', description: 'Canaliza energia divina para efeitos especiais. 1x por descanso curto.', level: 2, type: 'resource' },
                { id: 'feat-destroy-undead', name: 'Destruir Mortos-Vivos', description: 'Mortos-vivos fracos são destruídos ao falharem contra Expulsar.', level: 5, type: 'passive' },
                { id: 'feat-divine-intervention', name: 'Intervenção Divina', description: '% de chance igual ao nível de o deus intervir diretamente.', level: 10, type: 'active' }
            ],
            subclasses: [
                {
                    id: 'sub-life', name: 'Domínio da Vida', description: 'Cura superior e proteção.', features: [
                        { id: 'feat-disciple-life', name: 'Discípulo da Vida', description: 'Magias de cura restauram HP extra igual a 2 + nível da magia.', level: 1, type: 'passive' }
                    ]
                },
                {
                    id: 'sub-war', name: 'Domínio da Guerra', description: 'Combatente divino com proficiências marciais.', features: [
                        { id: 'feat-war-priest', name: 'Sacerdote de Guerra', description: 'Ataque extra como ação bônus (mod.SAB vezes por dia).', level: 1, type: 'resource' }
                    ]
                }
            ],
            subclassLevel: 1
        }
    ]
};

// ============================================================
// TEMPLATE: FATE LIKE (Sistema Narrativo)
// ============================================================
export const FATE_TEMPLATE = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    metadata: {
        name: 'Meu Sistema FATE',
        description: 'Sistema narrativo focado em aspectos e pontos de destino. Ideal para histórias colaborativas.',
        genre: ['universal', 'narrative'],
        complexity: 'simple',
        tags: ['fate', 'narrative', 'aspects', 'fudge'],
        icon: '🎭'
    },
    attributes: [
        { id: 'attr-careful', name: 'Cuidadoso', shortName: 'CUI', type: 'numeric', attributeType: 'numeric', min: 0, max: 4, default: 1, modifierTemplate: 'linear', modifierFormula: 'value', color: '#3b82f6', tier: 'primary', description: 'Quando você presta atenção aos detalhes.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-clever', name: 'Esperto', shortName: 'ESP', type: 'numeric', attributeType: 'numeric', min: 0, max: 4, default: 1, modifierTemplate: 'linear', modifierFormula: 'value', color: '#8b5cf6', tier: 'primary', description: 'Quando você pensa rápido e resolve problemas.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-flashy', name: 'Estiloso', shortName: 'EST', type: 'numeric', attributeType: 'numeric', min: 0, max: 4, default: 1, modifierTemplate: 'linear', modifierFormula: 'value', color: '#ec4899', tier: 'primary', description: 'Quando você quer chamar atenção.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-forceful', name: 'Vigoroso', shortName: 'VIG', type: 'numeric', attributeType: 'numeric', min: 0, max: 4, default: 1, modifierTemplate: 'linear', modifierFormula: 'value', color: '#ef4444', tier: 'primary', description: 'Quando você usa força bruta.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-quick', name: 'Ágil', shortName: 'AGI', type: 'numeric', attributeType: 'numeric', min: 0, max: 4, default: 1, modifierTemplate: 'linear', modifierFormula: 'value', color: '#22c55e', tier: 'primary', description: 'Quando você age rapidamente.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-sneaky', name: 'Sorrateiro', shortName: 'SOR', type: 'numeric', attributeType: 'numeric', min: 0, max: 4, default: 1, modifierTemplate: 'linear', modifierFormula: 'value', color: '#6b7280', tier: 'primary', description: 'Quando você age discretamente.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-stress', name: 'Estresse', shortName: 'STR', type: 'pool', attributeType: 'pool', min: 0, max: 3, default: 3, modifierTemplate: 'linear', modifierFormula: 'value', color: '#dc2626', tier: 'derived', description: 'Caixas de estresse disponíveis.', showOnSheet: true, showModifier: false, editable: false, connections: [], levelCaps: [] },
        { id: 'attr-refresh', name: 'Recarga', shortName: 'REC', type: 'numeric', attributeType: 'numeric', min: 1, max: 10, default: 3, modifierTemplate: 'linear', modifierFormula: 'value', color: '#0ea5e9', tier: 'derived', description: 'Pontos de destino no início de cada sessão.', showOnSheet: true, showModifier: false, editable: true, connections: [], levelCaps: [] }
    ],
    proficiencies: [],
    dice: { available: ['dF'], primary: 'dF', customDice: [{ id: 'dF', name: 'Dado Fudge', sides: 3, values: ['-', '0', '+'] }] },
    skills: [],
    progression: { type: 'milestone', maxLevel: 10, benefits: [] },
    combat: { enabled: false },
    equipment: { categories: [], items: [], inventoryRules: {} },
    races: [],
    classes: []
};

// ============================================================
// TEMPLATE: PBtA LIKE (Powered by the Apocalypse)
// ============================================================
export const PBTA_TEMPLATE = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    metadata: {
        name: 'Meu Sistema PBtA',
        description: 'Sistema Powered by the Apocalypse com movimentos narrativos e 2d6.',
        genre: ['universal', 'narrative'],
        complexity: 'simple',
        tags: ['pbta', 'moves', '2d6', 'narrative'],
        icon: '🌙'
    },
    attributes: [
        { id: 'attr-hot', name: 'Quente', shortName: 'HOT', type: 'numeric', attributeType: 'numeric', min: -2, max: 3, default: 0, modifierTemplate: 'linear', modifierFormula: 'value', color: '#ef4444', tier: 'primary', description: 'Sedução, manipulação e aparência.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-cold', name: 'Frio', shortName: 'CLD', type: 'numeric', attributeType: 'numeric', min: -2, max: 3, default: 0, modifierTemplate: 'linear', modifierFormula: 'value', color: '#3b82f6', tier: 'primary', description: 'Calma, indiferença e intimidação.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-volatile', name: 'Volátil', shortName: 'VOL', type: 'numeric', attributeType: 'numeric', min: -2, max: 3, default: 0, modifierTemplate: 'linear', modifierFormula: 'value', color: '#f59e0b', tier: 'primary', description: 'Violência, destruição e ação impulsiva.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-dark', name: 'Sombrio', shortName: 'DRK', type: 'numeric', attributeType: 'numeric', min: -2, max: 3, default: 0, modifierTemplate: 'linear', modifierFormula: 'value', color: '#6b7280', tier: 'primary', description: 'Mistério, segredos e o sobrenatural.', showOnSheet: true, showModifier: true, editable: true, connections: [], levelCaps: [] },
        { id: 'attr-harm', name: 'Dano', shortName: 'DMG', type: 'pool', attributeType: 'pool', min: 0, max: 4, default: 4, modifierTemplate: 'linear', modifierFormula: 'value', color: '#dc2626', tier: 'derived', description: 'Quanto dano você pode receber antes de morrer.', showOnSheet: true, showModifier: false, editable: false, connections: [], levelCaps: [] }
    ],
    proficiencies: [],
    dice: { available: ['d6'], primary: 'd6', customDice: [] },
    skills: [],
    progression: { type: 'milestone', maxLevel: 10, benefits: [] },
    combat: { enabled: false },
    equipment: { categories: [], items: [], inventoryRules: {} },
    races: [],
    classes: [
        { id: 'class-mortal', name: 'O Mortal', description: 'Humano comum fascinado pelo sobrenatural.', icon: '💔', color: '#ef4444', hitDie: 'd6', hitPointsAtFirst: 6, hitPointsPerLevel: 3, primaryAttributes: ['attr-hot'], proficiencies: { armor: [], weapons: [], tools: [], savingThrows: [], skillChoices: 0, skillOptions: [] }, features: [{ id: 'move-true-love', name: 'Amor Verdadeiro', description: 'Você está apaixonado por alguém sobrenatural.', level: 1, type: 'passive' }], subclasses: [], subclassLevel: 1 },
        { id: 'class-werewolf', name: 'O Lobisomem', description: 'Uma fera dentro de você luta para sair.', icon: '🐺', color: '#f59e0b', hitDie: 'd8', hitPointsAtFirst: 8, hitPointsPerLevel: 4, primaryAttributes: ['attr-volatile'], proficiencies: { armor: [], weapons: [], tools: [], savingThrows: [], skillChoices: 0, skillOptions: [] }, features: [{ id: 'move-transform', name: 'Transformar', description: 'Você pode se transformar em lobo.', level: 1, type: 'active' }], subclasses: [], subclassLevel: 1 },
        { id: 'class-witch', name: 'A Bruxa', description: 'Poder mágico com um preço a pagar.', icon: '🌙', color: '#8b5cf6', hitDie: 'd6', hitPointsAtFirst: 6, hitPointsPerLevel: 3, primaryAttributes: ['attr-dark'], proficiencies: { armor: [], weapons: [], tools: [], savingThrows: [], skillChoices: 0, skillOptions: [] }, features: [{ id: 'move-hexes', name: 'Feitiços', description: 'Você conhece feitiços e maldições.', level: 1, type: 'active' }], subclasses: [], subclassLevel: 1 }
    ]
};

// Lista de todos os templates
export const SYSTEM_TEMPLATES = [
    { id: 'minimal', name: 'Mínimo Universal', description: 'Esqueleto simples com 3 atributos, recursos, eventos e regras. Ideal para criar seu próprio sistema.', icon: '⚙️', color: '#10b981', data: MINIMAL_UNIVERSAL_SYSTEM },
    { id: 'dnd', name: 'D&D 5e Like', description: 'Sistema completo d20 com 6 atributos primários + derivados, 18 perícias, combate completo e progressão por XP.', icon: '⚔️', color: '#ef4444', data: DND_TEMPLATE },
    { id: 'fate', name: 'FATE Like', description: 'Sistema narrativo com abordagens, estresse e pontos de destino.', icon: '🎭', color: '#8b5cf6', data: FATE_TEMPLATE },
    { id: 'pbta', name: 'PBtA Like', description: 'Powered by the Apocalypse com 2d6 e movimentos narrativos.', icon: '🌙', color: '#3b82f6', data: PBTA_TEMPLATE }
];

export function getTemplateById(templateId) {
    const template = SYSTEM_TEMPLATES.find(t => t.id === templateId);
    return template ? JSON.parse(JSON.stringify(template.data)) : null;
}
