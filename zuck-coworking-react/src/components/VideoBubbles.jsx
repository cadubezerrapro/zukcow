import React, { useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

function worldToScreen(worldX, worldY, camera) {
    if (!camera) return { x: -9999, y: -9999 };
    const x = (worldX - camera.scrollX) * camera.zoom + camera.width / 2;
    const y = (worldY - camera.scrollY) * camera.zoom + camera.height / 2;
    return { x, y };
}

function VideoBubble({ stream, name, worldX, worldY, cameraInfo, isLocal, micEnabled }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const { x, y } = worldToScreen(worldX, worldY, cameraInfo);
    const size = isLocal ? 64 : 80;
    const offsetY = isLocal ? -90 : -100;

    // Don't render if off-screen
    if (!cameraInfo || x < -100 || x > cameraInfo.width + 100 || y < -200 || y > cameraInfo.height + 100) {
        return null;
    }

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                left: x - size / 2,
                top: y + offsetY - size,
                transition: 'left 0.1s linear, top 0.1s linear',
                zIndex: 20,
            }}
        >
            <div className="flex flex-col items-center">
                {/* Video circle */}
                <div
                    className="relative rounded-full overflow-hidden border-2 shadow-lg"
                    style={{
                        width: size,
                        height: size,
                        borderColor: micEnabled ? '#22c55e' : '#6b7280',
                    }}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={isLocal}
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    {/* Mic indicator */}
                    <div className="absolute bottom-0 right-0 p-0.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            micEnabled ? 'bg-emerald-500' : 'bg-red-500'
                        }`}>
                            {micEnabled
                                ? <Mic size={10} className="text-white" />
                                : <MicOff size={10} className="text-white" />
                            }
                        </div>
                    </div>
                </div>
                {/* Name label */}
                {!isLocal && (
                    <div className="mt-1 bg-black/70 rounded px-2 py-0.5">
                        <span className="text-white text-[10px] font-medium">{name}</span>
                    </div>
                )}
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

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 15 }}>
            {/* Local player video bubble */}
            {camEnabled && localStream && playerPos && (
                <VideoBubble
                    stream={localStream}
                    name="Voce"
                    worldX={playerPos.x}
                    worldY={playerPos.y}
                    cameraInfo={cameraInfo}
                    isLocal={true}
                    micEnabled={micEnabled}
                />
            )}

            {/* Remote player video bubbles */}
            {Object.entries(remoteStreams).map(([peerId, stream]) => {
                const user = onlineUsers[peerId];
                if (!user) return null;
                // Only show if in same room
                if (currentRoom && user.current_room !== currentRoom) return null;

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
                    />
                );
            })}
        </div>
    );
}
