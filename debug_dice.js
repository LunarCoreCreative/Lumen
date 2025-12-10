
class DiceRoller {
    roll(formula) {
        const result = { formula, rolls: [], total: 0, breakdown: [] };
        const parts = this.parseFormula(formula);
        for (const part of parts) {
            const partResult = this.rollPart(part);
            result.rolls.push(partResult);
            result.total += partResult.total;
            result.breakdown.push(partResult.breakdown);
        }
        return result;
    }

    parseFormula(formula) {
        const parts = [];
        let current = '';
        let sign = 1;
        for (let i = 0; i < formula.length; i++) {
            const char = formula[i];
            if (char === '+' || char === '-') {
                if (current.trim()) parts.push({ expression: current.trim(), sign });
                sign = char === '+' ? 1 : -1;
                current = '';
            } else if (char !== ' ') {
                current += char;
            }
        }
        if (current.trim()) parts.push({ expression: current.trim(), sign });
        return parts;
    }

    rollPart(part) {
        const { expression, sign } = part;
        const diceMatch = expression.match(/^(\d+)?d(\d+)(kh\d+|kl\d+)?$/i);
        if (diceMatch) {
            return this.rollDice(diceMatch, sign);
        } else {
            const num = parseInt(expression) || 0;
            return { type: 'modifier', value: num, total: num * sign };
        }
    }

    rollDice(match, sign) {
        const count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);
        const keepRule = match[3];

        const rolls = [];
        for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);

        let keptRolls = rolls;
        if (keepRule) {
            const keepCount = parseInt(keepRule.slice(2));
            const keepHighest = keepRule.toLowerCase().startsWith('kh');
            const sorted = [...rolls].sort((a, b) => keepHighest ? b - a : a - b);
            keptRolls = sorted.slice(0, keepCount);
        }

        const total = keptRolls.reduce((sum, r) => sum + r, 0) * sign;
        console.log(`Debug: ${match[0]} -> Rolls: ${rolls}, Kept: ${keptRolls}, Total: ${total}`);

        return {
            kept: keptRolls,
            total,
            dice: match[0]
        };
    }
}

// Test Case
const roller = new DiceRoller();
const result = roller.roll('4d6kh3');
console.log('Result:', JSON.stringify(result, null, 2));

const expected = result.total >= 3 && result.total <= 18 && result.kept && result.kept.length === 3;
console.log('Test Passed:', expected);
