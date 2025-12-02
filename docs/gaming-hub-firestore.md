# Gaming Hub - Estrutura do Firestore

## Coleção Principal: `gamingHub`

### Subcoleção: `games`

Armazena metadados de cada jogo disponível no Hub.

```javascript
gamingHub/games/{gameId}
{
  name: string,              // "No Man's Sky"
  slug: string,              // "nomanssky"
  description: string,       // Descrição breve do jogo
  bannerUrl: string,         // URL da imagem de banner
  logoUrl: string | null,    // URL do logo (opcional)
  color: string,             // Cor tema do jogo (hex)
  contentTypes: string[],    // ["recipes", "guides", "mods"]
  isActive: boolean,         // Se o jogo está ativo
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Exemplo:**
```javascript
gamingHub/games/nomanssky
{
  name: "No Man's Sky",
  slug: "nomanssky",
  description: "Receitas de refinamento, guias e recursos",
  bannerUrl: "https://...",
  logoUrl: null,
  color: "#ff4655",
  contentTypes: ["recipes", "guides"],
  isActive: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

---

### Subcoleção: `games/{gameId}/recipes`

Armazena receitas de refinamento para No Man's Sky.

```javascript
gamingHub/games/nomanssky/recipes/{recipeId}
{
  name: string,              // "Pure Ferrite from Ferrite Dust"
  inputs: array[{            // Materiais de entrada
    material: string,        // Nome do material
    quantity: number,        // Quantidade necessária
    icon: string | null      // URL do ícone (opcional)
  }],
  output: {                  // Material de saída
    material: string,
    quantity: number,
    icon: string | null
  },
  time: number,              // Tempo em segundos
  category: string,          // "Metal", "Combustível", "Componente"
  tags: string[],            // ["refining", "basic", "metal"]
  ratio: number,             // Ratio de eficiência (calculado)
  createdBy: string,         // UID do admin que criou
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Exemplo:**
```javascript
gamingHub/games/nomanssky/recipes/pure-ferrite-basic
{
  name: "Pure Ferrite from Ferrite Dust",
  inputs: [
    {
      material: "Ferrite Dust",
      quantity: 1,
      icon: null
    }
  ],
  output: {
    material: "Pure Ferrite",
    quantity: 1,
    icon: null
  },
  time: 0.6,
  category: "Metal",
  tags: ["refining", "basic", "metal"],
  ratio: 1.0,
  createdBy: "admin-uid-123",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

---

### Subcoleção: `games/{gameId}/guides`

Para futuros guias de jogos.

```javascript
gamingHub/games/{gameId}/guides/{guideId}
{
  title: string,
  content: string,           // Markdown ou rich text
  author: string,            // UID
  category: string,
  tags: string[],
  views: number,
  likes: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### Coleção: `gamingHub/suggestions`

Sistema de sugestões da comunidade.

```javascript
gamingHub/suggestions/{suggestionId}
{
  title: string,             // "Adicionar receitas de culinária"
  description: string,       // Descrição detalhada
  gameId: string,            // "nomanssky" ou "all" para geral
  type: string,              // "feature", "content", "bug", "improvement"
  status: string,            // "pending", "reviewing", "approved", "implemented", "rejected"
  votes: number,             // Contador de votos
  voters: string[],          // Array de UIDs que votaram
  authorId: string,          // UID do autor
  authorName: string,        // Nome do autor (denormalizado)
  authorPhoto: string,       // Foto do autor (denormalizado)
  createdAt: timestamp,
  updatedAt: timestamp,
  implementedAt: timestamp | null
}
```

**Subcoleção de comentários:**
```javascript
gamingHub/suggestions/{suggestionId}/comments/{commentId}
{
  text: string,
  authorId: string,
  authorName: string,
  authorPhoto: string,
  createdAt: timestamp
}
```

---

## Índices Necessários

### Para `recipes`:
- Índice composto: `category` (ASC) + `createdAt` (DESC)
- Índice composto: `tags` (ARRAY) + `createdAt` (DESC)

### Para `suggestions`:
- Índice composto: `gameId` (ASC) + `votes` (DESC)
- Índice composto: `status` (ASC) + `votes` (DESC)
- Índice composto: `gameId` (ASC) + `status` (ASC) + `votes` (DESC)

---

## Regras de Segurança (Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Gaming Hub - Leitura pública, escrita apenas para admins
    match /gamingHub/games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Receitas
      match /recipes/{recipeId} {
        allow read: if true;
        allow write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      }
      
      // Guias
      match /guides/{guideId} {
        allow read: if true;
        allow write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      }
    }
    
    // Sugestões - Leitura pública, criação para autenticados
    match /gamingHub/suggestions/{suggestionId} {
      allow read: if true;
      allow create: if request.auth != null &&
                       request.resource.data.authorId == request.auth.uid;
      allow update: if request.auth != null && (
        // Autor pode editar
        resource.data.authorId == request.auth.uid ||
        // Admin pode mudar status
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      allow delete: if request.auth != null && (
        resource.data.authorId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      
      // Comentários
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null &&
                         request.resource.data.authorId == request.auth.uid;
        allow update, delete: if request.auth != null &&
                                 resource.data.authorId == request.auth.uid;
      }
    }
  }
}
```

---

## Inicialização de Dados

### Script para popular jogos iniciais:

```javascript
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

async function initializeGames() {
  const games = [
    {
      id: 'nomanssky',
      name: "No Man's Sky",
      slug: 'nomanssky',
      description: 'Receitas de refinamento, guias e recursos',
      bannerUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=400&fit=crop',
      logoUrl: null,
      color: '#ff4655',
      contentTypes: ['recipes', 'guides'],
      isActive: true
    },
    {
      id: 'minecraft',
      name: 'Minecraft',
      slug: 'minecraft',
      description: 'Mods, plugins e conteúdos exclusivos Lumen',
      bannerUrl: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=800&h=400&fit=crop',
      logoUrl: null,
      color: '#62c462',
      contentTypes: ['mods', 'plugins', 'guides'],
      isActive: false
    },
    {
      id: 'projectzomboid',
      name: 'Project Zomboid',
      slug: 'projectzomboid',
      description: 'Guias de sobrevivência e builds',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=400&fit=crop',
      logoUrl: null,
      color: '#8b0000',
      contentTypes: ['guides', 'builds'],
      isActive: false
    }
  ];

  for (const game of games) {
    const gameRef = doc(db, 'gamingHub', 'games', game.id);
    await setDoc(gameRef, {
      ...game,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Game ${game.name} initialized`);
  }
}
```
