import React, { useState } from 'react';
import styles from './SkillsEditor.module.css';
import { Zap, Plus, Search, Filter, Eye, Edit, Copy, Trash2, BookOpen, Settings } from 'lucide-react';
import { getAllEffects } from '../data/EffectsLibrary';
import { SkillBuilderModal } from './SkillBuilderModal';

export function SkillsEditor({ data = [], onChange, rulesConfig = {}, onRulesChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [previewMode, setPreviewMode] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [rulesModalOpen, setRulesModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);

    const handleAddSkill = () => {
        setEditingSkill(null);
        setModalOpen(true);
    };

    const handleEditSkill = (skill) => {
        setEditingSkill(skill);
        setModalOpen(true);
    };

    const handleDeleteSkill = (skillId) => {
        if (!window.confirm('Tem certeza que deseja deletar esta habilidade?')) return;
        onChange(data.filter(skill => skill.id !== skillId));
    };

    const handleDuplicateSkill = (skill) => {
        const newSkill = {
            ...skill,
            id: `skill-${Date.now()}`,
            name: `${skill.name} (Cópia)`
        };
        onChange([...data, newSkill]);
    };

    // Filtrar habilidades
    const filteredSkills = data.filter(skill => {
        const matchesSearch = skill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || skill.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Obter categorias únicas
    const categories = ['all', ...new Set(data.map(s => s.category).filter(Boolean))];

    return (
        <div className={styles.skillsEditor}>
            {/* Header */}
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <Zap size={32} />
                </div>
                <div>
                    <h2 className={styles.moduleTitle}>Habilidades & Poderes</h2>
                    <p className={styles.moduleSubtitle}>Sistema modular de construção de habilidades</p>
                </div>
                <button
                    className={`${styles.previewBtn} ${previewMode ? styles.active : ''}`}
                    onClick={() => setPreviewMode(!previewMode)}
                >
                    <Eye size={18} />
                    <span>{previewMode ? 'Modo Edição' : 'Preview'}</span>
                </button>
            </div>

            {/* Info Box */}
            <div className={styles.infoBox}>
                <div className={styles.infoIcon}>💡</div>
                <div>
                    <strong>Sistema Modular de Habilidades:</strong>
                    <ul>
                        <li><strong>Efeitos Base:</strong> Combine efeitos como Dano, Cura, Controle, Movimento</li>
                        <li><strong>Modificadores:</strong> Adicione Extras (+ poder) ou Falhas (- custo)</li>
                        <li><strong>Graduação:</strong> Defina a intensidade (Rank) de cada efeito</li>
                        <li><strong>Customização Total:</strong> Alcance, Duração, Área, Custos e mais!</li>
                    </ul>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <button className={styles.primaryAction} onClick={handleAddSkill}>
                    <Plus size={20} />
                    Adicionar Habilidade
                </button>
                <button className={styles.secondaryAction}>
                    <BookOpen size={20} />
                    Biblioteca de Templates
                </button>
                <button
                    className={styles.secondaryAction}
                    onClick={() => setRulesModalOpen(true)}
                >
                    <Settings size={20} />
                    Configurar Regras
                </button>
            </div>

            {/* Search & Filters */}
            <div className={styles.searchBar}>
                <div className={styles.searchInput}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar habilidades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <Filter size={18} />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'Todas Categorias' : cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Skills List */}
            <div className={styles.skillsList}>
                {data.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>⚡</div>
                        <h3>Nenhuma habilidade criada ainda</h3>
                        <p>Comece criando habilidades épicas para seu sistema!</p>
                        <button className={styles.emptyButton} onClick={handleAddSkill}>
                            <Plus size={20} />
                            Criar Primeira Habilidade
                        </button>
                    </div>
                ) : previewMode ? (
                    <div className={styles.previewGrid}>
                        {filteredSkills.map(skill => (
                            <div
                                key={skill.id}
                                className={styles.previewCard}
                                style={{
                                    '--skill-color': skill.color || '#8b5cf6',
                                    borderColor: skill.color || '#8b5cf6'
                                }}
                            >
                                <div className={styles.previewIcon}>{skill.icon || '⚡'}</div>
                                <div className={styles.previewName}>{skill.name || 'Sem nome'}</div>
                                <div className={styles.previewCategory}>{skill.category || 'Geral'}</div>
                                {skill.baseEffects && skill.baseEffects.length > 0 && (
                                    <div className={styles.previewRank}>
                                        Rank {skill.baseEffects[0].rank || 0}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.skillsGrid}>
                        {filteredSkills.map((skill, index) => (
                            <div
                                key={skill.id}
                                className={styles.skillCard}
                                style={{
                                    '--skill-color': skill.color || '#8b5cf6',
                                    borderColor: skill.color || '#8b5cf6',
                                    animationDelay: `${index * 0.05}s`
                                }}
                            >
                                {/* Card Glow */}
                                <div className={styles.cardGlow}></div>

                                {/* Header */}
                                <div className={styles.skillHeader}>
                                    <div className={styles.skillIconWrapper}>
                                        <div className={styles.skillIcon}>{skill.icon || '⚡'}</div>
                                        <div className={styles.iconGlow}></div>
                                    </div>
                                    <div className={styles.skillMeta}>
                                        <div className={styles.skillCategory}>{skill.category || 'Geral'}</div>
                                        {skill.tags && skill.tags.length > 0 && (
                                            <div className={styles.skillTags}>
                                                {skill.tags.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className={styles.tag}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={styles.skillContent}>
                                    <h3 className={styles.skillName}>{skill.name || 'Sem nome'}</h3>
                                    <p className={styles.skillDesc}>
                                        {skill.description || 'Descrição não disponível'}
                                    </p>

                                    {/* Stats */}
                                    {skill.baseEffects && skill.baseEffects.length > 0 && (
                                        <div className={styles.skillStats}>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Efeito</div>
                                                <div className={styles.statValue}>
                                                    {skill.baseEffects[0].type || 'N/A'}
                                                </div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statLabel}>Rank</div>
                                                <div className={styles.statValue}>
                                                    {skill.baseEffects[0].rank || 0}
                                                </div>
                                            </div>
                                            {skill.mechanics?.range && (
                                                <div className={styles.statItem}>
                                                    <div className={styles.statLabel}>Alcance</div>
                                                    <div className={styles.statValue}>
                                                        {skill.mechanics.range}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className={styles.skillActions}>
                                    <button
                                        className={`${styles.actionButton} ${styles.primaryAction}`}
                                        onClick={() => handleEditSkill(skill)}
                                        title="Editar habilidade"
                                    >
                                        <Edit size={16} />
                                        <span>Editar</span>
                                    </button>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleDuplicateSkill(skill)}
                                        title="Duplicar habilidade"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        className={styles.actionButtonDanger}
                                        onClick={() => handleDeleteSkill(skill.id)}
                                        title="Deletar habilidade"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Builder */}
            {modalOpen && (
                <SkillBuilderModal
                    skill={editingSkill}
                    onSave={(skill) => {
                        if (editingSkill) {
                            onChange(data.map(s => s.id === skill.id ? skill : s));
                        } else {
                            onChange([...data, skill]);
                        }
                        setModalOpen(false);
                        setEditingSkill(null);
                    }}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingSkill(null);
                    }}
                />
            )}

            {/* Modal de Regras */}
            {rulesModalOpen && (
                <SkillRulesModal
                    rulesConfig={rulesConfig}
                    onSave={(config) => {
                        onRulesChange(config);
                        setRulesModalOpen(false);
                    }}
                    onClose={() => setRulesModalOpen(false)}
                />
            )}
        </div>
    );
}

// Modal de Configuração de Regras
function SkillRulesModal({ rulesConfig = {}, onSave, onClose }) {
    const [config, setConfig] = useState(rulesConfig || {
        acquisitionSystem: 'level', // 'level', 'points', 'free', 'class'
        levelProgression: [],
        pointsPerLevel: 0,
        restrictions: {
            maxSkillsPerTier: {},
            requiresPrerequisites: true
        }
    });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.rulesModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>⚙️ Configurar Regras de Habilidades</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalContent}>
                    <h3>Sistema de Aquisição</h3>
                    <select
                        value={config.acquisitionSystem}
                        onChange={(e) => setConfig({ ...config, acquisitionSystem: e.target.value })}
                        className={styles.select}
                    >
                        <option value="level">Por Nível (tipo D&D Spell Slots)</option>
                        <option value="points">Por Pontos (tipo M&M Power Points)</option>
                        <option value="free">Livre (sem restrições)</option>
                        <option value="class">Por Classe/Arquétipo</option>
                    </select>

                    {config.acquisitionSystem === 'level' && (
                        <div className={styles.progressionConfig}>
                            <h4>Progressão por Nível</h4>
                            <p className={styles.helperText}>
                                Defina quantas habilidades de cada tier/rank o personagem pode ter em cada nível
                            </p>

                            <div className={styles.levelTable}>
                                <div className={styles.tableHeader}>
                                    <div>Nível</div>
                                    <div>Tier 1</div>
                                    <div>Tier 2</div>
                                    <div>Tier 3</div>
                                    <div>Tier 4</div>
                                    <div>Tier 5</div>
                                </div>

                                {[1, 2, 3, 4, 5, 10, 15, 20].map(level => (
                                    <div key={level} className={styles.tableRow}>
                                        <div>Nível {level}</div>
                                        {[1, 2, 3, 4, 5].map(tier => (
                                            <input
                                                key={tier}
                                                type="number"
                                                min="0"
                                                className={styles.smallInput}
                                                placeholder="0"
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {config.acquisitionSystem === 'points' && (
                        <div className={styles.pointsConfig}>
                            <h4>Sistema de Pontos</h4>
                            <div className={styles.formGroup}>
                                <label>Pontos por Nível:</label>
                                <input
                                    type="number"
                                    min="0"
                                    className={styles.input}
                                    placeholder="Ex: 10"
                                />
                            </div>
                            <p className={styles.helperText}>
                                Custo de cada habilidade será calculado baseado no Rank + Modificadores
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={styles.saveButton} onClick={() => onSave(config)}>
                        Salvar Regras
                    </button>
                </div>
            </div>
        </div>
    );
}
