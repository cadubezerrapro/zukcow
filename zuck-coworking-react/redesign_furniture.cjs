/**
 * Complete furniture redesign for ZuckPay Co-Work
 * Clears ALL furniture and replaces with organized, Gather-inspired layouts
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
const walls = map.layers.find(l => l.name === 'walls');
const W = 80;

// Tile data values (tileID + 1)
const T = {
    DESK: 23,       // tileID 22 - desk w/ monitor (sittable)
    MTABLE: 24,     // tileID 23 - meeting table
    PLANT: 25,      // tileID 24 - potted plant
    BOOKSHELF: 26,  // tileID 25 - bookshelf
    SOFA: 27,       // tileID 26 - sofa (sittable)
    CHAIR: 28,      // tileID 27 - office chair (sittable)
    WHITEBOARD: 29, // tileID 28 - whiteboard
    COFFEE: 30,     // tileID 29 - coffee station
    TV: 31,         // tileID 30 - smart TV
    WATER: 32,      // tileID 31 - water cooler
    SDESK: 33,      // tileID 32 - standing desk
    LIGHT: 34,      // tileID 33 - ceiling light
    PRINTER: 35,    // tileID 34 - printer
    BEANBAG: 36,    // tileID 35 - bean bag (sittable)
    FRIDGE: 37,     // tileID 36 - mini fridge
    COATRACK: 38,   // tileID 37 - coat rack
    RUG: 39,        // tileID 38 - decorative rug
    ART: 40,        // tileID 39 - wall art
};

function getVal(x, y) { return walls.data[y * W + x]; }
function setVal(x, y, v) { walls.data[y * W + x] = v; }

// Step 1: Clear ALL furniture (data >= 23) from walls layer
let cleared = 0;
for (let i = 0; i < walls.data.length; i++) {
    if (walls.data[i] >= 23) {
        walls.data[i] = 0;
        cleared++;
    }
}
console.log(`Cleared ${cleared} furniture tiles.`);

// Step 2: Place furniture using coordinate arrays
// Format: [x, y, tileDataValue]
const furniture = [
    // ===========================
    // SALA 1 (20-28, 14-18) - Reunião Pequena
    // ===========================
    [23, 14, T.TV],
    [20, 15, T.PLANT], [28, 15, T.PLANT],
    [22, 16, T.MTABLE], [23, 16, T.MTABLE], [24, 16, T.MTABLE],
    [21, 17, T.CHAIR], [22, 17, T.MTABLE], [23, 17, T.MTABLE], [24, 17, T.MTABLE], [25, 17, T.CHAIR],
    [22, 18, T.CHAIR], [24, 18, T.CHAIR],

    // ===========================
    // SALA 2 (29-38, 14-18) - Reunião Pequena 2
    // ===========================
    [31, 14, T.WHITEBOARD], [36, 14, T.WHITEBOARD],
    [29, 15, T.PLANT], [38, 15, T.PLANT],
    [31, 16, T.MTABLE], [32, 16, T.MTABLE], [33, 16, T.MTABLE], [34, 16, T.MTABLE],
    [30, 17, T.CHAIR], [31, 17, T.MTABLE], [32, 17, T.MTABLE], [33, 17, T.MTABLE], [34, 17, T.MTABLE], [35, 17, T.CHAIR],
    [31, 18, T.CHAIR], [34, 18, T.CHAIR],

    // ===========================
    // SALA 3 (39-50, 14-18) - Sala com Desks
    // ===========================
    [44, 14, T.ART],
    [39, 15, T.PLANT], [50, 15, T.PLANT],
    [41, 15, T.DESK], [42, 15, T.DESK], [46, 15, T.DESK], [47, 15, T.DESK],
    [41, 16, T.CHAIR], [42, 16, T.CHAIR], [46, 16, T.CHAIR], [47, 16, T.CHAIR],
    [44, 17, T.PRINTER],

    // ===========================
    // SALA 4 (51-59, 14-18) - Sala Privativa
    // ===========================
    [55, 14, T.TV],
    [51, 15, T.PLANT], [59, 15, T.PLANT],
    [53, 15, T.DESK], [54, 15, T.CHAIR],
    [57, 15, T.SOFA],
    [57, 16, T.SOFA],
    [53, 17, T.BOOKSHELF],

    // ===========================
    // WORKSPACE A (20-30, 21-25) - Open Office
    // ===========================
    [21, 21, T.DESK], [22, 21, T.DESK], [24, 21, T.DESK], [25, 21, T.DESK], [28, 21, T.DESK], [29, 21, T.DESK],
    [21, 22, T.CHAIR], [22, 22, T.CHAIR], [24, 22, T.CHAIR], [25, 22, T.CHAIR], [28, 22, T.CHAIR], [29, 22, T.CHAIR],
    // row 2 of desks
    [21, 24, T.DESK], [22, 24, T.DESK], [24, 24, T.DESK], [25, 24, T.DESK],
    [21, 25, T.CHAIR], [22, 25, T.CHAIR], [24, 25, T.CHAIR], [25, 25, T.CHAIR],
    [29, 25, T.PLANT], [30, 25, T.PLANT],

    // ===========================
    // WORKSPACE B (31-42, 21-25) - Open Office
    // ===========================
    [32, 21, T.DESK], [33, 21, T.DESK], [35, 21, T.DESK], [36, 21, T.DESK], [39, 21, T.DESK], [40, 21, T.DESK],
    [32, 22, T.CHAIR], [33, 22, T.CHAIR], [35, 22, T.CHAIR], [36, 22, T.CHAIR], [39, 22, T.CHAIR], [40, 22, T.CHAIR],
    // row 2 of desks
    [32, 24, T.DESK], [33, 24, T.DESK], [35, 24, T.DESK], [36, 24, T.DESK], [39, 24, T.DESK], [40, 24, T.DESK],
    [32, 25, T.CHAIR], [33, 25, T.CHAIR], [35, 25, T.CHAIR], [36, 25, T.CHAIR], [39, 25, T.CHAIR], [40, 25, T.CHAIR],
    [42, 25, T.PLANT],

    // ===========================
    // AREA ABERTA (43-52, 21-25) - Convivência
    // ===========================
    [45, 21, T.SDESK], [49, 21, T.SDESK],
    [47, 22, T.COFFEE],
    [44, 23, T.BEANBAG], [45, 23, T.BEANBAG], [47, 23, T.RUG], [50, 23, T.BEANBAG], [51, 23, T.BEANBAG],
    [47, 25, T.WATER],
    [43, 25, T.PLANT], [52, 25, T.PLANT],

    // ===========================
    // REUNIÃO (53-59, 21-25) - Reunião Express
    // ===========================
    [56, 21, T.TV],
    [54, 22, T.MTABLE], [55, 22, T.MTABLE], [56, 22, T.MTABLE], [57, 22, T.MTABLE],
    [54, 23, T.CHAIR], [57, 23, T.CHAIR],
    [54, 24, T.MTABLE], [55, 24, T.MTABLE], [56, 24, T.MTABLE], [57, 24, T.MTABLE],
    [55, 25, T.CHAIR], [57, 25, T.CHAIR],
    [59, 22, T.PLANT], [59, 25, T.PLANT],

    // ===========================
    // CONFERÊNCIA (20-37, 28-33) - Grande Sala de Conferência
    // ===========================
    [23, 28, T.BOOKSHELF], [30, 28, T.TV],
    [20, 29, T.PLANT], [37, 29, T.PLANT],
    // Mesa grande central
    [23, 30, T.CHAIR], [24, 30, T.MTABLE], [25, 30, T.MTABLE], [26, 30, T.MTABLE], [27, 30, T.MTABLE], [28, 30, T.MTABLE], [29, 30, T.MTABLE], [30, 30, T.CHAIR],
    [23, 31, T.CHAIR], [24, 31, T.MTABLE], [25, 31, T.MTABLE], [26, 31, T.MTABLE], [27, 31, T.MTABLE], [28, 31, T.MTABLE], [29, 31, T.MTABLE], [30, 31, T.CHAIR],
    [24, 32, T.CHAIR], [25, 32, T.CHAIR], [26, 32, T.CHAIR], [27, 32, T.CHAIR], [28, 32, T.CHAIR], [29, 32, T.CHAIR],
    [20, 33, T.PLANT], [33, 33, T.WHITEBOARD], [37, 33, T.PLANT],

    // ===========================
    // ÁREA COLABORATIVA (39-59, 28-33) - Mix de estações
    // ===========================
    [39, 29, T.PLANT], [59, 29, T.PLANT],
    // Grupo 1: 4 desks
    [41, 29, T.DESK], [42, 29, T.DESK], [45, 29, T.DESK], [46, 29, T.DESK],
    [41, 30, T.CHAIR], [42, 30, T.CHAIR], [45, 30, T.CHAIR], [46, 30, T.CHAIR],
    // Beanbag area
    [50, 29, T.BEANBAG], [51, 29, T.BEANBAG],
    [50, 30, T.BEANBAG], [51, 30, T.BEANBAG],
    [50, 31, T.RUG],
    // Grupo 2: desks
    [54, 29, T.DESK], [55, 29, T.DESK],
    [54, 30, T.CHAIR], [55, 30, T.CHAIR],
    // Lower row
    [41, 32, T.DESK], [42, 32, T.DESK],
    [41, 33, T.CHAIR], [42, 33, T.CHAIR],
    [46, 32, T.SDESK],
    [50, 33, T.BOOKSHELF],
    [54, 32, T.DESK], [55, 32, T.DESK],
    [54, 33, T.CHAIR], [55, 33, T.CHAIR],
    [59, 33, T.PLANT],

    // ===========================
    // LOUNGE / CAFETERIA (20-48, 36-40) - Área Social
    // ===========================
    [21, 36, T.COATRACK],
    [20, 37, T.PLANT],
    // Sofa group 1
    [23, 36, T.SOFA], [24, 36, T.SOFA],
    [23, 37, T.SOFA], [24, 37, T.SOFA],
    [23, 38, T.RUG],
    // Coffee area
    [28, 36, T.COFFEE],
    [30, 38, T.FRIDGE],
    // Dining tables
    [33, 36, T.MTABLE], [34, 36, T.MTABLE],
    [33, 37, T.CHAIR], [34, 37, T.CHAIR],
    // Sofa group 2
    [39, 36, T.SOFA], [40, 36, T.SOFA],
    [39, 37, T.SOFA], [40, 37, T.SOFA],
    [39, 38, T.RUG],
    // More dining
    [44, 38, T.FRIDGE],
    // Beanbags
    [25, 39, T.BEANBAG], [26, 39, T.BEANBAG],
    [36, 39, T.BEANBAG], [37, 39, T.BEANBAG],
    [20, 39, T.PLANT], [48, 39, T.PLANT],
    // Dining table 2
    [43, 36, T.MTABLE], [44, 36, T.MTABLE],
    [43, 37, T.CHAIR], [44, 37, T.CHAIR],

    // ===========================
    // DESCANSO (51-59, 36-40) - Sala de Descanso
    // ===========================
    [54, 36, T.BEANBAG], [55, 36, T.BEANBAG],
    [57, 37, T.RUG],
    [59, 37, T.PLANT],
    [52, 38, T.BEANBAG], [53, 38, T.BEANBAG],
    [55, 39, T.PLANT],
    [58, 39, T.ART],
];

// Step 3: Place all furniture, checking for conflicts
let placed = 0;
let skipped = 0;
const doorPositions = new Set();

// Find all door tiles first
for (let i = 0; i < walls.data.length; i++) {
    if (walls.data[i] === 5) { // DOOR
        const x = i % W;
        const y = Math.floor(i / W);
        doorPositions.add(`${x},${y}`);
    }
}

furniture.forEach(([x, y, val]) => {
    const current = getVal(x, y);

    // Don't overwrite structural tiles (walls 1-22, doors 5)
    if (current > 0 && current <= 22) {
        console.log(`  SKIP (${x},${y}): has structural tile ${current}`);
        skipped++;
        return;
    }

    // Don't place within 1 tile of a door
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (doorPositions.has(`${x+dx},${y+dy}`)) {
                console.log(`  SKIP (${x},${y}): too close to door at (${x+dx},${y+dy})`);
                skipped++;
                return;
            }
        }
    }

    setVal(x, y, val);
    placed++;
});

console.log(`\nPlaced ${placed} furniture tiles, skipped ${skipped}.`);

// Step 4: Verify - print visual grid
const tileChars = {
    0: '.', 5: 'D',
    15: '&', 16: '&', 17: '&', 18: '&', 19: '&', 20: '#', 21: '#', 22: 'P',
    23: 'd', 24: 'M', 25: 'p', 26: 'B', 27: 'S', 28: 'C', 29: 'W',
    30: '$', 31: 'T', 32: 'w', 33: 'L', 34: 'R', 35: 'I', 36: 'o',
    37: 'f', 38: '~', 39: '=', 40: 'A',
};

console.log('\n=== Room layouts ===');
for (let y = 13; y <= 41; y++) {
    let row = String(y).padStart(2) + '|';
    for (let x = 19; x <= 60; x++) {
        const v = getVal(x, y);
        row += tileChars[v] || (v > 0 ? '?' : '.');
    }
    row += '|';
    console.log(row);
}

// Save
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log('\nSaved redesigned map!');
