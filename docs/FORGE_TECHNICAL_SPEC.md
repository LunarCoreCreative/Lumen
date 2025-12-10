# Forge Engine - Technical Specification

## Schema Version: 1.0.0

Este documento define a estrutura JSON do Core Engine do Forge.

---

# 1. Tipos Primitivos

```typescript
type FieldType = 'number' | 'text' | 'boolean' | 'select' | 'resource' | 'list' | 'reference';

type Operator = 
  | '==' | '!=' | '>' | '<' | '>=' | '<=' 
  | 'contains' | 'not_contains' 
  | 'is_empty' | 'is_not_empty';

type EffectType = 
  | 'set_value' | 'add_value' | 'subtract_value' | 'multiply_value'
  | 'roll_dice' | 'show_message' | 'trigger_event' | 'add_modifier';
```

---

# 2. Entity Schema

Entidade é qualquer coisa que pode ter campos: personagem, item, magia, condição, etc.

```json
{
  "id": "uuid",
  "type": "character | item | spell | condition | custom",
  "name": "string",
  "icon": "emoji | url",
  "color": "#hex",
  "fields": [ Field[] ],
  "events": [ Event[] ],
  "rules": [ Rule[] ]
}
```

---

# 3. Field Schema

Campo é uma variável dentro de uma entidade.

```json
{
  "id": "str",
  "name": "Força",
  "type": "number",
  "defaultValue": 10,
  "min": 1,
  "max": 30,
  "formula": null,
  "showOnSheet": true,
  "category": "attributes",
  "description": "Representa força física"
}
```

### Field Types

| Type | Descrição | Propriedades Extras |
|------|-----------|---------------------|
| `number` | Valor numérico | `min`, `max`, `step` |
| `text` | Texto livre | `maxLength`, `multiline` |
| `boolean` | Verdadeiro/Falso | - |
| `select` | Lista de opções | `options: [{value, label}]` |
| `resource` | Recurso com current/max | `formula` para max |
| `list` | Lista de referências | `entityType` |
| `reference` | Referência a outra entidade | `entityType` |

---

# 4. Computed Field (Fórmulas)

Campos podem ter valor calculado dinamicamente.

```json
{
  "id": "str_mod",
  "name": "Modificador de Força",
  "type": "number",
  "formula": "floor(({str} - 10) / 2)",
  "dependencies": ["str"]
}
```

### Sintaxe de Fórmula

```
{field_id}           → Valor do campo
{entity.field}       → Campo de entidade referenciada
floor(x)             → Arredondar para baixo
ceil(x)              → Arredondar para cima
max(a, b)            → Maior valor
min(a, b)            → Menor valor
round(x)             → Arredondar
abs(x)               → Valor absoluto
clamp(x, min, max)   → Limitar entre min e max
if(cond, then, else) → Condicional
```

---

# 5. Event Schema

Eventos são gatilhos que disparam regras.

```json
{
  "id": "on_level_up",
  "name": "Ao Subir de Nível",
  "trigger": "onChange",
  "field": "level",
  "condition": "{level} > {_previous.level}"
}
```

### Trigger Types

| Trigger | Descrição |
|---------|-----------|
| `onChange` | Quando um campo muda de valor |
| `onClick` | Quando uma ação é clicada |
| `onAdd` | Quando item é adicionado a lista |
| `onRemove` | Quando item é removido de lista |
| `onRoll` | Quando uma rolagem é feita |
| `onTurnStart` | Início do turno |
| `onTurnEnd` | Fim do turno |
| `custom` | Evento customizado (manual trigger) |

---

# 6. Rule Schema

Regras são lógica IF → THEN.

```json
{
  "id": "rule_001",
  "name": "Ganhar HP ao subir de nível",
  "event": "on_level_up",
  "conditions": [
    {
      "field": "class",
      "operator": "==",
      "value": "fighter"
    }
  ],
  "effects": [
    {
      "type": "add_value",
      "target": "hp_max",
      "value": "{con_mod} + 10"
    },
    {
      "type": "show_message",
      "message": "Você ganhou {con_mod + 10} HP!"
    }
  ]
}
```

---

# 7. Modifier Schema

Modificadores são bônus/penalidades temporários ou permanentes.

```json
{
  "id": "mod_001",
  "name": "Bênção",
  "source": "spell_bless",
  "target": "attack_bonus",
  "value": "+1d4",
  "type": "add",
  "duration": {
    "type": "rounds",
    "value": 10
  },
  "stackable": false
}
```

---

# 8. Action Schema

Ações são botões que o jogador pode clicar.

```json
{
  "id": "action_attack",
  "name": "Atacar",
  "icon": "⚔️",
  "category": "combat",
  "rolls": [
    {
      "name": "Ataque",
      "formula": "1d20 + {attack_bonus}",
      "type": "attack"
    },
    {
      "name": "Dano",
      "formula": "{weapon.damage} + {str_mod}",
      "type": "damage",
      "condition": "attack.success"
    }
  ],
  "cost": {
    "field": "actions",
    "value": 1
  }
}
```

---

# 9. Layout Schema

Define como a ficha é renderizada.

```json
{
  "sections": [
    {
      "id": "header",
      "type": "row",
      "children": ["name", "level", "class"]
    },
    {
      "id": "attributes",
      "type": "grid",
      "columns": 3,
      "children": ["str", "dex", "con", "int", "wis", "cha"]
    },
    {
      "id": "hp_section",
      "type": "resource_bar",
      "field": "hp",
      "color": "#ef4444"
    }
  ]
}
```

---

# 10. Complete System Schema

```json
{
  "id": "uuid",
  "version": "1.0.0",
  "metadata": {
    "name": "Meu Sistema",
    "description": "...",
    "author": "uid",
    "icon": "🎲",
    "tags": ["fantasy", "d20"]
  },
  "entityTypes": [
    {
      "id": "character",
      "name": "Personagem",
      "fields": [...],
      "events": [...],
      "rules": [...],
      "layout": {...}
    },
    {
      "id": "item",
      "name": "Item",
      "fields": [...],
      "events": [...],
      "rules": [...]
    }
  ],
  "globalEvents": [...],
  "globalRules": [...],
  "dice": {
    "available": ["d4", "d6", "d8", "d10", "d12", "d20", "d100"],
    "primary": "d20"
  }
}
```

---

# 11. Runtime State

Estado de uma instância de entidade (personagem jogando).

```json
{
  "entityId": "uuid",
  "systemId": "uuid",
  "type": "character",
  "values": {
    "str": 16,
    "str_mod": 3,
    "hp": { "current": 45, "max": 52 },
    "level": 5
  },
  "modifiers": [...],
  "inventory": [...],
  "conditions": [...]
}
```

---

# 12. Engine Interfaces (TypeScript)

```typescript
interface ForgeEngine {
  // Core
  createEntity(type: string, data?: Partial<EntityState>): EntityState;
  getValue(entity: EntityState, fieldId: string): any;
  setValue(entity: EntityState, fieldId: string, value: any): EntityState;
  
  // Formula
  evaluate(formula: string, context: EntityState): number | string | boolean;
  
  // Events
  triggerEvent(entity: EntityState, eventId: string): EntityState;
  
  // Rules
  executeRules(entity: EntityState, eventId: string): EntityState;
  
  // Modifiers
  addModifier(entity: EntityState, modifier: Modifier): EntityState;
  removeModifier(entity: EntityState, modifierId: string): EntityState;
  getEffectiveValue(entity: EntityState, fieldId: string): any;
  
  // Dice
  roll(formula: string): RollResult;
}
```

---

# 13. File Structure

```
src/
├── forge/
│   ├── core/
│   │   ├── ForgeEngine.js       # Main engine class
│   │   ├── EntityManager.js     # Entity CRUD
│   │   ├── FieldResolver.js     # Field value resolution
│   │   └── StateManager.js      # State management
│   │
│   ├── formula/
│   │   ├── FormulaParser.js     # Parse formula strings
│   │   ├── FormulaEvaluator.js  # Evaluate parsed formulas
│   │   └── FormulaCache.js      # Cache computed values
│   │
│   ├── events/
│   │   ├── EventEmitter.js      # Event bus
│   │   ├── EventRegistry.js     # Register/unregister events
│   │   └── EventTrigger.js      # Trigger events
│   │
│   ├── rules/
│   │   ├── RuleEngine.js        # Execute rules
│   │   ├── ConditionEvaluator.js # Evaluate conditions
│   │   └── EffectExecutor.js    # Execute effects
│   │
│   ├── modifiers/
│   │   ├── ModifierStack.js     # Stack modifiers
│   │   └── ModifierResolver.js  # Resolve final values
│   │
│   ├── dice/
│   │   ├── DiceRoller.js        # Roll dice
│   │   └── DiceParser.js        # Parse dice notation
│   │
│   └── index.js                 # Export all
│
├── editor/                      # System Editor UI (Phase 2)
└── sheet/                       # Character Sheet UI (Phase 3)
```
