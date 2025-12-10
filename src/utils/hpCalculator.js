/**
 * HP Calculation Helper
 * 
 * Calcula HP máximo baseado em:
 * - Hit Dice da classe (d6, d8, d10, d12)
 * - Nível do personagem
 * - Modificador de Constituição
 * - Multiclassing (futuro)
 */

/**
 * Calculate max HP for a single-class character
 * @param {Object} classData - Class data from system
 * @param {number} level - Character level
 * @param {number} conModifier - Constitution modifier
 * @returns {number} - Max HP
 */
export function calculateMaxHP(classData, level, conModifier) {
    if (!classData || !level) {
        return level || 1; // Minimum 1 HP
    }

    // Level 1: Maximum hit die + CON mod
    let hp = (classData.hpAtLevel1 || classData.hitDie || 8) + conModifier;

    // Additional levels: average roll + CON mod
    if (level > 1) {
        const hpPerLevel = classData.hpPerLevel ||
            Math.floor((classData.hitDie || 8) / 2) + 1;
        hp += (hpPerLevel + conModifier) * (level - 1);
    }

    return Math.max(hp, level); // Minimum 1 HP per level
}

/**
 * Calculate max HP for multiclass character
 * @param {Array} classes - Array of {classData, level}
 * @param {number} conModifier - Constitution modifier
 * @returns {number} - Max HP
 */
export function calculateMulticlassHP(classes, conModifier) {
    if (!classes || classes.length === 0) {
        return 1;
    }

    let totalHP = 0;
    let isFirstClass = true;

    classes.forEach(({ classData, level }) => {
        if (isFirstClass) {
            // First class: max hit die at level 1
            totalHP += (classData.hpAtLevel1 || classData.hitDie || 8) + conModifier;

            // Additional levels in first class
            if (level > 1) {
                const hpPerLevel = classData.hpPerLevel ||
                    Math.floor((classData.hitDie || 8) / 2) + 1;
                totalHP += (hpPerLevel + conModifier) * (level - 1);
            }

            isFirstClass = false;
        } else {
            // Subsequent classes: average from level 1
            const hpPerLevel = classData.hpPerLevel ||
                Math.floor((classData.hitDie || 8) / 2) + 1;
            totalHP += (hpPerLevel + conModifier) * level;
        }
    });

    return Math.max(totalHP, 1);
}

/**
 * Get HP per level breakdown for display
 * @param {Object} classData - Class data
 * @param {number} level - Character level
 * @param {number} conModifier - Constitution modifier
 * @returns {Object} - {total, breakdown: [{level, hp}]}
 */
export function getHPBreakdown(classData, level, conModifier) {
    const breakdown = [];
    let total = 0;

    // Level 1
    const level1HP = (classData.hpAtLevel1 || classData.hitDie || 8) + conModifier;
    breakdown.push({ level: 1, hp: level1HP, note: 'Max hit die' });
    total += level1HP;

    // Additional levels
    if (level > 1) {
        const hpPerLevel = (classData.hpPerLevel ||
            Math.floor((classData.hitDie || 8) / 2) + 1) + conModifier;

        for (let i = 2; i <= level; i++) {
            breakdown.push({ level: i, hp: hpPerLevel, note: 'Average' });
            total += hpPerLevel;
        }
    }

    return { total, breakdown };
}

/**
 * Calculate HP from formula context
 * Helper for formula engine integration
 */
export function calculateHPFromContext(context) {
    const { level, proficiency, attributes, character } = context;

    // Find CON
    const conAttr = attributes.find(a =>
        a.id === 'con' || a.id === 'attr-con' ||
        a.shortName?.toLowerCase() === 'con'
    );
    const conMod = conAttr ? Math.floor((conAttr.value - 10) / 2) : 0;

    // Get class
    const classData = character.classData; // Assume classData is passed in context

    if (classData) {
        return calculateMaxHP(classData, level, conMod);
    }

    // Fallback
    return level * 8 + (conMod * level);
}

export default {
    calculateMaxHP,
    calculateMulticlassHP,
    getHPBreakdown,
    calculateHPFromContext
};
