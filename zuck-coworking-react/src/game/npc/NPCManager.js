import { getAgentsBySquad, getAllSquads } from '../../data/agents';
import { NPCBehavior } from './NPCBehavior';
import { Pathfinder } from './Pathfinder';
import eventBus from '../../utils/eventBus';

const TILE_SIZE = 64;
const AVATAR_COLORS = ['blue', 'red', 'green', 'purple', 'orange', 'pink', 'teal', 'gray'];
const BEHAVIOR_UPDATE_INTERVAL = 500;
const CULL_DISTANCE = 2000;
const NPC_HIT_RADIUS = 32;

// Open area — right side of the map
const AREA_START_X = 69;
const AREA_START_Y = 13;
const AGENTS_PER_ROW = 8;
const COL_SPACING = 1.3;
const ROW_SPACING = 1.6;
const SQUAD_GAP = 0.8;

// Walking speed in pixels per frame
const WALK_SPEED = 3;
const CALLED_SPEED = 4;

export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.npcs = {};
    this._squadLabels = [];
    this._lastBehaviorUpdate = 0;
    this.pathfinder = new Pathfinder(scene);
  }

  init() {
    eventBus.on('npc:call', (agentId) => this.callAgent(agentId));
    eventBus.on('npc:dismiss', (agentId) => this.dismissAgent(agentId));

    // Build pathfinding grid after a short delay (map needs to be fully loaded)
    this.scene.time.delayedCall(500, () => {
      this.pathfinder.buildGrid();
    });
  }

  spawnAll() {
    const squads = getAllSquads();
    let currentRow = 0;

    squads.forEach(squad => {
      const agents = getAgentsBySquad(squad.id);
      const squadRows = Math.ceil(agents.length / AGENTS_PER_ROW);

      // Squad header label
      const headerX = (AREA_START_X + 4) * TILE_SIZE;
      const headerY = (AREA_START_Y + currentRow) * TILE_SIZE - 12;
      const squadLabel = this.scene.add.text(headerX, headerY, squad.name.toUpperCase(), {
        fontSize: '10px',
        fontFamily: 'Inter, system-ui, sans-serif',
        fill: squad.color || '#8b5cf6',
        fontStyle: 'bold',
        letterSpacing: 2,
        align: 'center',
        resolution: 2,
      }).setOrigin(0.5, 1).setDepth(14);
      this._squadLabels.push(squadLabel);

      currentRow += 0.3;

      agents.forEach((agent, index) => {
        const col = index % AGENTS_PER_ROW;
        const row = Math.floor(index / AGENTS_PER_ROW);

        const tileX = AREA_START_X + col * COL_SPACING;
        const tileY = AREA_START_Y + currentRow + row * ROW_SPACING;

        const spawnX = Math.floor(tileX * TILE_SIZE) + TILE_SIZE / 2;
        const spawnY = Math.floor(tileY * TILE_SIZE) + TILE_SIZE / 2;

        this.spawnNPC(agent, spawnX, spawnY);
      });

      currentRow += squadRows * ROW_SPACING + SQUAD_GAP;
    });
  }

  spawnNPC(agent, spawnX, spawnY) {
    if (this.npcs[agent.id]) return;

    const colorIdx = (agent.avatar_color !== null && agent.avatar_color !== undefined)
      ? agent.avatar_color % AVATAR_COLORS.length
      : 0;
    const colorName = AVATAR_COLORS[colorIdx];

    this.scene.createAnimations(colorName);

    const behavior = new NPCBehavior(agent, spawnX, spawnY);
    const initPos = behavior.initPosition();

    const sprite = this.scene.add.sprite(initPos.x, initPos.y, `char_${colorName}`, 0);
    sprite.setScale(2);
    sprite.setDepth(10);

    const shortName = this._shortName(agent.name);

    const nameLabel = this.scene.add.text(initPos.x, initPos.y - 44, shortName, {
      fontSize: '9px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fill: '#e2e8f0',
      backgroundColor: 'rgba(15,15,26,0.9)',
      padding: { x: 4, y: 1 },
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(15);

    sprite.anims.play(`char_${colorName}_idle_down`, true);

    this.npcs[agent.id] = {
      sprite,
      nameLabel,
      behavior,
      colorName,
      agentId: agent.id,
      agentData: agent,
      active: true,
      waypoints: null,    // A* path waypoints
      waypointIndex: 0,   // current waypoint target
    };
  }

  despawnNPC(agentId) {
    const npc = this.npcs[agentId];
    if (!npc) return;
    npc.sprite.destroy();
    npc.nameLabel.destroy();
    delete this.npcs[agentId];
  }

  update(time, delta) {
    const shouldTickBehavior = time - this._lastBehaviorUpdate >= BEHAVIOR_UPDATE_INTERVAL;
    if (shouldTickBehavior) this._lastBehaviorUpdate = time;

    const cam = this.scene.cameras.main;
    const camCX = cam.scrollX + cam.width / 2;
    const camCY = cam.scrollY + cam.height / 2;

    Object.values(this.npcs).forEach(npc => {
      const dx = npc.sprite.x - camCX;
      const dy = npc.sprite.y - camCY;
      const distFromCam = Math.sqrt(dx * dx + dy * dy);

      // Don't cull NPCs that are actively walking (called/returning)
      const isMoving = npc.behavior.state === 'called' || npc.behavior.state === 'returning';
      const shouldBeActive = distFromCam < CULL_DISTANCE || isMoving;

      if (!shouldBeActive) {
        if (npc.active) {
          npc.sprite.setVisible(false);
          npc.nameLabel.setVisible(false);
          npc.active = false;
        }
        return;
      }

      if (!npc.active) {
        npc.sprite.setVisible(true);
        npc.nameLabel.setVisible(true);
        npc.active = true;
      }

      if (shouldTickBehavior) {
        const result = npc.behavior.update(BEHAVIOR_UPDATE_INTERVAL, npc.sprite.x, npc.sprite.y);
        if (result) this._applyBehaviorResult(npc, result);
      }

      if (isMoving && npc.waypoints) {
        this._followPath(npc);
      }

      npc.nameLabel.setPosition(npc.sprite.x, npc.sprite.y - 44);
    });
  }

  _applyBehaviorResult(npc, result) {
    switch (result.type) {
      case 'idle':
        npc.sprite.setScale(2, 2);
        npc.sprite.setDepth(10);
        npc.sprite.anims.play(`char_${npc.colorName}_idle_${result.direction}`, true);
        break;
      case 'arrived':
        npc.sprite.setScale(2, 2);
        npc.sprite.setDepth(10);
        npc.sprite.anims.play(`char_${npc.colorName}_idle_${result.direction}`, true);
        eventBus.emit('npc:arrived', npc.agentId);
        break;
    }
  }

  /**
   * Follow A* path waypoint by waypoint at constant speed.
   */
  _followPath(npc) {
    if (!npc.waypoints || npc.waypointIndex >= npc.waypoints.length) {
      // Reached end of path
      npc.waypoints = null;
      npc.waypointIndex = 0;

      if (npc.behavior.state === 'called') {
        npc.behavior.state = 'idle';
        npc.behavior.direction = 'down';
        npc.sprite.anims.play(`char_${npc.colorName}_idle_down`, true);
        eventBus.emit('npc:arrived', npc.agentId);
      } else if (npc.behavior.state === 'returning') {
        npc.behavior.state = 'idle';
        npc.behavior.direction = 'down';
        npc.sprite.x = npc.behavior.spawnX;
        npc.sprite.y = npc.behavior.spawnY;
        npc.sprite.anims.play(`char_${npc.colorName}_idle_down`, true);
      }
      return;
    }

    const target = npc.waypoints[npc.waypointIndex];
    const dx = target.x - npc.sprite.x;
    const dy = target.y - npc.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const speed = npc.behavior.state === 'called' ? CALLED_SPEED : WALK_SPEED;

    if (dist <= speed) {
      // Reached this waypoint, move to next
      npc.sprite.x = target.x;
      npc.sprite.y = target.y;
      npc.waypointIndex++;
      return;
    }

    // Move toward current waypoint at constant speed
    npc.sprite.x += (dx / dist) * speed;
    npc.sprite.y += (dy / dist) * speed;

    // Update facing direction
    if (Math.abs(dx) > Math.abs(dy)) {
      npc.behavior.direction = dx > 0 ? 'right' : 'left';
    } else {
      npc.behavior.direction = dy > 0 ? 'down' : 'up';
    }

    npc.sprite.setScale(2, 2);
    npc.sprite.setDepth(10);
    npc.sprite.anims.play(`char_${npc.colorName}_walk_${npc.behavior.direction}`, true);
  }

  callAgent(agentId) {
    const npc = this.npcs[agentId];
    if (!npc) return;

    const player = this.scene.player;
    if (!player) return;

    const targetX = player.x + 50;
    const targetY = player.y;

    // Calculate A* path from NPC to player
    const path = this.pathfinder.findPath(npc.sprite.x, npc.sprite.y, targetX, targetY);

    if (path && path.length > 0) {
      npc.waypoints = path;
      npc.waypointIndex = 0;
      npc.behavior.state = 'called';
      npc.behavior.targetX = targetX;
      npc.behavior.targetY = targetY;
    } else {
      // Fallback: direct line if no path found (shouldn't happen in open area)
      npc.waypoints = [{ x: targetX, y: targetY }];
      npc.waypointIndex = 0;
      npc.behavior.state = 'called';
      npc.behavior.targetX = targetX;
      npc.behavior.targetY = targetY;
    }

    npc.sprite.setVisible(true);
    npc.nameLabel.setVisible(true);
    npc.active = true;
  }

  dismissAgent(agentId) {
    const npc = this.npcs[agentId];
    if (!npc) return;

    const path = this.pathfinder.findPath(
      npc.sprite.x, npc.sprite.y,
      npc.behavior.spawnX, npc.behavior.spawnY
    );

    if (path && path.length > 0) {
      npc.waypoints = path;
      npc.waypointIndex = 0;
      npc.behavior.state = 'returning';
    } else {
      npc.waypoints = [{ x: npc.behavior.spawnX, y: npc.behavior.spawnY }];
      npc.waypointIndex = 0;
      npc.behavior.state = 'returning';
    }
  }

  getNPCAt(worldX, worldY) {
    let closest = null;
    let closestDist = NPC_HIT_RADIUS;

    Object.values(this.npcs).forEach(npc => {
      if (!npc.active) return;
      const dx = npc.sprite.x - worldX;
      const dy = npc.sprite.y - worldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = npc;
      }
    });

    return closest;
  }

  _shortName(name) {
    const first = name.split(' ')[0];
    return first.length > 14 ? first.substring(0, 12) + '..' : first;
  }
}
