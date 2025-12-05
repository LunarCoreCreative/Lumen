import React, { useState, useEffect } from 'react';
import styles from './NoMansSky.module.css';
import { RecipeCard } from './RecipeCard';
import { Loader, Database } from 'lucide-react';
import { subscribeToRecipes, deleteRecipe, initializeDefaultRecipes, populateDatabase } from './recipeService';
import { ResourceDetailModal } from './ResourceDetailModal';

export function RecipeList({ searchQuery = '', showFilters, isAdmin = false }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedResource, setSelectedResource] = useState(null);

    // Carregar receitas do Firebase com listener em tempo real
    useEffect(() => {
        // Inicializar receitas padrão se necessário
        initializeDefaultRecipes();

        // Listener em tempo real
        const unsubscribe = subscribeToRecipes((recipesFromFirebase) => {
            setRecipes(recipesFromFirebase);
            setLoading(false);
        });

        // Cleanup ao desmontar
        return () => unsubscribe();
    }, []);

    const handleDeleteRecipe = async (recipeId) => {
        try {
            await deleteRecipe(recipeId);
            console.log('Receita deletada do Firebase:', recipeId);
        } catch (error) {
            console.error('Erro ao deletar receita:', error);
            alert('Erro ao deletar receita. Tente novamente.');
        }
    };

    const handlePopulate = async () => {
        if (window.confirm('Deseja popular o banco de dados com receitas padrão? Isso pode levar alguns segundos.')) {
            setLoading(true);
            await populateDatabase();
            // O listener vai atualizar a lista automaticamente
        }
    };

    // Filtrar receitas
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = searchQuery === '' ||
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.inputs.some(input => input.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
            recipe.output.material.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Ordenar receitas
    const sortedRecipes = [...filteredRecipes].sort((a, b) => {
        switch (sortBy) {
            case 'time':
                return a.time - b.time;
            case 'ratio':
                return (b.ratio || 0) - (a.ratio || 0);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    // Categorias únicas
    const categories = ['all', ...new Set(recipes.map(r => r.category))];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader className={styles.spinner} size={32} />
                <p>Carregando receitas do Firebase...</p>
            </div>
        );
    }

    return (
        <div className={styles.recipeListContainer}>
            {/* Filters Panel */}
            {showFilters && (
                <div className={styles.filtersPanel}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Categoria</label>
                        <div className={styles.filterButtons}>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category === 'all' ? 'Todas' : category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Ordenar por</label>
                        <select
                            className={styles.sortSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">Nome</option>
                            <option value="time">Tempo</option>
                            <option value="ratio">Eficiência</option>
                        </select>
                    </div>

                    {isAdmin && (
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Admin</label>
                            <button className={styles.populateButton} onClick={handlePopulate}>
                                <Database size={14} /> Popular DB
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Count */}
            <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>
                    {sortedRecipes.length} {sortedRecipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
                </p>
            </div>

            {/* Recipe Grid */}
            {/* Recipe Grid */}
            {sortedRecipes.length > 0 ? (
                <div className={styles.recipeGrid}>
                    {sortedRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isAdmin={isAdmin}
                            onDelete={handleDeleteRecipe}
                            onResourceClick={setSelectedResource}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>Nenhuma receita encontrada</p>
                    <span>Tente ajustar os filtros ou busca</span>
                </div>
            )}

            <ResourceDetailModal
                isOpen={!!selectedResource}
                onClose={() => setSelectedResource(null)}
                resourceName={selectedResource}
                allRecipes={recipes}
            />
        </div>
    );
}
