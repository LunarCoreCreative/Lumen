import React, { useState, useEffect } from 'react';
import styles from './SystemEditor.module.css';
import { ArrowLeft, Save, Eye, Upload, Download, Share2 } from 'lucide-react';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorPreview } from './EditorPreview';
import { Toast } from '../../Toast';
import { db } from '../../../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export function SystemEditor({ user, systemId: initialSystemId, initialData, onBack }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [systemData, setSystemData] = useState({
        metadata: {
            name: '',
            description: '',
            genre: [],
            complexity: 'moderate',
            tags: [],
            icon: '🎲'
        },
        attributes: [],
        dice: {
            available: ['d20'],
            primary: 'd20',
            customDice: []
        },
        skills: [],
        progression: {
            type: 'levels',
            maxLevel: 20
        },
        combat: {
            enabled: false
        },
        equipment: {
            categories: [],
            items: [],
            inventoryRules: {}
        }
    });
    const [systemId, setSystemId] = useState(initialSystemId || null);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Carregar dados iniciais se estiver editando
    useEffect(() => {
        if (initialData) {
            setSystemData(initialData);
        }
    }, [initialData]);

    const handleDataChange = (module, data) => {
        setSystemData(prev => ({
            ...prev,
            [module]: data
        }));
    };

    const handleSave = async () => {
        if (!systemData.metadata.name) {
            setToast({ message: 'Por favor, dê um nome ao seu sistema antes de salvar!', type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            // Sanitizar dados para remover undefined (Firestore não aceita undefined)
            const sanitizeData = (data) => {
                return JSON.parse(JSON.stringify(data));
            };

            const basePayload = {
                ...sanitizeData(systemData),
                createdBy: user?.uid,
                updatedAt: serverTimestamp(),
                version: '1.0.0',
                isPublic: false
            };

            if (systemId) {
                // Atualizar sistema existente (sem sobrescrever createdAt)
                await updateDoc(doc(db, 'rpgSystems', systemId), basePayload);
                console.log('✅ Sistema atualizado:', systemId);
                setToast({ message: '✅ Sistema salvo com sucesso!', type: 'success' });
            } else {
                // Criar novo sistema (adicionar createdAt)
                const newPayload = {
                    ...basePayload,
                    createdAt: serverTimestamp()
                };
                const docRef = await addDoc(collection(db, 'rpgSystems'), newPayload);
                setSystemId(docRef.id);
                console.log('✅ Sistema criado:', docRef.id);
                setToast({ message: '✅ Sistema criado e salvo com sucesso!', type: 'success' });
            }
        } catch (error) {
            console.error('❌ Erro detalhado ao salvar sistema:', error);
            setToast({ message: `Erro ao salvar: ${error.message}`, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(systemData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${systemData.metadata.name || 'sistema'}.json`;
        link.click();
    };

    return (
        <div className={styles.systemEditor}>
            {/* Header */}
            <div className={styles.editorHeader}>
                <button className={styles.backButton} onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Voltar ao Hub</span>
                </button>

                <div className={styles.headerTitle}>
                    <span className={styles.titleIcon}>{systemData.metadata.icon}</span>
                    <h1>{systemData.metadata.name || 'Novo Sistema'}</h1>
                </div>

                <div className={styles.headerActions}>
                    <button className={styles.actionBtn} onClick={handleExport}>
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>
                    <button className={styles.actionBtn}>
                        <Share2 size={18} />
                        <span>Compartilhar</span>
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                        <Save size={18} />
                        <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className={styles.editorLayout}>
                {/* Sidebar - Steps Navigation */}
                <EditorSidebar
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                    systemData={systemData}
                />

                {/* Canvas - Editor Area */}
                <EditorCanvas
                    currentStep={currentStep}
                    systemData={systemData}
                    onDataChange={handleDataChange}
                />

                {/* Preview - Character Sheet */}
                <EditorPreview
                    systemData={systemData}
                />
            </div>

            {/* Toast Notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
