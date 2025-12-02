import React, { useState, useEffect } from 'react';
import styles from './NoMansSky.module.css';
import { RecipeCard } from './RecipeCard';
import { Loader } from 'lucide-react';

export function RecipeList({ searchQuery, showFilters, customRecipes = [], isAdmin = false, onDeleteRecipe }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name'); // 'name', 'time', 'ratio'

    const handleDeleteRecipe = (recipeId) => {
        // Verificar se é uma receita customizada ou padrão
        const isCustom = customRecipes.some(r => r.id === recipeId);

        if (isCustom && onDeleteRecipe) {
            // Deletar receita customizada via callback do pai
            onDeleteRecipe(recipeId);
        } else {
            // Deletar receita padrão do estado local
            setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
        }

        console.log('Receita deletada:', recipeId);
    };

    // TODO: Substituir por hook useGamingContent quando implementado
    useEffect(() => {
        // Dados de exemplo com receitas reais de No Man's Sky
        const sampleRecipes = [
            {
                id: '1',
                name: 'Ferrita Pura de Poeira de Ferrita',
                inputs: [
                    { material: 'Poeira de Ferrita', quantity: 1, icon: null }
                ],
                output: {
                    material: 'Ferrita Pura',
                    quantity: 1,
                    icon: null
                },
                time: 0.6,
                category: 'Metal',
                tags: ['refinamento', 'básico', 'metal'],
                ratio: 1.0
            },
            {
                id: '2',
                name: 'Ferrita Magnetizada de Ferrita Pura',
                inputs: [
                    { material: 'Ferrita Pura', quantity: 1, icon: null }
                ],
                output: {
                    material: 'Ferrita Magnetizada',
                    quantity: 1,
                    icon: null
                },
                time: 0.9,
                category: 'Metal',
                tags: ['refinamento', 'avançado', 'metal'],
                ratio: 1.0
            },
            {
                id: '3',
                name: 'Metal Cromático de Cobre',
                inputs: [
                    { material: 'Cobre', quantity: 2, icon: null }
                ],
                output: {
                    material: 'Metal Cromático',
                    quantity: 1,
                    icon: null
                },
                time: 0.6,
                category: 'Metal',
                tags: ['refinamento', 'cromático', 'metal'],
                ratio: 0.5
            },
            {
                id: '4',
                name: 'Carbono de Carbono Condensado',
                inputs: [
                    { material: 'Carbono Condensado', quantity: 1, icon: null }
                ],
                output: {
                    material: 'Carbono',
                    quantity: 2,
                    icon: null
                },
                time: 0.6,
                category: 'Orgânico',
                tags: ['refinamento', 'básico', 'orgânico'],
                ratio: 2.0
            },
            {
                id: '5',
                name: 'Nitrogênio de Sal e Oxigênio',
                inputs: [
                    { material: 'Sal', quantity: 1, icon: null },
                    { material: 'Oxigênio', quantity: 1, icon: null }
                ],
                output: {
                    material: 'Nitrogênio',
                    quantity: 1,
                    icon: null
                },
                time: 0.6,
                category: 'Gás',
                tags: ['refinamento', 'duplo', 'gás'],
                ratio: 0.5
            },
            {
                id: '6',
                name: 'Vidro de Frost Crystal',
                inputs: [
                    { material: 'Frost Crystal', quantity: 50, icon: null }
                ],
                output: {
                    material: 'Vidro',
                    quantity: 1,
                    icon: null
                },
                time: 0.6,
                category: 'Componente',
                tags: ['refinamento', 'componente'],
                ratio: 0.02
            },
            {
                id: '7',
                name: 'Irídio de Platina, Ouro e Prata',
                inputs: [
                    { material: 'Platina', quantity: 1, icon: null },
                    { material: 'Ouro', quantity: 1, icon: null },
                    { material: 'Prata', quantity: 1, icon: null }
                ],
                output: {
                    material: 'Irídio',
                    quantity: 6,
                    icon: null
                },
                time: 0.9,
                category: 'Metal',
                tags: ['refinamento', 'triplo', 'metal', 'avançado'],
                ratio: 2.0
            },
            {
                id: '8',
                name: 'Gelatina Instável de Carbono, Oxigênio e Sal',
                inputs: [
                    { material: 'Carbono', quantity: 50, icon: null },
                    { material: 'Oxigênio', quantity: 20, icon: null },
                    { material: 'Sal', quantity: 15, icon: null }
                ],
                output: {
                    material: 'Gelatina Instável',
                    quantity: 1,
                    icon: null
                },
                time: 1.2,
                category: 'Orgânico',
                tags: ['refinamento', 'triplo', 'orgânico', 'raro'],
                ratio: 0.012
            },
            {
                id: '9',
                name: 'Supercondutores de Cádmio, Índio e Emeril',
                inputs: [
                    { material: 'Cádmio', quantity: 100, icon: null },
                    { material: 'Índio', quantity: 100, icon: null },
                    { material: 'Emeril', quantity: 100, icon: null }
                ],
                output: {
                    material: 'Supercondutores',
                    quantity: 1,
                    icon: null
                },
                time: 0.9,
                category: 'Componente',
                tags: ['refinamento', 'triplo', 'componente', 'avançado'],
                ratio: 0.0033
            }
        ];

        // Simular carregamento e mesclar com receitas customizadas
        setTimeout(() => {
            setRecipes([...sampleRecipes, ...customRecipes]);
            setLoading(false);
        }, 500);
    }, [customRecipes]);

    // Filtrar receitas
    const filteredRecipes = recipes.filter(recipe => {
        // Filtro de busca
        const matchesSearch = searchQuery === '' ||
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.inputs.some(input => input.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
            recipe.output.material.toLowerCase().includes(searchQuery.toLowerCase());

        // Filtro de categoria
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
                <p>Carregando receitas...</p>
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
                </div>
            )}

            {/* Results Count */}
            <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>
                    {sortedRecipes.length} {sortedRecipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
                </p>
            </div>

            {/* Recipe Grid */}
            {sortedRecipes.length > 0 ? (
                <div className={styles.recipeGrid}>
                    {sortedRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isAdmin={isAdmin}
                            onDelete={handleDeleteRecipe}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>Nenhuma receita encontrada</p>
                    <span>Tente ajustar os filtros ou busca</span>
                </div>
            )}
        </div>
    );
}
