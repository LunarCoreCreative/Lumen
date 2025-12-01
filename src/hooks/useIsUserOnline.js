import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { dbRealtime } from '../firebase';

export function useIsUserOnline(userId) {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        if (!userId) {
            setIsOnline(false);
            return;
        }

        const statusRef = ref(dbRealtime, '/status/' + userId);

        const unsubscribe = onValue(statusRef, (snapshot) => {
            const status = snapshot.val();
            setIsOnline(status?.state === 'online');
        }, (error) => {
            console.error("Error listening to user status:", error);
            setIsOnline(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return isOnline;
}
