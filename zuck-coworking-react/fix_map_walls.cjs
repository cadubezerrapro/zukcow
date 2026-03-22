/**
 * Fix wall blockades preventing stair access + add agent room floor
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width;
const walls = map.layers.find(l => l.name === 'walls');
const ground = map.layers.find(l => l.name === 'ground');

function setWall(x, y, gid) { walls.data[y * W + x] = gid; }
function setGround(x, y, gid) { ground.data[y * W + x] = gid; }
function getWall(x, y) { return walls.data[y * W + x]; }

const FLOOR = 3; // concrete floor GID

// ============================================
// FIX 1: Clear walls blocking path to stair zone 1
// y=34-35, x=35-44
// ============================================
console.log('Fix 1: Clearing walls at y=34-35, x=35-44');
for (let y = 34; y <= 35; y++) {
    for (let x = 35; x <= 44; x++) {
        const w = getWall(x, y);
        if (w > 0) {
            console.log(`  Cleared wall at (${x},${y}): was GID ${w}`);
            setWall(x, y, 0);
        }
        // Ensure floor exists
        if (ground.data[y * W + x] === 0) {
            setGround(x, y, FLOOR);
        }
    }
}

// ============================================
// FIX 2: Open corridor at y=59 (stair exit to 2nd floor)
// Clear walls at x=35-44 to create walkable path from stairs to rooms
// ============================================
console.log('Fix 2: Opening corridor at y=59, x=35-44');
for (let x = 35; x <= 44; x++) {
    const w = getWall(x, 59);
    if (w > 0) {
        console.log(`  Cleared wall at (${x},59): was GID ${w}`);
        setWall(x, 59, 0);
    }
    setGround(x, 59, FLOOR);
}

// Also need to open the room entrances at y=59 - create door openings
// to allow walking from corridor to 2nd floor rooms
// The 2nd floor rooms have doors at specific x positions
// executiva doors: x=12,13  treinamento doors: x=38,39  auditorio doors: x=60,61
// Let's also clear walls from stair area to each room's door line
// Create a full walkable corridor at y=59 from x=2 to x=68
console.log('Fix 2b: Opening full corridor at y=59, x=2-68');
for (let x = 2; x <= 68; x++) {
    const w = getWall(x, 59);
    if (w > 0) {
        console.log(`  Cleared wall at (${x},59): was GID ${w}`);
        setWall(x, 59, 0);
    }
    setGround(x, 59, FLOOR);
}

// ============================================
// FIX 3: Add floor tiles for agent storage room
// x=70-79, y=40-55
// ============================================
console.log('Fix 3: Adding floor for agent room at x=70-79, y=40-55');
for (let y = 40; y <= 55; y++) {
    for (let x = 70; x <= 79; x++) {
        setGround(x, y, FLOOR);
        setWall(x, y, 0); // ensure no walls
    }
}

// Also ensure ground exists in the path from agent room to main corridors
// Agents need to walk from x=70+ to the main building area
for (let y = 40; y <= 55; y++) {
    for (let x = 69; x <= 70; x++) {
        if (ground.data[y * W + x] === 0) {
            setGround(x, y, FLOOR);
        }
    }
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log('Done! Map walls fixed.');
