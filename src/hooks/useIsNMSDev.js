import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook para verificar se o usuário é NMS Dev (gerente do No Man's Sky)
 * @param {string} userId - ID do usuário
 * @returns {{ isNMSDev: boolean, loading: boolean }}
 */
export function useIsNMSDev(userId) {
    const [isNMSDev, setIsNMSDev] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setIsNMSDev(false);
            setLoading(false);
            return;
        }

        const fetchNMSDevStatus = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setIsNMSDev(userDoc.data().isNMSDev === true);
                } else {
                    setIsNMSDev(false);
                }
            } catch (error) {
                console.error('Erro ao verificar status de NMS Dev:', error);
                setIsNMSDev(false);
            } finally {
                setLoading(false);
            }
        };

        fetchNMSDevStatus();
    }, [userId]);

    return { isNMSDev, loading };
}
