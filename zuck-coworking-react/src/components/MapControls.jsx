import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Minus, Map, X } from 'lucide-react';
import eventBus from '../utils/eventBus';

const AVATAR_COLORS = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#e91e63',
];

const TILE_PX = 64;

// Display coordinate system (decoupled from game-world)
const DISPLAY_W = 76;
const DISPLAY_H = 50;

// Flat style colors per room type
const ROOM_TYPES = {
    meeting:    { fill: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.30)', borderHover: 'rgba(59,130,246,0.55)', fillHover: 'rgba(59,130,246,0.16)', label: 'rgba(59,130,246,0.75)' },
    workspace:  { fill: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.30)', borderHover: 'rgba(16,185,129,0.55)', fillHover: 'rgba(16,185,129,0.16)', label: 'rgba(16,185,129,0.75)' },
    recreation: { fill: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.30)', borderHover: 'rgba(168,85,247,0.55)', fillHover: 'rgba(168,85,247,0.16)', label: 'rgba(168,85,247,0.75)' },
    premium:    { fill: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.30)', borderHover: 'rgba(251,146,60,0.55)', fillHover: 'rgba(251,146,60,0.16)', label: 'rgba(251,146,60,0.75)' },
    outdoor:    { fill: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.30)', borderHover: 'rgba(52,211,153,0.55)', fillHover: 'rgba(52,211,153,0.16)', label: 'rgba(52,211,153,0.75)' },
    stair:      { fill: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', borderHover: 'rgba(249,115,22,0.50)', fillHover: 'rgba(249,115,22,0.14)', label: 'rgba(249,115,22,0.75)' },
};

const LOCKED = {
    fill: 'rgba(239,68,68,0.05)',
    border: 'rgba(239,68,68,0.40)',
    borderHover: 'rgba(239,68,68,0.60)',
    label: 'rgba(148,163,184,0.50)',
};

// Each room has game coords (x1,y1,x2,y2) for teleport and display coords (dx1,dy1,dx2,dy2) for rendering
const ROOMS = [
    // ── 2nd Floor (top section) ──
    { id: 'executiva',    x1: 85,  y1: 12, x2: 108, y2: 17, dx1: 2,  dy1: 3,  dx2: 25, dy2: 8,  type: 'premium',    label: 'Executiva',    floor: 2 },
    { id: 'treinamento',  x1: 110, y1: 12, x2: 133, y2: 17, dx1: 27, dy1: 3,  dx2: 50, dy2: 8,  type: 'premium',    label: 'Treinamento',  floor: 2 },
    { id: 'auditorio',    x1: 135, y1: 12, x2: 151, y2: 17, dx1: 52, dy1: 3,  dx2: 68, dy2: 8,  type: 'premium',    label: 'Auditorio',    floor: 2 },
    { id: 'lab',          x1: 85,  y1: 19, x2: 108, y2: 24, dx1: 2,  dy1: 10, dx2: 25, dy2: 15, type: 'workspace',  label: 'Lab',          floor: 2 },
    { id: 'estudio',      x1: 110, y1: 19, x2: 133, y2: 24, dx1: 27, dy1: 10, dx2: 50, dy2: 15, type: 'recreation', label: 'Estudio',      floor: 2 },
    { id: 'biblioteca',   x1: 135, y1: 19, x2: 151, y2: 24, dx1: 52, dy1: 10, dx2: 68, dy2: 15, type: 'meeting',    label: 'Biblioteca',   floor: 2 },
    { id: 'terraco',      x1: 85,  y1: 26, x2: 113, y2: 31, dx1: 2,  dy1: 17, dx2: 30, dy2: 22, type: 'outdoor',    label: 'Terraco',      floor: 2 },
    { id: 'rooftop',      x1: 115, y1: 26, x2: 151, y2: 31, dx1: 32, dy1: 17, dx2: 68, dy2: 22, type: 'outdoor',    label: 'Rooftop Bar',  floor: 2 },
    { id: 'stair_2f',     x1: 81,  y1: 8,  x2: 84,  y2: 10, dx1: 70, dy1: 10, dx2: 73, dy2: 14, type: 'stair',      label: 'Escada',       floor: 2 },

    // ── 1st Floor (bottom section) ──
    { id: 'conferencia',  x1: 2,  y1: 12, x2: 18, y2: 17, dx1: 2,  dy1: 27, dx2: 18, dy2: 32, type: 'meeting',    label: 'Conferencia',  floor: 1 },
    { id: 'colaborativa', x1: 20, y1: 12, x2: 40, y2: 17, dx1: 20, dy1: 27, dx2: 40, dy2: 32, type: 'meeting',    label: 'Colaborativa', floor: 1 },
    { id: 'escritorios',  x1: 42, y1: 12, x2: 58, y2: 17, dx1: 42, dy1: 27, dx2: 58, dy2: 32, type: 'meeting',    label: 'Escritorios',  floor: 1 },
    { id: 'servidor',     x1: 60, y1: 12, x2: 68, y2: 17, dx1: 60, dy1: 27, dx2: 68, dy2: 32, type: 'meeting',    label: 'Server',       floor: 1 },
    { id: 'workspace_a',  x1: 2,  y1: 19, x2: 25, y2: 25, dx1: 2,  dy1: 34, dx2: 25, dy2: 39, type: 'workspace',  label: 'Work A',       floor: 1 },
    { id: 'workspace_b',  x1: 27, y1: 19, x2: 50, y2: 25, dx1: 27, dy1: 34, dx2: 50, dy2: 39, type: 'workspace',  label: 'Work B',       floor: 1 },
    { id: 'reuniao1',     x1: 52, y1: 19, x2: 60, y2: 25, dx1: 52, dy1: 34, dx2: 60, dy2: 39, type: 'workspace',  label: 'R1',           floor: 1 },
    { id: 'reuniao2',     x1: 61, y1: 19, x2: 68, y2: 25, dx1: 61, dy1: 34, dx2: 68, dy2: 39, type: 'workspace',  label: 'R2',           floor: 1 },
    { id: 'lounge',       x1: 2,  y1: 27, x2: 30, y2: 34, dx1: 2,  dy1: 41, dx2: 30, dy2: 46, type: 'recreation', label: 'Lounge',       floor: 1 },
    { id: 'descanso',     x1: 32, y1: 27, x2: 50, y2: 34, dx1: 32, dy1: 41, dx2: 50, dy2: 46, type: 'recreation', label: 'Descanso',     floor: 1 },
    { id: 'gameroom',     x1: 52, y1: 27, x2: 68, y2: 34, dx1: 52, dy1: 41, dx2: 68, dy2: 46, type: 'recreation', label: 'Game',         floor: 1 },
    { id: 'stair_1f',     x1: 71, y1: 22, x2: 76, y2: 24, dx1: 70, dy1: 35, dx2: 73, dy2: 39, type: 'stair',      label: 'Escada',       floor: 1 },
];

// Convert game-world pixel position to display tile coordinates
function gameToDisplayTile(px, py) {
    const gameTileX = px / TILE_PX;
    const gameTileY = py / TILE_PX;

    if (gameTileX >= 80) {
        // 2nd floor
        return {
            x: gameTileX - 83,
            y: gameTileY - 12 + 3,
        };
    } else {
        // 1st floor
        return {
            x: gameTileX,
            y: gameTileY - 12 + 27,
        };
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawLockIcon(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy - size * 0.25, size * 0.28, Math.PI, 0);
    ctx.stroke();
    const bw = size * 0.6;
    const bh = size * 0.45;
    roundRect(ctx, cx - bw / 2, cy - size * 0.02, bw, bh, 1.5);
    ctx.fill();
    ctx.restore();
}

function drawStairArrow(ctx, x, y, size, up, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    if (up) {
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size * 0.6, y);
        ctx.lineTo(x + size * 1.2, y + size);
    } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + size * 0.6, y + size);
        ctx.lineTo(x + size * 1.2, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function MinimapModal({ onClose, onlineUsers, roomLocks }) {
    const canvasRef = useRef(null);
    const bgCanvasRef = useRef(null);
    const localPosRef = useRef({ x: 0, y: 0 });
    const mouseRef = useRef({ x: -1, y: -1 });
    const hoveredRoomRef = useRef(null);
    const rafRef = useRef(null);
    const locks = roomLocks || {};

    const renderBackground = useCallback((canvas) => {
        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const ctx = offscreen.getContext('2d');
        const w = offscreen.width;
        const h = offscreen.height;
        const scaleX = w / DISPLAY_W;
        const scaleY = h / DISPLAY_H;

        // Dark background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        // Subtle blueprint grid
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = 'rgba(56,189,248,0.04)';
        ctx.lineWidth = 0.5;
        for (let gx = 0; gx < w; gx += 20) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, h);
            ctx.stroke();
        }
        for (let gy = 0; gy < h; gy += 20) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Floor section backgrounds (very subtle)
        // 2nd floor section
        roundRect(ctx, 1 * scaleX, 2 * scaleY, 68 * scaleX, 21 * scaleY, 8);
        ctx.fillStyle = 'rgba(251,146,60,0.02)';
        ctx.fill();

        // 1st floor section
        roundRect(ctx, 1 * scaleX, 26 * scaleY, 68 * scaleX, 21 * scaleY, 8);
        ctx.fillStyle = 'rgba(59,130,246,0.02)';
        ctx.fill();

        // Floor headers
        ctx.save();
        ctx.font = '700 13px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';

        // 2nd floor header
        ctx.fillStyle = 'rgba(251,146,60,0.35)';
        ctx.fillText('2o ANDAR', 3 * scaleX, 1.8 * scaleY);

        // 1st floor header
        ctx.fillStyle = 'rgba(59,130,246,0.35)';
        ctx.fillText('1o ANDAR', 3 * scaleX, 25.8 * scaleY);

        ctx.restore();

        // Floor divider
        const divY = 24.5 * scaleY;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(148,163,184,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(2 * scaleX, divY);
        ctx.lineTo(68 * scaleX, divY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Stair connection line (dashed vertical between the two stair zones)
        const stairX = 71.5 * scaleX;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(249,115,22,0.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(stairX, 14.5 * scaleY);
        ctx.lineTo(stairX, 34.5 * scaleY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Stair arrows
        drawStairArrow(ctx, 70.5 * scaleX, 15 * scaleY, 4, false, 'rgba(249,115,22,0.30)');
        drawStairArrow(ctx, 70.5 * scaleX, 34 * scaleY, 4, true, 'rgba(249,115,22,0.30)');

        // Corridor separators within each floor
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = 'rgba(148,163,184,0.06)';
        ctx.lineWidth = 0.5;
        // 2nd floor corridors
        [9, 16].forEach(ty => {
            ctx.beginPath();
            ctx.moveTo(2 * scaleX, ty * scaleY);
            ctx.lineTo(68 * scaleX, ty * scaleY);
            ctx.stroke();
        });
        // 1st floor corridors
        [33, 40].forEach(ty => {
            ctx.beginPath();
            ctx.moveTo(2 * scaleX, ty * scaleY);
            ctx.lineTo(68 * scaleX, ty * scaleY);
            ctx.stroke();
        });
        ctx.setLineDash([]);

        // Draw rooms
        ROOMS.forEach(r => {
            const isLocked = !!locks[r.id];
            const style = ROOM_TYPES[r.type];
            const rx = r.dx1 * scaleX;
            const ry = r.dy1 * scaleY;
            const rw = (r.dx2 - r.dx1) * scaleX;
            const rh = (r.dy2 - r.dy1) * scaleY;

            // Fill
            roundRect(ctx, rx, ry, rw, rh, 6);
            ctx.fillStyle = isLocked ? LOCKED.fill : style.fill;
            ctx.fill();

            // Border
            roundRect(ctx, rx, ry, rw, rh, 6);
            ctx.strokeStyle = isLocked ? LOCKED.border : style.border;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label
            const labelX = ((r.dx1 + r.dx2) / 2) * scaleX;
            const labelY = ((r.dy1 + r.dy2) / 2) * scaleY;
            ctx.save();
            ctx.font = r.type === 'stair' ? '500 9px Inter, system-ui, sans-serif' : '500 12px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isLocked ? LOCKED.label : style.label;
            ctx.fillText(r.label, labelX, labelY);
            ctx.restore();

            // Lock icon
            if (isLocked) {
                drawLockIcon(ctx, labelX, labelY - 14, 9, 'rgba(239,68,68,0.55)');
            }
        });

        return offscreen;
    }, [locks]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const scaleX = w / DISPLAY_W;
        const scaleY = h / DISPLAY_H;

        bgCanvasRef.current = renderBackground(canvas);

        const unsubPos = eventBus.on('player:position', (data) => {
            localPosRef.current = { x: data.x, y: data.y };
        });

        const startTime = performance.now();

        function draw(now) {
            const elapsed = (now - startTime) / 1000;

            ctx.drawImage(bgCanvasRef.current, 0, 0);

            // Hovered room highlight
            const hr = hoveredRoomRef.current;
            if (hr) {
                const isLocked = !!locks[hr.id];
                const style = ROOM_TYPES[hr.type];
                const rx = hr.dx1 * scaleX;
                const ry = hr.dy1 * scaleY;
                const rw = (hr.dx2 - hr.dx1) * scaleX;
                const rh = (hr.dy2 - hr.dy1) * scaleY;

                roundRect(ctx, rx, ry, rw, rh, 6);
                ctx.fillStyle = isLocked ? 'rgba(239,68,68,0.04)' : style.fillHover;
                ctx.fill();
                roundRect(ctx, rx, ry, rw, rh, 6);
                ctx.strokeStyle = isLocked ? LOCKED.borderHover : style.borderHover;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Remote player dots
            const users = Object.entries(onlineUsers || {});
            const dotPositions = [];

            users.forEach(([id, u]) => {
                if (!u.x || !u.y) return;
                if (String(id) === String(window.USER_ID)) return;
                const dp = gameToDisplayTile(u.x, u.y);
                const px = dp.x * scaleX;
                const py = dp.y * scaleY;
                const color = AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];

                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                dotPositions.push({ px, py, name: u.name || `Player ${id}`, color });
            });

            // Local player dot
            const lp = gameToDisplayTile(localPosRef.current.x, localPosRef.current.y);
            if (localPosRef.current.x > 0 || localPosRef.current.y > 0) {
                const lpx = lp.x * scaleX;
                const lpy = lp.y * scaleY;
                const pulse = 2 + Math.sin(elapsed * 2.5) * 2;

                ctx.save();
                ctx.shadowColor = 'rgba(34,197,94,0.5)';
                ctx.shadowBlur = pulse;
                ctx.beginPath();
                ctx.arc(lpx, lpy, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#22c55e';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();

                // "Voce" label
                ctx.font = '500 9px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(34,197,94,0.8)';
                ctx.fillText('Voce', lpx, lpy - 10);
            }

            // Tooltips
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            if (mx >= 0 && my >= 0) {
                for (const dot of dotPositions) {
                    if (Math.hypot(mx - dot.px, my - dot.py) < 10) {
                        const text = dot.name;
                        ctx.font = '500 10px Inter, system-ui, sans-serif';
                        const tw = ctx.measureText(text).width;
                        const bx = dot.px - tw / 2 - 8;
                        const by = dot.py - 26;

                        roundRect(ctx, bx, by, tw + 16, 20, 6);
                        ctx.fillStyle = '#1e293b';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();

                        ctx.fillStyle = '#e2e8f0';
                        ctx.textAlign = 'center';
                        ctx.fillText(text, dot.px, dot.py - 14);
                        break;
                    }
                }

                // Locked room tooltip
                const hovRoom = hoveredRoomRef.current;
                if (hovRoom && locks[hovRoom.id]) {
                    const text = 'Sala trancada';
                    ctx.font = '500 10px Inter, system-ui, sans-serif';
                    const tw = ctx.measureText(text).width;

                    roundRect(ctx, mx - tw / 2 - 8, my - 30, tw + 16, 20, 6);
                    ctx.fillStyle = 'rgba(127,29,29,0.90)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(239,68,68,0.20)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();

                    ctx.fillStyle = '#fca5a5';
                    ctx.textAlign = 'center';
                    ctx.fillText(text, mx, my - 18);
                }
            }

            rafRef.current = requestAnimationFrame(draw);
        }

        rafRef.current = requestAnimationFrame(draw);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            unsubPos();
        };
    }, [onlineUsers, renderBackground, locks]);

    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ratioX = canvas.width / rect.width;
        const ratioY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * ratioX;
        const my = (e.clientY - rect.top) * ratioY;
        mouseRef.current = { x: mx, y: my };

        const scaleX = canvas.width / DISPLAY_W;
        const scaleY = canvas.height / DISPLAY_H;
        const tileX = mx / scaleX;
        const tileY = my / scaleY;

        // Hit-test using display coordinates
        const found = ROOMS.find(r =>
            tileX >= r.dx1 && tileX <= r.dx2 && tileY >= r.dy1 && tileY <= r.dy2
        );
        hoveredRoomRef.current = found || null;
        canvas.style.cursor = found ? (locks[found.id] ? 'not-allowed' : 'pointer') : 'default';
    }, [locks]);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: -1, y: -1 };
        hoveredRoomRef.current = null;
    }, []);

    const handleClick = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ratioX = canvas.width / rect.width;
        const ratioY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * ratioX;
        const my = (e.clientY - rect.top) * ratioY;

        const scaleX = canvas.width / DISPLAY_W;
        const scaleY = canvas.height / DISPLAY_H;
        const tileX = mx / scaleX;
        const tileY = my / scaleY;

        // Hit-test with display coords
        const room = ROOMS.find(r =>
            tileX >= r.dx1 && tileX <= r.dx2 && tileY >= r.dy1 && tileY <= r.dy2
        );
        if (!room || locks[room.id]) return;

        // Teleport uses GAME coordinates
        const centerX = ((room.x1 + room.x2) / 2) * TILE_PX;
        const centerY = ((room.y1 + room.y2) / 2) * TILE_PX;
        eventBus.emit('player:teleport', { x: centerX, y: centerY });
        onClose();
    }, [onClose, locks]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="minimap-modal-card bg-[#0f172a] border border-[rgba(51,65,85,0.5)] rounded-2xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ width: 750, maxWidth: '95vw' }}
            >
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <Map size={16} className="text-blue-400/70" />
                        <h3 className="text-slate-300 text-sm font-medium tracking-tight">Mapa do Escritorio</h3>
                        <span className="text-[10px] text-slate-600 ml-1">Clique para teletransportar</span>
                    </div>
                    <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5">
                        <X size={15} />
                    </button>
                </div>
                <div className="p-4">
                    <canvas
                        ref={canvasRef}
                        width={700}
                        height={530}
                        className="w-full rounded-xl"
                        style={{ imageRendering: 'auto' }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                    />
                </div>
                <div className="px-5 pb-3 flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Voce
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                        Outros
                    </span>
                    <span className="mx-1 text-slate-700">|</span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm inline-block border" style={{ borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.12)' }} />
                        Reuniao
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm inline-block border" style={{ borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.12)' }} />
                        Trabalho
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm inline-block border" style={{ borderColor: 'rgba(168,85,247,0.35)', background: 'rgba(168,85,247,0.12)' }} />
                        Lazer
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm inline-block border" style={{ borderColor: 'rgba(251,146,60,0.35)', background: 'rgba(251,146,60,0.12)' }} />
                        Premium
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm inline-block border" style={{ borderColor: 'rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.12)' }} />
                        Outdoor
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm inline-block border" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }} />
                        Trancada
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function MapControls({ onlineUsers, roomLocks, rightSidebarOpen }) {
    const [showMinimap, setShowMinimap] = useState(false);

    const handleZoomIn = () => eventBus.emit('camera:zoom_in');
    const handleZoomOut = () => eventBus.emit('camera:zoom_out');
    return (
        <>
            <div className="fixed bottom-6 z-30 flex flex-col gap-1.5 transition-all duration-300" style={{ right: rightSidebarOpen ? 336 : 16 }}>
                <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-gather-card/90 backdrop-blur-sm border border-gather-border rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/90 transition-colors cursor-pointer"
                    title="Zoom in"
                >
                    <Plus size={18} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-gather-card/90 backdrop-blur-sm border border-gather-border rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/90 transition-colors cursor-pointer"
                    title="Zoom out"
                >
                    <Minus size={18} />
                </button>
                <button
                    onClick={() => setShowMinimap(true)}
                    className="w-10 h-10 bg-gather-card/90 backdrop-blur-sm border border-gather-border rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700/90 transition-colors cursor-pointer"
                    title="Mapa"
                >
                    <Map size={18} />
                </button>
            </div>

            {showMinimap && (
                <MinimapModal
                    onClose={() => setShowMinimap(false)}
                    onlineUsers={onlineUsers}
                    roomLocks={roomLocks}
                />
            )}
        </>
    );
}
