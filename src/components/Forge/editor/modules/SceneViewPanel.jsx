import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Box, Type, Image as ImageIcon, Monitor, Layers, Folder,
    Plus, Package, ZoomIn, ZoomOut, Grid3X3, Maximize2,
    Eye, MousePointer, ScrollText,
    // Ícones para widgets RPG
    Gauge, Target, Heart, Dices
} from 'lucide-react';
import styles from './SceneViewPanel.module.css';

/**
 * SceneViewPanel - Unity-style Scene View / Canvas
 * 
 * Features:
 * - Infinite canvas with zoom/pan
 * - Grid overlay
 * - Widget rendering with selection
 * - Drag to move widgets
 * - Resize handles
 * - Context menu
 */

// Widget type icons for preview
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

const GRID_SIZE = 10;

export function SceneViewPanel({
    widgets = [],
    selectedWidgetIds = [],
    zoom = 1,
    pan = { x: 0, y: 0 },
    showGrid = true,
    previewMode = 'edit',
    isDragOver = false,
    hasSelectedScene = false,
    onSelectWidgets,
    onUpdateWidget,
    onZoomChange,
    onPanChange,
    onToggleGrid,
    onContextMenu,
    onAddScene,
    onDragOver,
    onDragLeave,
    onDrop,
    style = {},
}) {
    // Local state
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState(null); // 'move' | 'resize' | 'pan'
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragWidgetStart, setDragWidgetStart] = useState({});
    const [resizeHandle, setResizeHandle] = useState(null);

    // Refs
    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // Clamp helper
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const snapToGrid = (val) => Math.round(val / GRID_SIZE) * GRID_SIZE;

    // Hex to RGBA helper
    const hexToRgba = (hex, alpha) => {
        let r = 0, g = 0, b = 0;
        if (hex.startsWith('#')) {
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
            }
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // === ZOOM with useEffect to bypass passive event listener ===
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            // Se o evento vier de um ScrollView, permite o scroll nativo e ignora o zoom
            if (e.target.closest('[data-scroll-view="true"]')) return;

            e.preventDefault();

            if (e.shiftKey) {
                // Shift + scroll = horizontal pan
                onPanChange?.({ x: pan.x - e.deltaY, y: pan.y });
            } else if (e.ctrlKey || e.metaKey) {
                // Ctrl + scroll = vertical pan
                onPanChange?.({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
            } else {
                // Normal scroll = zoom centered on mouse position
                const rect = container.getBoundingClientRect();

                // Mouse position relative to container
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Calculate new zoom
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                const newZoom = clamp(zoom + delta, 0.25, 3);

                // The point under the mouse in world coordinates before zoom
                const worldX = (mouseX - pan.x) / zoom;
                const worldY = (mouseY - pan.y) / zoom;

                // Adjust pan so the same world point stays under the mouse after zoom
                const newPanX = mouseX - worldX * newZoom;
                const newPanY = mouseY - worldY * newZoom;

                onZoomChange?.(newZoom);
                onPanChange?.({ x: newPanX, y: newPanY });
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [zoom, pan, onZoomChange, onPanChange]);

    // === MOUSE HANDLERS ===
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

        // Right click - don't deselect
        if (e.button === 2) return;

        // Left click on empty space - deselect
        if (e.target === canvasRef.current || e.target.classList.contains(styles.canvas)) {
            onSelectWidgets?.([]);
        }
    }, [previewMode, pan, onSelectWidgets]);

    const handleWidgetMouseDown = useCallback((e, widget) => {
        if (previewMode !== 'edit') return;

        // Only left click moves widgets
        if (e.button !== 0) return;

        e.stopPropagation();

        // Selection
        if (e.ctrlKey || e.metaKey) {
            const newSelection = selectedWidgetIds.includes(widget.id)
                ? selectedWidgetIds.filter(id => id !== widget.id)
                : [...selectedWidgetIds, widget.id];
            onSelectWidgets?.(newSelection);
        } else if (!selectedWidgetIds.includes(widget.id)) {
            onSelectWidgets?.([widget.id]);
        }

        // Start drag
        setIsDragging(true);
        setDragType('move');
        setDragStart({ x: e.clientX, y: e.clientY });

        // Store starting positions
        const widgetStarts = {};
        const currentIds = selectedWidgetIds.includes(widget.id)
            ? selectedWidgetIds
            : [widget.id];

        // Find widgets from the flat list
        const findWidget = (id) => {
            const findInWidgets = (list) => {
                for (const w of list) {
                    if (w.id === id) return w;
                    if (w.widgets) {
                        const found = findInWidgets(w.widgets);
                        if (found) return found;
                    }
                }
                return null;
            };
            return findInWidgets(widgets);
        };

        currentIds.forEach(id => {
            const w = findWidget(id);
            if (w) widgetStarts[w.id] = { x: w.x, y: w.y, w: w.w, h: w.h };
        });
        widgetStarts[widget.id] = { x: widget.x, y: widget.y, w: widget.w, h: widget.h };
        setDragWidgetStart(widgetStarts);
    }, [previewMode, selectedWidgetIds, widgets, onSelectWidgets]);

    const handleResizeMouseDown = useCallback((e, widget, handle) => {
        if (previewMode !== 'edit') return;
        e.stopPropagation();
        setIsDragging(true);
        setDragType('resize');
        setResizeHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragWidgetStart({
            [widget.id]: { x: widget.x, y: widget.y, w: widget.w, h: widget.h }
        });
    }, [previewMode]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;

        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;

        if (dragType === 'pan') {
            onPanChange?.({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        } else if (dragType === 'move') {
            Object.entries(dragWidgetStart).forEach(([widgetId, start]) => {
                const newX = snapToGrid(Math.max(0, start.x + deltaX));
                const newY = snapToGrid(Math.max(0, start.y + deltaY));
                onUpdateWidget?.(widgetId, { x: newX, y: newY });
            });
        } else if (dragType === 'resize') {
            const widgetId = Object.keys(dragWidgetStart)[0];
            const start = dragWidgetStart[widgetId];

            let newX = start.x, newY = start.y, newW = start.w, newH = start.h;

            if (resizeHandle.includes('e')) newW = Math.max(50, start.w + deltaX);
            if (resizeHandle.includes('w')) {
                const dw = Math.min(deltaX, start.w - 50);
                newX = start.x + dw;
                newW = start.w - dw;
            }
            if (resizeHandle.includes('s')) newH = Math.max(30, start.h + deltaY);
            if (resizeHandle.includes('n')) {
                const dh = Math.min(deltaY, start.h - 30);
                newY = start.y + dh;
                newH = start.h - dh;
            }

            onUpdateWidget?.(widgetId, {
                x: snapToGrid(newX),
                y: snapToGrid(newY),
                w: snapToGrid(newW),
                h: snapToGrid(newH)
            });
        }
    }, [isDragging, dragType, dragStart, dragWidgetStart, zoom, resizeHandle, onPanChange, onUpdateWidget]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setDragType(null);
        setResizeHandle(null);
    }, []);

    // Global mouse listeners
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

    // === RENDER WIDGET PREVIEW ===
    const renderWidgetPreview = (widget) => {
        const props = widget.props || {};

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
                    border: `${props.borderWidth ?? 1}px solid ${hexToRgba(props.borderColor || '#ffffff', props.borderAlpha ?? 0.1)}`,
                    backdropFilter: props.blur ? `blur(${props.blurAmount || 10}px)` : 'none'
                }} />
            );
        }

        if (widget.type === 'text') {
            return (
                <div style={{
                    fontSize: props.fontSize || 14,
                    fontWeight: props.fontWeight || 'normal',
                    fontFamily: props.fontFamily || 'Inter, system-ui, sans-serif',
                    color: props.color || '#fff',
                    textAlign: props.textAlign || 'left',
                    padding: 8,
                    width: '100%'
                }}>
                    {props.text || 'Label'}
                </div>
            );
        }

        if (widget.type === 'image') {
            return (
                <div style={{
                    width: '100%', height: '100%',
                    background: '#333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: props.borderRadius || 0
                }}>
                    <ImageIcon size={24} style={{ opacity: 0.4 }} />
                </div>
            );
        }

        // Container - transparent with dashed border (like empty GameObject)
        if (widget.type === 'container') {
            return (
                <div style={{
                    width: '100%', height: '100%',
                    border: '2px dashed rgba(139, 92, 246, 0.4)',
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Folder size={20} style={{ opacity: 0.3, color: '#8b5cf6' }} />
                </div>
            );
        }

        // ScrollView - dashed border with scroll icon
        // ScrollView - apenas visual (wrapper transparente para não bloquear filhos)
        // ScrollView - apenas visual (wrapper transparente para não bloquear filhos)
        if (widget.type === 'scrollView') {
            // Se tiver conteúdo, não mostra nada visual (fica transparente)
            if (widget.widgets && widget.widgets.length > 0) return null;

            return (
                <div style={{
                    width: '100%', height: '100%',
                    border: '1px dashed rgba(59, 130, 246, 0.3)',
                    borderRadius: 4,
                    pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <ScrollText size={20} style={{ opacity: 0.3, color: '#3b82f6' }} />
                </div>
            );
        }

        // ========== WIDGETS RPG ==========

        // Widget: Atributo
        if (widget.type === 'attributeDisplay') {
            const value = props.mockValue ?? 10;
            const label = props.mockLabel || 'ATR';
            const color = props.accentColor || '#8b5cf6';

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

        // Generic widget
        const IconComp = WIDGET_ICONS[widget.type] || Box;
        return (
            <div className={styles.genericWidget}>
                <IconComp size={20} />
                <span>{widget.type}</span>
            </div>
        );
    };

    // === RENDER WIDGET ON CANVAS ===
    const renderWidgetOnCanvas = (widget, styleOverride = null) => {
        const isSelected = selectedWidgetIds.includes(widget.id);

        const baseStyle = {
            left: widget.x,
            top: widget.y,
            width: widget.w,
            height: widget.h,
            cursor: isDragging && dragType === 'move' ? 'grabbing' : 'move'
        };

        // Merge styleOverride. Se styleOverride tiver 'position: relative', removemos left/top
        const finalStyle = styleOverride ? {
            ...baseStyle,
            ...styleOverride,
            // Se o override define posição relativa/flex, removemos coordenadas absolutas para limpar
            left: styleOverride.position === 'relative' ? undefined : (styleOverride.left ?? baseStyle.left),
            top: styleOverride.position === 'relative' ? undefined : (styleOverride.top ?? baseStyle.top),
        } : baseStyle;

        return (
            <div
                key={widget.id}
                className={`${styles.widget} ${isSelected ? styles.selected : ''}`}
                style={finalStyle}
                onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
                onContextMenu={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onContextMenu?.(e, 'widget', { widget });
                }}
            >
                {renderWidgetPreview(widget)}

                {/* Resize Handles */}
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

                {/* Render Children - with Layout Group & ScrollView support */}
                {widget.widgets && widget.widgets.length > 0 && (() => {
                    const layoutGroup = widget.components?.find(c => c.type === 'layoutGroup');
                    const isScrollView = widget.type === 'scrollView';

                    // Configurações de Scroll
                    const sProps = widget.props || {};
                    // Tenta ler de props, fallback para raiz
                    const scrollDir = sProps.scrollDirection || widget.scrollDirection || 'vertical';
                    const showScrollbar = sProps.showScrollbar ?? true;
                    const scrollbarColor = sProps.scrollbarColor || '#ffffff';
                    const scrollbarAlpha = sProps.scrollbarAlpha ?? 0.3;

                    const scrollStyle = {};
                    if (isScrollView) {
                        scrollStyle.overflowX = (scrollDir === 'horizontal' || scrollDir === 'both') ? 'auto' : 'hidden';
                        scrollStyle.overflowY = (scrollDir === 'vertical' || scrollDir === 'both') ? 'auto' : 'hidden';

                        // Custom CSS variables for scrollbar (used by .customScroll class)
                        if (showScrollbar) {
                            scrollStyle['--sb-thumb-color'] = hexToRgba(scrollbarColor, scrollbarAlpha);
                            scrollStyle['--sb-display'] = 'block';
                        } else {
                            scrollStyle['--sb-display'] = 'none';
                        }
                    }

                    if (layoutGroup) {
                        const cfg = layoutGroup.config;
                        const flexDirection = cfg.direction === 'horizontal'
                            ? (cfg.reverseOrder ? 'row-reverse' : 'row')
                            : (cfg.reverseOrder ? 'column-reverse' : 'column');

                        return (
                            <div
                                className={isScrollView ? styles.customScroll : ''}
                                data-scroll-view={isScrollView ? "true" : undefined}
                                style={{
                                    position: 'absolute',
                                    top: cfg.paddingTop,
                                    left: cfg.paddingLeft,
                                    right: cfg.paddingRight,
                                    bottom: cfg.paddingBottom,
                                    display: 'flex',
                                    flexDirection,
                                    gap: cfg.spacing,
                                    alignItems: cfg.alignItems === 'start' ? 'flex-start'
                                        : cfg.alignItems === 'end' ? 'flex-end'
                                            : cfg.alignItems,
                                    justifyContent: cfg.justifyContent === 'start' ? 'flex-start'
                                        : cfg.justifyContent === 'end' ? 'flex-end'
                                            : cfg.justifyContent,
                                    overflowX: isScrollView ? scrollStyle.overflowX : 'visible',
                                    overflowY: isScrollView ? scrollStyle.overflowY : 'visible',
                                    pointerEvents: isScrollView ? 'auto' : 'none', // Container não intercepta cliques (exceto scroll)
                                    ...scrollStyle
                                }}>
                                {widget.widgets.map(child => {
                                    const isChildSelected = selectedWidgetIds.includes(child.id);
                                    const childStyle = {
                                        position: 'relative',
                                        flexShrink: 0,
                                        flexGrow: 0,
                                        pointerEvents: 'auto', // Filhos recebem cliques
                                    };

                                    // childControlWidth: filhos ocupam toda a largura disponível
                                    if (cfg.childControlWidth) {
                                        childStyle.width = '100%';
                                        childStyle.minWidth = 0;
                                        if (cfg.direction === 'horizontal') {
                                            childStyle.flex = 1;
                                            childStyle.width = undefined;
                                        }
                                    } else {
                                        childStyle.width = child.w;
                                    }

                                    // childControlHeight: filhos ocupam toda a altura disponível
                                    if (cfg.childControlHeight) {
                                        childStyle.height = '100%';
                                        childStyle.minHeight = 0;
                                        if (cfg.direction === 'vertical') {
                                            childStyle.flex = 1;
                                            childStyle.height = undefined;
                                        }
                                    } else {
                                        childStyle.height = child.h;
                                    }

                                    return renderWidgetOnCanvas(child, childStyle);
                                })}
                            </div>
                        );
                    }

                    // No Layout Group
                    // Se for ScrollView, criar wrapper com scroll
                    if (isScrollView) {
                        return (
                            <div
                                className={styles.customScroll}
                                data-scroll-view="true"
                                style={{
                                    width: '100%', height: '100%',
                                    position: 'absolute', top: 0, left: 0,
                                    overflowX: scrollStyle.overflowX,
                                    overflowY: scrollStyle.overflowY,
                                    pointerEvents: 'auto',
                                    ...scrollStyle
                                }}
                            >
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    {widget.widgets.map(child => renderWidgetOnCanvas(child))}
                                </div>
                            </div>
                        );
                    }

                    // No ScrollView, No Layout Group - render absolute children
                    return widget.widgets.map(child => renderWidgetOnCanvas(child));
                })()}
            </div>
        );
    };

    // === ZOOM CONTROLS ===
    const handleZoomIn = () => onZoomChange?.(clamp(zoom + 0.25, 0.25, 3));
    const handleZoomOut = () => onZoomChange?.(clamp(zoom - 0.25, 0.25, 3));
    const handleResetView = () => {
        onZoomChange?.(1);
        onPanChange?.({ x: 0, y: 0 });
    };

    return (
        <div className={styles.sceneView} ref={containerRef} style={style}>
            {/* Header / Toolbar */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.title}>Scene</span>
                </div>
                <div className={styles.headerRight}>
                    <button
                        className={`${styles.headerBtn} ${showGrid ? styles.active : ''}`}
                        onClick={() => onToggleGrid?.()}
                        title="Toggle Grid"
                    >
                        <Grid3X3 size={14} />
                    </button>
                    <div className={styles.divider} />
                    <button className={styles.headerBtn} onClick={handleZoomOut} title="Zoom Out">
                        <ZoomOut size={14} />
                    </button>
                    <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
                    <button className={styles.headerBtn} onClick={handleZoomIn} title="Zoom In">
                        <ZoomIn size={14} />
                    </button>
                    <button className={styles.headerBtn} onClick={handleResetView} title="Reset View">
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className={`${styles.canvasContainer} ${isDragOver ? styles.dragOver : ''}`}
                onMouseDown={handleCanvasMouseDown}
                onContextMenu={(e) => {
                    if (widgets.length === 0) return;
                    e.preventDefault();
                    onContextMenu?.(e, 'canvas', getCanvasCoords(e));
                }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {(!hasSelectedScene && widgets.length === 0) ? (
                    <div className={styles.empty}>
                        <Package size={48} />
                        <span>No Scenes</span>
                        <p>Create a scene to start building your layout</p>
                        <button onClick={() => onAddScene?.()}>
                            <Plus size={14} /> Create Scene
                        </button>
                    </div>
                ) : widgets.length === 0 ? (
                    <div
                        ref={canvasRef}
                        className={`${styles.canvas} ${showGrid ? styles.showGrid : ''}`}
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            cursor: 'default'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.3)',
                            pointerEvents: 'none'
                        }}>
                            <Package size={32} style={{ marginBottom: 8 }} />
                            <p style={{ margin: 0, fontSize: 12 }}>Add widgets from the hierarchy</p>
                        </div>
                    </div>
                ) : (
                    <div
                        ref={canvasRef}
                        className={`${styles.canvas} ${showGrid ? styles.showGrid : ''}`}
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            cursor: isDragging && dragType === 'pan' ? 'grabbing' : 'default'
                        }}
                    >
                        {widgets.map(widget => renderWidgetOnCanvas(widget))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SceneViewPanel;
