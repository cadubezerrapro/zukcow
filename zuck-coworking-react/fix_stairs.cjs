/**
 * Place stair tiles in the stair zones and fix zone 2 walls
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width;
const ground = map.layers.find(l => l.name === 'ground');
const walls = map.layers.find(l => l.name === 'walls');

function setTile(layer, x, y, gid) {
    layer.data[y * W + x] = gid;
}

const STAIR_DOWN = 182;  // GID for stairs
const STAIR_PLAT = 183;  // GID for stair platform
const FLOOR_CONCRETE = 3;

// STAIR ZONE 1: y=36-38, x=35-44 (goes DOWN to 2nd floor)
// y=36: platform row (top)
// y=37: stairs
// y=38: platform row (bottom)
for (let x = 35; x <= 44; x++) {
    setTile(ground, x, 36, STAIR_PLAT);
    setTile(ground, x, 37, STAIR_DOWN);
    setTile(ground, x, 38, STAIR_PLAT);
    // Clear any walls blocking the stair area
    setTile(walls, x, 36, 0);
    setTile(walls, x, 37, 0);
    setTile(walls, x, 38, 0);
}

// STAIR ZONE 2: y=56-58, x=35-44 (goes UP to 1st floor)
for (let x = 35; x <= 44; x++) {
    setTile(ground, x, 56, STAIR_PLAT);
    setTile(ground, x, 57, STAIR_DOWN);
    setTile(ground, x, 58, STAIR_PLAT);
    // Clear walls in stair zone
    setTile(walls, x, 56, 0);
    setTile(walls, x, 57, 0);
    setTile(walls, x, 58, 0);
}

// Ensure corridors around stairs are walkable
for (let x = 35; x <= 44; x++) {
    // Corridor above stair zone 1 (y=35)
    if (ground.data[35 * W + x] === 0) setTile(ground, x, 35, FLOOR_CONCRETE);
    // Corridor below stair zone 2 (y=59)
    if (ground.data[59 * W + x] === 0) setTile(ground, x, 59, FLOOR_CONCRETE);
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('Stair tiles placed successfully');
