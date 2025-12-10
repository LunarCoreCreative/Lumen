/**
 * D&D 5e Conditions
 * Standard conditions with their mechanical effects
 */

import { ModifierType, ModifierTarget } from './modifierEngine';

/**
 * Standard D&D 5e Conditions
 */
export const DND_CONDITIONS = [
    {
        id: 'condition-blinded',
        name: 'Cego',
        nameEn: 'Blinded',
        icon: '🙈',
        color: '#6b7280',
        description: 'Não pode ver. Ataques contra você têm vantagem. Seus ataques têm desvantagem.',
        effects: [
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' }
        ]
    },
    {
        id: 'condition-charmed',
        name: 'Enfeitiçado',
        nameEn: 'Charmed',
        icon: '💖',
        color: '#ec4899',
        description: 'Não pode atacar o encantador. O encantador tem vantagem em testes sociais contra você.',
        effects: []
    },
    {
        id: 'condition-deafened',
        name: 'Surdo',
        nameEn: 'Deafened',
        icon: '🙉',
        color: '#9ca3af',
        description: 'Não pode ouvir. Falha automática em testes que requerem audição.',
        effects: []
    },
    {
        id: 'condition-frightened',
        name: 'Amedrontado',
        nameEn: 'Frightened',
        icon: '😱',
        color: '#fbbf24',
        description: 'Desvantagem em testes de habilidade e ataques enquanto ver a fonte do medo.',
        effects: [
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' },
            { target: ModifierTarget.ALL_SKILLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' }
        ]
    },
    {
        id: 'condition-grappled',
        name: 'Agarrado',
        nameEn: 'Grappled',
        icon: '🤜',
        color: '#f97316',
        description: 'Deslocamento 0. Termina se escapar ou se afastar do agarrador.',
        effects: [
            { target: ModifierTarget.SPEED, type: ModifierType.SET, value: 0 }
        ]
    },
    {
        id: 'condition-incapacitated',
        name: 'Incapacitado',
        nameEn: 'Incapacitated',
        icon: '😵',
        color: '#dc2626',
        description: 'Não pode tomar ações ou reações.',
        effects: []
    },
    {
        id: 'condition-invisible',
        name: 'Invisível',
        nameEn: 'Invisible',
        icon: '👻',
        color: '#8b5cf6',
        description: 'Ataques contra você têm desvantagem. Seus ataques têm vantagem.',
        effects: [
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.ADVANTAGE, value: 'advantage' }
        ]
    },
    {
        id: 'condition-paralyzed',
        name: 'Paralisado',
        nameEn: 'Paralyzed',
        icon: '🧊',
        color: '#06b6d4',
        description: 'Incapacitado. Não pode se mover ou falar. Falha automática em FOR/DES. Ataques corpo-a-corpo são críticos.',
        effects: [
            { target: ModifierTarget.SPEED, type: ModifierType.SET, value: 0 }
        ]
    },
    {
        id: 'condition-petrified',
        name: 'Petrificado',
        nameEn: 'Petrified',
        icon: '🗿',
        color: '#78716c',
        description: 'Transformado em pedra. Incapacitado. Resistência a todo dano. Imune a veneno e doença.',
        effects: [
            { target: ModifierTarget.SPEED, type: ModifierType.SET, value: 0 }
        ]
    },
    {
        id: 'condition-poisoned',
        name: 'Envenenado',
        nameEn: 'Poisoned',
        icon: '☠️',
        color: '#22c55e',
        description: 'Desvantagem em jogadas de ataque e testes de habilidade.',
        effects: [
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' },
            { target: ModifierTarget.ALL_SKILLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' }
        ]
    },
    {
        id: 'condition-prone',
        name: 'Caído',
        nameEn: 'Prone',
        icon: '🧎',
        color: '#a3a3a3',
        description: 'Desvantagem em ataques. Ataques corpo-a-corpo contra você têm vantagem. Ataques à distância têm desvantagem.',
        effects: [
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' }
        ]
    },
    {
        id: 'condition-restrained',
        name: 'Contido',
        nameEn: 'Restrained',
        icon: '⛓️',
        color: '#737373',
        description: 'Deslocamento 0. Ataques contra você têm vantagem. Seus ataques e DES saves têm desvantagem.',
        effects: [
            { target: ModifierTarget.SPEED, type: ModifierType.SET, value: 0 },
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' }
        ]
    },
    {
        id: 'condition-stunned',
        name: 'Atordoado',
        nameEn: 'Stunned',
        icon: '💫',
        color: '#facc15',
        description: 'Incapacitado. Não pode se mover. Fala balbuciada. Falha automática em FOR/DES. Ataques têm vantagem.',
        effects: [
            { target: ModifierTarget.SPEED, type: ModifierType.SET, value: 0 }
        ]
    },
    {
        id: 'condition-unconscious',
        name: 'Inconsciente',
        nameEn: 'Unconscious',
        icon: '💤',
        color: '#1f2937',
        description: 'Incapacitado. Cai caído. Larga o que segura. Falha automática FOR/DES. Ataques são críticos.',
        effects: [
            { target: ModifierTarget.SPEED, type: ModifierType.SET, value: 0 }
        ]
    },
    {
        id: 'condition-exhaustion-1',
        name: 'Exaustão 1',
        nameEn: 'Exhaustion 1',
        icon: '😓',
        color: '#b45309',
        description: 'Desvantagem em testes de habilidade.',
        effects: [
            { target: ModifierTarget.ALL_SKILLS, type: ModifierType.DISADVANTAGE, value: 'disadvantage' }
        ]
    }
];

/**
 * Get condition by ID
 */
export function getConditionById(conditionId) {
    return DND_CONDITIONS.find(c => c.id === conditionId);
}

/**
 * Get all conditions
 */
export function getAllConditions() {
    return DND_CONDITIONS;
}
