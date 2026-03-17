import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video } from 'lucide-react';

function worldToScreen(worldX, worldY, camera) {
    if (!camera || !camera.worldViewW) return { x: -9999, y: -9999 };
    // Use worldView rect: exact visible world area mapped to screen pixels
    const x = ((worldX - camera.worldViewX) / camera.worldViewW) * camera.width;
    const y = ((worldY - camera.worldViewY) / camera.worldViewH) * camera.height;
    return { x, y };
}

function VideoBubble({ stream, name, worldX, worldY, cameraInfo, isLocal, micEnabled, hasVideo }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const { x, y } = worldToScreen(worldX, worldY, cameraInfo);

    // Don't render if off-screen
    if (!cameraInfo || x < -100 || x > cameraInfo.width + 100 || y < -200 || y > cameraInfo.height + 100) {
        return null;
    }

    // Position above the player sprite
    // The sprite is ~48px tall at 2x scale in world coords; convert to screen px
    const pxPerWorld = cameraInfo.height / cameraInfo.worldViewH;
    const bubbleY = y - 80 * pxPerWorld;

    if (hasVideo && stream) {
        // Video bubble: small circle with video feed
        const size = 44;
        return (
            <div
                className="absolute pointer-events-none"
                style={{
                    left: x - size / 2,
                    top: bubbleY - size - 8,
                    transition: 'left 0.1s linear, top 0.1s linear',
                    zIndex: 20,
                }}
            >
                <div className="flex flex-col items-center">
                    <div
                        style={{
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `2px solid ${micEnabled ? '#22c55e' : '#6b7280'}`,
                            boxShadow: micEnabled
                                ? '0 0 8px rgba(34,197,94,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                    >
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
                    </div>
                    {/* Mic indicator pill below video */}
                    <div style={{
                        marginTop: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        background: micEnabled ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)',
                        borderRadius: 8,
                        padding: '1px 5px',
                        backdropFilter: 'blur(4px)',
                    }}>
                        {micEnabled
                            ? <Mic size={8} color="#fff" />
                            : <MicOff size={8} color="#fff" />
                        }
                    </div>
                </div>
            </div>
        );
    }

    // Mic-only indicator: small elegant pill
    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: x - 12,
                top: bubbleY - 28,
                transition: 'left 0.1s linear, top 0.1s linear',
                zIndex: 20,
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: micEnabled
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: micEnabled
                    ? '0 0 10px rgba(34,197,94,0.5), 0 2px 6px rgba(0,0,0,0.3)'
                    : '0 2px 6px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.3)',
            }}>
                {micEnabled
                    ? <Mic size={11} color="#fff" />
                    : <MicOff size={11} color="#fff" />
                }
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
    playerPos,
    cameraInfo,
    currentRoom
}) {
    if (!cameraInfo) return null;

    const hasLocalVideo = camEnabled && localStream && localStream.getVideoTracks().length > 0;
    const hasLocalMic = micEnabled && localStream;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 15 }}>
            {/* Local player bubble - show if mic or cam enabled */}
            {(hasLocalVideo || hasLocalMic) && playerPos && (
                <VideoBubble
                    stream={localStream}
                    name="Voce"
                    worldX={playerPos.x}
                    worldY={playerPos.y}
                    cameraInfo={cameraInfo}
                    isLocal={true}
                    micEnabled={micEnabled}
                    hasVideo={hasLocalVideo}
                />
            )}

            {/* Remote player video/mic bubbles */}
            {Object.entries(remoteStreams).map(([peerId, stream]) => {
                const user = onlineUsers[peerId];
                if (!user) return null;
                if (currentRoom && user.current_room !== currentRoom) return null;

                const hasVideo = stream.getVideoTracks && stream.getVideoTracks().length > 0;

                return (
                    <VideoBubble
                        key={peerId}
                        stream={stream}
                        name={user.name || `User ${peerId}`}
                        worldX={user.x}
                        worldY={user.y}
                        cameraInfo={cameraInfo}
                        isLocal={false}
                        micEnabled={true}
                        hasVideo={hasVideo}
                    />
                );
            })}
        </div>
    );
}
