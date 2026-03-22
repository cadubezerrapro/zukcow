/**
 * Add walls around stair room on right side + replace dark gap tiles with grass
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

const WALL_H = 13;    // horizontal wall
const WALL_V = 25;    // vertical wall (side)
const CORNER_TL = 14;
const CORNER_TR = 15;
const CORNER_BL = 26;
const CORNER_BR = 27;
const DOOR = 38;
const GRASS = 14;      // green grass GID

// ============================================
// Fix 1: Walls around stair room (x=70-77, y=21-25)
// ============================================
console.log('Fix 1: Adding walls around stair room');

// Top wall y=21
for (let x = 70; x <= 77; x++) setW(x, 21, WALL_H);
setW(70, 21, CORNER_TL);
setW(77, 21, CORNER_TR);

// Bottom wall y=25
for (let x = 70; x <= 77; x++) setW(x, 25, WALL_H);
setW(70, 25, CORNER_BL);
setW(77, 25, CORNER_BR);

// Side walls y=22-24
for (let y = 22; y <= 24; y++) {
    setW(70, y, WALL_V);
    setW(77, y, WALL_V);
}

// Door opening on left wall (x=70, y=23) - player enters from left
setW(70, 23, DOOR);

// ============================================
// Fix 2: Replace dark gap tiles (GID 11) with grass (GID 14)
// ============================================
console.log('Fix 2: Replacing dark gap with grass');

for (let y = 39; y <= 55; y++) {
    for (let x = 0; x < W; x++) {
        // Replace ground
        if (ground.data[y * W + x] === 11) {
            setG(x, y, GRASS);
        }
        // Remove all walls in gap (including the W13 border lines)
        if (walls.data[y * W + x] > 0) {
            setW(x, y, 0);
        }
    }
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('Done! Stair room walled + gap is now grass');
