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
                // Chrome suspends AudioContext until user interaction
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

                    // Use time domain data (amplitude) — more reliable than frequency
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

function VideoTile({ stream, name, isLocal, micEnabled, hasVideo }) {
    const videoRef = useRef(null);
    const isSpeaking = useSpeaking(stream);

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
            gap: 6,
            minWidth: 120,
        }}>
            {/* Video / Avatar circle */}
            <div style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                background: hasVideo ? '#000' : 'linear-gradient(135deg, #334155, #1e293b)',
                border: `4px solid ${isSpeaking ? '#22c55e' : '#475569'}`,
                boxShadow: isSpeaking
                    ? '0 0 16px rgba(34,197,94,0.4), 0 6px 20px rgba(0,0,0,0.5)'
                    : '0 6px 20px rgba(0,0,0,0.5)',
                position: 'relative',
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
                            transform: 'scaleX(-1)',
                        }}
                    />
                ) : (
                    <span style={{
                        fontSize: 40,
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        userSelect: 'none',
                    }}>
                        {(name || '?')[0]}
                    </span>
                )}

            </div>

            {/* Name */}
            <span style={{
                color: '#e2e8f0',
                fontSize: 13,
                fontWeight: 600,
                maxWidth: 120,
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

export default function VideoBubbles({
    remoteStreams,
    onlineUsers,
    localStream,
    camEnabled,
    micEnabled,
    currentRoom,
    displayName
}) {
    // Determine if we have any local media active
    const hasLocalMedia = !!(localStream && (camEnabled || micEnabled));

    // Collect peers in same room (if in a room)
    const myId = String(window.USER_ID || localStorage.getItem('cowork_user_id') || '');
    const roomPeers = currentRoom
        ? Object.entries(onlineUsers).filter(
            ([id, u]) => String(id) !== myId && u.current_room === currentRoom
        )
        : [];

    // Check if any remote streams exist
    const hasRemoteStreams = Object.keys(remoteStreams).length > 0;

    // Show bar if: mic/cam is active OR there are remote streams OR peers in same room
    if (!hasLocalMedia && !hasRemoteStreams && roomPeers.length === 0) return null;

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
                alignItems: 'flex-start',
                gap: 20,
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 20,
                padding: '18px 28px 14px',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
                {/* Local user tile - always show when media is active */}
                {hasLocalMedia && (
                    <VideoTile
                        stream={localStream}
                        name={displayName || 'Voce'}
                        isLocal={true}
                        micEnabled={micEnabled}
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
                            micEnabled={!!stream}
                            hasVideo={!!hasVideo}
                        />
                    );
                })}

                {/* Room peers without streams (show avatar placeholder) */}
                {roomPeers
                    .filter(([id]) => !remoteStreams[id])
                    .map(([peerId, user]) => (
                        <VideoTile
                            key={peerId}
                            stream={null}
                            name={user.name || `User ${peerId}`}
                            isLocal={false}
                            micEnabled={false}
                            hasVideo={false}
                        />
                    ))
                }
            </div>
        </div>
    );
}
