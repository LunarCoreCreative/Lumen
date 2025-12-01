import React from 'react';
import styles from './MainLayout.module.css';

export function MainLayout({ sidebar, topbar, content, rightSidebar }) {
    return (
        <div className={styles.layoutContainer}>
            {/* Área da Sidebar Esquerda */}
            <aside className={styles.leftSidebar}>
                {sidebar}
            </aside>

            {/* Área Principal (Topo + Conteúdo) */}
            <main className={styles.mainColumn}>
                <div className={styles.topBarWrapper}>
                    {topbar}
                </div>

                <div className={styles.contentWrapper}>
                    {content}
                </div>
            </main>

            {/* Área da Sidebar Direita (Opcional) */}
            {rightSidebar && (
                <aside className={styles.rightSidebar}>
                    {rightSidebar}
                </aside>
            )}
        </div>
    );
}
