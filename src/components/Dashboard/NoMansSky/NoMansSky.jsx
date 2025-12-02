import React, { useState } from 'react';
import { GameView } from '../GameView';
import { RecipeList } from './RecipeList';
import { AddRecipeModal } from './AddRecipeModal';

export function NoMansSky({ user, onBack, customRecipes = [], onAddRecipe, onDeleteRecipe }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const gameData = {
        name: "No Man's Sky",
        slug: 'nomanssky',
        description: 'Receitas de refinamento, guias e recursos',
        bannerUrl: '/images/nms-banner.jpg',
        color: '#ff4655'
    };

    const handleAddContent = () => {
        setIsModalOpen(true);
    };

    const handleSaveRecipe = (recipe) => {
        onAddRecipe(recipe); // Usar callback do pai
        setIsModalOpen(false);
        console.log('Receita salva:', recipe);
    };

    return (
        <>
            <GameView
                game={gameData}
                user={user}
                onBack={onBack}
                showAddButton={user?.isAdmin || user?.isNMSDev}
                onAddContent={handleAddContent}
            >
                <RecipeList
                    customRecipes={customRecipes}
                    onDeleteRecipe={onDeleteRecipe}
                    isAdmin={user?.isAdmin || user?.isNMSDev}
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
