/**
 * Expand map from 75 to 82 rows to accommodate terraco (y=74-79) and rooftop (y=74-79)
 * Also adds grass border below.
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width; // 80
const oldH = map.height; // 75
const newH = 82;
const addRows = newH - oldH; // 7 extra rows

console.log(`Expanding map from ${W}x${oldH} to ${W}x${newH} (+${addRows} rows)`);

// Tile GIDs (1-based in Tiled JSON)
const GRASS = 1;        // id 0 = grass
const GRASS_DARK = 5;   // id 4 = darker grass variant
const FLOOR_WOOD = 6;   // id 5 = wood floor
const FLOOR_DARK = 7;   // id 6 = dark floor
const WALL_TOP = 13;    // id 12
const WALL_SIDE = 25;   // id 24
const WALL_CORNER_TL = 14; // id 13
const WALL_CORNER_TR = 15; // id 14
const WALL_CORNER_BL = 26; // id 25
const WALL_CORNER_BR = 27; // id 26
const DOOR = 38;        // id 37
const FLOOR_CONCRETE = 3; // id 2 = concrete
const DECK_TILE = 8;    // id 7 = tile floor (use as deck)
const TREE = 49;        // id 48
const BUSH = 50;        // id 49

// Get existing layer data
function getLayer(name) {
    return map.layers.find(l => l.name === name);
}

const ground = getLayer('ground');
const walls = getLayer('walls');
const furniture = getLayer('furniture_front');

// Helper to get/set tile
function getTile(layer, x, y) {
    if (y >= oldH || x >= W) return 0;
    return layer.data[y * W + x];
}

function setTile(layer, x, y, gid) {
    layer.data[y * W + x] = gid;
}

// Expand each layer by adding empty rows
for (const layer of [ground, walls, furniture]) {
    const newData = new Array(W * newH).fill(0);
    // Copy existing data
    for (let i = 0; i < layer.data.length; i++) {
        newData[i] = layer.data[i];
    }
    layer.data = newData;
    layer.height = newH;
    layer.width = W;
}

// Update map dimensions
map.height = newH;

// Now fill in the new rows (y=75 to y=81)
// Layout:
// y=74: was last row of old map (already has some grass)
// y=75-79: Terraco (x=2-30) and Rooftop Bar (x=32-68) room interiors
// y=80: Bottom walls of rooms
// y=81: Grass border

// First, let's also fix y=74 - it should be the top wall of terraco/rooftop
// Terraco: x=2-30, y=74-79
// Rooftop: x=32-68, y=74-79

// --- GROUND LAYER ---
// Fill grass for all new rows first
for (let y = 75; y < newH; y++) {
    for (let x = 0; x < W; x++) {
        setTile(ground, x, y, GRASS);
    }
}

// Terraco room floor (outdoor deck style) - x=2-30, y=74-79
for (let y = 74; y <= 79; y++) {
    for (let x = 2; x <= 30; x++) {
        setTile(ground, x, y, DECK_TILE);
    }
}

// Rooftop Bar floor (dark wood) - x=32-68, y=74-79
for (let y = 74; y <= 79; y++) {
    for (let x = 32; x <= 68; x++) {
        setTile(ground, x, y, FLOOR_DARK);
    }
}

// Corridor between rooms at y=73 (should already exist, but ensure it has floor)
for (let x = 2; x <= 68; x++) {
    const existing = getTile(ground, x, 73);
    if (existing === 0 || existing === GRASS) {
        setTile(ground, x, 73, FLOOR_CONCRETE);
    }
}

// Grass row at y=80-81
for (let y = 80; y < newH; y++) {
    for (let x = 0; x < W; x++) {
        setTile(ground, x, y, (x + y) % 3 === 0 ? GRASS_DARK : GRASS);
    }
}

// --- WALLS LAYER ---
// Terraco walls (open-air, so partial walls)
// Top wall at y=74
for (let x = 2; x <= 30; x++) {
    setTile(walls, x, 74, WALL_TOP);
}
setTile(walls, 2, 74, WALL_CORNER_TL);
setTile(walls, 30, 74, WALL_CORNER_TR);

// Side walls
for (let y = 75; y <= 79; y++) {
    setTile(walls, 2, y, WALL_SIDE);
    setTile(walls, 30, y, WALL_SIDE);
}
// Bottom wall
for (let x = 2; x <= 30; x++) {
    setTile(walls, x, 79, WALL_TOP);
}
setTile(walls, 2, 79, WALL_CORNER_BL);
setTile(walls, 30, 79, WALL_CORNER_BR);

// Door for terraco at y=74
setTile(walls, 15, 74, DOOR);
setTile(walls, 16, 74, DOOR);

// Rooftop Bar walls
for (let x = 32; x <= 68; x++) {
    setTile(walls, x, 74, WALL_TOP);
}
setTile(walls, 32, 74, WALL_CORNER_TL);
setTile(walls, 68, 74, WALL_CORNER_TR);

for (let y = 75; y <= 79; y++) {
    setTile(walls, 32, y, WALL_SIDE);
    setTile(walls, 68, y, WALL_SIDE);
}
for (let x = 32; x <= 68; x++) {
    setTile(walls, x, 79, WALL_TOP);
}
setTile(walls, 32, 79, WALL_CORNER_BL);
setTile(walls, 68, 79, WALL_CORNER_BR);

// Door for rooftop at y=74
setTile(walls, 49, 74, DOOR);
setTile(walls, 50, 74, DOOR);

// Clear interior walls (the room interiors should not have walls)
for (let y = 75; y <= 78; y++) {
    for (let x = 3; x <= 29; x++) {
        setTile(walls, x, y, 0);
    }
    for (let x = 33; x <= 67; x++) {
        setTile(walls, x, y, 0);
    }
}

// --- FURNITURE LAYER ---
// Terraco: outdoor furniture (benches, plants)
// Use existing tile GIDs for decoration
const BENCH = 97;       // id 96 = bench
const PLANT_POT = 61;   // id 60 = small plant
const TABLE_SM = 73;    // id 72 = small table
const CHAIR = 85;       // id 84 = chair

// Terraco furniture: scattered seating areas
setTile(furniture, 5, 76, PLANT_POT);
setTile(furniture, 10, 76, TABLE_SM);
setTile(furniture, 11, 76, CHAIR);
setTile(furniture, 15, 77, BENCH);
setTile(furniture, 20, 76, PLANT_POT);
setTile(furniture, 25, 76, TABLE_SM);
setTile(furniture, 26, 76, CHAIR);
setTile(furniture, 8, 78, PLANT_POT);
setTile(furniture, 22, 78, PLANT_POT);

// Rooftop Bar furniture: bar counter, stools, tables
const BAR_COUNTER = 109; // id 108 = reception/counter
const STOOL = 85;        // reuse chair as stool

// Bar counter along one wall
for (let x = 40; x <= 55; x++) {
    setTile(furniture, x, 75, BAR_COUNTER);
}
// Tables and chairs scattered
setTile(furniture, 35, 77, TABLE_SM);
setTile(furniture, 36, 77, CHAIR);
setTile(furniture, 37, 77, CHAIR);
setTile(furniture, 45, 77, TABLE_SM);
setTile(furniture, 46, 77, CHAIR);
setTile(furniture, 55, 77, TABLE_SM);
setTile(furniture, 56, 77, CHAIR);
setTile(furniture, 60, 76, PLANT_POT);
setTile(furniture, 65, 76, PLANT_POT);
setTile(furniture, 50, 78, PLANT_POT);

// Add some trees on the grass border
for (let x = 5; x < W - 5; x += 8) {
    setTile(furniture, x, 81, TREE);
}

// Write output
fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('Map expanded successfully to', W, 'x', newH);
console.log('Ground layer:', ground.data.length, 'tiles');
console.log('Walls layer:', walls.data.length, 'tiles');
console.log('Furniture layer:', furniture.data.length, 'tiles');
