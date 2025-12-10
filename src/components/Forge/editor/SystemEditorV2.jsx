import React, { useState, useCallback } from 'react';
import styles from './Editor.module.css';
import { ArrowLeft, Save, Database, Layers, Zap, GitBranch, Layout, CheckCircle } from 'lucide-react';
import { FieldEditor } from './modules/FieldEditor';
import { EntityEditor } from './modules/EntityEditor';
import { EventEditor } from './modules/EventEditor';
import { RuleEditor } from './modules/RuleEditor';
import { LayoutEditorModal } from './modules/LayoutEditorModal';

/**
 * SystemEditorV2 - Editor Visual de Sistemas de RPG
 * 
 * Fase 2 do Forge Engine - Permite criar sistemas completos visualmente.
 */

const TABS = [
    { id: 'fields', label: 'Campos', icon: Database, description: 'Defina os campos do sistema' },
    { id: 'entities', label: 'Entidades', icon: Layers, description: 'Tipos de entidade (personagem, item, etc.)' },
    { id: 'events', label: 'Eventos', icon: Zap, description: 'Gatilhos e triggers' },
    { id: 'rules', label: 'Regras', icon: GitBranch, description: 'Automações IF → THEN' },
    { id: 'layout', label: 'Layout', icon: Layout, description: 'Designer visual da ficha' }
];

// Schema padrão para novo sistema
const DEFAULT_SYSTEM = {
    id: null,
    metadata: {
        name: 'Novo Sistema',
        description: '',
        version: '1.0.0',
        author: ''
    },
    fields: [],
    entityTypes: [],
    events: [],
    rules: [],
    layouts: {}
};

export function SystemEditorV2({ user, systemId, initialData, onBack, onSave }) {
    const [activeTab, setActiveTab] = useState('fields');
    const [systemData, setSystemData] = useState(initialData || DEFAULT_SYSTEM);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [showLayoutModal, setShowLayoutModal] = useState(false);

    // Handler genérico para atualizar partes do sistema
    const updateSystem = useCallback((module, data) => {
        setSystemData(prev => ({
            ...prev,
            [module]: data
        }));
        setHasChanges(true);
    }, []);

    // Handler para salvar
    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (onSave) {
                await onSave(systemData);
            }
            setToast({ type: 'success', message: 'Sistema salvo com sucesso!' });
            setHasChanges(false);
        } catch (error) {
            setToast({ type: 'error', message: 'Erro ao salvar: ' + error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    // Renderiza o conteúdo da tab ativa
    const renderTabContent = () => {
        switch (activeTab) {
            case 'fields':
                return (
                    <FieldEditor
                        fields={systemData.fields}
                        onChange={(fields) => updateSystem('fields', fields)}
                    />
                );
            case 'entities':
                return (
                    <EntityEditor
                        entityTypes={systemData.entityTypes}
                        fields={systemData.fields}
                        onChange={(entityTypes) => updateSystem('entityTypes', entityTypes)}
                    />
                );
            case 'events':
                return (
                    <EventEditor
                        events={systemData.events}
                        entityTypes={systemData.entityTypes}
                        fields={systemData.fields}
                        rules={systemData.rules}
                        onChange={(events) => updateSystem('events', events)}
                    />
                );
            case 'rules':
                return (
                    <RuleEditor
                        rules={systemData.rules}
                        events={systemData.events}
                        fields={systemData.fields}
                        entityTypes={systemData.entityTypes}
                        onChange={(rules) => updateSystem('rules', rules)}
                    />
                );
            case 'layout':
                return (
                    <div className={styles.layoutLauncher}>
                        <div className={styles.layoutLauncherContent}>
                            <Layout size={64} />
                            <h2>Editor de Layout</h2>
                            <p>Crie interfaces visuais para fichas de personagem usando um editor estilo Unity.</p>
                            <button
                                className={styles.launchEditorBtn}
                                onClick={() => setShowLayoutModal(true)}
                            >
                                <Layout size={20} />
                                Abrir Editor Visual
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button className={styles.backButton} onClick={onBack}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className={styles.systemInfo}>
                        <input
                            type="text"
                            value={systemData.metadata.name}
                            onChange={(e) => setSystemData(prev => ({
                                ...prev,
                                metadata: { ...prev.metadata, name: e.target.value }
                            }))}
                            className={styles.systemName}
                            placeholder="Nome do Sistema"
                        />
                        <span className={styles.systemVersion}>v{systemData.metadata.version}</span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    {hasChanges && <span className={styles.unsavedBadge}>Alterações não salvas</span>}
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar</>}
                    </button>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className={styles.tabNav}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Tab Content */}
            <main className={styles.content}>
                {renderTabContent()}
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.type === 'success' && <CheckCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Layout Editor Modal */}
            <LayoutEditorModal
                isOpen={showLayoutModal}
                onClose={() => setShowLayoutModal(false)}
                layout={systemData.layout || { pages: [] }}
                fields={systemData.fields}
                events={systemData.events}
                onChange={(layout) => {
                    updateSystem('layout', layout);
                    setShowLayoutModal(false);
                }}
            />
        </div>
    );
}
