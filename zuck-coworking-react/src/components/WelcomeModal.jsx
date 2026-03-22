import React, { useState, useRef, useEffect } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { getLocalUserId } from '../services/api';

const AVATAR_COLORS = [
    { name: 'blue', skin: '#f5d6b8', shirt: '#3498db', pants: '#1e3a5f', hair: '#3d2b1f' },
    { name: 'red', skin: '#f5d6b8', shirt: '#dc2626', pants: '#4a1515', hair: '#1a1a2e' },
    { name: 'green', skin: '#e8c49a', shirt: '#10b981', pants: '#064e3b', hair: '#4a3728' },
    { name: 'purple', skin: '#f5d6b8', shirt: '#8b5cf6', pants: '#3b0764', hair: '#2d1b4e' },
    { name: 'orange', skin: '#e8c49a', shirt: '#f59e0b', pants: '#78350f', hair: '#1f1f1f' },
    { name: 'pink', skin: '#f5d6b8', shirt: '#ec4899', pants: '#831843', hair: '#5b3a29' },
    { name: 'teal', skin: '#e8c49a', shirt: '#14b8a6', pants: '#134e4a', hair: '#2c2c2c' },
    { name: 'gray', skin: '#f5d6b8', shirt: '#6b7280', pants: '#374151', hair: '#111827' },
];

function drawAvatarPreview(canvas, colorObj) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const s = 3; // scale
    const ox = (w - 16 * s) / 2;
    const oy = (h - 24 * s) / 2 + 4;

    ctx.clearRect(0, 0, w, h);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(ox + 8 * s, oy + 23 * s, 6 * s, 2.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = colorObj.pants;
    ctx.fillRect(ox + 4 * s, oy + 16 * s, 3 * s, 6 * s);
    ctx.fillRect(ox + 9 * s, oy + 16 * s, 3 * s, 6 * s);

    // Shoes
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(ox + 4 * s, oy + 21 * s, 3 * s, 2 * s);
    ctx.fillRect(ox + 9 * s, oy + 21 * s, 3 * s, 2 * s);

    // Body outline
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(ox + 2.5 * s, oy + 8.5 * s, 11 * s, 9 * s);

    // Body
    ctx.fillStyle = colorObj.shirt;
    ctx.fillRect(ox + 3 * s, oy + 9 * s, 10 * s, 8 * s);

    // Arms
    ctx.fillRect(ox + 1 * s, oy + 10 * s, 2 * s, 5 * s);
    ctx.fillRect(ox + 13 * s, oy + 10 * s, 2 * s, 5 * s);

    // Hands
    ctx.fillStyle = colorObj.skin;
    ctx.fillRect(ox + 1 * s, oy + 15 * s, 2 * s, 2 * s);
    ctx.fillRect(ox + 13 * s, oy + 15 * s, 2 * s, 2 * s);

    // Head outline
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(ox + 3.5 * s, oy + 1.5 * s, 9 * s, 9 * s);

    // Head
    ctx.fillStyle = colorObj.skin;
    ctx.fillRect(ox + 4 * s, oy + 2 * s, 8 * s, 8 * s);

    // Hair
    ctx.fillStyle = colorObj.hair;
    ctx.fillRect(ox + 3 * s, oy + 1 * s, 10 * s, 3 * s);

    // Eyes
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(ox + 5 * s, oy + 5 * s, 2 * s, 2 * s);
    ctx.fillRect(ox + 9 * s, oy + 5 * s, 2 * s, 2 * s);

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 5 * s, oy + 5 * s, 1 * s, 1 * s);
    ctx.fillRect(ox + 9 * s, oy + 5 * s, 1 * s, 1 * s);
}

function hashString(str) {
    let hash = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

export default function WelcomeModal({ onEnter, loading }) {
    const savedName = localStorage.getItem('cowork_user_name') || localStorage.getItem('coworking_display_name');
    const [displayName, setDisplayName] = useState(savedName || window.USER_NAME || '');
    const [selectedColor, setSelectedColor] = useState(() => {
        const saved = localStorage.getItem('cowork_avatar_color');
        if (saved !== null) return parseInt(saved);
        return hashString(window.USER_ID || getLocalUserId()) % AVATAR_COLORS.length;
    });
    const [entering, setEntering] = useState(false);
    const canvasRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        drawAvatarPreview(canvasRef.current, AVATAR_COLORS[selectedColor]);
    }, [selectedColor]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleEnter = () => {
        if (!displayName.trim()) return;
        setEntering(true);
        const name = displayName.trim();
        localStorage.setItem('coworking_display_name', name);
        localStorage.setItem('cowork_user_name', name);
        localStorage.setItem('cowork_avatar_color', selectedColor.toString());
        onEnter(name);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleEnter();
    };

    return (
        <div className="welcome-modal-backdrop">
            <div className="welcome-modal-card">
                {/* Decorative top gradient bar */}
                <div className="welcome-modal-gradient-bar" />

                {/* Logo section */}
                <div className="welcome-modal-logo">
                    <div className="welcome-modal-icon">
                        <Building2 size={28} strokeWidth={1.5} />
                    </div>
                    <h1 className="welcome-modal-title">ZuckPay Coworking</h1>
                    <p className="welcome-modal-subtitle">Escritorio Virtual Colaborativo</p>
                </div>

                {/* Avatar preview */}
                <div className="welcome-modal-avatar-section">
                    <canvas
                        ref={canvasRef}
                        width={96}
                        height={96}
                        className="welcome-modal-avatar-canvas"
                    />
                    <div className="welcome-modal-color-picker">
                        {AVATAR_COLORS.map((c, i) => (
                            <button
                                key={c.name}
                                className={`welcome-modal-color-dot ${i === selectedColor ? 'active' : ''}`}
                                style={{ backgroundColor: c.shirt }}
                                onClick={() => setSelectedColor(i)}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Name input */}
                <div className="welcome-modal-input-section">
                    <label className="welcome-modal-label">Seu nome de exibicao</label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite seu nome..."
                        maxLength={30}
                        className="welcome-modal-input"
                    />
                </div>

                {/* Enter button */}
                <button
                    className="welcome-modal-btn"
                    onClick={handleEnter}
                    disabled={!displayName.trim() || entering || loading}
                >
                    {entering || loading ? (
                        <span className="welcome-modal-btn-loading">
                            <span className="welcome-spinner" />
                            {loading ? 'Carregando escritorio...' : 'Entrando...'}
                        </span>
                    ) : (
                        <span className="welcome-modal-btn-content">
                            Entrar no Escritorio
                            <ArrowRight size={18} />
                        </span>
                    )}
                </button>

                {/* Footer hint */}
                <p className="welcome-modal-hint">
                    {loading ? 'Preparando seu ambiente de trabalho...' : 'Use WASD ou setas para se mover. Scroll para zoom.'}
                </p>
            </div>
        </div>
    );
}
