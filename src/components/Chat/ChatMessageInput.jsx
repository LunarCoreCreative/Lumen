import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { BoldIcon, ItalicIcon, StrikeIcon, CodeIcon, EmojiIcon, FormatIcon } from '../Icons';
import { Send } from 'lucide-react';
import styles from './ChatMessageInput.module.css';
import { CodeEditorDialog } from '../CodeEditorDialog';
import { RichTextRenderer } from '../RichTextRenderer';

export function ChatMessageInput({ onSend, disabled }) {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const emojiPickerRef = useRef(null);
    const inputRef = useRef(null);

    // Fechar emoji picker ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Auto-resize do textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
        }
    }, [message]);

    const insertFormat = (prefix, suffix) => {
        const textarea = inputRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        setMessage(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleCodeInsert = (codeBlock) => {
        const textarea = inputRef.current;
        if (!textarea) {
            setMessage(prev => prev + '\n' + codeBlock + '\n');
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);

        const prefix = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
        const suffix = after.length > 0 && !after.startsWith('\n') ? '\n' : '';

        const newText = before + prefix + codeBlock + suffix + after;
        setMessage(newText);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length + codeBlock.length + suffix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleSubmit = () => {
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');
            setShowEmojiPicker(false);
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={styles.messageInputWrapper}>
            <div className={styles.inputContainer}>
                {/* Preview em tempo real */}
                {message.trim() && (
                    <div className={styles.previewArea}>
                        <div className={styles.previewLabel}>Preview:</div>
                        <div className={styles.previewContent}>
                            <RichTextRenderer text={message} />
                        </div>
                    </div>
                )}

                {/* Toolbar de Formatação */}
                {showToolbar && (
                    <div className={styles.formatToolbar}>
                        <button className={styles.formatBtn} onClick={() => insertFormat('**', '**')} title="Negrito">
                            <BoldIcon size={16} />
                        </button>
                        <button className={styles.formatBtn} onClick={() => insertFormat('*', '*')} title="Itálico">
                            <ItalicIcon size={16} />
                        </button>
                        <button className={styles.formatBtn} onClick={() => insertFormat('~~', '~~')} title="Tachado">
                            <StrikeIcon size={16} />
                        </button>
                        <button className={styles.formatBtn} onClick={() => setShowCodeEditor(true)} title="Código">
                            <CodeIcon size={16} />
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className={styles.inputRow}>
                    {/* Botões de Ação Esquerda */}
                    <div className={styles.leftActions}>
                        <button
                            className={`${styles.actionBtn} ${showToolbar ? styles.active : ''}`}
                            onClick={() => setShowToolbar(!showToolbar)}
                            title="Formatação"
                        >
                            <FormatIcon size={20} />
                        </button>

                        <div className={styles.emojiWrapper} ref={emojiPickerRef}>
                            <button
                                className={styles.actionBtn}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                title="Adicionar emoji"
                            >
                                <EmojiIcon size={20} />
                            </button>
                            {showEmojiPicker && (
                                <div className={styles.emojiPickerPopover}>
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        theme="dark"
                                        emojiStyle="apple"
                                        width={300}
                                        height={350}
                                        searchDisabled={false}
                                        skinTonesDisabled
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Input */}
                    <textarea
                        ref={inputRef}
                        className={styles.messageInput}
                        placeholder="Digite sua mensagem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={disabled}
                    />

                    {/* Botão Enviar */}
                    <button
                        className={styles.sendBtn}
                        onClick={handleSubmit}
                        disabled={!message.trim() || disabled}
                        title="Enviar"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>

            <CodeEditorDialog
                isOpen={showCodeEditor}
                onClose={() => setShowCodeEditor(false)}
                onInsert={handleCodeInsert}
            />
        </div>
    );
}
