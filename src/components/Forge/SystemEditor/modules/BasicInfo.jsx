import React, { useState } from 'react';
import styles from './BasicInfo.module.css';
import { Sparkles, Tag, FileText, Target, Palette } from 'lucide-react';

const GENRES = [
    { id: 'fantasy', label: 'Fantasy', icon: '⚔️' },
    { id: 'scifi', label: 'Sci-Fi', icon: '🚀' },
    { id: 'horror', label: 'Horror', icon: '👻' },
    { id: 'modern', label: 'Modern', icon: '🏙️' },
    { id: 'historical', label: 'Historical', icon: '📜' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '🤖' },
    { id: 'steampunk', label: 'Steampunk', icon: '⚙️' },
    { id: 'custom', label: 'Custom', icon: '✨' }
];

const COMPLEXITY_LEVELS = [
    { value: 'simple', label: 'Simples', desc: 'Regras básicas, ideal para iniciantes' },
    { value: 'moderate', label: 'Moderado', desc: 'Equilíbrio entre simplicidade e profundidade' },
    { value: 'complex', label: 'Complexo', desc: 'Sistema detalhado com muitas opções' }
];

const EMOJI_ICONS = ['🎲', '⚔️', '🛡️', '🔮', '📖', '🌟', '⚡', '🔥', '💀', '👑', '🗡️', '🏰'];

export function BasicInfo({ data, onChange }) {
    const [tagInput, setTagInput] = useState('');

    const handleChange = (field, value) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    const handleGenreToggle = (genreId) => {
        const newGenres = data.genre.includes(genreId)
            ? data.genre.filter(g => g !== genreId)
            : [...data.genre, genreId];
        handleChange('genre', newGenres);
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!data.tags.includes(tagInput.trim())) {
                handleChange('tags', [...data.tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        handleChange('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className={styles.basicInfo}>
            <div className={styles.moduleHeader}>
                <div className={styles.headerIcon}>
                    <Sparkles size={32} />
                </div>
                <div>
                    <h2 className={styles.moduleTitle}>Informações Básicas</h2>
                    <p className={styles.moduleSubtitle}>Defina a identidade do seu sistema de RPG</p>
                </div>
            </div>

            <div className={styles.formSections}>
                {/* Nome e Ícone */}
                <div className={styles.section}>
                    <label className={styles.sectionLabel}>
                        <FileText size={18} />
                        <span>Nome e Ícone</span>
                    </label>

                    <div className={styles.nameIconRow}>
                        <div className={styles.iconSelector}>
                            <div className={styles.iconDisplay}>{data.icon}</div>
                            <div className={styles.iconOptions}>
                                {EMOJI_ICONS.map(emoji => (
                                    <button
                                        key={emoji}
                                        className={`${styles.iconOption} ${data.icon === emoji ? styles.active : ''}`}
                                        onClick={() => handleChange('icon', emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Ex: D&D Simplificado, Fate Adaptado..."
                                value={data.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                            <span className={styles.inputCounter}>{data.name.length}/50</span>
                        </div>
                    </div>
                </div>

                {/* Descrição */}
                <div className={styles.section}>
                    <label className={styles.sectionLabel}>
                        <Target size={18} />
                        <span>Descrição</span>
                    </label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Descreva seu sistema: tema, mecânicas principais, público-alvo..."
                        value={data.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={4}
                    />
                    <span className={styles.textareaCounter}>{data.description.length}/500 caracteres</span>
                </div>

                {/* Gênero */}
                <div className={styles.section}>
                    <label className={styles.sectionLabel}>
                        <Palette size={18} />
                        <span>Gênero</span>
                        <span className={styles.badge}>{data.genre.length} selecionados</span>
                    </label>
                    <div className={styles.genreGrid}>
                        {GENRES.map(genre => (
                            <button
                                key={genre.id}
                                className={`${styles.genreCard} ${data.genre.includes(genre.id) ? styles.selected : ''}`}
                                onClick={() => handleGenreToggle(genre.id)}
                            >
                                <span className={styles.genreIcon}>{genre.icon}</span>
                                <span className={styles.genreLabel}>{genre.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Complexidade */}
                <div className={styles.section}>
                    <label className={styles.sectionLabel}>
                        <Target size={18} />
                        <span>Complexidade</span>
                    </label>
                    <div className={styles.complexityOptions}>
                        {COMPLEXITY_LEVELS.map(level => (
                            <label
                                key={level.value}
                                className={`${styles.complexityCard} ${data.complexity === level.value ? styles.selected : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="complexity"
                                    value={level.value}
                                    checked={data.complexity === level.value}
                                    onChange={(e) => handleChange('complexity', e.target.value)}
                                    className={styles.radioInput}
                                />
                                <div className={styles.complexityContent}>
                                    <span className={styles.complexityLabel}>{level.label}</span>
                                    <span className={styles.complexityDesc}>{level.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div className={styles.section}>
                    <label className={styles.sectionLabel}>
                        <Tag size={18} />
                        <span>Tags</span>
                        <span className={styles.hint}>Pressione Enter para adicionar</span>
                    </label>
                    <div className={styles.tagsContainer}>
                        {data.tags.map(tag => (
                            <div key={tag} className={styles.tag}>
                                <span>{tag}</span>
                                <button
                                    className={styles.tagRemove}
                                    onClick={() => handleRemoveTag(tag)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <input
                            type="text"
                            className={styles.tagInput}
                            placeholder="medieval, magia, combate..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
