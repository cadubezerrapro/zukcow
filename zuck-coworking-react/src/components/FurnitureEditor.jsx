import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Move, Trash2, Pencil, X, Copy, RotateCw, Plus, Package, Download } from 'lucide-react';

const TILE_NAMES = {
    // Floors
    1: 'Piso Corredor', 2: 'Carpete Roxo', 4: 'Piso Workspace',
    5: 'Piso Madeira', 6: 'Piso Reuniao', 7: 'Piso Conferencia',
    8: 'Piso Area Aberta', 10: 'Piso Cafeteria', 11: 'Piso Copa',
    64: 'Paralelepipedo', 65: 'Areia', 66: 'Carpete Vermelho',
    67: 'Carpete Azul', 68: 'Carpete Verde', 69: 'Carpete Padrao',
    70: 'Marmore', 71: 'Bamboo', 72: 'Azulejo Cozinha',
    // Walls & Structure
    3: 'Porta', 20: 'Parede Interna', 21: 'Divisoria Vidro',
    40: 'Parede Topo', 41: 'Parede Baixo', 42: 'Parede Esquerda',
    43: 'Parede Direita', 44: 'Canto Sup-Esq', 45: 'Canto Sup-Dir',
    46: 'Canto Inf-Esq', 47: 'Canto Inf-Dir', 51: 'Portal Porta',
    // Furniture
    22: 'Mesa com Monitor', 23: 'Mesa de Reuniao', 24: 'Planta',
    25: 'Estante', 26: 'Sofa', 27: 'Cadeira',
    28: 'Quadro Branco', 29: 'Cafe', 30: 'TV',
    31: 'Bebedouro', 32: 'Mesa Alta', 33: 'Luminaria',
    34: 'Impressora', 35: 'Puff', 36: 'Frigobar',
    37: 'Cabideiro', 38: 'Tapete', 39: 'Arte',
    // Decorations
    76: 'Aquario', 77: 'Quadro Paisagem', 78: 'Quadro Abstrato',
    79: 'Maq. Vendas', 80: 'Arcade', 81: 'Sinuca',
    82: 'Ping Pong', 83: 'Bancada', 84: 'Microondas',
    85: 'Recepcao', 86: 'Pia', 87: 'Servidor',
    88: 'Tela Projetor', 89: 'Podio', 90: 'Tapete Yoga',
    91: 'Esteira', 92: 'Armario', 93: 'Banco Externo',
    94: 'Poste', 95: 'Lixeira', 96: 'Extintor',
    97: 'Relogio', 98: 'Ar Condicionado', 99: 'Monitor Frontal',
    // Large / Variants
    100: 'Mesa Conf. (SE)', 101: 'Mesa Conf. (SD)', 102: 'Mesa Conf. (IE)', 103: 'Mesa Conf. (ID)',
    104: 'Mesa L (Esq)', 105: 'Mesa L (Dir)', 106: 'Mesa Dual Monitor',
    107: 'Mesa Redonda', 108: 'Balcao Bar', 109: 'Banqueta',
    110: 'Fonte (base)', 111: 'Fonte (topo)',
    // Multi-tile
    120: 'Mesa 2x2 (SE)', 121: 'Mesa 2x2 (SD)', 122: 'Mesa 2x2 (IE)', 123: 'Mesa 2x2 (ID)',
    124: 'Sofa 2x1 (Esq)', 125: 'Sofa 2x1 (Dir)',
    126: 'Aquario 2x1 (Esq)', 127: 'Aquario 2x1 (Dir)',
    128: 'Sinuca 2x2 (SE)', 129: 'Sinuca 2x2 (SD)', 130: 'Sinuca 2x2 (IE)', 131: 'Sinuca 2x2 (ID)',
    132: 'Ping Pong 2x2 (SE)', 133: 'Ping Pong 2x2 (SD)', 134: 'Ping Pong 2x2 (IE)', 135: 'Ping Pong 2x2 (ID)',
    136: 'Estante 2 (Topo)', 137: 'Estante 2 (Base)',
    138: 'Maq. Vendas (Topo)', 139: 'Maq. Vendas (Base)',
    140: 'Arcade (Topo)', 141: 'Arcade (Base)',
    // Outdoor
    9: 'Grama', 12: 'Grama Clara', 13: 'Grama Densa',
    14: 'Caminho Pedra', 15: 'Pinheiro', 16: 'Arvore Redonda',
    17: 'Arbusto', 18: 'Canteiro Flores', 73: 'Grama-Caminho',
    74: 'Solo Jardim', 75: 'Jardim Florido',
    // New items (142-179)
    142: 'Laptop', 143: 'Cadeira Gamer', 144: 'Luminaria Mesa', 145: 'Arquivo',
    146: 'Quadro Branco P', 147: 'Suporte Fone', 148: 'Dock Station',
    149: 'Cacto', 150: 'Palmeira', 151: 'Bonsai', 152: 'Planta Suspensa',
    153: 'Dardos', 154: 'Caixa de Som', 155: 'Neon Sign', 156: 'Mesa DJ',
    157: 'Karaoke', 158: 'Saco de Pancada', 159: 'Rack Halteres', 160: 'Bola Yoga',
    161: 'Cesta Basquete', 162: 'Churrasqueira', 163: 'Fogueira', 164: 'Rede',
    165: 'Guarda-Sol', 166: 'Cama Pet', 167: 'Vaso Flores', 168: 'Vela',
    169: 'Espelho', 170: 'Lustre', 171: 'Ventilador', 172: 'Rack TV',
    173: 'Cofre', 174: 'Sapateira', 175: 'Porta Guarda-Chuva', 176: 'Porta Retrato',
    177: 'Globo', 178: 'Trofeu', 179: 'Quadro Cortica',
    // Vehicles
    180: 'Kart',
};

// Catalog organized by categories — expanded with ALL tiles
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
            { id: 85, name: 'Recepcao' },
            { id: 87, name: 'Servidor' },
            { id: 92, name: 'Armario' },
            { id: 142, name: 'Laptop' },
            { id: 143, name: 'Cadeira Gamer' },
            { id: 144, name: 'Luminaria Mesa' },
            { id: 145, name: 'Arquivo' },
            { id: 146, name: 'Quadro Branco P' },
            { id: 147, name: 'Suporte Fone' },
            { id: 148, name: 'Dock Station' },
        ]
    },
    {
        name: 'Mesas',
        icon: '🪑',
        items: [
            { id: 22, name: 'Mesa com Monitor' },
            { id: 23, name: 'Mesa de Reuniao' },
            { id: 32, name: 'Mesa Alta' },
            { id: 107, name: 'Mesa Redonda' },
            { id: 106, name: 'Mesa Dual Monitor' },
            { id: 104, name: 'Mesa L (Esq)' },
            { id: 105, name: 'Mesa L (Dir)' },
            { id: 108, name: 'Balcao Bar' },
            { id: 109, name: 'Banqueta' },
            { id: 120, name: 'Mesa 2x2 (SE)' },
            { id: 121, name: 'Mesa 2x2 (SD)' },
            { id: 122, name: 'Mesa 2x2 (IE)' },
            { id: 123, name: 'Mesa 2x2 (ID)' },
            { id: 100, name: 'Mesa Conf. (SE)' },
            { id: 101, name: 'Mesa Conf. (SD)' },
            { id: 102, name: 'Mesa Conf. (IE)' },
            { id: 103, name: 'Mesa Conf. (ID)' },
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
            { id: 100, name: 'Mesa Conf. (SE)' },
            { id: 101, name: 'Mesa Conf. (SD)' },
            { id: 102, name: 'Mesa Conf. (IE)' },
            { id: 103, name: 'Mesa Conf. (ID)' },
        ]
    },
    {
        name: 'Descanso',
        icon: '☕',
        items: [
            { id: 26, name: 'Sofa' },
            { id: 35, name: 'Puff' },
            { id: 27, name: 'Cadeira' },
            { id: 124, name: 'Sofa 2x1 (Esq)' },
            { id: 125, name: 'Sofa 2x1 (Dir)' },
            { id: 29, name: 'Cafe' },
            { id: 31, name: 'Bebedouro' },
            { id: 36, name: 'Frigobar' },
            { id: 79, name: 'Maq. Vendas' },
            { id: 84, name: 'Microondas' },
            { id: 83, name: 'Bancada Cozinha' },
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
            { id: 110, name: 'Fonte (base)' },
            { id: 111, name: 'Fonte (topo)' },
            { id: 126, name: 'Aquario 2x1 (Esq)' },
            { id: 127, name: 'Aquario 2x1 (Dir)' },
            { id: 136, name: 'Estante 2 (Topo)' },
            { id: 137, name: 'Estante 2 (Base)' },
            { id: 167, name: 'Vaso Flores' },
            { id: 168, name: 'Vela' },
            { id: 169, name: 'Espelho' },
            { id: 170, name: 'Lustre' },
            { id: 171, name: 'Ventilador' },
            { id: 172, name: 'Rack TV' },
            { id: 176, name: 'Porta Retrato' },
            { id: 177, name: 'Globo' },
            { id: 178, name: 'Trofeu' },
            { id: 179, name: 'Quadro Cortica' },
            { id: 166, name: 'Cama Pet' },
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
            { id: 153, name: 'Dardos' },
            { id: 154, name: 'Caixa de Som' },
            { id: 155, name: 'Neon Sign' },
            { id: 156, name: 'Mesa DJ' },
            { id: 157, name: 'Karaoke' },
            { id: 128, name: 'Sinuca 2x2 (SE)' },
            { id: 129, name: 'Sinuca 2x2 (SD)' },
            { id: 130, name: 'Sinuca 2x2 (IE)' },
            { id: 131, name: 'Sinuca 2x2 (ID)' },
            { id: 132, name: 'Ping Pong 2x2 (SE)' },
            { id: 133, name: 'Ping Pong 2x2 (SD)' },
            { id: 134, name: 'Ping Pong 2x2 (IE)' },
            { id: 135, name: 'Ping Pong 2x2 (ID)' },
            { id: 140, name: 'Arcade (Topo)' },
            { id: 141, name: 'Arcade (Base)' },
            { id: 138, name: 'Maq. Vendas (Topo)' },
            { id: 139, name: 'Maq. Vendas (Base)' },
        ]
    },
    {
        name: 'Fitness',
        icon: '💪',
        items: [
            { id: 90, name: 'Tapete Yoga' },
            { id: 91, name: 'Esteira' },
            { id: 158, name: 'Saco de Pancada' },
            { id: 159, name: 'Rack Halteres' },
            { id: 160, name: 'Bola Yoga' },
            { id: 161, name: 'Cesta Basquete' },
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
            { id: 34, name: 'Impressora' },
            { id: 173, name: 'Cofre' },
            { id: 174, name: 'Sapateira' },
            { id: 175, name: 'Porta Guarda-Chuva' },
        ]
    },
    {
        name: 'Pisos',
        icon: '🟫',
        items: [
            { id: 1, name: 'Piso Corredor' },
            { id: 2, name: 'Carpete Roxo' },
            { id: 4, name: 'Piso Workspace' },
            { id: 5, name: 'Piso Madeira' },
            { id: 6, name: 'Piso Reuniao' },
            { id: 7, name: 'Piso Conferencia' },
            { id: 8, name: 'Piso Area Aberta' },
            { id: 10, name: 'Piso Cafeteria' },
            { id: 11, name: 'Piso Copa' },
            { id: 64, name: 'Paralelepipedo' },
            { id: 65, name: 'Areia' },
            { id: 66, name: 'Carpete Vermelho' },
            { id: 67, name: 'Carpete Azul' },
            { id: 68, name: 'Carpete Verde' },
            { id: 69, name: 'Carpete Padrao' },
            { id: 70, name: 'Marmore' },
            { id: 71, name: 'Bamboo' },
            { id: 72, name: 'Azulejo Cozinha' },
        ]
    },
    {
        name: 'Paredes',
        icon: '🧱',
        items: [
            { id: 20, name: 'Parede Interna' },
            { id: 21, name: 'Divisoria Vidro' },
            { id: 3, name: 'Porta' },
            { id: 51, name: 'Portal Porta' },
            { id: 40, name: 'Parede Topo' },
            { id: 41, name: 'Parede Baixo' },
            { id: 42, name: 'Parede Esquerda' },
            { id: 43, name: 'Parede Direita' },
            { id: 44, name: 'Canto Sup-Esq' },
            { id: 45, name: 'Canto Sup-Dir' },
            { id: 46, name: 'Canto Inf-Esq' },
            { id: 47, name: 'Canto Inf-Dir' },
        ]
    },
    {
        name: 'Natureza',
        icon: '🌳',
        items: [
            { id: 9, name: 'Grama' },
            { id: 12, name: 'Grama Clara' },
            { id: 13, name: 'Grama Densa' },
            { id: 14, name: 'Caminho Pedra' },
            { id: 15, name: 'Pinheiro' },
            { id: 16, name: 'Arvore Redonda' },
            { id: 17, name: 'Arbusto' },
            { id: 18, name: 'Canteiro Flores' },
            { id: 73, name: 'Grama-Caminho' },
            { id: 74, name: 'Solo Jardim' },
            { id: 75, name: 'Jardim Florido' },
            { id: 93, name: 'Banco Externo' },
            { id: 94, name: 'Poste' },
            { id: 110, name: 'Fonte (base)' },
            { id: 62, name: 'Lirio d\'Agua' },
            { id: 63, name: 'Ponte' },
            { id: 149, name: 'Cacto' },
            { id: 150, name: 'Palmeira' },
            { id: 151, name: 'Bonsai' },
            { id: 152, name: 'Planta Suspensa' },
            { id: 162, name: 'Churrasqueira' },
            { id: 163, name: 'Fogueira' },
            { id: 164, name: 'Rede' },
            { id: 165, name: 'Guarda-Sol' },
            { id: 180, name: 'Kart' },
        ]
    },
    {
        name: 'Agua',
        icon: '💧',
        items: [
            { id: 52, name: 'Agua Profunda' },
            { id: 53, name: 'Agua Rasa' },
            { id: 54, name: 'Borda Agua (Topo)' },
            { id: 55, name: 'Borda Agua (Baixo)' },
            { id: 56, name: 'Borda Agua (Esq)' },
            { id: 57, name: 'Borda Agua (Dir)' },
            { id: 58, name: 'Canto Agua (SE)' },
            { id: 59, name: 'Canto Agua (SD)' },
            { id: 60, name: 'Canto Agua (IE)' },
            { id: 61, name: 'Canto Agua (ID)' },
            { id: 62, name: 'Lirio d\'Agua' },
            { id: 63, name: 'Ponte' },
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
    const [searchQuery, setSearchQuery] = useState('');

    // Close catalog when entering move mode
    useEffect(() => {
        if (isMoving) setShowCatalog(false);
    }, [isMoving]);

    const handleItemClick = useCallback((tileId) => {
        if (onAddFurniture) onAddFurniture(tileId);
        setShowCatalog(false);
    }, [onAddFurniture]);

    // Filter items by search or category
    const activeItems = searchQuery.trim()
        ? CATALOG.flatMap(cat => cat.items).filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : (CATALOG[activeCategory]?.items || []);

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

                {/* Export edits button */}
                <button
                    onClick={() => {
                        const edits = localStorage.getItem('coworking_map_edits') || '[]';
                        const parsed = JSON.parse(edits);
                        if (parsed.length === 0) {
                            alert('Nenhuma edicao para exportar.');
                            return;
                        }
                        const blob = new Blob([edits], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'map_edits.json';
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all cursor-pointer bg-gather-card/90 border-gather-border text-gray-400 hover:text-white hover:border-gray-500"
                >
                    <Download size={16} />
                    <span className="text-sm font-medium">Exportar Edits</span>
                </button>
            </div>

            {/* Furniture catalog panel */}
            {showCatalog && (
                <div
                    className="absolute z-30 pointer-events-auto"
                    style={{ top: 172, left: 16, width: 340 }}
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
                                <span className="text-gray-500 text-xs">
                                    {CATALOG.reduce((sum, cat) => sum + cat.items.length, 0)} itens
                                </span>
                            </div>
                            <button
                                onClick={() => setShowCatalog(false)}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="px-3 pt-2 pb-1">
                            <input
                                type="text"
                                placeholder="Buscar movel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800/70 border border-gray-600/40 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>

                        {/* Category tabs — wrap to show all */}
                        {!searchQuery && (
                            <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-700/30">
                                {CATALOG.map((cat, i) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setActiveCategory(i)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
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
                        )}

                        {/* Category description */}
                        {!searchQuery && (
                            <div className="px-4 py-1.5 border-b border-gray-700/20">
                                <span className="text-gray-500 text-[10px]">
                                    {CATALOG[activeCategory]?.icon} {CATALOG[activeCategory]?.name} — {activeItems.length} itens
                                </span>
                            </div>
                        )}

                        {searchQuery && activeItems.length > 0 && (
                            <div className="px-4 py-1.5 border-b border-gray-700/20">
                                <span className="text-gray-500 text-[10px]">
                                    {activeItems.length} resultados para "{searchQuery}"
                                </span>
                            </div>
                        )}

                        {/* Items grid */}
                        <div
                            className="p-3 overflow-y-auto"
                            style={{ maxHeight: 'calc(70vh - 160px)', scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}
                        >
                            {activeItems.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {activeItems.map((item, idx) => (
                                        <button
                                            key={`${item.id}-${idx}`}
                                            onClick={() => handleItemClick(item.id)}
                                            className="group flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-700/40 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-pointer active:scale-95"
                                            title={item.name}
                                        >
                                            <div className="rounded-lg overflow-hidden bg-gray-800/60 p-1 group-hover:bg-gray-700/60 transition-colors">
                                                <FurnitureThumbnail tileId={item.id} size={52} />
                                            </div>
                                            <span className="text-gray-400 group-hover:text-emerald-300 text-[10px] font-medium leading-tight text-center transition-colors w-full"
                                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                            >
                                                {item.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    Nenhum item encontrado
                                </div>
                            )}
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
                        {TILE_NAMES[hoveredFurniture.tileId - 1] || TILE_NAMES[hoveredFurniture.tileId] || `Tile ${hoveredFurniture.tileId}`}
                    </div>
                </div>
            )}

            {/* Selection toolbar — fixed center-bottom */}
            {editorMode && selectedFurniture && !isMoving && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                    <div className="bg-gray-900/95 border border-gray-600 rounded-xl p-2 flex items-center gap-2 shadow-2xl backdrop-blur-sm">
                        <div className="text-amber-300 text-sm px-3 font-semibold">
                            {TILE_NAMES[selectedFurniture.tileId - 1] || TILE_NAMES[selectedFurniture.tileId] || `Tile ${selectedFurniture.tileId}`}
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
