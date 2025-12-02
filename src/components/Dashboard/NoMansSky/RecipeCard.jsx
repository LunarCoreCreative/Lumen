import React, { useState } from 'react';
import styles from './NoMansSky.module.css';
import { Clock, TrendingUp, ArrowRight, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../ConfirmDialog/ConfirmDialog';

export function RecipeCard({ recipe, isAdmin, onDelete }) {
    const [showConfirm, setShowConfirm] = useState(false);

    // Calcular ratio de eficiência se não estiver definido
    const calculateRatio = () => {
        if (recipe.ratio) return recipe.ratio;

        const totalInput = recipe.inputs.reduce((sum, input) => sum + input.quantity, 0);
        const totalOutput = recipe.output.quantity;
        return (totalOutput / totalInput).toFixed(2);
    };

    const ratio = calculateRatio();

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => {
        onDelete(recipe.id);
        setShowConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
    };

    return (
        <>
            <div className={styles.recipeCard}>
                {/* Header */}
                <div className={styles.recipeHeader}>
                    <h3 className={styles.recipeName}>{recipe.name}</h3>
                    <div className={styles.recipeHeaderActions}>
                        <div className={styles.recipeCategory}>
                            {recipe.category}
                        </div>
                        {isAdmin && onDelete && (
                            <button
                                className={styles.deleteButton}
                                onClick={handleDeleteClick}
                                title="Deletar receita"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Recipe Flow */}
                <div className={styles.recipeFlow}>
                    {/* Inputs */}
                    <div className={styles.materials}>
                        {recipe.inputs.map((input, index) => (
                            <div key={index} className={styles.materialItem}>
                                {input.icon && (
                                    <div className={styles.materialIcon}>
                                        <img src={input.icon} alt={input.material} />
                                    </div>
                                )}
                                <div className={styles.materialInfo}>
                                    <span className={styles.materialName}>{input.material}</span>
                                    <span className={styles.materialQuantity}>×{input.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Arrow */}
                    <div className={styles.arrow}>
                        <ArrowRight size={24} />
                    </div>

                    {/* Output */}
                    <div className={styles.materials}>
                        <div className={styles.materialItem}>
                            {recipe.output.icon && (
                                <div className={styles.materialIcon}>
                                    <img src={recipe.output.icon} alt={recipe.output.material} />
                                </div>
                            )}
                            <div className={styles.materialInfo}>
                                <span className={styles.materialName}>{recipe.output.material}</span>
                                <span className={styles.materialQuantity}>×{recipe.output.quantity}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className={styles.recipeStats}>
                    <div className={styles.stat}>
                        <Clock size={16} />
                        <span>{recipe.time}s</span>
                    </div>
                    <div className={styles.stat}>
                        <TrendingUp size={16} />
                        <span>Ratio: {ratio}</span>
                    </div>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                    <div className={styles.recipeTags}>
                        {recipe.tags.map((tag, index) => (
                            <span key={index} className={styles.tag}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={showConfirm}
                title="Deletar Receita"
                message={`Tem certeza que deseja deletar a receita "${recipe.name}"? Esta ação não pode ser desfeita.`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
}
