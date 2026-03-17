import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const HEARTBEAT_TTL = 60;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-User-Name');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const userId = req.headers['x-user-id'] || req.query.user_id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Nao autorizado' });
    }

    const spaceId = parseInt(req.query.space_id || '1');

    try {
        const now = Date.now();

        // Get online users
        const allUsers = await redis.hgetall(`cowork:space:${spaceId}:users`) || {};
        const players = {};

        for (const [uid, raw] of Object.entries(allUsers)) {
            const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!user.is_online) continue;
            if (now - user.last_heartbeat > HEARTBEAT_TTL * 1000) continue;

            players[uid] = {
                x: user.x,
                y: user.y,
                direction: user.direction,
                name: user.name || 'Usuario',
                avatar_sprite: user.avatar_sprite,
                status: user.status || 'available',
                custom_message: user.custom_message || null,
                current_room: user.current_room || null
            };
        }

        // Get signals for this user
        const signalKey = `cowork:signals:${userId}`;
        const signalLen = await redis.llen(signalKey);
        const signals = [];
        if (signalLen > 0) {
            for (let i = 0; i < Math.min(signalLen, 20); i++) {
                const raw = await redis.rpop(signalKey);
                if (raw) {
                    const signal = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    signals.push(signal);
                }
            }
        }

        // Get room locks
        const lockData = await redis.hgetall(`cowork:space:${spaceId}:locks`) || {};
        const roomLocks = {};
        for (const [roomId, raw] of Object.entries(lockData)) {
            const lock = typeof raw === 'string' ? JSON.parse(raw) : raw;
            roomLocks[roomId] = lock.locked_by;
        }

        const data = {
            type: 'positions',
            players,
            room_locks: roomLocks,
            timestamp: Math.floor(now / 1000)
        };

        if (signals.length > 0) {
            data.signals = signals;
        }

        return res.json(data);
    } catch (err) {
        console.error('Stream error:', err);
        return res.status(500).json({ type: 'error', message: 'Erro interno' });
    }
}
