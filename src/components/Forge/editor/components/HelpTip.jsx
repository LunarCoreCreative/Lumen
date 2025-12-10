import React, { useState } from 'react';
import styles from '../Editor.module.css';
import { HelpCircle } from 'lucide-react';

/**
 * Label - Rótulo de campo com ícone de ajuda opcional
 * 
 * Uso: <Label text="Nome do Campo" help="Texto de ajuda que aparece ao hover" />
 */
export function Label({ text, help, children }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <label className={styles.labelWithHelp}>
            {text || children}
            {help && (
                <span
                    className={styles.helpTip}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <HelpCircle size={14} />
                    {showTooltip && (
                        <div className={styles.helpTooltip}>
                            {help}
                        </div>
                    )}
                </span>
            )}
        </label>
    );
}

// Textos de ajuda pré-definidos para o Field Editor
export const HELP = {
    // Identificação
    displayName: 'O nome que aparecerá na ficha do personagem. Pode conter espaços e acentos.',
    internalId: 'ID único usado em fórmulas e regras. Minúsculo, sem espaços. Ex: hp, strength_mod',
    category: 'Agrupa campos similares. Ajuda na organização do Layout e na aba Entidades.',
    icon: 'Emoji que representa este campo visualmente. Use um único caractere.',
    description: 'Texto explicativo que aparece como tooltip para o jogador.',

    // Tipos
    typeNumber: 'Valor numérico simples. Ideal para atributos, níveis, contadores.',
    typeResource: 'Par de valores atual/máximo com barra. Perfeito para HP, Mana, Slots.',
    typeDice: 'Fórmula de dado como "1d8+2". Pode ser rolado ao clicar.',
    typeComputed: 'Calculado automaticamente via fórmula. Atualiza quando dependências mudam.',
    typeText: 'Campo de texto livre. Pode ser linha única ou área de texto.',
    typeBoolean: 'Verdadeiro/Falso. Bom para estados como "Inspiração" ou "Inconsciente".',
    typeSelect: 'Lista de opções. Ideal para Classe, Raça, Alinhamento.',
    typeList: 'Coleção de itens. Usado para inventário, magias, etc.',

    // Configurações de Número
    defaultValue: 'Valor inicial quando uma nova ficha é criada.',
    min: 'Valor mínimo permitido. Deixe vazio para sem limite inferior.',
    max: 'Valor máximo permitido. Deixe vazio para sem limite superior.',
    step: 'Incremento ao usar +/-. Ex: 1 para inteiros, 0.5 para meios.',
    roundMode: 'Como arredondar resultados de fórmulas decimais.',

    // Recurso
    maxFormula: 'Fórmula para calcular o máximo. Use {campo} para referências. Ex: {constitution} + ({level} * 8)',
    allowOverflow: 'Se SIM, valor atual pode ultrapassar o máximo (HP temporário).',
    allowNegative: 'Se SIM, permite valores negativos (alguns sistemas usam).',
    barColor: 'Cor da barra de progresso que aparece na ficha.',

    // Dado
    diceFormula: 'Notação de dado. Suporta: 1d20, 2d6+5, 4d6kh3 (keep highest 3).',
    exploding: 'Quando rolar o máximo, rola de novo e soma. Ex: 6 em 1d6 → rola mais.',
    autoRoll: 'Se SIM, o dado é rolado automaticamente quando a ficha abre.',

    // Fórmula
    formula: 'Expressão matemática. Funções: floor(), ceil(), max(a,b), min(a,b). Campos: {strength}',
    showFormulaTooltip: 'Se SIM, mostra a fórmula como tooltip ao passar o mouse no valor.',

    // Texto
    placeholder: 'Texto de exemplo que aparece quando o campo está vazio.',
    multiline: 'Se SIM, permite múltiplas linhas (área de texto).',
    markdown: 'Se SIM, suporta formatação Markdown no texto.',
    maxLength: 'Número máximo de caracteres permitidos.',

    // Comportamento
    modifiable: 'Se SIM, este campo pode receber bônus/penalidades de equipamentos e magias.',
    rollable: 'Se SIM, este campo pode ser usado como modificador em rolagens.',
    triggers: 'Eventos automáticos disparados quando o valor muda. Úteis para automações.',

    // Visualização
    displayMode: 'Como este campo será renderizado na ficha do personagem.',
    gridSize: 'Quantas colunas este campo ocupa no layout da ficha.',
    showOnSheet: 'Se NÃO, o campo existe internamente mas não aparece na ficha.',
    showLabel: 'Se NÃO, apenas o valor é mostrado, sem o nome do campo.',
    customColor: 'Cor customizada para destacar este campo na ficha.',

    // Validação
    required: 'Se SIM, este campo não pode ficar vazio.',
    integer: 'Se SIM, apenas números inteiros são aceitos (sem decimais).'
};
