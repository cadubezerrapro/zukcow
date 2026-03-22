import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronRight, ChevronLeft, Bot, MessageCircle, Send, X, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { getAllAgents, getAllSquads, getAgentsBySquad } from '../data/agents';
import eventBus from '../utils/eventBus';

export default function RightSidebar({
    open, onToggle, currentRoom, currentRoomName, displayName, localUserId,
    onCallAgent, onOpenChat,
}) {
    const [tab, setTab] = useState('agents');
    const [agentSearch, setAgentSearch] = useState('');
    const [selectedSquad, setSelectedSquad] = useState(null);
    const [messages, setMessages] = useState({});
    const [chatInput, setChatInput] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [dmTarget, setDmTarget] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const squads = useMemo(() => getAllSquads(), []);
    const chatKey = dmTarget ? `dm_${dmTarget.userId}` : currentRoom;
    const activeMessages = messages[chatKey] || [];

    // Listen for DM open events
    useEffect(() => {
        const handler = (user) => {
            setDmTarget(user);
            setTab('chat');
        };
        eventBus.on('chat:open_dm', handler);
        return () => eventBus.off('chat:open_dm', handler);
    }, []);

    const filteredAgents = useMemo(() => {
        let agents = selectedSquad ? getAgentsBySquad(selectedSquad) : getAllAgents();
        if (agentSearch.trim()) {
            const q = agentSearch.toLowerCase();
            agents = agents.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.role.toLowerCase().includes(q) ||
                (a.expertise || []).some(e => e.toLowerCase().includes(q))
            );
        }
        return agents;
    }, [agentSearch, selectedSquad]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    const URL_PATTERN = /https?:\/\/[^\s<]+/;
    const URL_REGEX = /(https?:\/\/[^\s<]+)/g;
    const GIF_URL_PATTERN = /^https?:\/\/\S+\.gif(\?[^\s]*)?$/i;

    const renderMessageText = (text) => {
        if (!text) return null;
        const parts = text.split(URL_REGEX);
        return parts.map((part, i) =>
            URL_PATTERN.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer"
                   className="underline text-blue-300 hover:text-blue-200 break-all">
                    {part}
                </a>
            ) : part
        );
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const sendImage = (dataUrl) => {
        const msg = {
            id: Date.now() + Math.random(),
            sender: localUserId,
            senderName: displayName || 'Voce',
            text: '',
            image: dataUrl,
            room: dmTarget ? null : currentRoom,
            dmTo: dmTarget ? dmTarget.userId : undefined,
            timestamp: new Date(),
        };
        setMessages(prev => ({ ...prev, [chatKey]: [...(prev[chatKey] || []), msg] }));
        setImagePreview(null);
        eventBus.emit('chat:send', msg);
    };

    const sendMessage = () => {
        if (imagePreview) { sendImage(imagePreview); return; }
        const text = chatInput.trim();
        if (!text) return;
        const isGifUrl = GIF_URL_PATTERN.test(text);
        const msg = {
            id: Date.now() + Math.random(),
            sender: localUserId,
            senderName: displayName || 'Voce',
            text: isGifUrl ? '' : text,
            image: isGifUrl ? text : undefined,
            room: dmTarget ? null : currentRoom,
            dmTo: dmTarget ? dmTarget.userId : undefined,
            timestamp: new Date(),
        };
        setMessages(prev => ({ ...prev, [chatKey]: [...(prev[chatKey] || []), msg] }));
        setChatInput('');
        eventBus.emit('chat:send', msg);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Collapsed state
    if (!open) {
        return (
            <button
                onClick={onToggle}
                className="fixed top-16 right-0 z-30 bg-gather-card/90 backdrop-blur-sm border border-gather-border border-r-0 rounded-l-xl px-1.5 py-2.5 hover:bg-gray-700/90 transition-colors cursor-pointer"
            >
                <ChevronLeft size={16} className="text-gray-400" />
            </button>
        );
    }

    return (
        <div className="fixed top-0 right-0 h-full w-[320px] z-30 bg-[#111827]/95 backdrop-blur-md border-l border-gather-border flex flex-col">
            {/* Header with tabs */}
            <div className="flex items-center border-b border-gather-border">
                <button
                    onClick={() => setTab('agents')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        tab === 'agents'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                    <Bot size={14} />
                    <span>Agentes</span>
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                        {getAllAgents().length}
                    </span>
                </button>
                <button
                    onClick={() => setTab('chat')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                        tab === 'chat'
                            ? 'text-emerald-400 border-b-2 border-emerald-400'
                            : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                    <MessageCircle size={14} />
                    <span>Chat</span>
                    {activeMessages.length > 0 && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                            {activeMessages.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={onToggle}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2 mr-1"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Tab Content */}
            {tab === 'agents' ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Agent Search */}
                    <div className="px-3 py-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={agentSearch}
                                onChange={e => setAgentSearch(e.target.value)}
                                placeholder="Buscar agente, skill..."
                                className="w-full bg-white/5 border border-gather-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Squad filters */}
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                        <button
                            onClick={() => setSelectedSquad(null)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                                !selectedSquad
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:text-gray-300'
                            }`}
                        >Todos</button>
                        {squads.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSquad(s.id === selectedSquad ? null : s.id)}
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors"
                                style={{
                                    background: selectedSquad === s.id ? s.color : 'rgba(255,255,255,0.05)',
                                    color: selectedSquad === s.id ? '#fff' : '#9ca3af',
                                }}
                            >
                                {s.name.replace('Squad de ', '').replace('Squad ', '').replace('Mestres de ', '')}
                            </button>
                        ))}
                    </div>

                    {/* Agent list */}
                    <div className="flex-1 overflow-y-auto px-2 pb-2">
                        {filteredAgents.map(agent => (
                            <div
                                key={agent.id}
                                className="px-2.5 py-2 mb-1 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-purple-500/10 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span
                                                className="text-[9px] font-bold px-1.5 py-px rounded text-white shrink-0"
                                                style={{ background: agent.squadColor }}
                                            >
                                                {agent.squadName.replace('Squad de ', '').replace('Squad ', '').replace('Mestres de ', '')}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-200 truncate">{agent.name}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate">{agent.role}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={() => onCallAgent(agent.id)}
                                            className="px-2 py-1 bg-purple-500/80 hover:bg-purple-500 rounded text-[10px] font-semibold text-white cursor-pointer transition-colors"
                                        >Chamar</button>
                                        <button
                                            onClick={() => onOpenChat(agent.id)}
                                            className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded text-[10px] font-semibold text-indigo-300 cursor-pointer transition-colors"
                                        >Chat</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Chat header */}
                    <div className="px-3 py-2 border-b border-gather-border">
                        {dmTarget ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDmTarget(null)}
                                    className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                    style={{ backgroundColor: dmTarget.color || '#6366f1' }}
                                >
                                    {dmTarget.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-white font-medium truncate">{dmTarget.name}</span>
                                <span className="text-[10px] text-gray-500 ml-auto">DM</span>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">
                                {currentRoomName ? (
                                    <>Chat: <span className="text-emerald-400 font-medium">{currentRoomName}</span></>
                                ) : (
                                    'Chat Geral'
                                )}
                            </p>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                        {activeMessages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <MessageCircle size={32} className="text-gray-600 mb-2" />
                                <p className="text-gray-500 text-xs">Nenhuma mensagem ainda</p>
                                <p className="text-gray-600 text-[10px] mt-1">
                                    {dmTarget
                                        ? `Envie uma mensagem para ${dmTarget.name}`
                                        : currentRoomName
                                            ? `Envie uma mensagem para ${currentRoomName}`
                                            : 'Entre em uma sala para conversar'
                                    }
                                </p>
                            </div>
                        )}
                        {activeMessages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === localUserId ? 'items-end' : 'items-start'}`}
                            >
                                <span className="text-[10px] text-gray-500 mb-0.5">{msg.senderName}</span>
                                <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-sm break-words ${
                                    msg.sender === localUserId
                                        ? 'bg-purple-500/30 text-purple-100 rounded-br-sm'
                                        : 'bg-white/10 text-gray-200 rounded-bl-sm'
                                }`}>
                                    {msg.image ? (
                                        <img src={msg.image} alt="" className="max-w-full rounded-lg max-h-48 object-contain"
                                            onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        renderMessageText(msg.text)
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-600 mt-0.5">
                                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Image preview */}
                    {imagePreview && (
                        <div className="px-3 py-2 border-t border-gather-border bg-white/5">
                            <div className="relative inline-block">
                                <img src={imagePreview} alt="Preview" className="max-h-24 rounded-lg" />
                                <button onClick={() => setImagePreview(null)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer">
                                    <X size={10} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Chat input */}
                    <div className="px-3 py-2 border-t border-gather-border">
                        <input type="file" ref={fileInputRef} onChange={handleImageSelect}
                            accept="image/*" className="hidden" />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-9 h-9 shrink-0 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
                            >
                                <ImageIcon size={16} />
                            </button>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Digite uma mensagem..."
                                className="flex-1 bg-white/5 border border-gather-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 transition-colors"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!chatInput.trim() && !imagePreview}
                                className="w-9 h-9 shrink-0 rounded-lg bg-purple-500/80 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center text-white transition-colors cursor-pointer disabled:cursor-default"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
