import React from 'react';
import styles from './PlayerArea.module.css';
import { ArrowLeft, Scroll, Wrench } from 'lucide-react';

/**
 * PlayerArea - Fichas de Personagem (Em Reconstrução)
 * 
 * Este componente será reconstruído como parte da nova engine universal de RPG.
 * 
 * TODO:
 * - [ ] Seleção de sistema (criado pelo mestre)
 * - [ ] Criação de personagem adaptativa
 * - [ ] Atributos dinâmicos baseados no sistema
 * - [ ] Habilidades e magias baseadas no sistema
 * - [ ] Equipamentos e inventário
 * - [ ] Rolagem de dados integrada
 */
export function PlayerArea({ user, onBack }) {
    return (
        <div className={styles.container}>
            {/* Header com botão de voltar */}
            <div className={styles.header}>
                <button className={styles.backButton} onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Voltar</span>
                </button>
                <div className={styles.headerTitle}>
                    <Scroll size={24} />
                    <h1>Fichas de Personagem</h1>
                </div>
            </div>

            {/* Placeholder - Área em Construção */}
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                    <Wrench size={64} />
                </div>
                <h2>Em Reconstrução</h2>
                <p>
                    Esta área está sendo reconstruída para se adaptar
                    automaticamente a qualquer sistema criado pelo mestre.
                </p>
                <div className={styles.todoList}>
                    <h3>Próximas Features:</h3>
                    <ul>
                        <li>📋 Seleção de Sistema</li>
                        <li>👤 Criação de Personagem Adaptativa</li>
                        <li>🎯 Atributos Dinâmicos</li>
                        <li>⚡ Habilidades e Magias do Sistema</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
