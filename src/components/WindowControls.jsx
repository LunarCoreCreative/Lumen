import React from 'react';
import styles from './WindowControls.module.css';
import { Minus, Square, X } from 'lucide-react';

export function WindowControls() {
    const handleMinimize = () => {
        if (window.electronAPI) {
            window.electronAPI.minimizeWindow();
        }
    };

    const handleMaximize = () => {
        if (window.electronAPI) {
            window.electronAPI.maximizeWindow();
        }
    };

    const handleClose = () => {
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        }
    };

    return (
        <div className={styles.windowControls}>
            <button
                className={styles.controlBtn}
                onClick={handleMinimize}
                title="Minimizar"
            >
                <Minus size={14} />
            </button>
            <button
                className={styles.controlBtn}
                onClick={handleMaximize}
                title="Maximizar"
            >
                <Square size={12} />
            </button>
            <button
                className={`${styles.controlBtn} ${styles.closeBtn}`}
                onClick={handleClose}
                title="Fechar"
            >
                <X size={14} />
            </button>
        </div>
    );
}
