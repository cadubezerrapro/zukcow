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
        if (el && stream) {
            el.srcObject = stream;
            el.play().catch(() => {
                // Autoplay blocked by browser — retry muted
                el.muted = true;
                el.play().catch(() => {});
            });
        }
    }, [stream, hasVideo]);

    // Dynamic sizing: small circle for avatar, larger rect for video
    const size = hasVideo ? { w: 140, h: 105 } : { w: 56, h: 56 };
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

function ScreenShareWindow({ stream }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [pos, setPos] = useState(null);
    const dragging = useRef(null);

    // Initialize position top-left (below HUD bar)
    useEffect(() => {
        setPos({ x: 16, y: 60 });
    }, []);

    useEffect(() => {
        const el = videoRef.current;
        if (el && stream) {
            el.srcObject = stream;
            el.play().catch(() => {
                el.muted = true;
                el.play().catch(() => {});
            });
        }
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

    if (!pos) return null;

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                zIndex: 60,
                minWidth: 320,
                minHeight: 200,
                resize: 'both',
                overflow: 'hidden',
                borderRadius: 14,
                border: '1px solid rgba(59, 130, 246, 0.4)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(59,130,246,0.15)',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
                width: 420,
                height: 280,
            }}
        >
            {/* Draggable header */}
            <div
                onMouseDown={onDragStart}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    cursor: 'grab',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.4)',
                    flexShrink: 0,
                    userSelect: 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                    <span style={{ color: '#93c5fd', fontSize: 12, fontWeight: 600 }}>Tela compartilhada</span>
                </div>
                <span style={{ color: '#64748b', fontSize: 10 }}>Arraste para mover</span>
            </div>

            {/* Video content - fills remaining space */}
            <div style={{ flex: 1, background: '#000', overflow: 'hidden' }}>
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

            {/* Resize handle indicator */}
            <div style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 14,
                height: 14,
                cursor: 'nwse-resize',
                opacity: 0.4,
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
    screenStream
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
            {hasScreen && <ScreenShareWindow stream={screenStream} />}

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
