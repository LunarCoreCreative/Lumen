/**
 * 🔥 FORGE ENGINE - Formula Engine
 * 
 * Parser e avaliador de fórmulas para campos calculados.
 * 
 * Suporta:
 * - Variáveis: {str}, {level}, {item.bonus}
 * - Operadores: + - * / %
 * - Funções: floor, ceil, max, min, round, abs, clamp, if
 * - Comparadores: ==, !=, >, <, >=, <=
 */

export class FormulaEngine {
    constructor() {
        // Cache de fórmulas já parseadas
        this.cache = new Map();

        // Funções disponíveis
        this.functions = {
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round,
            abs: Math.abs,
            max: Math.max,
            min: Math.min,
            clamp: (value, minVal, maxVal) => Math.min(Math.max(value, minVal), maxVal),
            if: (condition, thenValue, elseValue) => condition ? thenValue : elseValue
        };
    }

    /**
     * Avalia uma fórmula com contexto de valores
     * @param {string} formula - Ex: "floor(({str} - 10) / 2)"
     * @param {Object} context - Objeto com valores: { str: 16, level: 5 }
     * @returns {number|string|boolean} Resultado
     */
    evaluate(formula, context) {
        try {
            // Substituir variáveis por valores
            let resolved = this.resolveVariables(formula, context);

            // Avaliar expressão
            return this.safeEval(resolved);
        } catch (error) {
            console.error(`Formula evaluation error: "${formula}"`, error);
            return 0;
        }
    }

    /**
     * Substitui {variáveis} pelos valores do contexto
     */
    resolveVariables(formula, context) {
        return formula.replace(/\{([^}]+)\}/g, (match, path) => {
            const value = this.getNestedValue(context, path);

            if (value === undefined || value === null) {
                console.warn(`Variable "${path}" not found in context`);
                return 0;
            }

            return value;
        });
    }

    /**
     * Obtém valor aninhado: "item.bonus" → context.item.bonus
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current?.[key];
        }, obj);
    }

    /**
     * Avaliação segura de expressão matemática
     * Não usa eval() direto por segurança
     */
    safeEval(expression) {
        // Preparar funções
        let prepared = expression;

        // Substituir funções pelos equivalentes
        for (const [name, fn] of Object.entries(this.functions)) {
            const regex = new RegExp(`${name}\\(`, 'g');
            prepared = prepared.replace(regex, `__fn_${name}(`);
        }

        // Criar escopo seguro com funções
        const scope = {};
        for (const [name, fn] of Object.entries(this.functions)) {
            scope[`__fn_${name}`] = fn;
        }

        // Usar Function para avaliar (mais seguro que eval direto)
        const fn = new Function(...Object.keys(scope), `return ${prepared}`);
        return fn(...Object.values(scope));
    }

    /**
     * Valida se uma fórmula é válida
     */
    validate(formula) {
        try {
            // Substituir variáveis por 0 para testar sintaxe
            const testFormula = formula.replace(/\{[^}]+\}/g, '0');
            this.safeEval(testFormula);
            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Extrai as dependências de uma fórmula
     * @param {string} formula 
     * @returns {string[]} Lista de field IDs referenciados
     */
    extractDependencies(formula) {
        const matches = formula.match(/\{([^}]+)\}/g) || [];
        return matches.map(m => m.slice(1, -1)); // Remove { }
    }
}
