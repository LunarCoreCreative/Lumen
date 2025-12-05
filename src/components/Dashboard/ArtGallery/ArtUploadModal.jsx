import React, { useState, useRef, useCallback } from 'react';
import styles from './ArtUploadModal.module.css';
import { X, Upload, Image as ImageIcon, Tag, FileText, Sparkles, Loader } from 'lucide-react';
import { artActions } from '../../../hooks/useArtGallery';

export function ArtUploadModal({ user, categories, onClose, onSuccess }) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const processFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione uma imagem válida.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('A imagem deve ter no máximo 10MB.');
            return;
        }

        setError('');
        setSelectedImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedImage) {
            setError('Por favor, selecione uma imagem.');
            return;
        }

        if (!title.trim()) {
            setError('Por favor, adicione um título.');
            return;
        }

        if (!category) {
            setError('Por favor, selecione uma categoria.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const tagsArray = tags
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(t => t.length > 0);

            await artActions.uploadArt({
                file: selectedImage,
                title: title.trim(),
                description: description.trim(),
                category,
                tags: tagsArray,
                userId: user.uid,
                authorName: user.displayName,
                authorPhotoURL: user.photoURL
            });

            onSuccess();
        } catch (err) {
            console.error('Erro ao publicar:', err);
            setError('Erro ao publicar arte. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <Sparkles size={22} />
                        Publicar Arte
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Image Drop Zone */}
                    <div
                        className={`${styles.dropZone} ${dragActive ? styles.active : ''} ${imagePreview ? styles.hasImage : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {imagePreview ? (
                            <div className={styles.previewWrapper}>
                                <img src={imagePreview} alt="Preview" className={styles.preview} />
                                <div className={styles.changeOverlay}>
                                    <Upload size={24} />
                                    <span>Trocar imagem</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.dropContent}>
                                <div className={styles.dropIcon}>
                                    <ImageIcon size={40} />
                                </div>
                                <p className={styles.dropText}>
                                    Arraste uma imagem ou <span>clique para selecionar</span>
                                </p>
                                <p className={styles.dropHint}>PNG, JPG, WEBP até 10MB</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </div>

                    {/* Title */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <FileText size={16} />
                            Título
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Dê um nome à sua arte..."
                            className={styles.input}
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <FileText size={16} />
                            Descrição <span className={styles.optional}>(opcional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Conte sobre sua criação..."
                            className={styles.textarea}
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    {/* Category */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <Sparkles size={16} />
                            Categoria
                        </label>
                        <div className={styles.categoryGrid}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`${styles.categoryOption} ${category === cat.id ? styles.selected : ''}`}
                                    onClick={() => setCategory(cat.id)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <Tag size={16} />
                            Tags <span className={styles.optional}>(separadas por vírgula)</span>
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="ex: fantasia, dragão, digital..."
                            className={styles.input}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader size={18} className={styles.spinner} />
                                Publicando...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Publicar Arte
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
