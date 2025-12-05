export const fullRecipes = [
    // --- BASIC RESOURCES ---
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
        name: 'Ferrita Magnetizada de Ferrita Pura + Carbono',
        inputs: [
            { material: 'Ferrita Pura', quantity: 1, icon: null },
            { material: 'Carbono', quantity: 1, icon: null }
        ],
        output: { material: 'Ferrita Magnetizada', quantity: 3, icon: null },
        time: 0.9,
        category: 'Metal',
        tags: ['refinamento', 'duplo', 'metal'],
        ratio: 3.0
    },
    {
        name: 'Carbono Condensado de Carbono',
        inputs: [{ material: 'Carbono', quantity: 2, icon: null }],
        output: { material: 'Carbono Condensado', quantity: 1, icon: null },
        time: 0.6,
        category: 'Orgânico',
        tags: ['refinamento', 'básico', 'orgânico'],
        ratio: 0.5
    },
    {
        name: 'Carbono Condensado de Carbono + Oxigênio',
        inputs: [
            { material: 'Carbono', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 1, icon: null }
        ],
        output: { material: 'Carbono Condensado', quantity: 5, icon: null },
        time: 0.6,
        category: 'Orgânico',
        tags: ['refinamento', 'duplo', 'orgânico'],
        ratio: 5.0
    },
    {
        name: 'Sódio de Nitrato de Sódio',
        inputs: [{ material: 'Nitrato de Sódio', quantity: 1, icon: null }],
        output: { material: 'Sódio', quantity: 2, icon: null },
        time: 0.6,
        category: 'Catalisador',
        tags: ['refinamento', 'reverso'],
        ratio: 2.0
    },
    {
        name: 'Nitrato de Sódio de Sódio',
        inputs: [{ material: 'Sódio', quantity: 2, icon: null }],
        output: { material: 'Nitrato de Sódio', quantity: 1, icon: null },
        time: 0.6,
        category: 'Catalisador',
        tags: ['refinamento', 'básico'],
        ratio: 0.5
    },
    {
        name: 'Nitrato de Sódio de Sódio + Oxigênio',
        inputs: [
            { material: 'Sódio', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 1, icon: null }
        ],
        output: { material: 'Nitrato de Sódio', quantity: 5, icon: null },
        time: 0.6,
        category: 'Catalisador',
        tags: ['refinamento', 'duplo'],
        ratio: 5.0
    },
    {
        name: 'Di-Hidrogênio de Gelatina de Di-Hidrogênio',
        inputs: [{ material: 'Gelatina de Di-Hidrogênio', quantity: 1, icon: null }],
        output: { material: 'Di-Hidrogênio', quantity: 50, icon: null },
        time: 1.0,
        category: 'Combustível',
        tags: ['refinamento', 'decomposição'],
        ratio: 50.0
    },

    // --- CHROMATIC METAL EXPANSION ---
    {
        name: 'Metal Cromático de Cobre',
        inputs: [{ material: 'Cobre', quantity: 2, icon: null }],
        output: { material: 'Metal Cromático', quantity: 1, icon: null },
        time: 0.6,
        category: 'Metal',
        tags: ['refinamento', 'cromático'],
        ratio: 0.5
    },
    {
        name: 'Metal Cromático de Cádmio',
        inputs: [{ material: 'Cádmio', quantity: 1, icon: null }],
        output: { material: 'Metal Cromático', quantity: 1, icon: null },
        time: 0.6,
        category: 'Metal',
        tags: ['refinamento', 'cromático'],
        ratio: 1.0
    },
    {
        name: 'Metal Cromático de Emeril',
        inputs: [{ material: 'Emeril', quantity: 2, icon: null }],
        output: { material: 'Metal Cromático', quantity: 3, icon: null },
        time: 0.6,
        category: 'Metal',
        tags: ['refinamento', 'cromático'],
        ratio: 1.5
    },
    {
        name: 'Metal Cromático de Índio',
        inputs: [{ material: 'Índio', quantity: 2, icon: null }],
        output: { material: 'Metal Cromático', quantity: 4, icon: null },
        time: 0.6,
        category: 'Metal',
        tags: ['refinamento', 'cromático'],
        ratio: 2.0
    },
    {
        name: 'Cobre Infinito (com Metal Cromático)',
        inputs: [
            { material: 'Cobre', quantity: 1, icon: null },
            { material: 'Metal Cromático', quantity: 1, icon: null }
        ],
        output: { material: 'Cobre', quantity: 4, icon: null },
        time: 0.9,
        category: 'Metal',
        tags: ['refinamento', 'expansão', 'cobre'],
        ratio: 4.0
    },

    // --- GASES & PLANTS ---
    {
        name: 'Nitrogênio de Radônio',
        inputs: [
            { material: 'Radônio', quantity: 1, icon: null },
            { material: 'Metal Cromático', quantity: 1, icon: null }
        ],
        output: { material: 'Nitrogênio', quantity: 1, icon: null },
        time: 0.6,
        category: 'Gás',
        tags: ['refinamento', 'transmutação', 'gás'],
        ratio: 1.0
    },
    {
        name: 'Enxofre (Sulphurine) de Nitrogênio',
        inputs: [
            { material: 'Nitrogênio', quantity: 1, icon: null },
            { material: 'Metal Cromático', quantity: 1, icon: null }
        ],
        output: { material: 'Sulphurine', quantity: 1, icon: null },
        time: 0.6,
        category: 'Gás',
        tags: ['refinamento', 'transmutação', 'gás'],
        ratio: 1.0
    },
    {
        name: 'Radônio de Enxofre',
        inputs: [
            { material: 'Sulphurine', quantity: 1, icon: null },
            { material: 'Metal Cromático', quantity: 1, icon: null }
        ],
        output: { material: 'Radônio', quantity: 1, icon: null },
        time: 0.6,
        category: 'Gás',
        tags: ['refinamento', 'transmutação', 'gás'],
        ratio: 1.0
    },
    {
        name: 'Vidro de Frost Crystal',
        inputs: [{ material: 'Frost Crystal', quantity: 40, icon: null }],
        output: { material: 'Vidro', quantity: 1, icon: null },
        time: 0.6,
        category: 'Componente',
        tags: ['refinamento', 'vidro'],
        ratio: 0.025
    },
    {
        name: 'Vidro de Pó de Silicato',
        inputs: [{ material: 'Pó de Silicato', quantity: 40, icon: null }],
        output: { material: 'Vidro', quantity: 1, icon: null },
        time: 0.6,
        category: 'Componente',
        tags: ['refinamento', 'vidro'],
        ratio: 0.025
    },

    // --- HIGH VALUE ALLOYS ---
    {
        name: 'Metal Sujo para Nanites',
        inputs: [{ material: 'Metal Sujo', quantity: 1, icon: null }],
        output: { material: 'Nanites', quantity: 2, icon: null },
        time: 0.4,
        category: 'Moeda',
        tags: ['refinamento', 'nanites'],
        ratio: 2.0
    },
    {
        name: 'Platina de Prata e Ouro',
        inputs: [
            { material: 'Prata', quantity: 1, icon: null },
            { material: 'Ouro', quantity: 1, icon: null }
        ],
        output: { material: 'Platina', quantity: 1, icon: null },
        time: 0.6,
        category: 'Metal',
        tags: ['refinamento', 'platina'],
        ratio: 1.0
    },
    {
        name: 'Nanites de Platina',
        inputs: [{ material: 'Platina', quantity: 35, icon: null }],
        output: { material: 'Nanites', quantity: 1, icon: null },
        time: 0.4,
        category: 'Moeda',
        tags: ['refinamento', 'nanites'],
        ratio: 0.028
    },

    // --- ADVANCED COMPONENTS ---
    {
        name: 'Deutério de Di-Hidrogênio + Trítio',
        inputs: [
            { material: 'Di-Hidrogênio', quantity: 1, icon: null },
            { material: 'Trítio', quantity: 1, icon: null }
        ],
        output: { material: 'Deutério', quantity: 1, icon: null },
        time: 0.6,
        category: 'Combustível',
        tags: ['refinamento', 'deutério'],
        ratio: 1.0
    },
    {
        name: 'Cloro de Sal',
        inputs: [{ material: 'Sal', quantity: 2, icon: null }],
        output: { material: 'Cloro', quantity: 1, icon: null },
        time: 0.6,
        category: 'Mineral',
        tags: ['refinamento', 'cloro'],
        ratio: 0.5
    },
    {
        name: 'Expansão de Cloro (com Oxigênio)',
        inputs: [
            { material: 'Cloro', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 2, icon: null }
        ],
        output: { material: 'Cloro', quantity: 6, icon: null },
        time: 0.9,
        category: 'Mineral',
        tags: ['refinamento', 'expansão', 'lucro'],
        ratio: 6.0
    },
    {
        name: 'Amônia de Parafínio + Ferrita',
        inputs: [
            { material: 'Parafínio', quantity: 2, icon: null },
            { material: 'Poeira de Ferrita', quantity: 1, icon: null }
        ],
        output: { material: 'Amônia', quantity: 1, icon: null },
        time: 0.9,
        category: 'Gás',
        tags: ['refinamento', 'amônia'],
        ratio: 0.5
    },
    {
        name: 'Urânio de Radônio + Ferrita',
        inputs: [
            { material: 'Radônio', quantity: 1, icon: null },
            { material: 'Ferrita Magnetizada', quantity: 1, icon: null }
        ],
        output: { material: 'Urânio', quantity: 1, icon: null },
        time: 0.9,
        category: 'Metal',
        tags: ['refinamento', 'urânio'],
        ratio: 1.0
    },
    {
        name: 'Pirita de Ouro',
        inputs: [
            { material: 'Ouro', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 1, icon: null }
        ],
        output: { material: 'Pirita', quantity: 2, icon: null },
        time: 0.9,
        category: 'Metal',
        tags: ['refinamento', 'pirita'],
        ratio: 2.0
    },

    // --- ALLOYS (High Value) ---
    {
        name: 'Aronium (Parafínio + Cobalto)',
        inputs: [
            { material: 'Parafínio', quantity: 30, icon: null },
            { material: 'Cobalto', quantity: 60, icon: null },
            { material: 'Trítio', quantity: 20, icon: null }
        ],
        output: { material: 'Aronium', quantity: 1, icon: null },
        time: 0.9,
        category: 'Liga',
        tags: ['refinamento', 'triplo', 'aronium', 'valioso'],
        ratio: 0.01
    },
    {
        name: 'Aronium (Parafínio + Prata)',
        inputs: [
            { material: 'Parafínio', quantity: 30, icon: null },
            { material: 'Prata', quantity: 20, icon: null },
            { material: 'Cobalto', quantity: 60, icon: null }
        ],
        output: { material: 'Aronium', quantity: 1, icon: null },
        time: 0.9,
        category: 'Liga',
        tags: ['refinamento', 'triplo', 'aronium', 'valioso'],
        ratio: 0.01
    },
    {
        name: 'Bronze Sujo (Pirita + Ferrita)',
        inputs: [
            { material: 'Pirita', quantity: 30, icon: null },
            { material: 'Poeira de Ferrita', quantity: 60, icon: null },
            { material: 'Trítio', quantity: 20, icon: null }
        ],
        output: { material: 'Bronze Sujo', quantity: 1, icon: null },
        time: 0.9,
        category: 'Liga',
        tags: ['refinamento', 'triplo', 'bronze', 'valioso'],
        ratio: 0.01
    },
    {
        name: 'Herox (Amônia + Cobalto)',
        inputs: [
            { material: 'Amônia', quantity: 30, icon: null },
            { material: 'Cobalto', quantity: 60, icon: null },
            { material: 'Trítio', quantity: 20, icon: null }
        ],
        output: { material: 'Herox', quantity: 1, icon: null },
        time: 0.9,
        category: 'Liga',
        tags: ['refinamento', 'triplo', 'herox', 'valioso'],
        ratio: 0.01
    },
    {
        name: 'Lemmium (Urânio + Ferrita)',
        inputs: [
            { material: 'Urânio', quantity: 30, icon: null },
            { material: 'Poeira de Ferrita', quantity: 60, icon: null },
            { material: 'Trítio', quantity: 20, icon: null }
        ],
        output: { material: 'Lemmium', quantity: 1, icon: null },
        time: 0.9,
        category: 'Liga',
        tags: ['refinamento', 'triplo', 'lemmium', 'valioso'],
        ratio: 0.01
    },
    {
        name: 'Magno-Gold (Fósforo + Cobalto)',
        inputs: [
            { material: 'Fósforo', quantity: 30, icon: null },
            { material: 'Cobalto', quantity: 60, icon: null },
            { material: 'Trítio', quantity: 20, icon: null }
        ],
        output: { material: 'Magno-Gold', quantity: 1, icon: null },
        time: 0.9,
        category: 'Liga',
        tags: ['refinamento', 'triplo', 'magno-gold', 'valioso'],
        ratio: 0.01
    },
    {
        name: 'Grantine (Dioxita + Cobalto)',
        inputs: [
            { material: 'Dioxita', quantity: 30, icon: null },
            { material: 'Cobalto', quantity: 60, icon: null },
            { material: 'Trítio', quantity: 20, icon: null }
        ],
        output: { material: 'Grantine', quantity: 1, icon: null },
        time: 0.9,
        category: 'Liga',
        tags: ['refinamento', 'triplo', 'grantine', 'valioso'],
        ratio: 0.01
    },

    // --- GAS EXPANSION (Oxygen Loop) ---
    {
        name: 'Nitrogênio Infinito (com Oxigênio)',
        inputs: [
            { material: 'Nitrogênio', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 1, icon: null }
        ],
        output: { material: 'Nitrogênio', quantity: 3, icon: null },
        time: 0.6,
        category: 'Gás',
        tags: ['refinamento', 'expansão', 'nitrogênio'],
        ratio: 3.0
    },
    {
        name: 'Radônio Infinito (com Oxigênio)',
        inputs: [
            { material: 'Radônio', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 1, icon: null }
        ],
        output: { material: 'Radônio', quantity: 3, icon: null },
        time: 0.6,
        category: 'Gás',
        tags: ['refinamento', 'expansão', 'radônio'],
        ratio: 3.0
    },
    {
        name: 'Enxofre Infinito (com Oxigênio)',
        inputs: [
            { material: 'Sulphurine', quantity: 1, icon: null },
            { material: 'Oxigênio', quantity: 1, icon: null }
        ],
        output: { material: 'Sulphurine', quantity: 3, icon: null },
        time: 0.6,
        category: 'Gás',
        tags: ['refinamento', 'expansão', 'enxofre'],
        ratio: 3.0
    }
];
