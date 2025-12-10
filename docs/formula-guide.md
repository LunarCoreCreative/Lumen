# Formula System - Guia de Uso

## 🎯 Como Funciona

O SystemEditor agora suporta **fórmulas configuráveis** para atributos derivados. Isso significa que você pode definir como AC, HP, Initiative, etc. são calculados **sem código hard-coded**.

---

## 📝 **Sintaxe de Fórmulas**

### **Referências Básicas:**
```javascript
{STR}           // Valor do atributo Força
{DEX.mod}       // Modificador de Destreza
{level}         // Nível do personagem
{proficiency}   // Bônus de proficiência
{armor}         // Bônus de armadura equipada
{shield}        // Bônus de escudo (0 ou 2)
```

### **Operadores Matemáticos:**
```javascript
+  -  *  /  ()  // Operações básicas
```

### **Funções Disponíveis:**
```javascript
floor(x)        // Arredonda para baixo
ceil(x)         // Arredonda para cima
min(a, b, c)    // Retorna o menor valor
max(a, b, c)    // Retorna o maior valor
abs(x)          // Valor absoluto
round(x)        // Arredonda normalmente
```

---

## 🛠️ **Exemplos Práticos**

### **1. Armor Class (AC)**
```javascript
// D&D 5e padrão
formula: "10 + {DEX.mod} + {armor} + {shield}"

// Monk (sem armadura)
formula: "10 + {DEX.mod} + {WIS.mod}"

// Heavy Armor (DEX limitado)
formula: "10 + min({DEX.mod}, 2) + {armor}"
```

### **2. Hit Points (HP)**
```javascript
// D&D 5e
formula: "{level} * 8 + {CON.mod} * {level}"
// Ou mais explícito:
formula: "10 + {CON.mod} + ({level} - 1) * (6 + {CON.mod})"

// Sistema simples
formula: "{level} * 10"
```

### **3. Initiative**
```javascript
// D&D 5e
formula: "{DEX.mod}"

// Com bônus por nível
formula: "{DEX.mod} + floor({level} / 2)"

// Pathfinder 2e
formula: "{DEX.mod} + {proficiency}"
```

### **4. Proficiency Bonus**
```javascript
// D&D 5e
formula: "floor({level} / 4) + 2"

// Linear
formula: "floor({level} / 2) + 1"

// Custom
formula: "ceil({level} / 3)"
```

### **5. Spell DC**
```javascript
// D&D 5e
formula: "8 + {proficiency} + {INT.mod}"
// Ou {WIS.mod} ou {CHA.mod} dependendo da classe
```

### **6. Attack Bonus**
```javascript
// Melee
formula: "{STR.mod} + {proficiency}"

// Ranged
formula: "{DEX.mod} + {proficiency}"

// Finesse (melhor entre STR e DEX)
formula: "max({STR.mod}, {DEX.mod}) + {proficiency}"
```

---

## 🎨 **Como Configurar no SystemEditor**

### **AttributesEditor**

Ao criar um atributo derivado:

```javascript
{
  id: 'attr-ac',
  name: 'Armor Class',
  shortName: 'AC',
  type: 'derived',
  formula: '10 + {DEX.mod} + {armor} + {shield}',  // ← Nova propriedade!
  default: 10
}
```

### **Backwards Compatibility**

Se `formula` não estiver definido, o sistema usa a lógica legacy:
- Connections (antigo método)
- Hard-coded special cases

Mas **recomendamos migrar para fórmulas** para total flexibilidade!

---

## 🧪 **Testando Fórmulas**

Use a função `validateFormula()` para testar:

```javascript
import { validateFormula, calculateFormula } from '@/utils/formulaEngine';

// Testar sintaxe
validateFormula("10 + {DEX.mod}");  // → true
validateFormula("10 + INVALID");     // → false

// Testar resultado
const context = {
  level: 5,
  proficiency: 3,
  attributes: [
    { id: 'dex', shortName: 'DEX', value: 16 }  // Mod = +3
  ]
};

calculateFormula("10 + {DEX.mod}", context);  // → 13
```

---

## 📊 **Context Completo Disponível**

Quando uma fórmula é avaliada, o seguinte está disponível:

```javascript
{
  // Propriedades do personagem
  level: 5,
  proficiency: 3,
  
  // Todos os atributos com valores totais
  attributes: [
    { id: 'str', shortName: 'STR', value: 16, ... },
    { id: 'dex', shortName: 'DEX', value: 14, ... },
    // ...
  ],
  
  // Equipamentos
  armor: 5,           // Bônus de armadura
  shield: 2,          // 0 se não equipado
  
  // Dados completos do personagem
  character: { ... }  // Tudo do formData
}
```

---

## 🚀 **Benefícios**

### ✅ **Auto-Recalcula**
Quando DEX muda, AC recalcula automaticamente
Quando nível muda, HP recalcula automaticamente

### ✅ **Configurável**
Mestres definem fórmulas no SystemEditor
Não precisa alterar código

### ✅ **Universal**
Funciona para D&D, Pathfinder, sistemas customizados

### ✅ **Validado**
Fórmulas são testadas antes de salvar

---

## 🔜 **Próximos Passos**

1. **Task 1.1.3**: Skills auto-calculados com fórmulas
2. **Task 1.1.4**: HP com fórmulas por classe
3. **Task 1.1.5**: Proficiency bonus configurável
4. **UI no SystemEditor**: Campo visual para editar fórmulas

---

## 💡 **Dicas**

### **1. Use nomes de atributo consistentes**
```javascript
// ✅ Bom
{STR}, {DEX}, {CON}

// ❌ Evite
{strength}, {dexterity}  // Funciona, mas não é padrão
```

### **2. Teste com edge cases**
```javascript
// E se DEX for 8? (mod = -1)
"10 + {DEX.mod}"  // → 9 (correto)

// E se level for 1?
"floor({level} / 4) + 2"  // → 2 (correto)
```

### **3. Documente fórmulas complexas**
```javascript
{
  formula: "(10 + {level}) * {CON.mod} + 20",
  description: "HP = (10 + level) × CON mod + 20 base"
}
```

---

**Com o Formula Engine, o SystemEditor está pronto para calcular qualquer mecânica automaticamente!** 🎉
