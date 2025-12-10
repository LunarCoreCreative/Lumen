import React, { useState } from 'react';
import styles from './MastersArea.module.css';
import { ArrowLeft, Crown, Plus, FileText, Play, Wrench, X, Sparkles } from 'lucide-react';
import { SystemEditorV2 } from './editor/SystemEditorV2';
import { SYSTEM_TEMPLATES, getTemplateById } from './data/systemTemplates';

/**
 * MastersArea - Área dos Mestres
 * 
 * Hub para gerenciar sistemas de RPG criados pelo usuário.
 */
export function MastersArea({ user, onBack }) {
    const [view, setView] = useState('list'); // 'list' | 'editor' | 'diagnostics'
    const [systems, setSystems] = useState([]);
    const [editingSystem, setEditingSystem] = useState(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // Criar novo sistema - abre modal de templates
    const handleCreateSystem = () => {
        setShowTemplateModal(true);
    };

    // Selecionar template e abrir editor
    const handleSelectTemplate = (templateId) => {
        if (templateId === 'blank') {
            setEditingSystem(null);
        } else {
            const templateData = getTemplateById(templateId);
            if (templateData) {
                setEditingSystem({
                    ...templateData,
                    id: null,
                    metadata: {
                        ...templateData.metadata,
                        name: `Meu ${templateData.metadata?.name || 'Sistema'}`
                    }
                });
            }
        }
        setShowTemplateModal(false);
        setView('editor');
    };

    // Editar sistema existente
    const handleEditSystem = (system) => {
        setEditingSystem(system);
        setView('editor');
    };

    // Salvar sistema
    const handleSaveSystem = async (systemData) => {
        // TODO: Integrar com Firestore
        console.log('Salvando sistema:', systemData);

        if (editingSystem?.id) {
            setSystems(prev => prev.map(s => s.id === editingSystem.id ? systemData : s));
        } else {
            const newSystem = { ...systemData, id: `sys_${Date.now()}` };
            setSystems(prev => [...prev, newSystem]);
        }

        setView('list');
    };

    // Voltar para lista
    const handleBackToList = () => {
        setView('list');
        setEditingSystem(null);
    };

    // Se estiver no editor, renderizar SystemEditorV2
    if (view === 'editor') {
        return (
            <SystemEditorV2
                user={user}
                systemId={editingSystem?.id}
                initialData={editingSystem}
                onBack={handleBackToList}
                onSave={handleSaveSystem}
            />
        );
    }

    // Lista de sistemas
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Voltar</span>
                </button>
                <div className={styles.headerTitle}>
                    <Crown size={24} />
                    <h1>Área dos Mestres</h1>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button className={styles.primaryButton} onClick={handleCreateSystem}>
                    <Plus size={18} />
                    Criar Novo Sistema
                </button>
            </div>

            {/* Systems List */}
            <div className={styles.systemsGrid}>
                {systems.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <FileText size={48} />
                        </div>
                        <h3>Nenhum sistema criado</h3>
                        <p>Crie seu primeiro sistema de RPG para começar!</p>
                        <button className={styles.primaryButton} onClick={handleCreateSystem}>
                            <Plus size={18} />
                            Criar Sistema
                        </button>
                    </div>
                ) : (
                    systems.map(system => (
                        <div key={system.id} className={styles.systemCard}>
                            <div className={styles.systemIcon}>{system.metadata?.icon || '🎲'}</div>
                            <h3>{system.metadata?.name || 'Sistema sem nome'}</h3>
                            <p>{system.fields?.length || 0} campos</p>
                            <button
                                className={styles.editButton}
                                onClick={() => handleEditSystem(system)}
                            >
                                Editar
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Dev Tools */}
            <div className={styles.devTools}>
                <button
                    className={styles.devButton}
                    onClick={() => setView('diagnostics')}
                >
                    <Wrench size={16} />
                    Core Diagnostics
                </button>
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowTemplateModal(false)}>
                    <div className={styles.templateModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Escolha um Template</h2>
                            <button className={styles.closeButton} onClick={() => setShowTemplateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.templateGrid}>
                            {/* Opção em branco */}
                            <button
                                className={styles.templateCard}
                                onClick={() => handleSelectTemplate('blank')}
                            >
                                <div className={styles.templateIcon} style={{ background: '#374151' }}>
                                    <Plus size={32} />
                                </div>
                                <h3>Em Branco</h3>
                                <p>Comece do zero com um sistema vazio</p>
                            </button>

                            {/* Templates pré-definidos */}
                            {SYSTEM_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    className={styles.templateCard}
                                    onClick={() => handleSelectTemplate(template.id)}
                                >
                                    <div
                                        className={styles.templateIcon}
                                        style={{ background: template.color + '33', color: template.color }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{template.icon}</span>
                                    </div>
                                    <h3>{template.name}</h3>
                                    <p>{template.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
