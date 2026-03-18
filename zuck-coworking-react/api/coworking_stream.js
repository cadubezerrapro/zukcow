import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const HEARTBEAT_TTL = 30;

function parseBody(req) {
    if (req.method === 'POST') {
        if (typeof req.body === 'string') {
            const params = new URLSearchParams(req.body);
            const obj = {};
            for (const [k, v] of params) obj[k] = v;
            return obj;
        }
        return req.body || {};
    }
    return {};
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-User-Name');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const userId = req.headers['x-user-id'] || req.query.user_id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Nao autorizado' });
    }

    const spaceId = parseInt(req.query.space_id || '1');

    try {
        const now = Date.now();

        // If POST with position data, update position in Redis first
        if (req.method === 'POST') {
            const body = parseBody(req);
            if (body.x !== undefined && body.y !== undefined) {
                const raw = await redis.hget(`cowork:space:${spaceId}:users`, userId);
                if (raw) {
                    const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (user.is_online) {
                        user.x = parseInt(body.x);
                        user.y = parseInt(body.y);
                        user.direction = body.direction || user.direction;
                        user.current_room = body.current_room || null;
                        user.is_sitting = body.is_sitting === '1';
                        user.is_in_kart = body.is_in_kart === '1';
                        user.last_heartbeat = now;
                        await redis.hset(`cowork:space:${spaceId}:users`, { [userId]: JSON.stringify(user) });
                    }
                }
            }
        }

        // Get online users
        const allUsers = await redis.hgetall(`cowork:space:${spaceId}:users`) || {};
        const players = {};
        const staleIds = [];

        for (const [uid, raw] of Object.entries(allUsers)) {
            const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (!user.is_online || now - user.last_heartbeat > HEARTBEAT_TTL * 1000) {
                staleIds.push(uid);
                continue;
            }

            players[uid] = {
                x: user.x,
                y: user.y,
                direction: user.direction,
                name: user.name || 'Usuario',
                avatar_sprite: user.avatar_sprite,
                status: user.status || 'available',
                custom_message: user.custom_message || null,
                current_room: user.current_room || null,
                is_sitting: user.is_sitting || false,
                is_in_kart: user.is_in_kart || false
            };
        }

        // Clean up stale users
        if (staleIds.length > 0) {
            await redis.hdel(`cowork:space:${spaceId}:users`, ...staleIds);
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

        // Auto-unlock rooms with < 2 occupants
        for (const [roomId] of Object.entries(roomLocks)) {
            let count = 0;
            for (const p of Object.values(players)) {
                if (p.current_room === roomId) count++;
            }
            if (count < 2) {
                await redis.hdel(`cowork:space:${spaceId}:locks`, roomId);
                delete roomLocks[roomId];
            }
        }

        // Get furniture version
        const furnitureVersion = parseInt(await redis.get(`cowork:space:${spaceId}:furniture_version`) || '0');

        const data = {
            type: 'positions',
            players,
            room_locks: roomLocks,
            furniture_version: furnitureVersion,
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
