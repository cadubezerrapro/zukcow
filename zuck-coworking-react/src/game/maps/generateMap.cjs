#!/usr/bin/env node
/**
 * generateMap.js - Generates a Tiled-compatible JSON map for the ZuckPay Coworking Phaser 3 game.
 * Run: node generateMap.js
 * Output: default_office.json in the same directory
 */

const fs = require('fs');
const path = require('path');

// ── Constants ──────────────────────────────────────────────────────────────
const W = 80;
const H = 56;
const TOTAL = W * H;

// GID Reference
const GID = {
  EMPTY: 0,
  WALL_OUTER: 1,
  FLOOR_HALLWAY: 2,
  FLOOR_OFFICE: 3,
  DOOR: 4,
  FLOOR_WORKSPACE: 5,
  FLOOR_LOUNGE: 6,
  FLOOR_MEETING: 7,
  FLOOR_CONFERENCE: 8,
  FLOOR_OPEN: 9,
  FLOOR_OUTDOOR: 10,
  FLOOR_CAFETERIA: 11,
  BREAK_ROOM: 12,
  GRASS_LIGHT: 13,
  GRASS_DENSE: 14,
  STONE_PATH: 15,
  PINE_TREE: 16,
  ROUND_TREE: 17,
  BUSH: 18,
  FLOWER_BED: 19,
  WALL_OUTER_DARK: 20,
  WALL_INNER: 21,
  GLASS_PARTITION: 22,
  DESK: 23,
  MEETING_TABLE: 24,
  PLANT: 25,
  BOOKSHELF: 26,
  SOFA: 27,
  CHAIR: 28,
  WHITEBOARD: 29,
  COFFEE_STATION: 30,
  TV: 31,
  WATER_COOLER: 32,
  STANDING_DESK: 33,
  CEILING_LIGHT: 34,
  PRINTER: 35,
  BEANBAG: 36,
  MINI_FRIDGE: 37,
  COAT_RACK: 38,
  RUG: 39,
  WALL_ART: 40,
  // Wall variants 41-52
  WALL_TOP: 41,
  WALL_BOTTOM: 42,
  WALL_LEFT: 43,
  WALL_RIGHT: 44,
  CORNER_TL: 45,
  CORNER_TR: 46,
  CORNER_BL: 47,
  CORNER_BR: 48,
  T_TOP: 49,
  T_BOTTOM: 50,
  T_LEFT: 51,
  T_RIGHT: 52,
  // Water 53-64
  WATER_DEEP: 53,
  WATER_SHALLOW: 54,
  WATER_EDGE_TOP: 55,
  WATER_EDGE_BOTTOM: 56,
  WATER_EDGE_LEFT: 57,
  WATER_EDGE_RIGHT: 58,
  WATER_CORNER_TL: 59,
  WATER_CORNER_TR: 60,
  WATER_CORNER_BL: 61,
  WATER_CORNER_BR: 62,
  LILY_PAD: 63,
  BRIDGE: 64,
  // Floor variants
  COBBLESTONE: 65,
  SAND: 66,
  CARPET_RED: 67,
  CARPET_BLUE: 68,
  CARPET_GREEN: 69,
  CARPET_PATTERN: 70,
  MARBLE: 71,
  BAMBOO: 72,
  KITCHEN_TILE: 73,
  GRASS_TO_PATH: 74,
  GARDEN_SOIL: 75,
  FLOWER_GARDEN: 76,
  // Furniture
  AQUARIUM: 77,
  PAINTING_LANDSCAPE: 78,
  PAINTING_ABSTRACT: 79,
  VENDING_MACHINE: 80,
  ARCADE: 81,
  POOL_TABLE: 82,
  PING_PONG: 83,
  KITCHEN_COUNTER: 84,
  MICROWAVE: 85,
  RECEPTION_DESK: 86,
  BATHROOM_SINK: 87,
  SERVER_RACK: 88,
  PROJECTOR_SCREEN: 89,
  PODIUM: 90,
  // Front layer items
  MONITOR_FRONT: 100,
  CONF_TABLE_TL: 101,
  CONF_TABLE_TR: 102,
  CONF_TABLE_BL: 103,
  CONF_TABLE_BR: 104,
  DESK_DUAL: 107,
  ROUND_TABLE: 108,
  FOUNTAIN_BASE: 111,
  FOUNTAIN_TOP: 112,
  // Multi-tile objects (2x2, 2x1, 1x2) — tileID + 1
  DESK_2X2_TL: 121,
  DESK_2X2_TR: 122,
  DESK_2X2_BL: 123,
  DESK_2X2_BR: 124,
  SOFA_2X1_L: 125,
  SOFA_2X1_R: 126,
  AQUARIUM_2X1_L: 127,
  AQUARIUM_2X1_R: 128,
  POOL_TABLE_TL: 129,
  POOL_TABLE_TR: 130,
  POOL_TABLE_BL: 131,
  POOL_TABLE_BR: 132,
  PING_PONG_TL: 133,
  PING_PONG_TR: 134,
  PING_PONG_BL: 135,
  PING_PONG_BR: 136,
  BOOKSHELF_2_TOP: 137,
  BOOKSHELF_2_BOT: 138,
  VENDING_2_TOP: 139,
  VENDING_2_BOT: 140,
  ARCADE_2_TOP: 141,
  ARCADE_2_BOT: 142,
};

// ── Layer data ─────────────────────────────────────────────────────────────
const ground = new Array(TOTAL).fill(GID.GRASS_DENSE);
const walls = new Array(TOTAL).fill(GID.EMPTY);
const front = new Array(TOTAL).fill(GID.EMPTY);

// ── Helpers ────────────────────────────────────────────────────────────────
function idx(col, row) {
  return row * W + col;
}

function fillRect(layer, gid, r1, c1, r2, c2) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      layer[idx(c, r)] = gid;
    }
  }
}

function setTile(layer, gid, row, col) {
  layer[idx(col, row)] = gid;
}

/** Place a rectangular room with walls on the walls layer and floor on ground layer */
function placeRoom(floorGid, r1, c1, r2, c2, opts = {}) {
  // Floor
  fillRect(ground, floorGid, r1, c1, r2, c2);

  // Walls – top and bottom rows
  for (let c = c1; c <= c2; c++) {
    setTile(walls, GID.WALL_TOP, r1, c);
    setTile(walls, GID.WALL_BOTTOM, r2, c);
  }
  // Walls – left and right cols
  for (let r = r1; r <= r2; r++) {
    setTile(walls, GID.WALL_LEFT, r, c1);
    setTile(walls, GID.WALL_RIGHT, r, c2);
  }
  // Corners
  setTile(walls, GID.CORNER_TL, r1, c1);
  setTile(walls, GID.CORNER_TR, r1, c2);
  setTile(walls, GID.CORNER_BL, r2, c1);
  setTile(walls, GID.CORNER_BR, r2, c2);

  // Door(s)
  if (opts.doorBottom !== undefined) {
    const dc = typeof opts.doorBottom === 'number' ? opts.doorBottom : Math.floor((c1 + c2) / 2);
    setTile(walls, GID.DOOR, r2, dc);
    setTile(walls, GID.DOOR, r2, dc + 1);
  }
  if (opts.doorTop !== undefined) {
    const dc = typeof opts.doorTop === 'number' ? opts.doorTop : Math.floor((c1 + c2) / 2);
    setTile(walls, GID.DOOR, r1, dc);
    setTile(walls, GID.DOOR, r1, dc + 1);
  }
  if (opts.doorLeft !== undefined) {
    const dr = typeof opts.doorLeft === 'number' ? opts.doorLeft : Math.floor((r1 + r2) / 2);
    setTile(walls, GID.DOOR, dr, c1);
  }
  if (opts.doorRight !== undefined) {
    const dr = typeof opts.doorRight === 'number' ? opts.doorRight : Math.floor((r1 + r2) / 2);
    setTile(walls, GID.DOOR, dr, c2);
  }

  // Ceiling lights
  if (opts.lights !== false) {
    for (let c = c1 + 2; c <= c2 - 1; c += 5) {
      for (let r = r1 + 1; r <= r2 - 1; r += 4) {
        setTile(walls, GID.CEILING_LIGHT, r, c);
      }
    }
  }
}

/** Place a desk+chair pair with monitor on front layer (legacy 1x1) */
function placeDeskStation(row, col, facingDown = true) {
  setTile(walls, GID.DESK, row, col);
  setTile(walls, GID.CHAIR, facingDown ? row + 1 : row - 1, col);
  if (facingDown) {
    setTile(front, GID.MONITOR_FRONT, row - 1, col);
  } else {
    setTile(front, GID.MONITOR_FRONT, row + 1, col);
  }
}

/** Place a 2x2 desk (monitor+keyboard) with chair. TL/TR=back(monitor), BL/BR=front(desk surface) */
function placeDeskStation2x2(row, col, facingDown = true) {
  setTile(walls, GID.DESK_2X2_TL, row, col);
  setTile(walls, GID.DESK_2X2_TR, row, col + 1);
  setTile(front, GID.DESK_2X2_BL, row + 1, col);
  setTile(front, GID.DESK_2X2_BR, row + 1, col + 1);
  if (facingDown) {
    setTile(walls, GID.CHAIR, row + 2, col);
  } else {
    setTile(walls, GID.CHAIR, row - 1, col + 1);
  }
}

/** Place a 2x1 sofa (left + right halves) */
function placeSofa2x1(row, col) {
  setTile(walls, GID.SOFA_2X1_L, row, col);
  setTile(walls, GID.SOFA_2X1_R, row, col + 1);
}

/** Place a 2x1 aquarium (left + right halves) */
function placeAquarium2x1(row, col) {
  setTile(walls, GID.AQUARIUM_2X1_L, row, col);
  setTile(walls, GID.AQUARIUM_2X1_R, row, col + 1);
}

/** Place a 2x2 pool table */
function placePoolTable2x2(row, col) {
  setTile(walls, GID.POOL_TABLE_TL, row, col);
  setTile(walls, GID.POOL_TABLE_TR, row, col + 1);
  setTile(walls, GID.POOL_TABLE_BL, row + 1, col);
  setTile(walls, GID.POOL_TABLE_BR, row + 1, col + 1);
}

/** Place a 2x2 ping pong table */
function placePingPong2x2(row, col) {
  setTile(walls, GID.PING_PONG_TL, row, col);
  setTile(walls, GID.PING_PONG_TR, row, col + 1);
  setTile(walls, GID.PING_PONG_BL, row + 1, col);
  setTile(walls, GID.PING_PONG_BR, row + 1, col + 1);
}

/** Place a 1x2 bookshelf (top + bottom) */
function placeBookshelf2(row, col) {
  setTile(walls, GID.BOOKSHELF_2_TOP, row, col);
  setTile(walls, GID.BOOKSHELF_2_BOT, row + 1, col);
}

/** Place a 1x2 vending machine (top + bottom) */
function placeVending2(row, col) {
  setTile(walls, GID.VENDING_2_TOP, row, col);
  setTile(walls, GID.VENDING_2_BOT, row + 1, col);
}

/** Place a 1x2 arcade cabinet (top + bottom) */
function placeArcade2(row, col) {
  setTile(walls, GID.ARCADE_2_TOP, row, col);
  setTile(walls, GID.ARCADE_2_BOT, row + 1, col);
}

/** Scatter items from an array on a layer at random-ish positions within a rect */
function scatter(layer, gid, r1, c1, r2, c2, count) {
  let placed = 0;
  // Deterministic seeded positions
  let seed = r1 * 1000 + c1 * 100 + r2 * 10 + c2;
  function pseudoRand(max) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % max;
  }
  let attempts = 0;
  while (placed < count && attempts < count * 20) {
    attempts++;
    const r = r1 + pseudoRand(r2 - r1 + 1);
    const c = c1 + pseudoRand(c2 - c1 + 1);
    if (layer[idx(c, r)] === GID.EMPTY) {
      setTile(layer, gid, r, c);
      placed++;
    }
  }
}

// ── BUILD THE MAP ──────────────────────────────────────────────────────────

// ============================================================
// 1. OUTDOOR TOP (rows 0-9)
// ============================================================
fillRect(ground, GID.GRASS_DENSE, 0, 0, 9, W - 1);

// Stone path horizontal at row 8-9 connecting to building entrance
fillRect(ground, GID.STONE_PATH, 8, 5, 9, 70);
// Stone path vertical leading to entrance
fillRect(ground, GID.STONE_PATH, 4, 35, 9, 37);

// Pine trees scattered
const pinePositions = [
  [1, 3], [1, 10], [2, 20], [1, 28], [3, 45], [1, 50], [2, 75], [0, 78],
  [4, 5], [6, 8], [0, 0], [0, 15], [7, 73], [5, 77], [3, 1],
];
for (const [r, c] of pinePositions) {
  setTile(walls, GID.PINE_TREE, r, c);
}

// Round trees
const roundTreePositions = [
  [2, 7], [3, 14], [1, 33], [5, 48], [7, 72], [0, 5], [6, 25],
];
for (const [r, c] of roundTreePositions) {
  setTile(walls, GID.ROUND_TREE, r, c);
}

// Bushes along paths
for (let c = 5; c <= 70; c += 4) {
  if (c < 33 || c > 39) {
    setTile(walls, GID.BUSH, 7, c);
  }
}
// Bushes on top border
for (let c = 0; c <= 79; c += 6) {
  setTile(walls, GID.BUSH, 0, c);
}

// Flower beds
const flowerPositions = [
  [3, 30], [3, 31], [3, 40], [3, 41], [6, 12], [6, 13], [5, 22], [5, 23],
];
for (const [r, c] of flowerPositions) {
  setTile(walls, GID.FLOWER_BED, r, c);
  setTile(ground, GID.GRASS_LIGHT, r, c);
}

// Fountain at cols 35-36, rows 4-5
setTile(walls, GID.FOUNTAIN_TOP, 4, 35);
setTile(walls, GID.FOUNTAIN_TOP, 4, 36);
setTile(walls, GID.FOUNTAIN_BASE, 5, 35);
setTile(walls, GID.FOUNTAIN_BASE, 5, 36);
setTile(ground, GID.STONE_PATH, 4, 35);
setTile(ground, GID.STONE_PATH, 4, 36);
setTile(ground, GID.STONE_PATH, 5, 35);
setTile(ground, GID.STONE_PATH, 5, 36);

// Lake top-right (rows 2-7, cols 55-70)
// Fill entire interior with deep water (edges will overwrite perimeter)
fillRect(ground, GID.WATER_DEEP, 2, 55, 7, 70);
// Edges (overwrite perimeter deep tiles)
for (let c = 56; c <= 69; c++) {
  setTile(ground, GID.WATER_EDGE_TOP, 2, c);
  setTile(ground, GID.WATER_EDGE_BOTTOM, 7, c);
}
for (let r = 3; r <= 6; r++) {
  setTile(ground, GID.WATER_EDGE_LEFT, r, 55);
  setTile(ground, GID.WATER_EDGE_RIGHT, r, 70);
}
// Corners
setTile(ground, GID.WATER_CORNER_TL, 2, 55);
setTile(ground, GID.WATER_CORNER_TR, 2, 70);
setTile(ground, GID.WATER_CORNER_BL, 7, 55);
setTile(ground, GID.WATER_CORNER_BR, 7, 70);
// Lily pads
setTile(walls, GID.LILY_PAD, 4, 60);
setTile(walls, GID.LILY_PAD, 5, 63);
setTile(walls, GID.LILY_PAD, 3, 65);
setTile(walls, GID.LILY_PAD, 6, 58);

// ============================================================
// 2. BUILDING EXTERIOR TOP (row 10)
// ============================================================
for (let c = 0; c <= W - 1; c++) {
  setTile(walls, GID.WALL_TOP, 10, c);
  setTile(ground, GID.FLOOR_HALLWAY, 10, c);
}
// Corners
setTile(walls, GID.CORNER_TL, 10, 0);
setTile(walls, GID.CORNER_TR, 10, W - 1);
// Entrance doors
setTile(walls, GID.DOOR, 10, 35);
setTile(walls, GID.DOOR, 10, 36);
setTile(walls, GID.DOOR, 10, 37);

// ============================================================
// 3. HALLWAYS (rows 11, 18, 26)
// ============================================================
// Hallway row 11
fillRect(ground, GID.FLOOR_HALLWAY, 11, 0, 11, W - 1);
// Side walls
for (let r = 11; r <= 35; r++) {
  setTile(walls, GID.WALL_LEFT, r, 0);
  setTile(walls, GID.WALL_RIGHT, r, W - 1);
  setTile(ground, GID.FLOOR_HALLWAY, r, 0);
  setTile(ground, GID.FLOOR_HALLWAY, r, W - 1);
}

// Hallway row 18
fillRect(ground, GID.FLOOR_HALLWAY, 18, 0, 18, W - 1);
for (let c = 2; c <= W - 3; c += 5) {
  setTile(walls, GID.CEILING_LIGHT, 18, c);
}

// Hallway row 26
fillRect(ground, GID.FLOOR_HALLWAY, 26, 0, 26, W - 1);
for (let c = 2; c <= W - 3; c += 5) {
  setTile(walls, GID.CEILING_LIGHT, 26, c);
}

// Ceiling lights in row 11 hallway
for (let c = 2; c <= W - 3; c += 5) {
  setTile(walls, GID.CEILING_LIGHT, 11, c);
}

// ============================================================
// 4. SALA DE CONFERÊNCIA (rows 12-17, cols 2-18)
// ============================================================
placeRoom(GID.FLOOR_CONFERENCE, 12, 2, 17, 18, { doorBottom: 9 });

// Conference table 2x2 in center
setTile(walls, GID.CONF_TABLE_TL, 14, 9);
setTile(walls, GID.CONF_TABLE_TR, 14, 10);
setTile(walls, GID.CONF_TABLE_BL, 15, 9);
setTile(walls, GID.CONF_TABLE_BR, 15, 10);

// Chairs around table
setTile(walls, GID.CHAIR, 13, 9);
setTile(walls, GID.CHAIR, 13, 10);
setTile(walls, GID.CHAIR, 16, 9);
setTile(walls, GID.CHAIR, 16, 10);
setTile(walls, GID.CHAIR, 14, 8);
setTile(walls, GID.CHAIR, 15, 8);
setTile(walls, GID.CHAIR, 14, 11);
setTile(walls, GID.CHAIR, 15, 11);

// Whiteboard on right wall
setTile(walls, GID.WHITEBOARD, 14, 17);
// Projector screen on left wall
setTile(walls, GID.PROJECTOR_SCREEN, 13, 3);
// TV on top wall
setTile(walls, GID.TV, 12, 10);
// Plant corners
setTile(walls, GID.PLANT, 13, 3);
setTile(walls, GID.PLANT, 16, 17);

// ============================================================
// 5. ÁREA COLABORATIVA (rows 12-17, cols 20-40)
// ============================================================
placeRoom(GID.FLOOR_WORKSPACE, 12, 20, 17, 40, { doorBottom: 29 });

// 2x2 desks in pairs
placeDeskStation2x2(13, 22, true);
placeDeskStation2x2(13, 25, true);
placeDeskStation2x2(13, 33, true);
placeDeskStation2x2(13, 36, true);

// Standing desks along top wall (between desks)
setTile(walls, GID.STANDING_DESK, 13, 28);
setTile(walls, GID.STANDING_DESK, 13, 31);

// Plants
setTile(walls, GID.PLANT, 13, 21);
setTile(walls, GID.PLANT, 16, 21);
setTile(walls, GID.PLANT, 16, 39);
setTile(walls, GID.PLANT, 13, 39);

// Printer
setTile(walls, GID.PRINTER, 16, 29);

// ============================================================
// 6. ESCRITÓRIOS INDIVIDUAIS (rows 12-17, cols 42-58)
// ============================================================
placeRoom(GID.FLOOR_OFFICE, 12, 42, 17, 58, { doorBottom: 49 });

// Glass partitions between desks
for (let r = 13; r <= 16; r++) {
  setTile(walls, GID.GLASS_PARTITION, r, 46);
  setTile(walls, GID.GLASS_PARTITION, r, 50);
  setTile(walls, GID.GLASS_PARTITION, r, 54);
}

// 4 individual 2x2 desks
placeDeskStation2x2(13, 43, true);
placeDeskStation2x2(13, 47, true);
placeDeskStation2x2(13, 51, true);
placeDeskStation2x2(13, 55, true);

// 1x2 Bookshelves between partitions (top shelves visible above desk)
placeBookshelf2(13, 45);
placeBookshelf2(13, 49);
placeBookshelf2(13, 53);
placeBookshelf2(13, 57);

// Plants
setTile(walls, GID.PLANT, 16, 43);
setTile(walls, GID.PLANT, 16, 57);

// ============================================================
// 7. SERVER ROOM (rows 12-17, cols 60-68)
// ============================================================
placeRoom(GID.FLOOR_WORKSPACE, 12, 60, 17, 68, { doorBottom: 63, lights: false });

// Server racks along walls
setTile(walls, GID.SERVER_RACK, 13, 61);
setTile(walls, GID.SERVER_RACK, 13, 63);
setTile(walls, GID.SERVER_RACK, 13, 65);
setTile(walls, GID.SERVER_RACK, 13, 67);
setTile(walls, GID.SERVER_RACK, 15, 61);
setTile(walls, GID.SERVER_RACK, 15, 63);
setTile(walls, GID.SERVER_RACK, 15, 65);
setTile(walls, GID.SERVER_RACK, 15, 67);
setTile(walls, GID.SERVER_RACK, 14, 61);
setTile(walls, GID.SERVER_RACK, 16, 61);

// ============================================================
// 8. WORKSPACE A (rows 19-25, cols 2-25)
// ============================================================
placeRoom(GID.FLOOR_OPEN, 19, 2, 25, 25, { doorTop: 12, doorBottom: 12 });

// 2x2 desks in 2 rows of 4 facing each other
placeDeskStation2x2(20, 5, true);
placeDeskStation2x2(20, 9, true);
placeDeskStation2x2(20, 13, true);
placeDeskStation2x2(20, 17, true);
placeDeskStation2x2(23, 5, false);
placeDeskStation2x2(23, 9, false);
placeDeskStation2x2(23, 13, false);
placeDeskStation2x2(23, 17, false);

// Standing desks along left wall
setTile(walls, GID.STANDING_DESK, 20, 3);
setTile(walls, GID.STANDING_DESK, 22, 3);
setTile(walls, GID.STANDING_DESK, 24, 3);

// Coffee station + water cooler
setTile(walls, GID.COFFEE_STATION, 20, 24);
setTile(walls, GID.WATER_COOLER, 22, 24);

// Plants
setTile(walls, GID.PLANT, 20, 4);
setTile(walls, GID.PLANT, 24, 24);

// ============================================================
// 9. WORKSPACE B (rows 19-25, cols 27-50)
// ============================================================
placeRoom(GID.FLOOR_WORKSPACE, 19, 27, 25, 50, { doorTop: 37, doorBottom: 37 });

// 2x2 desks in rows
placeDeskStation2x2(20, 29, true);
placeDeskStation2x2(20, 33, true);
placeDeskStation2x2(20, 37, true);
placeDeskStation2x2(23, 29, false);
placeDeskStation2x2(23, 33, false);
placeDeskStation2x2(23, 37, false);

// Meeting table area on right side
setTile(walls, GID.MEETING_TABLE, 21, 45);
setTile(walls, GID.MEETING_TABLE, 21, 46);
setTile(walls, GID.CHAIR, 20, 45);
setTile(walls, GID.CHAIR, 20, 46);
setTile(walls, GID.CHAIR, 22, 45);
setTile(walls, GID.CHAIR, 22, 46);

// 2x1 Aquarium on right wall
placeAquarium2x1(21, 48);

// Paintings on top wall
setTile(walls, GID.PAINTING_LANDSCAPE, 19, 32);
setTile(walls, GID.PAINTING_ABSTRACT, 19, 42);

// Plants
setTile(walls, GID.PLANT, 20, 28);
setTile(walls, GID.PLANT, 24, 49);

// ============================================================
// 10. MEETING ROOMS (rows 19-25, cols 52-68) - 2 side by side
// ============================================================
// Meeting Room 1 (cols 52-59)
placeRoom(GID.FLOOR_MEETING, 19, 52, 25, 59, { doorTop: 55 });
setTile(walls, GID.MEETING_TABLE, 21, 55);
setTile(walls, GID.MEETING_TABLE, 22, 55);
setTile(walls, GID.CHAIR, 21, 54);
setTile(walls, GID.CHAIR, 22, 54);
setTile(walls, GID.CHAIR, 21, 56);
setTile(walls, GID.CHAIR, 22, 56);
setTile(walls, GID.CHAIR, 20, 55);
setTile(walls, GID.CHAIR, 23, 55);
setTile(walls, GID.WHITEBOARD, 22, 58);
setTile(walls, GID.PLANT, 20, 53);

// Meeting Room 2 (cols 61-68)
placeRoom(GID.FLOOR_MEETING, 19, 61, 25, 68, { doorTop: 64 });
setTile(walls, GID.MEETING_TABLE, 21, 64);
setTile(walls, GID.MEETING_TABLE, 22, 64);
setTile(walls, GID.CHAIR, 21, 63);
setTile(walls, GID.CHAIR, 22, 63);
setTile(walls, GID.CHAIR, 21, 65);
setTile(walls, GID.CHAIR, 22, 65);
setTile(walls, GID.CHAIR, 20, 64);
setTile(walls, GID.CHAIR, 23, 64);
setTile(walls, GID.WHITEBOARD, 21, 67);
setTile(walls, GID.PLANT, 24, 67);
setTile(walls, GID.TV, 19, 64);

// ============================================================
// 11. LOUNGE / CAFETERIA (rows 27-34, cols 2-30)
// ============================================================
// Lounge section (cols 2-18)
placeRoom(GID.FLOOR_LOUNGE, 27, 2, 34, 18, { doorTop: 9 });
// 2x1 Sofas
placeSofa2x1(29, 4);
placeSofa2x1(31, 4);
// Coffee table
setTile(walls, GID.ROUND_TABLE, 30, 5);
// Beanbags
setTile(walls, GID.BEANBAG, 33, 4);
setTile(walls, GID.BEANBAG, 33, 6);
// 2x1 Aquarium on wall
placeAquarium2x1(28, 16);
// TV on wall
setTile(walls, GID.TV, 27, 10);
// Plants
setTile(walls, GID.PLANT, 28, 3);
setTile(walls, GID.PLANT, 33, 17);
// Rug
setTile(walls, GID.RUG, 30, 4);
setTile(walls, GID.RUG, 30, 6);
// Coat rack
setTile(walls, GID.COAT_RACK, 28, 16);

// Cafeteria section (cols 20-30)
placeRoom(GID.FLOOR_CAFETERIA, 27, 20, 34, 30, { doorTop: 24 });
// Floor override for kitchen area
fillRect(ground, GID.KITCHEN_TILE, 27, 20, 30, 30);
// Kitchen counter along top
setTile(walls, GID.KITCHEN_COUNTER, 28, 22);
setTile(walls, GID.KITCHEN_COUNTER, 28, 23);
setTile(walls, GID.KITCHEN_COUNTER, 28, 24);
setTile(walls, GID.MICROWAVE, 28, 25);
setTile(walls, GID.COFFEE_STATION, 28, 27);
setTile(walls, GID.MINI_FRIDGE, 28, 29);
// Dining tables
setTile(walls, GID.ROUND_TABLE, 31, 23);
setTile(walls, GID.CHAIR, 30, 23);
setTile(walls, GID.CHAIR, 32, 23);
setTile(walls, GID.CHAIR, 31, 22);
setTile(walls, GID.CHAIR, 31, 24);
setTile(walls, GID.ROUND_TABLE, 31, 28);
setTile(walls, GID.CHAIR, 30, 28);
setTile(walls, GID.CHAIR, 32, 28);
setTile(walls, GID.CHAIR, 31, 27);
setTile(walls, GID.CHAIR, 31, 29);
// 1x2 Vending machine
placeVending2(32, 21);
// Water cooler
setTile(walls, GID.WATER_COOLER, 33, 29);

// ============================================================
// 12. ÁREA DE DESCANSO (rows 27-34, cols 32-50)
// ============================================================
placeRoom(GID.CARPET_GREEN, 27, 32, 34, 50, { doorTop: 40 });

// 2x1 Sofas
placeSofa2x1(29, 34);
placeSofa2x1(31, 34);
// Coffee table
setTile(walls, GID.ROUND_TABLE, 30, 35);
// Beanbags
setTile(walls, GID.BEANBAG, 33, 34);
setTile(walls, GID.BEANBAG, 33, 36);
setTile(walls, GID.BEANBAG, 29, 40);
// Rug
fillRect(walls, GID.RUG, 30, 33, 30, 37);
// TV on wall
setTile(walls, GID.TV, 27, 41);
// Paintings
setTile(walls, GID.PAINTING_LANDSCAPE, 27, 36);
setTile(walls, GID.PAINTING_ABSTRACT, 27, 45);
// Plants
setTile(walls, GID.PLANT, 28, 33);
setTile(walls, GID.PLANT, 28, 49);
setTile(walls, GID.PLANT, 33, 49);
// Wall art
setTile(walls, GID.WALL_ART, 28, 43);

// More 2x1 sofas on right side
placeSofa2x1(31, 44);
setTile(walls, GID.ROUND_TABLE, 32, 44);

// ============================================================
// 13. GAME ROOM (rows 27-34, cols 52-68)
// ============================================================
placeRoom(GID.CARPET_PATTERN, 27, 52, 34, 68, { doorTop: 59 });

// 2x2 Pool table (center)
placePoolTable2x2(29, 57);

// 2x2 Ping pong
placePingPong2x2(31, 57);

// 1x2 Arcade machines
placeArcade2(28, 54);
placeArcade2(28, 56);
placeArcade2(28, 66);

// Beanbags
setTile(walls, GID.BEANBAG, 33, 54);
setTile(walls, GID.BEANBAG, 33, 56);
setTile(walls, GID.BEANBAG, 33, 65);

// 1x2 Vending machine
placeVending2(28, 67);

// TV on wall
setTile(walls, GID.TV, 27, 60);

// Plants
setTile(walls, GID.PLANT, 28, 53);
setTile(walls, GID.PLANT, 33, 67);

// ============================================================
// 14. BUILDING EXTERIOR BOTTOM (rows 35-36)
// ============================================================
for (let c = 0; c <= W - 1; c++) {
  setTile(walls, GID.WALL_BOTTOM, 35, c);
  setTile(ground, GID.FLOOR_HALLWAY, 35, c);
}
// Bottom wall corners
setTile(walls, GID.CORNER_BL, 35, 0);
setTile(walls, GID.CORNER_BR, 35, W - 1);
// Exit doors
setTile(walls, GID.DOOR, 35, 35);
setTile(walls, GID.DOOR, 35, 36);
setTile(walls, GID.DOOR, 35, 37);

// Row 36 = grass transition
fillRect(ground, GID.GRASS_LIGHT, 36, 0, 36, W - 1);

// ============================================================
// 15. OUTDOOR BOTTOM (rows 37-55)
// ============================================================
fillRect(ground, GID.GRASS_DENSE, 37, 0, 55, W - 1);

// Stone paths from doors
fillRect(ground, GID.STONE_PATH, 37, 34, 42, 37);
fillRect(ground, GID.STONE_PATH, 42, 10, 42, 60);

// Garden area (rows 40-45, cols 10-25)
fillRect(ground, GID.GARDEN_SOIL, 40, 10, 45, 25);
fillRect(ground, GID.FLOWER_GARDEN, 41, 11, 44, 24);
// Flower beds border
for (let c = 11; c <= 24; c += 2) {
  setTile(walls, GID.FLOWER_BED, 41, c);
  setTile(walls, GID.FLOWER_BED, 44, c);
}
for (let r = 42; r <= 43; r++) {
  setTile(walls, GID.FLOWER_BED, r, 11);
  setTile(walls, GID.FLOWER_BED, r, 24);
}
// Plants in garden
setTile(walls, GID.PLANT, 42, 14);
setTile(walls, GID.PLANT, 42, 18);
setTile(walls, GID.PLANT, 43, 16);
setTile(walls, GID.PLANT, 43, 21);
// Garden paths
fillRect(ground, GID.STONE_PATH, 42, 15, 43, 15);
fillRect(ground, GID.STONE_PATH, 42, 20, 43, 20);

// Parking area (rows 45-50, cols 40-60)
fillRect(ground, GID.COBBLESTONE, 45, 40, 50, 60);
// Parking lines (using stone_path as dividers)
for (let c = 42; c <= 58; c += 4) {
  fillRect(ground, GID.STONE_PATH, 45, c, 50, c);
}

// Second small pond (rows 48-52, cols 11-17)
fillRect(ground, GID.WATER_DEEP, 48, 11, 52, 17);
for (let c = 12; c <= 16; c++) {
  setTile(ground, GID.WATER_EDGE_TOP, 48, c);
  setTile(ground, GID.WATER_EDGE_BOTTOM, 52, c);
}
for (let r = 49; r <= 51; r++) {
  setTile(ground, GID.WATER_EDGE_LEFT, r, 11);
  setTile(ground, GID.WATER_EDGE_RIGHT, r, 17);
}
setTile(ground, GID.WATER_CORNER_TL, 48, 11);
setTile(ground, GID.WATER_CORNER_TR, 48, 17);
setTile(ground, GID.WATER_CORNER_BL, 52, 11);
setTile(ground, GID.WATER_CORNER_BR, 52, 17);
// Lily pads
setTile(walls, GID.LILY_PAD, 50, 13);
setTile(walls, GID.LILY_PAD, 49, 15);

// Trees in outdoor bottom
const bottomTreePositions = [
  [38, 3], [39, 7], [37, 15], [38, 28], [39, 32], [47, 5], [53, 3],
  [37, 65], [39, 70], [41, 75], [48, 65], [50, 72], [53, 78],
  [45, 30], [47, 35], [52, 40], [54, 55], [54, 20],
];
for (const [r, c] of bottomTreePositions) {
  setTile(walls, GID.PINE_TREE, r, c);
}
const bottomRoundTrees = [
  [38, 5], [40, 30], [46, 8], [51, 25], [53, 60], [37, 50], [42, 68],
];
for (const [r, c] of bottomRoundTrees) {
  setTile(walls, GID.ROUND_TREE, r, c);
}

// Bushes scattered
const bottomBushes = [
  [37, 2], [37, 10], [37, 22], [37, 40], [37, 55], [37, 72],
  [46, 3], [46, 28], [52, 50], [54, 10], [55, 30], [55, 65],
];
for (const [r, c] of bottomBushes) {
  setTile(walls, GID.BUSH, r, c);
}

// Benches (using sofa GID as bench stand-in)
setTile(walls, GID.SOFA, 43, 35);
setTile(walls, GID.SOFA, 47, 62);
setTile(walls, GID.SOFA, 53, 45);

// Bridge over second pond
setTile(walls, GID.BRIDGE, 50, 11);
setTile(walls, GID.BRIDGE, 50, 17);
setTile(ground, GID.STONE_PATH, 50, 11);
setTile(ground, GID.STONE_PATH, 50, 17);

// ============================================================
// 16. RECEPTION area inside building (row 11-12 center area)
// ============================================================
// Reception desk near entrance
fillRect(ground, GID.MARBLE, 11, 33, 11, 39);
setTile(walls, GID.RECEPTION_DESK, 11, 35);
setTile(walls, GID.RECEPTION_DESK, 11, 36);
setTile(walls, GID.PLANT, 11, 33);
setTile(walls, GID.PLANT, 11, 39);

// ============================================================
// 17. Fill remaining interior ground (make sure no empty ground inside building)
// ============================================================
// Rows 12-17 corridor areas between rooms (cols 19, 41, 59, 69-79)
for (let r = 12; r <= 17; r++) {
  setTile(ground, GID.FLOOR_HALLWAY, r, 1);
  setTile(ground, GID.FLOOR_HALLWAY, r, 19);
  setTile(ground, GID.FLOOR_HALLWAY, r, 41);
  setTile(ground, GID.FLOOR_HALLWAY, r, 59);
  for (let c = 69; c <= 78; c++) {
    setTile(ground, GID.FLOOR_HALLWAY, r, c);
  }
}
// Rows 19-25 corridor areas
for (let r = 19; r <= 25; r++) {
  setTile(ground, GID.FLOOR_HALLWAY, r, 1);
  setTile(ground, GID.FLOOR_HALLWAY, r, 26);
  setTile(ground, GID.FLOOR_HALLWAY, r, 51);
  setTile(ground, GID.FLOOR_HALLWAY, r, 60);
  for (let c = 69; c <= 78; c++) {
    setTile(ground, GID.FLOOR_HALLWAY, r, c);
  }
}
// Rows 27-34 corridor areas
for (let r = 27; r <= 34; r++) {
  setTile(ground, GID.FLOOR_HALLWAY, r, 1);
  setTile(ground, GID.FLOOR_HALLWAY, r, 19);
  setTile(ground, GID.FLOOR_HALLWAY, r, 31);
  setTile(ground, GID.FLOOR_HALLWAY, r, 51);
  for (let c = 69; c <= 78; c++) {
    setTile(ground, GID.FLOOR_HALLWAY, r, c);
  }
}

// ============================================================
// BUILD JSON OUTPUT
// ============================================================
const mapData = {
  compressionlevel: -1,
  height: H,
  infinite: false,
  layers: [
    {
      data: ground,
      height: H,
      id: 1,
      name: "ground",
      opacity: 1,
      type: "tilelayer",
      visible: true,
      width: W,
      x: 0,
      y: 0,
    },
    {
      data: walls,
      height: H,
      id: 2,
      name: "walls",
      opacity: 1,
      type: "tilelayer",
      visible: true,
      width: W,
      x: 0,
      y: 0,
    },
    {
      data: front,
      height: H,
      id: 4,
      name: "furniture_front",
      opacity: 1,
      type: "tilelayer",
      visible: true,
      width: W,
      x: 0,
      y: 0,
    },
  ],
  nextlayerid: 5,
  nextobjectid: 1,
  orientation: "orthogonal",
  renderorder: "right-down",
  tiledversion: "1.10.1",
  tileheight: 64,
  tilesets: [
    {
      columns: 12,
      firstgid: 1,
      image: "office_tiles.png",
      imageheight: 792,
      imagewidth: 792,
      margin: 1,
      name: "office_tiles",
      spacing: 2,
      tilecount: 144,
      tileheight: 64,
      tilewidth: 64,
    },
  ],
  tilewidth: 64,
  type: "map",
  version: "1.10",
  width: W,
};

// Write to file
const outPath = path.join(__dirname, 'default_office.json');
fs.writeFileSync(outPath, JSON.stringify(mapData, null, 2), 'utf-8');
console.log(`Map written to ${outPath}`);
console.log(`  Dimensions: ${W}x${H} tiles (${W * 64}x${H * 64} pixels)`);
console.log(`  Ground layer: ${ground.filter(g => g !== 0).length} non-empty tiles`);
console.log(`  Walls layer: ${walls.filter(g => g !== 0).length} non-empty tiles`);
console.log(`  Furniture_front layer: ${front.filter(g => g !== 0).length} non-empty tiles`);
console.log(`  Total data size: ${JSON.stringify(mapData).length} bytes`);
