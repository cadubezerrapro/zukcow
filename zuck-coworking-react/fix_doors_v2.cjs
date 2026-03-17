/**
 * Fix doors v2: Expand door openings to 3 tiles wide + clear nearby furniture
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
const walls = map.layers.find(l => l.name === 'walls');
const W = map.width; // 80

// Tile data values (firstgid=1, so data = tileID + 1)
const DOOR = 5;        // tileID 4 + 1
const WALL_INNER = 22; // tileID 21 + 1
const PARTITION = 23;  // tileID 22 + 1

// Furniture range in data values: tileID 23-40 → data 24-41
const FURNITURE_MIN = 24;
const FURNITURE_MAX = 41;

function getVal(x, y) {
    return walls.data[y * W + x];
}
function setVal(x, y, v) {
    walls.data[y * W + x] = v;
}

// Known door positions
const doorPositions = [
    [24,19],[34,19],[44,19],[54,19],
    [24,26],[34,26],[44,26],[54,26],
    [37,34],[38,34],[37,40],[38,40],
    [48,37]
];

console.log('=== Before fix ===');
doorPositions.forEach(([px,py]) => {
    const val = getVal(px, py);
    const left = getVal(px-1, py);
    const right = getVal(px+1, py);
    const up = getVal(px, py-1);
    const down = getVal(px, py+1);
    console.log(`  (${px},${py}): val=${val} | L=${left} R=${right} U=${up} D=${down}`);
});

// Step 1: Expand each door to 3 tiles wide
// For horizontal doors (most of them), expand left and right
// For vertical door at (48,37), expand up and down
let expandedTiles = new Set();
let changes = 0;

doorPositions.forEach(([px, py]) => {
    // Make sure the door tile itself is set to DOOR
    if (getVal(px, py) !== DOOR) {
        console.log(`  Setting (${px},${py}) from ${getVal(px,py)} to DOOR(${DOOR})`);
        setVal(px, py, DOOR);
        changes++;
    }
    expandedTiles.add(`${px},${py}`);

    if (px === 48 && py === 37) {
        // Vertical door — expand up and down
        [[48,36],[48,38]].forEach(([nx,ny]) => {
            const v = getVal(nx, ny);
            if (v !== DOOR && v !== 0) {
                console.log(`  Expanding vertical door: (${nx},${ny}) from ${v} to DOOR(${DOOR})`);
                setVal(nx, ny, DOOR);
                changes++;
            }
            expandedTiles.add(`${nx},${ny}`);
        });
    } else {
        // Horizontal door — expand left and right
        [[px-1, py], [px+1, py]].forEach(([nx, ny]) => {
            const v = getVal(nx, ny);
            if (v !== DOOR && v !== 0) {
                console.log(`  Expanding horizontal door: (${nx},${ny}) from ${v} to DOOR(${DOOR})`);
                setVal(nx, ny, DOOR);
                changes++;
            }
            expandedTiles.add(`${nx},${ny}`);
        });
    }
});

console.log(`\nExpanded ${changes} tiles to doors.`);

// Step 2: Clear furniture within 3 tiles of any door tile
let furnitureCleared = 0;
const allDoorTiles = [...expandedTiles].map(s => s.split(',').map(Number));

allDoorTiles.forEach(([dx, dy]) => {
    for (let oy = -3; oy <= 3; oy++) {
        for (let ox = -3; ox <= 3; ox++) {
            const cx = dx + ox;
            const cy = dy + oy;
            if (cx < 0 || cx >= W || cy < 0 || cy >= map.height) continue;
            // Don't clear door tiles themselves
            if (expandedTiles.has(`${cx},${cy}`)) continue;

            const v = getVal(cx, cy);
            if (v >= FURNITURE_MIN && v <= FURNITURE_MAX) {
                console.log(`  Clearing furniture at (${cx},${cy}): val=${v}`);
                setVal(cx, cy, 0);
                furnitureCleared++;
            }
        }
    }
});

console.log(`\nCleared ${furnitureCleared} furniture tiles near doors.`);

// Step 3: Verify
console.log('\n=== After fix ===');
doorPositions.forEach(([px,py]) => {
    const val = getVal(px, py);
    const left = getVal(px-1, py);
    const right = getVal(px+1, py);
    console.log(`  (${px},${py}): val=${val} | L=${left} R=${right}`);
});

// Save
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log('\nSaved updated map!');
