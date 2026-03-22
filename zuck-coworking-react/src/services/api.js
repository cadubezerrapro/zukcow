import axios from 'axios';

const isVercel = !window.location.pathname.startsWith('/conta/');
const API_BASE = isVercel ? '/api/coworking' : '/conta/api/coworking.php';

// Generate or retrieve a persistent user ID
function getLocalUserId() {
    let id = localStorage.getItem('cowork_user_id');
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cowork_user_id', id);
    }
    return id;
}

function getLocalUserName() {
    return localStorage.getItem('cowork_user_name') || 'Usuario';
}

const api = axios.create({
    baseURL: '',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    withCredentials: !isVercel
});

// Add user ID headers for Vercel API
if (isVercel) {
    api.interceptors.request.use((config) => {
        config.headers['X-User-Id'] = getLocalUserId();
        config.headers['X-User-Name'] = getLocalUserName();
        return config;
    });
}

export { getLocalUserId, getLocalUserName };

function buildParams(obj) {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, v);
    });
    return params;
}

export async function joinSpace(spaceId = 1) {
    const { data } = await api.post(`${API_BASE}?action=join`, buildParams({ space_id: spaceId }));
    return data;
}

export async function leaveSpace() {
    const { data } = await api.post(`${API_BASE}?action=leave`, buildParams({}));
    return data;
}

export async function updatePosition(x, y, direction, currentRoom = null, isSitting = false, isInKart = false) {
    const avatarColor = localStorage.getItem('cowork_avatar_color') || '0';
    const { data } = await api.post(`${API_BASE}?action=update_position`, buildParams({ x, y, direction, current_room: currentRoom, is_sitting: isSitting ? '1' : '0', is_in_kart: isInKart ? '1' : '0', avatar_color: avatarColor }));
    return data;
}

export async function getOnlineUsers(spaceId = 1) {
    const { data } = await api.get(`${API_BASE}?action=get_users&space_id=${spaceId}`);
    return data;
}

export async function heartbeat() {
    const { data } = await api.post(`${API_BASE}?action=heartbeat`, buildParams({}));
    return data;
}

export async function getSpaceInfo(spaceId = 1) {
    const { data } = await api.get(`${API_BASE}?action=get_space&space_id=${spaceId}`);
    return data;
}

export async function setDisplayName(name) {
    const { data } = await api.post(`${API_BASE}?action=set_display_name`, buildParams({ display_name: name }));
    return data;
}

// WebRTC Signaling
export async function sendSignal(toUserId, signalType, payload) {
    const { data } = await api.post(`${API_BASE}?action=send_signal`, buildParams({
        to_user_id: toUserId,
        signal_type: signalType,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload)
    }));
    return data;
}

export async function getSignals() {
    const { data } = await api.get(`${API_BASE}?action=get_signals`);
    return data;
}

// Room Locking
export async function lockRoom(roomId, spaceId = 1) {
    const { data } = await api.post(`${API_BASE}?action=lock_room`, buildParams({ room_id: roomId, space_id: spaceId }));
    return data;
}

export async function unlockRoom(roomId, spaceId = 1) {
    const { data } = await api.post(`${API_BASE}?action=unlock_room`, buildParams({ room_id: roomId, space_id: spaceId }));
    return data;
}

export async function getRoomLocks(spaceId = 1) {
    const { data } = await api.get(`${API_BASE}?action=get_room_locks&space_id=${spaceId}`);
    return data;
}

// Furniture sync
export async function sendFurnitureEdit(edit, spaceId = 1) {
    const { data } = await api.post(`${API_BASE}?action=furniture_edit`, buildParams({
        edit: JSON.stringify(edit),
        space_id: spaceId
    }));
    return data;
}

export async function getFurnitureEdits(sinceIndex = 0, spaceId = 1) {
    const { data } = await api.get(`${API_BASE}?action=get_furniture&space_id=${spaceId}&since=${sinceIndex}`);
    return data;
}

// Tags
export async function saveTags(targetUserId, tags) {
    const { data } = await api.post(`${API_BASE}?action=save_tags`, buildParams({
        target_user_id: targetUserId,
        dept: tags.dept || '',
        level_name: tags.levelName || '',
        skills: JSON.stringify(tags.skills || []),
        custom_tags: JSON.stringify(tags.customTags || []),
    }));
    return data;
}

export async function getAllTags() {
    const { data } = await api.get(`${API_BASE}?action=get_tags`);
    return data;
}
