import React, { useState } from 'react';
import styles from './AddRecipeModal.module.css';
import { X, Plus, Trash2, Upload } from 'lucide-react';

export function AddRecipeModal({ isOpen, onClose, onSave }) {
    const [recipeName, setRecipeName] = useState('');
    const [category, setCategory] = useState('Metal');
    const [time, setTime] = useState(0.6);
    const [inputs, setInputs] = useState([
        { material: '', quantity: 1, icon: null }
    ]);
    const [output, setOutput] = useState({ material: '', quantity: 1, icon: null });
    const [tags, setTags] = useState('');

    const categories = ['Metal', 'Orgânico', 'Gás', 'Componente', 'Combustível'];

    const handleAddInput = () => {
        if (inputs.length < 3) {
            setInputs([...inputs, { material: '', quantity: 1, icon: null }]);
        }
    };

    const handleRemoveInput = (index) => {
        if (inputs.length > 1) {
            setInputs(inputs.filter((_, i) => i !== index));
        }
    };

    const handleInputChange = (index, field, value) => {
        const newInputs = [...inputs];
        newInputs[index][field] = value;
        setInputs(newInputs);
    };

    const handleIconUpload = (index, type, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'input') {
                    const newInputs = [...inputs];
                    newInputs[index].icon = reader.result;
                    setInputs(newInputs);
                } else {
                    setOutput({ ...output, icon: reader.result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validação
        if (!recipeName.trim()) {
            alert('Por favor, insira o nome da receita');
            return;
        }

        if (inputs.some(input => !input.material.trim())) {
            alert('Por favor, preencha todos os materiais de entrada');
            return;
        }

        if (!output.material.trim()) {
            alert('Por favor, preencha o material de saída');
            return;
        }

        const recipe = {
            id: Date.now().toString(),
            name: recipeName,
            inputs: inputs,
            output: output,
            time: parseFloat(time),
            category: category,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            ratio: output.quantity / inputs.reduce((sum, input) => sum + input.quantity, 0)
        };

        onSave(recipe);
        handleReset();
    };

    const handleReset = () => {
        setRecipeName('');
        setCategory('Metal');
        setTime(0.6);
        setInputs([{ material: '', quantity: 1, icon: null }]);
        setOutput({ material: '', quantity: 1, icon: null });
        setTags('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Adicionar Receita de Refinamento</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Nome da Receita */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome da Receita</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            placeholder="Ex: Ferrita Pura de Poeira de Ferrita"
                            required
                        />
                    </div>

                    {/* Categoria e Tempo */}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Categoria</label>
                            <select
                                className={styles.select}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tempo (segundos)</label>
                            <input
                                type="number"
                                step="0.1"
                                className={styles.input}
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Materiais de Entrada */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>Materiais de Entrada</h3>
                            {inputs.length < 3 && (
                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={handleAddInput}
                                >
                                    <Plus size={16} />
                                    Adicionar Material
                                </button>
                            )}
                        </div>

                        {inputs.map((input, index) => (
                            <div key={index} className={styles.materialRow}>
                                <div className={styles.iconUpload}>
                                    {input.icon ? (
                                        <img src={input.icon} alt="Ícone" className={styles.iconPreview} />
                                    ) : (
                                        <div className={styles.iconPlaceholder}>
                                            <Upload size={20} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleIconUpload(index, 'input', e)}
                                        className={styles.fileInput}
                                    />
                                </div>

                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Nome do Material"
                                    value={input.material}
                                    onChange={(e) => handleInputChange(index, 'material', e.target.value)}
                                    required
                                />

                                <input
                                    type="number"
                                    min="1"
                                    className={styles.inputSmall}
                                    placeholder="Qtd"
                                    value={input.quantity}
                                    onChange={(e) => handleInputChange(index, 'quantity', parseInt(e.target.value))}
                                    required
                                />

                                {inputs.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveInput(index)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Material de Saída */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Material de Saída</h3>
                        <div className={styles.materialRow}>
                            <div className={styles.iconUpload}>
                                {output.icon ? (
                                    <img src={output.icon} alt="Ícone" className={styles.iconPreview} />
                                ) : (
                                    <div className={styles.iconPlaceholder}>
                                        <Upload size={20} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleIconUpload(0, 'output', e)}
                                    className={styles.fileInput}
                                />
                            </div>

                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Nome do Material"
                                value={output.material}
                                onChange={(e) => setOutput({ ...output, material: e.target.value })}
                                required
                            />

                            <input
                                type="number"
                                min="1"
                                className={styles.inputSmall}
                                placeholder="Qtd"
                                value={output.quantity}
                                onChange={(e) => setOutput({ ...output, quantity: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tags (separadas por vírgula)</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="refinamento, básico, metal"
                        />
                    </div>

                    {/* Botões */}
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={handleReset}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            Salvar Receita
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
