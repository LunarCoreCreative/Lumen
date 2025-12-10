import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, Save, Undo2, Redo2, Play, Monitor, Smartphone, Grid3X3,
    ChevronRight, ChevronDown, Box, Type, Image as ImageIcon,
    Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy, Plus,
    ZoomIn, ZoomOut, Move, MousePointer, Square, MoreVertical,
    Clipboard, Scissors, Package, FolderOpen, Bookmark, Edit2, Folder, ScrollText,
    // Ícones para widgets RPG
    Gauge, Target, Heart, Dices
} from 'lucide-react';
import styles from './LayoutEditorModal.module.css';
import { HierarchyPanel } from './HierarchyPanel';
import { SceneViewPanel } from './SceneViewPanel';
import { InspectorPanel } from './InspectorPanel';
import { ProjectPanel } from './ProjectPanel';



// ========== WIDGET TYPES ==========
const WIDGET_TYPES = {
    container: {
        label: 'Container',
        icon: Folder,
        category: 'layout',
        defaultProps: {
            visible: true
        }
    },
    scrollView: {
        label: 'Scroll View',
        icon: ScrollText,
        category: 'layout',
        defaultProps: {
            visible: true,
            scrollDirection: 'vertical',
            showScrollbar: true,
            scrollbarColor: '#ffffff',
            scrollbarAlpha: 0.3
        }
    },
    panel: {
        label: 'Panel',
        icon: Box,
        category: 'ui',
        defaultProps: {
            backgroundColor: '#1e293b',
            backgroundAlpha: 0.8,
            backgroundGradient: false,
            gradientColor: '#8b5cf6',
            gradientDirection: 'to bottom',
            borderStyle: 'solid',
            borderColor: '#ffffff',
            borderAlpha: 0.1,
            borderTop: 1,
            borderRight: 1,
            borderBottom: 1,
            borderLeft: 1,
            borderRadiusTL: 8,
            borderRadiusTR: 8,
            borderRadiusBR: 8,
            borderRadiusBL: 8,
            paddingTop: 12,
            paddingRight: 12,
            paddingBottom: 12,
            paddingLeft: 12,
            overflow: 'visible',
            shadow: 'none',
            blur: false,
            blurAmount: 10,
            visible: true
        }
    },
    text: {
        label: 'Text',
        icon: Type,
        category: 'ui',
        defaultProps: {
            text: 'Label',
            fontSize: 14,
            fontWeight: 'normal',
            color: '#ffffff',
            textAlign: 'left'
        }
    },
    image: {
        label: 'Image',
        icon: ImageIcon,
        category: 'ui',
        defaultProps: {
            src: '',
            fit: 'cover',
            borderRadius: 0,
            opacity: 1
        }
    },
    canvas: {
        label: 'Canvas',
        icon: Monitor,
        category: 'layout',
        defaultProps: {
            width: 1920,
            height: 1080,
            backgroundColor: '#ffffff',
            backgroundAlpha: 0.05
        }
    },

    // ========== WIDGETS RPG ==========
    attributeDisplay: {
        label: 'Atributo',
        icon: Gauge,
        category: 'rpg',
        defaultProps: {
            fieldId: '',           // ID do field a conectar
            showModifier: true,    // Exibir modificador calculado
            modifierFormula: 'floor((value - 10) / 2)', // Fórmula D&D por padrão
            layout: 'card',        // 'compact', 'card', 'circle'
            showLabel: true,       // Exibir nome do field
            accentColor: '#8b5cf6', // Cor de destaque
            mockValue: 16,         // Valor para preview
            mockLabel: 'FOR'       // Label para preview
        }
    },
    skillDisplay: {
        label: 'Perícia',
        icon: Target,
        category: 'rpg',
        defaultProps: {
            skillId: '',           // ID da perícia a conectar
            showProficiency: true, // Exibir indicador ●/○
            showBonus: true,       // Exibir bônus total
            clickToRoll: true,     // Clicar para rolar
            accentColor: '#22c55e', // Cor de destaque
            mockName: 'Atletismo', // Nome para preview
            mockBonus: 5,          // Bônus para preview
            mockProficient: true   // Proficiência para preview
        }
    },
    resourceBar: {
        label: 'Recurso',
        icon: Heart,
        category: 'rpg',
        defaultProps: {
            fieldId: '',           // ID do field (tipo pool)
            showNumbers: true,     // Exibir "45/60"
            showLabel: true,       // Exibir nome
            barColor: '#ef4444',   // Cor da barra
            barStyle: 'smooth',    // 'smooth', 'segmented', 'hearts'
            editable: true,        // Permitir edição
            mockCurrent: 45,       // Valor atual para preview
            mockMax: 60,           // Valor máximo para preview
            mockLabel: 'Pontos de Vida' // Label para preview
        }
    },
    diceButton: {
        label: 'Dado',
        icon: Dices,
        category: 'rpg',
        defaultProps: {
            formula: '1d20',       // Fórmula do dado
            label: 'Rolar',        // Texto do botão
            icon: '🎲',            // Ícone (emoji)
            rollType: 'normal',    // 'normal', 'advantage', 'disadvantage'
            accentColor: '#f59e0b', // Cor de destaque
            showFormula: true      // Exibir fórmula no botão
        }
    }
};

const WIDGET_CATEGORIES = [
    { id: 'ui', label: 'UI', icon: Box, color: '#8b5cf6' },
    { id: 'rpg', label: 'RPG', icon: Dices, color: '#ef4444' }
];

// Helper functions
const generateId = () => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export function LayoutEditorModal({ isOpen, onClose, layout, fields, events, onChange }) {
    // ========== STATE ==========
    // Scenes structure: scenes contain canvases, canvases contain widgets with parent-child relationships
    // Support legacy 'pages' prop for backward compatibility
    const [scenes, setScenes] = useState(layout?.scenes || layout?.pages || []);
    const [selectedSceneId, setSelectedSceneId] = useState(null);
    const [selectedWidgetIds, setSelectedWidgetIds] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState({});
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showGrid, setShowGrid] = useState(true);
    const [previewMode, setPreviewMode] = useState('edit');
    const [tool, setTool] = useState('select');

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState(null); // 'move', 'resize', 'pan'
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragWidgetStart, setDragWidgetStart] = useState({});
    const [resizeHandle, setResizeHandle] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Context menu
    const [contextMenu, setContextMenu] = useState(null);
    const [contextSubmenu, setContextSubmenu] = useState(null); // 'addChild' | null
    const [renamingId, setRenamingId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null); // { id: string, position: 'before'|'after'|'inside' }

    // Clipboard
    const [clipboard, setClipboard] = useState(null);

    // History (Undo/Redo)
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Panel resize state
    const [panelWidths, setPanelWidths] = useState({ hierarchy: 220, inspector: 280 });
    const [isResizingPanel, setIsResizingPanel] = useState(null);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);

    // Project panel (bottom) state
    const [projectPanelHeight, setProjectPanelHeight] = useState(150);
    const [isResizingProject, setIsResizingProject] = useState(false);
    const [resizeStartY, setResizeStartY] = useState(0);
    const [resizeStartHeight, setResizeStartHeight] = useState(0);

    // Project assets (replaces old presets)
    const [projectAssets, setProjectAssets] = useState(layout?.projectAssets || layout?.presets?.map(p => ({
        ...p,
        type: 'preset',
        folderId: 'presets',
        createdAt: new Date().toISOString(),
    })) || []);
    const [projectFolders, setProjectFolders] = useState(layout?.projectFolders || [
        { id: 'root', name: 'Project', parentId: null },
        { id: 'presets', name: 'Presets', parentId: 'root' },
        { id: 'components', name: 'Components', parentId: 'root' },
        { id: 'templates', name: 'Templates', parentId: 'root' },
    ]);

    // Refs
    const canvasRef = useRef(null);
    const sceneViewRef = useRef(null);
    const containerRef = useRef(null);

    // ========== COMPUTED ==========
    const selectedScene = scenes.find(s => s.id === selectedSceneId);

    // Recursive widget finder
    const findWidgetById = (widgets, id) => {
        for (const w of widgets) {
            if (w.id === id) return w;
            if (w.widgets) {
                const found = findWidgetById(w.widgets, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedWidgets = selectedWidgetIds
        .map(id => findWidgetById(selectedScene?.widgets || [], id))
        .filter(Boolean);
    const selectedWidget = selectedWidgets.length === 1 ? selectedWidgets[0] : null;

    // ========== HISTORY ==========
    const pushHistory = useCallback((newScenes) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.stringify(newScenes));
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setScenes(JSON.parse(history[historyIndex - 1]));
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setScenes(JSON.parse(history[historyIndex + 1]));
        }
    }, [history, historyIndex]);

    // ========== HANDLERS ==========
    const handleSave = () => {
        onChange?.({ ...layout, scenes, projectAssets, projectFolders });
        onClose?.();
    };

    const updateScenes = useCallback((newScenes) => {
        pushHistory(newScenes);
        setScenes(newScenes);
    }, [pushHistory]);

    const handleAddScene = useCallback(() => {
        const newScene = {
            id: generateId(),
            name: `Scene ${scenes.length + 1}`,
            widgets: []
        };
        updateScenes([...scenes, newScene]);
        setSelectedSceneId(newScene.id);
    }, [scenes, updateScenes]);

    const handleDeleteScene = useCallback((sceneId) => {
        if (!sceneId) return;
        const newScenes = scenes.filter(s => s.id !== sceneId);
        updateScenes(newScenes);
        if (selectedSceneId === sceneId) {
            setSelectedSceneId(newScenes.length > 0 ? newScenes[0].id : null);
        }
    }, [scenes, selectedSceneId, updateScenes]);

    // Helper to find parent of a widget
    const findParentSceneOrWidget = (nodes, widgetId) => {
        for (const node of nodes) {
            if (node.widgets?.some(w => w.id === widgetId)) return node;
            const foundInChildren = findParentSceneOrWidget(node.widgets || [], widgetId);
            if (foundInChildren) return foundInChildren;
        }
        return null;
    };

    // Helper to recursively update widget in tree
    const updateWidgetInTree = (nodes, widgetId, updateFn) => {
        return nodes.map(node => {
            if (node.id === widgetId) {
                return updateFn(node);
            }
            if (node.widgets) {
                return {
                    ...node,
                    widgets: updateWidgetInTree(node.widgets, widgetId, updateFn)
                };
            }
            if (node.children) { // Handle both structure types just in case
                return {
                    ...node,
                    children: updateWidgetInTree(node.children, widgetId, updateFn)
                };
            }
            return node;
        });
    };

    const handleRename = useCallback((id, newName) => {
        if (!newName || !newName.trim()) {
            setRenamingId(null);
            return;
        }

        const updatedScenes = scenes.map(scene => {
            if (scene.id === id) {
                return { ...scene, name: newName };
            }
            // Use recursive update for widgets
            return {
                ...scene,
                widgets: updateWidgetInTree(scene.widgets || [], id, (w) => ({ ...w, name: newName }))
            };
        });

        updateScenes(updatedScenes);
        setRenamingId(null);
    }, [scenes, updateScenes]);

    const handleAddWidget = useCallback((type, x = 100, y = 100, targetSceneId = null, targetParentId = null) => {
        let targetScene = null;
        let targetParentWidget = null;

        // 1. Determine Target Scene
        if (targetSceneId) {
            targetScene = scenes.find(s => s.id === targetSceneId);
        } else if (selectedSceneId) {
            targetScene = scenes.find(s => s.id === selectedSceneId);
        }

        if (!targetScene) {
            console.error('Target scene not found');
            return;
        }

        // 2. Determine Target Parent (if targetParentId is passed)
        if (targetParentId) {
            const findInWidgets = (widgets) => {
                for (const w of widgets) {
                    if (w.id === targetParentId) return w;
                    if (w.widgets) {
                        const found = findInWidgets(w.widgets);
                        if (found) return found;
                    }
                }
                return null;
            };
            targetParentWidget = findInWidgets(targetScene.widgets);
        }

        const config = WIDGET_TYPES[type];
        if (!config) return;

        const newWidget = {
            id: generateId(),
            type,
            name: `${config.label} ${Math.floor(Math.random() * 1000)}`,
            x: targetParentWidget ? 20 : Math.round(x / 10) * 10,
            y: targetParentWidget ? 20 : Math.round(y / 10) * 10,
            w: 200,
            h: type === 'text' ? 40 : 150,
            props: { ...config.defaultProps },
            widgets: []
        };

        const updatedScenes = scenes.map(s => {
            if (s.id !== targetScene.id) return s;

            if (targetParentWidget) {
                // Add to parent widget's children recursively
                const addToParent = (widgets) => {
                    return widgets.map(w => {
                        if (w.id === targetParentId) {
                            return { ...w, widgets: [...(w.widgets || []), newWidget] };
                        }
                        if (w.widgets) {
                            return { ...w, widgets: addToParent(w.widgets) };
                        }
                        return w;
                    });
                };
                return { ...s, widgets: addToParent(s.widgets) };
            } else {
                return { ...s, widgets: [...s.widgets, newWidget] };
            }
        });

        updateScenes(updatedScenes);
        setSelectedWidgetIds([newWidget.id]);
        setContextMenu(null);
    }, [selectedSceneId, scenes, updateScenes]);

    const handleUpdateWidget = useCallback((widgetId, updates) => {
        const newScenes = scenes.map(s => {
            if (s.id !== selectedSceneId) return s;
            return {
                ...s,
                widgets: updateWidgetInTree(s.widgets, widgetId, (w) => ({ ...w, ...updates }))
            };
        });
        updateScenes(newScenes);
    }, [selectedSceneId, scenes, updateScenes]);

    const handleReparentWidget = useCallback((widgetId, newParentId, targetIndex = null) => {
        if (widgetId === newParentId) return;

        // 1. Find the widget and remove it from old location
        let widgetToMove = null;

        const removeWidget = (widgets) => {
            return widgets.filter(w => {
                if (w.id === widgetId) {
                    widgetToMove = w;
                    return false;
                }
                if (w.widgets) {
                    w.widgets = removeWidget(w.widgets);
                }
                return true;
            });
        };

        const scene = scenes.find(s => s.id === selectedSceneId);
        if (!scene) return;

        const widgetsWithoutMoved = removeWidget(JSON.parse(JSON.stringify(scene.widgets)));

        if (!widgetToMove) return;

        // Circular check: Scan widgetToMove children for newParentId
        const containsParent = (w) => {
            if (w.id === newParentId) return true;
            return w.widgets?.some(containsParent);
        }
        if (newParentId && containsParent(widgetToMove)) {
            console.warn("Cannot move parent into its own child");
            return;
        }

        // 2. Add to new location
        let newWidgets;
        if (!newParentId) {
            // Add to root
            if (targetIndex !== null && targetIndex !== undefined) {
                newWidgets = [...widgetsWithoutMoved];
                newWidgets.splice(targetIndex, 0, widgetToMove);
            } else {
                newWidgets = [...widgetsWithoutMoved, widgetToMove];
            }
        } else {
            // Add to new parent
            const addToParent = (widgets) => {
                return widgets.map(w => {
                    if (w.id === newParentId) {
                        const currentChildren = w.widgets || [];
                        let newChildren = [...currentChildren];
                        if (targetIndex !== null && targetIndex !== undefined) {
                            newChildren.splice(targetIndex, 0, widgetToMove);
                        } else {
                            newChildren.push(widgetToMove);
                        }
                        return { ...w, widgets: newChildren };
                    }
                    if (w.widgets) {
                        return { ...w, widgets: addToParent(w.widgets) };
                    }
                    return w;
                });
            };
            newWidgets = addToParent(widgetsWithoutMoved);
        }

        const newScenes = scenes.map(s =>
            s.id === selectedSceneId ? { ...s, widgets: newWidgets } : s
        );
        updateScenes(newScenes);

    }, [selectedSceneId, scenes, updateScenes]);

    const handleDeleteWidgets = useCallback((widgetIds) => {
        const removeWidgetsRecursive = (widgets) => {
            return widgets.filter(w => {
                if (widgetIds.includes(w.id)) return false;
                if (w.widgets) {
                    w.widgets = removeWidgetsRecursive(w.widgets);
                }
                return true;
            });
        };

        const newScenes = scenes.map(s => {
            if (s.id !== selectedSceneId) return s;
            return {
                ...s,
                widgets: removeWidgetsRecursive(JSON.parse(JSON.stringify(s.widgets))) // Deep copy
            };
        });
        updateScenes(newScenes);
        setSelectedWidgetIds([]);
    }, [selectedSceneId, scenes, updateScenes]);

    const handleDuplicateWidgets = useCallback(() => {
        if (!selectedWidgets.length) return;

        // Helper to add widgets to a parent
        const addWidgetsToParent = (nodes, parentId, widgetsToAdd) => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    return { ...node, widgets: [...(node.widgets || []), ...widgetsToAdd] };
                }
                if (node.widgets) {
                    return { ...node, widgets: addWidgetsToParent(node.widgets, parentId, widgetsToAdd) };
                }
                return node;
            });
        };

        // Find parent of first widget
        const firstWidget = selectedWidgets[0];
        let parentId = null;
        if (selectedScene) {
            const isAtRoot = selectedScene.widgets.some(w => w.id === firstWidget.id);
            if (!isAtRoot) {
                const parent = findParentSceneOrWidget(selectedScene.widgets, firstWidget.id);
                if (parent) parentId = parent.id;
            }
        }

        const newWidgets = selectedWidgets.map(w => ({
            ...w,
            id: generateId(),
            name: `${w.name || w.type} Cópia`,
            x: w.x + 20,
            y: w.y + 20,
            props: { ...w.props }
        }));

        const newScenes = scenes.map(s => {
            if (s.id !== selectedSceneId) return s;

            if (parentId) {
                return { ...s, widgets: addWidgetsToParent(s.widgets, parentId, newWidgets) };
            }

            return { ...s, widgets: [...s.widgets, ...newWidgets] };
        });
        updateScenes(newScenes);
        setSelectedWidgetIds(newWidgets.map(w => w.id));
    }, [selectedWidgets, scenes, selectedSceneId, selectedScene, updateScenes]);

    const handleCopy = useCallback(() => {
        if (!selectedWidgets.length) return;
        // Find parent of first selected widget to paste in same parent
        const firstWidget = selectedWidgets[0];
        let parentId = null;
        if (selectedScene) {
            // Check if widget is at root level
            const isAtRoot = selectedScene.widgets.some(w => w.id === firstWidget.id);
            if (!isAtRoot) {
                // Find parent
                const parent = findParentSceneOrWidget(selectedScene.widgets, firstWidget.id);
                if (parent) parentId = parent.id;
            }
        }
        setClipboard(JSON.stringify({ widgets: selectedWidgets, parentId }));
    }, [selectedWidgets, selectedScene]);

    const handlePaste = useCallback(() => {
        if (!clipboard) return;
        const clipData = JSON.parse(clipboard);
        // Support both old format (array) and new format (object with parentId)
        const widgets = Array.isArray(clipData) ? clipData : clipData.widgets;
        const originalParentId = Array.isArray(clipData) ? null : clipData.parentId;

        const newWidgets = widgets.map(w => ({
            ...w,
            id: generateId(),
            x: w.x + 30,
            y: w.y + 30
        }));

        // Helper to add widgets to a parent
        const addWidgetsToParent = (nodes, parentId, widgetsToAdd) => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    return { ...node, widgets: [...(node.widgets || []), ...widgetsToAdd] };
                }
                if (node.widgets) {
                    return { ...node, widgets: addWidgetsToParent(node.widgets, parentId, widgetsToAdd) };
                }
                return node;
            });
        };

        const newScenes = scenes.map(s => {
            if (s.id !== selectedSceneId) return s;

            // If original parent exists, paste there
            if (originalParentId) {
                return { ...s, widgets: addWidgetsToParent(s.widgets, originalParentId, newWidgets) };
            }

            // Otherwise paste at root
            return { ...s, widgets: [...s.widgets, ...newWidgets] };
        });
        updateScenes(newScenes);
        setSelectedWidgetIds(newWidgets.map(w => w.id));
    }, [clipboard, scenes, selectedSceneId, updateScenes]);


    const handleUsePreset = useCallback((preset, x = 100, y = 100) => {
        if (!selectedScene) return;

        // Deep clone with new IDs and prefab instance flag
        const cloneWidget = (w) => ({
            ...w,
            id: generateId(),
            name: `${w.name || preset.name}`,
            x: w.x !== undefined ? w.x + 20 : x,
            y: w.y !== undefined ? w.y + 20 : y,
            props: { ...w.props },
            isPrefabInstance: true, // Mark as prefab instance for styling
            prefabId: preset.id, // Reference to original prefab
            widgets: w.widgets ? w.widgets.map(cloneWidget) : undefined,
        });

        const newWidgets = preset.widgets.map(cloneWidget);

        const newScenes = scenes.map(s => {
            if (s.id !== selectedSceneId) return s;
            return { ...s, widgets: [...s.widgets, ...newWidgets] };
        });

        updateScenes(newScenes);
        setSelectedWidgetIds(newWidgets.map(w => w.id));
    }, [selectedScene, scenes, selectedSceneId, updateScenes]);

    // Instantiate prefab in hierarchy (from ProjectPanel drop)
    const handleInstantiatePrefab = useCallback((presetId, parentId = null) => {
        if (!selectedScene) return;

        const preset = projectAssets.find(a => a.id === presetId);
        if (!preset) return;

        // Deep clone with new IDs and prefab flag
        const cloneWidget = (w, isFirst = false) => ({
            ...w,
            id: generateId(),
            name: w.name || preset.name,
            x: isFirst ? 100 : w.x,
            y: isFirst ? 100 : w.y,
            props: { ...w.props },
            isPrefabInstance: true,
            prefabId: presetId,
            widgets: w.widgets ? w.widgets.map(child => cloneWidget(child, false)) : undefined,
        });

        const newWidgets = preset.widgets.map((w, i) => cloneWidget(w, i === 0));

        // Add to scene (at root or as child of parentId)
        const addToParent = (widgets) => {
            return widgets.map(w => {
                if (w.id === parentId) {
                    return { ...w, widgets: [...(w.widgets || []), ...newWidgets] };
                }
                if (w.widgets) {
                    return { ...w, widgets: addToParent(w.widgets) };
                }
                return w;
            });
        };

        const newScenes = scenes.map(s => {
            if (s.id !== selectedSceneId) return s;
            if (parentId) {
                return { ...s, widgets: addToParent(s.widgets) };
            }
            return { ...s, widgets: [...s.widgets, ...newWidgets] };
        });

        updateScenes(newScenes);
        setSelectedWidgetIds(newWidgets.map(w => w.id));
    }, [selectedScene, scenes, selectedSceneId, projectAssets, updateScenes]);

    // ========== DRAG & DROP FROM PALETTE ==========
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        // Only set false if we're leaving the scene view, not entering a child
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const presetId = e.dataTransfer.getData('presetId');
        if (presetId) {
            const asset = projectAssets.find(p => p.id === presetId);
            if (asset) {
                // Calculate drop position
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = (e.clientX - rect.left) / zoom - pan.x / zoom;
                const y = (e.clientY - rect.top) / zoom - pan.y / zoom;
                handleUsePreset(asset, x, y);
            }
            return;
        }

        const widgetType = e.dataTransfer.getData('widgetType');
        if (widgetType && WIDGET_TYPES[widgetType]) {
            // Calculate drop position
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = (e.clientX - rect.left) / zoom - pan.x / zoom;
            const y = (e.clientY - rect.top) / zoom - pan.y / zoom;
            handleAddWidget(widgetType, x, y);
        }
    }, [zoom, pan, handleAddWidget, handleUsePreset, projectAssets]);

    // ========== ZOOM ==========
    const handleWheel = useCallback((e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(z => clamp(z + delta, 0.25, 3));
        } else if (e.shiftKey) {
            // Horizontal pan
            setPan(p => ({ x: p.x - e.deltaY, y: p.y }));
        } else {
            // Vertical pan
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    }, []);

    // ========== CANVAS MOUSE HANDLERS ==========
    const getCanvasCoords = useCallback((e) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / zoom,
            y: (e.clientY - rect.top) / zoom
        };
    }, [zoom]);

    const handleCanvasMouseDown = useCallback((e) => {
        if (previewMode !== 'edit') return;

        // Middle mouse for pan
        if (e.button === 1) {
            e.preventDefault();
            setIsDragging(true);
            setDragType('pan');
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            return;
        }

        // Right click - deselect
        if (e.button === 2) {
            return;
        }

        // Left click on empty space - deselect
        if (e.target === canvasRef.current || e.target.classList.contains(styles.canvas)) {
            if (!e.shiftKey && !e.ctrlKey) {
                setSelectedWidgetIds([]);
            }
        }
    }, [previewMode, pan]);

    const handleWidgetMouseDown = useCallback((e, widget) => {
        if (previewMode !== 'edit') return;
        e.stopPropagation();

        // Selection
        if (e.ctrlKey || e.metaKey) {
            // Toggle selection
            setSelectedWidgetIds(prev =>
                prev.includes(widget.id)
                    ? prev.filter(id => id !== widget.id)
                    : [...prev, widget.id]
            );
        } else if (!selectedWidgetIds.includes(widget.id)) {
            setSelectedWidgetIds([widget.id]);
        }

        // Start drag
        setIsDragging(true);
        setDragType('move');
        setDragStart({ x: e.clientX, y: e.clientY });

        // Store starting positions of all selected widgets
        const widgetStarts = {};
        const currentIds = selectedWidgetIds.includes(widget.id)
            ? selectedWidgetIds
            : [widget.id];

        selectedScene?.widgets?.forEach(w => {
            if (currentIds.includes(w.id)) {
                widgetStarts[w.id] = { x: w.x, y: w.y, w: w.w, h: w.h };
            }
        });
        // Also include the clicked widget
        widgetStarts[widget.id] = { x: widget.x, y: widget.y, w: widget.w, h: widget.h };
        setDragWidgetStart(widgetStarts);
    }, [previewMode, selectedWidgetIds, selectedScene]);

    const handleResizeMouseDown = useCallback((e, widget, handle) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragType('resize');
        setResizeHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragWidgetStart({
            [widget.id]: { x: widget.x, y: widget.y, w: widget.w, h: widget.h }
        });
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;

        if (dragType === 'pan') {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        } else if (dragType === 'move') {
            Object.entries(dragWidgetStart).forEach(([widgetId, start]) => {
                const newX = Math.round((start.x + deltaX) / 10) * 10;
                const newY = Math.round((start.y + deltaY) / 10) * 10;
                handleUpdateWidget(widgetId, { x: Math.max(0, newX), y: Math.max(0, newY) });
            });
        } else if (dragType === 'resize') {
            const widgetId = Object.keys(dragWidgetStart)[0];
            const start = dragWidgetStart[widgetId];

            let newX = start.x, newY = start.y, newW = start.w, newH = start.h;

            if (resizeHandle.includes('e')) {
                newW = Math.max(50, start.w + deltaX);
            }
            if (resizeHandle.includes('w')) {
                const dw = Math.min(deltaX, start.w - 50);
                newX = start.x + dw;
                newW = start.w - dw;
            }
            if (resizeHandle.includes('s')) {
                newH = Math.max(30, start.h + deltaY);
            }
            if (resizeHandle.includes('n')) {
                const dh = Math.min(deltaY, start.h - 30);
                newY = start.y + dh;
                newH = start.h - dh;
            }

            handleUpdateWidget(widgetId, {
                x: Math.round(newX / 10) * 10,
                y: Math.round(newY / 10) * 10,
                w: Math.round(newW / 10) * 10,
                h: Math.round(newH / 10) * 10
            });
        }
    }, [isDragging, dragType, dragStart, dragWidgetStart, zoom, handleUpdateWidget, resizeHandle]);

    // ========== MOUSE UP ==========
    const handleMouseUp = useCallback(() => {
        if (isDragging && dragType !== 'pan') {
            pushHistory(scenes);
        }
        setIsDragging(false);
        setDragType(null);
        setResizeHandle(null);
    }, [isDragging, dragType, pushHistory, scenes]);

    // ========== CONTEXT MENU ==========
    const handleContextMenu = useCallback((e, target, data = {}) => {
        e.preventDefault();
        console.log('[DEBUG] Opening Context Menu. Target:', target, 'Data:', data);
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            target,
            data
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    // ========== KEYBOARD SHORTCUTS ==========
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            // Prevent if focused on input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedWidgetIds.length) {
                    handleDeleteWidgets(selectedWidgetIds);
                }
            }

            // Duplicate (Ctrl+D)
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                handleDuplicateWidgets();
            }

            // Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                handleCopy();
            }

            // Paste (Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                handlePaste();
            }

            // Undo (Ctrl+Z)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }

            // Redo (Ctrl+Shift+Z or Ctrl+Y)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }

            // Select All (Ctrl+A)
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                if (selectedScene) {
                    setSelectedWidgetIds(selectedScene.widgets.map(w => w.id));
                }
            }

            // Escape - deselect
            if (e.key === 'Escape') {
                setSelectedWidgetIds([]);
                setContextMenu(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedWidgetIds, handleDeleteWidgets, handleDuplicateWidgets, handleCopy, handlePaste, undo, redo, selectedScene]);

    // Mouse move/up listeners
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Close context menu on click outside
    useEffect(() => {
        if (contextMenu) {
            const handleClick = () => closeContextMenu();
            window.addEventListener('click', handleClick);
            return () => window.removeEventListener('click', handleClick);
        }
    }, [contextMenu, closeContextMenu]);

    // ========== PANEL RESIZE HANDLERS ==========
    const handlePanelResizeStart = useCallback((panel, e) => {
        e.preventDefault();
        setIsResizingPanel(panel);
        setResizeStartX(e.clientX);
        setResizeStartWidth(panelWidths[panel]);
    }, [panelWidths]);

    const handlePanelResizeMove = useCallback((e) => {
        if (!isResizingPanel) return;

        const delta = e.clientX - resizeStartX;
        let newWidth;

        if (isResizingPanel === 'hierarchy') {
            newWidth = Math.max(150, Math.min(400, resizeStartWidth + delta));
        } else if (isResizingPanel === 'inspector') {
            newWidth = Math.max(200, Math.min(450, resizeStartWidth - delta));
        }

        setPanelWidths(prev => ({ ...prev, [isResizingPanel]: newWidth }));
    }, [isResizingPanel, resizeStartX, resizeStartWidth]);

    const handlePanelResizeEnd = useCallback(() => {
        setIsResizingPanel(null);
    }, []);

    // Panel resize mouse listeners
    useEffect(() => {
        if (isResizingPanel) {
            window.addEventListener('mousemove', handlePanelResizeMove);
            window.addEventListener('mouseup', handlePanelResizeEnd);
            return () => {
                window.removeEventListener('mousemove', handlePanelResizeMove);
                window.removeEventListener('mouseup', handlePanelResizeEnd);
            };
        }
    }, [isResizingPanel, handlePanelResizeMove, handlePanelResizeEnd]);

    // ========== PROJECT PANEL (VERTICAL) RESIZE HANDLERS ==========
    const handleProjectResizeStart = useCallback((e) => {
        e.preventDefault();
        setIsResizingProject(true);
        setResizeStartY(e.clientY);
        setResizeStartHeight(projectPanelHeight);
    }, [projectPanelHeight]);

    const handleProjectResizeMove = useCallback((e) => {
        if (!isResizingProject) return;
        const delta = resizeStartY - e.clientY;
        const newHeight = Math.max(80, Math.min(350, resizeStartHeight + delta));
        setProjectPanelHeight(newHeight);
    }, [isResizingProject, resizeStartY, resizeStartHeight]);

    const handleProjectResizeEnd = useCallback(() => {
        setIsResizingProject(false);
    }, []);

    // Project panel resize mouse listeners
    useEffect(() => {
        if (isResizingProject) {
            window.addEventListener('mousemove', handleProjectResizeMove);
            window.addEventListener('mouseup', handleProjectResizeEnd);
            return () => {
                window.removeEventListener('mousemove', handleProjectResizeMove);
                window.removeEventListener('mouseup', handleProjectResizeEnd);
            };
        }
    }, [isResizingProject, handleProjectResizeMove, handleProjectResizeEnd]);



    if (!isOpen) return null;

    // ========== RENDER WIDGET PREVIEW ==========
    const renderWidgetPreview = (widget) => {
        const props = widget.props;

        if (widget.type === 'panel') {
            const bgColor = props.backgroundColor || '#1e293b';
            const bgAlpha = props.backgroundAlpha ?? 0.8;
            const r = parseInt(bgColor.slice(1, 3), 16) || 0;
            const g = parseInt(bgColor.slice(3, 5), 16) || 0;
            const b = parseInt(bgColor.slice(5, 7), 16) || 0;

            let background = props.backgroundGradient
                ? `linear-gradient(${props.gradientDirection || 'to bottom'}, ${bgColor}, ${props.gradientColor || '#8b5cf6'})`
                : `rgba(${r}, ${g}, ${b}, ${bgAlpha})`;

            return (
                <div style={{
                    width: '100%', height: '100%', background,
                    borderRadius: `${props.borderRadiusTL ?? 8}px ${props.borderRadiusTR ?? 8}px ${props.borderRadiusBR ?? 8}px ${props.borderRadiusBL ?? 8}px`,
                    border: `1px solid rgba(255,255,255,${props.borderAlpha ?? 0.1})`,
                    backdropFilter: props.blur ? `blur(${props.blurAmount || 10}px)` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase' }}>Panel</span>
                </div>
            );
        }

        if (widget.type === 'text') {
            return (
                <div style={{
                    fontSize: props.fontSize || 14, fontWeight: props.fontWeight || 'normal',
                    color: props.color || '#fff', textAlign: props.textAlign || 'left',
                    padding: 8, width: '100%'
                }}>
                    {props.text || 'Label'}
                </div>
            );
        }

        if (widget.type === 'image') {
            return (
                <div style={{
                    width: '100%', height: '100%',
                    background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: props.borderRadius || 0
                }}>
                    <ImageIcon size={24} style={{ opacity: 0.4 }} />
                </div>
            );
        }

        // ========== WIDGETS RPG ==========

        // Widget: Atributo
        if (widget.type === 'attributeDisplay') {
            const value = props.mockValue ?? 10;
            const label = props.mockLabel || 'ATR';
            const color = props.accentColor || '#8b5cf6';

            // Calcular modificador usando fórmula D&D por padrão
            let modifier = 0;
            try {
                modifier = Math.floor((value - 10) / 2);
            } catch { modifier = 0; }
            const modSign = modifier >= 0 ? '+' : '';

            if (props.layout === 'circle') {
                return (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                        borderRadius: '50%',
                        border: `2px solid ${color}66`
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{value}</span>
                        {props.showModifier && (
                            <span style={{ fontSize: '0.85rem', color, fontWeight: '600' }}>{modSign}{modifier}</span>
                        )}
                        {props.showLabel && (
                            <span style={{ fontSize: '0.6rem', color: '#888', marginTop: 2 }}>{label}</span>
                        )}
                    </div>
                );
            }

            // Layout card (padrão)
            return (
                <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                    borderRadius: 8,
                    border: `1px solid ${color}44`,
                    padding: 8
                }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>{value}</span>
                    {props.showModifier && (
                        <span style={{ fontSize: '1rem', color, fontWeight: '600', marginTop: 2 }}>{modSign}{modifier}</span>
                    )}
                    {props.showLabel && (
                        <span style={{ fontSize: '0.65rem', color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    )}
                </div>
            );
        }

        // Widget: Perícia
        if (widget.type === 'skillDisplay') {
            const name = props.mockName || 'Perícia';
            const bonus = props.mockBonus ?? 0;
            const proficient = props.mockProficient ?? false;
            const color = props.accentColor || '#22c55e';
            const bonusSign = bonus >= 0 ? '+' : '';

            return (
                <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center',
                    gap: 8, padding: '0 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    {props.showProficiency && (
                        <span style={{
                            fontSize: '0.9rem',
                            color: proficient ? color : '#555'
                        }}>
                            {proficient ? '●' : '○'}
                        </span>
                    )}
                    <span style={{ flex: 1, fontSize: '0.85rem', color: '#ccc' }}>{name}</span>
                    {props.showBonus && (
                        <span style={{
                            fontSize: '0.9rem', fontWeight: '600',
                            color: proficient ? color : '#888'
                        }}>
                            {bonusSign}{bonus}
                        </span>
                    )}
                </div>
            );
        }

        // Widget: Barra de Recurso
        if (widget.type === 'resourceBar') {
            const current = props.mockCurrent ?? 50;
            const max = props.mockMax ?? 100;
            const label = props.mockLabel || 'Recurso';
            const color = props.barColor || '#ef4444';
            const percent = max > 0 ? (current / max) * 100 : 0;

            return (
                <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 8,
                    gap: 4
                }}>
                    {props.showLabel && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Heart size={14} style={{ color }} />
                            <span style={{ fontSize: '0.7rem', color: '#888' }}>{label}</span>
                        </div>
                    )}
                    <div style={{
                        width: '100%', height: props.showLabel ? 'calc(100% - 24px)' : '100%',
                        minHeight: 16,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: props.barStyle === 'smooth' ? 4 : 2,
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                            borderRadius: 'inherit',
                            transition: 'width 0.3s ease'
                        }} />
                        {props.showNumbers && (
                            <span style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#fff',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}>
                                {current}/{max}
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        // Widget: Botão de Dado
        if (widget.type === 'diceButton') {
            const label = props.label || 'Rolar';
            const formula = props.formula || '1d20';
            const icon = props.icon || '🎲';
            const color = props.accentColor || '#f59e0b';

            return (
                <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 4,
                    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    borderRadius: 8,
                    border: `1px solid ${color}66`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>{label}</span>
                    {props.showFormula && (
                        <span style={{ fontSize: '0.65rem', color: '#888' }}>{formula}</span>
                    )}
                </div>
            );
        }

        return (
            <div className={styles.genericWidget}>
                <Box size={20} />
                <span>{widget.type}</span>
            </div>
        );
    };

    const handleWidgetDragOver = (e, targetWidgetId) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedId = e.dataTransfer.getData('widgetId') || window.__draggedWidgetId;
        if (!draggedId || draggedId === targetWidgetId) {
            setDropTarget(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const relativeY = y / height;

        let position = 'inside';
        if (relativeY < 0.25) position = 'before';
        else if (relativeY > 0.75) position = 'after';

        setDropTarget({ id: targetWidgetId, position });
        e.dataTransfer.dropEffect = 'move';
    };

    const handleWidgetDropV2 = (e, targetWidgetId) => {
        e.preventDefault();
        e.stopPropagation();
        setDropTarget(null);

        const draggedId = e.dataTransfer.getData('widgetId') || window.__draggedWidgetId;
        if (!draggedId || draggedId === targetWidgetId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const relativeY = y / height;

        let position = 'inside';
        if (relativeY < 0.25) position = 'before';
        else if (relativeY > 0.75) position = 'after';

        const targetScene = scenes.find(s => s.id === selectedSceneId);
        const parentOfTarget = findParentSceneOrWidget([targetScene], targetWidgetId);

        if (position === 'inside') {
            handleReparentWidget(draggedId, targetWidgetId);
            setExpandedNodes(prev => ({ ...prev, [targetWidgetId]: true }));
        } else {
            if (!parentOfTarget) {
                const index = targetScene.widgets.findIndex(w => w.id === targetWidgetId);
                if (index !== -1) {
                    let newIndex = position === 'before' ? index : index + 1;
                    const siblings = targetScene.widgets;
                    const draggedIndex = siblings.findIndex(w => w.id === draggedId);
                    if (draggedIndex !== -1 && draggedIndex < index) {
                        newIndex--;
                    }
                    handleReparentWidget(draggedId, null, newIndex);
                }
            } else {
                const siblings = parentOfTarget.widgets || [];
                const index = siblings.findIndex(w => w.id === targetWidgetId);
                if (index !== -1) {
                    let newIndex = position === 'before' ? index : index + 1;
                    const draggedIndex = siblings.findIndex(w => w.id === draggedId);
                    if (draggedIndex !== -1 && draggedIndex < index) {
                        newIndex--;
                    }
                    handleReparentWidget(draggedId, parentOfTarget.id, newIndex);
                }
            }
        }
    };

    const handleWidgetDrop = (e, targetWidgetId) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData('widgetId');
        if (!draggedId || draggedId === targetWidgetId) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        // Determine drop position: Top 25% -> Before, Bottom 25% -> After, Middle 50% -> Inside
        const relativeY = y / height;

        let position = 'inside';
        if (relativeY < 0.25) position = 'before';
        else if (relativeY > 0.75) position = 'after';

        // Find current parent of the target widget
        const targetScene = scenes.find(s => s.id === selectedSceneId);
        const parentOfTarget = findParentSceneOrWidget([targetScene], targetWidgetId);

        if (position === 'inside') {
            handleReparentWidget(draggedId, targetWidgetId);
            setExpandedNodes(prev => ({ ...prev, [targetWidgetId]: true }));
        } else {
            // Reorder relative to target
            if (!parentOfTarget) {
                // Target is root widget
                // We don't have a direct list of root widgets easily accessible here without traversing targetScene.widgets
                // But handleReparentWidget handles "parent=null" as root.
                // We need to find the index of targetWidgetId in scene.widgets
                const index = targetScene.widgets.findIndex(w => w.id === targetWidgetId);
                if (index !== -1) {
                    const newIndex = position === 'before' ? index : index + 1;
                    handleReparentWidget(draggedId, null, newIndex); // null for root
                }
            } else {
                // Target is child widget
                const siblings = parentOfTarget.widgets || [];
                const index = siblings.findIndex(w => w.id === targetWidgetId);
                if (index !== -1) {
                    const newIndex = position === 'before' ? index : index + 1;
                    handleReparentWidget(draggedId, parentOfTarget.id, newIndex);
                }
            }
        }
    };

    // Recursive Widget Node Renderer for Hierarchy
    const renderWidgetNode = (widget, depth = 0) => {
        const Config = WIDGET_TYPES[widget.type];
        const IconComp = Config?.icon || Box;
        const isSelected = selectedWidgetIds.includes(widget.id);
        const hasChildren = widget.widgets && widget.widgets.length > 0;

        const isDropTarget = dropTarget?.id === widget.id;
        const dropPos = isDropTarget ? dropTarget.position : null;
        const dropClass = dropPos === 'before' ? 'dropBefore' : dropPos === 'after' ? 'dropAfter' : dropPos === 'inside' ? 'dropInside' : '';

        return (
            <div key={widget.id}>
                <div
                    className={`${styles.nodeRow} ${isSelected ? styles.selected : ''} ${dropClass ? styles[dropClass] : ''}`}
                    style={{ paddingLeft: `${24 + (depth * 12)}px` }}
                    draggable={true}
                    onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData('widgetId', widget.id);
                    }}
                    onDragOver={(e) => handleWidgetDragOver(e, widget.id)}
                    onDrop={(e) => handleWidgetDropV2(e, widget.id)}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (e.ctrlKey || e.metaKey) {
                            setSelectedWidgetIds(prev =>
                                prev.includes(widget.id) ? prev.filter(id => id !== widget.id) : [...prev, widget.id]
                            );
                        } else {
                            setSelectedWidgetIds([widget.id]);
                        }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, 'widget', { widgetId: widget.id })}
                    onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(widget.id); }}
                >
                    {hasChildren ? (
                        <button
                            className={styles.expandBtn}
                            onClick={(e) => { e.stopPropagation(); setExpandedNodes(prev => ({ ...prev, [widget.id]: !prev[widget.id] })); }}
                        >
                            {expandedNodes[widget.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : (
                        <span style={{ width: 14, display: 'inline-block' }}></span>
                    )}

                    <IconComp size={14} />

                    {renamingId === widget.id ? (
                        <input
                            type="text"
                            defaultValue={widget.name || Config?.label || widget.type}
                            autoFocus
                            onBlur={(e) => handleRename(widget.id, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(widget.id, e.target.value);
                                if (e.key === 'Escape') setRenamingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span>{widget.name || Config?.label || widget.type}</span>
                    )}
                </div>
                {hasChildren && expandedNodes[widget.id] && widget.widgets.map(child => renderWidgetNode(child, depth + 1))}
            </div>
        );
    };

    // Recursive Widget Renderer for Canvas
    const renderWidgetOnCanvas = (widget) => {
        const isSelected = selectedWidgetIds.includes(widget.id);

        return (
            <div
                key={widget.id}
                className={`${styles.canvasWidget} ${isSelected ? styles.selected : ''}`}
                style={{
                    left: widget.x,
                    top: widget.y,
                    width: widget.w,
                    height: widget.h,
                    position: 'absolute', // Ensure absolute positioning
                    cursor: isDragging && dragType === 'move' ? 'grabbing' : 'move'
                }}
                onMouseDown={(e) => {
                    e.stopPropagation(); // Stop propagation to prevent selecting parent when clicking child
                    handleWidgetMouseDown(e, widget);
                }}
                onContextMenu={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, 'widget', { widgetId: widget.id });
                }}
            >
                {renderWidgetPreview(widget)}

                {/* Resize Handles - Only if selected and directly editable */}
                {isSelected && previewMode === 'edit' && (
                    <>
                        <div className={`${styles.handle} ${styles.handleN}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 'n')} />
                        <div className={`${styles.handle} ${styles.handleS}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 's')} />
                        <div className={`${styles.handle} ${styles.handleE}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 'e')} />
                        <div className={`${styles.handle} ${styles.handleW}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 'w')} />
                        <div className={`${styles.handle} ${styles.handleNE}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 'ne')} />
                        <div className={`${styles.handle} ${styles.handleNW}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 'nw')} />
                        <div className={`${styles.handle} ${styles.handleSE}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 'se')} />
                        <div className={`${styles.handle} ${styles.handleSW}`} onMouseDown={(e) => handleResizeMouseDown(e, widget, 'sw')} />
                    </>
                )}

                {/* Render Children Recursively */}
                {widget.widgets?.map(child => renderWidgetOnCanvas(child))}
            </div>
        );
    };
    return (
        <div className={styles.modalOverlay} onClick={closeContextMenu}>
            <div className={styles.modalContainer}>
                {/* TOOLBAR */}
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <button className={styles.toolbarBtn} onClick={handleSave} title="Salvar e Fechar">
                            <Save size={18} />
                        </button>
                        <div className={styles.toolbarDivider} />
                        <button className={styles.toolbarBtn} onClick={undo} disabled={historyIndex <= 0} title="Desfazer (Ctrl+Z)">
                            <Undo2 size={18} />
                        </button>
                        <button className={styles.toolbarBtn} onClick={redo} disabled={historyIndex >= history.length - 1} title="Refazer (Ctrl+Y)">
                            <Redo2 size={18} />
                        </button>
                        <div className={styles.toolbarDivider} />
                        <button
                            className={`${styles.toolbarBtn} ${tool === 'select' ? styles.active : ''}`}
                            onClick={() => setTool('select')}
                            title="Selecionar (V)"
                        >
                            <MousePointer size={18} />
                        </button>
                    </div>

                    <div className={styles.toolbarCenter}>
                        <span className={styles.toolbarTitle}>Layout Editor</span>
                    </div>

                    <div className={styles.toolbarRight}>
                        <button
                            className={`${styles.toolbarBtn} ${showGrid ? styles.active : ''}`}
                            onClick={() => setShowGrid(!showGrid)}
                            title="Grid"
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <div className={styles.toolbarDivider} />
                        <button className={styles.toolbarBtn} onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom In">
                            <ZoomIn size={18} />
                        </button>
                        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
                        <button className={styles.toolbarBtn} onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} title="Zoom Out">
                            <ZoomOut size={18} />
                        </button>
                        <button className={styles.toolbarBtn} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset View">
                            <Square size={18} />
                        </button>
                        <div className={styles.toolbarDivider} />
                        <button className={styles.closeBtn} onClick={onClose} title="Fechar">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className={styles.mainContent}>
                    {/* HIERARCHY */}
                    <HierarchyPanel
                        scenes={scenes}
                        selectedSceneId={selectedSceneId}
                        selectedWidgetIds={selectedWidgetIds}
                        expandedNodes={expandedNodes}
                        onSelectScene={(id) => {
                            setSelectedSceneId(id);
                            setSelectedWidgetIds([]);
                        }}
                        onSelectWidgets={setSelectedWidgetIds}
                        onExpandNode={(id) => setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }))}
                        onAddScene={handleAddScene}
                        onDeleteScene={handleDeleteScene}
                        onRenameScene={(id, name) => {
                            const updatedScenes = scenes.map(s => s.id === id ? { ...s, name } : s);
                            updateScenes(updatedScenes);
                        }}
                        onAddWidget={(type, sceneId, parentId) => {
                            handleAddWidget(type, 100, 100, sceneId || selectedSceneId, parentId);
                        }}
                        onDeleteWidget={(id) => handleDeleteWidgets([id])}
                        onRenameWidget={(id, name) => handleUpdateWidget(id, { name })}
                        onReparentWidget={handleReparentWidget}
                        onDuplicateWidget={() => handleDuplicateWidgets()}
                        onInstantiatePrefab={handleInstantiatePrefab}
                        style={{ width: panelWidths.hierarchy, minWidth: panelWidths.hierarchy }}
                    />

                    {/* HIERARCHY RESIZE HANDLE */}
                    <div
                        className={styles.panelResizeHandle}
                        onMouseDown={(e) => handlePanelResizeStart('hierarchy', e)}
                    />

                    {/* SCENE VIEW */}
                    <SceneViewPanel
                        widgets={selectedScene?.widgets || []}
                        hasSelectedScene={!!selectedSceneId}
                        selectedWidgetIds={selectedWidgetIds}
                        zoom={zoom}
                        pan={pan}
                        showGrid={showGrid}
                        previewMode={previewMode}
                        isDragOver={isDragOver}
                        onSelectWidgets={setSelectedWidgetIds}
                        onUpdateWidget={handleUpdateWidget}
                        onZoomChange={setZoom}
                        onPanChange={setPan}
                        onToggleGrid={() => setShowGrid(!showGrid)}
                        onContextMenu={handleContextMenu}
                        onAddScene={handleAddScene}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{ flex: 1 }}
                    />

                    {/* INSPECTOR RESIZE HANDLE */}
                    <div
                        className={styles.panelResizeHandle}
                        onMouseDown={(e) => handlePanelResizeStart('inspector', e)}
                    />

                    {/* INSPECTOR */}
                    <InspectorPanel
                        selectedWidget={selectedWidget}
                        selectedWidgetCount={selectedWidgetIds.length}
                        onUpdateWidget={handleUpdateWidget}
                        fields={fields}
                        events={events}
                        style={{ width: panelWidths.inspector, minWidth: panelWidths.inspector }}
                    />
                </div>

                {/* PROJECT PANEL RESIZE HANDLE */}
                <div
                    className={styles.projectResizeHandle}
                    onMouseDown={handleProjectResizeStart}
                />

                {/* PROJECT PANEL */}
                <ProjectPanel
                    assets={projectAssets}
                    folders={projectFolders}
                    selectedWidgets={selectedWidgets}
                    onAssetsChange={setProjectAssets}
                    onFoldersChange={setProjectFolders}
                    onUseAsset={(asset) => handleUsePreset(asset, 100, 100)}
                    onWidgetDrop={(widgetId) => findWidgetById(selectedScene?.widgets || [], widgetId)}
                    style={{ height: projectPanelHeight }}
                />

                {/* CONTEXT MENU */}
                {contextMenu && (
                    <div
                        className={styles.contextMenu}
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(contextMenu.target === 'hierarchy') && (
                            <>
                                <button onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddScene();
                                    closeContextMenu();
                                }}>
                                    <Plus size={14} /> Add Scene
                                </button>
                            </>
                        )}
                        {(contextMenu.target === 'scene' || contextMenu.target === 'canvas') && (
                            <>
                                <div className={styles.contextMenuLabel}>Create</div>
                                <button onMouseDown={(e) => { e.preventDefault(); handleAddWidget('canvas', 0, 0, contextMenu.data?.sceneId); closeContextMenu(); }}>
                                    <Monitor size={14} /> Canvas
                                </button>
                                <div className={styles.contextMenuDivider} />
                                <div className={styles.contextMenuLabel}>UI</div>
                                <button onMouseDown={(e) => { e.preventDefault(); handleAddWidget('panel', 0, 0, contextMenu.data?.sceneId); closeContextMenu(); }}>
                                    <Box size={14} /> Panel
                                </button>
                                <button onMouseDown={(e) => { e.preventDefault(); handleAddWidget('text', 0, 0, contextMenu.data?.sceneId); closeContextMenu(); }}>
                                    <Type size={14} /> Text
                                </button>
                                <button onMouseDown={(e) => { e.preventDefault(); handleAddWidget('image', 0, 0, contextMenu.data?.sceneId); closeContextMenu(); }}>
                                    <ImageIcon size={14} /> Image
                                </button>
                                <div className={styles.contextMenuDivider} />
                                <button onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAddScene();
                                    closeContextMenu();
                                }}>
                                    <Plus size={14} /> Add Scene
                                </button>
                                <button onMouseDown={(e) => {
                                    e.preventDefault();
                                    setRenamingId(contextMenu.data?.sceneId);
                                    closeContextMenu();
                                }}>
                                    <Edit2 size={14} /> Rename Scene
                                </button>
                                <button className={styles.danger} onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleDeleteScene(contextMenu.data?.sceneId);
                                    closeContextMenu();
                                }}>
                                    <Trash2 size={14} /> Delete Scene
                                </button>
                            </>
                        )}
                        {contextMenu.target === 'widget' && (
                            <>
                                <button onMouseDown={() => { handleCopy(); closeContextMenu(); }}><Copy size={14} /> Copiar</button>
                                <button onMouseDown={() => { e.preventDefault(); setRenamingId(contextMenu.data?.widgetId); closeContextMenu(); }}><Edit2 size={14} /> Renomear</button>
                                <button onMouseDown={() => { handleDuplicateWidgets(); closeContextMenu(); }}><Clipboard size={14} /> Duplicar</button>
                                <div className={styles.contextMenuDivider} />
                                <button onMouseDown={() => { handleDeleteWidgets([contextMenu.data.widgetId]); closeContextMenu(); }} className={styles.danger}>
                                    <Trash2 size={14} /> Deletar
                                </button>
                            </>
                        )}
                        {clipboard && contextMenu.target !== 'widget' && (
                            <>
                                <div className={styles.contextMenuDivider} />
                                <button onMouseDown={() => { handlePaste(); closeContextMenu(); }}><Clipboard size={14} /> Colar</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LayoutEditorModal;
