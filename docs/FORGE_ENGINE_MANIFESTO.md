# 🌙 **FORGE ENGINE — Documento Oficial de Filosofia, Arquitetura e Roadmap**

---

# **1. Missão do Forge Engine**

Forge Engine é uma **engine agnóstica de RPG**, capaz de criar, visualizar e executar qualquer sistema de regras, sem código e sem semântica fixa.
Ele funciona como um **construtor universal de mecânicas**, permitindo que mestres e criadores definam atributos, eventos, ações e cálculos, e que o motor execute tudo dinamicamente.

> **O Forge não sabe o que é Força, HP, AC, Magia ou Perícia.
> Quem define isso são os usuários.
> O Forge apenas interpreta regras.**

---

# **2. O Que é "Agnóstico" Dentro do Forge**

### O Forge NÃO possui:

* Atributos pré-definidos
* Regras internas de dano, vida, defesa, perícia
* Classes, raças, magias, inventários, combate
* Limitações de sistema

### O Forge SÓ possui:

* Entidades
* Campos (variáveis)
* Eventos
* Regras (if → then)
* Fórmulas
* Modificadores
* Ações
* Layout visual da ficha
* Runtime executor

---

# **3. Metáfora Central**

> O Forge é para RPG o que Unreal é para games:
> **Uma engine visual que permite criar sistemas sem programar.**

Usuários criam:

* sistemas inteiros do zero
* fichas
* mecânicas
* cálculos
* fluxos de eventos
* interações
* condições
* magias
* equipamentos
* módulos narrativos
* ações automatizadas

---

# **4. Arquitetura Conceitual**

## **Nível 0 — Core Engine (Invisible Layer)**

O coração lógico do Forge. Não exibe UI nem conhece RPG.

### Componentes:

* Sistema de entidades
* Sistema de campos
* Sistema de eventos
* Executor de regras
* Motor de fórmulas
* Motor de modificadores
* Runtime state management

### Responsabilidade:

Interpretar *transformações de estado* e *eventos*.

---

## **Nível 1 — System Editor (Agnóstico)**

Interface onde o criador define a **linguagem** do seu RPG.

Usuário cria:

* Atributos
* Recursos
* Tipos de entidade (personagem, item, condição, magia…)
* Eventos customizados
* Regras e automações
* Fórmulas
* Progressão
* Inventário
* Layout da ficha (arrastar e soltar)

Nada aqui tem semântica.
Tudo é só dado + comportamento.

---

## **Nível 2 — Ficha / Character Sheet (Bindings)**

A UI da ficha é **apenas uma janelinha** que:

* mostra valores
* dispara eventos
* aplica ações visuais (rolar, animar, exibir modal etc.)

Ela não calcula nada.
Não "entende" o que está sendo exibido.
Ela só está vinculada aos campos definidos no System Editor.

---

## **Nível 3 — Runtime / Mesa Virtual**

Camada responsável por:

* logs
* rolagens
* execução de regras
* efeitos visuais
* interações
* turno (se existir)
* comunicação realtime (futuro)

Aqui o "jogo acontece".
Mas quem define o que é um "ataque" ou "magia"?
O mestre, no System Editor.

---

# **5. Os 7 Princípios da Engine Agnóstica**

### **1. O Forge não interpreta significado**

Tudo é só dado.

### **2. Nada é fixo**

Todo sistema é criado do zero.

### **3. Toda lógica é visual**

Nenhum código é necessário.

### **4. Sistemas são módulos independentes**

Cada módulo é autocontido.

### **5. A ficha é só uma projeção visual**

Quem manda é o sistema.

### **6. O motor é determinístico e previsível**

Sem efeitos mágicos ocultos.

### **7. Tudo que pode ser automatizado, deve ser automatizado**

O usuário define regras, o Forge executa.

---

# **6. O Roadmap Oficial do Forge Engine**

Dividido em **5 fases**, todas essenciais para formar a engine completa.

---

## 🔴 **FASE 1 — Core Engine & Formula System (Fundação)**

Objetivo: a linguagem-base da engine.

### 1.1 — Entities + Fields

* Criar modelo universal de entidade
* Suporte a tipos básicos
* Referências internas

### 1.2 — Formula Engine

* Parser de expressões
* Variáveis: `{str}`, `{level}`, `{item.bonus}`
* Funções: `ceil`, `floor`, `max`, `min`
* Sistema de dependências
* Cache de cálculos

### 1.3 — Event System

* `onChange(field)`
* `onClick(action)`
* `onEquip(item)`
* Eventos custom criados pelo usuário

### 1.4 — Rule Engine

* Estrutura IF → THEN
* Condições com múltiplos operadores
* Efeitos múltiplos
* Execução ordenada

**Entrega da fase:**
A base lógica da engine existe.

---

## 🟠 **FASE 2 — System Editor (Criar Sistemas)**

Objetivo: permitir criação visual de um sistema completo.

### 2.1 — Editor de Campos

### 2.2 — Editor de Atributos

### 2.3 — Editor de Entidades

### 2.4 — Editor de Eventos

### 2.5 — Editor de Regras

### 2.6 — Editor de Fórmulas

### 2.7 — Editor de Layout (arrastar/soltar)

**Entrega da fase:**
Qualquer usuário pode criar um sistema inteiro do zero.

---

## 🟡 **FASE 3 — Character Sheet Runtime (Executar Sistemas)**

Objetivo: projetar e manipular personagens.

### 3.1 — Binder de atributos

### 3.2 — UI dinâmica atualizando automaticamente

### 3.3 — Rolagens (normal, vantagem, desvantagem)

### 3.4 — Modais de resultado

### 3.5 — Logs internos

**Entrega da fase:**
Fichas vivas, dinâmicas e totalmente automatizadas.

---

## 🟢 **FASE 4 — Automation & Interaction Layer**

Objetivo: automações avançadas.

### 4.1 — Inventário + Equipamentos

### 4.2 — Condições e Efeitos

### 4.3 — Ações personalizadas

### 4.4 — Temporizadores, durações, contadores

### 4.5 — Recursos avançados (slots, cargas, pontos)

**Entrega da fase:**
Um sistema pode ter combate, magias, skills, tudo automatizado.

---

## 🔵 **FASE 5 — Mesa Virtual (VTT)**

Objetivo: criar a camada de jogo em grupo.

### 5.1 — Chat com dados

### 5.2 — Painel de ações

### 5.3 — Turnos

### 5.4 — Interação mestre → jogadores

### 5.5 — Área de combate (futuro opcional)

### 5.6 — Sincronização realtime (WebRTC/Socket)

**Entrega da fase:**
Uma mesa completa de RPG pode ser rodada dentro do Forge.

---

# **7. Filosofia da Experiência do Usuário**

### O usuário nunca deve sentir que "não pode".

Toda ferramenta deve reforçar a sensação de:

> "Se eu pensei, eu consigo criar."

### Nada deve parecer técnico demais.

A UX deve comunicar visualmente:

* fluxo
* lógica
* dependências
* formas de criar
* impacto de cada regra

### O Forge deve ser didático.

O usuário deve aprender RPG **criando RPG**.

---

# **8. Proposta de Branding para o Forge**

### Frase curta:

> **Forge Engine — Crie qualquer RPG. Sem código. Sem limites.**

### Frase longa:

> **O Forge é uma engine agnóstica de RPG que permite criar sistemas completos, fichas dinâmicas e mesas automatizadas usando apenas lógica visual.**

---

# **9. Status de Implementação**

| Fase | Status | Progresso |
|------|--------|-----------|
| 🔴 Fase 1 - Core Engine | 🔨 Em Desenvolvimento | 0% |
| 🟠 Fase 2 - System Editor | ⏳ Aguardando | 0% |
| 🟡 Fase 3 - Character Sheet | ⏳ Aguardando | 0% |
| 🟢 Fase 4 - Automation | ⏳ Aguardando | 0% |
| 🔵 Fase 5 - VTT | ⏳ Aguardando | 0% |
