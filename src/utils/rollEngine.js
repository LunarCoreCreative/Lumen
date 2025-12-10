/**
 * Roll Engine - Universal dice rolling system
 * Supports multiple resolution systems: d20, 2d6 (PBtA), dice pool, etc.
 */

/**
 * Resolution system types
 */
export const ResolutionType = {
    TARGET_NUMBER: 'target_number',   // Roll + mods >= DC (D&D)
    RANGE_RESULT: 'range_result',     // 2d6 with ranges (PBtA)
    COUNT_SUCCESSES: 'count_successes', // Dice pool (Shadowrun, WoD)
    OPPOSED: 'opposed',               // Attacker vs Defender
    SIMPLE: 'simple'                  // Just roll dice
};

/**
 * Roll a single die
 * @param {number} sides - Number of sides (e.g., 20 for d20)
 * @returns {number} - Result 1 to sides
 */
export function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

/**
 * Parse dice notation (e.g., "2d6", "1d20+5", "4d6kh3")
 * @param {string} notation - Dice notation
 * @returns {Object} - { count, sides, modifier, keep }
 */
export function parseDiceNotation(notation) {
    if (!notation || typeof notation !== 'string') return null;

    // Remove spaces and normalize
    const clean = notation.replace(/\s/g, '').toLowerCase();

    // Find dice part (e.g. 2d6, d20, 4d6kh3, 2d20kl1)
    // 1: count (optional), 2: sides, 3: keep type (h/l), 4: keep count
    const diceRegex = /^(\d+)?d(\d+)(?:k([hl])(\d+))?/;
    const diceMatch = clean.match(diceRegex);

    if (!diceMatch) return null;

    const count = parseInt(diceMatch[1]) || 1;
    const sides = parseInt(diceMatch[2]);
    const keepType = diceMatch[3]; // 'h' or 'l'
    const keepCount = diceMatch[4] ? parseInt(diceMatch[4]) : null;

    let keepHighest = keepType === 'h' ? keepCount : null;
    let keepLowest = keepType === 'l' ? keepCount : null;

    // Remove the dice part to find modifiers
    const remaining = clean.substring(diceMatch[0].length);

    // Parse all modifiers (e.g. +3, -2, +1)
    let modifier = 0;
    const modRegex = /([+-]\d+)/g;
    const mods = remaining.match(modRegex);

    if (mods) {
        modifier = mods.reduce((sum, curr) => sum + parseInt(curr), 0);
    }

    return {
        count,
        sides,
        keepHighest,
        keepLowest,
        modifier
    };
}

/**
 * Roll dice from notation
 * @param {string} notation - Dice notation (e.g., "2d6", "1d20+5")
 * @returns {Object} - { dice: number[], total: number, notation }
 */
export function roll(notation) {
    const parsed = parseDiceNotation(notation);
    if (!parsed) {
        console.error('Invalid dice notation:', notation);
        return { dice: [], total: 0, notation };
    }

    // Roll all dice
    let dice = [];
    for (let i = 0; i < parsed.count; i++) {
        dice.push(rollDie(parsed.sides));
    }

    // Keep highest/lowest if specified
    let keptDice = [...dice];
    if (parsed.keepHighest) {
        keptDice = dice.sort((a, b) => b - a).slice(0, parsed.keepHighest);
    } else if (parsed.keepLowest) {
        keptDice = dice.sort((a, b) => a - b).slice(0, parsed.keepLowest);
    }

    const diceTotal = keptDice.reduce((sum, d) => sum + d, 0);
    const total = diceTotal + parsed.modifier;

    return {
        dice,
        keptDice,
        diceTotal,
        modifier: parsed.modifier,
        total,
        notation
    };
}

/**
 * Roll with advantage (roll twice, take higher)
 * @param {number} sides - Die sides (usually 20)
 * @param {number} modifier - Bonus to add
 * @returns {Object} - Roll result with both dice shown
 */
export function rollAdvantage(sides = 20, modifier = 0) {
    const roll1 = rollDie(sides);
    const roll2 = rollDie(sides);
    const best = Math.max(roll1, roll2);

    return {
        type: 'advantage',
        dice: [roll1, roll2],
        used: best,
        dropped: Math.min(roll1, roll2),
        modifier,
        total: best + modifier,
        natural20: best === 20,
        natural1: best === 1
    };
}

/**
 * Roll with disadvantage (roll twice, take lower)
 * @param {number} sides - Die sides (usually 20)
 * @param {number} modifier - Bonus to add
 * @returns {Object} - Roll result with both dice shown
 */
export function rollDisadvantage(sides = 20, modifier = 0) {
    const roll1 = rollDie(sides);
    const roll2 = rollDie(sides);
    const worst = Math.min(roll1, roll2);

    return {
        type: 'disadvantage',
        dice: [roll1, roll2],
        used: worst,
        dropped: Math.max(roll1, roll2),
        modifier,
        total: worst + modifier,
        natural20: worst === 20,
        natural1: worst === 1
    };
}

/**
 * D20 System Resolution (D&D, Pathfinder)
 * @param {number} modifier - Total modifier to add
 * @param {number} dc - Difficulty Class to beat
 * @param {string} advantageState - 'normal', 'advantage', 'disadvantage'
 * @returns {Object} - Complete roll result
 */
export function rollD20Check(modifier = 0, dc = 10, advantageState = 'normal') {
    let rollResult;

    if (advantageState === 'advantage') {
        rollResult = rollAdvantage(20, modifier);
    } else if (advantageState === 'disadvantage') {
        rollResult = rollDisadvantage(20, modifier);
    } else {
        const dieResult = rollDie(20);
        rollResult = {
            type: 'normal',
            dice: [dieResult],
            used: dieResult,
            modifier,
            total: dieResult + modifier,
            natural20: dieResult === 20,
            natural1: dieResult === 1
        };
    }

    return {
        ...rollResult,
        dc,
        success: rollResult.total >= dc,
        criticalSuccess: rollResult.natural20,
        criticalFailure: rollResult.natural1,
        margin: rollResult.total - dc
    };
}

/**
 * D20 Attack Roll (with critical handling)
 * @param {number} attackBonus - Attack modifier
 * @param {number} ac - Target Armor Class
 * @param {string} advantageState - 'normal', 'advantage', 'disadvantage'
 * @returns {Object} - Attack result with hit/miss/crit
 */
export function rollAttack(attackBonus = 0, ac = 10, advantageState = 'normal') {
    const result = rollD20Check(attackBonus, ac, advantageState);

    // Natural 20 always hits (critical), Natural 1 always misses
    const hit = result.natural20 ? true : (result.natural1 ? false : result.success);

    return {
        ...result,
        hit,
        critical: result.natural20,
        fumble: result.natural1
    };
}

/**
 * PBtA 2d6 Resolution (Powered by the Apocalypse)
 * @param {number} modifier - Stat modifier (-2 to +3 typically)
 * @returns {Object} - Result with success level
 */
export function rollPbtA(modifier = 0) {
    const die1 = rollDie(6);
    const die2 = rollDie(6);
    const total = die1 + die2 + modifier;

    let result;
    if (total >= 10) {
        result = 'full_success';
    } else if (total >= 7) {
        result = 'partial_success';
    } else {
        result = 'failure';
    }

    return {
        type: 'pbta',
        dice: [die1, die2],
        diceTotal: die1 + die2,
        modifier,
        total,
        result,
        resultLabel: result === 'full_success' ? 'Sucesso Total' :
            result === 'partial_success' ? 'Sucesso Parcial' : 'Falha'
    };
}

/**
 * Dice Pool Resolution (Shadowrun, WoD style)
 * @param {number} poolSize - Number of dice to roll
 * @param {number} threshold - Number to beat on each die (default 5 for d6)
 * @param {number} targetSuccesses - How many successes needed
 * @param {number} sides - Die sides (default 6)
 * @returns {Object} - Result with success count
 */
export function rollDicePool(poolSize, threshold = 5, targetSuccesses = 1, sides = 6) {
    const dice = [];
    for (let i = 0; i < poolSize; i++) {
        dice.push(rollDie(sides));
    }

    const successes = dice.filter(d => d >= threshold).length;
    const glitches = dice.filter(d => d === 1).length;

    // Critical glitch: more than half are 1s and no successes
    const criticalGlitch = glitches > poolSize / 2 && successes === 0;
    // Regular glitch: more than half are 1s
    const glitch = glitches > poolSize / 2;

    return {
        type: 'dice_pool',
        dice: dice.sort((a, b) => b - a), // Show highest first
        poolSize,
        threshold,
        successes,
        targetSuccesses,
        success: successes >= targetSuccesses,
        margin: successes - targetSuccesses,
        glitch,
        criticalGlitch
    };
}

/**
 * Exploding Dice (Savage Worlds style)
 * @param {number} sides - Die sides
 * @returns {Object} - Result with explosion tracking
 */
export function rollExploding(sides) {
    let total = 0;
    let explosions = 0;
    let rolls = [];

    let current = rollDie(sides);
    rolls.push(current);

    while (current === sides) {
        total += current;
        explosions++;
        current = rollDie(sides);
        rolls.push(current);
    }

    total += current;

    return {
        type: 'exploding',
        rolls,
        total,
        explosions,
        exploded: explosions > 0
    };
}

/**
 * Format roll result for display
 * @param {Object} result - Roll result object
 * @returns {string} - Formatted string
 */
export function formatRollResult(result) {
    if (result.type === 'advantage' || result.type === 'disadvantage') {
        return `[${result.dice.join(', ')}] → ${result.used} + ${result.modifier} = ${result.total}`;
    }
    if (result.type === 'pbta') {
        return `[${result.dice.join(' + ')}] + ${result.modifier} = ${result.total} (${result.resultLabel})`;
    }
    if (result.type === 'dice_pool') {
        return `[${result.dice.join(', ')}] → ${result.successes} sucessos`;
    }
    if (result.type === 'exploding') {
        return `[${result.rolls.join(' → ')}] = ${result.total}${result.exploded ? ' 💥' : ''}`;
    }

    // Default d20 style
    return `${result.used} + ${result.modifier} = ${result.total}`;
}
