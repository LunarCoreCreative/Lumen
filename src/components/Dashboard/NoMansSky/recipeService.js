// Serviço para gerenciamento de receitas do No Man's Sky no Firestore
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { fullRecipes } from './fullRecipes';

const COLLECTION_NAME = 'nms_recipes';
const INIT_FLAG_KEY = 'nms_recipes_initialized';

// Receitas padrão para inicialização (serão adicionadas ao Firebase UMA VEZ)
const defaultRecipes = [
    {
        name: 'Ferrita Pura de Poeira de Ferrita',
        inputs: [{ material: 'Poeira de Ferrita', quantity: 1, icon: null }],
        output: { material: 'Ferrita Pura', quantity: 1, icon: null },
        time: 0.6,
        category: 'Metal',
        tags: ['refinamento', 'básico', 'metal'],
        ratio: 1.0
    },
    {
        name: 'Ferrita Magnetizada de Ferrita Pura',
        inputs: [{ material: 'Ferrita Pura', quantity: 1, icon: null }],
        output: { material: 'Ferrita Magnetizada', quantity: 1, icon: null },
        time: 0.9,
        category: 'Metal',
        tags: ['refinamento', 'avançado', 'metal'],
        ratio: 1.0
    },
    {
        name: 'Metal Cromático de Cobre',
        inputs: [{ material: 'Cobre', quantity: 2, icon: null }],
        output: { material: 'Metal Cromático', quantity: 1, icon: null },
        time: 0.6,
        category: 'Metal',
        tags: ['refinamento', 'cromático', 'metal'],
        ratio: 0.5
    },
    {
        name: 'Carbono de Carbono Condensado',
        inputs: [{ material: 'Carbono Condensado', quantity: 1, icon: null }],
        output: { material: 'Carbono', quantity: 2, icon: null },
        time: 0.6,
        category: 'Orgânico',
        tags: ['refinamento', 'básico', 'orgânico'],
        ratio: 2.0
    },
    {
        name: 'Nitrogênio de Sal e Oxigênio',
        inputs: [
            { material: 'Sal', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 1, icon: null }
        ],
        output: { material: 'Nitrogênio', quantity: 1, icon: null },
        time: 0.6,
        category: 'Gás',
        tags: ['refinamento', 'duplo', 'gás'],
        ratio: 0.5
    },
    {
        name: 'Vidro de Frost Crystal',
        inputs: [{ material: 'Frost Crystal', quantity: 50, icon: null }],
        output: { material: 'Vidro', quantity: 1, icon: null },
        time: 0.6,
        category: 'Componente',
        tags: ['refinamento', 'componente'],
        ratio: 0.02
    },
    {
        name: 'Irídio de Platina, Ouro e Prata',
        inputs: [
            { material: 'Platina', quantity: 1, icon: null },
            { material: 'Ouro', quantity: 1, icon: null },
            { material: 'Prata', quantity: 1, icon: null }
        ],
        output: { material: 'Irídio', quantity: 6, icon: null },
        time: 0.9,
        category: 'Metal',
        tags: ['refinamento', 'triplo', 'metal', 'avançado'],
        ratio: 2.0
    },
    {
        name: 'Gelatina Instável',
        inputs: [
            { material: 'Carbono', quantity: 50, icon: null },
            { material: 'Oxigênio', quantity: 20, icon: null },
            { material: 'Sal', quantity: 15, icon: null }
        ],
        output: { material: 'Gelatina Instável', quantity: 1, icon: null },
        time: 1.2,
        category: 'Orgânico',
        tags: ['refinamento', 'triplo', 'orgânico', 'raro'],
        ratio: 0.012
    },
    {
        name: 'Supercondutores',
        inputs: [
            { material: 'Cádmio', quantity: 100, icon: null },
            { material: 'Índio', quantity: 100, icon: null },
            { material: 'Emeril', quantity: 100, icon: null }
        ],
        output: { material: 'Supercondutores', quantity: 1, icon: null },
        time: 0.9,
        category: 'Componente',
        tags: ['refinamento', 'triplo', 'componente', 'avançado'],
        ratio: 0.0033
    }
];

// Flag para evitar inicialização duplicada
let isInitializing = false;

// Inicializar receitas padrão no Firebase (executar UMA VEZ por usuário)
export async function initializeDefaultRecipes() {
    // Verificar se já foi inicializado nesta instalação
    const alreadyInitialized = localStorage.getItem(INIT_FLAG_KEY);
    if (alreadyInitialized || isInitializing) {
        console.log('Receitas já foram inicializadas anteriormente');
        return;
    }

    try {
        isInitializing = true;
        const recipesRef = collection(db, COLLECTION_NAME);
        const snapshot = await getDocs(recipesRef);

        // Se já existem receitas no Firebase, apenas marca como inicializado
        if (snapshot.docs.length > 0) {
            console.log('Receitas já existem no Firebase:', snapshot.docs.length);
            localStorage.setItem(INIT_FLAG_KEY, 'true');
            return;
        }

        console.log('Inicializando receitas padrão no Firebase...');

        // Adiciona receitas padrão
        for (const recipe of defaultRecipes) {
            await addDoc(recipesRef, {
                ...recipe,
                createdAt: new Date().toISOString()
            });
        }

        // Marca como inicializado
        localStorage.setItem(INIT_FLAG_KEY, 'true');
        console.log('✅ Receitas padrão inicializadas no Firebase');
    } catch (error) {
        console.error('Erro ao inicializar receitas:', error);
    } finally {
        isInitializing = false;
    }
}

// Listener em tempo real para receitas
export function subscribeToRecipes(callback) {
    const recipesRef = collection(db, COLLECTION_NAME);
    const q = query(recipesRef, orderBy('name'));

    return onSnapshot(q, (snapshot) => {
        const recipes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('📥 Receitas carregadas do Firebase:', recipes.length);
        callback(recipes);
    }, (error) => {
        console.error('Erro no listener de receitas:', error);
        callback([]);
    });
}

// Adicionar nova receita
export async function addRecipe(recipe) {
    try {
        const recipesRef = collection(db, COLLECTION_NAME);
        const docRef = await addDoc(recipesRef, {
            ...recipe,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Receita adicionada:', docRef.id);
        return { id: docRef.id, ...recipe };
    } catch (error) {
        console.error('Erro ao adicionar receita:', error);
        throw error;
    }
}

// Deletar receita
export async function deleteRecipe(recipeId) {
    try {
        console.log('🗑️ Deletando receita:', recipeId);
        const recipeRef = doc(db, COLLECTION_NAME, recipeId);
        await deleteDoc(recipeRef);
        console.log('✅ Receita deletada com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao deletar receita:', error);
        throw error;
    }
}

// Função para resetar a flag de inicialização (usar se quiser reinicializar)
export function resetInitialization() {
    localStorage.removeItem(INIT_FLAG_KEY);
    console.log('🔄 Flag de inicialização removida');
}

// Função para popular o banco de dados com todas as receitas
export async function populateDatabase() {
    console.log('🚀 Iniciando população do banco de dados...');
    const recipesRef = collection(db, COLLECTION_NAME);

    // Obter receitas existentes para evitar duplicatas
    const snapshot = await getDocs(recipesRef);
    const existingNames = new Set(snapshot.docs.map(doc => doc.data().name));

    let addedCount = 0;

    for (const recipe of fullRecipes) {
        if (!existingNames.has(recipe.name)) {
            await addDoc(recipesRef, {
                ...recipe,
                createdAt: new Date().toISOString()
            });
            addedCount++;
            console.log(`✅ Adicionada: ${recipe.name}`);
        } else {
            // console.log(`⚠️ Já existe: ${recipe.name}`);
        }
    }

    console.log(`🏁 População concluída! ${addedCount} novas receitas adicionadas.`);
    return addedCount;
}
