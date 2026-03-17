import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createGatherGame } from './game/GatherGame';
import eventBus from './utils/eventBus';
import sseService from './services/sse';
import { joinSpace, leaveSpace, updatePosition, heartbeat, setDisplayName, sendSignal, lockRoom, unlockRoom, getLocalUserId } from './services/api';
import HUD from './components/HUD';
import UserList from './components/UserList';
import WelcomeModal from './components/WelcomeModal';
import VideoOverlay from './components/VideoOverlay';
import VideoBubbles from './components/VideoBubbles';
import FurnitureEditor from './components/FurnitureEditor';

export default function App() {
    const gameContainerRef = useRef(null);
    const gameRef = useRef(null);
    const heartbeatIntervalRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [showUserList, setShowUserList] = useState(true);
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const [showWelcome, setShowWelcome] = useState(true);
    const [displayName, setDisplayNameState] = useState(
        localStorage.getItem('coworking_display_name') || window.USER_NAME || 'Voce'
    );
    const displayNameRef = useRef(displayName);
    displayNameRef.current = displayName;

    // Room state
    const [currentRoom, setCurrentRoom] = useState(null);
    const [currentRoomName, setCurrentRoomName] = useState('');
    const [roomLocks, setRoomLocks] = useState({});
    const currentRoomRef = useRef(null);

    // Media state
    const [micEnabled, setMicEnabled] = useState(false);
    const [camEnabled, setCamEnabled] = useState(false);
    const localStreamRef = useRef(null);
    const localVideoRef = useRef(null);

    // WebRTC state
    const peersRef = useRef({});
    const [remoteStreams, setRemoteStreams] = useState({});

    // Seat state
    const [nearSeat, setNearSeat] = useState(false);
    const [isSitting, setIsSitting] = useState(false);

    // Camera info for VideoBubbles positioning
    const [cameraInfo, setCameraInfo] = useState(null);

    // Furniture editor state
    const [editorMode, setEditorMode] = useState(false);
    const [hoveredFurniture, setHoveredFurniture] = useState(null);
    const [selectedFurniture, setSelectedFurniture] = useState(null);
    const [isMovingFurniture, setIsMovingFurniture] = useState(false);

    // Helper: add a track to all existing peer connections
    const addTrackToPeers = useCallback((track, stream) => {
        Object.values(peersRef.current).forEach(pc => {
            const senders = pc.getSenders();
            const existingSender = senders.find(s => s.track?.kind === track.kind);
            if (existingSender) {
                existingSender.replaceTrack(track);
            } else {
                pc.addTrack(track, stream);
            }
        });
    }, []);

    const toggleMic = useCallback(async () => {
        if (micEnabled) {
            // Disable mic
            if (localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
            }
            setMicEnabled(false);
        } else {
            try {
                if (!localStreamRef.current) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: camEnabled });
                    localStreamRef.current = stream;
                    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                    // Add all tracks to existing peers
                    stream.getTracks().forEach(t => addTrackToPeers(t, stream));
                } else {
                    const audioTracks = localStreamRef.current.getAudioTracks();
                    if (audioTracks.length > 0) {
                        audioTracks.forEach(t => t.enabled = true);
                    } else {
                        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        audioStream.getAudioTracks().forEach(t => {
                            localStreamRef.current.addTrack(t);
                            addTrackToPeers(t, localStreamRef.current);
                        });
                    }
                }
                setMicEnabled(true);
            } catch (err) {
                console.error('Mic access denied:', err);
            }
        }
    }, [micEnabled, camEnabled, addTrackToPeers]);

    const toggleCam = useCallback(async () => {
        if (camEnabled) {
            // Disable camera
            if (localStreamRef.current) {
                localStreamRef.current.getVideoTracks().forEach(t => {
                    t.stop();
                    localStreamRef.current.removeTrack(t);
                });
            }
            setCamEnabled(false);
        } else {
            try {
                if (!localStreamRef.current) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: micEnabled, video: true });
                    localStreamRef.current = stream;
                    if (micEnabled) setMicEnabled(true);
                    // Add all tracks to existing peers
                    stream.getTracks().forEach(t => addTrackToPeers(t, stream));
                } else {
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoStream.getVideoTracks().forEach(t => {
                        localStreamRef.current.addTrack(t);
                        addTrackToPeers(t, localStreamRef.current);
                    });
                }
                if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
                setCamEnabled(true);
            } catch (err) {
                console.error('Camera access denied:', err);
            }
        }
    }, [camEnabled, micEnabled, addTrackToPeers]);

    // Cleanup media on unmount
    useEffect(() => {
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Initialize Phaser game only after welcome modal is dismissed
    useEffect(() => {
        if (showWelcome) return;
        if (gameContainerRef.current && !gameRef.current) {
            gameRef.current = createGatherGame('phaser-container', {
                userId: window.USER_ID || getLocalUserId(),
                userName: displayNameRef.current,
                spaceId: window.SPACE_ID || 1,
            });
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [showWelcome]);

    // Connect to backend only after welcome modal
    useEffect(() => {
        if (showWelcome) return;
        const spaceId = window.SPACE_ID || 1;

        // Subscribe to events BEFORE connecting to avoid race condition
        const unsubConnected = eventBus.on('sse:connected', () => setConnected(true));
        const unsubDisconnected = eventBus.on('sse:disconnected', () => setConnected(false));

        joinSpace(spaceId).then((data) => {
            if (data.success && data.data?.users) {
                setOnlineUsers(data.data.users);
                eventBus.emit('remote:players_update', data.data.users);
            }
        }).catch(err => console.error('Join error:', err));

        sseService.connect(spaceId);

        heartbeatIntervalRef.current = setInterval(() => {
            heartbeat().catch(() => {});
        }, 15000);

        const unsubPlayers = eventBus.on('remote:players_update', (players, extra) => {
            setOnlineUsers(players);
            // Handle room locks from SSE
            if (extra?.room_locks) setRoomLocks(extra.room_locks);
            // Handle WebRTC signals from SSE
            if (extra?.signals) {
                extra.signals.forEach(sig => {
                    handleIncomingSignal(sig.from_user_id, sig.signal_type, sig.payload);
                });
            }
        });

        const unsubMoved = eventBus.on('player:moved', ({ x, y, direction }) => {
            updatePosition(x, y, direction, currentRoomRef.current).catch(() => {});
        });

        const unsubPos = eventBus.on('player:position', (pos) => {
            setPlayerPos(pos);
        });

        // Room enter/leave
        const unsubRoomEnter = eventBus.on('room:entered', ({ roomId, name }) => {
            setCurrentRoom(roomId);
            setCurrentRoomName(name);
            currentRoomRef.current = roomId;
        });

        const unsubRoomLeave = eventBus.on('room:left', () => {
            setCurrentRoom(null);
            setCurrentRoomName('');
            currentRoomRef.current = null;
            // Disconnect all peers when leaving room
            disconnectAllPeers();
        });

        // Seat events
        const unsubSeatNearby = eventBus.on('seat:nearby', () => setNearSeat(true));
        const unsubSeatAway = eventBus.on('seat:away', () => setNearSeat(false));
        const unsubSatDown = eventBus.on('seat:sat_down', () => { setIsSitting(true); setNearSeat(false); });
        const unsubStoodUp = eventBus.on('seat:stood_up', () => setIsSitting(false));

        // Camera info for VideoBubbles
        const unsubCamera = eventBus.on('camera:update', (info) => setCameraInfo(info));

        // Furniture editor events
        const unsubFHover = eventBus.on('furniture:hover', (info) => setHoveredFurniture(info));
        const unsubFSelected = eventBus.on('furniture:selected', (info) => { setSelectedFurniture(info); });
        const unsubFDeselected = eventBus.on('furniture:deselected', () => setSelectedFurniture(null));
        const unsubFMoveEnd = eventBus.on('furniture:move_end', () => { setIsMovingFurniture(false); setSelectedFurniture(null); });

        return () => {
            leaveSpace().catch(() => {});
            sseService.disconnect();
            disconnectAllPeers();
            clearInterval(heartbeatIntervalRef.current);
            unsubConnected();
            unsubDisconnected();
            unsubPlayers();
            unsubMoved();
            unsubPos();
            unsubRoomEnter();
            unsubRoomLeave();
            unsubSeatNearby();
            unsubSeatAway();
            unsubSatDown();
            unsubStoodUp();
            unsubCamera();
            unsubFHover();
            unsubFSelected();
            unsubFDeselected();
            unsubFMoveEnd();
        };
    }, [showWelcome]);

    // Handle window beforeunload
    useEffect(() => {
        const isVercel = !window.location.pathname.startsWith('/conta/');
        const leaveUrl = isVercel ? '/api/coworking?action=leave' : '/conta/api/coworking.php?action=leave';
        const handleUnload = () => {
            if (isVercel) {
                // sendBeacon doesn't support custom headers, use fetch with keepalive
                fetch(leaveUrl, {
                    method: 'POST',
                    headers: { 'X-User-Id': getLocalUserId() },
                    keepalive: true
                }).catch(() => {});
            } else {
                navigator.sendBeacon?.(leaveUrl, '');
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    const handleWelcomeEnter = (name) => {
        setDisplayNameState(name);
        localStorage.setItem('cowork_user_name', name);
        localStorage.setItem('coworking_display_name', name);
        setDisplayName(name).catch(() => {});
        setShowWelcome(false);
    };

    const handleNameChange = (newName) => {
        setDisplayNameState(newName);
        localStorage.setItem('coworking_display_name', newName);
        localStorage.setItem('cowork_user_name', newName);
        setDisplayName(newName).catch(() => {});
        eventBus.emit('player:name_changed', newName);
    };

    // ==========================================
    // WebRTC Functions
    // ==========================================
    const ICE_SERVERS = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ];

    const connectToPeer = useCallback(async (peerId) => {
        if (peersRef.current[peerId]) return; // Already connected

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        // Add local tracks if available
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle remote tracks
        pc.ontrack = (event) => {
            setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
        };

        // ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal(peerId, 'ice_candidate', event.candidate).catch(() => {});
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                disconnectPeer(peerId);
            }
        };

        // Renegotiate when tracks are added/removed after initial connection
        pc.onnegotiationneeded = async () => {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendSignal(peerId, 'offer', pc.localDescription).catch(() => {});
            } catch (e) {
                console.warn('Renegotiation failed:', e);
            }
        };

        peersRef.current[peerId] = pc;

        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(peerId, 'offer', pc.localDescription).catch(() => {});
    }, []);

    const handleIncomingSignal = useCallback(async (fromPeerId, signalType, payload) => {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;

        if (signalType === 'offer') {
            let pc = peersRef.current[fromPeerId];
            if (!pc) {
                pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => {
                        pc.addTrack(track, localStreamRef.current);
                    });
                }

                pc.ontrack = (event) => {
                    setRemoteStreams(prev => ({ ...prev, [fromPeerId]: event.streams[0] }));
                };

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        sendSignal(fromPeerId, 'ice_candidate', event.candidate).catch(() => {});
                    }
                };

                pc.onconnectionstatechange = () => {
                    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                        disconnectPeer(fromPeerId);
                    }
                };

                // Renegotiate when tracks change
                pc.onnegotiationneeded = async () => {
                    try {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        sendSignal(fromPeerId, 'offer', pc.localDescription).catch(() => {});
                    } catch (e) {
                        console.warn('Renegotiation failed:', e);
                    }
                };

                peersRef.current[fromPeerId] = pc;
            }

            await pc.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal(fromPeerId, 'answer', pc.localDescription).catch(() => {});

        } else if (signalType === 'answer') {
            const pc = peersRef.current[fromPeerId];
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data));

        } else if (signalType === 'ice_candidate') {
            const pc = peersRef.current[fromPeerId];
            if (pc) {
                try { await pc.addIceCandidate(new RTCIceCandidate(data)); } catch (e) { /* ignore */ }
            }
        }
    }, []);

    const disconnectPeer = useCallback((peerId) => {
        const pc = peersRef.current[peerId];
        if (pc) {
            pc.close();
            delete peersRef.current[peerId];
        }
        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
    }, []);

    const disconnectAllPeers = useCallback(() => {
        Object.keys(peersRef.current).forEach(peerId => {
            peersRef.current[peerId].close();
        });
        peersRef.current = {};
        setRemoteStreams({});
    }, []);

    // Auto-connect to peers in same room
    useEffect(() => {
        if (!currentRoom) return;

        const myId = String(window.USER_ID || getLocalUserId());
        const peersInRoom = Object.entries(onlineUsers)
            .filter(([id, u]) => String(id) !== myId && u.current_room === currentRoom)
            .map(([id]) => id);

        // Connect to new peers
        peersInRoom.forEach(peerId => {
            if (!peersRef.current[peerId]) {
                connectToPeer(peerId);
            }
        });

        // Disconnect peers no longer in room
        Object.keys(peersRef.current).forEach(peerId => {
            if (!peersInRoom.includes(peerId)) {
                disconnectPeer(peerId);
            }
        });
    }, [currentRoom, onlineUsers, connectToPeer, disconnectPeer]);

    // Screen share
    const startScreenShare = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            // Replace video track in all peer connections
            Object.values(peersRef.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(screenTrack);
                }
            });

            screenTrack.onended = () => {
                // Restore camera track when screen share ends
                const camTrack = localStreamRef.current?.getVideoTracks()[0];
                if (camTrack) {
                    Object.values(peersRef.current).forEach(pc => {
                        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                        if (sender) sender.replaceTrack(camTrack);
                    });
                }
                eventBus.emit('screenshare:stopped');
            };

            eventBus.emit('screenshare:started');
        } catch (err) {
            console.error('Screen share denied:', err);
        }
    }, []);

    // Lock/unlock room
    const handleLockRoom = useCallback(() => {
        if (currentRoom) lockRoom(currentRoom).catch(() => {});
    }, [currentRoom]);

    const handleUnlockRoom = useCallback(() => {
        if (currentRoom) unlockRoom(currentRoom).catch(() => {});
    }, [currentRoom]);

    if (showWelcome) {
        return <WelcomeModal onEnter={handleWelcomeEnter} />;
    }

    const onlineCount = Math.max(1, Object.keys(onlineUsers).length);

    return (
        <div className="w-full h-full relative bg-[#1a1c2e]">
            <div
                id="phaser-container"
                ref={gameContainerRef}
                className="w-full h-full"
            />

            <HUD
                connected={connected}
                onlineCount={onlineCount}
                showUserList={showUserList}
                onToggleUserList={() => setShowUserList(prev => !prev)}
                micEnabled={micEnabled}
                camEnabled={camEnabled}
                onToggleMic={toggleMic}
                onToggleCam={toggleCam}
                currentRoom={currentRoom}
                currentRoomName={currentRoomName}
                roomLocked={!!roomLocks[currentRoom]}
                peersInRoom={currentRoom ? Object.entries(onlineUsers).filter(([id, u]) => String(id) !== String(window.USER_ID || getLocalUserId()) && u.current_room === currentRoom).length : 0}
                onScreenShare={startScreenShare}
                onLockRoom={handleLockRoom}
                onUnlockRoom={handleUnlockRoom}
                nearSeat={nearSeat}
                isSitting={isSitting}
            />

            {showUserList && (
                <UserList
                    users={onlineUsers}
                    currentUserId={window.USER_ID || getLocalUserId()}
                    currentDisplayName={displayName}
                    onNameChange={handleNameChange}
                    onClose={() => setShowUserList(false)}
                />
            )}

            <VideoBubbles
                remoteStreams={remoteStreams}
                onlineUsers={onlineUsers}
                localStream={localStreamRef.current}
                camEnabled={camEnabled}
                micEnabled={micEnabled}
                playerPos={playerPos}
                cameraInfo={cameraInfo}
                currentRoom={currentRoom}
            />

            <VideoOverlay
                camEnabled={camEnabled}
                localVideoRef={localVideoRef}
                localStream={localStreamRef.current}
            />

            <FurnitureEditor
                editorMode={editorMode}
                hoveredFurniture={hoveredFurniture}
                selectedFurniture={selectedFurniture}
                isMoving={isMovingFurniture}
                cameraInfo={cameraInfo}
                onToggleEditor={() => {
                    const next = !editorMode;
                    setEditorMode(next);
                    setSelectedFurniture(null);
                    setIsMovingFurniture(false);
                    eventBus.emit('editor:toggle', next);
                }}
                onMove={(info) => {
                    setIsMovingFurniture(true);
                    setSelectedFurniture(null);
                    eventBus.emit('furniture:start_move', info);
                }}
                onDuplicate={(info) => {
                    setIsMovingFurniture(true);
                    setSelectedFurniture(null);
                    eventBus.emit('furniture:duplicate', info);
                }}
                onRotate={(info) => {
                    eventBus.emit('furniture:rotate', info);
                }}
                onDelete={(info) => {
                    eventBus.emit('furniture:do_delete', info);
                    setSelectedFurniture(null);
                }}
            />
        </div>
    );
}
