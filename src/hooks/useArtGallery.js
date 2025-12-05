import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    increment,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    getDoc,
    getDocs,
    deleteDoc
} from 'firebase/firestore';
import { compressImage, uploadToCloudinary } from '../utils/imageUtils';

const ARTS_PER_PAGE = 20;

// Hook principal para listar artes
export function useArtGallery({ category = 'all', sortBy = 'recent', searchQuery = '', userId }) {
    const [arts, setArts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);

    // Buscar artes inicial
    useEffect(() => {
        setLoading(true);
        setArts([]);
        setLastDoc(null);
        setHasMore(true);

        const artsRef = collection(db, 'arts');
        let q;

        // Construir query baseado nos filtros
        if (category !== 'all') {
            if (category === 'saved' && userId) {
                // Filtro de salvos
                q = query(
                    artsRef,
                    where('savedBy', 'array-contains', userId),
                    orderBy('createdAt', 'desc'),
                    limit(ARTS_PER_PAGE)
                );
            } else if (sortBy === 'popular') {
                q = query(
                    artsRef,
                    where('category', '==', category),
                    orderBy('likes', 'desc'),
                    limit(ARTS_PER_PAGE)
                );
            } else {
                q = query(
                    artsRef,
                    where('category', '==', category),
                    orderBy('createdAt', 'desc'),
                    limit(ARTS_PER_PAGE)
                );
            }
        } else {
            if (sortBy === 'popular') {
                q = query(artsRef, orderBy('likes', 'desc'), limit(ARTS_PER_PAGE));
            } else {
                q = query(artsRef, orderBy('createdAt', 'desc'), limit(ARTS_PER_PAGE));
            }
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const artsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filtro de busca no cliente (se necessário)
            let filtered = artsData;
            if (searchQuery.trim()) {
                const search = searchQuery.toLowerCase();
                filtered = artsData.filter(art =>
                    art.title?.toLowerCase().includes(search) ||
                    art.authorName?.toLowerCase().includes(search) ||
                    art.tags?.some(tag => tag.toLowerCase().includes(search))
                );
            }

            setArts(filtered);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === ARTS_PER_PAGE);
            setLoading(false);
        }, (error) => {
            console.error('Erro ao buscar artes:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [category, sortBy, searchQuery]);

    // Carregar mais
    const loadMore = useCallback(async () => {
        if (!lastDoc || loading || !hasMore) return;

        setLoading(true);
        const artsRef = collection(db, 'arts');
        let q;

        if (category !== 'all') {
            if (category === 'saved' && userId) {
                q = query(
                    artsRef,
                    where('savedBy', 'array-contains', userId),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(ARTS_PER_PAGE)
                );
            } else if (sortBy === 'popular') {
                q = query(
                    artsRef,
                    where('category', '==', category),
                    orderBy('likes', 'desc'),
                    startAfter(lastDoc),
                    limit(ARTS_PER_PAGE)
                );
            } else {
                q = query(
                    artsRef,
                    where('category', '==', category),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastDoc),
                    limit(ARTS_PER_PAGE)
                );
            }
        } else {
            if (sortBy === 'popular') {
                q = query(artsRef, orderBy('likes', 'desc'), startAfter(lastDoc), limit(ARTS_PER_PAGE));
            } else {
                q = query(artsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(ARTS_PER_PAGE));
            }
        }

        try {
            const snapshot = await getDocs(q);
            const newArts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setArts(prev => [...prev, ...newArts]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === ARTS_PER_PAGE);
        } catch (error) {
            console.error('Erro ao carregar mais:', error);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading, hasMore, category, sortBy]);

    // Refresh
    const refresh = useCallback(() => {
        setArts([]);
        setLastDoc(null);
        setHasMore(true);
    }, []);

    return { arts, loading, hasMore, loadMore, refresh };
}

// Hook para comentários de uma arte
export function useArtComments(artId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!artId) {
            setComments([]);
            setLoading(false);
            return;
        }

        const commentsRef = collection(db, 'arts', artId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
            setLoading(false);
        }, (error) => {
            console.error('Erro ao buscar comentários:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [artId]);

    const refresh = useCallback(() => {
        // O onSnapshot já atualiza automaticamente
    }, []);

    return { comments, loading, refresh };
}

// Ações da galeria
export const artActions = {
    // Upload de arte
    uploadArt: async ({ file, title, description, category, tags, userId, authorName, authorPhotoURL }) => {
        try {
            // Comprimir e fazer upload da imagem
            const compressedImage = await compressImage(file, { maxWidth: 2000, maxHeight: 2000, quality: 0.9 });
            const imageUrl = await uploadToCloudinary(compressedImage);

            // Criar documento no Firestore
            const artRef = await addDoc(collection(db, 'arts'), {
                userId,
                authorName,
                authorPhotoURL,
                imageUrl,
                title,
                description,
                category,
                tags,
                likes: 0,
                likedBy: [],
                saves: 0,
                savedBy: [],
                views: 0,
                viewedBy: [],
                commentsCount: 0,
                createdAt: serverTimestamp()
            });

            return artRef.id;
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            throw error;
        }
    },

    // Toggle like
    toggleLike: async (artId, userId, isLiking) => {
        const artRef = doc(db, 'arts', artId);
        try {
            if (isLiking) {
                await updateDoc(artRef, {
                    likes: increment(1),
                    likedBy: arrayUnion(userId)
                });
            } else {
                await updateDoc(artRef, {
                    likes: increment(-1),
                    likedBy: arrayRemove(userId)
                });
            }
        } catch (error) {
            console.error('Erro ao curtir:', error);
            throw error;
        }
    },

    // Toggle save
    toggleSave: async (artId, userId, isSaving) => {
        const artRef = doc(db, 'arts', artId);
        try {
            if (isSaving) {
                await updateDoc(artRef, {
                    saves: increment(1),
                    savedBy: arrayUnion(userId)
                });
            } else {
                await updateDoc(artRef, {
                    saves: increment(-1),
                    savedBy: arrayRemove(userId)
                });
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            throw error;
        }
    },

    // Incrementar views
    incrementViews: async (artId, userId) => {
        const artRef = doc(db, 'arts', artId);
        try {
            // Verificar se já visualizou
            const artSnap = await getDoc(artRef);
            if (artSnap.exists()) {
                const data = artSnap.data();
                if (!data.viewedBy?.includes(userId)) {
                    await updateDoc(artRef, {
                        views: increment(1),
                        viewedBy: arrayUnion(userId)
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao incrementar views:', error);
        }
    },

    // Adicionar comentário
    addComment: async (artId, { userId, authorName, authorPhotoURL, content }) => {
        try {
            const commentsRef = collection(db, 'arts', artId, 'comments');
            await addDoc(commentsRef, {
                userId,
                authorName,
                authorPhotoURL,
                content,
                createdAt: serverTimestamp()
            });

            // Incrementar contador
            const artRef = doc(db, 'arts', artId);
            await updateDoc(artRef, {
                commentsCount: increment(1)
            });
        } catch (error) {
            console.error('Erro ao comentar:', error);
            throw error;
        }
    },

    deleteComment: async (artId, commentId) => {
        try {
            const commentRef = doc(db, 'arts', artId, 'comments', commentId);
            await deleteDoc(commentRef);

            // Decrementar contador
            const artRef = doc(db, 'arts', artId);
            await updateDoc(artRef, {
                commentsCount: increment(-1)
            });
        } catch (error) {
            console.error('Erro ao deletar comentário:', error);
            throw error;
        }
    },

    // Compartilhar no Feed
    shareArtToFeed: async (art, userId, userName, userPhoto) => {
        try {
            await addDoc(collection(db, 'posts'), {
                text: `Confira esta arte incrível: ${art.title}`,
                imageUrl: art.imageUrl,
                author: {
                    uid: userId,
                    name: userName,
                    avatar: userPhoto
                },
                createdAt: serverTimestamp(),
                likes: [],
                comments: [],
                sharedFromArtId: art.id
            });
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            throw error;
        }
    },

    // Buscar arte por ID
    getArtById: async (artId) => {
        try {
            const artRef = doc(db, 'arts', artId);
            const artSnap = await getDoc(artRef);
            if (artSnap.exists()) {
                return { id: artSnap.id, ...artSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar arte:', error);
            throw error;
        }
    }
};
