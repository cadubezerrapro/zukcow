import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Users, User, Circle } from 'lucide-react';

const ROOM_NAMES = {
    conferencia: 'Conferencia',
    colaborativa: 'Colaborativa',
    escritorios: 'Escritorios',
    servidor: 'Sala Servidor',
    workspace_a: 'Workspace A',
    workspace_b: 'Workspace B',
    reuniao1: 'Reuniao 1',
    reuniao2: 'Reuniao 2',
    lounge: 'Lounge',
    descanso: 'Descanso',
    gameroom: 'Sala de Jogos',
};

const STATUS_COLORS = {
    available: '#22c55e',
    busy: '#f59e0b',
    dnd: '#ef4444',
    away: '#9ca3af',
    offline: '#4b5563',
};

const STATUS_LABELS = {
    available: 'Ativo',
    busy: 'Ocupado',
    dnd: 'Não perturbe',
    away: 'Ausente',
    offline: 'Offline',
};

const AVATAR_COLORS = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#e91e63',
];

export default function PeopleSidebar({ onlineUsers, currentRoom, displayName, localUserId, localUserRoom, open, onToggle }) {
    const [search, setSearch] = useState('');

    const users = useMemo(() => {
        const list = Object.entries(onlineUsers || {}).map(([id, u]) => ({
            id,
            name: u.name || `User ${id}`,
            status: u.status || 'available',
            room: u.current_room || null,
            customMessage: u.custom_message || '',
            color: AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length],
            isLocal: String(id) === localUserId,
        }));
        // Ensure local player is in the list with current room
        const hasLocal = list.some(u => u.isLocal);
        if (!hasLocal && localUserId) {
            list.unshift({
                id: localUserId,
                name: displayName || window.USER_NAME || 'Voce',
                status: 'available',
                room: localUserRoom || null,
                customMessage: '',
                color: AVATAR_COLORS[parseInt(localUserId, 10) % AVATAR_COLORS.length],
                isLocal: true,
            });
        } else if (hasLocal) {
            // Update local player's room from React state (more up-to-date than SSE)
            const local = list.find(u => u.isLocal);
            if (local) {
                local.room = localUserRoom || local.room;
                local.name = displayName || local.name;
            }
        }
        return list;
    }, [onlineUsers, localUserId, localUserRoom, displayName]);

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(u => u.name.toLowerCase().includes(q));
    }, [users, search]);

    const activeAreas = useMemo(() => {
        const areas = {};
        users.forEach(u => {
            if (u.room && ROOM_NAMES[u.room]) {
                if (!areas[u.room]) areas[u.room] = [];
                areas[u.room].push(u);
            }
        });
        return Object.entries(areas).sort((a, b) => b[1].length - a[1].length);
    }, [users]);

    if (!open) {
        return (
            <button
                onClick={onToggle}
                className="fixed top-4 left-0 z-30 bg-gather-card/90 backdrop-blur-sm border border-gather-border border-l-0 rounded-r-xl px-1.5 py-2.5 hover:bg-gray-700/90 transition-colors cursor-pointer"
            >
                <ChevronRight size={16} className="text-gray-400" />
            </button>
        );
    }

    return (
        <div className="fixed top-0 left-0 h-full w-[280px] z-30 bg-[#111827]/95 backdrop-blur-md border-r border-gather-border flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gather-border">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Z</span>
                    </div>
                    <div>
                        <h1 className="text-white text-sm font-semibold leading-tight">ZuckPay Co-Work</h1>
                        <p className="text-gray-500 text-[10px]">Escritório Virtual</p>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar pessoa"
                        className="w-full bg-white/5 border border-gather-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Content (scrollable) */}
            <div className="flex-1 overflow-y-auto">
                {/* Active Areas */}
                {!search.trim() && activeAreas.length > 0 && (
                    <div className="px-3 pb-2">
                        <h3 className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2 px-1">Áreas Ativas</h3>
                        <div className="grid grid-cols-2 gap-1.5">
                            {activeAreas.map(([roomId, roomUsers]) => (
                                <div
                                    key={roomId}
                                    className="bg-white/5 rounded-lg p-2.5 hover:bg-white/8 transition-colors cursor-pointer"
                                >
                                    <p className="text-white text-xs font-medium truncate mb-1.5">{ROOM_NAMES[roomId]}</p>
                                    <div className="flex items-center gap-1">
                                        {roomUsers.slice(0, 4).map(u => (
                                            <div
                                                key={u.id}
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10"
                                                style={{ backgroundColor: u.color }}
                                                title={u.name}
                                            >
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {roomUsers.length > 4 && (
                                            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[9px] text-gray-300">
                                                +{roomUsers.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Divider */}
                {!search.trim() && activeAreas.length > 0 && (
                    <div className="border-t border-gather-border mx-3 mb-2" />
                )}

                {/* Online List */}
                <div className="px-3 pb-3">
                    <h3 className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                        <span>Online</span>
                        <span className="text-gray-500">— {filteredUsers.length}</span>
                    </h3>
                    <div className="space-y-0.5">
                        {filteredUsers.map(u => (
                            <div
                                key={u.id}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ring-1 ring-white/10"
                                        style={{ backgroundColor: u.color }}
                                    >
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div
                                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                                        style={{
                                            backgroundColor: STATUS_COLORS[u.status],
                                            borderColor: '#111827',
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-200 text-sm truncate leading-tight">
                                        {u.name}
                                        {u.isLocal && <span className="text-emerald-400 text-[10px] ml-1.5">(Voce)</span>}
                                    </p>
                                    <p className="text-gray-500 text-[10px] truncate">
                                        {u.room && ROOM_NAMES[u.room]
                                            ? ROOM_NAMES[u.room]
                                            : u.customMessage || STATUS_LABELS[u.status]}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <p className="text-gray-500 text-xs text-center py-4">Nenhum resultado encontrado</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
