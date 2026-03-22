import React, { useState } from 'react';
import { Wifi, WifiOff, Mic, MicOff, Video, VideoOff, Monitor, Lock, Unlock, DoorOpen, Bot } from 'lucide-react';

function Tooltip({ text, children }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            {show && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                    <span className="text-gray-200 text-xs font-medium">{text}</span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-2 h-2 bg-gray-900/95 border-r border-b border-gray-700 rotate-45 -translate-y-1" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function HUD({
    connected, micEnabled, camEnabled, onToggleMic, onToggleCam,
    currentRoom, currentRoomName, roomLocked, peersInRoom,
    onScreenShare, isScreenSharing, onLockRoom, onUnlockRoom,
    nearSeat, isSitting, onToggleAgents, sidebarOpen
}) {
    return (
        <div className="gather-hud">
            {/* Top Bar */}
            <div
                className="absolute top-4 right-4 flex items-center justify-between pointer-events-none transition-all duration-300"
                style={{ left: sidebarOpen ? 296 : 40 }}
            >
                {/* Logo & Connection Status */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="bg-gather-card/90 backdrop-blur-sm border border-gather-border rounded-xl px-4 py-2 flex items-center gap-2">
                        {connected ? (
                            <div className="flex items-center gap-1.5 text-emerald-400">
                                <Wifi size={14} />
                                <span className="text-xs">Conectado</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-red-400">
                                <WifiOff size={14} />
                                <span className="text-xs">Reconectando...</span>
                            </div>
                        )}
                    </div>

                    {/* Room indicator */}
                    {currentRoomName && (
                        <div className="bg-gather-card/90 backdrop-blur-sm border border-gather-border rounded-xl px-4 py-2 flex items-center gap-2">
                            <DoorOpen size={14} className="text-purple-400" />
                            <span className="text-white text-sm font-medium">{currentRoomName}</span>
                            {peersInRoom > 0 && (
                                <span className="text-xs text-emerald-400 ml-1">({peersInRoom} conectado{peersInRoom > 1 ? 's' : ''})</span>
                            )}
                            {roomLocked && <Lock size={12} className="text-yellow-400 ml-1" />}
                        </div>
                    )}
                </div>

                {/* Agents Button */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                        onClick={onToggleAgents}
                        className="bg-gather-card/90 backdrop-blur-sm border border-purple-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 hover:bg-purple-900/40 transition-colors cursor-pointer"
                    >
                        <Bot size={16} className="text-purple-400" />
                        <span className="text-white text-sm font-medium">Agentes</span>
                        <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-1.5 py-0.5 rounded-md">136</span>
                    </button>
                </div>
            </div>

            {/* Seat Prompt */}
            {(nearSeat || isSitting) && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="bg-gather-card/95 backdrop-blur-sm border border-purple-500/50 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
                        <kbd className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono font-bold">X</kbd>
                        <span className="text-white text-sm font-medium">
                            {isSitting ? 'Levantar' : 'Sentar'}
                        </span>
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="bg-gather-card/90 backdrop-blur-sm border border-gather-border rounded-xl px-3 py-2 flex items-center gap-3">
                    {/* Mic Button */}
                    <Tooltip text={micEnabled ? 'Desligar microfone' : 'Ligar microfone'}>
                        <button
                            onClick={onToggleMic}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                micEnabled
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                        >
                            {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>
                    </Tooltip>

                    {/* Camera Button */}
                    <Tooltip text={camEnabled ? 'Desligar camera' : 'Ligar camera'}>
                        <button
                            onClick={onToggleCam}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                camEnabled
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    : 'bg-gray-600/40 text-gray-400 hover:bg-gray-600/60'
                            }`}
                        >
                            {camEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                        </button>
                    </Tooltip>

                    {/* Screen Share — visible when in a room with peers OR when actively sharing */}
                    {(isScreenSharing || (currentRoom && peersInRoom > 0)) && (
                        <>
                            <div className="w-px h-6 bg-gather-border" />
                            <Tooltip text={isScreenSharing ? 'Parar compartilhamento (ou use a barra do navegador)' : 'Compartilhar tela'}>
                                <button
                                    onClick={onScreenShare}
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                        isScreenSharing
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                    }`}
                                >
                                    <Monitor size={18} />
                                </button>
                            </Tooltip>
                        </>
                    )}

                    {/* Lock/Unlock Room — only when in room with 2+ people */}
                    {currentRoom && peersInRoom >= 2 && (
                        <>
                            {roomLocked ? (
                                <Tooltip text="Destrancar sala">
                                    <button
                                        onClick={onUnlockRoom}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all cursor-pointer"
                                    >
                                        <Unlock size={18} />
                                    </button>
                                </Tooltip>
                            ) : (
                                <Tooltip text="Trancar sala">
                                    <button
                                        onClick={onLockRoom}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-600/40 text-gray-400 hover:bg-gray-600/60 transition-all cursor-pointer"
                                    >
                                        <Lock size={18} />
                                    </button>
                                </Tooltip>
                            )}
                        </>
                    )}

                    <div className="w-px h-6 bg-gather-border" />

                    {/* Movement keys */}
                    <div className="flex items-center gap-1.5">
                        <kbd className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono">W</kbd>
                        <kbd className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono">A</kbd>
                        <kbd className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono">S</kbd>
                        <kbd className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono">D</kbd>
                        <span className="text-gray-400 text-[10px] ml-1">Mover</span>
                    </div>
                    <div className="w-px h-4 bg-gather-border" />
                    <div className="flex items-center gap-1.5">
                        <kbd className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono">X</kbd>
                        <span className="text-gray-400 text-[10px] ml-1">{isSitting ? 'Sair' : 'Sentar'}</span>
                    </div>
                    <div className="w-px h-4 bg-gather-border" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 text-[10px]">Scroll zoom</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
