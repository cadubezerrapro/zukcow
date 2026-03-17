import React, { useEffect, useRef } from 'react';

export default function VideoOverlay({ camEnabled, localVideoRef, localStream }) {
    const videoEl = useRef(null);

    useEffect(() => {
        if (videoEl.current && localStream) {
            videoEl.current.srcObject = localStream;
        }
    }, [localStream, camEnabled]);

    // Also allow parent to set ref
    useEffect(() => {
        if (localVideoRef) {
            localVideoRef.current = videoEl.current;
        }
    }, [localVideoRef]);

    if (!camEnabled) return null;

    return (
        <div className="absolute bottom-20 right-4 z-50">
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-gather-border">
                <video
                    ref={videoEl}
                    autoPlay
                    playsInline
                    muted
                    className="w-40 h-30 object-cover mirror"
                    style={{ transform: 'scaleX(-1)', width: '160px', height: '120px' }}
                />
                <div className="absolute bottom-1 left-2 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-[9px] font-medium drop-shadow">Voce</span>
                </div>
            </div>
        </div>
    );
}
