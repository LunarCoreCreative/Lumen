/**
 * Spell Slot Calculator
 * Calculates available spell slots based on class and level (D&D 5e)
 */

// ============================================
// SPELL SLOT TABLES (D&D 5e)
// ============================================

/**
 * Full Caster Spell Slot Progression
 * Classes: Wizard, Cleric, Druid, Bard, Sorcerer
 */
const FULL_CASTER_SLOTS = {
    1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
    2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
    3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
    4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
    5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
    6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
    7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
    8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
    9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
    10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
    15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
    18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
    19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
    20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

/**
 * Half Caster Spell Slot Progression
 * Classes: Paladin, Ranger
 * Uses full caster table at half level (round down)
 */
const HALF_CASTER_SLOTS = {
    1:  [0, 0, 0, 0, 0, 0, 0, 0, 0], // No spells at level 1
    2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
    3:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
    4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
    5:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
    6:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
    7:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
    8:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
    9:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
    10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
    19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    20: [4, 3, 3, 3, 2, 0, 0, 0, 0]
};

/**
 * Third Caster Spell Slot Progression
 * Subclasses: Arcane Trickster, Eldritch Knight
 * Uses full caster table at 1/3 level (round down)
 */
const THIRD_CASTER_SLOTS = {
    1:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
    2:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
    3:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
    4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
    5:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
    6:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
    7:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
    8:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
    9:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
    10: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    11: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    12: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    13: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    14: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    15: [4, 3, 2, 0, 0, 0, 0, 0, 0],
    16: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    17: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    18: [4, 3, 3, 0, 0, 0, 0, 0, 0],
    19: [4, 3, 3, 1, 0, 0, 0, 0, 0],
    20: [4, 3, 3, 1, 0, 0, 0, 0, 0]
};

/**
 * Warlock Pact Magic Slots (special)
 * All slots are same level, recover on short rest
 */
const WARLOCK_SLOTS = {
    1:  { count: 1, level: 1 },
    2:  { count: 2, level: 1 },
    3:  { count: 2, level: 2 },
    4:  { count: 2, level: 2 },
    5:  { count: 2, level: 3 },
    6:  { count: 2, level: 3 },
    7:  { count: 2, level: 4 },
    8:  { count: 2, level: 4 },
    9:  { count: 2, level: 5 },
    10: { count: 2, level: 5 },
    11: { count: 3, level: 5 },
    12: { count: 3, level: 5 },
    13: { count: 3, level: 5 },
    14: { count: 3, level: 5 },
    15: { count: 3, level: 5 },
    16: { count: 3, level: 5 },
    17: { count: 4, level: 5 },
    18: { count: 4, level: 5 },
    19: { count: 4, level: 5 },
    20: { count: 4, level: 5 }
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Get spell slots for a character
 * @param {number} level - Character level
 * @param {string} casterType - 'full', 'half', 'third', 'warlock', 'none'
 * @returns {Object} Spell slots by level { 1: 2, 2: 0, ... }
 */
export function getSpellSlots(level, casterType = 'none') {
    const clampedLevel = Math.min(20, Math.max(1, level || 1));
    
    let slots = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    switch (casterType) {
        case 'full':
            slots = FULL_CASTER_SLOTS[clampedLevel] || slots;
            break;
        case 'half':
            slots = HALF_CASTER_SLOTS[clampedLevel] || slots;
            break;
        case 'third':
            slots = THIRD_CASTER_SLOTS[clampedLevel] || slots;
            break;
        case 'warlock':
            return getWarlockSlots(clampedLevel);
        case 'none':
        default:
            return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    }
    
    return {
        1: slots[0],
        2: slots[1],
        3: slots[2],
        4: slots[3],
        5: slots[4],
        6: slots[5],
        7: slots[6],
        8: slots[7],
        9: slots[8]
    };
}

/**
 * Get warlock pact magic slots
 */
function getWarlockSlots(level) {
    const pact = WARLOCK_SLOTS[level];
    const slots = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    
    // Warlock slots are all the same level
    slots[pact.level] = pact.count;
    
    return {
        ...slots,
        pactMagic: true,
        pactSlotLevel: pact.level,
        pactSlotCount: pact.count
    };
}

/**
 * Get maximum spell level available
 * @param {number} level - Character level
 * @param {string} casterType - Caster type
 * @returns {number} Max spell level (0-9)
 */
export function getMaxSpellLevel(level, casterType = 'none') {
    const slots = getSpellSlots(level, casterType);
    
    for (let i = 9; i >= 1; i--) {
        if (slots[i] > 0) return i;
    }
    
    return 0;
}

/**
 * Get caster type from class definition
 * @param {string} classId - Class ID
 * @param {Object} system - System data with classes
 * @returns {string} 'full', 'half', 'third', 'warlock', 'none'
 */
export function getCasterType(classId, system) {
    if (!classId || !system?.classes) return 'none';
    
    const classDef = system.classes.find(c => c.id === classId);
    if (!classDef) return 'none';
    
    // Check for spellcasting config
    if (classDef.spellcasting?.type) {
        return classDef.spellcasting.type;
    }
    
    // Legacy: Check by class ID
    const fullCasters = ['class-wizard', 'class-cleric', 'class-druid', 'class-bard', 'class-sorcerer'];
    const halfCasters = ['class-paladin', 'class-ranger'];
    const warlocks = ['class-warlock'];
    
    if (fullCasters.includes(classId)) return 'full';
    if (halfCasters.includes(classId)) return 'half';
    if (warlocks.includes(classId)) return 'warlock';
    
    // Check for spellcasting feature
    const hasSpellcasting = classDef.features?.some(f => 
        f.name?.toLowerCase().includes('conjuração') || 
        f.name?.toLowerCase().includes('spellcasting')
    );
    
    return hasSpellcasting ? 'full' : 'none';
}

/**
 * Get spellcasting ability modifier
 * @param {Object} character - Character data
 * @param {Object} system - System data
 * @returns {Object} { attribute: 'INT', modifier: 3 }
 */
export function getSpellcastingAbility(character, system) {
    const classId = character.class;
    const classDef = system?.classes?.find(c => c.id === classId);
    
    // Get from class spellcasting config
    const attrId = classDef?.spellcasting?.attribute || 'attr-int';
    
    // Calculate modifier
    const attrValue = character.attributes?.[attrId] || 10;
    const modifier = Math.floor((attrValue - 10) / 2);
    
    // Get short name
    const attrDef = system?.attributes?.find(a => a.id === attrId);
    const shortName = attrDef?.shortName || attrId.replace('attr-', '').toUpperCase();
    
    return {
        attributeId: attrId,
        attributeName: shortName,
        value: attrValue,
        modifier
    };
}

/**
 * Calculate Spell Save DC
 * @param {Object} character - Character data
 * @param {Object} system - System data
 * @returns {number} Spell DC = 8 + prof + ability mod
 */
export function getSpellSaveDC(character, system) {
    const profBonus = Math.floor((character.level - 1) / 4) + 2;
    const ability = getSpellcastingAbility(character, system);
    
    return 8 + profBonus + ability.modifier;
}

/**
 * Calculate Spell Attack Bonus
 * @param {Object} character - Character data
 * @param {Object} system - System data
 * @returns {number} Spell attack = prof + ability mod
 */
export function getSpellAttackBonus(character, system) {
    const profBonus = Math.floor((character.level - 1) / 4) + 2;
    const ability = getSpellcastingAbility(character, system);
    
    return profBonus + ability.modifier;
}

/**
 * Initialize used slots for a character
 * @param {number} level - Character level
 * @param {string} casterType - Caster type
 * @returns {Object} Used slots (all zeros) { 1: 0, 2: 0, ... }
 */
export function initializeUsedSlots(level, casterType) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
}

/**
 * Get remaining slots (max - used)
 * @param {Object} maxSlots - Maximum slots
 * @param {Object} usedSlots - Used slots
 * @returns {Object} Remaining slots
 */
export function getRemainingSlots(maxSlots, usedSlots = {}) {
    const remaining = {};
    for (let i = 1; i <= 9; i++) {
        remaining[i] = Math.max(0, (maxSlots[i] || 0) - (usedSlots[i] || 0));
    }
    return remaining;
}
