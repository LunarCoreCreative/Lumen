/**
 * 🔥 FORGE ENGINE - Modifier Stack
 * 
 * Gerencia modificadores (bônus/penalidades) em campos.
 */

export class ModifierStack {
    /**
     * Calcula o bônus total de modificadores para um campo
     * @param {Array} modifiers - Lista de modificadores da entidade
     * @param {string} targetField - Campo alvo
     * @returns {number} Bônus total
     */
    calculate(modifiers, targetField) {
        const applicable = modifiers.filter(m => m.target === targetField);

        let total = 0;

        for (const mod of applicable) {
            const value = this.resolveModifierValue(mod);

            switch (mod.type) {
                case 'add':
                case 'bonus':
                    total += value;
                    break;
                case 'subtract':
                case 'penalty':
                    total -= value;
                    break;
                case 'multiply':
                    // Multiplicadores são aplicados depois (não implementado ainda)
                    break;
                case 'set':
                    // Set override (não implementado ainda)
                    break;
            }
        }

        return total;
    }

    /**
     * Resolve o valor de um modificador (pode ser número ou dado)
     */
    resolveModifierValue(modifier) {
        if (typeof modifier.value === 'number') {
            return modifier.value;
        }

        if (typeof modifier.value === 'string') {
            // Se for notação de dado (ex: "+1d4"), não resolve aqui
            // Isso será resolvido no momento da rolagem
            const num = parseFloat(modifier.value);
            return isNaN(num) ? 0 : num;
        }

        return 0;
    }

    /**
     * Filtra modificadores expirados
     * @param {Array} modifiers - Lista de modificadores
     * @param {number} currentRound - Round atual (para durações em rounds)
     * @returns {Array} Modificadores ainda válidos
     */
    filterExpired(modifiers, currentRound = 0) {
        return modifiers.filter(mod => {
            if (!mod.duration) return true; // Permanente

            switch (mod.duration.type) {
                case 'rounds':
                    const startRound = mod.appliedAtRound || 0;
                    return (currentRound - startRound) < mod.duration.value;
                case 'permanent':
                    return true;
                case 'until_rest':
                    return !mod.expired; // Marcado externamente
                default:
                    return true;
            }
        });
    }

    /**
     * Agrupa modificadores por fonte para exibição
     */
    groupBySource(modifiers, targetField) {
        const applicable = modifiers.filter(m => m.target === targetField);
        const groups = {};

        for (const mod of applicable) {
            const source = mod.source || 'other';
            if (!groups[source]) {
                groups[source] = [];
            }
            groups[source].push(mod);
        }

        return groups;
    }

    /**
     * Gera breakdown para tooltip
     */
    getBreakdown(modifiers, targetField) {
        const applicable = modifiers.filter(m => m.target === targetField);

        return applicable.map(mod => ({
            name: mod.name,
            value: this.formatValue(mod),
            source: mod.source
        }));
    }

    formatValue(modifier) {
        const value = modifier.value;
        const sign = typeof value === 'number' && value >= 0 ? '+' : '';
        return `${sign}${value}`;
    }
}
