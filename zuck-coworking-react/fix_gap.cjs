/**
 * Fill gap between floors (y=39-55) with roof tiles and clean up stray walls/furniture
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width;
const ground = map.layers.find(l => l.name === 'ground');
const walls = map.layers.find(l => l.name === 'walls');
const furniture = map.layers.find(l => l.name === 'furniture_front');

const ROOF_DARK = 11;  // GID 11 = dark tile (good for roof appearance)
const WALL_TOP = 13;   // horizontal wall

let cleared_walls = 0;
let cleared_furniture = 0;
let filled_ground = 0;

for (let y = 39; y <= 55; y++) {
    for (let x = 0; x < W; x++) {
        // Clear all walls in gap area
        if (walls.data[y * W + x] > 0) {
            walls.data[y * W + x] = 0;
            cleared_walls++;
        }

        // Clear all furniture in gap area
        if (furniture.data[y * W + x] > 0) {
            furniture.data[y * W + x] = 0;
            cleared_furniture++;
        }

        // Fill ground with roof tile
        ground.data[y * W + x] = ROOF_DARK;
        filled_ground++;
    }
}

// Add wall borders at top and bottom of gap for visual separation
for (let x = 0; x < W; x++) {
    walls.data[39 * W + x] = WALL_TOP;
    walls.data[55 * W + x] = WALL_TOP;
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log(`Gap filled: ${filled_ground} ground tiles, ${cleared_walls} walls cleared, ${cleared_furniture} furniture cleared`);
console.log('Added wall borders at y=39 and y=55');
