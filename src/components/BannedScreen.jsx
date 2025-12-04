import React from 'react';
import styles from './BannedScreen.module.css';
import { ShieldAlert } from 'lucide-react';

export function BannedScreen({ type, reason, onDismiss }) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <ShieldAlert size={64} color="#ef4444" />
                </div>
                <h1 className={styles.title}>ACESSO NEGADO</h1>
                <p className={styles.subtitle}>
                    {type === 'ip'
                        ? 'Seu endereço IP foi banido permanentemente deste sistema.'
                        : 'Sua conta foi suspensa por violação dos termos de uso.'}
                </p>

                <div className={styles.reasonBox}>
                    <span className={styles.reasonLabel}>Motivo:</span>
                    <p className={styles.reasonText}>{reason || 'Violação das diretrizes da comunidade.'}</p>
                </div>

                <div className={styles.footer}>
                    <p>Se você acredita que isso é um erro, entre em contato com o suporte.</p>
                    <button onClick={onDismiss} className={styles.button}>
                        Voltar para Login
                    </button>
                </div>
            </div>
        </div>
    );
}
