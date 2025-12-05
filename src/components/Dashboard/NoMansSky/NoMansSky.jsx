import React, { useState, useEffect } from 'react';
import { GameView } from '../GameView';
import { NMSHub } from './NMSHub';
import { RecipeList } from './RecipeList';
import { AddRecipeModal } from './AddRecipeModal';
import { addRecipe, subscribeToRecipes } from './recipeService';

export function NoMansSky({ user, onBack }) {
    const [currentSection, setCurrentSection] = useState('hub'); // 'hub' | 'recipes'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recipeCount, setRecipeCount] = useState(0);

    // Buscar contagem de receitas
    useEffect(() => {
        const unsubscribe = subscribeToRecipes((recipes) => {
            setRecipeCount(recipes.length);
        });
        return () => unsubscribe();
    }, []);

    const gameData = {
        name: "No Man's Sky",
        slug: 'nomanssky',
        description: 'Receitas, guias e recursos para explorar o universo infinito',
        bannerUrl: '/images/nms-banner.jpg',
        color: '#ff4655'
    };

    const handleNavigate = (sectionId) => {
        setCurrentSection(sectionId);
    };

    const handleBackToHub = () => {
        setCurrentSection('hub');
    };

    const handleAddContent = () => {
        setIsModalOpen(true);
    };

    const handleSaveRecipe = async (recipe) => {
        try {
            await addRecipe(recipe);
            setIsModalOpen(false);
            console.log('Receita salva no Firebase:', recipe);
        } catch (error) {
            console.error('Erro ao salvar receita:', error);
            alert('Erro ao salvar receita. Tente novamente.');
        }
    };

    // Se estiver na seção de receitas, mostra RecipeList
    if (currentSection === 'recipes') {
        return (
            <>
                <GameView
                    game={{ ...gameData, description: 'Receitas de refinamento e crafting' }}
                    user={user}
                    onBack={handleBackToHub}
                    showAddButton={user?.isOwner || user?.isAdmin || user?.isNMSDev}
                    onAddContent={handleAddContent}
                >
                    <RecipeList
                        isAdmin={user?.isOwner || user?.isAdmin || user?.isNMSDev}
                    />
                </GameView>

                <AddRecipeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRecipe}
                />
            </>
        );
    }

    // Hub principal do NMS
    return (
        <GameView
            game={gameData}
            user={user}
            onBack={onBack}
            showAddButton={false}
        >
            <NMSHub
                onNavigate={handleNavigate}
                recipeCount={recipeCount}
            />
        </GameView>
    );
}
