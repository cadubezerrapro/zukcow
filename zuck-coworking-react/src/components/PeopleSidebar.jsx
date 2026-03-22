import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, User, UserPlus, Eye, MessageCircle, X, ThumbsUp, MapPin, Clock, Star, Briefcase, Zap, Pencil, Check, LogOut } from 'lucide-react';
import eventBus from '../utils/eventBus';
import { saveTags as apiSaveTags, getAllTags } from '../services/api';

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

const DEPARTMENTS = ['Engenharia', 'Design', 'Marketing', 'Produto', 'Financeiro', 'Suporte', 'Vendas', 'RH'];
const SKILLS_POOL = ['React', 'Node.js', 'Python', 'Figma', 'SQL', 'AWS', 'TypeScript', 'Go', 'Docker', 'Analytics', 'UI/UX', 'SEO', 'Copywriting', 'Growth'];
const LEVELS = ['Iniciante', 'Membro', 'Veterano', 'Elite', 'Lenda'];
const LEVEL_COLORS = ['#9ca3af', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

function seededData(id, overrides) {
    const n = parseInt(id, 10) || 0;
    const ov = overrides && overrides[id];
    const dept = ov?.dept || DEPARTMENTS[n % DEPARTMENTS.length];
    const levelIdx = ov ? LEVELS.indexOf(ov.levelName) : Math.min(Math.floor(n % 5), 4);
    const level = levelIdx >= 0 ? levelIdx : Math.min(Math.floor(n % 5), 4);
    const skills = ov?.skills || [
        SKILLS_POOL[n % SKILLS_POOL.length],
        SKILLS_POOL[(n + 3) % SKILLS_POOL.length],
        SKILLS_POOL[(n + 7) % SKILLS_POOL.length],
    ];
    const memberDays = 30 + (n * 17) % 365;
    const customTags = ov?.customTags || [];
    return { dept, level, levelName: LEVELS[level], levelColor: LEVEL_COLORS[level], skills, memberDays, customTags };
}

const MODAL_WIDTH = 260;
const MODAL_HEIGHT_APPROX = 380;

export default function PeopleSidebar({ onlineUsers, currentRoom, displayName, localUserId, localUserRoom, open, onToggle, isAdmin }) {
    const [search, setSearch] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, user: null });
    const [profileUser, setProfileUser] = useState(null);
    const [toast, setToast] = useState(null);
    const [listTab, setListTab] = useState('todos');
    const contextMenuRef = useRef(null);

    // Admin tag overrides (loaded from backend, localStorage as cache)
    const [tagOverrides, setTagOverrides] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cowork_user_tags_overrides') || '{}'); } catch { return {}; }
    });

    // Load tags from backend on mount
    useEffect(() => {
        getAllTags().then(res => {
            if (res.success && res.data) {
                setTagOverrides(res.data);
                localStorage.setItem('cowork_user_tags_overrides', JSON.stringify(res.data));
            }
        }).catch(() => {});
    }, []);
    const [editingTags, setEditingTags] = useState(false);
    const [editDraft, setEditDraft] = useState({ dept: '', levelName: '', skills: '', customTags: [], newTagLabel: '', newTagValue: '' });

    // Close context menu on outside click or Escape
    useEffect(() => {
        if (!contextMenu.visible) return;
        const handleClick = (e) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setContextMenu(prev => ({ ...prev, visible: false }));
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [contextMenu.visible]);

    // Close profile modal on Escape
    useEffect(() => {
        if (!profileUser) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setProfileUser(null);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [profileUser]);

    // Social state persisted in localStorage
    const [friends, setFriends] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cowork_friends') || '[]'); } catch { return []; }
    });
    const [likes, setLikes] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cowork_likes') || '[]'); } catch { return []; }
    });
    const [follows, setFollows] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cowork_follows') || '[]'); } catch { return []; }
    });

    // Toast auto-dismiss
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(t);
    }, [toast]);

    const handleContextMenu = useCallback((e, user) => {
        e.preventDefault();
        e.stopPropagation();
        if (user.isLocal) return; // Don't show menu for yourself
        // Clamp position so menu doesn't overflow viewport
        const x = Math.min(e.clientX, window.innerWidth - 200);
        const y = Math.min(e.clientY, window.innerHeight - 200);
        setContextMenu({ visible: true, x, y, user });
    }, []);

    const handleViewProfile = useCallback((user) => {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setEditingTags(false);
        setProfileUser(user);
    }, []);

    const handleAddFriend = useCallback((user) => {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setFriends(prev => {
            const active = prev.includes(user.id);
            const next = active ? prev.filter(id => id !== user.id) : [...prev, user.id];
            localStorage.setItem('cowork_friends', JSON.stringify(next));
            setToast(active ? `${user.name} removido dos amigos` : `${user.name} adicionado como amigo`);
            return next;
        });
    }, []);

    const handleFollow = useCallback((user) => {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setFollows(prev => {
            const active = prev.includes(user.id);
            const next = active ? prev.filter(id => id !== user.id) : [...prev, user.id];
            localStorage.setItem('cowork_follows', JSON.stringify(next));
            setToast(active ? `Deixou de seguir ${user.name}` : `Seguindo ${user.name}`);
            return next;
        });
    }, []);

    const handleLike = useCallback((user) => {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setLikes(prev => {
            const active = prev.includes(user.id);
            const next = active ? prev.filter(id => id !== user.id) : [...prev, user.id];
            localStorage.setItem('cowork_likes', JSON.stringify(next));
            setToast(active ? `Descurtiu ${user.name}` : `Curtiu ${user.name}`);
            return next;
        });
    }, []);

    const handleGoToUser = useCallback((user) => {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setProfileUser(null);
        if (user.x != null && user.y != null) {
            eventBus.emit('player:teleport', { x: user.x, y: user.y });
            setToast(`Teletransportando até ${user.name}...`);
        } else {
            setToast(`Localização de ${user.name} indisponível`);
        }
    }, []);

    const handleSendMessage = useCallback((user) => {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setProfileUser(null);
        eventBus.emit('chat:open_dm', { userId: user.id, name: user.name, color: user.color });
    }, []);

    const users = useMemo(() => {
        const list = Object.entries(onlineUsers || {}).map(([id, u]) => ({
            id,
            name: u.name || `User ${id}`,
            status: u.status || 'available',
            room: u.current_room || null,
            customMessage: u.custom_message || '',
            color: AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length],
            isLocal: String(id) === localUserId,
            x: u.x ?? null,
            y: u.y ?? null,
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

    // Open profile when clicking remote player sprite in game
    useEffect(() => {
        const handler = (data) => {
            const user = users.find(u => String(u.id) === String(data.id));
            const base = user || {
                id: data.id,
                name: data.name,
                status: 'available',
                room: null,
                customMessage: '',
                color: AVATAR_COLORS[parseInt(data.id, 10) % AVATAR_COLORS.length],
                isLocal: false,
            };
            setProfileUser({
                ...base,
                isLocal: !!data.isLocal,
                screenX: data.screenX,
                screenY: data.screenY,
            });
        };
        eventBus.on('remote_player:clicked', handler);
        return () => eventBus.off('remote_player:clicked', handler);
    }, [users]);

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(u => u.name.toLowerCase().includes(q));
    }, [users, search]);

    const friendUsers = useMemo(() => {
        return filteredUsers.filter(u => friends.includes(u.id));
    }, [filteredUsers, friends]);

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
                className="fixed top-3 left-0 z-30 bg-[#111827]/95 backdrop-blur-md border border-gather-border border-l-0 rounded-r-xl px-2 py-3 hover:bg-[#1e293b] transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
            >
                <img src={`${import.meta.env.BASE_URL}images/zucklogotop.png`} alt="" className="w-6 h-6 object-contain" />
                <ChevronRight size={18} className="text-gray-300" />
            </button>
        );
    }

    return (
        <div className="fixed top-0 left-0 h-full w-[280px] z-30 bg-[#111827]/95 backdrop-blur-md border-r border-gather-border flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gather-border">
                <div className="flex items-center gap-2">
                    <img src={`${import.meta.env.BASE_URL}images/zucklogotop.png`} alt="ZuckPay" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-white text-sm font-semibold leading-tight">ZuckPay Coworking</h1>
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

            {/* Tabs */}
            <div className="flex px-3 gap-1 pb-2">
                <button onClick={() => setListTab('todos')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        listTab === 'todos' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}>Todos</button>
                <button onClick={() => setListTab('amigos')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        listTab === 'amigos' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'
                    }`}>Amigos{friendUsers.length > 0 ? ` (${friendUsers.length})` : ''}</button>
            </div>

            {/* Content (scrollable) */}
            <div className="flex-1 overflow-y-auto">
                {/* Active Areas */}
                {listTab === 'todos' && !search.trim() && activeAreas.length > 0 && (
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
                                                onContextMenu={(e) => handleContextMenu(e, u)}
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
                {listTab === 'todos' && !search.trim() && activeAreas.length > 0 && (
                    <div className="border-t border-gather-border mx-3 mb-2" />
                )}

                {/* Friends Section (only in 'todos' tab when there are friends online) */}
                {listTab === 'todos' && friendUsers.length > 0 && (
                    <div className="px-3 pb-2">
                        <h3 className="text-emerald-400 text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                            <UserPlus size={11} />
                            <span>Amigos</span>
                            <span className="text-emerald-500/60">— {friendUsers.length}</span>
                        </h3>
                        <div className="space-y-0.5">
                            {friendUsers.map(u => (
                                <div
                                    key={u.id}
                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                    onClick={() => handleViewProfile(u)}
                                    onContextMenu={(e) => handleContextMenu(e, u)}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ring-1 ring-emerald-500/30"
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
                        </div>
                        <div className="border-t border-gather-border mx-1 mt-2 mb-1" />
                    </div>
                )}

                {/* Online List / Amigos filtered list */}
                <div className="px-3 pb-3">
                    <h3 className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                        <span>{listTab === 'amigos' ? 'Amigos' : 'Online'}</span>
                        <span className="text-gray-500">— {(listTab === 'amigos' ? friendUsers : filteredUsers).length}</span>
                    </h3>
                    <div className="space-y-0.5">
                        {(listTab === 'amigos' ? friendUsers : filteredUsers).map(u => (
                            <div
                                key={u.id}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => handleViewProfile(u)}
                                onContextMenu={(e) => handleContextMenu(e, u)}
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
                                        {listTab !== 'amigos' && friends.includes(u.id) && (
                                            <span className="text-emerald-400 text-[9px] ml-1">★</span>
                                        )}
                                    </p>
                                    <p className="text-gray-500 text-[10px] truncate">
                                        {u.room && ROOM_NAMES[u.room]
                                            ? ROOM_NAMES[u.room]
                                            : u.customMessage || STATUS_LABELS[u.status]}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {(listTab === 'amigos' ? friendUsers : filteredUsers).length === 0 && (
                            <p className="text-gray-500 text-xs text-center py-4">
                                {listTab === 'amigos' ? 'Nenhum amigo online' : 'Nenhum resultado encontrado'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Back to Dashboard */}
            <div className="px-3 py-2.5 border-t border-gather-border">
                <button
                    onClick={() => { window.location.href = '/conta/dashboard.php'; }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-gather-border"
                >
                    <LogOut size={14} />
                    Voltar para Dashboard
                </button>
            </div>

            {/* Context Menu */}
            {contextMenu.visible && contextMenu.user && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-[100] min-w-[180px] bg-[#1a2236]/95 backdrop-blur-md border border-gather-border rounded-xl py-1.5 shadow-2xl"
                    style={{ left: contextMenu.x, top: contextMenu.y, animation: 'fadeIn 0.15s ease-out' }}
                >
                    <div className="px-3 py-2 border-b border-gather-border">
                        <p className="text-white text-sm font-medium truncate">{contextMenu.user.name}</p>
                        <p className="text-gray-500 text-[10px]">{STATUS_LABELS[contextMenu.user.status]}</p>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => handleGoToUser(contextMenu.user)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <MapPin size={14} className="text-cyan-400" />
                            Ir até
                        </button>
                        <button
                            onClick={() => handleViewProfile(contextMenu.user)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <User size={14} className="text-blue-400" />
                            Ver perfil
                        </button>
                        <button
                            onClick={() => handleAddFriend(contextMenu.user)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <UserPlus size={14} className="text-emerald-400" />
                            Adicionar amigo
                        </button>
                        <button
                            onClick={() => handleFollow(contextMenu.user)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <Eye size={14} className="text-purple-400" />
                            Seguir
                        </button>
                        <button
                            onClick={() => handleLike(contextMenu.user)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <ThumbsUp size={14} className="text-pink-400" />
                            Curtir
                        </button>
                        <button
                            onClick={() => handleSendMessage(contextMenu.user)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                            <MessageCircle size={14} className="text-amber-400" />
                            Enviar mensagem
                        </button>
                    </div>
                </div>
            )}

            {/* User Profile Modal — floating above player */}
            {profileUser && (() => {
                const sd = seededData(profileUser.id, tagOverrides);
                const mw = MODAL_WIDTH;
                const mh = MODAL_HEIGHT_APPROX;
                // Position above the click point, centered horizontally
                let left = (profileUser.screenX || window.innerWidth / 2) - mw / 2;
                let top = (profileUser.screenY || window.innerHeight / 2) - mh - 24;
                let arrowSide = 'bottom'; // arrow points down by default
                // Clamp to viewport
                if (top < 8) {
                    top = (profileUser.screenY || window.innerHeight / 2) + 40;
                    arrowSide = 'top';
                }
                if (left < 8) left = 8;
                if (left + mw > window.innerWidth - 8) left = window.innerWidth - mw - 8;
                if (top + mh > window.innerHeight - 8) top = window.innerHeight - mh - 8;

                return (
                <div
                    className="fixed inset-0 z-[110]"
                    onClick={() => setProfileUser(null)}
                >
                    <div
                        className="absolute rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                            width: mw,
                            left,
                            top,
                            animation: 'slideUp 0.25s ease-out',
                            background: 'linear-gradient(180deg, #0f172a 0%, #1a2236 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 20px ${profileUser.color}15`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Arrow pointer */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{
                                ...(arrowSide === 'bottom'
                                    ? { bottom: -8 }
                                    : { top: -8, transform: 'translateX(-50%) rotate(180deg)' }),
                                width: 0,
                                height: 0,
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '8px solid #1a2236',
                            }}
                        />

                        {/* Banner gradient */}
                        <div
                            className="h-14 relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${profileUser.color}99, ${profileUser.color}44, transparent)`,
                            }}
                        >
                            {/* Level badge */}
                            <div
                                className="absolute top-2 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                                style={{
                                    background: `${sd.levelColor}25`,
                                    color: sd.levelColor,
                                    border: `1px solid ${sd.levelColor}40`,
                                }}
                            >
                                <Zap size={9} />
                                {sd.levelName}
                            </div>
                            <button
                                onClick={() => setProfileUser(null)}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer backdrop-blur-sm"
                            >
                                <X size={10} />
                            </button>
                        </div>

                        {/* Avatar */}
                        <div className="flex justify-center -mt-8">
                            <div className="relative">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-xl ring-[3px] ring-[#0f172a]"
                                    style={{
                                        backgroundColor: profileUser.color,
                                        boxShadow: `0 4px 20px ${profileUser.color}50`,
                                    }}
                                >
                                    {profileUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div
                                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
                                    style={{
                                        backgroundColor: STATUS_COLORS[profileUser.status],
                                        borderColor: '#0f172a',
                                        boxShadow: `0 0 6px ${STATUS_COLORS[profileUser.status]}80`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="px-3.5 pt-2 pb-1 text-center">
                            <h2 className="text-white text-sm font-bold tracking-tight">{profileUser.name}</h2>
                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
                                    style={{
                                        backgroundColor: `${STATUS_COLORS[profileUser.status]}18`,
                                        color: STATUS_COLORS[profileUser.status],
                                        border: `1px solid ${STATUS_COLORS[profileUser.status]}30`,
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: STATUS_COLORS[profileUser.status] }}
                                    />
                                    {STATUS_LABELS[profileUser.status]}
                                </span>
                            </div>

                            {/* Department & Location row */}
                            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5">
                                    <Briefcase size={9} className="text-blue-400" />
                                    <span className="text-gray-400 text-[10px]">{sd.dept}</span>
                                </div>
                                {profileUser.room && ROOM_NAMES[profileUser.room] && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5">
                                        <MapPin size={9} className="text-cyan-400" />
                                        <span className="text-gray-400 text-[10px]">{ROOM_NAMES[profileUser.room]}</span>
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            <div className="flex items-center justify-center gap-1 mt-2 flex-wrap">
                                {sd.skills.map(skill => (
                                    <span key={skill} className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 text-[9px] font-medium border border-purple-500/20">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Custom tags */}
                            {sd.customTags.length > 0 && (
                                <div className="flex items-center justify-center gap-1 mt-1.5 flex-wrap">
                                    {sd.customTags.map((tag, i) => (
                                        <span key={i} className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[9px] font-medium border border-cyan-500/20">
                                            {tag.label}: {tag.value}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Admin tag editing */}
                            {isAdmin && !profileUser.isLocal && (
                                editingTags ? (
                                    <div className="mt-2 space-y-1.5 text-left">
                                        <div>
                                            <label className="text-gray-500 text-[9px] font-medium">Departamento</label>
                                            <select
                                                value={editDraft.dept}
                                                onChange={e => setEditDraft(prev => ({ ...prev, dept: e.target.value }))}
                                                className="w-full bg-white/10 border border-gather-border rounded px-2 py-1 text-[10px] text-white outline-none"
                                            >
                                                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#1a2236]">{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-[9px] font-medium">Nivel</label>
                                            <select
                                                value={editDraft.levelName}
                                                onChange={e => setEditDraft(prev => ({ ...prev, levelName: e.target.value }))}
                                                className="w-full bg-white/10 border border-gather-border rounded px-2 py-1 text-[10px] text-white outline-none"
                                            >
                                                {LEVELS.map(l => <option key={l} value={l} className="bg-[#1a2236]">{l}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-[9px] font-medium">Skills (separar por virgula)</label>
                                            <input
                                                value={editDraft.skills}
                                                onChange={e => setEditDraft(prev => ({ ...prev, skills: e.target.value }))}
                                                className="w-full bg-white/10 border border-gather-border rounded px-2 py-1 text-[10px] text-white outline-none"
                                                placeholder="React, Node.js, Python"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-gray-500 text-[9px] font-medium">Tags Customizadas</label>
                                            {editDraft.customTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1 mb-1">
                                                    {editDraft.customTags.map((tag, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[9px] border border-cyan-500/20">
                                                            {tag.label}: {tag.value}
                                                            <button
                                                                onClick={() => setEditDraft(prev => ({ ...prev, customTags: prev.customTags.filter((_, idx) => idx !== i) }))}
                                                                className="text-cyan-400 hover:text-red-400 cursor-pointer ml-0.5"
                                                            >
                                                                <X size={8} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-1 mt-1">
                                                <input
                                                    value={editDraft.newTagLabel}
                                                    onChange={e => setEditDraft(prev => ({ ...prev, newTagLabel: e.target.value }))}
                                                    className="flex-1 bg-white/10 border border-gather-border rounded px-2 py-1 text-[10px] text-white outline-none"
                                                    placeholder="Label"
                                                />
                                                <input
                                                    value={editDraft.newTagValue}
                                                    onChange={e => setEditDraft(prev => ({ ...prev, newTagValue: e.target.value }))}
                                                    className="flex-1 bg-white/10 border border-gather-border rounded px-2 py-1 text-[10px] text-white outline-none"
                                                    placeholder="Valor"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (!editDraft.newTagLabel.trim() || !editDraft.newTagValue.trim()) return;
                                                        setEditDraft(prev => ({
                                                            ...prev,
                                                            customTags: [...prev.customTags, { label: prev.newTagLabel.trim(), value: prev.newTagValue.trim() }],
                                                            newTagLabel: '',
                                                            newTagValue: '',
                                                        }));
                                                    }}
                                                    className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={async () => {
                                                    const tagData = {
                                                        dept: editDraft.dept,
                                                        levelName: editDraft.levelName,
                                                        skills: editDraft.skills.split(',').map(s => s.trim()).filter(Boolean),
                                                        customTags: editDraft.customTags,
                                                    };
                                                    const newOverrides = { ...tagOverrides, [profileUser.id]: tagData };
                                                    setTagOverrides(newOverrides);
                                                    localStorage.setItem('cowork_user_tags_overrides', JSON.stringify(newOverrides));
                                                    setEditingTags(false);
                                                    try {
                                                        await apiSaveTags(profileUser.id, tagData);
                                                        setToast(`Tags de ${profileUser.name} salvas`);
                                                    } catch {
                                                        setToast(`Tags salvas localmente (erro no servidor)`);
                                                    }
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/30 transition-colors cursor-pointer"
                                            >
                                                <Check size={10} /> Salvar
                                            </button>
                                            <button
                                                onClick={() => setEditingTags(false)}
                                                className="flex-1 py-1 rounded bg-white/5 text-gray-400 text-[10px] font-medium hover:bg-white/10 transition-colors cursor-pointer"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditDraft({
                                                dept: sd.dept,
                                                levelName: sd.levelName,
                                                skills: sd.skills.join(', '),
                                                customTags: [...sd.customTags],
                                                newTagLabel: '',
                                                newTagValue: '',
                                            });
                                            setEditingTags(true);
                                        }}
                                        className="mt-2 flex items-center justify-center gap-1 w-full py-1 rounded bg-amber-500/15 text-amber-400 text-[9px] font-medium hover:bg-amber-500/25 transition-colors cursor-pointer border border-amber-500/20"
                                    >
                                        <Pencil size={9} /> Editar Tags
                                    </button>
                                )
                            )}

                            {/* Stats row */}
                            <div className="flex items-center justify-center gap-3 mt-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                <div className="text-center">
                                    <p className="text-white text-xs font-bold">{sd.memberDays}</p>
                                    <p className="text-gray-500 text-[8px]">dias</p>
                                </div>
                                <div className="w-px h-5 bg-gray-700" />
                                <div className="text-center">
                                    <p className="text-white text-xs font-bold">{friends.filter(f => f !== profileUser.id).length}</p>
                                    <p className="text-gray-500 text-[8px]">amigos</p>
                                </div>
                                <div className="w-px h-5 bg-gray-700" />
                                <div className="text-center flex flex-col items-center">
                                    <div className="flex items-center gap-0.5">
                                        <Star size={8} className="text-yellow-400" />
                                        <p className="text-white text-xs font-bold">{sd.level + 1}</p>
                                    </div>
                                    <p className="text-gray-500 text-[8px]">nível</p>
                                </div>
                            </div>

                            {profileUser.customMessage && (
                                <p className="text-gray-400 text-[10px] mt-1.5 italic bg-white/5 rounded-md px-2 py-1">"{profileUser.customMessage}"</p>
                            )}
                        </div>

                        {/* Actions (hidden for own profile) */}
                        {!profileUser.isLocal && (
                            <>
                            <div className="mx-3.5 my-1.5 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

                            {/* Primary action */}
                            <div className="px-3.5 pb-1">
                                <button
                                    onClick={() => { handleSendMessage(profileUser); setProfileUser(null); }}
                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                    style={{
                                        background: `linear-gradient(135deg, ${profileUser.color}, ${profileUser.color}bb)`,
                                        color: 'white',
                                        boxShadow: `0 3px 12px ${profileUser.color}40`,
                                    }}
                                >
                                    <MessageCircle size={12} />
                                    Enviar Mensagem
                                </button>
                            </div>

                            {/* Secondary actions */}
                            <div className="px-3.5 pb-3 grid grid-cols-4 gap-1">
                                <button
                                    onClick={() => handleGoToUser(profileUser)}
                                    className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/15 text-gray-400 hover:text-cyan-400 text-[8px] font-medium transition-all cursor-pointer group"
                                >
                                    <MapPin size={13} className="group-hover:scale-110 transition-transform" />
                                    Ir até
                                </button>
                                <button
                                    onClick={() => handleAddFriend(profileUser)}
                                    className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[8px] font-medium transition-all cursor-pointer group ${
                                        friends.includes(profileUser.id)
                                            ? 'bg-emerald-500/25 text-emerald-400'
                                            : 'bg-white/5 hover:bg-emerald-500/15 text-gray-400 hover:text-emerald-400'
                                    }`}
                                >
                                    <UserPlus size={13} className="group-hover:scale-110 transition-transform" />
                                    {friends.includes(profileUser.id) ? 'Amigo ✓' : 'Amigo'}
                                </button>
                                <button
                                    onClick={() => handleLike(profileUser)}
                                    className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[8px] font-medium transition-all cursor-pointer group ${
                                        likes.includes(profileUser.id)
                                            ? 'bg-pink-500/25 text-pink-400'
                                            : 'bg-white/5 hover:bg-pink-500/15 text-gray-400 hover:text-pink-400'
                                    }`}
                                >
                                    <ThumbsUp size={13} className="group-hover:scale-110 transition-transform" />
                                    {likes.includes(profileUser.id) ? 'Curtiu' : 'Like'}
                                </button>
                                <button
                                    onClick={() => handleFollow(profileUser)}
                                    className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[8px] font-medium transition-all cursor-pointer group ${
                                        follows.includes(profileUser.id)
                                            ? 'bg-purple-500/25 text-purple-400'
                                            : 'bg-white/5 hover:bg-purple-500/15 text-gray-400 hover:text-purple-400'
                                    }`}
                                >
                                    <Eye size={13} className="group-hover:scale-110 transition-transform" />
                                    {follows.includes(profileUser.id) ? 'Seguindo' : 'Seguir'}
                                </button>
                            </div>
                            </>
                        )}

                        {/* Member since footer */}
                        <div className="px-3.5 pb-2.5 flex items-center justify-center gap-1 text-gray-600">
                            <Clock size={9} />
                            <span className="text-[9px]">Membro há {sd.memberDays} dias</span>
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* Toast */}
            {toast && (
                <div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-[#1a2236]/95 backdrop-blur-md border border-gather-border rounded-xl px-4 py-2.5 text-sm text-white shadow-2xl"
                    style={{ animation: 'slideUp 0.3s ease-out' }}
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
