import React, { useRef, useEffect, useState, useCallback } from 'react';

function useSpeaking(stream) {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (!stream) { setIsSpeaking(false); return; }
        const audioTracks = stream.getAudioTracks();
        if (!audioTracks.length || !audioTracks[0].enabled) { setIsSpeaking(false); return; }

        let cancelled = false;
        let ctx, source, analyser, rafId;

        const setup = async () => {
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx.state === 'suspended') await ctx.resume();

                source = ctx.createMediaStreamSource(stream);
                analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.3;
                source.connect(analyser);

                const data = new Uint8Array(analyser.fftSize);
                let lastUpdate = 0;

                const check = (ts) => {
                    if (cancelled) return;
                    rafId = requestAnimationFrame(check);
                    if (ts - lastUpdate < 80) return;
                    lastUpdate = ts;

                    analyser.getByteTimeDomainData(data);
                    let maxDeviation = 0;
                    for (let i = 0; i < data.length; i++) {
                        const deviation = Math.abs(data[i] - 128);
                        if (deviation > maxDeviation) maxDeviation = deviation;
                    }
                    setIsSpeaking(maxDeviation > 10);
                };
                rafId = requestAnimationFrame(check);
            } catch (e) {
                console.warn('VAD setup failed:', e);
            }
        };

        setup();

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (source) source.disconnect();
            if (ctx) ctx.close().catch(() => {});
        };
    }, [stream]);

    return isSpeaking;
}

function VideoTile({ stream, name, isLocal, hasVideo }) {
    const videoRef = useRef(null);
    const isSpeaking = useSpeaking(stream);

    useEffect(() => {
        const el = videoRef.current;
        if (!el || !stream) return;
        el.srcObject = stream;
        el.play().catch(() => {
            el.muted = true;
            el.play().catch(() => {});
        });

        // Auto-resume when browser pauses (screen share dialog, alt-tab, etc.)
        const handlePause = () => {
            if (!document.hidden) {
                el.play().catch(() => {});
            }
        };
        const handleVisibility = () => {
            if (!document.hidden && el.paused) {
                el.play().catch(() => {});
            }
        };
        el.addEventListener('pause', handlePause);
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            el.removeEventListener('pause', handlePause);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [stream, hasVideo]);

    // Dynamic sizing: small circle for avatar, larger rect for video
    const size = hasVideo ? { w: 220, h: 165 } : { w: 56, h: 56 };
    const borderRadius = hasVideo ? 12 : '50%';
    const fontSize = hasVideo ? 11 : 18;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            minWidth: size.w,
        }}>
            <div style={{
                width: size.w,
                height: size.h,
                borderRadius,
                overflow: 'hidden',
                background: hasVideo ? '#000' : 'linear-gradient(135deg, #334155, #1e293b)',
                border: `3px solid ${isSpeaking ? '#22c55e' : '#475569'}`,
                boxShadow: isSpeaking
                    ? '0 0 12px rgba(34,197,94,0.4), 0 4px 12px rgba(0,0,0,0.4)'
                    : '0 4px 12px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}>
                {hasVideo && stream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={isLocal}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: isLocal ? 'scaleX(-1)' : 'none',
                        }}
                    />
                ) : (
                    <span style={{
                        fontSize,
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        userSelect: 'none',
                    }}>
                        {(name || '?')[0]}
                    </span>
                )}
            </div>

            <span style={{
                color: '#cbd5e1',
                fontSize: 11,
                fontWeight: 500,
                maxWidth: size.w + 10,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
            }}>
                {isLocal ? 'Voce' : name}
            </span>
        </div>
    );
}

function ScreenShareWindow({ stream, onStop }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [pos, setPos] = useState({ x: 16, y: 60 });
    const dragging = useRef(null);

    useEffect(() => {
        const el = videoRef.current;
        if (!el || !stream) return;
        el.srcObject = stream;
        const tryPlay = () => el.play().catch(() => {});
        el.onloadedmetadata = tryPlay;
        tryPlay();
        const track = stream.getVideoTracks()[0];
        if (track) track.onunmute = tryPlay;

        // Auto-resume when browser pauses (alt-tab, etc.)
        const handlePause = () => {
            if (!document.hidden) tryPlay();
        };
        const handleVisibility = () => {
            if (!document.hidden && el.paused) tryPlay();
        };
        el.addEventListener('pause', handlePause);
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            if (el) el.onloadedmetadata = null;
            if (track) track.onunmute = null;
            el.removeEventListener('pause', handlePause);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [stream]);

    const onDragStart = useCallback((e) => {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        dragging.current = { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };

        const onMove = (ev) => {
            if (!dragging.current) return;
            setPos({
                x: Math.max(0, ev.clientX - dragging.current.offsetX),
                y: Math.max(0, ev.clientY - dragging.current.offsetY),
            });
        };
        const onUp = () => {
            dragging.current = null;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                zIndex: 60,
                minWidth: 380,
                minHeight: 240,
                resize: 'both',
                overflow: 'hidden',
                borderRadius: 12,
                border: '1px solid rgba(71, 85, 105, 0.5)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4)',
                background: '#1e293b',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
                width: 560,
                height: 350,
            }}
        >
            {/* Header — Discord-style */}
            <div
                onMouseDown={onDragStart}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    cursor: 'grab',
                    background: '#0f172a',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                    flexShrink: 0,
                    userSelect: 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
                    <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Compartilhando tela</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#64748b', fontSize: 10 }}>Arraste para mover</span>
                    {onStop && (
                        <button
                            onClick={onStop}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 10px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.target.style.background = '#dc2626'}
                            onMouseLeave={e => e.target.style.background = '#ef4444'}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
                            </svg>
                            Parar
                        </button>
                    )}
                </div>
            </div>

            {/* Video — fills remaining space, dark background matching theme */}
            <div style={{ flex: 1, background: '#0f172a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            </div>

            {/* Resize handle */}
            <div style={{
                position: 'absolute',
                bottom: 3,
                right: 3,
                width: 14,
                height: 14,
                cursor: 'nwse-resize',
                opacity: 0.3,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
            }}>
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <line x1="9" y1="1" x2="1" y2="9" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="9" y1="5" x2="5" y2="9" stroke="#94a3b8" strokeWidth="1.5" />
                </svg>
            </div>
        </div>
    );
}

export default function VideoBubbles({
    remoteStreams,
    onlineUsers,
    localStream,
    camEnabled,
    micEnabled,
    currentRoom,
    displayName,
    screenStream,
    onStopScreenShare
}) {
    const hasLocalMedia = !!(localStream && (camEnabled || micEnabled));
    const hasScreen = !!(screenStream && screenStream.getVideoTracks().length > 0);

    const myId = String(window.USER_ID || localStorage.getItem('cowork_user_id') || '');
    const roomPeers = currentRoom
        ? Object.entries(onlineUsers).filter(
            ([id, u]) => String(id) !== myId && u.current_room === currentRoom
        )
        : [];

    const hasRemoteStreams = Object.keys(remoteStreams).length > 0;

    const showBubbles = hasLocalMedia || hasRemoteStreams || roomPeers.length > 0;

    return (
        <>
            {/* Screen share — floating window, bottom-right */}
            {hasScreen && <ScreenShareWindow stream={screenStream} onStop={onStopScreenShare} />}

            {/* Video bubbles — top center */}
            {showBubbles && (
                <div style={{
                    position: 'fixed',
                    top: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 50,
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 14,
                        background: 'rgba(15, 23, 42, 0.92)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: 16,
                        padding: '12px 18px 8px',
                        border: '1px solid rgba(71, 85, 105, 0.5)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}>
                        {/* Local user tile */}
                        {hasLocalMedia && (
                            <VideoTile
                                stream={localStream}
                                name={displayName || 'Voce'}
                                isLocal={true}
                                hasVideo={!!(camEnabled && localStream && localStream.getVideoTracks().length > 0)}
                            />
                        )}

                        {/* Remote users with streams */}
                        {Object.entries(remoteStreams).map(([peerId, stream]) => {
                            const user = onlineUsers[peerId];
                            const hasVideo = stream?.getVideoTracks?.().length > 0;
                            return (
                                <VideoTile
                                    key={peerId}
                                    stream={stream}
                                    name={user?.name || `User ${peerId}`}
                                    isLocal={false}
                                    hasVideo={!!hasVideo}
                                />
                            );
                        })}

                        {/* Room peers without streams */}
                        {roomPeers
                            .filter(([id]) => !remoteStreams[id])
                            .map(([peerId, user]) => (
                                <VideoTile
                                    key={peerId}
                                    stream={null}
                                    name={user.name || `User ${peerId}`}
                                    isLocal={false}
                                    hasVideo={false}
                                />
                            ))
                        }
                    </div>
                </div>
            )}
        </>
    );
}
