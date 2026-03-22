/**
 * Fix Rooftop Bar and Terraço:
 * 1. Correct wall GIDs (old 13-27 → proper 41-48)
 * 2. Add glass partition panels
 * 3. Improve decoration/furniture
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width; // 155
const ground = map.layers.find(l => l.name === 'ground');
const walls = map.layers.find(l => l.name === 'walls');
const furn = map.layers.find(l => l.name === 'furniture_front');

function setG(x, y, gid) { ground.data[y * W + x] = gid; }
function setW(x, y, gid) { walls.data[y * W + x] = gid; }
function setF(x, y, gid) { furn.data[y * W + x] = gid; }
function getW(x, y) { return walls.data[y * W + x]; }

// Correct wall GIDs
const WALL_TOP = 41;
const WALL_BOTTOM = 42;
const WALL_LEFT = 43;
const WALL_RIGHT = 44;
const CORNER_TL = 45;
const CORNER_TR = 46;
const CORNER_BL = 47;
const CORNER_BR = 48;
const DOOR = 4;
const GLASS = 21;    // glass partition panel

// Wrong → Correct mapping
const WALL_FIX = {
    13: WALL_TOP,     // grassDense → WALL_TOP
    14: CORNER_TL,    // stonePath → CORNER_TL
    15: CORNER_TR,    // treePine → CORNER_TR
    25: WALL_LEFT,    // bookshelf → WALL_LEFT (or WALL_RIGHT)
    26: CORNER_BL,    // sofa → CORNER_BL
    27: CORNER_BR,    // officeChair → CORNER_BR
    38: DOOR,         // rug → DOOR (walkable)
};

// ============================================
// Fix 1: Correct wall GIDs for Terraço + Rooftop
// Terraço: x=85-113, y=26-31
// Rooftop: x=115-151, y=26-31
// ============================================
console.log('Fix 1: Correcting wall GIDs for Terraço and Rooftop');

// --- TERRAÇO (x=85-113, y=26-31) ---
// Top wall y=26
setW(85, 26, CORNER_TL);
for (let x = 86; x <= 112; x++) {
    setW(x, 26, WALL_TOP);
}
setW(113, 26, CORNER_TR);
// Door at x=98-99
setW(98, 26, DOOR);
setW(99, 26, DOOR);

// Side walls y=27-30
for (let y = 27; y <= 30; y++) {
    setW(85, y, WALL_LEFT);
    setW(113, y, WALL_RIGHT);
    // Clear interior
    for (let x = 86; x <= 112; x++) setW(x, y, 0);
}

// Bottom wall y=31
setW(85, 31, CORNER_BL);
for (let x = 86; x <= 112; x++) {
    setW(x, 31, WALL_BOTTOM);
}
setW(113, 31, CORNER_BR);

// --- ROOFTOP BAR (x=115-151, y=26-31) ---
// Top wall y=26
setW(115, 26, CORNER_TL);
for (let x = 116; x <= 150; x++) {
    setW(x, 26, WALL_TOP);
}
setW(151, 26, CORNER_TR);
// Door at x=132-133
setW(132, 26, DOOR);
setW(133, 26, DOOR);

// Side walls y=27-30
for (let y = 27; y <= 30; y++) {
    setW(115, y, WALL_LEFT);
    setW(151, y, WALL_RIGHT);
    // Clear interior
    for (let x = 116; x <= 150; x++) setW(x, y, 0);
}

// Bottom wall y=31
setW(115, 31, CORNER_BL);
for (let x = 116; x <= 150; x++) {
    setW(x, 31, WALL_BOTTOM);
}
setW(151, 31, CORNER_BR);

// Divider wall between Terraço and Rooftop
for (let y = 27; y <= 30; y++) {
    setW(114, y, WALL_RIGHT);
}
setW(114, 26, WALL_TOP);
setW(114, 31, WALL_BOTTOM);

console.log('  Walls corrected to GIDs 41-48');

// ============================================
// Fix 2: Add glass partition panels on top walls
// ============================================
console.log('Fix 2: Adding glass panels');

// Terraço: alternate glass panels on top wall (odd positions)
for (let x = 87; x <= 111; x += 2) {
    if (x !== 98 && x !== 99) { // Don't replace door
        setW(x, 26, GLASS);
    }
}

// Rooftop: alternate glass panels on top wall
for (let x = 117; x <= 149; x += 2) {
    if (x !== 132 && x !== 133) { // Don't replace door
        setW(x, 26, GLASS);
    }
}

console.log('  Glass panels added on top walls');

// ============================================
// Fix 3: Clear and redo furniture for Rooftop Bar
// ============================================
console.log('Fix 3: Improving Rooftop Bar decoration');

// Clear all existing furniture in Rooftop area
for (let y = 26; y <= 31; y++) {
    for (let x = 115; x <= 151; x++) {
        setF(x, y, 0);
    }
}

// Furniture GIDs
const BAR_COUNTER = 109;
const PLANT_POT = 61;
const SMALL_TABLE = 73;
const CHAIR = 85;
const NEON_SIGN = 155;
const DJ_TABLE = 156;
const SPEAKER = 154;
const PARASOL = 165;
const PAINTING = 77;

// Bar counter line (shorter, centered)
for (let x = 125; x <= 140; x++) {
    setF(x, 27, BAR_COUNTER);
}

// Neon sign behind bar
setF(133, 27, NEON_SIGN);

// Speakers on sides
setF(117, 28, SPEAKER);
setF(149, 28, SPEAKER);

// DJ table in corner
setF(148, 29, DJ_TABLE);

// Seating area 1 (left side)
setF(119, 29, SMALL_TABLE);
setF(118, 29, CHAIR);
setF(120, 29, CHAIR);
setF(119, 30, CHAIR);

// Seating area 2 (center-left)
setF(127, 29, SMALL_TABLE);
setF(126, 29, CHAIR);
setF(128, 29, CHAIR);
setF(127, 30, CHAIR);

// Seating area 3 (center-right)
setF(135, 29, SMALL_TABLE);
setF(134, 29, CHAIR);
setF(136, 29, CHAIR);
setF(135, 30, CHAIR);

// Seating area 4 (right side)
setF(143, 29, SMALL_TABLE);
setF(142, 29, CHAIR);
setF(144, 29, CHAIR);
setF(143, 30, CHAIR);

// Plants in corners
setF(116, 27, PLANT_POT);
setF(150, 27, PLANT_POT);
setF(116, 30, PLANT_POT);
setF(150, 30, PLANT_POT);

// Painting on back wall area
setF(122, 27, PAINTING);
setF(144, 27, PAINTING);

console.log('  Rooftop Bar furniture placed');

// ============================================
// Fix 4: Clear and redo furniture for Terraço
// ============================================
console.log('Fix 4: Improving Terraço decoration');

// Clear existing furniture
for (let y = 26; y <= 31; y++) {
    for (let x = 85; x <= 113; x++) {
        setF(x, y, 0);
    }
}

// Seating cluster 1
setF(90, 28, SMALL_TABLE);
setF(89, 28, CHAIR);
setF(91, 28, CHAIR);
setF(90, 29, CHAIR);

// Seating cluster 2
setF(100, 28, SMALL_TABLE);
setF(99, 28, CHAIR);
setF(101, 28, CHAIR);
setF(100, 29, CHAIR);

// Seating cluster 3
setF(108, 28, SMALL_TABLE);
setF(107, 28, CHAIR);
setF(109, 28, CHAIR);
setF(108, 29, CHAIR);

// Parasols for shade
setF(90, 27, PARASOL);
setF(108, 27, PARASOL);

// Plants along edges
setF(86, 27, PLANT_POT);
setF(86, 30, PLANT_POT);
setF(112, 27, PLANT_POT);
setF(112, 30, PLANT_POT);
setF(95, 30, PLANT_POT);
setF(105, 30, PLANT_POT);

console.log('  Terraço furniture placed');

// ============================================
// Fix 5: Ensure correct ground tiles
// ============================================
// Rooftop ground should be dark floor (7)
for (let y = 26; y <= 31; y++) {
    for (let x = 115; x <= 151; x++) {
        setG(x, y, 7);
    }
}
// Terraço ground should be deck tile (8)
for (let y = 26; y <= 31; y++) {
    for (let x = 85; x <= 113; x++) {
        setG(x, y, 8);
    }
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('\nDone! Rooftop Bar and Terraço fixed.');
