import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

function useSpeaking(stream) {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (!stream) { setIsSpeaking(false); return; }
        const audioTracks = stream.getAudioTracks();
        if (!audioTracks.length) { setIsSpeaking(false); return; }

        let ctx;
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch { return; }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        let rafId;
        let lastUpdate = 0;

        const check = (ts) => {
            rafId = requestAnimationFrame(check);
            if (ts - lastUpdate < 100) return;
            lastUpdate = ts;
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const avg = sum / data.length;
            setIsSpeaking(avg > 12);
        };
        rafId = requestAnimationFrame(check);

        return () => {
            cancelAnimationFrame(rafId);
            source.disconnect();
            ctx.close().catch(() => {});
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

            {/* Name + Mic row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                maxWidth: 120,
            }}>
                <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: micEnabled
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {micEnabled
                        ? <Mic size={10} color="#fff" />
                        : <MicOff size={10} color="#fff" />
                    }
                </div>
                <span style={{
                    color: '#e2e8f0',
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {isLocal ? 'Voce' : name}
                </span>
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
