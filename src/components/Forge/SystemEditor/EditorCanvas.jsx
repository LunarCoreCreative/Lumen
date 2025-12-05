import React from 'react';
import styles from './EditorCanvas.module.css';
import { BasicInfo } from './modules/BasicInfo';
import { AttributesEditor } from './modules/AttributesEditor';
import { DiceEditor } from './modules/DiceEditor';
import { SkillsEditor } from './modules/SkillsEditor';
import { ProgressionEditor } from './modules/ProgressionEditor';
import { CombatEditor } from './modules/CombatEditor';
import { EquipmentEditor } from './modules/EquipmentEditor';
// import { AttributesEditor } from './modules/AttributesEditor';
// import { DiceEditor } from './modules/DiceEditor';

export function EditorCanvas({ currentStep, systemData, onDataChange }) {
    const renderModule = () => {
        switch (currentStep) {
            case 0:
                return (
                    <BasicInfo
                        data={systemData.metadata}
                        onChange={(data) => onDataChange('metadata', data)}
                    />
                );
            case 1:
                return (
                    <AttributesEditor
                        data={systemData.attributes}
                        onChange={(data) => onDataChange('attributes', data)}
                    />
                );
            case 2:
                return (
                    <DiceEditor
                        data={systemData.dice}
                        onChange={(data) => onDataChange('dice', data)}
                    />
                );
            case 3:
                return (
                    <SkillsEditor
                        data={systemData.skills || []}
                        onChange={(data) => onDataChange('skills', data)}
                        rulesConfig={systemData.skillsRules || {}}
                        onRulesChange={(config) => onDataChange('skillsRules', config)}
                        attributes={systemData.attributes || []}
                        dice={systemData.dice || {}}
                        progression={systemData.progression || {}}
                    />
                );
            case 4:
                return (
                    <ProgressionEditor
                        data={systemData.progression}
                        onChange={(data) => onDataChange('progression', data)}
                        attributes={systemData.attributes}
                    />
                );
            case 5:
                return (
                    <CombatEditor
                        data={systemData.combat}
                        onChange={(data) => onDataChange('combat', data)}
                        attributes={systemData.attributes}
                        dice={systemData.dice}
                    />
                );
            case 6:
                return (
                    <EquipmentEditor
                        data={systemData.equipment || {}}
                        onChange={(data) => onDataChange('equipment', data)}
                        attributes={systemData.attributes || []}
                        dice={systemData.dice || {}}
                    />
                );
            default:
                return <div className={styles.placeholder}>Selecione um módulo</div>;
        }
    };

    return (
        <div className={styles.editorCanvas}>
            <div className={styles.canvasContent}>
                {renderModule()}
            </div>
        </div>
    );
}
