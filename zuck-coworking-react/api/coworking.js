import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const HEARTBEAT_TTL = 30; // seconds before user is considered offline
const SIGNAL_TTL = 30;

// Simple user ID from query/header (no PHP session — uses a client-generated ID)
function getUserId(req) {
    return req.headers['x-user-id'] || null;
}

function getUserName(req) {
    return req.headers['x-user-name'] || 'Usuario';
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-User-Name');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const action = req.query.action || '';

    // Admin actions that don't require auth (accessible via browser)
    if (action === 'purge') return handlePurge(res, req);
    if (action === 'debug_users') return handleDebugUsers(res, req);

    const userId = getUserId(req);
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Nao autorizado - X-User-Id header required' });
    }

    const userName = getUserName(req);

    try {
        switch (action) {
            case 'join': return await handleJoin(res, userId, userName, req);
            case 'leave': return await handleLeave(res, userId);
            case 'update_position': return await handleUpdatePosition(res, userId, req);
            case 'get_users': return await handleGetUsers(res, req);
            case 'heartbeat': return await handleHeartbeat(res, userId);
            case 'set_display_name': return await handleSetDisplayName(res, userId, req);
            case 'send_signal': return await handleSendSignal(res, userId, req);
            case 'get_signals': return await handleGetSignals(res, userId);
            case 'lock_room': return await handleLockRoom(res, userId, req);
            case 'unlock_room': return await handleUnlockRoom(res, userId, req);
            case 'get_room_locks': return await handleGetRoomLocks(res, req);
            default:
                return res.json({ success: false, message: 'Acao invalida' });
        }
    } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ success: false, message: 'Erro interno' });
    }
}

function parseBody(req) {
    if (req.method === 'POST') {
        // Handle URL-encoded body
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

// --- Handlers ---

async function handleJoin(res, userId, userName, req) {
    const body = parseBody(req);
    const spaceId = parseInt(body.space_id || '1');

    const userData = {
        user_id: userId,
        x: 608,
        y: 480,
        direction: 'down',
        name: userName,
        avatar_sprite: 'default',
        status: 'available',
        current_room: null,
        is_online: true,
        last_heartbeat: Date.now()
    };

    // Check if user already exists (keep position but always update name from header)
    const existing = await redis.hget(`cowork:space:${spaceId}:users`, userId);
    if (existing) {
        const ex = typeof existing === 'string' ? JSON.parse(existing) : existing;
        userData.x = ex.x || 608;
        userData.y = ex.y || 480;
        userData.direction = ex.direction || 'down';
        // Always use the name from the header (most up-to-date)
        userData.name = userName !== 'Usuario' ? userName : (ex.name || userName);
        userData.avatar_sprite = ex.avatar_sprite || 'default';
    }

    await redis.hset(`cowork:space:${spaceId}:users`, { [userId]: JSON.stringify(userData) });
    await redis.set(`cowork:heartbeat:${userId}`, Date.now(), { ex: HEARTBEAT_TTL });

    const users = await getOnlineUsers(spaceId);

    return res.json({
        success: true,
        message: 'Conectado ao escritorio',
        data: {
            space_id: spaceId,
            users,
            your_position: { x: userData.x, y: userData.y, direction: userData.direction }
        }
    });
}

async function handleLeave(res, userId) {
    // Mark offline in all spaces
    for (let spaceId = 1; spaceId <= 3; spaceId++) {
        const raw = await redis.hget(`cowork:space:${spaceId}:users`, userId);
        if (raw) {
            const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
            user.is_online = false;
            await redis.hset(`cowork:space:${spaceId}:users`, { [userId]: JSON.stringify(user) });
        }
    }
    await redis.del(`cowork:heartbeat:${userId}`);
    return res.json({ success: true, message: 'Desconectado' });
}

async function handleUpdatePosition(res, userId, req) {
    const body = parseBody(req);
    let x = parseInt(body.x || '0');
    let y = parseInt(body.y || '0');
    let direction = body.direction || 'down';
    let currentRoom = body.current_room || null;
    const isSitting = body.is_sitting === '1';

    const validDirs = ['up', 'down', 'left', 'right'];
    if (!validDirs.includes(direction)) direction = 'down';

    x = Math.max(0, Math.min(5120, x));
    y = Math.max(0, Math.min(3584, y));

    if (currentRoom) {
        currentRoom = currentRoom.replace(/[^a-z0-9_]/g, '').substring(0, 50);
        if (!currentRoom) currentRoom = null;
    }

    // Find user in spaces
    for (let spaceId = 1; spaceId <= 3; spaceId++) {
        const raw = await redis.hget(`cowork:space:${spaceId}:users`, userId);
        if (raw) {
            const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (user.is_online) {
                user.x = x;
                user.y = y;
                user.direction = direction;
                user.current_room = currentRoom;
                user.is_sitting = isSitting;
                user.last_heartbeat = Date.now();
                await redis.hset(`cowork:space:${spaceId}:users`, { [userId]: JSON.stringify(user) });
                await redis.set(`cowork:heartbeat:${userId}`, Date.now(), { ex: HEARTBEAT_TTL });
                break;
            }
        }
    }

    return res.json({ success: true });
}

async function handleGetUsers(res, req) {
    const spaceId = parseInt(req.query.space_id || '1');
    const users = await getOnlineUsers(spaceId);
    return res.json({ success: true, data: users });
}

async function handleHeartbeat(res, userId) {
    await redis.set(`cowork:heartbeat:${userId}`, Date.now(), { ex: HEARTBEAT_TTL });

    // Update heartbeat in user data
    for (let spaceId = 1; spaceId <= 3; spaceId++) {
        const raw = await redis.hget(`cowork:space:${spaceId}:users`, userId);
        if (raw) {
            const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (user.is_online) {
                user.last_heartbeat = Date.now();
                await redis.hset(`cowork:space:${spaceId}:users`, { [userId]: JSON.stringify(user) });
                break;
            }
        }
    }

    return res.json({ success: true });
}

async function handleSetDisplayName(res, userId, req) {
    const body = parseBody(req);
    const name = (body.display_name || '').trim();

    if (!name || name.length > 30) {
        return res.json({ success: false, message: 'Nome invalido' });
    }

    for (let spaceId = 1; spaceId <= 3; spaceId++) {
        const raw = await redis.hget(`cowork:space:${spaceId}:users`, userId);
        if (raw) {
            const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
            user.name = name;
            await redis.hset(`cowork:space:${spaceId}:users`, { [userId]: JSON.stringify(user) });
        }
    }

    return res.json({ success: true, message: 'Nome atualizado' });
}

async function handleSendSignal(res, userId, req) {
    const body = parseBody(req);
    const toUserId = body.to_user_id;
    const signalType = body.signal_type;
    const payload = body.payload;

    if (!toUserId || !signalType || !payload) {
        return res.json({ success: false, message: 'Parametros invalidos' });
    }

    const validTypes = ['offer', 'answer', 'ice_candidate'];
    if (!validTypes.includes(signalType)) {
        return res.json({ success: false, message: 'Tipo de sinal invalido' });
    }

    const signal = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from_user_id: userId,
        signal_type: signalType,
        payload
    };

    const key = `cowork:signals:${toUserId}`;
    await redis.lpush(key, JSON.stringify(signal));
    await redis.expire(key, SIGNAL_TTL);

    return res.json({ success: true });
}

async function handleGetSignals(res, userId) {
    const key = `cowork:signals:${userId}`;
    const len = await redis.llen(key);

    const signals = [];
    if (len > 0) {
        for (let i = 0; i < Math.min(len, 50); i++) {
            const raw = await redis.rpop(key);
            if (raw) {
                const signal = typeof raw === 'string' ? JSON.parse(raw) : raw;
                signals.push(signal);
            }
        }
    }

    return res.json({ success: true, signals });
}

async function handleLockRoom(res, userId, req) {
    const body = parseBody(req);
    const roomId = (body.room_id || '').replace(/[^a-z0-9_]/g, '').substring(0, 50);
    const spaceId = parseInt(body.space_id || '1');

    if (!roomId) {
        return res.json({ success: false, message: 'room_id obrigatorio' });
    }

    await redis.hset(`cowork:space:${spaceId}:locks`, {
        [roomId]: JSON.stringify({ locked_by: userId, locked_at: new Date().toISOString() })
    });

    return res.json({ success: true, message: 'Sala trancada' });
}

async function handleUnlockRoom(res, userId, req) {
    const body = parseBody(req);
    const roomId = (body.room_id || '').replace(/[^a-z0-9_]/g, '').substring(0, 50);
    const spaceId = parseInt(body.space_id || '1');

    if (!roomId) {
        return res.json({ success: false, message: 'room_id obrigatorio' });
    }

    await redis.hdel(`cowork:space:${spaceId}:locks`, roomId);
    return res.json({ success: true, message: 'Sala destrancada' });
}

async function handleGetRoomLocks(res, req) {
    const spaceId = parseInt(req.query.space_id || '1');
    const allLocks = await redis.hgetall(`cowork:space:${spaceId}:locks`) || {};

    const locks = {};
    for (const [roomId, raw] of Object.entries(allLocks)) {
        const lock = typeof raw === 'string' ? JSON.parse(raw) : raw;
        locks[roomId] = lock;
    }

    return res.json({ success: true, locks });
}

// Purge all users from a space (admin cleanup)
async function handlePurge(res, req) {
    const spaceId = parseInt(req.query.space_id || '1');
    await redis.del(`cowork:space:${spaceId}:users`);
    return res.json({ success: true, message: `Todos usuarios do space ${spaceId} removidos` });
}

// Debug: show raw user data in Redis
async function handleDebugUsers(res, req) {
    const spaceId = parseInt(req.query.space_id || '1');
    const allUsers = await redis.hgetall(`cowork:space:${spaceId}:users`) || {};
    const now = Date.now();
    const debug = {};
    for (const [uid, raw] of Object.entries(allUsers)) {
        const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
        debug[uid] = {
            ...user,
            _age_seconds: Math.round((now - user.last_heartbeat) / 1000),
            _expired: (now - user.last_heartbeat) > HEARTBEAT_TTL * 1000
        };
    }
    return res.json({ success: true, space_id: spaceId, heartbeat_ttl: HEARTBEAT_TTL, users: debug });
}

// --- Helpers ---

async function getOnlineUsers(spaceId) {
    const allUsers = await redis.hgetall(`cowork:space:${spaceId}:users`) || {};
    const now = Date.now();
    const users = {};
    const staleIds = [];

    for (const [uid, raw] of Object.entries(allUsers)) {
        const user = typeof raw === 'string' ? JSON.parse(raw) : raw;

        // Check if heartbeat is still valid
        if (!user.is_online) {
            staleIds.push(uid);
            continue;
        }
        if (now - user.last_heartbeat > HEARTBEAT_TTL * 1000) {
            staleIds.push(uid);
            continue;
        }

        users[uid] = {
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

    // Clean up stale users from Redis completely
    if (staleIds.length > 0) {
        await redis.hdel(`cowork:space:${spaceId}:users`, ...staleIds);
    }

    return users;
}
