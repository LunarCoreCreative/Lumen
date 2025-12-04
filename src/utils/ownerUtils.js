import { collection, query, getDocs, doc, updateDoc, where, orderBy, limit, serverTimestamp, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Busca todos os usuários do sistema
 * @param {Object} filters - Filtros opcionais (status, search, etc)
 * @returns {Promise<Array>} Lista de usuários
 */
export async function getAllUsers(filters = {}) {
    try {
        let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

        // Aplicar limite se fornecido
        if (filters.limit) {
            q = query(q, limit(filters.limit));
        }

        const snapshot = await getDocs(q);
        let users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filtrar por status de ban (client-side por enquanto)
        if (filters.status === 'banned') {
            users = users.filter(u => u.isBanned === true);
        } else if (filters.status === 'active') {
            users = users.filter(u => !u.isBanned);
        }

        // Filtrar por admin
        if (filters.role === 'admin') {
            users = users.filter(u => u.isAdmin === true);
        } else if (filters.role === 'owner') {
            users = users.filter(u => u.isOwner === true);
        }

        // Busca por nome/email
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            users = users.filter(u =>
                u.displayName?.toLowerCase().includes(searchLower) ||
                u.email?.toLowerCase().includes(searchLower)
            );
        }

        return users;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
    }
}

/**
 * Bane um usuário
 * @param {string} userId - ID do usuário a ser banido
 * @param {string} ownerId - ID do owner que está banindo
 * @param {string} reason - Motivo do ban
 * @param {boolean} banIp - Se deve banir também o IP
 */
export async function banUser(userId, ownerId, reason = 'Violação dos termos de uso', banIp = false) {
    try {
        // 1. Banir a conta (UID)
        await updateDoc(doc(db, 'users', userId), {
            isBanned: true,
            bannedAt: serverTimestamp(),
            bannedBy: ownerId,
            bannedReason: reason
        });

        // 2. Banir o IP (se solicitado)
        if (banIp) {
            // Buscar o IP do usuário
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userIp = userDoc.data()?.lastIp;

            if (userIp) {
                // Adicionar à coleção de IPs banidos
                await addDoc(collection(db, 'banned_ips'), {
                    ip: userIp,
                    bannedAt: serverTimestamp(),
                    bannedBy: ownerId,
                    reason: reason,
                    originalUser: userId
                });
            }
        }

        // Log de moderação
        await addModerationLog({
            action: banIp ? 'ban_ip_account' : 'ban_account',
            performedBy: ownerId,
            targetUser: userId,
            reason: reason
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao banir usuário:', error);
        throw error;
    }
}

/**
 * Verifica se um IP está banido
 * @param {string} ip - IP a ser verificado
 * @returns {Promise<boolean>} True se banido
 */
export async function checkIpBan(ip) {
    try {
        const q = query(collection(db, 'banned_ips'), where('ip', '==', ip));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Erro ao verificar IP banido:', error);
        return false;
    }
}

/**
 * Busca lista de IPs banidos
 * @returns {Promise<Array>} Lista de IPs banidos
 */
export async function getBannedIps() {
    try {
        // Removido orderBy temporariamente para evitar erro de índice
        const q = query(collection(db, 'banned_ips'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao buscar IPs banidos:', error);
        throw error;
    }
}

/**
 * Desbane um IP
 * @param {string} ipId - ID do documento do IP banido
 * @param {string} ownerId - ID do owner que está desbanindo
 */
export async function unbanIp(ipId, ownerId) {
    try {
        await deleteDoc(doc(db, 'banned_ips', ipId));

        // Log de moderação
        await addModerationLog({
            action: 'unban_ip',
            performedBy: ownerId,
            targetIpId: ipId
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao desbanir IP:', error);
        throw error;
    }
}

/**
 * Desbane um usuário
 * @param {string} userId - ID do usuário a ser desbanido
 * @param {string} ownerId - ID do owner que está desbanindo
 */
export async function unbanUser(userId, ownerId) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            isBanned: false,
            bannedAt: null,
            bannedBy: null,
            bannedReason: null,
            unbannedAt: serverTimestamp(),
            unbannedBy: ownerId
        });

        // Log de moderação
        await addModerationLog({
            action: 'unban',
            performedBy: ownerId,
            targetUser: userId
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao desbanir usuário:', error);
        throw error;
    }
}

/**
 * Remove permissões de admin de um usuário
 * @param {string} userId - ID do usuário
 * @param {string} ownerId - ID do owner
 */
export async function removeAdmin(userId, ownerId) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            isAdmin: false,
            adminActivatedAt: null,
            adminRemovedAt: serverTimestamp(),
            adminRemovedBy: ownerId
        });

        // Log de moderação
        await addModerationLog({
            action: 'remove_admin',
            performedBy: ownerId,
            targetUser: userId
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao remover admin:', error);
        throw error;
    }
}

/**
 * Promove um usuário a admin
 * @param {string} userId - ID do usuário
 * @param {string} ownerId - ID do owner
 */
export async function promoteToAdmin(userId, ownerId) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            isAdmin: true,
            adminActivatedAt: serverTimestamp(),
            adminPromotedBy: ownerId
        });

        // Log de moderação
        await addModerationLog({
            action: 'promote_admin',
            performedBy: ownerId,
            targetUser: userId
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao promover a admin:', error);
        throw error;
    }
}

/**
 * Promove um usuário a NMS Dev
 * @param {string} userId - ID do usuário
 * @param {string} ownerId - ID do owner
 */
export async function promoteToNMSDev(userId, ownerId) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            isNMSDev: true,
            nmsDevPromotedAt: serverTimestamp(),
            nmsDevPromotedBy: ownerId
        });

        // Log de moderação
        await addModerationLog({
            action: 'promote_nms_dev',
            performedBy: ownerId,
            targetUser: userId
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao promover a NMS Dev:', error);
        throw error;
    }
}

/**
 * Remove permissões de NMS Dev de um usuário
 * @param {string} userId - ID do usuário
 * @param {string} ownerId - ID do owner
 */
export async function removeNMSDev(userId, ownerId) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            isNMSDev: false,
            nmsDevRemovedAt: serverTimestamp(),
            nmsDevRemovedBy: ownerId
        });

        // Log de moderação
        await addModerationLog({
            action: 'remove_nms_dev',
            performedBy: ownerId,
            targetUser: userId
        });

        return { success: true };
    } catch (error) {
        console.error('Erro ao remover NMS Dev:', error);
        throw error;
    }
}

/**
 * Adiciona um log de moderação
 * @param {Object} logData - Dados do log
 */
async function addModerationLog(logData) {
    try {
        await addDoc(collection(db, 'moderationLogs'), {
            ...logData,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao adicionar log de moderação:', error);
        // Não lançar erro para não interromper a ação principal
    }
}

/**
 * Busca estatísticas do sistema
 * @returns {Promise<Object>} Estatísticas
 */
export async function getSystemStats() {
    try {
        const [usersSnap, postsSnap, adminsSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'posts')),
            getDocs(query(collection(db, 'users'), where('isAdmin', '==', true)))
        ]);

        const users = usersSnap.docs.map(d => d.data());
        const bannedUsers = users.filter(u => u.isBanned === true);

        return {
            totalUsers: users.length,
            activeUsers: users.length - bannedUsers.length,
            bannedUsers: bannedUsers.length,
            totalAdmins: adminsSnap.size,
            totalPosts: postsSnap.size,
            newUsersToday: users.filter(u => {
                const created = u.createdAt?.toDate?.() || new Date(0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return created >= today;
            }).length
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
}
