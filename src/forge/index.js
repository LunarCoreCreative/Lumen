/**
 * 🔥 FORGE ENGINE
 * 
 * Engine agnóstica de RPG que permite criar sistemas completos,
 * fichas dinâmicas e mesas automatizadas usando apenas lógica visual.
 * 
 * @version 1.0.0
 * @see /docs/FORGE_ENGINE_MANIFESTO.md
 */

// Core
export { ForgeEngine, createForgeEngine } from './core/ForgeEngine';

// Formula
export { FormulaEngine } from './formula/FormulaEngine';

// Events
export { EventBus } from './events/EventBus';

// Rules
export { RuleEngine } from './rules/RuleEngine';

// Modifiers
export { ModifierStack } from './modifiers/ModifierStack';

// Dice
export { DiceRoller } from './dice/DiceRoller';
