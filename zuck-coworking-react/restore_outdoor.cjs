/**
 * Restore original outdoor area (y=36-55) from git backup + place lateral stair tiles
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const origPath = path.join(__dirname, 'original_bottom.json');

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const orig = JSON.parse(fs.readFileSync(origPath, 'utf8'));

const W = map.width;
const ground = map.layers.find(l => l.name === 'ground');
const walls = map.layers.find(l => l.name === 'walls');
const furniture = map.layers.find(l => l.name === 'furniture_front');

// ============================================
// Fix 1: Restore original outdoor rows y=36-55
// ============================================
console.log('Restoring original outdoor area (y=36-55)...');
const startY = 36;
for (let i = 0; i < orig.ground.length; i++) {
    const y = startY + i;
    if (y >= map.height) break;
    for (let x = 0; x < W; x++) {
        ground.data[y * W + x] = orig.ground[i][x] || 0;
        walls.data[y * W + x] = orig.walls[i][x] || 0;
        furniture.data[y * W + x] = orig.furniture[i][x] || 0;
    }
}
console.log(`Restored ${orig.ground.length} rows`);

// ============================================
// Fix 2: Place lateral stair tiles on right side (x=71-76, y=22-24)
// Using GID 184 (drawStairsRight) and GID 185 (drawStairsPlatformH)
// ============================================
console.log('Placing lateral stair tiles at x=71-76, y=22-24...');
const STAIR_RIGHT = 184;
const PLAT_H = 185;

for (let y = 22; y <= 24; y++) {
    for (let x = 71; x <= 76; x++) {
        // Left column: platform, middle: stairs, right column: platform
        if (x === 71 || x === 76) {
            ground.data[y * W + x] = PLAT_H;
        } else {
            ground.data[y * W + x] = STAIR_RIGHT;
        }
        // Ensure no walls on stair tiles
        walls.data[y * W + x] = 0;
    }
}

// Keep walls around the stair room (already placed by fix_stair_walls.cjs)
// Just make sure door is open
walls.data[23 * W + 70] = 38; // door GID

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('Done! Outdoor restored + lateral stair tiles placed');
