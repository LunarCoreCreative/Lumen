/**
 * Weapon Attack Calculator
 * Calculates attack bonus and damage for equipped weapons
 * 
 * D&D 5e Formulas:
 * Attack Bonus = Proficiency + Ability Modifier + Magic Bonus
 * Damage = Weapon Dice + Ability Modifier + Magic Bonus
 */

import { calculateModifier } from './formulaEngine';

/**
 * Get the attribute modifier for a weapon attack
 * @param {Object} weapon - Weapon data with bonuses.toHit/toDamage
 * @param {Object} character - Character data with attributes
 * @param {Object} system - System data with attribute definitions
 * @param {string} type - 'toHit' or 'toDamage'
 * @returns {number} The modifier value
 */
function getWeaponAbilityModifier(weapon, character, system, type = 'toHit') {
    const bonusAttrId = weapon.bonuses?.[type];

    if (!bonusAttrId) {
        // Default: STR for melee, DEX for ranged
        const isRanged = weapon.properties?.includes('ranged');
        const defaultAttr = isRanged ? 'attr-dex' : 'attr-str';
        return getAttributeModifier(character, system, defaultAttr);
    }

    // Finesse: use higher of STR or DEX
    if (weapon.properties?.includes('finesse')) {
        const strMod = getAttributeModifier(character, system, 'attr-str');
        const dexMod = getAttributeModifier(character, system, 'attr-dex');
        return Math.max(strMod, dexMod);
    }

    return getAttributeModifier(character, system, bonusAttrId);
}

/**
 * Get attribute modifier from character
 */
function getAttributeModifier(character, system, attrId) {
    // Find attribute value from character
    const attrValue = character.attributes?.[attrId] || 10;

    // Find attribute definition in system
    const attrDef = system?.attributes?.find(a => a.id === attrId);

    // Calculate modifier based on system formula or default D&D
    if (attrDef?.modifierFormula) {
        try {
            // Use the formula from the attribute definition
            const formula = attrDef.modifierFormula.replace('value', attrValue);
            return Math.floor(eval(formula));
        } catch {
            return calculateModifier(attrValue);
        }
    }

    return calculateModifier(attrValue);
}

/**
 * Calculate proficiency bonus based on level
 * @param {number} level - Character level
 * @returns {number} Proficiency bonus
 */
function getProficiencyBonus(level) {
    return Math.floor((level - 1) / 4) + 2;
}

/**
 * Check if character is proficient with weapon
 * @param {Object} weapon - Weapon data
 * @param {Object} character - Character data
 * @param {Object} system - System data
 * @returns {boolean}
 */
export function hasWeaponProficiency(weapon, character, system) {
    const classId = character.class;
    const classDef = system?.classes?.find(c => c.id === classId);

    if (!classDef?.proficiencies?.weapons) return false;

    const weaponProfs = classDef.proficiencies.weapons;

    // Check if proficient with: simple, martial, or specific weapon
    if (weaponProfs.includes('martial') && weapon.type === 'weapon') return true;
    if (weaponProfs.includes('simple') && weapon.type === 'weapon') return true;
    if (weaponProfs.includes(weapon.id)) return true;

    // Check for specific weapon names (e.g., 'longswords', 'rapiers')
    const weaponName = weapon.name?.toLowerCase();
    if (weaponProfs.some(p => weaponName?.includes(p.replace('s', '')))) return true;

    return false;
}

/**
 * Calculate attack bonus for a weapon
 * @param {Object} weapon - Weapon data
 * @param {Object} character - Character with attributes and level
 * @param {Object} system - System configuration
 * @returns {number} Total attack bonus
 */
export function calculateAttackBonus(weapon, character, system) {
    if (!weapon || !character) return 0;

    // 1. Ability modifier (STR, DEX, or best for finesse)
    const abilityMod = getWeaponAbilityModifier(weapon, character, system, 'toHit');

    // 2. Proficiency bonus (if proficient)
    const level = character.level || 1;
    const profBonus = hasWeaponProficiency(weapon, character, system)
        ? getProficiencyBonus(level)
        : 0;

    // 3. Magic/Item bonus (from weapon effects)
    let magicBonus = 0;
    if (weapon.effects) {
        const attackEffect = weapon.effects.find(e =>
            e.target === 'attack' || e.target === 'melee_attack' || e.target === 'ranged_attack'
        );
        if (attackEffect && typeof attackEffect.value === 'number') {
            magicBonus = attackEffect.value;
        }
    }

    // 4. Enchantment bonus (e.g., +1, +2 weapons)
    if (weapon.enchantment) {
        magicBonus += weapon.enchantment;
    }

    return abilityMod + profBonus + magicBonus;
}

/**
 * Calculate damage modifier for a weapon (not including dice)
 * @param {Object} weapon - Weapon data
 * @param {Object} character - Character with attributes
 * @param {Object} system - System configuration
 * @returns {number} Damage modifier
 */
export function calculateDamageModifier(weapon, character, system) {
    if (!weapon || !character) return 0;

    // 1. Ability modifier
    const abilityMod = getWeaponAbilityModifier(weapon, character, system, 'toDamage');

    // 2. Magic/Item bonus
    let magicBonus = 0;
    if (weapon.effects) {
        const damageEffect = weapon.effects.find(e =>
            e.target === 'damage' || e.target === 'melee_damage' || e.target === 'ranged_damage'
        );
        if (damageEffect && typeof damageEffect.value === 'number') {
            magicBonus = damageEffect.value;
        }
    }

    // 3. Enchantment bonus
    if (weapon.enchantment) {
        magicBonus += weapon.enchantment;
    }

    return abilityMod + magicBonus;
}

/**
 * Format attack string for display
 * @param {Object} weapon - Weapon data
 * @param {Object} character - Character data
 * @param {Object} system - System configuration
 * @returns {Object} { attackBonus: "+5", damage: "1d8+3", damageType: "slashing" }
 */
export function formatWeaponStats(weapon, character, system) {
    const attackBonus = calculateAttackBonus(weapon, character, system);
    const damageBonus = calculateDamageModifier(weapon, character, system);

    // Format attack bonus with sign
    const attackStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;

    // Format damage
    const baseDamage = weapon.damage || '1d6';
    let damageStr = baseDamage;

    if (damageBonus > 0) {
        damageStr = `${baseDamage}+${damageBonus}`;
    } else if (damageBonus < 0) {
        damageStr = `${baseDamage}${damageBonus}`;
    }

    return {
        attackBonus: attackStr,
        damage: damageStr,
        damageType: weapon.damageType || 'physical',
        damageTypeName: getDamageTypeName(weapon.damageType),
        isProficient: hasWeaponProficiency(weapon, character, system),
        range: weapon.range || '',
        properties: weapon.properties || []
    };
}

/**
 * Get localized damage type name
 */
function getDamageTypeName(type) {
    const names = {
        slashing: 'Cortante',
        piercing: 'Perfurante',
        bludgeoning: 'Contundente',
        fire: 'Fogo',
        cold: 'Gelo',
        lightning: 'Elétrico',
        poison: 'Veneno',
        acid: 'Ácido',
        necrotic: 'Necrótico',
        radiant: 'Radiante',
        psychic: 'Psíquico',
        force: 'Força',
        thunder: 'Trovão'
    };
    return names[type] || type || 'Físico';
}

/**
 * Get all equipped weapons from character inventory
 * @param {Object} character - Character data
 * @param {Object} system - System configuration
 * @returns {Array} Array of equipped weapons with stats
 */
export function getEquippedWeapons(character, system) {
    const equippedItems = character.equippedItems || [];
    const allItems = system?.equipment?.items || [];

    return equippedItems
        .map(itemId => allItems.find(i => i.id === itemId))
        .filter(item => item && (item.type === 'weapon' || item.category === 'weapons'))
        .map(weapon => ({
            ...weapon,
            stats: formatWeaponStats(weapon, character, system)
        }));
}
