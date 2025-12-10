/**
 * 🔥 FORGE ENGINE - Rule Engine
 * 
 * Motor de regras IF → THEN para automações.
 */

export class RuleEngine {
    constructor(forgeEngine) {
        this.engine = forgeEngine;
    }

    /**
     * Executa todas as regras associadas a um evento
     * @param {string} eventType - Tipo do evento (onChange, onClick, etc)
     * @param {Object} entity - Entidade afetada
     * @param {Object} eventData - Dados do evento
     */
    executeForEvent(eventType, entity, eventData = {}) {
        const entityType = this.engine.schema.entityTypes.find(e => e.id === entity.type);
        if (!entityType) return;

        // Coletar regras do tipo de entidade + globais
        const rules = [
            ...(entityType.rules || []),
            ...(this.engine.schema.globalRules || [])
        ];

        // Filtrar regras pelo evento
        const applicableRules = rules.filter(rule => {
            if (rule.event !== eventType) return false;

            // Se a regra especifica um campo, verificar se é o campo afetado
            if (rule.field && eventData.fieldId && rule.field !== eventData.fieldId) {
                return false;
            }

            return true;
        });

        // Executar regras em ordem
        for (const rule of applicableRules) {
            this.executeRule(rule, entity, eventData);
        }
    }

    /**
     * Executa uma regra específica
     */
    executeRule(rule, entity, eventData) {
        // Verificar condições
        if (!this.evaluateConditions(rule.conditions, entity, eventData)) {
            return;
        }

        // Executar efeitos
        for (const effect of rule.effects || []) {
            this.executeEffect(effect, entity, eventData);
        }
    }

    /**
     * Avalia todas as condições de uma regra
     * @returns {boolean} true se todas as condições passam
     */
    evaluateConditions(conditions, entity, eventData) {
        if (!conditions || conditions.length === 0) {
            return true;
        }

        return conditions.every(condition => {
            return this.evaluateCondition(condition, entity, eventData);
        });
    }

    /**
     * Avalia uma condição individual
     */
    evaluateCondition(condition, entity, eventData) {
        let value;

        // Obter valor do campo
        if (condition.field === '_previous') {
            value = eventData.previousValue;
        } else if (condition.field === '_new') {
            value = eventData.newValue;
        } else {
            value = this.engine.getValue(entity, condition.field);
        }

        // Resolver o valor de comparação (pode ser fórmula)
        let compareValue = condition.value;
        if (typeof compareValue === 'string' && compareValue.includes('{')) {
            compareValue = this.engine.formula.evaluate(compareValue, entity.values);
        }

        // Aplicar operador
        return this.applyOperator(value, condition.operator, compareValue);
    }

    /**
     * Aplica operador de comparação
     */
    applyOperator(left, operator, right) {
        switch (operator) {
            case '==': return left == right;
            case '===': return left === right;
            case '!=': return left != right;
            case '!==': return left !== right;
            case '>': return left > right;
            case '<': return left < right;
            case '>=': return left >= right;
            case '<=': return left <= right;
            case 'contains': return String(left).includes(String(right));
            case 'not_contains': return !String(left).includes(String(right));
            case 'is_empty': return left === null || left === undefined || left === '';
            case 'is_not_empty': return left !== null && left !== undefined && left !== '';
            default:
                console.warn(`Unknown operator: ${operator}`);
                return false;
        }
    }

    /**
     * Executa um efeito
     */
    executeEffect(effect, entity, eventData) {
        switch (effect.type) {
            case 'set_value':
                this.effectSetValue(effect, entity);
                break;
            case 'add_value':
                this.effectAddValue(effect, entity);
                break;
            case 'subtract_value':
                this.effectSubtractValue(effect, entity);
                break;
            case 'multiply_value':
                this.effectMultiplyValue(effect, entity);
                break;
            case 'roll_dice':
                this.effectRollDice(effect, entity);
                break;
            case 'show_message':
                this.effectShowMessage(effect, entity);
                break;
            case 'trigger_event':
                this.effectTriggerEvent(effect, entity);
                break;
            case 'add_modifier':
                this.effectAddModifier(effect, entity);
                break;
            default:
                console.warn(`Unknown effect type: ${effect.type}`);
        }
    }

    // ============================================================
    // EFFECT IMPLEMENTATIONS
    // ============================================================

    effectSetValue(effect, entity) {
        let value = effect.value;
        if (typeof value === 'string' && value.includes('{')) {
            value = this.engine.formula.evaluate(value, entity.values);
        }
        entity.values[effect.target] = value;
    }

    effectAddValue(effect, entity) {
        let amount = effect.value;
        if (typeof amount === 'string') {
            amount = this.engine.formula.evaluate(amount, entity.values);
        }
        entity.values[effect.target] = (entity.values[effect.target] || 0) + amount;
    }

    effectSubtractValue(effect, entity) {
        let amount = effect.value;
        if (typeof amount === 'string') {
            amount = this.engine.formula.evaluate(amount, entity.values);
        }
        entity.values[effect.target] = (entity.values[effect.target] || 0) - amount;
    }

    effectMultiplyValue(effect, entity) {
        let multiplier = effect.value;
        if (typeof multiplier === 'string') {
            multiplier = this.engine.formula.evaluate(multiplier, entity.values);
        }
        entity.values[effect.target] = (entity.values[effect.target] || 0) * multiplier;
    }

    effectRollDice(effect, entity) {
        let formula = effect.formula;
        if (formula.includes('{')) {
            formula = this.engine.formula.resolveVariables(formula, entity.values);
        }
        const result = this.engine.dice.roll(formula);

        if (effect.target) {
            entity.values[effect.target] = result.total;
        }

        this.engine.events.emit('onRoll', { entity, formula, result });
    }

    effectShowMessage(effect, entity) {
        let message = effect.message;
        // Substituir variáveis na mensagem
        message = message.replace(/\{([^}]+)\}/g, (match, path) => {
            return entity.values[path] ?? match;
        });

        this.engine.events.emit('onMessage', { entity, message, type: effect.messageType || 'info' });
    }

    effectTriggerEvent(effect, entity) {
        this.engine.events.emit(effect.eventName, { entity, ...effect.eventData });
    }

    effectAddModifier(effect, entity) {
        this.engine.addModifier(entity, {
            name: effect.name,
            target: effect.target,
            value: effect.value,
            type: effect.modifierType || 'add',
            duration: effect.duration,
            source: effect.source || 'rule'
        });
    }
}
