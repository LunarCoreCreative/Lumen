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
    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Configurações da Conta</h2>
            <p className={styles.sectionDescription}>
                Gerencie sua conta e sessão.
            </p>

            <div className={styles.settingGroup}>
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
