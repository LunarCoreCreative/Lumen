/**
 * useModifiers Hook
 * 
 * Manages character modifiers in React
 */

import { useState, useCallback, useMemo } from 'react';
import {
    createModifier,
    removeModifiersBySource,
    tickModifiers,
    createEquipmentModifiers,
    ModifierType,
    ModifierTarget
} from './modifierEngine';

/**
 * Hook to manage character modifiers
 * @param {Array} initialModifiers - Initial modifiers
 * @returns {Object} - {modifiers, addModifier, removeModifier, ...}
 */
export function useModifiers(initialModifiers = []) {
    const [modifiers, setModifiers] = useState(initialModifiers);

    // Add a single modifier
    const addModifier = useCallback((modifierConfig) => {
        const modifier = createModifier(modifierConfig);
        setModifiers(prev => [...prev, modifier]);
        return modifier.id;
    }, []);

    // Remove a specific modifier by ID
    const removeModifier = useCallback((modifierId) => {
        setModifiers(prev => prev.filter(m => m.id !== modifierId));
    }, []);

    // Remove all modifiers from a source
    const removeModifiersFromSource = useCallback((source) => {
        setModifiers(prev => removeModifiersBySource(prev, source));
    }, []);

    // Clear all modifiers
    const clearModifiers = useCallback(() => {
        setModifiers([]);
    }, []);

    // Tick all modifiers (for round-based durations)
    const tickAllModifiers = useCallback(() => {
        setModifiers(prev => tickModifiers(prev));
    }, []);

    // Remove modifiers with specific duration
    const removeModifiersByDuration = useCallback((duration) => {
        setModifiers(prev => prev.filter(m => m.duration !== duration));
    }, []);

    // Short rest - remove short rest modifiers
    const shortRest = useCallback(() => {
        removeModifiersByDuration('until_short_rest');
    }, []);

    // Long rest - remove temporary modifiers
    const longRest = useCallback(() => {
        setModifiers(prev => prev.filter(m =>
            m.duration === 'permanent' || m.duration === 'until_long_rest'
        ));
    }, []);

    // Get modifiers by target
    const getModifiersByTarget = useCallback((target, targetId = null) => {
        return modifiers.filter(mod => {
            if (mod.target !== target) return false;
            if (targetId && mod.targetId && mod.targetId !== targetId) return false;
            return true;
        });
    }, [modifiers]);

    // Equip item - add its modifiers
    const equipItem = useCallback((item) => {
        if (!item || !item.id) return;

        // Remove existing modifiers from this item
        removeModifiersFromSource(item.id);

        // Add new modifiers
        const itemModifiers = createEquipmentModifiers(item);
        setModifiers(prev => [...prev, ...itemModifiers]);
    }, [removeModifiersFromSource]);

    // Unequip item - remove its modifiers
    const unequipItem = useCallback((item) => {
        if (!item || !item.id) return;
        removeModifiersFromSource(item.id);
    }, [removeModifiersFromSource]);

    // Apply condition
    const applyCondition = useCallback((conditionConfig) => {
        // Conditions can have multiple effects
        const conditionModifiers = conditionConfig.effects?.map(effect =>
            createModifier({
                name: `${conditionConfig.name} (${effect.target})`,
                source: conditionConfig.id,
                sourceType: 'condition',
                target: effect.target,
                targetId: effect.targetId,
                type: effect.type || ModifierType.BONUS,
                value: effect.value,
                duration: conditionConfig.duration || 'until_removed'
            })
        ) || [];

        setModifiers(prev => [...prev, ...conditionModifiers]);
        return conditionConfig.id;
    }, []);

    // Remove condition
    const removeCondition = useCallback((conditionId) => {
        removeModifiersFromSource(conditionId);
    }, [removeModifiersFromSource]);

    // Get active modifier sources
    const activeSources = useMemo(() => {
        const sources = new Set();
        modifiers.forEach(mod => sources.add(mod.source));
        return Array.from(sources);
    }, [modifiers]);

    // Get modifier breakdown for display
    const getModifierBreakdown = useCallback((target, targetId = null) => {
        const targetMods = getModifiersByTarget(target, targetId);
        return {
            count: targetMods.length,
            total: targetMods.reduce((sum, mod) => {
                const value = typeof mod.value === 'number' ? mod.value : 0;
                return sum + value;
            }, 0),
            modifiers: targetMods
        };
    }, [getModifiersByTarget]);

    return {
        modifiers,
        addModifier,
        removeModifier,
        removeModifiersFromSource,
        clearModifiers,
        tickAllModifiers,
        shortRest,
        longRest,
        getModifiersByTarget,
        equipItem,
        unequipItem,
        applyCondition,
        removeCondition,
        activeSources,
        getModifierBreakdown
    };
}

export default useModifiers;
