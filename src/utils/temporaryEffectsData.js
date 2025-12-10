/**
 * Temporary Effects System
 * Buffs, debuffs, and temporary modifiers with duration tracking
 */

import { ModifierType, ModifierTarget } from './modifierEngine';

/**
 * Duration types for temporary effects
 */
export const DurationTypes = {
    ROUNDS: 'rounds',       // Combat rounds (6 seconds each)
    MINUTES: 'minutes',     // Game time minutes
    HOURS: 'hours',         // Game time hours
    UNTIL_REST: 'until_rest', // Until short/long rest
    CONCENTRATION: 'concentration', // Requires concentration
    PERMANENT: 'permanent'  // Doesn't expire
};

/**
 * Common temporary effects in D&D 5e
 */
export const COMMON_EFFECTS = [
    // === BUFFS ===
    {
        id: 'effect-bless',
        name: 'Abençoar',
        nameEn: 'Bless',
        icon: '✨',
        color: '#fbbf24',
        type: 'buff',
        description: '+1d4 em ataques e testes de resistência',
        defaultDuration: 10,
        durationType: DurationTypes.ROUNDS,
        concentration: true,
        effects: [
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.BONUS, value: 2 },
            { target: ModifierTarget.ALL_SAVES, type: ModifierType.BONUS, value: 2 }
        ]
    },
    {
        id: 'effect-shield-of-faith',
        name: 'Escudo da Fé',
        nameEn: 'Shield of Faith',
        icon: '🛡️',
        color: '#3b82f6',
        type: 'buff',
        description: '+2 CA',
        defaultDuration: 10,
        durationType: DurationTypes.MINUTES,
        concentration: true,
        effects: [
            { target: ModifierTarget.AC, type: ModifierType.BONUS, value: 2 }
        ]
    },
    {
        id: 'effect-haste',
        name: 'Velocidade',
        nameEn: 'Haste',
        icon: '⚡',
        color: '#22c55e',
        type: 'buff',
        description: '+2 CA, vantagem em DES, deslocamento dobrado',
        defaultDuration: 10,
        durationType: DurationTypes.ROUNDS,
        concentration: true,
        effects: [
            { target: ModifierTarget.AC, type: ModifierType.BONUS, value: 2 },
            { target: ModifierTarget.SPEED, type: ModifierType.MULTIPLY, value: 2 }
        ]
    },
    {
        id: 'effect-bardic-inspiration',
        name: 'Inspiração Bárdica',
        nameEn: 'Bardic Inspiration',
        icon: '🎵',
        color: '#ec4899',
        type: 'buff',
        description: '+1d6 em um teste',
        defaultDuration: 10,
        durationType: DurationTypes.MINUTES,
        concentration: false,
        effects: []
    },
    {
        id: 'effect-rage',
        name: 'Fúria',
        nameEn: 'Rage',
        icon: '🔥',
        color: '#ef4444',
        type: 'buff',
        description: '+2 dano corpo-a-corpo, resistência a dano físico',
        defaultDuration: 10,
        durationType: DurationTypes.ROUNDS,
        concentration: false,
        effects: [
            { target: ModifierTarget.MELEE_DAMAGE, type: ModifierType.BONUS, value: 2 }
        ]
    },
    {
        id: 'effect-guidance',
        name: 'Orientação',
        nameEn: 'Guidance',
        icon: '🌟',
        color: '#a855f7',
        type: 'buff',
        description: '+1d4 em um teste de habilidade',
        defaultDuration: 1,
        durationType: DurationTypes.MINUTES,
        concentration: true,
        effects: [
            { target: ModifierTarget.ALL_SKILLS, type: ModifierType.BONUS, value: 2 }
        ]
    },

    // === DEBUFFS ===
    {
        id: 'effect-bane',
        name: 'Perdição',
        nameEn: 'Bane',
        icon: '💀',
        color: '#6b7280',
        type: 'debuff',
        description: '-1d4 em ataques e testes de resistência',
        defaultDuration: 10,
        durationType: DurationTypes.ROUNDS,
        concentration: true,
        effects: [
            { target: ModifierTarget.ATTACK_ROLLS, type: ModifierType.PENALTY, value: -2 },
            { target: ModifierTarget.ALL_SAVES, type: ModifierType.PENALTY, value: -2 }
        ]
    },
    {
        id: 'effect-slow',
        name: 'Lentidão',
        nameEn: 'Slow',
        icon: '🐌',
        color: '#78716c',
        type: 'debuff',
        description: '-2 CA, deslocamento reduzido',
        defaultDuration: 10,
        durationType: DurationTypes.ROUNDS,
        concentration: true,
        effects: [
            { target: ModifierTarget.AC, type: ModifierType.PENALTY, value: -2 },
            { target: ModifierTarget.SPEED, type: ModifierType.DIVIDE, value: 2 }
        ]
    },
    {
        id: 'effect-hex',
        name: 'Maldição',
        nameEn: 'Hex',
        icon: '👁️',
        color: '#7c3aed',
        type: 'debuff',
        description: '+1d6 dano necrótico, desvantagem em um atributo',
        defaultDuration: 1,
        durationType: DurationTypes.HOURS,
        concentration: true,
        effects: []
    },
    {
        id: 'effect-faerie-fire',
        name: 'Fogo das Fadas',
        nameEn: 'Faerie Fire',
        icon: '🔮',
        color: '#f472b6',
        type: 'debuff',
        description: 'Ataques contra você têm vantagem',
        defaultDuration: 10,
        durationType: DurationTypes.ROUNDS,
        concentration: true,
        effects: []
    },

    // === CUSTOM ===
    {
        id: 'effect-custom-buff',
        name: 'Buff Temporário',
        icon: '⬆️',
        color: '#22c55e',
        type: 'buff',
        description: 'Bônus customizado',
        defaultDuration: 1,
        durationType: DurationTypes.MINUTES,
        concentration: false,
        effects: [],
        isCustom: true
    },
    {
        id: 'effect-custom-debuff',
        name: 'Debuff Temporário',
        icon: '⬇️',
        color: '#ef4444',
        type: 'debuff',
        description: 'Penalidade customizada',
        defaultDuration: 1,
        durationType: DurationTypes.MINUTES,
        concentration: false,
        effects: [],
        isCustom: true
    }
];

/**
 * Create a temporary effect instance
 */
export function createTemporaryEffect(effectTemplate, customDuration = null) {
    return {
        id: `${effectTemplate.id}-${Date.now()}`,
        templateId: effectTemplate.id,
        name: effectTemplate.name,
        icon: effectTemplate.icon,
        color: effectTemplate.color,
        type: effectTemplate.type,
        description: effectTemplate.description,
        duration: customDuration || effectTemplate.defaultDuration,
        durationType: effectTemplate.durationType,
        concentration: effectTemplate.concentration || false,
        effects: effectTemplate.effects || [],
        createdAt: Date.now()
    };
}

/**
 * Tick effects (reduce round-based durations)
 */
export function tickTemporaryEffects(effects) {
    return effects
        .map(effect => {
            if (effect.durationType === DurationTypes.ROUNDS) {
                return { ...effect, duration: effect.duration - 1 };
            }
            return effect;
        })
        .filter(effect => effect.duration > 0 || effect.durationType !== DurationTypes.ROUNDS);
}

/**
 * Get effect by template ID
 */
export function getEffectTemplate(templateId) {
    return COMMON_EFFECTS.find(e => e.id === templateId);
}

/**
 * Get all buff templates
 */
export function getBuffTemplates() {
    return COMMON_EFFECTS.filter(e => e.type === 'buff');
}

/**
 * Get all debuff templates
 */
export function getDebuffTemplates() {
    return COMMON_EFFECTS.filter(e => e.type === 'debuff');
}
