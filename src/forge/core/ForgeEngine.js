/**
 * 🔥 FORGE ENGINE - Core
 * 
 * Engine agnóstica de RPG que interpreta sistemas definidos pelo usuário.
 * 
 * @version 1.0.0
 * @see /docs/FORGE_ENGINE_MANIFESTO.md
 * @see /docs/FORGE_TECHNICAL_SPEC.md
 */

import { FormulaEngine } from '../formula/FormulaEngine';
import { EventBus } from '../events/EventBus';
import { RuleEngine } from '../rules/RuleEngine';
import { ModifierStack } from '../modifiers/ModifierStack';
import { DiceRoller } from '../dice/DiceRoller';
import { normalizeField } from './IdHelpers';

/**
 * ForgeEngine - O coração do sistema
 * 
 * Responsável por:
 * - Criar e gerenciar entidades
 * - Resolver valores de campos (com fórmulas e modificadores)
 * - Disparar eventos e executar regras
 * - Rolar dados
 */
export class ForgeEngine {
    constructor(systemSchema) {
        this.schema = systemSchema;
        this.formula = new FormulaEngine();
        this.events = new EventBus();
        this.rules = new RuleEngine(this); // Passa a instância do ForgeEngine para as regras
        this.modifiers = new ModifierStack();
        this.dice = new DiceRoller();

        // Armazenamento de entidades
        this.entities = new Map(); // Map<entityId, entityState>

        // Inicializa o sistema de regras com as regras do schema
        if (systemSchema.rules) {
            this.rules.loadRules(systemSchema.rules);
        }
    }

    /**
     * Obtém o valor de um campo (resolvendo fórmulas se necessário)
     * @param {Object} entity - Estado da entidade
     * @param {string} fieldId - ID do campo (internalId ou codeId)
     * @returns {any} Valor resolvido
     */
    getValue(entity, fieldId) {
        const entityType = this.schema.entityTypes.find(e => e.id === entity.type);

        // Tentativa 1: Buscar por ID direto (internalId)
        let field = entityType?.fields.find(f => f.id === fieldId || f.internalId === fieldId);

        // Tentativa 2: Buscar por codeId
        if (!field) {
            field = entityType?.fields.find(f => f.codeId === fieldId);
        }

        if (!field) {
            console.warn(`Field "${fieldId}" not found in entity type "${entity.type}"`);
            return null;
        }

        // Normaliza para garantir internalId
        field = normalizeField(field);

        // Se tem fórmula, calcular
        if (field.formula) {
            return this.formula.evaluate(field.formula, entity.values);
        }

        // Retornar valor usando internalId
        return entity.values[field.internalId] ?? entity.values[field.id];
    }

    /**
     * Obtém o valor efetivo (base + modificadores)
     */
    getEffectiveValue(entity, fieldId) {
        const baseValue = this.getValue(entity, fieldId);
        const modifierBonus = this.modifiers.calculate(entity.modifiers, fieldId);

        if (typeof baseValue === 'number') {
            return baseValue + modifierBonus;
        }

        return baseValue;
    }

    /**
     * Define o valor de um campo
     */
    setValue(entity, fieldId, value) {
        const previousValue = entity.values[fieldId];
        entity.values[fieldId] = value;

        // Disparar evento onChange
        this.events.emit('onChange', {
            entity,
            fieldId,
            previousValue,
            newValue: value
        });

        // Executar regras associadas
        this.rules.executeForEvent('onChange', entity, { fieldId, previousValue, newValue: value });

        return entity;
    }

    // ============================================================
    // DICE ROLLING
    // ============================================================

    /**
     * Rola dados usando notação padrão
     * @param {string} formula - Ex: "2d6+3", "1d20", "4d6kh3"
     * @returns {Object} Resultado da rolagem
     */
    roll(formula) {
        return this.dice.roll(formula);
    }

    /**
     * Rola uma fórmula com contexto de entidade
     * @param {string} formula - Ex: "1d20 + {attack_bonus}"
     * @param {Object} entity - Entidade para contexto
     */
    rollWithContext(formula, entity) {
        // Primeiro resolve variáveis
        const resolvedFormula = this.formula.resolveVariables(formula, entity.values);
        return this.dice.roll(resolvedFormula);
    }

    // ============================================================
    // EVENT SYSTEM
    // ============================================================

    /**
     * Registra um listener de evento
     */
    on(eventName, callback) {
        this.events.on(eventName, callback);
    }

    /**
     * Remove um listener
     */
    off(eventName, callback) {
        this.events.off(eventName, callback);
    }

    /**
     * Dispara um evento manualmente
     */
    trigger(eventName, data) {
        this.events.emit(eventName, data);
    }

    // ============================================================
    // MODIFIERS
    // ============================================================

    /**
     * Adiciona um modificador a uma entidade
     */
    addModifier(entity, modifier) {
        const mod = {
            id: crypto.randomUUID(),
            ...modifier,
            appliedAt: new Date().toISOString()
        };

        entity.modifiers.push(mod);

        this.events.emit('onModifierAdded', { entity, modifier: mod });

        return mod;
    }

    /**
     * Remove um modificador
     */
    removeModifier(entity, modifierId) {
        const index = entity.modifiers.findIndex(m => m.id === modifierId);
        if (index !== -1) {
            const removed = entity.modifiers.splice(index, 1)[0];
            this.events.emit('onModifierRemoved', { entity, modifier: removed });
            return removed;
        }
        return null;
    }

    // ============================================================
    // UTILITIES
    // ============================================================

    /**
     * Exporta o estado completo de uma entidade (para save)
     */
    exportEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity) return null;

        return JSON.parse(JSON.stringify(entity));
    }

    /**
     * Importa o estado de uma entidade (para load)
     */
    importEntity(entityState) {
        this.entities.set(entityState.id, entityState);
        return entityState;
    }
}

// Export singleton factory
export function createForgeEngine(systemSchema) {
    return new ForgeEngine(systemSchema);
}
