import React from 'react';
import styles from './ConfirmDialog.module.css';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onCancel}>
                    <X size={20} />
                </button>

                <div className={styles.iconContainer}>
                    <AlertTriangle size={48} className={styles.icon} />
                </div>

                <div className={styles.content}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.message}>{message}</p>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className={styles.confirmButton} onClick={onConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
