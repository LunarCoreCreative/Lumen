import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Gera um código aleatório complexo para Admin
 * Formato: LUMEN-XXXX-XXXX-XXXX (16 caracteres alfanuméricos)
 */
export function generateAdminCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];

    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }

    return `LUMEN-${segments.join('-')}`;
}

/**
 * Cria um novo código admin no Firestore
 * @param {string} ownerId - ID do owner que gerou o código
 * @returns {Promise<Object>} Código gerado e ID do documento
 */
export async function createAdminCode(ownerId) {
    const code = generateAdminCode();

    const codeDoc = {
        code: code,
        status: 'valid', // 'valid' | 'used' | 'revoked'
        createdBy: ownerId,
        createdAt: serverTimestamp(),
        usedBy: null,
        usedAt: null,
        revokedAt: null,
        revokedBy: null
    };

    const docRef = await addDoc(collection(db, 'adminCodes'), codeDoc);

    return {
        id: docRef.id,
        code: code,
        ...codeDoc
    };
}

/**
 * Valida e usa um código admin
 * @param {string} code - Código a ser validado
 * @param {string} userId - ID do usuário que está usando o código
 * @returns {Promise<boolean>} true se válido e usado com sucesso
 */
export async function validateAndUseAdminCode(code, userId) {
    // Buscar código no Firestore
    const q = query(
        collection(db, 'adminCodes'),
        where('code', '==', code),
        where('status', '==', 'valid')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { success: false, error: 'Código inválido ou já utilizado' };
    }

    const codeDoc = snapshot.docs[0];

    // Marcar como usado
    await updateDoc(doc(db, 'adminCodes', codeDoc.id), {
        status: 'used',
        usedBy: userId,
        usedAt: serverTimestamp()
    });

    // Promover usuário a admin
    await updateDoc(doc(db, 'users', userId), {
        isAdmin: true,
        adminActivatedAt: serverTimestamp()
    });

    return { success: true };
}

/**
 * Busca todos os códigos admin
 * @param {string} ownerId - ID do owner (opcional, para filtrar)
 * @returns {Promise<Array>} Lista de códigos
 */
export async function getAdminCodes(ownerId = null) {
    let q;

    if (ownerId) {
        q = query(
            collection(db, 'adminCodes'),
            where('createdBy', '==', ownerId)
        );
    } else {
        q = query(collection(db, 'adminCodes'));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

/**
 * Revoga um código admin válido
 * @param {string} codeId - ID do código a ser revogado
 * @param {string} ownerId - ID do owner que está revogando
 */
export async function revokeAdminCode(codeId, ownerId) {
    await updateDoc(doc(db, 'adminCodes', codeId), {
        status: 'revoked',
        revokedBy: ownerId,
        revokedAt: serverTimestamp()
    });
}
