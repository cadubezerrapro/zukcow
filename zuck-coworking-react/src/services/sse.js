import eventBus from '../utils/eventBus';

const SSE_URL = '/conta/api/coworking_stream.php';

class SSEService {
    constructor() {
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        this.spaceId = 1;
    }

    connect(spaceId = 1) {
        this.spaceId = spaceId;
        this.disconnect();

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
