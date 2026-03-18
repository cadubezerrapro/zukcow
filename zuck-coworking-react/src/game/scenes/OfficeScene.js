import Phaser from 'phaser';
import eventBus from '../../utils/eventBus';
import mapData from '../maps/default_office.json';
import { sendFurnitureEdit, getFurnitureEdits } from '../../services/api';
import sseService from '../../services/sse';

const TILE_SIZE = 64;
const PLAYER_SPEED = 320;
const SPRINT_SPEED = 540;
const KART_SPEED = 640;
const KART_GID = 181;
const POSITION_SEND_INTERVAL = 250;
const AVATAR_COLORS = ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'teal', 'gray'];

const ROOM_ZONES = [
    { id: 'conferencia', name: 'Sala de Conferencia', x1: 2, y1: 12, x2: 18, y2: 17 },
    { id: 'colaborativa', name: 'Area Colaborativa', x1: 20, y1: 12, x2: 40, y2: 17 },
    { id: 'escritorios', name: 'Escritorios', x1: 42, y1: 12, x2: 58, y2: 17 },
    { id: 'servidor', name: 'Server Room', x1: 60, y1: 12, x2: 68, y2: 17 },
    { id: 'workspace_a', name: 'Workspace A', x1: 2, y1: 19, x2: 25, y2: 25 },
    { id: 'workspace_b', name: 'Workspace B', x1: 27, y1: 19, x2: 50, y2: 25 },
    { id: 'reuniao1', name: 'Reuniao 1', x1: 52, y1: 19, x2: 60, y2: 25 },
    { id: 'reuniao2', name: 'Reuniao 2', x1: 61, y1: 19, x2: 68, y2: 25 },
    { id: 'lounge', name: 'Lounge / Cafeteria', x1: 2, y1: 27, x2: 30, y2: 34 },
    { id: 'descanso', name: 'Area de Descanso', x1: 32, y1: 27, x2: 50, y2: 34 },
    { id: 'gameroom', name: 'Game Room', x1: 52, y1: 27, x2: 68, y2: 34 },
];

export class OfficeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OfficeScene' });
        this.remotePlayers = {};
        this.lastSentPosition = { x: 0, y: 0, direction: 'down' };
        this.lastSendTime = 0;
        this.playerDirection = 'down';
        this.currentRoom = null;
        this.isSitting = false;
        this.isInKart = false;
        this.currentSeat = null;
        // Furniture editor
        this.editorMode = false;
        this.movingFurniture = null;
        this.editorHighlight = null;
    }

    create() {
        this.userId = this.registry.get('userId');
        this.userName = this.registry.get('userName');

        this.createMap();
        this.createPlayer();
        this.setupCamera();
        this.setupInput();
        this.setupEventBus();

        eventBus.emit('scene:ready', {
            mapWidth: this.map.widthInPixels,
            mapHeight: this.map.heightInPixels
        });
    }

    createMap() {
        this.cache.tilemap.add('office', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapData });
        this.map = this.make.tilemap({ key: 'office' });

        const tileset = this.map.addTilesetImage('office_tiles', 'office_tiles', 64, 64, 1, 2);

        this.groundLayer = this.map.createLayer('ground', tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('walls', tileset, 0, 0);
        this.wallsLayer.setCollisionByExclusion([0, -1]);

        // Non-collidable tiles: door(4), ceiling_light(34), rug(39), carpets, lily_pad(63), paintings, clock, etc
        const NON_COLLIDE = [4, 34, 39, 63, 67, 68, 69, 70, 78, 79, 97, 98, 40];
        NON_COLLIDE.forEach(gid => this.wallsLayer.setCollision(gid, false));

        // 3rd layer: furniture_front — renders ABOVE the player for depth effect
        this.frontLayer = this.map.createLayer('furniture_front', tileset, 0, 0);
        if (this.frontLayer) {
            this.frontLayer.setDepth(20);
        }

        // Placeholder — colliders will be built AFTER all edits are applied
        this._frontColliders = this.physics.add.staticGroup();

        this.autoRotateChairs();
        this.resetNonRotatableTiles();
        this.applyMapEdits();
        // Build colliders from current frontLayer state (after localStorage edits)
        this.rebuildFrontColliders();
        this.addRoomLabels();

        // Furniture multiplayer sync
        this._furnitureVersion = 0;
        this._furnitureTotal = 0;
        this.loadServerFurniture();

        // Listen for furniture version changes from polling
        eventBus.on('furniture:version_changed', (version) => {
            if (version > this._furnitureVersion) {
                this.fetchNewFurnitureEdits();
            }
        });
    }

    /**
     * Destroy and rebuild all invisible collision bodies for frontLayer tiles.
     * Must be called after any operation that adds/removes frontLayer tiles.
     */
    rebuildFrontColliders() {
        if (this._frontColliders) {
            this._frontColliders.clear(true, true);
        }
        if (this.frontLayer) {
            this.frontLayer.forEachTile(tile => {
                if (tile.index > 0) {
                    const worldX = tile.pixelX + tile.width / 2;
                    const worldY = tile.pixelY + tile.height / 2;
                    const body = this.add.zone(worldX, worldY, tile.width, tile.height);
                    this._frontColliders.add(body);
                }
            });
        }
    }

    async loadServerFurniture() {
        try {
            const result = await getFurnitureEdits(0);
            if (result.success && result.edits.length > 0) {
                result.edits.forEach(edit => {
                    this.applyRemoteEdit(edit);
                });
                this._furnitureVersion = result.version;
                this._furnitureTotal = result.total;
            }
        } catch (e) {
            console.warn('Failed to load server furniture:', e);
        }
        // Re-apply localStorage edits ON TOP of server state so local deletes win
        this.applyMapEdits();
        // Rebuild colliders to match final tile state
        this.rebuildFrontColliders();
    }

    async fetchNewFurnitureEdits() {
        try {
            const result = await getFurnitureEdits(this._furnitureTotal);
            if (result.success && result.edits.length > 0) {
                const myId = window.USER_ID || localStorage.getItem('cowork_user_id') || '';
                result.edits.forEach(edit => {
                    if (edit.by === myId) return;
                    this.applyRemoteEdit(edit);
                });
                this._furnitureVersion = result.version;
                this._furnitureTotal = result.total;
                // Rebuild colliders after remote edits
                this.rebuildFrontColliders();
            }
        } catch (e) {
            console.warn('Failed to fetch new furniture edits:', e);
        }
    }

    autoRotateChairs() {
        const CHAIR_TILES = [27, 28, 36, 125, 126]; // sofa(27), chair(28), puff(36), sofa2x1_L(125), sofa2x1_R(126) GIDs
        const DESK_TILES = [23, 24, 121, 122, 123, 124];  // desk(23), meeting table(24), desk2x2 parts GIDs
        // Chair sprite faces DOWN by default. Rotation is CW.
        // To face UP (desk above): 180°. To face LEFT (desk left): 270°. To face RIGHT (desk right): 90°.
        const dirs = [
            { dx: 0, dy: -1, angle: Math.PI },           // desk above → face up (180°)
            { dx: 0, dy: 1, angle: 0 },                  // desk below → face down (0°, default)
            { dx: -1, dy: 0, angle: Math.PI * 1.5 },     // desk left → face left (270°)
            { dx: 1, dy: 0, angle: Math.PI * 0.5 }       // desk right → face right (90°)
        ];

        this.wallsLayer.forEachTile(tile => {
            if (!CHAIR_TILES.includes(tile.index)) return;
            for (const d of dirs) {
                const adj = this.wallsLayer.getTileAt(tile.x + d.dx, tile.y + d.dy)
                         || (this.frontLayer && this.frontLayer.getTileAt(tile.x + d.dx, tile.y + d.dy));
                if (adj && DESK_TILES.includes(adj.index)) {
                    tile.rotation = d.angle;
                    break;
                }
            }
        });
    }

    resetNonRotatableTiles() {
        // Reset rotation/flip on tiles that shouldn't be rotated
        const ROTATABLE = new Set([23, 24, 27, 28, 29, 31, 35, 36, 82, 83, 89, 93, 107, 108, 109, 110]);
        this.wallsLayer.forEachTile(tile => {
            if (tile.index >= 23 && !ROTATABLE.has(tile.index)) {
                tile.rotation = 0;
                tile.flipX = false;
                tile.flipY = false;
            }
        });
    }

    applyMapEdits() {
        const ROTATABLE = new Set([23, 24, 27, 28, 29, 31, 35, 36]);
        try {
            const edits = JSON.parse(localStorage.getItem('coworking_map_edits') || '[]');
            edits.forEach(edit => {
                const targetLayer = (edit.layer === 'front' && this.frontLayer) ? this.frontLayer : this.wallsLayer;
                if (edit.type === 'rotate') {
                    const tile = targetLayer.getTileAt(edit.x, edit.y);
                    if (tile && ROTATABLE.has(tile.index)) tile.rotation = edit.rotation;
                } else if (edit.type === 'delete') {
                    targetLayer.removeTileAt(edit.x, edit.y);
                    // If no layer specified, also try frontLayer
                    if (!edit.layer && this.frontLayer) {
                        this.frontLayer.removeTileAt(edit.x, edit.y);
                    }
                } else if (edit.type === 'flip') {
                    const tile = targetLayer.getTileAt(edit.x, edit.y);
                    if (tile) tile.flipX = edit.flipX;
                } else if (edit.type === 'place') {
                    targetLayer.putTileAt(edit.tileId, edit.x, edit.y);
                    const tile = targetLayer.getTileAt(edit.x, edit.y);
                    if (tile && edit.rotation) tile.rotation = edit.rotation;
                }
            });
        } catch (e) {
            // Ignore corrupted data
        }
    }

    saveMapEdit(edit) {
        try {
            const edits = JSON.parse(localStorage.getItem('coworking_map_edits') || '[]');
            edits.push(edit);
            localStorage.setItem('coworking_map_edits', JSON.stringify(edits));
        } catch (e) {
            // Ignore storage errors
        }
        // Sync to server for other players
        sendFurnitureEdit(edit).catch(() => {});
    }

    applyRemoteEdit(edit) {
        const ROTATABLE = new Set([23, 24, 27, 28, 29, 31, 35, 36]);
        try {
            const targetLayer = (edit.layer === 'front' && this.frontLayer) ? this.frontLayer : this.wallsLayer;
            if (edit.type === 'delete') {
                // Remove from target layer; if no layer specified, try both
                targetLayer.removeTileAt(edit.x, edit.y);
                if (!edit.layer && this.frontLayer) {
                    this.frontLayer.removeTileAt(edit.x, edit.y);
                }
            } else if (edit.type === 'place') {
                targetLayer.putTileAt(edit.tileId, edit.x, edit.y);
                const tile = targetLayer.getTileAt(edit.x, edit.y);
                if (tile && edit.rotation) tile.rotation = edit.rotation;
            } else if (edit.type === 'rotate') {
                const tile = targetLayer.getTileAt(edit.x, edit.y);
                if (tile && ROTATABLE.has(tile.index)) tile.rotation = edit.rotation;
            } else if (edit.type === 'flip') {
                const tile = targetLayer.getTileAt(edit.x, edit.y);
                if (tile) tile.flipX = edit.flipX;
            }
        } catch (e) {
            // Ignore errors from applying remote edits
        }
    }

    addRoomLabels() {
        const labels = [
            { x: 22, y: 14, text: 'Sala 1', color: '#3498db' },
            { x: 33, y: 14, text: 'Sala 2', color: '#3498db' },
            { x: 43, y: 14, text: 'Sala 3', color: '#3498db' },
            { x: 53, y: 14, text: 'Sala 4', color: '#3498db' },
            { x: 22, y: 21, text: 'Workspace A', color: '#8bc34a' },
            { x: 33, y: 21, text: 'Workspace B', color: '#8bc34a' },
            { x: 43, y: 21, text: 'Area Aberta', color: '#f59e0b' },
            { x: 53, y: 21, text: 'Reuniao', color: '#ec4899' },
            { x: 25, y: 28, text: 'Sala de Conferencia', color: '#8b5cf6' },
            { x: 45, y: 28, text: 'Area Colaborativa', color: '#14b8a6' },
            { x: 31, y: 36, text: 'Lounge / Cafeteria', color: '#f59e0b' },
            { x: 53, y: 36, text: 'Descanso', color: '#ec4899' },
        ];

        labels.forEach(({ x, y, text, color }) => {
            this.add.text(x * TILE_SIZE, y * TILE_SIZE, text, {
                fontSize: '22px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fill: color,
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3,
                backgroundColor: 'rgba(0,0,0,0.75)',
                padding: { x: 12, y: 6 },
                resolution: 2,
                shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.6)', blur: 6, fill: true }
            }).setDepth(5);
        });
    }

    createPlayer() {
        let spawnX = 34 * TILE_SIZE;
        let spawnY = 24 * TILE_SIZE;

        const furniture = this.map.getObjectLayer('furniture');
        if (furniture) {
            const spawn = furniture.objects.find(o => o.type === 'spawn');
            if (spawn) {
                spawnX = spawn.x;
                spawnY = spawn.y;
            }
        }

        // Use saved color from WelcomeModal, fallback to hash
        const savedColor = localStorage.getItem('cowork_avatar_color');
        const colorIdx = savedColor !== null ? parseInt(savedColor) % AVATAR_COLORS.length : this.hashString(this.userId) % AVATAR_COLORS.length;
        this.avatarColor = AVATAR_COLORS[colorIdx];

        this.player = this.physics.add.sprite(spawnX, spawnY, `char_${this.avatarColor}`, 0);
        this.player.setScale(2);
        this.player.setSize(20, 12);
        this.player.setOffset(6, 36);
        this.player.setDepth(10);
        this.player.setCollideWorldBounds(true);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this._frontColliders);

        this.createAnimations(this.avatarColor);

        // Name label with inline green dot
        this.playerNameLabel = this.add.text(0, 0, `\u25CF ${this.userName}`, {
            fontSize: '16px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: 'rgba(20,20,30,0.8)',
            padding: { x: 10, y: 5 },
            align: 'center',
            resolution: 2,
            shadow: { offsetX: 0, offsetY: 1, color: 'rgba(0,0,0,0.5)', blur: 4, fill: true }
        }).setOrigin(0.5, 1).setDepth(15);
        this.onlineDotOverlay = this.add.circle(0, 0, 5, 0x22c55e).setDepth(16);
        this.onlineDotGlow = this.add.circle(0, 0, 8, 0x22c55e, 0.25).setDepth(15);
    }

    createAnimations(colorName) {
        const key = `char_${colorName}`;
        const dirs = ['down', 'left', 'right', 'up'];

        dirs.forEach((dir, d) => {
            const animKey = `${key}_walk_${dir}`;
            if (!this.anims.exists(animKey)) {
                this.anims.create({
                    key: animKey,
                    frames: [
                        { key, frame: d * 3 },
                        { key, frame: d * 3 + 1 },
                        { key, frame: d * 3 },
                        { key, frame: d * 3 + 2 }
                    ],
                    frameRate: 8,
                    repeat: -1
                });
            }

            const idleKey = `${key}_idle_${dir}`;
            if (!this.anims.exists(idleKey)) {
                this.anims.create({
                    key: idleKey,
                    frames: [{ key, frame: d * 3 }],
                    frameRate: 1,
                    repeat: 0
                });
            }
        });
    }

    setupCamera() {
        this.cameras.main.setRoundPixels(true);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(0.75);

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const zoom = this.cameras.main.zoom;
            const newZoom = Phaser.Math.Clamp(zoom - deltaY * 0.003, 0.4, 1.5);
            this.cameras.main.setZoom(newZoom);
        });
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.isJumping = false;
        this.jumpOffset = 0; // visual Y offset for jump (doesn't affect physics)

        // Space to jump (use cursors.space from createCursorKeys)
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.isJumping && !this.isSitting) {
                this.isJumping = true;
                this.jumpOffset = 0;
                // Animate jumpOffset up then down using a tween on a dummy object
                const jumpData = { offset: 0 };
                this.tweens.add({
                    targets: jumpData,
                    offset: -30,
                    duration: 180,
                    ease: 'Quad.easeOut',
                    yoyo: true,
                    onUpdate: () => { this.jumpOffset = jumpData.offset; },
                    onComplete: () => {
                        this.jumpOffset = 0;
                        this.isJumping = false;
                    }
                });
            }
        });

        // X key to sit/stand
        this.input.keyboard.on('keydown-X', () => {
            if (this.isSitting) {
                this.standUp();
            } else if (this._lastNearSeat) {
                this.sitDown(this._lastNearSeat);
            }
        });

        // ESC to cancel move or deselect
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.movingFurniture) {
                this.movingFurniture = null;
                eventBus.emit('furniture:move_end');
            }
            eventBus.emit('furniture:deselected');
        });

        // Helper: remove a furniture tile from the correct layer
        this._removeFurnitureTile = (tileX, tileY, layer) => {
            if (layer === 'front' && this.frontLayer) {
                this.frontLayer.removeTileAt(tileX, tileY);
                this.rebuildFrontColliders();
            } else {
                this.wallsLayer.removeTileAt(tileX, tileY);
            }
        };

        // Helper: find a furniture tile at world coords, checking both layers
        // Note: tile.index = GID (map uses firstgid=1, so GID = tileset_index + 1)
        this._getFurnitureTileAt = (worldX, worldY) => {
            // Structure GIDs to EXCLUDE from selection (walls, floors, water, outdoor ground)
            // These are NOT furniture and should never be selectable
            const STRUCTURE_GIDS = new Set([
                // Floors (GID 1-15): hallway, office, workspace, lounge, meeting, etc
                1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                // Water tiles (GID 53-64)
                53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64,
                // Outdoor ground (GID 65-66, 73-76)
                65, 66, 73, 74, 75, 76,
            ]);

            // Check wallsLayer first
            const wallTile = this.wallsLayer.getTileAtWorldXY(worldX, worldY);
            if (wallTile && wallTile.index > 0 && !STRUCTURE_GIDS.has(wallTile.index)) {
                wallTile._layer = 'walls';
                return wallTile;
            }
            // Check frontLayer
            if (this.frontLayer) {
                const frontTile = this.frontLayer.getTileAtWorldXY(worldX, worldY);
                if (frontTile && frontTile.index > 0) {
                    frontTile._layer = 'front';
                    return frontTile;
                }
            }
            return null;
        };

        // Editor highlight rectangle
        this.editorHighlight = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE)
            .setStrokeStyle(3, 0xfbbf24)
            .setFillStyle(0xfbbf24, 0.15)
            .setDepth(20)
            .setVisible(false);

        // Furniture editor pointer events
        this.input.on('pointermove', (pointer) => {
            if (!this.editorMode) {
                this.editorHighlight.setVisible(false);
                return;
            }
            const worldPt = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const tile = this._getFurnitureTileAt(worldPt.x, worldPt.y);

            if (tile) {
                this.editorHighlight.setPosition(tile.pixelX + TILE_SIZE / 2, tile.pixelY + TILE_SIZE / 2);
                this.editorHighlight.setVisible(true);
                eventBus.emit('furniture:hover', {
                    tileX: tile.x, tileY: tile.y,
                    tileId: tile.index,
                    worldX: tile.pixelX + TILE_SIZE / 2,
                    worldY: tile.pixelY,
                    layer: tile._layer
                });
            } else {
                this.editorHighlight.setVisible(false);
                eventBus.emit('furniture:hover', null);
            }

            // Moving preview
            if (this.movingFurniture) {
                const tileXY = this.wallsLayer.worldToTileXY(worldPt.x, worldPt.y);
                if (tileXY) {
                    this.editorHighlight.setPosition(
                        tileXY.x * TILE_SIZE + TILE_SIZE / 2,
                        tileXY.y * TILE_SIZE + TILE_SIZE / 2
                    );
                    this.editorHighlight.setVisible(true);
                    this.editorHighlight.setStrokeStyle(3, 0x22c55e);
                }
            } else {
                this.editorHighlight.setStrokeStyle(3, 0xfbbf24);
            }
        });

        this.input.on('pointerdown', (pointer) => {
            if (!this.editorMode) return;
            const worldPt = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

            // If moving, place furniture at clicked position
            if (this.movingFurniture) {
                const tileXY = this.wallsLayer.worldToTileXY(worldPt.x, worldPt.y);
                if (tileXY) {
                    const existing = this.wallsLayer.getTileAt(tileXY.x, tileXY.y);
                    if (!existing || existing.index <= 0) {
                        this.wallsLayer.putTileAt(this.movingFurniture.tileId, tileXY.x, tileXY.y);
                        this.saveMapEdit({ type: 'place', x: tileXY.x, y: tileXY.y, tileId: this.movingFurniture.tileId });
                    }
                }
                this.movingFurniture = null;
                eventBus.emit('furniture:move_end');
                return;
            }

            // Select furniture
            const tile = this._getFurnitureTileAt(worldPt.x, worldPt.y);
            if (tile) {
                eventBus.emit('furniture:selected', {
                    tileX: tile.x, tileY: tile.y,
                    tileId: tile.index,
                    worldX: tile.pixelX + TILE_SIZE / 2,
                    worldY: tile.pixelY,
                    layer: tile._layer
                });
            } else {
                eventBus.emit('furniture:deselected');
            }
        });
    }

    setupEventBus() {
        eventBus.on('remote:players_update', (players) => {
            this.updateRemotePlayers(players);
        });

        eventBus.on('remote:player_joined', (player) => {
            this.addRemotePlayer(player);
        });

        eventBus.on('remote:player_left', (userId) => {
            this.removeRemotePlayer(userId);
        });

        // Listen for name changes from React
        eventBus.on('player:name_changed', (newName) => {
            this.userName = newName;
            if (this.playerNameLabel) {
                this.playerNameLabel.setText(`\u25CF ${newName}`);
            }
        });

        // Furniture editor commands
        eventBus.on('editor:toggle', (enabled) => {
            this.editorMode = enabled;
            if (!enabled) {
                this.editorHighlight.setVisible(false);
                this.movingFurniture = null;
            }
        });

        eventBus.on('furniture:start_move', (info) => {
            this._removeFurnitureTile(info.tileX, info.tileY, info.layer);
            this.movingFurniture = info;
            this.saveMapEdit({ type: 'delete', x: info.tileX, y: info.tileY, layer: info.layer });
        });

        eventBus.on('furniture:do_delete', (info) => {
            this._removeFurnitureTile(info.tileX, info.tileY, info.layer);
            this.saveMapEdit({ type: 'delete', x: info.tileX, y: info.tileY, layer: info.layer });
            eventBus.emit('furniture:deselected');
        });

        // Duplicate: keep original, enter placing mode with same tileId
        eventBus.on('furniture:duplicate', (info) => {
            this.movingFurniture = { ...info };
        });

        // Add new furniture from catalog
        eventBus.on('furniture:add_new', (info) => {
            this.editorMode = true;
            this.movingFurniture = { tileId: info.tileId, tileX: -1, tileY: -1 };
        });

        // Rotate: cycle 0° → 90° → 180° → 270° → 0°
        const ROTATABLE = new Set([23, 24, 27, 28, 29, 31, 35, 36]);
        eventBus.on('furniture:rotate', (info) => {
            const tile = this.wallsLayer.getTileAt(info.tileX, info.tileY);
            if (!tile || !ROTATABLE.has(tile.index)) return;
            const step = Math.PI / 2;
            tile.rotation = ((tile.rotation || 0) + step) % (Math.PI * 2);
            this.saveMapEdit({ type: 'rotate', x: info.tileX, y: info.tileY, rotation: tile.rotation });
            eventBus.emit('furniture:selected', { ...info, rotation: tile.rotation });
        });
    }

    update(time) {
        if (!this.player) return;

        // Restore real Y from previous frame's jump offset
        if (this._jumpApplied) {
            this.player.y -= this._jumpApplied;
            this._jumpApplied = 0;
        }

        this.handleMovement();
        this.updateNameLabel();
        this.detectRoom();
        this.checkSeatProximity();
        this.sendPosition(time);
        this.updateRemotePlayerInterpolation(time);
        this.updateAnimatedTiles(time);

        eventBus.emit('player:position', {
            x: this.player.x,
            y: this.player.y,
            direction: this.playerDirection,
            room: this.currentRoom
        });

        // Visual jump: move sprite up + show shadow at real feet position
        if (this.jumpOffset) {
            if (!this.jumpShadow) {
                this.jumpShadow = this.add.ellipse(0, 0, 24, 8, 0x000000, 0.3);
                this.jumpShadow.setDepth(9);
            }
            this.jumpShadow.setPosition(this.player.x, this.player.y + 20);
            this.jumpShadow.setVisible(true);
            // Apply visual offset (negative = up)
            this.player.y += this.jumpOffset;
            this._jumpApplied = this.jumpOffset;
            // Move name label + green dot with jump
            this.playerNameLabel.y += this.jumpOffset;
            this.onlineDotOverlay.y += this.jumpOffset;
            this.onlineDotGlow.y += this.jumpOffset;
        } else if (this.jumpShadow) {
            this.jumpShadow.setVisible(false);
        }

        // Emit camera info for React overlays (VideoBubbles, FurnitureEditor)
        // Use worldView which gives the exact visible world rectangle
        const cam = this.cameras.main;
        const wv = cam.worldView;
        eventBus.emit('camera:update', {
            scrollX: cam.scrollX,
            scrollY: cam.scrollY,
            zoom: cam.zoom,
            width: cam.width,
            height: cam.height,
            worldViewX: wv.x,
            worldViewY: wv.y,
            worldViewW: wv.width,
            worldViewH: wv.height
        });
    }

    handleMovement() {
        // If sitting on a regular seat, block movement
        if (this.isSitting && !this.isInKart) {
            this.player.setVelocity(0, 0);
            return;
        }

        const isSprinting = this.shiftKey && this.shiftKey.isDown && !this.isInKart;
        const speed = this.isInKart ? KART_SPEED : (isSprinting ? SPRINT_SPEED : PLAYER_SPEED);
        let vx = 0;
        let vy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            vx = -speed;
            this.playerDirection = 'left';
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            vx = speed;
            this.playerDirection = 'right';
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            vy = -speed;
            if (vx === 0) this.playerDirection = 'up';
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            vy = speed;
            if (vx === 0) this.playerDirection = 'down';
        }

        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.player.setVelocity(vx, vy);

        const animKey = `char_${this.avatarColor}`;
        if (this.isInKart) {
            // In kart: always idle (no walking legs), face movement direction
            this.player.anims.play(`${animKey}_idle_${this.playerDirection}`, true);
        } else if (vx !== 0 || vy !== 0) {
            this.player.anims.play(`${animKey}_walk_${this.playerDirection}`, true);
        } else {
            this.player.anims.play(`${animKey}_idle_${this.playerDirection}`, true);
        }

        // Update kart sprite position + rotation to follow player direction
        if (this.isInKart && this.kartSprite) {
            this.kartSprite.setPosition(this.player.x, this.player.y);
            // Rotate kart based on direction (tile faces UP by default)
            const dirAngles = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
            this.kartSprite.setRotation(dirAngles[this.playerDirection] || 0);
            // Smoke exhaust effect
            this._updateKartSmoke(vx !== 0 || vy !== 0);
        }
    }

    updateNameLabel() {
        this.playerNameLabel.setPosition(this.player.x, this.player.y - 56);
        // Position green dot overlay on top of the "●" character inside the label
        const labelLeft = this.playerNameLabel.x - this.playerNameLabel.width * this.playerNameLabel.originX;
        const dotX = labelLeft + 12; // aligned with the ● char (padding 8 + ~4 center of char)
        const dotY = this.playerNameLabel.y - this.playerNameLabel.height * this.playerNameLabel.originY + this.playerNameLabel.height / 2;
        this.onlineDotOverlay.setPosition(dotX, dotY);
        this.onlineDotGlow.setPosition(dotX, dotY);
    }

    sendPosition(time) {
        if (time - this.lastSendTime < POSITION_SEND_INTERVAL) return;

        const x = Math.round(this.player.x);
        const y = Math.round(this.player.y);
        const dir = this.playerDirection;

        const sitting = this.isSitting;
        if (x === this.lastSentPosition.x && y === this.lastSentPosition.y && dir === this.lastSentPosition.direction && sitting === this.lastSentPosition.is_sitting) {
            return;
        }

        this.lastSentPosition = { x, y, direction: dir, is_sitting: sitting };
        this.lastSendTime = time;

        // Queue position for next combined poll (no separate API call)
        sseService.setLocalPosition(x, y, dir, this.currentRoom, this.isSitting, this.isInKart);
        eventBus.emit('player:moved', { x, y, direction: dir, is_sitting: this.isSitting, is_in_kart: this.isInKart });
    }

    // --- Remote Players ---

    updateRemotePlayers(players) {
        const remoteUserIds = new Set();

        Object.entries(players).forEach(([id, data]) => {
            if (String(id) === String(this.userId)) return;
            remoteUserIds.add(String(id));

            if (this.remotePlayers[id]) {
                this.remotePlayers[id].targetX = data.x;
                this.remotePlayers[id].targetY = data.y;
                this.remotePlayers[id].targetDirection = data.direction || 'down';
                this.remotePlayers[id].isSitting = !!data.is_sitting;
                this.remotePlayers[id].isInKart = !!data.is_in_kart;
                // Update name if changed
                if (data.name && this.remotePlayers[id].nameLabel) {
                    this.remotePlayers[id].nameLabel.setText(`\u25CF ${data.name}`);
                }
            } else {
                this.addRemotePlayer({
                    user_id: id,
                    x: data.x,
                    y: data.y,
                    direction: data.direction || 'down',
                    name: data.name || `User ${id}`,
                    avatar_sprite: data.avatar_sprite || 'default',
                    is_sitting: !!data.is_sitting,
                    is_in_kart: !!data.is_in_kart
                });
            }
        });

        Object.keys(this.remotePlayers).forEach(id => {
            if (!remoteUserIds.has(id)) {
                this.removeRemotePlayer(id);
            }
        });
    }

    addRemotePlayer(data) {
        const id = String(data.user_id);
        if (this.remotePlayers[id] || id === String(this.userId)) return;

        const colorIdx = this.hashString(id) % AVATAR_COLORS.length;
        const colorName = AVATAR_COLORS[colorIdx];

        this.createAnimations(colorName);

        const sprite = this.add.sprite(data.x, data.y, `char_${colorName}`, 0);
        sprite.setScale(2);
        sprite.setDepth(10);

        const nameLabel = this.add.text(data.x, data.y - 56, `\u25CF ${data.name}`, {
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fill: '#e2e8f0',
            backgroundColor: 'rgba(20,20,30,0.8)',
            padding: { x: 8, y: 4 },
            align: 'center',
            resolution: 2,
            shadow: { offsetX: 0, offsetY: 1, color: 'rgba(0,0,0,0.5)', blur: 4, fill: true }
        }).setOrigin(0.5, 1).setDepth(15);

        const dot = this.add.circle(0, 0, 4, 0x22c55e).setDepth(16);

        this.remotePlayers[id] = {
            sprite,
            nameLabel,
            dot,
            colorName,
            targetX: data.x,
            targetY: data.y,
            targetDirection: data.direction || 'down',
            currentDirection: data.direction || 'down',
            isSitting: !!data.is_sitting,
            isInKart: !!data.is_in_kart,
            kartGfx: null,
            lastInterpTime: 0
        };
    }

    removeRemotePlayer(userId) {
        const id = String(userId);
        const rp = this.remotePlayers[id];
        if (!rp) return;

        rp.sprite.destroy();
        rp.nameLabel.destroy();
        rp.dot.destroy();
        if (rp.kartGfx) { rp.kartGfx.destroy(); rp.kartGfx = null; }
        delete this.remotePlayers[id];
    }

    updateRemotePlayerInterpolation(time) {
        const now = time || performance.now();

        Object.values(this.remotePlayers).forEach(rp => {
            const dx = rp.targetX - rp.sprite.x;
            const dy = rp.targetY - rp.sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Remote player in kart: hide player, show kart sprite with built-in driver
            if (rp.isInKart) {
                rp.sprite.setVisible(false);
                // Create kart sprite if not yet
                if (!rp.kartGfx) {
                    rp.kartGfx = this.add.sprite(rp.sprite.x, rp.sprite.y, 'kart_sprite');
                    rp.kartGfx.setDepth(11);
                    rp.kartGfx.setOrigin(0.5, 0.5);
                }
                // Smooth interpolation — use lerp for kart (smoother than speed-based)
                if (dist > 1000) {
                    rp.sprite.x = rp.targetX;
                    rp.sprite.y = rp.targetY;
                } else if (dist > 2) {
                    const lerpFactor = 0.15; // smooth lerp
                    rp.sprite.x += dx * lerpFactor;
                    rp.sprite.y += dy * lerpFactor;
                } else {
                    rp.sprite.x = rp.targetX;
                    rp.sprite.y = rp.targetY;
                }
                rp.kartGfx.setPosition(rp.sprite.x, rp.sprite.y);
                const dirAngles = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
                rp.kartGfx.setRotation(dirAngles[rp.targetDirection] || 0);
            } else {
                // Not in kart: destroy kart sprite if it existed
                if (rp.kartGfx) {
                    rp.kartGfx.destroy();
                    rp.kartGfx = null;
                }
                rp.sprite.setVisible(true);
                rp.sprite.setCrop();
                rp.sprite.setOrigin(0.5, 0.5);

                if (rp.isSitting) {
                    // Regular seat: snap to position, squish sprite
                    rp.sprite.x = rp.targetX;
                    rp.sprite.y = rp.targetY;
                    rp.sprite.setScale(2, 1.4);
                    rp.sprite.setDepth(12);
                    const idleKey = `char_${rp.colorName}_idle_${rp.targetDirection}`;
                    rp.sprite.anims.play(idleKey, true);
                } else {
                    // Standing: restore scale, interpolate
                    if (rp.sprite.scaleY !== 2) {
                        rp.sprite.setScale(2, 2);
                        rp.sprite.setDepth(10);
                    }

                    if (dist > 2) {
                        if (dist > 1000) {
                            rp.sprite.x = rp.targetX;
                            rp.sprite.y = rp.targetY;
                        } else {
                            const lerpFactor = 0.15;
                            rp.sprite.x += dx * lerpFactor;
                            rp.sprite.y += dy * lerpFactor;
                        }
                        const animKey = `char_${rp.colorName}_walk_${rp.targetDirection}`;
                        rp.sprite.anims.play(animKey, true);
                    } else {
                        rp.sprite.x = rp.targetX;
                        rp.sprite.y = rp.targetY;
                        const idleKey = `char_${rp.colorName}_idle_${rp.targetDirection}`;
                        rp.sprite.anims.play(idleKey, true);
                    }
                }
            }

            rp.lastInterpTime = now;

            rp.nameLabel.setPosition(rp.sprite.x, rp.sprite.y - 56);
            const rlLeft = rp.nameLabel.x - rp.nameLabel.width * rp.nameLabel.originX;
            rp.dot.setPosition(
                rlLeft + 10,
                rp.nameLabel.y - rp.nameLabel.height * rp.nameLabel.originY + rp.nameLabel.height / 2
            );
        });
    }

    // ==========================================
    // ROOM ZONE DETECTION
    // ==========================================
    detectRoom() {
        const tileX = Math.floor(this.player.x / TILE_SIZE);
        const tileY = Math.floor(this.player.y / TILE_SIZE);

        for (const room of ROOM_ZONES) {
            if (tileX >= room.x1 && tileX <= room.x2 && tileY >= room.y1 && tileY <= room.y2) {
                if (this.currentRoom !== room.id) {
                    const oldRoom = this.currentRoom;
                    this.currentRoom = room.id;
                    eventBus.emit('room:entered', { roomId: room.id, name: room.name });
                    if (oldRoom) eventBus.emit('room:left', { roomId: oldRoom });
                }
                return;
            }
        }

        if (this.currentRoom) {
            const oldRoom = this.currentRoom;
            this.currentRoom = null;
            eventBus.emit('room:left', { roomId: oldRoom });
        }
    }

    // ==========================================
    // SEAT SYSTEM
    // ==========================================
    checkSeatProximity() {
        if (this.isSitting) return;

        const tileX = Math.floor(this.player.x / TILE_SIZE);
        const tileY = Math.floor(this.player.y / TILE_SIZE);

        // Sittable GIDs: chair=28, sofa=27, puff=36, sofa2x1_L=125, sofa2x1_R=126, kart=181
        // tile.index = GID, so check directly
        const SITTABLE_GIDS = [28, 27, 36, 125, 126, KART_GID];
        const candidates = [];

        // Range ±2 to compensate for collision stopping player before adjacent tile
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dx === 0 && dy === 0) continue;
                const checkX = tileX + dx;
                const checkY = tileY + dy;
                if (this.wallsLayer) {
                    const tile = this.wallsLayer.getTileAt(checkX, checkY);
                    if (tile && SITTABLE_GIDS.includes(tile.index)) {
                        const dist = Math.abs(dx) + Math.abs(dy);
                        // Bonus: prefer tile in facing direction
                        const dir = this.playerDirection || 'down';
                        let facingBonus = 0;
                        if (dir === 'up' && dy < 0) facingBonus = -0.5;
                        else if (dir === 'down' && dy > 0) facingBonus = -0.5;
                        else if (dir === 'left' && dx < 0) facingBonus = -0.5;
                        else if (dir === 'right' && dx > 0) facingBonus = -0.5;

                        const gid = tile.index;
                        candidates.push({
                            tileX: checkX,
                            tileY: checkY,
                            gid,
                            type: gid === KART_GID ? 'kart' : gid === 28 ? 'chair' : gid === 27 ? 'sofa' : gid === 36 ? 'beanbag' : 'other',
                            score: dist + facingBonus
                        });
                    }
                }
            }
        }

        // Pick closest (with facing bonus)
        candidates.sort((a, b) => a.score - b.score);
        let nearSeat = candidates.length > 0 ? candidates[0] : null;

        // Detect face direction: look for desk/table adjacent to the seat
        if (nearSeat) {
            const DESK_GIDS = [23, 24, 121, 122, 123, 124]; // desk, meeting table, desk2x2 parts GIDs
            let faceDir = this.playerDirection || 'down';
            const neighbors = [
                { dx: 0, dy: -1, dir: 'up' },
                { dx: 0, dy: 1, dir: 'down' },
                { dx: -1, dy: 0, dir: 'left' },
                { dx: 1, dy: 0, dir: 'right' }
            ];
            for (const n of neighbors) {
                const adjTile = this.wallsLayer.getTileAt(nearSeat.tileX + n.dx, nearSeat.tileY + n.dy)
                             || (this.frontLayer && this.frontLayer.getTileAt(nearSeat.tileX + n.dx, nearSeat.tileY + n.dy));
                if (adjTile && DESK_GIDS.includes(adjTile.index)) {
                    faceDir = n.dir;
                    break;
                }
            }
            nearSeat.faceDirection = faceDir;
        }

        if (nearSeat && !this._lastNearSeat) {
            eventBus.emit('seat:nearby', nearSeat);
        } else if (!nearSeat && this._lastNearSeat) {
            eventBus.emit('seat:away');
        }
        this._lastNearSeat = nearSeat;
    }

    sitDown(seatInfo) {
        if (this.isSitting) return;
        this.isSitting = true;
        this.currentSeat = seatInfo;

        const isKart = seatInfo.type === 'kart';
        this.isInKart = isKart;

        const dir = seatInfo.faceDirection || this.playerDirection || 'down';

        // Target: exact center of the furniture tile
        const px = seatInfo.tileX * TILE_SIZE + TILE_SIZE / 2;
        const py = seatInfo.tileY * TILE_SIZE + TILE_SIZE / 2;

        // Stop all movement, teleport to seat
        this.player.setVelocity(0, 0);

        if (isKart) {
            // Kart: keep collision, allow movement at 2x speed
            if (this.player.body) {
                this.player.body.reset(px, py);
            }
            this.player.x = px;
            this.player.y = py;
            // Hide player — driver is drawn into kart_sprite texture
            this.player.setVisible(false);
            // Remember original kart tile position for later restoration
            this.kartOriginTileX = seatInfo.tileX;
            this.kartOriginTileY = seatInfo.tileY;
            // Remove the kart tile from the walls layer only
            if (this.wallsLayer) {
                this.wallsLayer.removeTileAt(seatInfo.tileX, seatInfo.tileY);
            }
            // Kart sprite same size as tile
            this.kartSprite = this.add.sprite(px, py, 'kart_sprite');
            this.kartSprite.setDepth(11);
            this.kartSprite.setOrigin(0.5, 0.5);
            // Clean up old graphics if any
            if (this.kartBack) { this.kartBack.destroy(); this.kartBack = null; }
            this.kartFront = null;
            this.kartSmokeParticles = [];
        } else {
            // Regular seat: disable collision, squish sprite
            if (this.player.body) {
                this.player.body.checkCollision.none = true;
                this.player.body.reset(px, py);
            }
            this.player.x = px;
            this.player.y = py;
            this.player.setScale(2, 1.4);
            this.player.setOffset(6, 42);
            this.player.setDepth(12);
        }

        const animKey = `char_${this.avatarColor}_idle_${dir}`;
        this.player.anims.play(animKey, true);

        eventBus.emit('seat:sat_down', seatInfo);

        // Force send sitting position immediately
        this.lastSentPosition = {};
        this.lastSendTime = 0;
    }

    standUp() {
        if (!this.isSitting) return;
        const seat = this.currentSeat;
        const wasInKart = this.isInKart;
        this.isSitting = false;
        this.currentSeat = null;
        this.isInKart = false;

        // Restore normal scale, offset, depth, visibility, clear crop, origin
        this.player.setScale(2, 2);
        this.player.setOffset(6, 36);
        this.player.setDepth(10);
        this.player.setVisible(true);
        this.player.setCrop();
        this.player.setOrigin(0.5, 0.5);

        if (wasInKart) {
            // Destroy kart visuals
            if (this.kartSprite) { this.kartSprite.destroy(); this.kartSprite = null; }
            if (this.kartBack) { this.kartBack.destroy(); this.kartBack = null; }
            if (this.kartFront) { this.kartFront.destroy(); this.kartFront = null; }
            if (this.kartSmokeParticles) {
                this.kartSmokeParticles.forEach(p => p.destroy());
                this.kartSmokeParticles = null;
            }
            // Place the kart tile back at its original position
            const tileX = this.kartOriginTileX;
            const tileY = this.kartOriginTileY;
            if (this.wallsLayer && tileX != null) {
                const tile = this.wallsLayer.putTileAt(KART_GID, tileX, tileY);
                if (tile) tile.setCollision(true);
            }
            // Step off the kart
            this.player.y -= TILE_SIZE;
        } else {
            // Re-enable collision (kart never disabled it)
            if (this.player.body) {
                this.player.body.checkCollision.none = false;
            }
            // Move AWAY from desk to avoid clipping into it
            const dir = seat?.faceDirection || 'down';
            if (dir === 'up') this.player.y += TILE_SIZE;
            else if (dir === 'down') this.player.y -= TILE_SIZE;
            else if (dir === 'left') this.player.x += TILE_SIZE;
            else if (dir === 'right') this.player.x -= TILE_SIZE;
        }

        eventBus.emit('seat:stood_up');

        // Force send standing position immediately
        this.lastSentPosition = {};
        this.lastSendTime = 0;
    }

    updateAnimatedTiles(time) {
        if (!this.groundLayer) return;
        // Animate water tiles: cycle between water_deep (GID 53) and animation frames (GID 113-116)
        const WATER_BASE = 53;
        const WATER_FRAMES = [53, 113, 114, 115];
        const frame = Math.floor(time / 500) % WATER_FRAMES.length;
        const targetGID = WATER_FRAMES[frame];

        if (this._lastWaterFrame !== targetGID) {
            this._lastWaterFrame = targetGID;
            this.groundLayer.forEachTile(tile => {
                if (tile.index === WATER_BASE || WATER_FRAMES.includes(tile.index)) {
                    tile.index = targetGID;
                }
            });
        }
    }

    _drawKartFull(gfx, cx, cy, dir, color) {
        gfx.clear();
        // Compact kart — noticeably smaller than a 64px tile
        const S = 36;
        const x = cx - S / 2;
        const y = cy - S / 2;

        // Shadow
        gfx.fillStyle(0x000000, 0.18);
        gfx.fillEllipse(cx, cy + S / 2, S + 8, 10);
        // Wheels
        gfx.fillStyle(0x1a1a2e, 1);
        gfx.fillRect(x - 3, y - 1, 8, 9);
        gfx.fillRect(x + S - 5, y - 1, 8, 9);
        gfx.fillRect(x - 3, y + S - 8, 8, 9);
        gfx.fillRect(x + S - 5, y + S - 8, 8, 9);
        // Wheel detail
        gfx.fillStyle(0x333355, 1);
        gfx.fillRect(x - 1, y + 1, 4, 2);
        gfx.fillRect(x + S - 3, y + 1, 4, 2);
        gfx.fillRect(x - 1, y + S - 5, 4, 2);
        gfx.fillRect(x + S - 3, y + S - 5, 4, 2);
        // Body
        gfx.fillStyle(0xdc2626, 1);
        gfx.fillRect(x, y, S, S);
        gfx.fillStyle(0xb91c1c, 1);
        gfx.fillRect(x, cy, S, S / 2);
        gfx.fillRect(x + S - 3, y, 3, S);
        // Body border
        gfx.lineStyle(1, 0x991b1b, 1);
        gfx.strokeRect(x, y, S, S);
        // Cockpit (dark seat area)
        gfx.fillStyle(0x1e293b, 1);
        gfx.fillRect(cx - 10, cy - 10, 20, 20);
        gfx.fillStyle(0x334155, 1);
        gfx.fillRect(cx - 9, cy - 9, 18, 18);

        // Driver head — positioned toward front
        let hx = cx, hy = cy;
        if (dir === 'up') hy = cy - 5;
        else if (dir === 'down') hy = cy + 5;
        else if (dir === 'left') hx = cx - 5;
        else if (dir === 'right') hx = cx + 5;
        // Skin
        gfx.fillStyle(0xf5d0a9, 1);
        gfx.fillRect(hx - 6, hy - 6, 12, 12);
        // Hair (brown)
        gfx.fillStyle(0x5c3317, 1);
        if (dir === 'up') {
            gfx.fillRect(hx - 6, hy - 6, 12, 5);
        } else if (dir === 'down') {
            gfx.fillRect(hx - 6, hy - 6, 12, 4);
        } else {
            gfx.fillRect(hx - 6, hy - 6, 12, 4);
            if (dir === 'left') gfx.fillRect(hx - 6, hy - 2, 4, 8);
            else gfx.fillRect(hx + 3, hy - 2, 4, 8);
        }
        // Eyes
        if (dir !== 'up') {
            gfx.fillStyle(0x000000, 1);
            if (dir === 'down') {
                gfx.fillRect(hx - 4, hy + 1, 3, 3);
                gfx.fillRect(hx + 2, hy + 1, 3, 3);
            } else if (dir === 'left') {
                gfx.fillRect(hx - 4, hy + 1, 3, 3);
            } else {
                gfx.fillRect(hx + 2, hy + 1, 3, 3);
            }
        }
        // Mouth
        if (dir === 'down') {
            gfx.fillStyle(0xc0856a, 1);
            gfx.fillRect(hx - 2, hy + 5, 4, 1);
        }

        // Steering wheel
        gfx.fillStyle(0x555555, 1);
        if (dir === 'up') gfx.fillRect(cx - 4, cy - 15, 8, 3);
        else if (dir === 'down') gfx.fillRect(cx - 4, cy + 13, 8, 3);
        else if (dir === 'left') gfx.fillRect(cx - 15, cy - 4, 3, 8);
        else gfx.fillRect(cx + 13, cy - 4, 3, 8);

        // Racing stripe
        gfx.fillStyle(0xf8fafc, 1);
        if (dir === 'up' || dir === 'down') {
            gfx.fillRect(cx - 1, y, 2, S);
        } else {
            gfx.fillRect(x, cy - 1, S, 2);
        }
        // Headlights
        gfx.fillStyle(0xfde047, 1);
        if (dir === 'up') { gfx.fillRect(x + 4, y, 6, 3); gfx.fillRect(x + S - 10, y, 6, 3); }
        else if (dir === 'down') { gfx.fillRect(x + 4, y + S - 3, 6, 3); gfx.fillRect(x + S - 10, y + S - 3, 6, 3); }
        else if (dir === 'left') { gfx.fillRect(x, y + 4, 3, 6); gfx.fillRect(x, y + S - 10, 3, 6); }
        else { gfx.fillRect(x + S - 3, y + 4, 3, 6); gfx.fillRect(x + S - 3, y + S - 10, 3, 6); }
        // Taillights
        gfx.fillStyle(0xff4444, 1);
        if (dir === 'up') { gfx.fillRect(x + 4, y + S - 3, 5, 3); gfx.fillRect(x + S - 9, y + S - 3, 5, 3); }
        else if (dir === 'down') { gfx.fillRect(x + 4, y, 5, 3); gfx.fillRect(x + S - 9, y, 5, 3); }
        else if (dir === 'left') { gfx.fillRect(x + S - 3, y + 4, 3, 5); gfx.fillRect(x + S - 3, y + S - 9, 3, 5); }
        else { gfx.fillRect(x, y + 4, 3, 5); gfx.fillRect(x, y + S - 9, 3, 5); }
        // Exhaust pipes
        gfx.fillStyle(0x6b7280, 1);
        if (dir === 'up') { gfx.fillRect(cx - 6, y + S, 4, 3); gfx.fillRect(cx + 3, y + S, 4, 3); }
        else if (dir === 'down') { gfx.fillRect(cx - 6, y - 3, 4, 3); gfx.fillRect(cx + 3, y - 3, 4, 3); }
        else if (dir === 'left') { gfx.fillRect(x + S, cy - 6, 3, 4); gfx.fillRect(x + S, cy + 3, 3, 4); }
        else { gfx.fillRect(x - 3, cy - 6, 3, 4); gfx.fillRect(x - 3, cy + 3, 3, 4); }
    }

    _updateKartSmoke(isMoving) {
        if (!this.kartSmokeParticles) return;
        // Spawn big smoke puffs when moving
        if (isMoving) {
            for (let n = 0; n < 3; n++) {
                if (this.kartSmokeParticles.length >= 20) break;
                const dir = this.playerDirection;
                let sx = this.player.x;
                let sy = this.player.y;
                // Position exhaust behind the kart (opposite of movement direction)
                if (dir === 'up') sy += 42;
                else if (dir === 'down') sy -= 42;
                else if (dir === 'left') sx += 42;
                else if (dir === 'right') sx -= 42;
                sx += (Math.random() - 0.5) * 20;
                sy += (Math.random() - 0.5) * 20;
                const size = 6 + Math.random() * 6;
                const puff = this.add.circle(sx, sy, size, 0xbbbbbb, 0.7);
                puff.setDepth(8);
                puff._life = 0;
                puff._maxLife = 20 + Math.random() * 15;
                this.kartSmokeParticles.push(puff);
            }
        }
        // Update — grow, rise, fade
        for (let i = this.kartSmokeParticles.length - 1; i >= 0; i--) {
            const p = this.kartSmokeParticles[i];
            p._life += 1;
            const t = p._life / p._maxLife;
            p.setAlpha(0.7 * (1 - t));
            p.setScale(1 + t * 2.5);
            p.y -= 1.5;
            p.x += (Math.random() - 0.5) * 1;
            if (p._life >= p._maxLife) {
                p.destroy();
                this.kartSmokeParticles.splice(i, 1);
            }
        }
    }

    hashString(str) {
        let hash = 0;
        const s = String(str);
        for (let i = 0; i < s.length; i++) {
            const char = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }
}
