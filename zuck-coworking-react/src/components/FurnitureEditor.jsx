import React from 'react';
import { Move, Trash2, Pencil, X, Copy, RotateCw } from 'lucide-react';

const TILE_NAMES = {
    23: 'Desk', 24: 'Mesa de Reuniao', 25: 'Planta',
    26: 'Estante', 27: 'Sofa', 28: 'Cadeira',
    29: 'Quadro Branco', 30: 'Cafe', 31: 'TV',
    32: 'Bebedouro', 33: 'Mesa Alta', 34: 'Luminaria',
    35: 'Impressora', 36: 'Puff', 37: 'Frigobar',
    38: 'Cabideiro', 39: 'Tapete', 40: 'Arte'
};

function worldToScreen(worldX, worldY, camera) {
    if (!camera) return { x: -9999, y: -9999 };
    const x = (worldX - camera.scrollX) * camera.zoom + camera.width / 2;
    const y = (worldY - camera.scrollY) * camera.zoom + camera.height / 2;
    return { x, y };
}

const btnClass = "flex items-center gap-1.5 px-3 py-2 text-white text-xs rounded-lg transition-colors cursor-pointer font-medium";

export default function FurnitureEditor({
    editorMode, hoveredFurniture, selectedFurniture, isMoving,
    cameraInfo, onToggleEditor, onMove, onDuplicate, onRotate, onDelete
}) {
    return (
        <>
            {/* Toggle button - always visible */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
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
            </div>

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
        </>
    );
}
