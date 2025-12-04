/**
 * Biblioteca de Efeitos Base para Sistema de Habilidades
 * Inspirado em Mutantes & Malfeitores
 */

export const EFFECTS_LIBRARY = {
    // === COMBAT ===
    damage: {
        id: 'damage',
        label: 'Dano',
        icon: '⚔️',
        category: 'Combat',
        description: 'Causa dano ao alvo',
        subtypes: [
            { id: 'physical', label: 'Físico', icon: '🗡️' },
            { id: 'fire', label: 'Fogo', icon: '🔥' },
            { id: 'cold', label: 'Gelo', icon: '❄️' },
            { id: 'electricity', label: 'Elétrico', icon: '⚡' },
            { id: 'acid', label: 'Ácido', icon: '🧪' },
            { id: 'sonic', label: 'Sônico', icon: '🔊' },
            { id: 'mental', label: 'Mental', icon: '🧠' },
            { id: 'psychic', label: 'Psíquico', icon: '💭' },
            { id: 'radiant', label: 'Radiante', icon: '✨' },
            { id: 'necrotic', label: 'Necrótico', icon: '💀' },
            { id: 'force', label: 'Força', icon: '💥' }
        ],
        defaultRank: 10,
        scalingType: 'linear',
        baseCost: 1 // custo por rank
    },

    healing: {
        id: 'healing',
        label: 'Cura',
        icon: '❤️',
        category: 'Support',
        description: 'Restaura pontos de vida',
        subtypes: [
            { id: 'standard', label: 'Padrão', icon: '❤️' },
            { id: 'regeneration', label: 'Regeneração', icon: '💚' },
            { id: 'resurrection', label: 'Ressurreição', icon: '✝️' }
        ],
        defaultRank: 10,
        scalingType: 'linear',
        baseCost: 1
    },

    protection: {
        id: 'protection',
        label: 'Proteção',
        icon: '🛡️',
        category: 'Defense',
        description: 'Fornece armadura ou defesa extra',
        subtypes: [
            { id: 'toughness', label: 'Resistência', icon: '🛡️' },
            { id: 'dodge', label: 'Esquiva', icon: '💨' },
            { id: 'parry', label: 'Aparar', icon: '⚔️' },
            { id: 'fortitude', label: 'Fortitude', icon: '💪' },
            { id: 'will', label: 'Vontade', icon: '🧠' }
        ],
        defaultRank: 10,
        scalingType: 'linear',
        baseCost: 1
    },

    // === MOVEMENT ===
    movement: {
        id: 'movement',
        label: 'Movimento',
        icon: '🏃',
        category: 'Movement',
        description: 'Aumenta ou altera capacidade de movimento',
        subtypes: [
            { id: 'speed', label: 'Velocidade', icon: '💨' },
            { id: 'flight', label: 'Voo', icon: '🦅' },
            { id: 'teleport', label: 'Teleporte', icon: '✨' },
            { id: 'swimming', label: 'Natação', icon: '🏊' },
            { id: 'burrowing', label: 'Escavar', icon: '🦔' },
            { id: 'wall_crawling', label: 'Escalar Paredes', icon: '🕷️' },
            { id: 'dimensional', label: 'Dimensional', icon: '🌀' }
        ],
        defaultRank: 5,
        scalingType: 'exponential',
        baseCost: 1
    },

    // === CONTROL ===
    control: {
        id: 'control',
        label: 'Controle',
        icon: '🎭',
        category: 'Control',
        description: 'Controla, paralisa ou influencia alvos',
        subtypes: [
            { id: 'paralyze', label: 'Paralisar', icon: '🧊' },
            { id: 'sleep', label: 'Adormecer', icon: '😴' },
            { id: 'charm', label: 'Encantar', icon: '💖' },
            { id: 'confuse', label: 'Confundir', icon: '😵' },
            { id: 'fear', label: 'Amedrontar', icon: '😱' },
            { id: 'dominate', label: 'Dominar', icon: '🎭' },
            { id: 'stun', label: 'Atordoar', icon: '💫' }
        ],
        defaultRank: 10,
        scalingType: 'linear',
        baseCost: 1
    },

    // === SENSES ===
    senses: {
        id: 'senses',
        label: 'Sentidos',
        icon: '👁️',
        category: 'Utility',
        description: 'Concede sentidos especiais ou aprimorados',
        subtypes: [
            { id: 'darkvision', label: 'Visão no Escuro', icon: '🌙' },
            { id: 'blindsight', label: 'Percepção Cega', icon: '🦇' },
            { id: 'tremorsense', label: 'Sentido Sísmico', icon: '🌊' },
            { id: 'truesight', label: 'Visão Verdadeira', icon: '👁️‍🗨️' },
            { id: 'danger_sense', label: 'Sentido de Perigo', icon: '⚠️' },
            { id: 'x_ray', label: 'Visão de Raio-X', icon: '📡' }
        ],
        defaultRank: 1,
        scalingType: 'flat',
        baseCost: 1
    },

    // === TRANSFORMATION ===
    transform: {
        id: 'transform',
        label: 'Transformação',
        icon: '🔄',
        category: 'Utility',
        description: 'Transforma alvo ou a si mesmo',
        subtypes: [
            { id: 'shapeshift', label: 'Metamorfose', icon: '🦎' },
            { id: 'polymorph', label: 'Polimorfismo', icon: '🐸' },
            { id: 'size_change', label: 'Mudança de Tamanho', icon: '📏' },
            { id: 'insubstantial', label: 'Insubstancial', icon: '👻' },
            { id: 'density', label: 'Densidade', icon: '⚛️' }
        ],
        defaultRank: 5,
        scalingType: 'linear',
        baseCost: 2
    },

    // === CREATION ===
    create: {
        id: 'create',
        label: 'Criação',
        icon: '🎨',
        category: 'Utility',
        description: 'Cria objetos, ilusões ou construções',
        subtypes: [
            { id: 'object', label: 'Objeto', icon: '📦' },
            { id: 'illusion', label: 'Ilusão', icon: '🎭' },
            { id: 'construct', label: 'Constructo', icon: '🤖' },
            { id: 'wall', label: 'Barreira', icon: '🧱' },
            { id: 'summon', label: 'Invocar', icon: '🌟' }
        ],
        defaultRank: 10,
        scalingType: 'linear',
        baseCost: 2
    },

    // === MANIPULATION ===
    affliction: {
        id: 'affliction',
        label: 'Aflição',
        icon: '🦠',
        category: 'Control',
        description: 'Impõe condições negativas ao alvo',
        subtypes: [
            { id: 'poison', label: 'Envenenamento', icon: '☠️' },
            { id: 'disease', label: 'Doença', icon: '🦠' },
            { id: 'curse', label: 'Maldição', icon: '😈' },
            { id: 'exhaustion', label: 'Exaustão', icon: '😓' },
            { id: 'blindness', label: 'Cegueira', icon: '🙈' },
            { id: 'deafness', label: 'Surdez', icon: '🙉' }
        ],
        defaultRank: 10,
        scalingType: 'linear',
        baseCost: 1
    },

    // === BUFF/DEBUFF ===
    enhancement: {
        id: 'enhancement',
        label: 'Aprimoramento',
        icon: '⬆️',
        category: 'Support',
        description: 'Aumenta capacidades do alvo',
        subtypes: [
            { id: 'strength', label: 'Força', icon: '💪' },
            { id: 'agility', label: 'Agilidade', icon: '🤸' },
            { id: 'intelligence', label: 'Inteligência', icon: '🧠' },
            { id: 'charisma', label: 'Carisma', icon: '✨' },
            { id: 'all_stats', label: 'Todos Atributos', icon: '⭐' }
        ],
        defaultRank: 5,
        scalingType: 'linear',
        baseCost: 1
    },

    weakening: {
        id: 'weakening',
        label: 'Enfraquecimento',
        icon: '⬇️',
        category: 'Control',
        description: 'Reduz capacidades do alvo',
        subtypes: [
            { id: 'drain_stats', label: 'Drenar Atributos', icon: '📉' },
            { id: 'nullify', label: 'Anular Poderes', icon: '🚫' },
            { id: 'slow', label: 'Lentidão', icon: '🐌' }
        ],
        defaultRank: 10,
        scalingType: 'linear',
        baseCost: 1
    },

    // === UTILITY ===
    feature: {
        id: 'feature',
        label: 'Característica',
        icon: '⭐',
        category: 'Utility',
        description: 'Habilidades utilitárias diversas',
        subtypes: [
            { id: 'skill_bonus', label: 'Bônus em Perícia', icon: '🎯' },
            { id: 'immunity', label: 'Imunidade', icon: '🛡️' },
            { id: 'language', label: 'Idioma', icon: '💬' },
            { id: 'tool_proficiency', label: 'Ferramentas', icon: '🔧' },
            { id: 'custom', label: 'Customizado', icon: '✨' }
        ],
        defaultRank: 1,
        scalingType: 'flat',
        baseCost: 1
    }
};

// Utilitário para buscar efeito por ID
export const getEffectById = (id) => EFFECTS_LIBRARY[id];

// Utilitário para listar todos os efeitos
export const getAllEffects = () => Object.values(EFFECTS_LIBRARY);

// Utilitário para listar por categoria
export const getEffectsByCategory = (category) =>
    getAllEffects().filter(effect => effect.category === category);
