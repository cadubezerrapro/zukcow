import eventBus from '../utils/eventBus';
import { getLocalUserId } from './api';

const isVercel = !window.location.pathname.startsWith('/conta/');
const SSE_URL = isVercel ? '/api/coworking_stream' : '/conta/api/coworking_stream.php';

class SSEService {
    constructor() {
        this.eventSource = null;
        this.pollInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.spaceId = 1;
        this._pendingPosition = null;
    }

    // Called by the game scene to queue position for next poll
    setLocalPosition(x, y, direction, currentRoom, isSitting, isInKart) {
        this._pendingPosition = { x, y, direction, current_room: currentRoom, is_sitting: isSitting, is_in_kart: isInKart };
    }

    connect(spaceId = 1) {
        this.spaceId = spaceId;
        this.disconnect();

        if (isVercel) {
            this.startPolling(spaceId);
        } else {
            this.startSSE(spaceId);
        }
    }

    startPolling(spaceId) {
        this.reconnectAttempts = 0;
        this._pollConnected = false;

        const poll = async () => {
            try {
                const userId = getLocalUserId();
                const pos = this._pendingPosition;
                let response;

                if (pos) {
                    // Combined request: send position + get all players
                    this._pendingPosition = null;
                    const params = new URLSearchParams();
                    params.append('x', Math.round(pos.x));
                    params.append('y', Math.round(pos.y));
                    params.append('direction', pos.direction || 'down');
                    if (pos.current_room) params.append('current_room', pos.current_room);
                    params.append('is_sitting', pos.is_sitting ? '1' : '0');
                    params.append('is_in_kart', pos.is_in_kart ? '1' : '0');

                    response = await fetch(`${SSE_URL}?space_id=${spaceId}&user_id=${userId}`, {
                        method: 'POST',
                        headers: {
                            'X-User-Id': userId,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: params.toString()
                    });
                } else {
                    // Just poll for updates
                    response = await fetch(`${SSE_URL}?space_id=${spaceId}&user_id=${userId}`, {
                        headers: { 'X-User-Id': userId }
                    });
                }

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();

                if (data.type === 'positions') {
                    eventBus.emit('remote:players_update', data.players, {
                        room_locks: data.room_locks,
                        signals: data.signals,
                        furniture_version: data.furniture_version
                    });
                }

                if (!this._pollConnected) {
                    this._pollConnected = true;
                    eventBus.emit('sse:connected');
                }
                this.reconnectAttempts = 0;
            } catch (e) {
                console.warn('Poll error:', e);
                this.reconnectAttempts++;
                if (this._pollConnected) {
                    this._pollConnected = false;
                    eventBus.emit('sse:disconnected');
                }
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    eventBus.emit('sse:max_retries');
                    this.disconnect();
                    return;
                }
            }
        };

        // Poll every 300ms — interpolation handles smoothness
        poll();
        this.pollInterval = setInterval(poll, 300);
    }

    startSSE(spaceId) {
        try {
            this.eventSource = new EventSource(`${SSE_URL}?space_id=${spaceId}`, {
                withCredentials: true
            });

            this.eventSource.onopen = () => {
                this.reconnectAttempts = 0;
                eventBus.emit('sse:connected');
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'positions') {
                        eventBus.emit('remote:players_update', data.players, {
                            room_locks: data.room_locks,
                            signals: data.signals
                        });
                    } else if (data.type === 'join') {
                        eventBus.emit('remote:player_joined', data.player);
                    } else if (data.type === 'leave') {
                        eventBus.emit('remote:player_left', data.user_id);
                    } else if (data.type === 'heartbeat') {
                        // Keep-alive, ignore
                    }
                } catch (e) {
                    console.warn('SSE parse error:', e);
                }
            };

            this.eventSource.onerror = () => {
                this.eventSource.close();
                eventBus.emit('sse:disconnected');
                this.scheduleReconnect();
            };
        } catch (e) {
            console.error('SSE connection error:', e);
            this.scheduleReconnect();
        }
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            eventBus.emit('sse:max_retries');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.min(this.reconnectAttempts, 5);

        setTimeout(() => {
            this.connect(this.spaceId);
        }, delay);
    }
}

const sseService = new SSEService();
export default sseService;
