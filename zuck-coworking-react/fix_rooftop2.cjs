/**
 * Fix wrong furniture GIDs in Rooftop Bar and Terraço.
 * expand_map2.cjs used wrong GIDs: 61=water, 73=grass, 85=reception
 * Correct GIDs: 25=plant, 24=table, 28=chair
 */
const fs = require('fs');
const path = require('path');

const mapPath = path.join(__dirname, 'src/game/maps/default_office.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const W = map.width;
const furn = map.layers.find(l => l.name === 'furniture_front');

const REPLACE = {
    61: 25,   // waterCornerBR → plant
    73: 24,   // grassToPath → meeting table
    85: 28,   // receptionDesk → chair
    165: 25,  // parasol → plant (parasol may not render well)
};

let count = 0;
for (let y = 26; y <= 31; y++) {
    for (let x = 85; x <= 151; x++) {
        const idx = y * W + x;
        const gid = furn.data[idx];
        if (REPLACE[gid] !== undefined) {
            furn.data[idx] = REPLACE[gid];
            count++;
        }
    }
}

fs.writeFileSync(mapPath, JSON.stringify(map));
console.log(`Fixed ${count} wrong furniture GIDs in Terraço/Rooftop`);
