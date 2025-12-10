import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    Folder, FolderOpen, Package, Grid, List, Search, Plus, ChevronRight,
    Trash2, Edit3, Copy, FolderPlus, Save, MoreHorizontal
} from 'lucide-react';
import styles from './ProjectPanel.module.css';

/**
 * ProjectPanel - Unity-style Project/Assets Panel
 * 
 * Features:
 * - Folder tree navigation (left sidebar)
 * - Asset grid/list view (right area)
 * - Drag and drop assets to canvas
 * - Create/rename/delete folders and assets
 * - Search functionality
 */

// Default folder structure
const DEFAULT_FOLDERS = [
    { id: 'root', name: 'Project', parentId: null },
    { id: 'presets', name: 'Presets', parentId: 'root' },
    { id: 'components', name: 'Components', parentId: 'root' },
    { id: 'templates', name: 'Templates', parentId: 'root' },
];

const generateId = () => `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function ProjectPanel({
    assets = [],
    folders = DEFAULT_FOLDERS,
    selectedWidgets = [],
    onAssetsChange,
    onFoldersChange,
    onUseAsset,
    onDragStart,
    onWidgetDrop, // Called when a widget is dropped from hierarchy
    style = {},
}) {
    // State
    const [selectedFolderId, setSelectedFolderId] = useState('presets');
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [renamingId, setRenamingId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [isDragOverPanel, setIsDragOverPanel] = useState(false);

    const renameInputRef = useRef(null);

    // Focus rename input when active
    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        if (contextMenu) {
            window.addEventListener('click', handleClick);
            return () => window.removeEventListener('click', handleClick);
        }
    }, [contextMenu]);

    // Get assets in current folder
    const currentAssets = useMemo(() => {
        let filtered = assets.filter(a => a.folderId === selectedFolderId);
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a => a.name.toLowerCase().includes(query));
        }
        return filtered;
    }, [assets, selectedFolderId, searchQuery]);

    // Get child folders
    const childFolders = useMemo(() => {
        return folders.filter(f => f.parentId === selectedFolderId);
    }, [folders, selectedFolderId]);

    // Get folder path for breadcrumb
    const folderPath = useMemo(() => {
        const path = [];
        let current = folders.find(f => f.id === selectedFolderId);
        while (current) {
            path.unshift(current);
            current = folders.find(f => f.id === current.parentId);
        }
        return path;
    }, [folders, selectedFolderId]);

    // Count assets in folder
    const getAssetCount = useCallback((folderId) => {
        return assets.filter(a => a.folderId === folderId).length;
    }, [assets]);

    // === HANDLERS ===

    const handleSaveAsset = useCallback(() => {
        if (selectedWidgets.length === 0) return;

        const newAsset = {
            id: generateId(),
            name: `Preset ${assets.length + 1}`,
            type: 'preset',
            folderId: selectedFolderId,
            widgets: JSON.parse(JSON.stringify(selectedWidgets)),
            createdAt: new Date().toISOString(),
        };

        onAssetsChange?.([...assets, newAsset]);
        setSelectedAssetId(newAsset.id);
        setRenamingId(newAsset.id);
    }, [selectedWidgets, assets, selectedFolderId, onAssetsChange]);

    const handleCreateFolder = useCallback(() => {
        const newFolder = {
            id: generateId(),
            name: `Nova Pasta`,
            parentId: selectedFolderId,
        };
        onFoldersChange?.([...folders, newFolder]);
        setRenamingId(newFolder.id);
    }, [folders, selectedFolderId, onFoldersChange]);

    const handleRename = useCallback((id, newName, isFolder = false) => {
        if (!newName.trim()) {
            setRenamingId(null);
            return;
        }

        if (isFolder) {
            const updated = folders.map(f =>
                f.id === id ? { ...f, name: newName.trim() } : f
            );
            onFoldersChange?.(updated);
        } else {
            const updated = assets.map(a =>
                a.id === id ? { ...a, name: newName.trim() } : a
            );
            onAssetsChange?.(updated);
        }
        setRenamingId(null);
    }, [folders, assets, onFoldersChange, onAssetsChange]);

    const handleDelete = useCallback((id, isFolder = false) => {
        if (isFolder) {
            // Delete folder and all assets inside
            const updated = folders.filter(f => f.id !== id);
            onFoldersChange?.(updated);
            const updatedAssets = assets.filter(a => a.folderId !== id);
            onAssetsChange?.(updatedAssets);
        } else {
            const updated = assets.filter(a => a.id !== id);
            onAssetsChange?.(updated);
        }
        setContextMenu(null);
    }, [folders, assets, onFoldersChange, onAssetsChange]);

    const handleDuplicate = useCallback((assetId) => {
        const asset = assets.find(a => a.id === assetId);
        if (!asset) return;

        const newAsset = {
            ...asset,
            id: generateId(),
            name: `${asset.name} (Copy)`,
            createdAt: new Date().toISOString(),
        };
        onAssetsChange?.([...assets, newAsset]);
        setContextMenu(null);
    }, [assets, onAssetsChange]);

    const handleAssetDragStart = useCallback((e, asset) => {
        // Use lowercase type as browsers normalize to lowercase
        e.dataTransfer.setData('text/x-preset-id', asset.id);
        e.dataTransfer.setData('presetId', asset.id); // Legacy support
        e.dataTransfer.effectAllowed = 'copyMove';
        onDragStart?.(asset);
    }, [onDragStart]);

    const handleContextMenu = useCallback((e, type, data) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type,
            data,
        });
    }, []);

    // === DROP FROM HIERARCHY ===
    const handlePanelDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOverPanel(true);
    }, []);

    const handlePanelDragLeave = useCallback((e) => {
        // Only set false if leaving the panel entirely
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDragOverPanel(false);
        }
    }, []);

    const handlePanelDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverPanel(false);

        // Try to get widget data (from Hierarchy)
        const widgetId = e.dataTransfer.getData('widgetId');
        if (widgetId && onWidgetDrop) {
            const widgetData = onWidgetDrop(widgetId);
            if (widgetData) {
                const newAsset = {
                    id: generateId(),
                    name: widgetData.name || `${widgetData.type} Prefab`,
                    type: 'preset',
                    folderId: selectedFolderId,
                    widgets: [JSON.parse(JSON.stringify(widgetData))],
                    createdAt: new Date().toISOString(),
                };
                onAssetsChange?.([...assets, newAsset]);
                setSelectedAssetId(newAsset.id);
                setRenamingId(newAsset.id);
                return;
            }
        }

        // Fallback: try JSON format
        try {
            const jsonData = e.dataTransfer.getData('text/plain');
            if (!jsonData) return;

            const parsed = JSON.parse(jsonData);
            if (parsed.id && parsed.type && onWidgetDrop) {
                const widgetData = onWidgetDrop(parsed.id);
                if (widgetData) {
                    const newAsset = {
                        id: generateId(),
                        name: widgetData.name || `${widgetData.type} Prefab`,
                        type: 'preset',
                        folderId: selectedFolderId,
                        widgets: [JSON.parse(JSON.stringify(widgetData))],
                        createdAt: new Date().toISOString(),
                    };
                    onAssetsChange?.([...assets, newAsset]);
                    setSelectedAssetId(newAsset.id);
                    setRenamingId(newAsset.id);
                }
            }
        } catch (err) {
            // Not valid JSON, ignore
        }
    }, [selectedFolderId, assets, onAssetsChange, onWidgetDrop]);

    // === RENDER ===

    const renderFolderTree = () => {
        const rootFolders = folders.filter(f => f.parentId === 'root');

        return (
            <div className={styles.folderTree}>
                {rootFolders.map(folder => (
                    <div
                        key={folder.id}
                        className={`${styles.folderItem} ${selectedFolderId === folder.id ? styles.selected : ''}`}
                        onClick={() => setSelectedFolderId(folder.id)}
                        onContextMenu={(e) => handleContextMenu(e, 'folder', { folderId: folder.id })}
                    >
                        <Folder size={14} className={styles.folderIcon} />
                        <span className={styles.folderName}>{folder.name}</span>
                        <span className={styles.folderCount}>{getAssetCount(folder.id)}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderBreadcrumb = () => (
        <div className={styles.breadcrumb}>
            {folderPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    {index > 0 && <ChevronRight size={12} className={styles.breadcrumbSeparator} />}
                    <span
                        className={`${styles.breadcrumbItem} ${index === folderPath.length - 1 ? styles.current : ''}`}
                        onClick={() => index < folderPath.length - 1 && setSelectedFolderId(folder.id)}
                    >
                        {folder.name}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );

    const renderAssetCard = (asset, isFolder = false) => {
        const isRenaming = renamingId === asset.id;
        const isSelected = selectedAssetId === asset.id;

        return (
            <div
                key={asset.id}
                className={`${styles.assetCard} ${isFolder ? styles.folder : ''} ${isSelected ? styles.selected : ''}`}
                draggable={!isFolder && !isRenaming}
                onClick={() => {
                    if (isFolder) {
                        setSelectedFolderId(asset.id);
                    } else {
                        setSelectedAssetId(asset.id);
                    }
                }}
                onDoubleClick={() => {
                    if (!isFolder && !isRenaming) {
                        onUseAsset?.(asset);
                    }
                }}
                onDragStart={(e) => !isFolder && handleAssetDragStart(e, asset)}
                onContextMenu={(e) => handleContextMenu(e, isFolder ? 'folder' : 'asset', {
                    [isFolder ? 'folderId' : 'assetId']: asset.id
                })}
            >
                <div className={styles.assetIcon}>
                    {isFolder ? <Folder size={20} /> : <Package size={20} />}
                </div>
                {isRenaming ? (
                    <input
                        ref={renameInputRef}
                        className={styles.renameInput}
                        defaultValue={asset.name}
                        onBlur={(e) => handleRename(asset.id, e.target.value, isFolder)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(asset.id, e.target.value, isFolder);
                            if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className={styles.assetName}>{asset.name}</span>
                )}
                {!isFolder && !isRenaming && (
                    <span className={styles.assetMeta}>{asset.widgets?.length || 0} widget(s)</span>
                )}
            </div>
        );
    };

    const renderAssetRow = (asset, isFolder = false) => {
        const isRenaming = renamingId === asset.id;
        const isSelected = selectedAssetId === asset.id;

        return (
            <div
                key={asset.id}
                className={`${styles.assetRow} ${isFolder ? styles.folder : ''} ${isSelected ? styles.selected : ''}`}
                draggable={!isFolder && !isRenaming}
                onClick={() => {
                    if (isFolder) {
                        setSelectedFolderId(asset.id);
                    } else {
                        setSelectedAssetId(asset.id);
                    }
                }}
                onDoubleClick={() => !isFolder && onUseAsset?.(asset)}
                onDragStart={(e) => !isFolder && handleAssetDragStart(e, asset)}
                onContextMenu={(e) => handleContextMenu(e, isFolder ? 'folder' : 'asset', {
                    [isFolder ? 'folderId' : 'assetId']: asset.id
                })}
            >
                <div className={styles.assetRowIcon}>
                    {isFolder ? <Folder size={14} /> : <Package size={14} />}
                </div>
                {isRenaming ? (
                    <input
                        ref={renameInputRef}
                        className={styles.renameInput}
                        defaultValue={asset.name}
                        onBlur={(e) => handleRename(asset.id, e.target.value, isFolder)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(asset.id, e.target.value, isFolder);
                            if (e.key === 'Escape') setRenamingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className={styles.assetRowName}>{asset.name}</span>
                )}
                {!isFolder && <span className={styles.assetRowMeta}>{asset.widgets?.length || 0}</span>}
            </div>
        );
    };

    const renderContextMenu = () => {
        if (!contextMenu) return null;

        const { type, data } = contextMenu;

        return (
            <div
                className={styles.contextMenu}
                style={{ left: contextMenu.x, top: contextMenu.y }}
                onClick={(e) => e.stopPropagation()}
            >
                {type === 'asset' && (
                    <>
                        <button className={styles.contextMenuItem} onClick={() => onUseAsset?.(assets.find(a => a.id === data.assetId))}>
                            <Package size={14} /> Usar no Canvas
                        </button>
                        <button className={styles.contextMenuItem} onClick={() => handleDuplicate(data.assetId)}>
                            <Copy size={14} /> Duplicar
                        </button>
                        <button className={styles.contextMenuItem} onClick={() => { setRenamingId(data.assetId); setContextMenu(null); }}>
                            <Edit3 size={14} /> Renomear
                        </button>
                        <div className={styles.contextMenuDivider} />
                        <button className={`${styles.contextMenuItem} ${styles.danger}`} onClick={() => handleDelete(data.assetId)}>
                            <Trash2 size={14} /> Deletar
                        </button>
                    </>
                )}
                {type === 'folder' && !['presets', 'components', 'templates'].includes(data.folderId) && (
                    <>
                        <button className={styles.contextMenuItem} onClick={() => { setRenamingId(data.folderId); setContextMenu(null); }}>
                            <Edit3 size={14} /> Renomear
                        </button>
                        <button className={`${styles.contextMenuItem} ${styles.danger}`} onClick={() => handleDelete(data.folderId, true)}>
                            <Trash2 size={14} /> Deletar
                        </button>
                    </>
                )}
                {type === 'empty' && (
                    <>
                        <button className={styles.contextMenuItem} onClick={() => { handleCreateFolder(); setContextMenu(null); }}>
                            <FolderPlus size={14} /> Nova Pasta
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className={styles.panel} style={style}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Package size={14} /> Project
                </div>

                <div className={styles.searchBox}>
                    <Search size={12} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.headerActions}>
                    <button
                        className={`${styles.headerBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        <Grid size={14} />
                    </button>
                    <button
                        className={`${styles.headerBtn} ${viewMode === 'list' ? styles.active : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        <List size={14} />
                    </button>
                    <button
                        className={styles.headerBtn}
                        onClick={handleCreateFolder}
                        title="Nova Pasta"
                    >
                        <FolderPlus size={14} />
                    </button>
                </div>

                <button
                    className={styles.saveBtn}
                    onClick={handleSaveAsset}
                    disabled={selectedWidgets.length === 0}
                    title="Salvar seleção como Preset"
                >
                    <Save size={12} /> Salvar
                </button>
            </div>

            {/* Main Content */}
            <div className={styles.content}>
                {/* Folder Tree */}
                {renderFolderTree()}

                {/* Assets Area */}
                <div
                    className={`${styles.assetsArea} ${isDragOverPanel ? styles.dragOver : ''}`}
                    onDragOver={handlePanelDragOver}
                    onDragLeave={handlePanelDragLeave}
                    onDrop={handlePanelDrop}
                >
                    {renderBreadcrumb()}

                    {childFolders.length === 0 && currentAssets.length === 0 ? (
                        <div
                            className={styles.emptyState}
                            onContextMenu={(e) => handleContextMenu(e, 'empty', {})}
                        >
                            <Package size={32} />
                            <span>Pasta vazia</span>
                            <p>Salve widgets ou crie subpastas</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div
                            className={styles.assetsGrid}
                            onContextMenu={(e) => {
                                if (e.target === e.currentTarget) {
                                    handleContextMenu(e, 'empty', {});
                                }
                            }}
                        >
                            {childFolders.map(folder => renderAssetCard(folder, true))}
                            {currentAssets.map(asset => renderAssetCard(asset))}
                        </div>
                    ) : (
                        <div
                            className={styles.assetsList}
                            onContextMenu={(e) => {
                                if (e.target === e.currentTarget) {
                                    handleContextMenu(e, 'empty', {});
                                }
                            }}
                        >
                            {childFolders.map(folder => renderAssetRow(folder, true))}
                            {currentAssets.map(asset => renderAssetRow(asset))}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {renderContextMenu()}
        </div>
    );
}

export default ProjectPanel;
