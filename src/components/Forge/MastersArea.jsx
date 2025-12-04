import React, { useState, useEffect } from 'react';
import styles from './MastersArea.module.css';
import { Plus, BookOpen, Crown, TrendingUp, Users, Search, Filter, Download, Share2, Edit, Trash2, Copy } from 'lucide-react';
import { SystemEditor } from './SystemEditor/SystemEditor';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

export function MastersArea({ user, onBack }) {
    const [view, setView] = useState('list'); // 'list' | 'editor' | 'community'
    const [editingSystem, setEditingSystem] = useState(null);
    const [userSystems, setUserSystems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Buscar sistemas do usuário no Firebase
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, 'rpgSystems'),
            where('createdBy', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const systems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserSystems(systems);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const stats = {
        systemsCreated: userSystems.length,
        totalUsers: userSystems.reduce((acc, sys) => acc + (sys.users || 0), 0),
        publicSystems: userSystems.filter(s => s.isPublic).length,
        drafts: userSystems.filter(s => !s.isPublic).length
    };

    if (view === 'editor') {
        return (
            <SystemEditor
                user={user}
                systemId={editingSystem?.id}
                initialData={editingSystem}
                onBack={() => {
                    setView('list');
                    setEditingSystem(null);
                }}
            />
        );
    }

    const handleCreateNew = () => {
        setEditingSystem(null);
        setView('editor');
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' ano' + (Math.floor(interval) > 1 ? 's' : '');

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' mês' + (Math.floor(interval) > 1 ? 'es' : '');

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' dia' + (Math.floor(interval) > 1 ? 's' : '');

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hora' + (Math.floor(interval) > 1 ? 's' : '');

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' min';

        return 'Agora';
    };

    const handleEditSystem = (system) => {
        setEditingSystem(system);
        setView('editor');
    };

    const handleDeleteSystem = async (systemId) => {
        if (!window.confirm('Tem certeza que deseja deletar este sistema? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'rpgSystems', systemId));
            console.log('✅ Sistema deletado:', systemId);
        } catch (error) {
            console.error('❌ Erro ao deletar sistema:', error);
            alert('Erro ao deletar sistema. Tente novamente.');
        }
    };

    return (
        <div className={styles.mastersArea}>
            {/* Animated Background */}
            <div className={styles.bgAnimated}>
                <div className={styles.bgGradient1}></div>
                <div className={styles.bgGradient2}></div>
            </div>

            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header}>
                    <button className={styles.backButton} onClick={onBack}>
                        ← Voltar ao Hub
                    </button>

                    <div className={styles.headerContent}>
                        <div className={styles.headerIcon}>
                            <Crown size={48} />
                        </div>
                        <div>
                            <h1 className={styles.title}>Área dos Mestres</h1>
                            <p className={styles.subtitle}>Gerencie seus sistemas de RPG e campanhas</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📚</div>
                        <div className={styles.statValue}>{stats.systemsCreated}</div>
                        <div className={styles.statLabel}>Sistemas Criados</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>👥</div>
                        <div className={styles.statValue}>{stats.totalUsers}</div>
                        <div className={styles.statLabel}>Mestres Usando</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🌐</div>
                        <div className={styles.statValue}>{stats.publicSystems}</div>
                        <div className={styles.statLabel}>Públicos</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📝</div>
                        <div className={styles.statValue}>{stats.drafts}</div>
                        <div className={styles.statLabel}>Rascunhos</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <button className={styles.primaryAction} onClick={handleCreateNew}>
                        <Plus size={20} />
                        <span>Criar Novo Sistema</span>
                    </button>
                    <button className={styles.secondaryAction}>
                        <BookOpen size={20} />
                        <span>Biblioteca Comunitária</span>
                    </button>
                    <button className={styles.secondaryAction}>
                        <Download size={20} />
                        <span>Importar JSON</span>
                    </button>
                </div>

                {/* Systems List */}
                <div className={styles.systemsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Meus Sistemas</h2>
                        <div className={styles.sectionActions}>
                            <button className={styles.iconButton}>
                                <Search size={18} />
                            </button>
                            <button className={styles.iconButton}>
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    {userSystems.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎲</div>
                            <h3>Nenhum sistema criado ainda</h3>
                            <p>Comece criando seu primeiro sistema de RPG personalizado!</p>
                            <button className={styles.emptyButton} onClick={handleCreateNew}>
                                <Plus size={20} />
                                Criar Primeiro Sistema
                            </button>
                        </div>
                    ) : (
                        <div className={styles.systemsGrid}>
                            {userSystems.map((system, index) => {
                                const attrCount = system.attributes?.length || 0;
                                const updatedDate = system.updatedAt?.toDate?.() || new Date();
                                const timeAgo = getTimeAgo(updatedDate);

                                return (
                                    <div
                                        key={system.id}
                                        className={styles.systemCard}
                                        style={{
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        {/* Card Glow Background */}
                                        <div className={styles.cardGlow}></div>

                                        {/* System Header com Icon e Badge */}
                                        <div className={styles.systemHeader}>
                                            <div className={styles.systemIconWrapper}>
                                                <div className={styles.systemIcon}>
                                                    {system.metadata?.icon || system.icon || '🎲'}
                                                </div>
                                                <div className={styles.iconGlow}></div>
                                            </div>

                                            <div className={styles.systemBadge}>
                                                {system.isPublic ? (
                                                    <>
                                                        <div className={styles.badgeIcon}>🌐</div>
                                                        <span>Público</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={styles.badgeIcon}>🔒</div>
                                                        <span>Privado</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* System Content */}
                                        <div className={styles.systemContent}>
                                            <h3 className={styles.systemName}>
                                                {system.metadata?.name || system.name || 'Sistema Sem Nome'}
                                            </h3>
                                            <p className={styles.systemDesc}>
                                                {system.metadata?.description || system.description || 'Descrição não disponível'}
                                            </p>

                                            {/* Stats Grid */}
                                            <div className={styles.systemStats}>
                                                <div className={styles.statItem}>
                                                    <div className={styles.statIcon}>⚡</div>
                                                    <div className={styles.statContent}>
                                                        <div className={styles.statValue}>{attrCount}</div>
                                                        <div className={styles.statLabel}>Atributos</div>
                                                    </div>
                                                </div>

                                                <div className={styles.statItem}>
                                                    <div className={styles.statIcon}>🎯</div>
                                                    <div className={styles.statContent}>
                                                        <div className={styles.statValue}>
                                                            {system.metadata?.complexity || system.complexity || 'Média'}
                                                        </div>
                                                        <div className={styles.statLabel}>Complexidade</div>
                                                    </div>
                                                </div>

                                                <div className={styles.statItem}>
                                                    <div className={styles.statIcon}>🕐</div>
                                                    <div className={styles.statContent}>
                                                        <div className={styles.statValue}>{timeAgo}</div>
                                                        <div className={styles.statLabel}>Atualizado</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* System Actions */}
                                        <div className={styles.systemActions}>
                                            <button
                                                className={`${styles.actionButton} ${styles.primaryAction}`}
                                                onClick={() => handleEditSystem(system)}
                                                title="Editar sistema"
                                            >
                                                <Edit size={16} />
                                                <span>Editar</span>
                                            </button>
                                            <button
                                                className={styles.actionButton}
                                                title="Clonar sistema"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                className={styles.actionButton}
                                                title="Compartilhar sistema"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                            <button
                                                className={styles.actionButtonDanger}
                                                onClick={() => handleDeleteSystem(system.id)}
                                                title="Deletar sistema"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Templates Section */}
                <div className={styles.templatesSection}>
                    <h2 className={styles.sectionTitle}>Templates Rápidos</h2>
                    <div className={styles.templatesGrid}>
                        <div className={styles.templateCard}>
                            <div className={styles.templateIcon}>⚔️</div>
                            <div className={styles.templateName}>D&D Like</div>
                            <div className={styles.templateDesc}>Sistema baseado em d20</div>
                            <button className={styles.templateButton}>Usar Template</button>
                        </div>
                        <div className={styles.templateCard}>
                            <div className={styles.templateIcon}>🎭</div>
                            <div className={styles.templateName}>FATE Like</div>
                            <div className={styles.templateDesc}>Narrativo com aspectos</div>
                            <button className={styles.templateButton}>Usar Template</button>
                        </div>
                        <div className={styles.templateCard}>
                            <div className={styles.templateIcon}>🌙</div>
                            <div className={styles.templateName}>PBtA Like</div>
                            <div className={styles.templateDesc}>Powered by the Apocalypse</div>
                            <button className={styles.templateButton}>Usar Template</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
