import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useIsOwner(user) {
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkOwnerStatus = async () => {
            if (!user?.uid) {
                setIsOwner(false);
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setIsOwner(userDoc.data().isOwner === true);
                } else {
                    setIsOwner(false);
                }
            } catch (error) {
                console.error('Erro ao verificar status de owner:', error);
                setIsOwner(false);
            } finally {
                setLoading(false);
            }
        };

        checkOwnerStatus();
    }, [user?.uid]);

    return { isOwner, loading };
}
