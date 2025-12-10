/**
 * useDerivedAttributes Hook
 * 
 * Auto-recalculates derived attributes when dependencies change
 * Works with formulaEngine to support configurable formulas
 */

import { useMemo } from 'react';
import { calculateFormula, calculateModifier } from './formulaEngine';

/**
 * Calculate all derived attributes based on current character state
 * @param {Object} character - Character data
 * @param {Object} system - System data
 * @returns {Object} - Map of derived attribute values
 */
export function useDerivedAttributes(character, system) {
    // Build context for formula evaluation
    const context = useMemo(() => {
        if (!system?.attributes) return {};

        return {
            level: character.level || 1,
            proficiency: Math.floor(((character.level || 1) - 1) / 4) + 2,

            // Map all attributes with their current values
            attributes: (system.attributes || []).map(attr => {
                // Get base value
                let value = character.attributes?.[attr.id] || attr.defaultValue || 10;

                // Add racial bonuses for primary attributes
                if (attr.type !== 'derived' && character.race) {
                    const race = system.races?.find(r => r.id === character.race);
                    const bonus = race?.abilityBonuses?.find(b => b.attributeId === attr.id);
                    if (bonus) value += bonus.value;
                }

                return {
                    ...attr,
                    value
                };
            }),

            // Equipment bonuses
            armor: character.equippedArmor?.armorClass || 0,
            shield: character.equippedShield ? 2 : 0,

            // Full character data for complex formulas
            character
        };
    }, [
        character.level,
        character.attributes,
        character.race,
        character.equippedArmor,
        character.equippedShield,
        system?.attributes,
        system?.races
    ]);

    // Calculate derived attributes
    const derivedValues = useMemo(() => {
        const values = {};

        if (!system?.attributes) return values;

        // Find all derived attributes
        const derivedAttrs = system.attributes.filter(attr =>
            attr.type === 'derived'
        );

        derivedAttrs.forEach(attr => {
            // If attribute has a formula, use it
            if (attr.formula) {
                try {
                    values[attr.id] = calculateFormula(attr.formula, context);
                } catch (error) {
                    console.error('Error calculating derived attribute:', error, { attr, context });
                    values[attr.id] = attr.default || 0;
                }
            } else {
                // Fallback to legacy calculation
                values[attr.id] = calculateLegacyDerived(attr, context, character, system);
            }
        });

        return values;
    }, [context, system?.attributes]);

    return derivedValues;
}

/**
 * Legacy calculation for backwards compatibility
 */
function calculateLegacyDerived(attr, context, character, system) {
    const { attributes, level, proficiency } = context;

    // Helper to find attribute
    const findAttr = (id) => attributes.find(a =>
        a.id === id ||
        a.shortName?.toLowerCase() === id.toLowerCase()
    );

    // HP - based on class
    if (attr.id === 'attr-hp' || attr.shortName === 'HP') {
        const selectedClass = system?.classes?.find(c => c.id === character.class);
        const conAttr = findAttr('con');
        const conMod = conAttr ? calculateModifier(conAttr.value) : 0;

        if (selectedClass) {
            let hp = (selectedClass.hpAtLevel1 || selectedClass.hitDie || 8) + conMod;

            if (level > 1) {
                const hpPerLevel = selectedClass.hpPerLevel ||
                    Math.floor((selectedClass.hitDie || 8) / 2) + 1;
                hp += (hpPerLevel + conMod) * (level - 1);
            }

            return Math.max(hp, level);
        }

        return attr.default || level * 8;
    }

    // AC - armor class
    if (attr.id === 'attr-ac' || attr.shortName === 'AC') {
        const dexAttr = findAttr('dex');
        const dexMod = dexAttr ? calculateModifier(dexAttr.value) : 0;
        return 10 + dexMod + context.armor + context.shield;
    }

    // Initiative
    if (attr.id === 'attr-init' || attr.shortName === 'INIT') {
        const dexAttr = findAttr('dex');
        return dexAttr ? calculateModifier(dexAttr.value) : 0;
    }

    // Proficiency Bonus
    if (attr.id === 'attr-prof' || attr.shortName === 'PROF') {
        return proficiency;
    }

    // Speed - from race
    if (attr.id === 'attr-speed' || attr.shortName === 'SPD') {
        const selectedRace = system?.races?.find(r => r.id === character.race);
        return selectedRace?.speed || attr.default || 30;
    }

    // Default
    return attr.default || 0;
}

/**
 * Get dependency list for a derived attribute
 * Used to determine when to recalculate
 */
export function getAttributeDependencies(attr) {
    if (!attr.formula) return [];

    const deps = [];
    const refPattern = /\{([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\}/g;
    let match;

    while ((match = refPattern.exec(attr.formula)) !== null) {
        deps.push(match[1]);
    }

    return deps;
}

export default useDerivedAttributes;
