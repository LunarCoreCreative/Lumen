import React, { useState } from 'react';
import styles from './NoMansSky.module.css';
import { Clock, TrendingUp, ArrowRight, Trash2, Package } from 'lucide-react';
import { ConfirmDialog } from '../../ConfirmDialog/ConfirmDialog';

export function RecipeCard({ recipe, isAdmin, onDelete }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const calculateRatio = () => {
        if (recipe.ratio) return recipe.ratio;
        const totalInput = recipe.inputs.reduce((sum, input) => sum + input.quantity, 0);
        const totalOutput = recipe.output.quantity;
        return (totalOutput / totalInput).toFixed(2);
    };

    const ratio = calculateRatio();

    const handleDeleteClick = () => {
        console.log('🔴 Delete button clicked for:', recipe.id, recipe.name);
        setShowConfirm(true);
    };
    const handleConfirmDelete = async () => {
        console.log('✅ Confirm delete clicked for:', recipe.id);
        try {
            await onDelete(recipe.id);
            console.log('✅ Delete completed for:', recipe.id);
        } catch (error) {
            console.error('❌ Delete failed:', error);
        }
        setShowConfirm(false);
    };
    const handleCancelDelete = () => setShowConfirm(false);

    const MaterialItem = ({ material, quantity, icon }) => (
        <div className={styles.materialItem}>
            <div className={styles.materialIcon}>
                {icon ? (
                    <img src={icon} alt={material} />
                ) : (
                    <Package size={14} />
                )}
            </div>
            <div className={styles.materialInfo}>
                <span className={styles.materialName} title={material}>{material}</span>
                <span className={styles.materialQuantity}>×{quantity}</span>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles.recipeCard}>
                {/* Left: Name & Category */}
                <div className={styles.recipeHeader}>
                    <h3 className={styles.recipeName} title={recipe.name}>{recipe.name}</h3>
                    <div className={styles.recipeHeaderActions}>
                        <span className={styles.recipeCategory}>{recipe.category}</span>
                        {isAdmin && onDelete && (
                            <button
                                className={styles.deleteButton}
                                onClick={handleDeleteClick}
                                title="Deletar"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Center: Recipe Flow */}
                <div className={styles.recipeFlow}>
                    <div className={styles.materials}>
                        {recipe.inputs.map((input, index) => (
                            <MaterialItem
                                key={index}
                                material={input.material}
                                quantity={input.quantity}
                                icon={input.icon}
                            />
                        ))}
                    </div>

                    <div className={styles.arrow}>
                        <ArrowRight size={20} />
                    </div>

                    <div className={styles.materials}>
                        <MaterialItem
                            material={recipe.output.material}
                            quantity={recipe.output.quantity}
                            icon={recipe.output.icon}
                        />
                    </div>
                </div>

                {/* Right: Stats & Tags */}
                <div className={styles.recipeMeta}>
                    <div className={styles.recipeStats}>
                        <div className={styles.stat}>
                            <Clock size={14} />
                            <span>{recipe.time}s</span>
                        </div>
                        <div className={styles.stat}>
                            <TrendingUp size={14} />
                            <span>{ratio}x</span>
                        </div>
                    </div>

                    {recipe.tags && recipe.tags.length > 0 && (
                        <div className={styles.recipeTags}>
                            {recipe.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirm}
                title="Deletar Receita"
                message={`Tem certeza que deseja deletar "${recipe.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
}
