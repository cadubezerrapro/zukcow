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
    }

    connect(spaceId = 1) {
        this.spaceId = spaceId;
        this.disconnect();

        if (isVercel) {
            // Use polling on Vercel (serverless doesn't support SSE well)
            this.startPolling(spaceId);
        } else {
            // Use SSE on Hostinger
            this.startSSE(spaceId);
        }
    }

    startPolling(spaceId) {
        this.reconnectAttempts = 0;
        eventBus.emit('sse:connected');

        const poll = async () => {
            try {
                const userId = getLocalUserId();
                const response = await fetch(`${SSE_URL}?space_id=${spaceId}&user_id=${userId}`, {
                    headers: { 'X-User-Id': userId }
                });
                const data = await response.json();

                if (data.type === 'positions') {
                    eventBus.emit('remote:players_update', data.players, {
                        room_locks: data.room_locks,
                        signals: data.signals
                    });
                }

                this.reconnectAttempts = 0;
            } catch (e) {
                console.warn('Poll error:', e);
                this.reconnectAttempts++;
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    eventBus.emit('sse:max_retries');
                    this.disconnect();
                    return;
                }
            }
        };

        // Poll every 300ms for smooth multiplayer
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
