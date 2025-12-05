import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './NoMansSky.module.css';
import { X, ArrowRight, Clock, Package } from 'lucide-react';

export function ResourceDetailModal({ isOpen, onClose, resourceName, allRecipes }) {
    const [activeTab, setActiveTab] = useState('producedBy'); // 'producedBy' | 'usedIn'

    if (!isOpen || !resourceName) return null;

    // Receitas que produzem este recurso (Output == resourceName)
    const producedBy = allRecipes.filter(r =>
        r.output.material.toLowerCase() === resourceName.toLowerCase()
    );

    // Receitas que usam este recurso (Input contém resourceName)
    const usedIn = allRecipes.filter(r =>
        r.inputs.some(i => i.material.toLowerCase() === resourceName.toLowerCase())
    );

    const RecipeRow = ({ recipe }) => (
        <div className={styles.detailRecipeRow}>
            <div className={styles.detailInputs}>
                {recipe.inputs.map((input, idx) => (
                    <div key={idx} className={styles.detailMaterial}>
                        <span className={styles.detailQty}>{input.quantity}x</span>
                        <span className={styles.detailName}>{input.material}</span>
                    </div>
                ))}
            </div>
            <div className={styles.detailArrowContainer}>
                <ArrowRight size={16} className={styles.detailArrow} />
            </div>
            <div className={styles.detailOutput}>
                <span className={styles.detailQty}>{recipe.output.quantity}x</span>
                <span className={styles.detailName}>{recipe.output.material}</span>
            </div>
            <div className={styles.detailMeta}>
                <Clock size={14} />
                <span>{recipe.time}s</span>
            </div>
        </div>
    );

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.detailModalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.detailModalHeader}>
                    <div className={styles.detailTitle}>
                        <Package size={24} className={styles.detailIcon} />
                        <h2>{resourceName}</h2>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.detailTabs}>
                    <button
                        className={`${styles.detailTab} ${activeTab === 'producedBy' ? styles.active : ''}`}
                        onClick={() => setActiveTab('producedBy')}
                    >
                        Produzido por ({producedBy.length})
                    </button>
                    <button
                        className={`${styles.detailTab} ${activeTab === 'usedIn' ? styles.active : ''}`}
                        onClick={() => setActiveTab('usedIn')}
                    >
                        Usado em ({usedIn.length})
                    </button>
                </div>

                <div className={styles.detailBody}>
                    {activeTab === 'producedBy' ? (
                        producedBy.length > 0 ? (
                            producedBy.map(recipe => <RecipeRow key={recipe.id} recipe={recipe} />)
                        ) : (
                            <p className={styles.emptyState}>Nenhuma receita encontrada para produzir este item.</p>
                        )
                    ) : (
                        usedIn.length > 0 ? (
                            usedIn.map(recipe => <RecipeRow key={recipe.id} recipe={recipe} />)
                        ) : (
                            <p className={styles.emptyState}>Este item não é usado em nenhuma receita conhecida.</p>
                        )
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
