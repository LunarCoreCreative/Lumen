/**
 * 🔥 FORGE ENGINE - Dice Roller
 * 
 * Sistema de rolagem de dados com suporte a notação padrão.
 * 
 * Suporta:
 * - Básico: "1d20", "2d6", "3d8+5"
 * - Múltiplos: "2d6+1d4+3"
 * - Keep highest: "4d6kh3" (rola 4, mantém 3 maiores)
 * - Keep lowest: "4d6kl3" (rola 4, mantém 3 menores)
 * - Advantage: "2d20kh1"
 * - Disadvantage: "2d20kl1"
 */

export class DiceRoller {
    /**
     * Rola dados usando notação padrão
     * @param {string} formula - Ex: "2d6+3", "1d20", "4d6kh3"
     * @returns {Object} Resultado detalhado
     */
    roll(formula) {
        const result = {
            formula,
            rolls: [],
            total: 0,
            breakdown: []
        };

        // Dividir em partes (+ ou -)
        const parts = this.parseFormula(formula);

        for (const part of parts) {
            const partResult = this.rollPart(part);
            result.rolls.push(partResult);
            result.total += partResult.total;
            result.breakdown.push(partResult.breakdown);
        }

        return result;
    }

    /**
     * Parseia a fórmula em partes
     */
    parseFormula(formula) {
        const parts = [];
        let current = '';
        let sign = 1;

        for (let i = 0; i < formula.length; i++) {
            const char = formula[i];

            if (char === '+' || char === '-') {
                if (current.trim()) {
                    parts.push({ expression: current.trim(), sign });
                }
                sign = char === '+' ? 1 : -1;
                current = '';
            } else if (char !== ' ') {
                current += char;
            }
        }

        if (current.trim()) {
            parts.push({ expression: current.trim(), sign });
        }

        return parts;
    }

    /**
     * Rola uma parte da fórmula
     */
    rollPart(part) {
        const { expression, sign } = part;

        // Verificar se é dado ou número
        const diceMatch = expression.match(/^(\d+)?d(\d+)(kh\d+|kl\d+)?$/i);

        if (diceMatch) {
            return this.rollDice(diceMatch, sign);
        } else {
            // É um modificador numérico
            const num = parseInt(expression) || 0;
            return {
                type: 'modifier',
                value: num,
                total: num * sign,
                breakdown: `${sign > 0 ? '+' : ''}${num * sign}`
            };
        }
    }

    /**
     * Rola dados
     */
    rollDice(match, sign) {
        const count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);
        const keepRule = match[3]; // "kh3" ou "kl3"

        // Rolar todos os dados
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(this.rollSingle(sides));
        }

        // Aplicar keep rule se existir
        let keptRolls = rolls;
        let droppedRolls = [];

        if (keepRule) {
            const keepCount = parseInt(keepRule.slice(2));
            const keepHighest = keepRule.toLowerCase().startsWith('kh');

            const sorted = [...rolls].sort((a, b) => keepHighest ? b - a : a - b);
            keptRolls = sorted.slice(0, keepCount);
            droppedRolls = sorted.slice(keepCount);
        }

        // Calcular total
        const total = keptRolls.reduce((sum, r) => sum + r, 0) * sign;

        // Detectar críticos (para d20)
        const isCritical = sides === 20 && count === 1 && keptRolls[0] === 20;
        const isFumble = sides === 20 && count === 1 && keptRolls[0] === 1;

        return {
            type: 'dice',
            dice: `${count}d${sides}${keepRule || ''}`,
            rolls,
            kept: keptRolls,
            dropped: droppedRolls,
            total,
            breakdown: `[${rolls.join(', ')}]${keepRule ? ` → [${keptRolls.join(', ')}]` : ''} = ${total}`,
            critical: isCritical,
            fumble: isFumble
        };
    }

    /**
     * Rola um único dado
     */
    rollSingle(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Rola com vantagem (2d20kh1)
     */
    rollAdvantage(modifier = 0) {
        const roll = this.roll('2d20kh1');
        return {
            ...roll,
            total: roll.total + modifier,
            modifier,
            type: 'advantage'
        };
    }

    /**
     * Rola com desvantagem (2d20kl1)
     */
    rollDisadvantage(modifier = 0) {
        const roll = this.roll('2d20kl1');
        return {
            ...roll,
            total: roll.total + modifier,
            modifier,
            type: 'disadvantage'
        };
    }

    /**
     * Rola d20 normal
     */
    rollD20(modifier = 0) {
        const roll = this.roll('1d20');
        return {
            ...roll,
            total: roll.total + modifier,
            modifier,
            type: 'normal'
        };
    }

    /**
     * Rola atributos (4d6 drop lowest)
     */
    roll4d6DropLowest() {
        return this.roll('4d6kh3');
    }
}
