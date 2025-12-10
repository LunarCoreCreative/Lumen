import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ChevronRight, ChevronDown, Box, Type, Image as ImageIcon,
    Layers, Trash2, Copy, Plus, Edit2, Eye, EyeOff, Lock, Unlock,
    Monitor, MoreHorizontal, Folder, ScrollText,
    // Ícones para widgets RPG
    Gauge, Target, Heart, Dices
} from 'lucide-react';
import styles from './HierarchyPanel.module.css';

/**
 * HierarchyPanel - Unity-style hierarchy tree
 * 
 * Features:
 * - Drag & drop reordering
 * - Parent-child nesting with visual indicators
 * - Rename via double-click or F2
 * - Context menu with actions
 * - Expand/collapse nodes
 * - Multi-select with Ctrl+click
 */

// Widget type icons map
const WIDGET_ICONS = {
    container: Folder,
    scrollView: ScrollText,
    panel: Box,
    text: Type,
    image: ImageIcon,
    canvas: Monitor,
    // Widgets RPG
    attributeDisplay: Gauge,
    skillDisplay: Target,
    resourceBar: Heart,
    diceButton: Dices,
};

export function HierarchyPanel({
    scenes = [],
    selectedSceneId,
    selectedWidgetIds = [],
    expandedNodes = {},
    onSelectScene,
    onSelectWidgets,
    onExpandNode,
    onAddScene,
    onDeleteScene,
    onRenameScene,
    onAddWidget,
    onDeleteWidget,
    onRenameWidget,
    onReparentWidget,
    onDuplicateWidget,
    onInstantiatePrefab, // New: handle prefab drop from ProjectPanel
    style = {},
}) {
    // Local state
    const [renamingId, setRenamingId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [dragState, setDragState] = useState(null); // { draggedId, overId, position }
    const hierarchyRef = useRef(null);

    // Close context menu on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenu && !e.target.closest(`.${styles.contextMenu}`)) {
                setContextMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [contextMenu]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;

            // F2 to rename
            if (e.key === 'F2' && selectedWidgetIds.length === 1) {
                e.preventDefault();
                setRenamingId(selectedWidgetIds[0]);
            }

            // Delete
            if (e.key === 'Delete' && selectedWidgetIds.length > 0) {
                selectedWidgetIds.forEach(id => onDeleteWidget?.(id));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedWidgetIds, onDeleteWidget]);

    // === DRAG & DROP ===
    const handleDragStart = useCallback((e, id, type) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'copyMove'; // Allow both copy (to Project) and move (reorder)
        e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));
        e.dataTransfer.setData('widgetId', id); // Also set for legacy compatibility
        setDragState({ draggedId: id, overId: null, position: null });
    }, []);

    const handleDragOver = useCallback((e, targetId, targetType) => {
        e.preventDefault();
        e.stopPropagation();

        // Allow drop if it's a prefab from ProjectPanel
        const hasPreset = e.dataTransfer.types.includes('presetid') || e.dataTransfer.types.includes('presetId');

        // If not a prefab and no internal drag, ignore
        if (!hasPreset && (!dragState?.draggedId || dragState.draggedId === targetId)) {
            return;
        }

        // Set drop effect
        e.dataTransfer.dropEffect = hasPreset ? 'copy' : 'move';

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const relativeY = y / height;

        let position = 'inside';
        if (relativeY < 0.25) position = 'before';
        else if (relativeY > 0.75) position = 'after';

        // Can't drop inside text or image (non-container widgets)
        if (position === 'inside' && (targetType === 'text' || targetType === 'image')) {
            position = 'after';
        }

        setDragState(prev => ({
            ...prev,
            overId: targetId,
            position,
            isExternalDrop: hasPreset
        }));
    }, [dragState?.draggedId]);

    const handleDragLeave = useCallback((e) => {
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e, targetId, parentId = null) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if it's a prefab being dropped
        const presetId = e.dataTransfer.getData('presetId');
        if (presetId && onInstantiatePrefab) {
            onInstantiatePrefab(presetId, parentId || targetId);
            setDragState(null);
            return;
        }

        if (!dragState?.draggedId || dragState.draggedId === targetId) {
            setDragState(null);
            return;
        }

        const { position } = dragState;

        if (position === 'inside') {
            onReparentWidget?.(dragState.draggedId, targetId);
        } else {
            // Get sibling index
            onReparentWidget?.(dragState.draggedId, parentId, targetId, position);
        }

        setDragState(null);
    }, [dragState, onReparentWidget, onInstantiatePrefab]);

    const handleDragEnd = useCallback(() => {
        setDragState(null);
    }, []);

    // === CONTEXT MENU ===
    const handleContextMenu = useCallback((e, type, data) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type,
            data
        });
    }, []);

    // === SELECTION ===
    const handleSelect = useCallback((e, id, isScene = false) => {
        e.stopPropagation();

        if (isScene) {
            onSelectScene?.(id);
            onSelectWidgets?.([]);
        } else {
            if (e.ctrlKey || e.metaKey) {
                // Toggle selection
                const newSelection = selectedWidgetIds.includes(id)
                    ? selectedWidgetIds.filter(wid => wid !== id)
                    : [...selectedWidgetIds, id];
                onSelectWidgets?.(newSelection);
            } else {
                onSelectWidgets?.([id]);
            }
        }
    }, [selectedWidgetIds, onSelectScene, onSelectWidgets]);

    // === RENAME ===
    const handleRenameSubmit = useCallback((id, newName, isScene = false) => {
        if (newName.trim()) {
            if (isScene) {
                onRenameScene?.(id, newName.trim());
            } else {
                onRenameWidget?.(id, newName.trim());
            }
        }
        setRenamingId(null);
    }, [onRenameScene, onRenameWidget]);

    // === RENDER WIDGET NODE ===
    const renderWidgetNode = (widget, depth = 0, parentId = null) => {
        const IconComp = WIDGET_ICONS[widget.type] || Box;
        const isSelected = selectedWidgetIds.includes(widget.id);
        const isExpanded = expandedNodes[widget.id];
        const hasChildren = widget.widgets && widget.widgets.length > 0;
        const isRenaming = renamingId === widget.id;

        // Drag state classes
        const isDragOver = dragState?.overId === widget.id;
        const dropPosition = isDragOver ? dragState.position : null;

        return (
            <div key={widget.id} className={styles.nodeContainer}>
                <div
                    className={`
                        ${styles.nodeRow} 
                        ${isSelected ? styles.selected : ''} 
                        ${widget.isPrefabInstance ? styles.prefabInstance : ''}
                        ${isDragOver && dropPosition === 'before' ? styles.dropBefore : ''}
                        ${isDragOver && dropPosition === 'after' ? styles.dropAfter : ''}
                        ${isDragOver && dropPosition === 'inside' ? styles.dropInside : ''}
                    `}
                    style={{ paddingLeft: `${8 + depth * 16}px` }}
                    draggable={!isRenaming}
                    onDragStart={(e) => handleDragStart(e, widget.id, 'widget')}
                    onDragOver={(e) => handleDragOver(e, widget.id, widget.type)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, widget.id, parentId)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => handleSelect(e, widget.id)}
                    onDoubleClick={() => setRenamingId(widget.id)}
                    onContextMenu={(e) => handleContextMenu(e, 'widget', { widget, parentId })}
                >
                    {/* Expand/Collapse Button */}
                    <button
                        className={styles.expandBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpandNode?.(widget.id);
                        }}
                        style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                    >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>

                    {/* Icon */}
                    <IconComp size={14} className={styles.nodeIcon} />

                    {/* Name */}
                    {isRenaming ? (
                        <input
                            type="text"
                            className={styles.renameInput}
                            defaultValue={widget.name || widget.type}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => handleRenameSubmit(widget.id, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit(widget.id, e.target.value);
                                if (e.key === 'Escape') setRenamingId(null);
                            }}
                        />
                    ) : (
                        <span className={styles.nodeName}>{widget.name || widget.type}</span>
                    )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className={styles.nodeChildren}>
                        {widget.widgets.map(child => renderWidgetNode(child, depth + 1, widget.id))}
                    </div>
                )}
            </div>
        );
    };

    // === RENDER SCENE NODE ===
    const renderSceneNode = (scene) => {
        const isSelected = selectedSceneId === scene.id && selectedWidgetIds.length === 0;
        const isExpanded = expandedNodes[scene.id];
        const hasChildren = scene.widgets && scene.widgets.length > 0;
        const isRenaming = renamingId === scene.id;

        return (
            <div key={scene.id} className={styles.sceneContainer}>
                <div
                    className={`${styles.sceneRow} ${isSelected ? styles.selected : ''}`}
                    onClick={(e) => handleSelect(e, scene.id, true)}
                    onDoubleClick={() => setRenamingId(scene.id)}
                    onContextMenu={(e) => handleContextMenu(e, 'scene', { scene })}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Check for prefab drop
                        const presetId = e.dataTransfer.getData('presetId');
                        if (presetId && onInstantiatePrefab) {
                            onInstantiatePrefab(presetId, null); // Add to scene root
                            setDragState(null);
                            return;
                        }

                        if (dragState?.draggedId) {
                            onReparentWidget?.(dragState.draggedId, null); // Move to root
                            setDragState(null);
                        }
                    }}
                >
                    {/* Expand/Collapse */}
                    <button
                        className={styles.expandBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpandNode?.(scene.id);
                        }}
                    >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>

                    {/* Icon */}
                    <Layers size={14} className={styles.sceneIcon} />

                    {/* Name */}
                    {isRenaming ? (
                        <input
                            type="text"
                            className={styles.renameInput}
                            defaultValue={scene.name}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) => handleRenameSubmit(scene.id, e.target.value, true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit(scene.id, e.target.value, true);
                                if (e.key === 'Escape') setRenamingId(null);
                            }}
                        />
                    ) : (
                        <span className={styles.sceneName}>{scene.name}</span>
                    )}
                </div>

                {/* Scene Children */}
                {isExpanded && hasChildren && (
                    <div className={styles.sceneChildren}>
                        {scene.widgets.map(widget => renderWidgetNode(widget, 0, null))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.hierarchy} ref={hierarchyRef} style={style}>
            {/* Header */}
            <div className={styles.header}>
                <span>Hierarchy</span>
                <button
                    className={styles.addBtn}
                    onClick={() => onAddScene?.()}
                    title="Add Scene"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* Tree Content */}
            <div className={styles.content}>
                {scenes.length === 0 ? (
                    <div className={styles.empty}>
                        <Layers size={24} />
                        <span>No scenes</span>
                        <button onClick={() => onAddScene?.()}>
                            <Plus size={12} /> Create Scene
                        </button>
                    </div>
                ) : (
                    scenes.map(scene => renderSceneNode(scene))
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className={styles.contextMenu}
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.type === 'scene' && (
                        <>
                            <div className={styles.menuLabel}>Create</div>
                            <button onClick={() => { onAddWidget?.('container', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Folder size={14} /> Container
                            </button>
                            <button onClick={() => { onAddWidget?.('scrollView', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <ScrollText size={14} /> Scroll View
                            </button>
                            <button onClick={() => { onAddWidget?.('panel', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Box size={14} /> Panel
                            </button>
                            <button onClick={() => { onAddWidget?.('text', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Type size={14} /> Text
                            </button>
                            <button onClick={() => { onAddWidget?.('image', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <ImageIcon size={14} /> Image
                            </button>
                            <div className={styles.menuDivider} />
                            <div className={styles.menuLabel}>RPG</div>
                            <button onClick={() => { onAddWidget?.('attributeDisplay', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Gauge size={14} /> Atributo
                            </button>
                            <button onClick={() => { onAddWidget?.('skillDisplay', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Target size={14} /> Perícia
                            </button>
                            <button onClick={() => { onAddWidget?.('resourceBar', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Heart size={14} /> Recurso
                            </button>
                            <button onClick={() => { onAddWidget?.('diceButton', contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Dices size={14} /> Dado
                            </button>
                            <div className={styles.menuDivider} />
                            <button onClick={() => { setRenamingId(contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Edit2 size={14} /> Rename
                            </button>
                            <button className={styles.danger} onClick={() => { onDeleteScene?.(contextMenu.data.scene.id); setContextMenu(null); }}>
                                <Trash2 size={14} /> Delete Scene
                            </button>
                        </>
                    )}

                    {contextMenu.type === 'widget' && (
                        <>
                            <div className={styles.menuLabel}>Add Child</div>
                            <button onClick={() => { onAddWidget?.('container', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Folder size={14} /> Container
                            </button>
                            <button onClick={() => { onAddWidget?.('scrollView', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <ScrollText size={14} /> Scroll View
                            </button>
                            <button onClick={() => { onAddWidget?.('panel', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Box size={14} /> Panel
                            </button>
                            <button onClick={() => { onAddWidget?.('text', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Type size={14} /> Text
                            </button>
                            <button onClick={() => { onAddWidget?.('image', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <ImageIcon size={14} /> Image
                            </button>
                            <div className={styles.menuDivider} />
                            <div className={styles.menuLabel}>RPG</div>
                            <button onClick={() => { onAddWidget?.('attributeDisplay', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Gauge size={14} /> Atributo
                            </button>
                            <button onClick={() => { onAddWidget?.('skillDisplay', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Target size={14} /> Perícia
                            </button>
                            <button onClick={() => { onAddWidget?.('resourceBar', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Heart size={14} /> Recurso
                            </button>
                            <button onClick={() => { onAddWidget?.('diceButton', null, contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Dices size={14} /> Dado
                            </button>
                            <div className={styles.menuDivider} />
                            <button onClick={() => { setRenamingId(contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Edit2 size={14} /> Rename
                            </button>
                            <button onClick={() => { onDuplicateWidget?.(contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Copy size={14} /> Duplicate
                            </button>
                            <div className={styles.menuDivider} />
                            <button className={styles.danger} onClick={() => { onDeleteWidget?.(contextMenu.data.widget.id); setContextMenu(null); }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default HierarchyPanel;
