import React, { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import { User, Bell, Lock, Palette, Shield, Info, LogOut } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../firebase';

export function Settings({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({}); // Inicializar com objeto vazio para evitar null
    const [loading, setLoading] = useState(true);

    // Carregar configurações ao montar
    useEffect(() => {
        loadSettings();
    }, [user?.uid]);

    // Aplicar fontSize quando settings mudar
    useEffect(() => {
        if (settings?.preferences?.fontSize) {
            applyFontSize(settings.preferences.fontSize);
        }
    }, [settings]);

    const loadSettings = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const loadedSettings = data.settings || {
                    notifications: {
                        likes: true,
                        comments: true,
                        messages: true,
                        mentions: true
                    },
                    privacy: {
                        whoCanSeePosts: 'public',
                        whoCanMessage: 'everyone',
                        publicProfile: true
                    },
                    preferences: {
                        language: 'pt-BR',
                        fontSize: 'medium'
                    }
                };
                setSettings(loadedSettings);

                // Aplicar fontSize ao carregar
                if (loadedSettings?.preferences?.fontSize) {
                    applyFontSize(loadedSettings.preferences.fontSize);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        if (!user?.uid) return;

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                settings: newSettings
            });
            setSettings(newSettings);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    };

    // Aplicar tamanho de fonte ao body
    const applyFontSize = (fontSize) => {
        const size = fontSize || 'medium';
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${size}`);
    };

    const tabs = [
        { id: 'profile', icon: User, label: 'Perfil' },
        { id: 'privacy', icon: Lock, label: 'Privacidade' },
        { id: 'account', icon: Shield, label: 'Conta' },
        { id: 'about', icon: Info, label: 'Sobre' },
    ];

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Carregando...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Configurações</h1>
                <p className={styles.subtitle}>Gerencie suas preferências e configurações da conta</p>
            </div>

            <div className={styles.content}>
                {/* Sidebar com Tabs */}
                <div className={styles.sidebar}>
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

                {/* Main Content */}
                <div className={styles.main}>
                    {activeTab === 'profile' && <ProfileSettings user={user} />}
                    {activeTab === 'privacy' && (
                        <PrivacySettings
                            settings={settings}
                            onUpdate={updateSettings}
                        />
                    )}
                    {activeTab === 'account' && <AccountSettings user={user} onLogout={onLogout} />}
                    {activeTab === 'about' && <AboutSettings />}
                </div>
            </div>
        </div>
    );
}

// Profile Settings
function ProfileSettings({ user }) {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [message, setMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user?.uid) return;

        setSaving(true);
        setMessage(null);
        try {
            // 1. Atualizar no Firestore (Banco de Dados)
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: displayName
            });

            // 2. Tentar atualizar no Auth (Sessão) - Protegido contra falhas
            try {
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, {
                        displayName: displayName
                    });
                    // Forçar recarregamento do token para atualizar UI
                    await auth.currentUser.reload();
                }
            } catch (authError) {
                console.warn('Erro ao atualizar perfil no Auth (ignorado para evitar crash):', authError);
                // Não exibimos erro para o usuário pois o banco já foi atualizado
            }

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });

            // Limpar mensagem após 3 segundos
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Informações do Perfil</h2>
            <p className={styles.sectionDescription}>
                Atualize suas informações pessoais e como você aparece para outros usuários.
            </p>

            <div className={styles.settingGroup}>
                <label className={styles.label}>Nome de exibição</label>
                <input
                    type="text"
                    className={styles.input}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                />
            </div>

            <div className={styles.settingGroup}>
                <label className={styles.label}>Email</label>
                <input
                    type="email"
                    className={styles.input}
                    defaultValue={user?.email || ''}
                    disabled
                />
                <span className={styles.hint}>O email não pode ser alterado</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>

                {message && (
                    <span style={{
                        color: message.type === 'success' ? '#4caf50' : '#ef4444',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        {message.text}
                    </span>
                )}
            </div>
        </div>
    );
}

// Notification Settings
function NotificationSettings({ settings, onUpdate }) {
    const handleToggle = (key) => {
        const newSettings = {
            ...settings,
            notifications: {
                ...settings.notifications,
                [key]: !settings.notifications[key]
            }
        };
        onUpdate(newSettings);
    };

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Preferências de Notificações</h2>
            <p className={styles.sectionDescription}>
                Escolha quais notificações você deseja receber.
            </p>

            <div className={styles.settingGroup}>
                <div className={styles.switchRow}>
                    <div>
                        <div className={styles.switchLabel}>Curtidas em posts</div>
                        <div className={styles.switchDescription}>Receba notificações quando alguém curtir seus posts</div>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={settings?.notifications?.likes || false}
                            onChange={() => handleToggle('likes')}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>

            <div className={styles.settingGroup}>
                <div className={styles.switchRow}>
                    <div>
                        <div className={styles.switchLabel}>Comentários</div>
                        <div className={styles.switchDescription}>Receba notificações de novos comentários</div>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={settings?.notifications?.comments || false}
                            onChange={() => handleToggle('comments')}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>

            <div className={styles.settingGroup}>
                <div className={styles.switchRow}>
                    <div>
                        <div className={styles.switchLabel}>Mensagens diretas</div>
                        <div className={styles.switchDescription}>Receba notificações de novas mensagens</div>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={settings?.notifications?.messages || false}
                            onChange={() => handleToggle('messages')}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>

            <div className={styles.settingGroup}>
                <div className={styles.switchRow}>
                    <div>
                        <div className={styles.switchLabel}>Menções</div>
                        <div className={styles.switchDescription}>Receba notificações quando alguém mencionar você</div>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={settings?.notifications?.mentions || false}
                            onChange={() => handleToggle('mentions')}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
        </div>
    );
}

// Privacy Settings
function PrivacySettings({ settings, onUpdate }) {
    const handleSelectChange = (key, value) => {
        const newSettings = {
            ...settings,
            privacy: {
                ...settings.privacy,
                [key]: value
            }
        };
        onUpdate(newSettings);
    };

    const handleToggle = () => {
        const newSettings = {
            ...settings,
            privacy: {
                ...settings.privacy,
                publicProfile: !settings.privacy.publicProfile
            }
        };
        onUpdate(newSettings);
    };

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Privacidade e Segurança</h2>
            <p className={styles.sectionDescription}>
                Controle quem pode ver seu conteúdo e interagir com você.
            </p>

            <div className={styles.settingGroup}>
                <label className={styles.label}>Quem pode ver seus posts</label>
                <select
                    className={styles.select}
                    value={settings?.privacy?.whoCanSeePosts || 'public'}
                    onChange={(e) => handleSelectChange('whoCanSeePosts', e.target.value)}
                >
                    <option value="public">Todos</option>
                    <option value="friends">Apenas amigos</option>
                    <option value="private">Apenas eu</option>
                </select>
            </div>

            <div className={styles.settingGroup}>
                <label className={styles.label}>Quem pode enviar mensagens</label>
                <select
                    className={styles.select}
                    value={settings?.privacy?.whoCanMessage || 'everyone'}
                    onChange={(e) => handleSelectChange('whoCanMessage', e.target.value)}
                >
                    <option value="everyone">Todos</option>
                    <option value="friends">Apenas amigos</option>
                </select>
            </div>

            <div className={styles.settingGroup}>
                <div className={styles.switchRow}>
                    <div>
                        <div className={styles.switchLabel}>Perfil público</div>
                        <div className={styles.switchDescription}>Permitir que qualquer pessoa veja seu perfil</div>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={settings?.privacy?.publicProfile || false}
                            onChange={handleToggle}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
        </div>
    );
}

// Preferences Settings
function PreferencesSettings({ settings, onUpdate }) {
    const handleSelectChange = (key, value) => {
        const newSettings = {
            ...settings,
            preferences: {
                ...settings.preferences,
                [key]: value
            }
        };
        onUpdate(newSettings);
    };

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Preferências</h2>
            <p className={styles.sectionDescription}>
                Personalize sua experiência no Lumen.
            </p>

            <div className={styles.settingGroup}>
                <label className={styles.label}>Idioma</label>
                <select
                    className={styles.select}
                    value={settings?.preferences?.language || 'pt-BR'}
                    onChange={(e) => handleSelectChange('language', e.target.value)}
                >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
            </div>

            <div className={styles.settingGroup}>
                <label className={styles.label}>Tamanho da fonte</label>
                <select
                    className={styles.select}
                    value={settings?.preferences?.fontSize || 'medium'}
                    onChange={(e) => handleSelectChange('fontSize', e.target.value)}
                >
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                </select>
            </div>
        </div>
    );
}

// Account Settings
function AccountSettings({ user, onLogout }) {
    const [adminCode, setAdminCode] = useState('');
    const [ownerCode, setOwnerCode] = useState('');
    const [message, setMessage] = useState(null);
    const [ownerMessage, setOwnerMessage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [ownerSaving, setOwnerSaving] = useState(false);

    // Hash SHA-256 dos códigos secretos
    // Admin: LUMEN_ADMIN_2025_SECURE
    const ADMIN_CODE_HASH = '0b9b1f23062e04d9af60e76f09792fa7cf588c0e6eb5e5f242e80224405a616e';
    // Owner: LUMEN_OWNER_2025_MASTER
    const OWNER_CODE_HASH = '05f56df0136ab1819dc0fcf71b4cbb36bec6b516bf07a3d6167eaf3c77a4ad94';

    const generateHash = async (text) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleActivateAdmin = async () => {
        if (!user?.uid) return;

        setSaving(true);
        setMessage(null);

        try {
            // Usar sistema de códigos de uso único
            const { validateAndUseAdminCode } = await import('../../utils/adminCodes');
            const result = await validateAndUseAdminCode(adminCode, user.uid);

            if (!result.success) {
                setMessage({ type: 'error', text: result.error || 'Código inválido!' });
                setTimeout(() => setMessage(null), 3000);
                setSaving(false);
                return;
            }

            setMessage({ type: 'success', text: 'Você agora é um administrador! Recarregando...' });
            setAdminCode('');

            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Erro ao ativar admin:', error);
            setMessage({ type: 'error', text: 'Erro ao ativar permissões de admin.' });
            setSaving(false);
        }
    };

    const handleActivateOwner = async () => {
        if (!user?.uid) return;

        setOwnerSaving(true);
        setOwnerMessage(null);

        try {
            const inputHash = await generateHash(ownerCode);

            if (inputHash !== OWNER_CODE_HASH) {
                setOwnerMessage({ type: 'error', text: 'Código de owner inválido!' });
                setTimeout(() => setOwnerMessage(null), 3000);
                setOwnerSaving(false);
                return;
            }

            await updateDoc(doc(db, 'users', user.uid), {
                isOwner: true,
                isAdmin: true, // Owner também é admin
                ownerActivatedAt: new Date().toISOString(),
                adminActivatedAt: new Date().toISOString()
            });

            setOwnerMessage({ type: 'success', text: '👑 Você agora é o OWNER! Recarregando...' });
            setOwnerCode('');

            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Erro ao ativar owner:', error);
            setOwnerMessage({ type: 'error', text: 'Erro ao ativar permissões de owner.' });
            setOwnerSaving(false);
        }
    };

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Configurações da Conta</h2>
            <p className={styles.sectionDescription}>
                Gerencie sua conta e sessão.
            </p>

            <div className={styles.settingGroup}>
                <label className={styles.label}>Código de Desenvolvedor</label>
                <p className={styles.sectionDescription} style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Insira o código de uso único gerado pelo Owner para se tornar administrador.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <input
                        type="text"
                        className={styles.input}
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                        placeholder="LUMEN-XXXX-XXXX-XXXX"
                        style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.05em' }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && adminCode) {
                                handleActivateAdmin();
                            }
                        }}
                    />
                    <button
                        className={styles.saveButton}
                        onClick={handleActivateAdmin}
                        disabled={saving || !adminCode}
                        style={{ minWidth: '120px' }}
                    >
                        {saving ? 'Ativando...' : 'Ativar Admin'}
                    </button>
                </div>
                {message && (
                    <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        color: message.type === 'success' ? '#4caf50' : '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Owner Code Section */}
            <div className={styles.settingGroup} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <label className={styles.label}>👑 Código de Owner</label>
                <p className={styles.sectionDescription} style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Código exclusivo para ativar permissões de  proprietário do sistema.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <input
                        type="password"
                        className={styles.input}
                        value={ownerCode}
                        onChange={(e) => setOwnerCode(e.target.value)}
                        placeholder="Digite o código de owner"
                        style={{ flex: 1 }}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && ownerCode) {
                                handleActivateOwner();
                            }
                        }}
                    />
                    <button
                        className={styles.saveButton}
                        onClick={handleActivateOwner}
                        disabled={ownerSaving || !ownerCode}
                        style={{ minWidth: '120px', background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)', color: '#000' }}
                    >
                        {ownerSaving ? 'Ativando...' : 'Ativar Owner'}
                    </button>
                </div>
                {ownerMessage && (
                    <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: ownerMessage.type === 'success' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${ownerMessage.type === 'success' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        color: ownerMessage.type === 'success' ? '#ffd700' : '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}>
                        {ownerMessage.text}
                    </div>
                )}
            </div>

            <div className={styles.settingGroup} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    className={styles.dangerButton}
                    onClick={onLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                >
                    <LogOut size={18} />
                    Sair da Conta
                </button>
            </div>
        </div>
    );
}

// About Settings
function AboutSettings() {
    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sobre o Lumen</h2>
            <div className={styles.aboutContainer} style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                    }}
                ></div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lumen</h3>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Versão 1.0.0 (Beta)</p>

                <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                        O Lumen é uma plataforma social moderna focada em conectar pessoas através de comunidades vibrantes.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Desenvolvido com ❤️ pela equipe Lumen.
                        <br />
                        © 2025 Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}
