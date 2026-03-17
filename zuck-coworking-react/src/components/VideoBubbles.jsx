import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, VideoOff } from 'lucide-react';

function VideoTile({ stream, name, isLocal, micEnabled, hasVideo }) {
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
            minWidth: 72,
        }}>
            {/* Video / Avatar circle */}
            <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                background: hasVideo ? '#000' : 'linear-gradient(135deg, #334155, #1e293b)',
                border: `3px solid ${micEnabled ? '#22c55e' : '#475569'}`,
                boxShadow: micEnabled
                    ? '0 0 12px rgba(34,197,94,0.3), 0 4px 12px rgba(0,0,0,0.4)'
                    : '0 4px 12px rgba(0,0,0,0.4)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s ease',
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
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        userSelect: 'none',
                    }}>
                        {(name || '?')[0]}
                    </span>
                )}

                {/* Mic indicator badge */}
                <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: micEnabled
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0f172a',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}>
                    {micEnabled
                        ? <Mic size={10} color="#fff" />
                        : <MicOff size={10} color="#fff" />
                    }
                </div>

                {/* No video badge */}
                {!hasVideo && (
                    <div style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #0f172a',
                    }}>
                        <VideoOff size={9} color="#94a3b8" />
                    </div>
                )}
            </div>

            {/* Name */}
            <span style={{
                color: '#e2e8f0',
                fontSize: 11,
                fontWeight: 600,
                maxWidth: 80,
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
                gap: 16,
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 16,
                padding: '14px 22px 10px',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
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
