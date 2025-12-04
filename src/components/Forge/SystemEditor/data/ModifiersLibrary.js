/**
 * Biblioteca de Modificadores (Extras e Falhas)
 * Inspirado em Mutantes & Malfeitores
 */

export const MODIFIERS_LIBRARY = {
    extras: [
        // === RANGE & AREA ===
        {
            id: 'area',
            name: 'Área',
            description: 'Afeta uma área ao invés de alvo único',
            costModifier: 1.0, // +1 per rank
            compatibleEffects: '*',
            category: 'Range & Area'
        },
        {
            id: 'extended_range',
            name: 'Alcance Estendido',
            description: 'Aumenta o alcance do poder',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Range & Area',
            ranks: [
                { level: 1, description: 'Dobra o alcance' },
                { level: 2, description: 'x5 alcance' },
                { level: 3, description: 'x25 alcance' }
            ]
        },
        {
            id: 'selective',
            name: 'Seletivo',
            description: 'Pode escolher quais alvos na área afetada',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Range & Area',
            requiresExtra: 'area'
        },
        {
            id: 'line',
            name: 'Linha',
            description: 'Área em formato de linha',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Range & Area'
        },
        {
            id: 'cone',
            name: 'Cone',
            description: 'Área em formato de cone',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Range & Area'
        },

        // === DURATION ===
        {
            id: 'continuous',
            name: 'Contínuo',
            description: 'Efeito é permanente e sempre ativo',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Duration'
        },
        {
            id: 'sustained',
            name: 'Sustentado',
            description: 'Dura enquanto mantido (ação livre)',
            costModifier: 0.0, // gratuito
            compatibleEffects: '*',
            category: 'Duration'
        },
        {
            id: 'persistent',
            name: 'Persistente',
            description: 'Difícil de dissipar',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Duration'
        },

        // === ACCURACY & DAMAGE ===
        {
            id: 'accurate',
            name: 'Preciso',
            description: '+2 de bônus para acertar',
            costModifier: 1.0,
            compatibleEffects: ['damage', 'affliction', 'control'],
            category: 'Accuracy',
            stackable: true,
            maxStacks: 5
        },
        {
            id: 'penetrating',
            name: 'Penetrante',
            description: 'Ignora resistências igual ao rank',
            costModifier: 1.0,
            compatibleEffects: ['damage'],
            category: 'Damage'
        },
        {
            id: 'affects_insubstantial',
            name: 'Afeta Incorpóreo',
            description: 'Funciona em alvos incorpóreos',
            costModifier: 1.0,
            compatibleEffects: ['damage', 'control', 'affliction'],
            category: 'Damage',
            ranks: [
                { level: 1, description: 'Metade do efeito' },
                { level: 2, description: 'Efeito completo' }
            ]
        },
        {
            id: 'multiattack',
            name: 'Ataque Múltiplo',
            description: 'Pode atacar múltiplos alvos',
            costModifier: 1.0,
            compatibleEffects: ['damage'],
            category: 'Damage'
        },

        // === SPECIAL ===
        {
            id: 'precise',
            name: 'Exato',
            description: 'Não afeta inocentes/ambiente por acidente',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Special'
        },
        {
            id: 'subtle',
            name: 'Sutil',
            description: 'Difícil de detectar',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Special',
            ranks: [
                { level: 1, description: 'Detectável apenas com sentidos especiais' },
                { level: 2, description: 'Completamente indetectável' }
            ]
        },
        {
            id: 'homing',
            name: 'Teleguiado',
            description: 'Persegue o alvo se errar',
            costModifier: 1.0,
            compatibleEffects: ['damage'],
            category: 'Special',
            ranks: [
                { level: 1, description: '1 tentativa extra' },
                { level: 2, description: 'Infinitas tentativas' }
            ]
        },
        {
            id: 'ricochet',
            name: 'Ricochete',
            description: 'Pode ricochetear em múltiplos alvos',
            costModifier: 1.0,
            compatibleEffects: ['damage'],
            category: 'Special'
        },
        {
            id: 'variable',
            name: 'Variável',
            description: 'Pode alterar natureza do efeito',
            costModifier: 1.0,
            compatibleEffects: '*',
            category: 'Special'
        },

        // === DEFENSE ===
        {
            id: 'impervious',
            name: 'Impenetrável',
            description: 'Ignora ataques de rank inferior',
            costModifier: 1.0,
            compatibleEffects: ['protection'],
            category: 'Defense'
        },
        {
            id: 'reflective',
            name: 'Reflexivo',
            description: 'Reflete ataques',
            costModifier: 1.0,
            compatibleEffects: ['protection'],
            category: 'Defense'
        },

        // === RESTORATION ===
        {
            id: 'stabilize',
            name: 'Estabilizar',
            description: 'Estabiliza condições críticas',
            costModifier: 0.0,
            compatibleEffects: ['healing'],
            category: 'Restoration'
        },
        {
            id: 'resurrection',
            name: 'Ressurreição',
            description: 'Pode ressuscitar mortos',
            costModifier: 1.0,
            compatibleEffects: ['healing'],
            category: 'Restoration'
        },
        {
            id: 'persistent_healing',
            name: 'Cura Persistente',
            description: 'Cura continua ao longo do tempo',
            costModifier: 1.0,
            compatibleEffects: ['healing'],
            category: 'Restoration'
        }
    ],

    flaws: [
        // === LIMITATIONS ===
        {
            id: 'limited',
            name: 'Limitado',
            description: 'Funciona apenas sob certas condições',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Limitations',
            requiresDescription: true
        },
        {
            id: 'noticeable',
            name: 'Perceptível',
            description: 'Poder é obviamente visível',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Limitations'
        },
        {
            id: 'removable',
            name: 'Removível',
            description: 'Poder vem de item removível',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Limitations'
        },
        {
            id: 'touch_range_only',
            name: 'Apenas Toque',
            description: 'Funciona apenas em toque',
            costReduction: -1.0,
            compatibleEffects: ['damage', 'healing', 'control', 'affliction'],
            category: 'Limitations'
        },

        // === ACTIVATION ===
        {
            id: 'activation',
            name: 'Ativação',
            description: 'Requer algum movimento/gesto para ativar',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Activation',
            ranks: [
                { level: 1, description: 'Ação de movimento' },
                { level: 2, description: 'Ação padrão' }
            ]
        },
        {
            id: 'concentration',
            name: 'Concentração',
            description: 'Requer ação padrão para manter',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Activation'
        },
        {
            id: 'check_required',
            name: 'Teste Necessário',
            description: 'Requer teste de habilidade para usar',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Activation',
            requiresDescription: true
        },

        // === COST & EFFECTS ===
        {
            id: 'tiring',
            name: 'Cansativo',
            description: 'Causa fadiga após uso',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Cost'
        },
        {
            id: 'side_effect',
            name: 'Efeito Colateral',
            description: 'Causa dano ou problema ao usuário',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Cost',
            requiresDescription: true
        },
        {
            id: 'unreliable',
            name: 'Não Confiável',
            description: 'Pode falhar aleatoriamente',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Cost',
            ranks: [
                { level: 1, description: '50% de chance de falhar' },
                { level: 2, description: '25% de chance de falhar' }
            ]
        },

        // === DURATION & RANGE ===
        {
            id: 'fades',
            name: 'Desvanece',
            description: 'Perde 1 rank por rodada',
            costReduction: -1.0,
            compatibleEffects: ['damage', 'healing', 'protection'],
            category: 'Duration'
        },
        {
            id: 'instant_only',
            name: 'Apenas Instantâneo',
            description: 'Não pode ser sustentado',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Duration'
        },
        {
            id: 'close_range',
            name: 'Alcance Curto',
            description: 'Alcance limitado a poucos metros',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Range'
        },

        // === SITUATIONAL ===
        {
            id: 'quirk',
            name: 'Peculiaridade',
            description: 'Efeito cosmético menor',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Situational',
            requiresDescription: true
        },
        {
            id: 'distracting',
            name: 'Distraidor',
            description: 'Penalidade em outras tarefas enquanto usa',
            costReduction: -1.0,
            compatibleEffects: '*',
            category: 'Situational'
        }
    ]
};

// Utilitários
export const getExtraById = (id) =>
    MODIFIERS_LIBRARY.extras.find(extra => extra.id === id);

export const getFlawById = (id) =>
    MODIFIERS_LIBRARY.flaws.find(flaw => flaw.id === id);

export const getAllExtras = () => MODIFIERS_LIBRARY.extras;

export const getAllFlaws = () => MODIFIERS_LIBRARY.flaws;

export const getModifiersByCategory = (type, category) =>
    MODIFIERS_LIBRARY[type].filter(mod => mod.category === category);

// Calcula custo total de modificadores
export const calculateModifierCost = (baseRank, extras = [], flaws = []) => {
    const extrasCost = extras.reduce((sum, extra) => sum + extra.costModifier, 0);
    const flawsReduction = flaws.reduce((sum, flaw) => sum + flaw.costReduction, 0);

    const multiplier = 1 + extrasCost + flawsReduction;
    return Math.max(0, baseRank * multiplier);
};
