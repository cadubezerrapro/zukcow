/**
 * Move stairs from center-bottom to right side corridor
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width;
const ground = map.layers.find(l => l.name === 'ground');
const walls = map.layers.find(l => l.name === 'walls');

function setG(x, y, gid) { ground.data[y * W + x] = gid; }
function setW(x, y, gid) { walls.data[y * W + x] = gid; }

const STAIR_DOWN = 182;
const STAIR_PLAT = 183;
const OUTDOOR = 14; // outdoor ground tile

// ============================================
// 1. Remove old stair tiles at y=36-38, x=35-44
// ============================================
console.log('Removing old stairs at y=36-38, x=35-44');
for (let y = 36; y <= 38; y++) {
    for (let x = 35; x <= 44; x++) {
        setG(x, y, OUTDOOR);
        setW(x, y, 0);
    }
}

// ============================================
// 2. Place new stair tiles on right side: x=71-76, y=22-24
// ============================================
console.log('Placing new stairs at x=71-76, y=22-24');
for (let x = 71; x <= 76; x++) {
    setG(x, 22, STAIR_PLAT);  // platform top
    setG(x, 23, STAIR_DOWN);  // stairs
    setG(x, 24, STAIR_PLAT);  // platform bottom
    // Clear any walls in the stair area
    setW(x, 22, 0);
    setW(x, 23, 0);
    setW(x, 24, 0);
}

// Clear walls around stairs for walkability (y=21-25)
for (let x = 71; x <= 76; x++) {
    setW(x, 21, 0);
    setW(x, 25, 0);
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('Stairs moved to right side successfully');
