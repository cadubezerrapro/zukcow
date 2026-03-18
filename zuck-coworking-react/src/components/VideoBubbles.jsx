import React, { useRef, useEffect, useState } from 'react';

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

function ScreenTile({ stream }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
        }}>
            <div style={{
                width: 260,
                height: 160,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#000',
                border: '3px solid #3b82f6',
                boxShadow: '0 0 12px rgba(59,130,246,0.3), 0 4px 12px rgba(0,0,0,0.4)',
            }}>
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
            <span style={{
                color: '#93c5fd',
                fontSize: 11,
                fontWeight: 500,
            }}>
                Tela compartilhada
            </span>
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

    if (!hasLocalMedia && !hasRemoteStreams && !hasScreen && roomPeers.length === 0) return null;

    return (
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
                {/* Screen share tile */}
                {hasScreen && <ScreenTile stream={screenStream} />}

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
    );
}
