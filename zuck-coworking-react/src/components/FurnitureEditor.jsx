import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Move, Trash2, Pencil, X, Copy, RotateCw, Plus, Package } from 'lucide-react';

const TILE_NAMES = {
    22: 'Mesa com Monitor', 23: 'Mesa de Reuniao', 24: 'Planta',
    25: 'Estante', 26: 'Sofa', 27: 'Cadeira',
    28: 'Quadro Branco', 29: 'Cafe', 30: 'TV',
    31: 'Bebedouro', 32: 'Mesa Alta', 33: 'Luminaria',
    34: 'Impressora', 35: 'Puff', 36: 'Frigobar',
    37: 'Cabideiro', 38: 'Tapete', 39: 'Arte',
    76: 'Aquario', 77: 'Quadro Paisagem', 78: 'Quadro Abstrato',
    79: 'Maq. Vendas', 80: 'Arcade', 81: 'Sinuca',
    82: 'Ping Pong', 83: 'Bancada', 84: 'Microondas',
    85: 'Recepcao', 86: 'Pia', 87: 'Servidor',
    88: 'Tela Projetor', 89: 'Podio', 90: 'Tapete Yoga',
    91: 'Esteira', 92: 'Armario', 93: 'Banco Externo',
    94: 'Poste', 95: 'Lixeira', 96: 'Extintor',
    97: 'Relogio', 98: 'Ar Condicionado', 99: 'Monitor Frontal',
    104: 'Mesa L (Esq)', 105: 'Mesa L (Dir)', 106: 'Mesa Dual Monitor',
    107: 'Mesa Redonda', 108: 'Balcao Bar', 109: 'Banqueta',
    110: 'Fonte'
};

// Catalog organized by categories
const CATALOG = [
    {
        name: 'Escritorio',
        icon: '💼',
        items: [
            { id: 22, name: 'Mesa com Monitor' },
            { id: 27, name: 'Cadeira' },
            { id: 32, name: 'Mesa Alta' },
            { id: 99, name: 'Monitor Frontal' },
            { id: 104, name: 'Mesa L (Esq)' },
            { id: 105, name: 'Mesa L (Dir)' },
            { id: 106, name: 'Mesa Dual Monitor' },
            { id: 34, name: 'Impressora' },
        ]
    },
    {
        name: 'Reuniao',
        icon: '📋',
        items: [
            { id: 23, name: 'Mesa de Reuniao' },
            { id: 28, name: 'Quadro Branco' },
            { id: 30, name: 'TV' },
            { id: 88, name: 'Tela Projetor' },
            { id: 89, name: 'Podio' },
            { id: 107, name: 'Mesa Redonda' },
        ]
    },
    {
        name: 'Descanso',
        icon: '☕',
        items: [
            { id: 26, name: 'Sofa' },
            { id: 35, name: 'Puff' },
            { id: 29, name: 'Cafe' },
            { id: 31, name: 'Bebedouro' },
            { id: 36, name: 'Frigobar' },
            { id: 79, name: 'Maq. Vendas' },
            { id: 90, name: 'Tapete Yoga' },
        ]
    },
    {
        name: 'Decoracao',
        icon: '🎨',
        items: [
            { id: 24, name: 'Planta' },
            { id: 25, name: 'Estante' },
            { id: 33, name: 'Luminaria' },
            { id: 37, name: 'Cabideiro' },
            { id: 38, name: 'Tapete' },
            { id: 39, name: 'Arte' },
            { id: 76, name: 'Aquario' },
            { id: 77, name: 'Quadro Paisagem' },
            { id: 78, name: 'Quadro Abstrato' },
            { id: 97, name: 'Relogio' },
        ]
    },
    {
        name: 'Lazer',
        icon: '🎮',
        items: [
            { id: 80, name: 'Arcade' },
            { id: 81, name: 'Sinuca' },
            { id: 82, name: 'Ping Pong' },
            { id: 91, name: 'Esteira' },
        ]
    },
    {
        name: 'Infra',
        icon: '🔧',
        items: [
            { id: 83, name: 'Bancada Cozinha' },
            { id: 84, name: 'Microondas' },
            { id: 85, name: 'Recepcao' },
            { id: 86, name: 'Pia' },
            { id: 87, name: 'Servidor' },
            { id: 92, name: 'Armario' },
            { id: 95, name: 'Lixeira' },
            { id: 96, name: 'Extintor' },
            { id: 98, name: 'Ar Condicionado' },
            { id: 108, name: 'Balcao Bar' },
            { id: 109, name: 'Banqueta' },
        ]
    },
    {
        name: 'Externo',
        icon: '🌳',
        items: [
            { id: 93, name: 'Banco Externo' },
            { id: 94, name: 'Poste' },
            { id: 110, name: 'Fonte' },
        ]
    },
];

// Thumbnail component that renders a tile from the Phaser tileset canvas
function FurnitureThumbnail({ tileId, size = 48 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = false;

        const game = window.__PHASER_GAME__;
        if (!game || !game.textures) return;

        const tex = game.textures.get('office_tiles');
        if (!tex || tex.key === '__MISSING') return;
        const source = tex.getSourceImage();
        if (!source) return;

        // Tileset layout: 12 columns, cell = 66px (64 + 2 extrusion), offset 1px
        const cols = 12;
        const cellSize = 66;
        const tileSize = 64;
        const col = tileId % cols;
        const row = Math.floor(tileId / cols);
        const sx = col * cellSize + 1; // skip 1px extrusion
        const sy = row * cellSize + 1;

        ctx.drawImage(source, sx, sy, tileSize, tileSize, 0, 0, size, size);
    }, [tileId, size]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: size, height: size, imageRendering: 'pixelated' }}
        />
    );
}

function worldToScreen(worldX, worldY, camera) {
    if (!camera || !camera.worldViewW) return { x: -9999, y: -9999 };
    const x = ((worldX - camera.worldViewX) / camera.worldViewW) * camera.width;
    const y = ((worldY - camera.worldViewY) / camera.worldViewH) * camera.height;
    return { x, y };
}

const btnClass = "flex items-center gap-1.5 px-3 py-2 text-white text-xs rounded-lg transition-colors cursor-pointer font-medium";

export default function FurnitureEditor({
    editorMode, hoveredFurniture, selectedFurniture, isMoving,
    cameraInfo, onToggleEditor, onMove, onDuplicate, onRotate, onDelete,
    onAddFurniture
}) {
    const [showCatalog, setShowCatalog] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);

    // Close catalog when entering move mode
    useEffect(() => {
        if (isMoving) setShowCatalog(false);
    }, [isMoving]);

    const handleItemClick = useCallback((tileId) => {
        if (onAddFurniture) onAddFurniture(tileId);
        setShowCatalog(false);
    }, [onAddFurniture]);

    const activeItems = CATALOG[activeCategory]?.items || [];

    return (
        <>
            {/* Buttons stack — top left */}
            <div className="absolute top-20 left-4 z-30 pointer-events-auto flex flex-col gap-2">
                {/* Toggle editor button */}
                <button
                    onClick={onToggleEditor}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all cursor-pointer ${
                        editorMode
                            ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                            : 'bg-gather-card/90 border-gather-border text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                >
                    <Pencil size={16} />
                    <span className="text-sm font-medium">
                        {editorMode ? 'Modo Editor ATIVO' : 'Editar Moveis'}
                    </span>
                    {editorMode && <X size={14} />}
                </button>

                {/* Add furniture button */}
                <button
                    onClick={() => setShowCatalog(prev => !prev)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all cursor-pointer ${
                        showCatalog
                            ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                            : 'bg-gather-card/90 border-gather-border text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                >
                    <Plus size={16} />
                    <span className="text-sm font-medium">
                        {showCatalog ? 'Fechar Catalogo' : 'Adicionar Moveis'}
                    </span>
                    {showCatalog && <X size={14} />}
                </button>
            </div>

            {/* Furniture catalog panel */}
            {showCatalog && (
                <div
                    className="absolute z-30 pointer-events-auto"
                    style={{ top: 148, left: 16, width: 320 }}
                >
                    <div
                        className="rounded-2xl border border-gray-600/60 shadow-2xl overflow-hidden"
                        style={{
                            background: 'rgba(15, 23, 42, 0.96)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-emerald-400" />
                                <span className="text-white text-sm font-semibold">Catalogo de Moveis</span>
                            </div>
                            <button
                                onClick={() => setShowCatalog(false)}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Category tabs */}
                        <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-gray-700/30"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {CATALOG.map((cat, i) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setActiveCategory(i)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                                        activeCategory === i
                                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/40 border border-transparent'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Items grid */}
                        <div
                            className="p-3 overflow-y-auto"
                            style={{ maxHeight: 'calc(70vh - 120px)', scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}
                        >
                            <div className="grid grid-cols-3 gap-2">
                                {activeItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemClick(item.id)}
                                        className="group flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-700/40 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-pointer"
                                        title={item.name}
                                    >
                                        <div className="rounded-lg overflow-hidden bg-gray-800/60 p-1 group-hover:bg-gray-700/60 transition-colors">
                                            <FurnitureThumbnail tileId={item.id} size={48} />
                                        </div>
                                        <span className="text-gray-400 group-hover:text-emerald-300 text-[10px] font-medium leading-tight text-center transition-colors"
                                            style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        >
                                            {item.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hover tooltip */}
            {editorMode && hoveredFurniture && !selectedFurniture && !isMoving && cameraInfo && (
                <div
                    className="absolute pointer-events-none z-30"
                    style={{
                        left: worldToScreen(hoveredFurniture.worldX, hoveredFurniture.worldY, cameraInfo).x,
                        top: worldToScreen(hoveredFurniture.worldX, hoveredFurniture.worldY, cameraInfo).y - 20,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="bg-black/85 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {TILE_NAMES[hoveredFurniture.tileId] || `Tile ${hoveredFurniture.tileId}`}
                    </div>
                </div>
            )}

            {/* Selection toolbar — fixed center-bottom */}
            {editorMode && selectedFurniture && !isMoving && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                    <div className="bg-gray-900/95 border border-gray-600 rounded-xl p-2 flex items-center gap-2 shadow-2xl backdrop-blur-sm">
                        <div className="text-amber-300 text-sm px-3 font-semibold">
                            {TILE_NAMES[selectedFurniture.tileId] || `Tile ${selectedFurniture.tileId}`}
                        </div>
                        <div className="w-px h-7 bg-gray-600" />
                        <button
                            onClick={() => onMove(selectedFurniture)}
                            className={`${btnClass} bg-blue-600 hover:bg-blue-700`}
                        >
                            <Move size={14} />
                            Mover
                        </button>
                        <button
                            onClick={() => onDuplicate(selectedFurniture)}
                            className={`${btnClass} bg-emerald-600 hover:bg-emerald-700`}
                        >
                            <Copy size={14} />
                            Duplicar
                        </button>
                        <button
                            onClick={() => onRotate(selectedFurniture)}
                            className={`${btnClass} bg-purple-600 hover:bg-purple-700`}
                        >
                            <RotateCw size={14} />
                            Girar
                        </button>
                        <div className="w-px h-7 bg-gray-600" />
                        <button
                            onClick={() => onDelete(selectedFurniture)}
                            className={`${btnClass} bg-red-600 hover:bg-red-700`}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Moving/Duplicating indicator */}
            {editorMode && isMoving && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-blue-600/90 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                        <Move size={16} />
                        Clique para posicionar o movel | ESC para cancelar
                    </div>
                </div>
            )}

            {/* Adding new furniture indicator (not in editor mode) */}
            {!editorMode && isMoving && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-emerald-600/90 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                        <Plus size={16} />
                        Clique para posicionar o movel | ESC para cancelar
                    </div>
                </div>
            )}
        </>
    );
}
