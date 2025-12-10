/**
 * Modifier Engine - Centralized modifier tracking and application
 * 
 * Tracks all modifiers from:
 * - Equipment (weapons, armor, magic items)
 * - Buffs/Debuffs (spells, abilities)
 * - Conditions (prone, blessed, poisoned)
 * - Temporary effects
 * 
 * Handles stacking rules and automatic application
 */

/**
 * Modifier types
 */
export const ModifierType = {
    // Basic types
    BONUS: 'bonus',           // Stacks with everything
    PENALTY: 'penalty',       // Stacks with everything
    ARMOR: 'armor',           // Doesn't stack (use highest)
    SHIELD: 'shield',         // Doesn't stack (use highest)
    NATURAL_ARMOR: 'natural', // Doesn't stack (use highest)
    DEFLECTION: 'deflection', // Doesn't stack (use highest)
    DODGE: 'dodge',           // Always stacks

    // Special types
    SET: 'set',               // Sets value to specific number
    ADVANTAGE: 'advantage',   // D&D advantage on rolls
    DISADVANTAGE: 'disadvantage',
    MULTIPLY: 'multiply',     // Multiplies value
    DIVIDE: 'divide'
};

/**
 * Modifier target categories
 */
export const ModifierTarget = {
    // Attributes
    AC: 'ac',
    HP: 'hp',
    INITIATIVE: 'initiative',
    SPEED: 'speed',

    // Skills
    ALL_SKILLS: 'all_skills',
    SKILL: 'skill',           // Specific skill by ID

    // Attacks
    ATTACK_ROLLS: 'attack_rolls',
    MELEE_ATTACK: 'melee_attack',
    RANGED_ATTACK: 'ranged_attack',
    SPELL_ATTACK: 'spell_attack',

    // Damage
    DAMAGE: 'damage',
    MELEE_DAMAGE: 'melee_damage',
    RANGED_DAMAGE: 'ranged_damage',

    // Saves
    ALL_SAVES: 'all_saves',
    SAVE: 'save',            // Specific save by attribute

    // Attributes
    ATTRIBUTE: 'attribute',  // Specific attribute by ID
    ALL_ATTRIBUTES: 'all_attributes'
};

/**
 * Create a modifier
 * @param {Object} config - Modifier configuration
 * @returns {Object} - Modifier object
 */
export function createModifier({
    id,
    name,
    source,              // Where it comes from (item ID, spell ID, etc)
    sourceType,          // 'item', 'spell', 'condition', 'buff'
    target,              // What it affects (ModifierTarget)
    targetId,            // Specific ID if target is specific (e.g., skill ID)
    type = ModifierType.BONUS,
    value,               // Number or string (e.g., '1d4', '+2')
    duration,            // 'permanent', 'until_rest', 'rounds', 'concentration'
    remainingRounds,     // If duration is 'rounds'
    stacks = null,       // null = auto-determine from type, true/false = override
    condition            // Optional condition for when it applies
}) {
    return {
        id: id || `mod-${Date.now()}-${Math.random()}`,
        name,
        source,
        sourceType,
        target,
        targetId,
        type,
        value,
        duration: duration || 'permanent',
        remainingRounds,
        stacks: stacks !== null ? stacks : determineStacking(type),
        condition,
        appliedAt: Date.now()
    };
}

/**
 * Determine if a modifier type stacks by default
 */
function determineStacking(type) {
    const nonstackingTypes = [
        ModifierType.ARMOR,
        ModifierType.SHIELD,
        ModifierType.NATURAL_ARMOR,
        ModifierType.DEFLECTION,
        ModifierType.SET
    ];

    return !nonstackingTypes.includes(type);
}

/**
 * Apply modifiers to a base value
 * @param {number} baseValue - Base value to modify
 * @param {Array} modifiers - Array of modifiers to apply
 * @param {string} target - Target to filter by
 * @param {string} targetId - Optional specific target ID
 * @returns {Object} - {total, breakdown}
 */
export function applyModifiers(baseValue, modifiers, target, targetId = null) {
    // Filter modifiers that apply to this target
    const applicableModifiers = modifiers.filter(mod => {
        if (mod.target !== target) return false;
        if (targetId && mod.targetId && mod.targetId !== targetId) return false;
        return true;
    });

    let total = baseValue;
    const breakdown = [{
        source: 'Base',
        type: 'base',
        value: baseValue
    }];

    // Handle SET modifiers first (they replace the value)
    const setModifiers = applicableModifiers.filter(m => m.type === ModifierType.SET);
    if (setModifiers.length > 0) {
        const highest = Math.max(...setModifiers.map(m => parseModifierValue(m.value)));
        total = highest;
        breakdown.push({
            source: setModifiers.find(m => parseModifierValue(m.value) === highest).name,
            type: ModifierType.SET,
            value: highest
        });
        return { total, breakdown };
    }

    // Group modifiers by type
    const modifiersByType = {};
    applicableModifiers.forEach(mod => {
        if (!modifiersByType[mod.type]) {
            modifiersByType[mod.type] = [];
        }
        modifiersByType[mod.type].push(mod);
    });

    // Apply each type
    Object.entries(modifiersByType).forEach(([type, mods]) => {
        if (type === ModifierType.SET) return; // Already handled

        if (mods[0].stacks) {
            // Stacking modifiers: sum all
            const sum = mods.reduce((acc, mod) => {
                const value = parseModifierValue(mod.value);
                breakdown.push({
                    source: mod.name,
                    type: mod.type,
                    value
                });
                return acc + value;
            }, 0);
            total += sum;
        } else {
            // Non-stacking modifiers: use highest
            const highest = mods.reduce((best, mod) => {
                const value = parseModifierValue(mod.value);
                return value > parseModifierValue(best.value) ? mod : best;
            }, mods[0]);

            const value = parseModifierValue(highest.value);
            breakdown.push({
                source: highest.name,
                type: highest.type,
                value
            });
            total += value;
        }
    });

    return { total, breakdown };
}

/**
 * Parse modifier value (supports numbers and dice formulas)
 */
function parseModifierValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        // Try to parse as number
        const num = parseInt(value);
        if (!isNaN(num)) return num;

        // Dice formula - return average for calculation purposes
        // E.g., '1d4' → 2.5, '2d6' → 7
        const diceMatch = value.match(/(\d+)d(\d+)/);
        if (diceMatch) {
            const count = parseInt(diceMatch[1]);
            const sides = parseInt(diceMatch[2]);
            return count * ((sides + 1) / 2);
        }
    }
    return 0;
}

/**
 * Get all modifiers affecting a target
 */
export function getModifiersForTarget(modifiers, target, targetId = null) {
    return modifiers.filter(mod => {
        if (mod.target !== target) return false;
        if (targetId && mod.targetId && mod.targetId !== targetId) return false;
        return true;
    });
}

/**
 * Remove modifiers by source
 */
export function removeModifiersBySource(modifiers, source) {
    return modifiers.filter(mod => mod.source !== source);
}

/**
 * Update modifier durations (call each round)
 */
export function tickModifiers(modifiers) {
    return modifiers
        .map(mod => {
            if (mod.duration === 'rounds' && mod.remainingRounds !== undefined) {
                return {
                    ...mod,
                    remainingRounds: mod.remainingRounds - 1
                };
            }
            return mod;
        })
        .filter(mod => {
            // Remove expired modifiers
            if (mod.duration === 'rounds' && mod.remainingRounds <= 0) {
                return false;
            }
            return true;
        });
}

/**
 * Calculate total AC with all modifiers
 */
export function calculateAC(baseAC, modifiers) {
    return applyModifiers(baseAC, modifiers, ModifierTarget.AC);
}

/**
 * Calculate skill bonus with modifiers
 */
export function calculateSkillBonus(baseBonus, modifiers, skillId) {
    // Check for skill-specific modifiers
    const skillSpecific = applyModifiers(0, modifiers, ModifierTarget.SKILL, skillId);

    // Check for all-skills modifiers
    const allSkills = applyModifiers(0, modifiers, ModifierTarget.ALL_SKILLS);

    return {
        total: baseBonus + skillSpecific.total + allSkills.total,
        breakdown: [
            { source: 'Base', type: 'base', value: baseBonus },
            ...skillSpecific.breakdown.filter(b => b.type !== 'base'),
            ...allSkills.breakdown.filter(b => b.type !== 'base')
        ]
    };
}

/**
 * Apply modifiers from equipment
 * Helper to create modifiers from equipment
 */
export function createEquipmentModifiers(item) {
    const modifiers = [];

    if (!item || !item.effects) return modifiers;

    item.effects.forEach(effect => {
        modifiers.push(createModifier({
            name: `${item.name} (${effect.type})`,
            source: item.id,
            sourceType: 'item',
            target: effect.target,
            targetId: effect.targetId,
            type: effect.modifierType || ModifierType.BONUS,
            value: effect.value,
            duration: 'permanent' // Equipment effects are permanent while equipped
        }));
    });

    return modifiers;
}

export default {
    ModifierType,
    ModifierTarget,
    createModifier,
    applyModifiers,
    getModifiersForTarget,
    removeModifiersBySource,
    tickModifiers,
    calculateAC,
    calculateSkillBonus,
    createEquipmentModifiers
};
