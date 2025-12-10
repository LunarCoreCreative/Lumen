/**
 * Formula Engine - Unit Tests
 */

import {
    calculateFormula,
    validateFormula,
    getFormulaReferences,
    calculateAC,
    calculateSkillBonus,
    calculateMaxHP
} from './formulaEngine';

// Mock character for testing
const mockCharacter = {
    level: 5,
    proficiency: 3,
    attributes: [
        { id: 'str', shortName: 'STR', name: 'Strength', value: 16 },
        { id: 'dex', shortName: 'DEX', name: 'Dexterity', value: 14 },
        { id: 'con', shortName: 'CON', name: 'Constitution', value: 15 },
        { id: 'int', shortName: 'INT', name: 'Intelligence', value: 10 },
        { id: 'wis', shortName: 'WIS', name: 'Wisdom', value: 12 },
        { id: 'cha', shortName: 'CHA', name: 'Charisma', value: 8 }
    ],
    proficiencies: ['athletics', 'perception'],
    class: {
        hitDie: 10,
        hpAtLevel1: 10,
        hpPerLevel: 6
    },
    equippedArmor: { armorClass: 5 },
    equippedShield: true
};

describe('Formula Engine - Basic Calculations', () => {
    test('Simple addition', () => {
        expect(calculateFormula('10 + 5', {})).toBe(15);
    });

    test('Simple subtraction', () => {
        expect(calculateFormula('20 - 7', {})).toBe(13);
    });

    test('Multiplication', () => {
        expect(calculateFormula('5 * 3', {})).toBe(15);
    });

    test('Division', () => {
        expect(calculateFormula('20 / 4', {})).toBe(5);
    });

    test('Parentheses', () => {
        expect(calculateFormula('(10 + 5) * 2', {})).toBe(30);
    });

    test('Complex expression', () => {
        expect(calculateFormula('10 + 5 * 2 - 3', {})).toBe(17);
    });
});

describe('Formula Engine - Functions', () => {
    test('floor function', () => {
        expect(calculateFormula('floor(7.8)', {})).toBe(7);
    });

    test('ceil function', () => {
        expect(calculateFormula('ceil(7.2)', {})).toBe(8);
    });

    test('max function', () => {
        expect(calculateFormula('max(5, 10, 3)', {})).toBe(10);
    });

    test('min function', () => {
        expect(calculateFormula('min(5, 10, 3)', {})).toBe(3);
    });

    test('abs function', () => {
        expect(calculateFormula('abs(-5)', {})).toBe(5);
    });
});

describe('Formula Engine - Attribute References', () => {
    test('Simple attribute value', () => {
        const result = calculateFormula('{STR}', mockCharacter);
        expect(result).toBe(16);
    });

    test('Attribute modifier', () => {
        const result = calculateFormula('{DEX.mod}', mockCharacter);
        expect(result).toBe(2); // (14 - 10) / 2 = 2
    });

    test('Attribute value explicit', () => {
        const result = calculateFormula('{STR.value}', mockCharacter);
        expect(result).toBe(16);
    });

    test('Character property', () => {
        const result = calculateFormula('{level}', mockCharacter);
        expect(result).toBe(5);
    });

    test('Proficiency bonus', () => {
        const result = calculateFormula('{proficiency}', mockCharacter);
        expect(result).toBe(3);
    });
});

describe('Formula Engine - Complex Formulas', () => {
    test('D&D AC formula', () => {
        const context = {
            ...mockCharacter,
            armor: 5,
            shield: 2
        };
        const result = calculateFormula('10 + {DEX.mod} + {armor} + {shield}', context);
        expect(result).toBe(19); // 10 + 2 + 5 + 2
    });

    test('Proficiency bonus formula (D&D)', () => {
        const result = calculateFormula('floor({level} / 4) + 1', mockCharacter);
        expect(result).toBe(2); // floor(5/4) + 1 = 1 + 1
    });

    test('Initiative formula', () => {
        const result = calculateFormula('{DEX.mod} + floor({level} / 2)', mockCharacter);
        expect(result).toBe(4); // 2 + floor(5/2) = 2 + 2
    });

    test('Max HP formula', () => {
        const result = calculateFormula('10 + {CON.mod} + ({level} - 1) * (6 + {CON.mod})', mockCharacter);
        expect(result).toBe(42); // 10 + 2 + (4 * 8) = 10 + 2 + 32
    });

    test('Attack bonus formula', () => {
        const result = calculateFormula('{proficiency} + {STR.mod}', mockCharacter);
        expect(result).toBe(6); // 3 + 3
    });
});

describe('Formula Engine - Edge Cases', () => {
    test('Empty formula', () => {
        expect(calculateFormula('', {})).toBe(0);
    });

    test('Null formula', () => {
        expect(calculateFormula(null, {})).toBe(0);
    });

    test('Undefined formula', () => {
        expect(calculateFormula(undefined, {})).toBe(0);
    });

    test('Invalid reference', () => {
        expect(calculateFormula('{INVALID}', mockCharacter)).toBe(0);
    });

    test('Missing context', () => {
        expect(calculateFormula('{STR}', {})).toBe(0);
    });

    test('Division by zero', () => {
        const result = calculateFormula('10 / 0', {});
        expect(result).toBe(Infinity);
    });
});

describe('Formula Validation', () => {
    test('Valid formula', () => {
        expect(validateFormula('10 + {DEX.mod}')).toBe(true);
    });

    test('Valid complex formula', () => {
        expect(validateFormula('floor({level} / 4) + 1')).toBe(true);
    });

    test('Invalid formula - empty', () => {
        expect(validateFormula('')).toBe(false);
    });

    test('Invalid formula - null', () => {
        expect(validateFormula(null)).toBe(false);
    });
});

describe('Get Formula References', () => {
    test('Simple reference', () => {
        const refs = getFormulaReferences('{STR}');
        expect(refs).toEqual(['STR']);
    });

    test('Multiple references', () => {
        const refs = getFormulaReferences('{STR} + {DEX.mod} + {level}');
        expect(refs).toEqual(['STR', 'DEX.mod', 'level']);
    });

    test('Nested property reference', () => {
        const refs = getFormulaReferences('10 + {DEX.mod}');
        expect(refs).toEqual(['DEX.mod']);
    });

    test('No references', () => {
        const refs = getFormulaReferences('10 + 5');
        expect(refs).toEqual([]);
    });
});

describe('Helper Functions', () => {
    test('Calculate AC', () => {
        const ac = calculateAC(mockCharacter);
        expect(ac).toBe(19); // 10 + 2 (DEX) + 5 (armor) + 2 (shield)
    });

    test('Calculate AC without shield', () => {
        const char = { ...mockCharacter, equippedShield: false };
        const ac = calculateAC(char);
        expect(ac).toBe(17); // 10 + 2 (DEX) + 5 (armor)
    });

    test('Calculate Skill Bonus - Proficient', () => {
        const skill = { id: 'athletics', attributeId: 'str' };
        const bonus = calculateSkillBonus(mockCharacter, skill);
        expect(bonus).toBe(6); // 3 (STR mod) + 3 (proficiency)
    });

    test('Calculate Skill Bonus - Not Proficient', () => {
        const skill = { id: 'arcana', attributeId: 'int' };
        const bonus = calculateSkillBonus(mockCharacter, skill);
        expect(bonus).toBe(0); // 0 (INT mod) + 0 (no proficiency)
    });

    test('Calculate Max HP', () => {
        const hp = calculateMaxHP(mockCharacter);
        expect(hp).toBe(42); // 10 + 2 (level 1) + (6 + 2) * 4 (levels 2-5)
    });
});

// Run tests with: npm test formulaEngine.test.js
