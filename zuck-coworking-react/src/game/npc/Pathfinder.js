/**
 * A* pathfinding on the tile grid.
 * Builds a walkability map from the Phaser wallsLayer + frontLayer.
 */

const TILE_SIZE = 64;

export class Pathfinder {
  constructor(scene) {
    this.scene = scene;
    this.width = 155;  // map width in tiles
    this.height = 56;  // map height in tiles
    this.grid = null;
  }

  /**
   * Build walkability grid from current map state.
   * Call once after map is loaded and edits applied.
   * grid[y][x] = true means walkable.
   */
  buildGrid() {
    this.grid = [];
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = this._isTileWalkable(x, y);
      }
    }
  }

  _isTileWalkable(x, y) {
    // Check walls layer
    const wallsLayer = this.scene.wallsLayer;
    if (wallsLayer) {
      const tile = wallsLayer.getTileAt(x, y);
      if (tile && tile.collides) return false;
    }

    // Check front layer (furniture)
    const frontLayer = this.scene.frontLayer;
    if (frontLayer) {
      const tile = frontLayer.getTileAt(x, y);
      if (tile && tile.index > 0) return false;
    }

    // Check if there's ground (no ground = not walkable)
    const groundLayer = this.scene.groundLayer;
    if (groundLayer) {
      const tile = groundLayer.getTileAt(x, y);
      if (!tile || tile.index <= 0) return false;
    }

    return true;
  }

  /**
   * Find path from pixel coords to pixel coords.
   * Returns array of {x, y} in pixel coords, or null if no path.
   */
  findPath(fromX, fromY, toX, toY) {
    if (!this.grid) this.buildGrid();

    const startTX = Math.floor(fromX / TILE_SIZE);
    const startTY = Math.floor(fromY / TILE_SIZE);
    const endTX = Math.floor(toX / TILE_SIZE);
    const endTY = Math.floor(toY / TILE_SIZE);

    // Clamp to grid bounds
    const sx = Math.max(0, Math.min(this.width - 1, startTX));
    const sy = Math.max(0, Math.min(this.height - 1, startTY));
    const ex = Math.max(0, Math.min(this.width - 1, endTX));
    const ey = Math.max(0, Math.min(this.height - 1, endTY));

    // If start or end not walkable, find nearest walkable tile
    const start = this._nearestWalkable(sx, sy);
    const end = this._nearestWalkable(ex, ey);
    if (!start || !end) return null;

    const tilePath = this._astar(start.x, start.y, end.x, end.y);
    if (!tilePath) return null;

    // Convert tile path to pixel waypoints (center of each tile)
    // Simplify: skip intermediate points on straight lines
    const waypoints = this._simplifyPath(tilePath);

    return waypoints.map(p => ({
      x: p.x * TILE_SIZE + TILE_SIZE / 2,
      y: p.y * TILE_SIZE + TILE_SIZE / 2,
    }));
  }

  _nearestWalkable(tx, ty) {
    if (this.grid[ty] && this.grid[ty][tx]) return { x: tx, y: ty };

    // Search in expanding radius
    for (let r = 1; r < 10; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = tx + dx;
          const ny = ty + dy;
          if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
            if (this.grid[ny][nx]) return { x: nx, y: ny };
          }
        }
      }
    }
    return null;
  }

  _astar(sx, sy, ex, ey) {
    const openSet = new MinHeap();
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    const key = (x, y) => `${x},${y}`;

    const h = (x, y) => Math.abs(x - ex) + Math.abs(y - ey);

    const sk = key(sx, sy);
    gScore[sk] = 0;
    fScore[sk] = h(sx, sy);
    openSet.push({ x: sx, y: sy, f: fScore[sk] });

    const closedSet = new Set();
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 5000;

    while (openSet.size() > 0 && iterations < MAX_ITERATIONS) {
      iterations++;
      const current = openSet.pop();
      const ck = key(current.x, current.y);

      if (current.x === ex && current.y === ey) {
        // Reconstruct path
        const path = [{ x: ex, y: ey }];
        let k = ck;
        while (cameFrom[k]) {
          const prev = cameFrom[k];
          path.unshift(prev);
          k = key(prev.x, prev.y);
        }
        return path;
      }

      closedSet.add(ck);

      for (const dir of dirs) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        if (!this.grid[ny][nx]) continue;

        const nk = key(nx, ny);
        if (closedSet.has(nk)) continue;

        const tentativeG = gScore[ck] + 1;
        if (tentativeG < (gScore[nk] ?? Infinity)) {
          cameFrom[nk] = { x: current.x, y: current.y };
          gScore[nk] = tentativeG;
          fScore[nk] = tentativeG + h(nx, ny);
          openSet.push({ x: nx, y: ny, f: fScore[nk] });
        }
      }
    }

    return null; // No path found
  }

  _simplifyPath(path) {
    if (path.length <= 2) return path;

    const simplified = [path[0]];
    let prevDir = null;

    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const dir = `${dx},${dy}`;

      if (dir !== prevDir) {
        // Direction changed — add the previous point as a waypoint
        if (i > 1) simplified.push(path[i - 1]);
        prevDir = dir;
      }
    }

    simplified.push(path[path.length - 1]);
    return simplified;
  }
}

/**
 * Simple min-heap for A* open set.
 */
class MinHeap {
  constructor() {
    this.data = [];
  }

  size() {
    return this.data.length;
  }

  push(node) {
    this.data.push(node);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[i].f < this.data[parent].f) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  _sinkDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.data[left].f < this.data[smallest].f) smallest = left;
      if (right < n && this.data[right].f < this.data[smallest].f) smallest = right;
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      } else break;
    }
  }
}
