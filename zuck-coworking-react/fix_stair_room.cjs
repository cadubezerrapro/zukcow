/**
 * Fix stair room walls (wrong GIDs), clean gap between buildings,
 * and improve stair landing on 2nd floor.
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width; // 155
const ground = map.layers.find(l => l.name === 'ground');
const walls = map.layers.find(l => l.name === 'walls');
const furniture = map.layers.find(l => l.name === 'furniture_front');

function setG(x, y, gid) { ground.data[y * W + x] = gid; }
function setW(x, y, gid) { walls.data[y * W + x] = gid; }
function getW(x, y) { return walls.data[y * W + x]; }
function getG(x, y) { return ground.data[y * W + x]; }

// Correct wall GIDs (same as main building)
const WALL_TOP = 41;
const WALL_BOTTOM = 42;
const WALL_LEFT = 43;
const WALL_RIGHT = 44;
const CORNER_TL = 45;
const CORNER_TR = 46;
const CORNER_BL = 47;
const CORNER_BR = 48;
const DOOR = 4;        // GID 4 is in NON_COLLIDE
const HALLWAY = 2;
const GRASS = 14;
const OUTER_WALL = 1;

// ============================================
// Fix 1: Correct stair room walls (1st floor)
// x=70-77, y=21-25
// ============================================
console.log('Fix 1: Correcting stair room walls (x=70-77, y=21-25)');

// Top wall y=21
const topRow = [CORNER_TL, WALL_TOP, WALL_TOP, WALL_TOP, WALL_TOP, WALL_TOP, WALL_TOP, CORNER_TR];
for (let i = 0; i < 8; i++) setW(70 + i, 21, topRow[i]);

// Side walls y=22-24
for (let y = 22; y <= 24; y++) {
    setW(70, y, WALL_LEFT);
    setW(77, y, WALL_RIGHT);
    // Clear interior walls
    for (let x = 71; x <= 76; x++) setW(x, y, 0);
}

// Door opening on left wall (y=23)
setW(70, 23, DOOR);

// Bottom wall y=25
const bottomRow = [CORNER_BL, WALL_BOTTOM, WALL_BOTTOM, WALL_BOTTOM, WALL_BOTTOM, WALL_BOTTOM, WALL_BOTTOM, CORNER_BR];
for (let i = 0; i < 8; i++) setW(70 + i, 25, bottomRow[i]);

// Ensure ground inside stair room is hallway
for (let y = 21; y <= 25; y++) {
    for (let x = 70; x <= 77; x++) {
        if (getG(x, y) !== 184 && getG(x, y) !== 185) {
            setG(x, y, HALLWAY);
        }
    }
}

console.log('  Walls corrected to GIDs 41-48, door to GID 4');

// ============================================
// Fix 2: Clean gap between buildings (x=78-86)
// ============================================
console.log('Fix 2: Cleaning gap between buildings (x=78-86)');

// Fill ground with grass for the gap area (except stair landing)
for (let y = 0; y < map.height; y++) {
    for (let x = 78; x <= 79; x++) {
        // These columns are outdoor gap
        if (y < 7 || y > 11) {
            // Outside stair landing area — should be grass
            setG(x, y, GRASS);
            setW(x, y, 0);
            furniture.data[y * W + x] = 0;
        }
    }
}

// Add a small outdoor walkway connecting stair room to stair landing
// x=78-79, y=21-25 — short path from stair room right wall to the gap
for (let y = 22; y <= 24; y++) {
    setG(78, y, HALLWAY);
    setG(79, y, HALLWAY);
    setW(78, y, 0);
    setW(79, y, 0);
}

// Clean up any stray tiles in the gap columns x=80-84
for (let y = 0; y < map.height; y++) {
    for (let x = 80; x <= 84; x++) {
        // Only clean areas OUTSIDE the stair landing room (y=7-11)
        if (y < 7 || y > 11) {
            if (getG(x, y) !== GRASS && getG(x, y) !== HALLWAY && getG(x, y) !== 0) {
                // Check if it's part of the 2nd floor building (x=85+)
                if (x < 85) {
                    setG(x, y, GRASS);
                }
            }
            // Remove stray walls
            if (x < 85 && getW(x, y) !== 0) {
                setW(x, y, 0);
            }
        }
    }
}

console.log('  Gap area cleaned');

// ============================================
// Fix 3: Improve stair landing (2nd floor)
// x=80-86, y=7-11
// ============================================
console.log('Fix 3: Improving 2nd floor stair landing');

// Ensure floor inside landing is hallway
for (let y = 8; y <= 10; y++) {
    for (let x = 81; x <= 86; x++) {
        if (getG(x, y) !== 184 && getG(x, y) !== 185) {
            setG(x, y, HALLWAY);
        }
    }
}

// Verify walls are correct (they should already be from move_floor_right.cjs)
// Top wall y=7
setW(80, 7, CORNER_TL);
for (let x = 81; x <= 85; x++) setW(x, 7, WALL_TOP);
setW(86, 7, CORNER_TR);
setG(80, 7, OUTER_WALL);
for (let x = 81; x <= 86; x++) {
    if (getG(x, 7) === GRASS) setG(x, 7, OUTER_WALL);
}

// Bottom wall y=11
setW(80, 11, CORNER_BL);
for (let x = 81; x <= 85; x++) setW(x, 11, WALL_BOTTOM);
setW(86, 11, CORNER_BR);
setG(80, 11, OUTER_WALL);
for (let x = 81; x <= 86; x++) {
    if (getG(x, 11) === GRASS) setG(x, 11, OUTER_WALL);
}

// Left wall x=80
for (let y = 8; y <= 10; y++) setW(80, y, WALL_LEFT);

// Right side (x=86-87) — ensure opening connects to 2nd floor corridor
for (let y = 8; y <= 10; y++) {
    setW(86, y, 0); // No wall — open passage to corridor
    setW(87, y, 0);
    if (getG(87, y) === GRASS || getG(87, y) === 0) {
        setG(87, y, HALLWAY);
    }
}

// Ensure the transition from landing to 2nd floor corridor is smooth
// x=85-89, y=8-10 should all be walkable hallway
for (let y = 8; y <= 10; y++) {
    for (let x = 85; x <= 89; x++) {
        if (getG(x, y) === GRASS || getG(x, y) === 0 || getG(x, y) === OUTER_WALL) {
            setG(x, y, HALLWAY);
        }
        // Clear any blocking walls in transition
        if (getW(x, y) !== 0 && x > 80) {
            // Only clear walls inside the corridor, not building walls
            const w = getW(x, y);
            if (w !== WALL_TOP && w !== WALL_BOTTOM && w !== CORNER_TL && w !== CORNER_TR &&
                w !== CORNER_BL && w !== CORNER_BR) {
                setW(x, y, 0);
            }
        }
    }
}

console.log('  Landing room fixed');

// ============================================
// Fix 4: Ensure outdoor path below stair landing
// ============================================
// Below the stair landing (y=12-34, x=80-84) should be clean grass
for (let y = 12; y <= 34; y++) {
    for (let x = 78; x <= 84; x++) {
        if (getG(x, y) !== GRASS) {
            setG(x, y, GRASS);
        }
        if (getW(x, y) !== 0) {
            setW(x, y, 0);
        }
        if (furniture.data[y * W + x] !== 0) {
            furniture.data[y * W + x] = 0;
        }
    }
}

console.log('Fix 4: Cleaned outdoor area below stair landing');

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('\nDone! Stair room walls fixed, gap cleaned, landing improved');
