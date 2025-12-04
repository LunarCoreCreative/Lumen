import React, { useState, useEffect } from 'react';
import styles from './OwnerPanel.module.css';
import { Crown, Users, Shield, BarChart3, Settings as SettingsIcon, Globe } from 'lucide-react';

export function OwnerPanel({ user }) {
    const [activeTab, setActiveTab] = useState('admins');

    const tabs = [
        { id: 'admins', icon: Shield, label: 'Gerenciar Admins' },
        { id: 'users', icon: Users, label: 'Usuários' },
        { id: 'ips', icon: Globe, label: 'IPs Banidos' },
        { id: 'stats', icon: BarChart3, label: 'Estatísticas' },
        { id: 'settings', icon: SettingsIcon, label: 'Config. Globais' }
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <Crown size={32} />
                    </div>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>Painel do Owner</h1>
                        <p className={styles.subtitle}>
                            Gerenciamento completo do sistema Lumen
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className={styles.tabsContainer}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={20} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className={styles.content}>
                {activeTab === 'admins' && <AdminManager user={user} />}
                {activeTab === 'users' && <UserManager user={user} />}
                {activeTab === 'ips' && <IpManager user={user} />}
                {activeTab === 'stats' && <SystemStats />}
                {activeTab === 'settings' && <GlobalSettings />}
            </div>
        </div>
    );
}

// Admin Manager Component
function AdminManager({ user }) {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadCodes();
    }, [user?.uid]);

    const loadCodes = async () => {
        if (!user?.uid) return;

        try {
            const { getAdminCodes } = await import('../../utils/adminCodes');
            const allCodes = await getAdminCodes(user.uid);
            allCodes.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            });
            setCodes(allCodes);
        } catch (error) {
            console.error('Erro ao carregar códigos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCode = async () => {
        if (!user?.uid) return;

        setGenerating(true);
        setMessage(null);

        try {
            const { createAdminCode } = await import('../../utils/adminCodes');
            const newCode = await createAdminCode(user.uid);

            setMessage({
                type: 'success',
                text: `Código gerado: ${newCode.code}`,
                code: newCode.code
            });

            await loadCodes();
        } catch (error) {
            console.error('Erro ao gerar código:', error);
            setMessage({ type: 'error', text: 'Erro ao gerar código admin.' });
        } finally {
            setGenerating(false);
        }
    };

    const handleRevokeCode = async (codeId) => {
        if (!user?.uid) return;
        if (!window.confirm('Tem certeza que deseja revogar este código?')) return;

        try {
            const { revokeAdminCode } = await import('../../utils/adminCodes');
            await revokeAdminCode(codeId, user.uid);
            setMessage({ type: 'success', text: 'Código revogado com sucesso!' });
            await loadCodes();
        } catch (error) {
            console.error('Erro ao revogar código:', error);
            setMessage({ type: 'error', text: 'Erro ao revogar código.' });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setMessage({ type: 'success', text: 'Código copiado!' });
        setTimeout(() => setMessage(null), 2000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'valid': return '#4caf50';
            case 'used': return '#ff9800';
            case 'revoked': return '#f44336';
            default: return '#888';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'valid': return 'Válido';
            case 'used': return 'Usado';
            case 'revoked': return 'Revogado';
            default: return status;
        }
    };

    return (
        <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 className={styles.sectionTitle}>Gerenciamento de Administradores</h2>
                    <p className={styles.sectionDescription}>
                        Gere códigos de uso único para promover usuários a admin.
                    </p>
                </div>
                <button
                    onClick={handleGenerateCode}
                    disabled={generating}
                    style={{
                        padding: '0.875rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)',
                        color: '#000',
                        fontWeight: 600,
                        cursor: generating ? 'not-allowed' : 'pointer',
                        opacity: generating ? 0.6 : 1,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Shield size={18} />
                    {generating ? 'Gerando...' : 'Gerar Código Admin'}
                </button>
            </div>

            {message && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: message.type === 'success' ? '#4caf50' : '#ef4444',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{message.text}</span>
                    {message.code && (
                        <button
                            onClick={() => copyToClipboard(message.code)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(76, 175, 80, 0.5)',
                                background: 'rgba(76, 175, 80, 0.2)',
                                color: '#4caf50',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 600
                            }}
                        >
                            Copiar Código
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className={styles.placeholder}>
                    <p>Carregando códigos...</p>
                </div>
            ) : codes.length === 0 ? (
                <div className={styles.placeholder}>
                    <Shield size={48} />
                    <p>Nenhum código gerado ainda.</p>
                    <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Clique em "Gerar Código Admin" para criar o primeiro.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {codes.map(code => (
                        <div
                            key={code.id}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <code style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: '#fff',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        fontFamily: 'monospace'
                                    }}>
                                        {code.code}
                                    </code>
                                    <span style={{
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        background: `${getStatusColor(code.status)}20`,
                                        color: getStatusColor(code.status),
                                        border: `1px solid ${getStatusColor(code.status)}40`
                                    }}>
                                        {getStatusText(code.status)}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span>Criado: {code.createdAt?.toDate?.().toLocaleString('pt-BR') || 'N/A'}</span>
                                    {code.status === 'used' && code.usedAt && (
                                        <span>Usado: {code.usedAt?.toDate?.().toLocaleString('pt-BR')}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => copyToClipboard(code.code)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Copiar
                                </button>
                                {code.status === 'valid' && (
                                    <button
                                        onClick={() => handleRevokeCode(code.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(244, 67, 54, 0.3)',
                                            background: 'rgba(244, 67, 54, 0.1)',
                                            color: '#f44336',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Revogar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// User Manager Component
function UserManager({ user }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, banned, admin
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);

    // State for Ban Modal
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [selectedUserToBan, setSelectedUserToBan] = useState(null);
    const [banReason, setBanReason] = useState('');
    const [banIpOption, setBanIpOption] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [filter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { getAllUsers } = await import('../../utils/ownerUtils');
            const filters = {};

            if (filter === 'banned') filters.status = 'banned';
            if (filter === 'active') filters.status = 'active';
            if (filter === 'admin') filters.role = 'admin';

            const allUsers = await getAllUsers(filters);
            setUsers(allUsers);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar usuários.' });
        } finally {
            setLoading(false);
        }
    };

    const openBanModal = (user) => {
        setSelectedUserToBan(user);
        setBanReason('Violação dos termos de uso');
        setBanIpOption(false);
        setBanModalOpen(true);
    };

    const closeBanModal = () => {
        setBanModalOpen(false);
        setSelectedUserToBan(null);
        setBanReason('');
    };

    const confirmBanUser = async () => {
        if (!selectedUserToBan) return;

        setActionLoading(selectedUserToBan.id);
        closeBanModal();

        try {
            const { banUser } = await import('../../utils/ownerUtils');
            await banUser(selectedUserToBan.id, user.uid, banReason, banIpOption);
            setMessage({ type: 'success', text: `${selectedUserToBan.displayName} foi banido com sucesso.${banIpOption ? ' (IP também banido)' : ''}` });
            await loadUsers();
        } catch (error) {
            console.error('Erro ao banir usuário:', error);
            setMessage({ type: 'error', text: 'Erro ao banir usuário: ' + error.message });
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnbanUser = async (userId, userName) => {
        if (!window.confirm(`Desbanir ${userName}?`)) return;

        setActionLoading(userId);
        try {
            const { unbanUser } = await import('../../utils/ownerUtils');
            await unbanUser(userId, user.uid);
            setMessage({ type: 'success', text: `${userName} foi desbanido com sucesso.` });
            await loadUsers();
        } catch (error) {
            console.error('Erro ao desbanir usuário:', error);
            setMessage({ type: 'error', text: 'Erro ao desbanir usuário.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveAdmin = async (userId, userName) => {
        if (!window.confirm(`Remover permissões de admin de ${userName}?`)) return;

        setActionLoading(userId);
        try {
            const { removeAdmin } = await import('../../utils/ownerUtils');
            await removeAdmin(userId, user.uid);
            setMessage({ type: 'success', text: `Permissões de admin removidas de ${userName}.` });
            await loadUsers();
        } catch (error) {
            console.error('Erro ao remover admin:', error);
            setMessage({ type: 'error', text: 'Erro ao remover admin.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handlePromoteToAdmin = async (userId, userName) => {
        if (!window.confirm(`Promover ${userName} a administrador?`)) return;

        setActionLoading(userId);
        try {
            const { promoteToAdmin } = await import('../../utils/ownerUtils');
            await promoteToAdmin(userId, user.uid);
            setMessage({ type: 'success', text: `${userName} foi promovido a administrador!` });
            await loadUsers();
        } catch (error) {
            console.error('Erro ao promover a admin:', error);
            setMessage({ type: 'error', text: 'Erro ao promover a admin.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handlePromoteToNMSDev = async (userId, userName) => {
        if (!window.confirm(`Promover ${userName} a NMS Dev (Gerente do Hub No Man's Sky)?`)) return;

        setActionLoading(userId);
        try {
            const { promoteToNMSDev } = await import('../../utils/ownerUtils');
            await promoteToNMSDev(userId, user.uid);
            setMessage({ type: 'success', text: `${userName} agora é um NMS Dev!` });
            await loadUsers();
        } catch (error) {
            console.error('Erro ao promover a NMS Dev:', error);
            setMessage({ type: 'error', text: 'Erro ao promover a NMS Dev.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveNMSDev = async (userId, userName) => {
        if (!window.confirm(`Remover permissões de NMS Dev de ${userName}?`)) return;

        setActionLoading(userId);
        try {
            const { removeNMSDev } = await import('../../utils/ownerUtils');
            await removeNMSDev(userId, user.uid);
            setMessage({ type: 'success', text: `Permissões de NMS Dev removidas de ${userName}.` });
            await loadUsers();
        } catch (error) {
            console.error('Erro ao remover NMS Dev:', error);
            setMessage({ type: 'error', text: 'Erro ao remover NMS Dev.' });
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return u.displayName?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search);
    });

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Gerenciamento de Usuários</h2>
            <p className={styles.sectionDescription}>
                Visualize, banir ou desbanir usuários do sistema.
            </p>

            {message && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: message.type === 'success' ? '#4caf50' : '#ef4444',
                    fontSize: '0.95rem',
                    fontWeight: 500
                }}>
                    {message.text}
                </div>
            )}

            {/* Ban Modal */}
            {banModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: '#1a1a1a',
                        padding: '2rem',
                        borderRadius: '16px',
                        width: '90%',
                        maxWidth: '500px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#fff', fontSize: '1.5rem' }}>Banir Usuário</h3>
                        <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>
                            Você está prestes a banir <strong>{selectedUserToBan?.displayName}</strong>.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#fff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Motivo do Banimento</label>
                            <input
                                type="text"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                                type="checkbox"
                                id="banIpCheckbox"
                                checked={banIpOption}
                                onChange={(e) => setBanIpOption(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="banIpCheckbox" style={{ color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                                Banir também o endereço IP?
                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>
                                    Isso impedirá o acesso de qualquer conta nesta rede.
                                </span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={closeBanModal}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    backgroundColor: 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmBanUser}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#f44336',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Confirmar Banimento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        minWidth: '250px',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        fontSize: '0.95rem'
                    }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'active', 'banned', 'admin'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '12px',
                                border: filter === f ? '1px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                background: filter === f ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                color: filter === f ? '#ffd700' : '#fff',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                textTransform: 'capitalize'
                            }}
                        >
                            {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : f === 'banned' ? 'Banidos' : 'Admins'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className={styles.placeholder}>
                    <p>Carregando usuários...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className={styles.placeholder}>
                    <Users size={48} />
                    <p>Nenhum usuário encontrado.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredUsers.map(u => (
                        <div
                            key={u.id}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: u.isBanned ? 'rgba(244, 67, 54, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: u.id === user.uid ? 0.5 : 1
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: u.photoURL ? `url(${u.photoURL})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }} />
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <strong style={{ fontSize: '1rem', color: '#fff' }}>{u.displayName || 'Sem nome'}</strong>
                                            {u.isOwner && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000', fontWeight: 600 }}>OWNER</span>}
                                            {u.isAdmin && !u.isOwner && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50', fontWeight: 600 }}>ADMIN</span>}
                                            {u.isNMSDev && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontWeight: 600 }}>NMS DEV</span>}
                                            {u.isBanned && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(244, 67, 54, 0.2)', color: '#f44336', fontWeight: 600 }}>BANIDO</span>}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {u.email}
                                        </div>
                                        {u.isBanned && u.bannedReason && (
                                            <div style={{ fontSize: '0.8rem', color: '#f44336', marginTop: '0.25rem' }}>
                                                Motivo: {u.bannedReason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {u.id !== user.uid && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {u.isBanned ? (
                                        <button
                                            onClick={() => handleUnbanUser(u.id, u.displayName)}
                                            disabled={actionLoading === u.id}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                background: 'rgba(76, 175, 80, 0.1)',
                                                color: '#4caf50',
                                                cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                opacity: actionLoading === u.id ? 0.5 : 1
                                            }}
                                        >
                                            {actionLoading === u.id ? 'Processando...' : 'Desbanir'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openBanModal(u);
                                            }}
                                            disabled={actionLoading === u.id}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                                background: 'rgba(244, 67, 54, 0.1)',
                                                color: '#f44336',
                                                cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                opacity: actionLoading === u.id ? 0.5 : 1
                                            }}
                                        >
                                            {actionLoading === u.id ? 'Processando...' : 'Banir'}
                                        </button>
                                    )}
                                    {u.isAdmin && !u.isOwner && (
                                        <button
                                            onClick={() => handleRemoveAdmin(u.id, u.displayName)}
                                            disabled={actionLoading === u.id}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                                background: 'rgba(255, 152, 0, 0.1)',
                                                color: '#ff9800',
                                                cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                opacity: actionLoading === u.id ? 0.5 : 1
                                            }}
                                        >
                                            Remover Admin
                                        </button>
                                    )}
                                    {!u.isAdmin && !u.isBanned && (
                                        <button
                                            onClick={() => handlePromoteToAdmin(u.id, u.displayName)}
                                            disabled={actionLoading === u.id}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                color: '#8b5cf6',
                                                cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                                fontSize: '0.875rem',
                                                opacity: actionLoading === u.id ? 0.5 : 1
                                            }}
                                        >
                                            Promover a Admin
                                        </button>
                                    )}
                                    {/* NMS Dev Management */}
                                    {!u.isBanned && !u.isOwner && (
                                        u.isNMSDev ? (
                                            <button
                                                onClick={() => handleRemoveNMSDev(u.id, u.displayName)}
                                                disabled={actionLoading === u.id}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6',
                                                    cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                                    fontSize: '0.875rem',
                                                    opacity: actionLoading === u.id ? 0.5 : 1
                                                }}
                                            >
                                                Remover NMS Dev
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handlePromoteToNMSDev(u.id, u.displayName)}
                                                disabled={actionLoading === u.id}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6',
                                                    cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                                    fontSize: '0.875rem',
                                                    opacity: actionLoading === u.id ? 0.5 : 1
                                                }}
                                            >
                                                Promover NMS Dev
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// IP Manager Component
function IpManager({ user }) {
    const [ips, setIps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadIps();
    }, []);

    const loadIps = async () => {
        setLoading(true);
        try {
            const { getBannedIps } = await import('../../utils/ownerUtils');
            const bannedIps = await getBannedIps();
            setIps(bannedIps);
        } catch (error) {
            console.error('Erro ao carregar IPs:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar IPs banidos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUnbanIp = async (ipId, ipAddress) => {
        if (!window.confirm(`Desbanir o IP ${ipAddress}?`)) return;

        try {
            const { unbanIp } = await import('../../utils/ownerUtils');
            await unbanIp(ipId, user.uid);
            setMessage({ type: 'success', text: `IP ${ipAddress} desbanido com sucesso.` });
            await loadIps();
        } catch (error) {
            console.error('Erro ao desbanir IP:', error);
            setMessage({ type: 'error', text: 'Erro ao desbanir IP.' });
        }
    };

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Gerenciamento de IPs Banidos</h2>
            <p className={styles.sectionDescription}>
                Visualize e remova bloqueios de IP.
            </p>

            {message && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: message.type === 'success' ? '#4caf50' : '#ef4444',
                    fontSize: '0.95rem',
                    fontWeight: 500
                }}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className={styles.placeholder}>
                    <p>Carregando IPs...</p>
                </div>
            ) : ips.length === 0 ? (
                <div className={styles.placeholder}>
                    <Globe size={48} />
                    <p>Nenhum IP banido encontrado.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {ips.map(ip => (
                        <div
                            key={ip.id}
                            style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <code style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        color: '#fff',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        fontFamily: 'monospace'
                                    }}>
                                        {ip.ip}
                                    </code>
                                    <span style={{
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        background: 'rgba(244, 67, 54, 0.2)',
                                        color: '#f44336',
                                        border: '1px solid rgba(244, 67, 54, 0.4)'
                                    }}>
                                        BANIDO
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                    <div>Motivo: {ip.reason}</div>
                                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>
                                        Banido em: {ip.bannedAt?.toDate?.().toLocaleString('pt-BR') || 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUnbanIp(ip.id, ip.ip)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(76, 175, 80, 0.3)',
                                    background: 'rgba(76, 175, 80, 0.1)',
                                    color: '#4caf50',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Desbanir IP
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// System Stats Component  
function SystemStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { getSystemStats } = await import('../../utils/ownerUtils');
            const systemStats = await getSystemStats();
            setStats(systemStats);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div style={{
            padding: '1.5rem',
            borderRadius: '16px',
            border: `1px solid ${color}30`,
            background: `${color}10`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                <Icon size={28} />
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                    {value.toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {title}
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Estatísticas do Sistema</h2>
            <p className={styles.sectionDescription}>
                Métricas e dados sobre o uso do Lumen.
            </p>

            {loading ? (
                <div className={styles.placeholder}>
                    <p>Carregando estatísticas...</p>
                </div>
            ) : stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <StatCard
                        title="Total de Usuários"
                        value={stats.totalUsers}
                        icon={Users}
                        color="#6366f1"
                    />
                    <StatCard
                        title="Usuários Ativos"
                        value={stats.activeUsers}
                        icon={Users}
                        color="#10b981"
                    />
                    <StatCard
                        title="Administradores"
                        value={stats.totalAdmins}
                        icon={Shield}
                        color="#ffd700"
                    />
                    <StatCard
                        title="Usuários Banidos"
                        value={stats.bannedUsers}
                        icon={Users}
                        color="#ef4444"
                    />
                    <StatCard
                        title="Posts Criados"
                        value={stats.totalPosts}
                        icon={BarChart3}
                        color="#8b5cf6"
                    />
                    <StatCard
                        title="Novos Hoje"
                        value={stats.newUsersToday}
                        icon={Users}
                        color="#f59e0b"
                    />
                </div>
            ) : (
                <div className={styles.placeholder}>
                    <BarChart3 size={48} />
                    <p>Erro ao carregar estatísticas.</p>
                </div>
            )}
        </div>
    );
}

// Global Settings Component
function GlobalSettings() {
    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Configurações Globais</h2>
            <p className={styles.sectionDescription}>
                Modo manutenção, anúncios e configurações do sistema.
            </p>

            <div className={styles.placeholder}>
                <SettingsIcon size={48} />
                <p>Funcionalidade em desenvolvimento...</p>
            </div>
        </div>
    );
}
