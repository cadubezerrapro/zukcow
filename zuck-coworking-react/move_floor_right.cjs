/**
 * Move 2nd floor from BELOW (y=56-81) to the RIGHT side (x=85+, y=8-33)
 * - Expands map width from 80 → 155
 * - Truncates height from 82 → 56 (removes old 2nd floor rows)
 * - Copies 2nd floor tile data to new position with offset
 * - Adds stair landing on left side of 2nd floor
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const OLD_W = map.width;   // 80
const OLD_H = map.height;  // 82
const NEW_W = 155;
const NEW_H = 56;

const X_OFFSET = 83;       // old x + 83 = new x (rooms x=2-68 → x=85-151)
const SRC_Y_START = 56;    // old 2nd floor starts here
const DST_Y_START = 8;     // new vertical position
const FLOOR_ROWS = 26;     // y=56-81 = 26 rows

console.log(`Moving 2nd floor: ${OLD_W}x${OLD_H} → ${NEW_W}x${NEW_H}`);
console.log(`2nd floor: y=${SRC_Y_START}-${SRC_Y_START + FLOOR_ROWS - 1} → y=${DST_Y_START}-${DST_Y_START + FLOOR_ROWS - 1}, x offset +${X_OFFSET}`);

const ground = map.layers.find(l => l.name === 'ground');
const walls = map.layers.find(l => l.name === 'walls');
const furniture = map.layers.find(l => l.name === 'furniture_front');

// ── Step 1: Extract old 2nd floor data ──────────────────────────────
const floor2 = { ground: [], walls: [], furniture: [] };
for (let y = SRC_Y_START; y < SRC_Y_START + FLOOR_ROWS; y++) {
    const row_g = [], row_w = [], row_f = [];
    for (let x = 0; x < OLD_W; x++) {
        row_g.push(ground.data[y * OLD_W + x]);
        row_w.push(walls.data[y * OLD_W + x]);
        row_f.push(furniture.data[y * OLD_W + x]);
    }
    floor2.ground.push(row_g);
    floor2.walls.push(row_w);
    floor2.furniture.push(row_f);
}
console.log(`Extracted ${floor2.ground.length} rows of 2nd floor data`);

// ── Step 2: Create new map arrays (NEW_W × NEW_H) ──────────────────
const GRASS = 14;  // grass ground tile

const newGround = new Array(NEW_W * NEW_H).fill(0);
const newWalls = new Array(NEW_W * NEW_H).fill(0);
const newFurniture = new Array(NEW_W * NEW_H).fill(0);

// ── Step 3: Copy 1st floor (y=0-55, x=0-79) ────────────────────────
for (let y = 0; y < NEW_H; y++) {
    for (let x = 0; x < OLD_W; x++) {
        newGround[y * NEW_W + x] = ground.data[y * OLD_W + x];
        newWalls[y * NEW_W + x] = walls.data[y * OLD_W + x];
        newFurniture[y * NEW_W + x] = furniture.data[y * OLD_W + x];
    }
}
console.log(`Copied 1st floor data (y=0-${NEW_H - 1}, x=0-${OLD_W - 1})`);

// ── Step 4: Fill x=80-154 with grass by default ─────────────────────
for (let y = 0; y < NEW_H; y++) {
    for (let x = OLD_W; x < NEW_W; x++) {
        newGround[y * NEW_W + x] = GRASS;
    }
}

// ── Step 5: Place 2nd floor data at new position ────────────────────
let tilesPlaced = 0;
for (let row = 0; row < FLOOR_ROWS; row++) {
    const dstY = DST_Y_START + row;
    if (dstY >= NEW_H) break;

    for (let x = 0; x < OLD_W; x++) {
        const dstX = x + X_OFFSET;
        if (dstX >= NEW_W) continue;

        const idx = dstY * NEW_W + dstX;

        // Copy all tiles (including 0s for proper clearing)
        if (floor2.ground[row][x] !== 0) {
            newGround[idx] = floor2.ground[row][x];
            tilesPlaced++;
        }
        if (floor2.walls[row][x] !== 0) {
            newWalls[idx] = floor2.walls[row][x];
        }
        if (floor2.furniture[row][x] !== 0) {
            newFurniture[idx] = floor2.furniture[row][x];
        }
    }
}
console.log(`Placed ${tilesPlaced} ground tiles for 2nd floor`);

// ── Step 6: Fix stair entrance on 2nd floor ─────────────────────────
// The old transition corridor (y=56-58) had DOOR_FRAME stair markers at x=35-44
// After offset: x=118-127, y=8-10 — clear those old stair markers
const DOOR_FRAME = 52;
for (let y = DST_Y_START; y <= DST_Y_START + 2; y++) {
    for (let x = 118; x <= 127; x++) {
        if (newWalls[y * NEW_W + x] === DOOR_FRAME) {
            newWalls[y * NEW_W + x] = 0; // Clear old stair entrance markers
        }
    }
}
console.log('Cleared old stair entrance markers from corridor');

// ── Step 7: Add stair landing room on LEFT side of 2nd floor ────────
// Small entry room at x=82-86, y=8-12 connecting to main corridor
const HALLWAY = 2;
const OUTER_WALL = 1;
const STAIR_RIGHT = 184;    // drawStairsRight GID (0-based 183, stored as 184)
const STAIR_PLAT_H = 185;   // drawStairsPlatformH GID
const WALL_TOP = 41;
const WALL_BOTTOM = 42;
const WALL_LEFT = 43;
const WALL_RIGHT = 44;
const CORNER_TL = 45;
const CORNER_TR = 46;
const CORNER_BL = 47;
const CORNER_BR = 48;

// Ground: hallway floor for stair landing corridor (x=80-86, y=8-10)
for (let y = 8; y <= 10; y++) {
    for (let x = 80; x <= 86; x++) {
        newGround[y * NEW_W + x] = HALLWAY;
    }
}

// Stair tiles at x=82-83, y=9 (visual stair indicator)
newGround[9 * NEW_W + 81] = STAIR_PLAT_H;
newGround[9 * NEW_W + 82] = STAIR_RIGHT;
newGround[9 * NEW_W + 83] = STAIR_RIGHT;
newGround[9 * NEW_W + 84] = STAIR_PLAT_H;

// Walls around the stair landing
// Top wall y=7 (x=80-86)
for (let x = 80; x <= 86; x++) {
    newWalls[7 * NEW_W + x] = WALL_TOP;
    newGround[7 * NEW_W + x] = OUTER_WALL;
}
newWalls[7 * NEW_W + 80] = CORNER_TL;
newWalls[7 * NEW_W + 86] = CORNER_TR;

// Bottom wall y=11 (x=80-86)
for (let x = 80; x <= 86; x++) {
    newWalls[11 * NEW_W + x] = WALL_BOTTOM;
    newGround[11 * NEW_W + x] = OUTER_WALL;
}
newWalls[11 * NEW_W + 80] = CORNER_BL;
newWalls[11 * NEW_W + 86] = CORNER_BR;

// Side walls
for (let y = 8; y <= 10; y++) {
    newWalls[y * NEW_W + 80] = WALL_LEFT;
}

// Right side connects to main 2nd floor corridor — ensure opening
// The main corridor at x=85+ already has floor tiles from the copy
// Make sure x=85-86, y=8-10 are clear (no walls blocking passage)
for (let y = 8; y <= 10; y++) {
    newWalls[y * NEW_W + 85] = 0;
    newWalls[y * NEW_W + 86] = 0;
}

// Ensure the ground connection between stair landing and 2nd floor corridor
for (let y = 8; y <= 10; y++) {
    for (let x = 85; x <= 88; x++) {
        if (newGround[y * NEW_W + x] === GRASS || newGround[y * NEW_W + x] === 0) {
            newGround[y * NEW_W + x] = HALLWAY;
        }
    }
}

console.log('Added stair landing room at x=80-86, y=7-11');

// ── Step 8: Add outer building wall for 2nd floor ───────────────────
// The rooms already have their own walls from the copy, but we need
// a top building wall above y=8 and ensure the building looks complete

// Top building border at y=7 (x=87-152) - connect to stair landing
for (let x = 87; x <= 152; x++) {
    if (newWalls[7 * NEW_W + x] === 0) {
        newWalls[7 * NEW_W + x] = WALL_TOP;
    }
    if (newGround[7 * NEW_W + x] === GRASS) {
        newGround[7 * NEW_W + x] = OUTER_WALL;
    }
}

// Bottom building border at y=33 (below terraco/rooftop at y=26-31)
// The rooms end at y=31 (rooftop bottom wall). y=32-33 should be grass border.
for (let x = 85; x <= 152; x++) {
    if (newWalls[32 * NEW_W + x] === 0 && newGround[32 * NEW_W + x] !== GRASS) {
        // Only add if the rooms actually extend here
    }
}

// Left building wall at x=84 (y=7-33) — but only where rooms exist
for (let y = 7; y <= 33; y++) {
    if (newGround[y * NEW_W + 85] !== 0 && newGround[y * NEW_W + 85] !== GRASS) {
        // There's building content to the right, add left border
        if (newWalls[y * NEW_W + 84] === 0 && y > 10) {
            newWalls[y * NEW_W + 84] = WALL_LEFT;
            newGround[y * NEW_W + 84] = OUTER_WALL;
        }
    }
}

// Right building wall at x=152 (y=7-33)
for (let y = 7; y <= 33; y++) {
    if (newGround[y * NEW_W + 151] !== 0 && newGround[y * NEW_W + 151] !== GRASS) {
        if (newWalls[y * NEW_W + 152] === 0) {
            newWalls[y * NEW_W + 152] = WALL_RIGHT;
            newGround[y * NEW_W + 152] = OUTER_WALL;
        }
    }
}

console.log('Added outer building walls for 2nd floor');

// ── Step 9: Ensure grass below 2nd floor building ───────────────────
// Fill y=34-55, x=80-154 with grass (outdoor area)
for (let y = 34; y < NEW_H; y++) {
    for (let x = OLD_W; x < NEW_W; x++) {
        if (newGround[y * NEW_W + x] === 0) {
            newGround[y * NEW_W + x] = GRASS;
        }
    }
}

// ── Step 10: Update map ─────────────────────────────────────────────
ground.data = newGround;
walls.data = newWalls;
furniture.data = newFurniture;

map.width = NEW_W;
map.height = NEW_H;

for (const layer of [ground, walls, furniture]) {
    layer.width = NEW_W;
    layer.height = NEW_H;
}

// Verify
const expected = NEW_W * NEW_H;
for (const layer of [ground, walls, furniture]) {
    if (layer.data.length !== expected) {
        console.error(`ERROR: Layer "${layer.name}" has ${layer.data.length} tiles, expected ${expected}`);
        process.exit(1);
    }
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log(`\nDone! Map: ${NEW_W}x${NEW_H} (${expected} tiles per layer)`);
console.log('2nd floor rooms now at x=85-151, y=8-33');
console.log('Stair landing at x=80-86, y=7-11');
