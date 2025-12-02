import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useIsAdmin(userId) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        const fetchAdminStatus = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setIsAdmin(userDoc.data().isAdmin === true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Erro ao verificar status de admin:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStatus();
    }, [userId]);

    return { isAdmin, loading };
}
