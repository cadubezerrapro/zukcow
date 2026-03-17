import React, { useState, useRef, useEffect } from 'react';
import { X, User, Pencil, Check } from 'lucide-react';

const STATUS_COLORS = {
    available: '#22c55e',
    busy: '#f59e0b',
    dnd: '#ef4444',
    away: '#9ca3af',
    offline: '#4b5563',
};

const STATUS_LABELS = {
    available: 'Disponivel',
    busy: 'Ocupado',
    dnd: 'Nao Perturbe',
    away: 'Ausente',
    offline: 'Offline',
};

export default function UserList({ users, currentUserId, currentDisplayName, onNameChange, onClose }) {
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const inputRef = useRef(null);

    const userEntries = Object.entries(users || {}).filter(
        ([id]) => String(id) !== String(currentUserId)
    );

    const startEdit = () => {
        setEditName(currentDisplayName || window.USER_NAME || '');
        setEditing(true);
    };

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const saveEdit = () => {
        const name = editName.trim();
        if (name) {
            onNameChange?.(name);
        }
        setEditing(false);
    };

    const handleEditKey = (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') setEditing(false);
    };

    return (
        <div className="absolute top-16 right-4 w-64 user-list-panel max-h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gather-border">
                <h3 className="text-white text-sm font-semibold">Usuarios Online</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Current User */}
            <div className="p-3 border-b border-gather-border/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gather-blue/20 flex items-center justify-center">
                            <User size={16} className="text-gather-blue" />
                        </div>
                        <div
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gather-card status-dot-pulse"
                            style={{ backgroundColor: STATUS_COLORS.available }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={handleEditKey}
                                    onBlur={saveEdit}
                                    maxLength={30}
                                    className="bg-white/10 text-white text-sm rounded px-2 py-0.5 w-full outline-none border border-gather-blue/50 focus:border-gather-blue"
                                />
                                <button
                                    onClick={saveEdit}
                                    className="text-gather-blue hover:text-white transition-colors cursor-pointer flex-shrink-0"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <p className="text-white text-sm font-medium truncate">
                                    {currentDisplayName || window.USER_NAME || 'Voce'}
                                </p>
                                <button
                                    onClick={startEdit}
                                    className="text-gray-500 hover:text-gather-blue transition-colors cursor-pointer flex-shrink-0"
                                    title="Editar nome"
                                >
                                    <Pencil size={12} />
                                </button>
                            </div>
                        )}
                        <p className="text-emerald-400 text-[10px]">Voce</p>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-2">
                {userEntries.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-gray-500 text-xs">Nenhum outro usuario online</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {userEntries.map(([id, user]) => {
                            const status = user.status || 'available';
                            return (
                                <div
                                    key={id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                            <User size={14} className="text-gray-400" />
                                        </div>
                                        <div
                                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gather-card"
                                            style={{ backgroundColor: STATUS_COLORS[status] }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 text-sm truncate">
                                            {user.name || `User ${id}`}
                                        </p>
                                        <p className="text-gray-500 text-[10px]">
                                            {user.custom_message || STATUS_LABELS[status]}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
