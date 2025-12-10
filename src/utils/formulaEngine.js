/**
 * Formula Engine - Universal formula parser and calculator
 * 
 * Supports:
 * - Attribute references: {STR}, {DEX.mod}, {DEX.value}
 * - Math operations: +, -, *, /, ()
 * - Functions: floor, ceil, max, min, abs
 * - Character properties: {level}, {proficiency}
 * 
 * Examples:
 * - "10 + {DEX.mod} + {armor}"
 * - "floor({level} / 4) + 1"
 * - "max({STR.mod}, {DEX.mod})"
 */

/**
 * Parse and evaluate a formula with given context
 * @param {string} formula - Formula string (e.g., "10 + {DEX.mod}")
 * @param {Object} context - Context object with attributes and properties
 * @returns {number} - Calculated result
 */
export function calculateFormula(formula, context) {
    if (!formula || typeof formula !== 'string') {
        return 0;
    }

    try {
        // Replace attribute/property references with actual values
        let processedFormula = replaceReferences(formula, context);

        // Evaluate the mathematical expression
        return evaluateExpression(processedFormula);
    } catch (error) {
        console.error('Formula calculation error:', error, { formula, context });
        return 0;
    }
}

/**
 * Replace {references} with actual values from context
 * @param {string} formula - Formula with references
 * @param {Object} context - Context object
 * @returns {string} - Formula with values
 */
function replaceReferences(formula, context) {
    // Match patterns like {STR}, {DEX.mod}, {level}
    const referencePattern = /\{([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\}/g;

    return formula.replace(referencePattern, (match, reference) => {
        const value = resolveReference(reference, context);
        return value !== null && value !== undefined ? value : 0;
    });
}

/**
 * Resolve a reference to its value in context
 * @param {string} reference - Reference path (e.g., "DEX.mod")
 * @param {Object} context - Context object
 * @returns {number} - Resolved value
 */
function resolveReference(reference, context) {
    const parts = reference.split('.');

    // Handle simple references like {level}, {proficiency}
    if (parts.length === 1) {
        const key = parts[0].toLowerCase();

        // Check character-level properties first
        if (context[key] !== undefined) {
            return context[key];
        }

        // Check if it's an attribute shorthand (STR, DEX, etc)
        const attribute = findAttribute(key, context);
        if (attribute) {
            return attribute.value || 0;
        }

        return 0;
    }

    // Handle nested references like {DEX.mod}, {STR.value}
    if (parts.length === 2) {
        const [attrKey, property] = parts;
        const attribute = findAttribute(attrKey.toLowerCase(), context);

        if (!attribute) return 0;

        if (property === 'mod' || property === 'modifier') {
            return calculateModifier(attribute.value || 0);
        }

        if (property === 'value') {
            return attribute.value || 0;
        }

        // Custom property
        return attribute[property] || 0;
    }

    return 0;
}

/**
 * Find an attribute by ID or shortName
 * @param {string} key - Attribute key
 * @param {Object} context - Context object
 * @returns {Object|null} - Attribute object
 */
function findAttribute(key, context) {
    if (!context.attributes || !Array.isArray(context.attributes)) {
        return null;
    }

    return context.attributes.find(attr =>
        attr.id?.toLowerCase() === key ||
        attr.shortName?.toLowerCase() === key ||
        attr.name?.toLowerCase() === key
    );
}

/**
 * Calculate D&D-style modifier from attribute value
 * @param {number} value - Attribute value
 * @returns {number} - Modifier
 */
export function calculateModifier(value) {
    return Math.floor((value - 10) / 2);
}

/**
 * Evaluate a mathematical expression safely
 * @param {string} expression - Math expression
 * @returns {number} - Result
 */
function evaluateExpression(expression) {
    // Replace function names
    let processed = expression
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/max\(/g, 'Math.max(')
        .replace(/min\(/g, 'Math.min(')
        .replace(/round\(/g, 'Math.round(');

    // Validate expression only contains safe characters
    if (!/^[0-9+\-*/(). ,Math.floorceilabsmaxinround]+$/.test(processed)) {
        throw new Error('Invalid expression');
    }

    // Evaluate using Function constructor (safer than eval)
    try {
        const result = new Function(`return ${processed}`)();
        return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
        console.error('Expression evaluation error:', error, { expression: processed });
        return 0;
    }
}

/**
 * Validate a formula string
 * @param {string} formula - Formula to validate
 * @returns {boolean} - Is valid
 */
export function validateFormula(formula) {
    if (!formula || typeof formula !== 'string') {
        return false;
    }

    try {
        // Try to parse with mock context
        const mockContext = {
            level: 1,
            proficiency: 2,
            attributes: [
                { id: 'str', shortName: 'STR', value: 10 },
                { id: 'dex', shortName: 'DEX', value: 10 }
            ]
        };

        calculateFormula(formula, mockContext);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get all references used in a formula
 * @param {string} formula - Formula string
 * @returns {Array<string>} - List of references
 */
export function getFormulaReferences(formula) {
    if (!formula || typeof formula !== 'string') {
        return [];
    }

    const referencePattern = /\{([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\}/g;
    const references = [];
    let match;

    while ((match = referencePattern.exec(formula)) !== null) {
        references.push(match[1]);
    }

    return references;
}

/**
 * Calculate AC (Armor Class) using D&D formula
 * Helper function for common use case
 */
export function calculateAC(character, formula = "10 + {DEX.mod} + {armor} + {shield}") {
    const context = {
        ...character,
        armor: character.equippedArmor?.armorClass || 0,
        shield: character.equippedShield ? 2 : 0
    };

    return calculateFormula(formula, context);
}

/**
 * Calculate skill bonus
 * Helper function for common use case
 */
export function calculateSkillBonus(character, skill) {
    const attribute = findAttribute(skill.attributeId, character);
    const attributeModifier = attribute ? calculateModifier(attribute.value) : 0;

    const isProficient = character.proficiencies?.includes(skill.id);
    const proficiencyBonus = isProficient ? (character.proficiency || 0) : 0;

    return attributeModifier + proficiencyBonus;
}

/**
 * Calculate HP (Hit Points)
 * Helper function for common use case
 */
export function calculateMaxHP(character) {
    if (!character.class || !character.level) {
        return 0;
    }

    const classData = character.class;
    const conModifier = calculateModifier(
        findAttribute('con', character)?.value || 10
    );

    // First level HP
    let hp = classData.hpAtLevel1 || classData.hitDie || 8;
    hp += conModifier;

    // Additional levels
    if (character.level > 1) {
        const hpPerLevel = (classData.hpPerLevel || Math.floor(classData.hitDie / 2) + 1) + conModifier;
        hp += hpPerLevel * (character.level - 1);
    }

    return Math.max(hp, 1); // Minimum 1 HP
}

export default {
    calculateFormula,
    validateFormula,
    getFormulaReferences,
    calculateAC,
    calculateSkillBonus,
    calculateMaxHP,
    calculateModifier
};
