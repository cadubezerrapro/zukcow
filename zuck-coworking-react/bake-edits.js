#!/usr/bin/env node
/**
 * Bake localStorage furniture edits into default_office.json
 *
 * Usage:
 *   node bake-edits.js map_edits.json
 *
 * This reads the edits exported from the browser (via "Exportar Edits" button),
 * applies place/delete operations directly to the map JSON layers,
 * and saves rotate/flip overrides separately (since Tiled JSON doesn't support per-tile rotation).
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAP_PATH = resolve(__dirname, 'src/game/maps/default_office.json');

const editsFile = process.argv[2];
if (!editsFile) {
    console.error('Uso: node bake-edits.js <arquivo_de_edits.json>');
    console.error('  Exporte os edits pelo botao "Exportar Edits" no editor do app.');
    process.exit(1);
}

// Read inputs
const map = JSON.parse(readFileSync(MAP_PATH, 'utf8'));
const edits = JSON.parse(readFileSync(resolve(editsFile), 'utf8'));

const W = map.width;
const wallsLayer = map.layers.find(l => l.name === 'walls');
const frontLayer = map.layers.find(l => l.name === 'furniture_front');

if (!wallsLayer || !frontLayer) {
    console.error('Erro: layers "walls" ou "furniture_front" nao encontradas no mapa.');
    process.exit(1);
}

const rotationOverrides = [];
let placedCount = 0;
let deletedCount = 0;
let rotatedCount = 0;
let flippedCount = 0;

for (const edit of edits) {
    const idx = edit.y * W + edit.x;
    const targetData = (edit.layer === 'front') ? frontLayer.data : wallsLayer.data;

    switch (edit.type) {
        case 'place':
            targetData[idx] = edit.tileId;
            placedCount++;
            // If the tile also has rotation, save override
            if (edit.rotation) {
                rotationOverrides.push({ type: 'rotate', x: edit.x, y: edit.y, rotation: edit.rotation, layer: edit.layer });
            }
            break;

        case 'delete':
            targetData[idx] = 0;
            // Also clear from front layer if no specific layer was set
            if (!edit.layer) {
                frontLayer.data[idx] = 0;
            }
            deletedCount++;
            break;

        case 'rotate':
            rotationOverrides.push(edit);
            rotatedCount++;
            break;

        case 'flip':
            rotationOverrides.push(edit);
            flippedCount++;
            break;
    }
}

// Save updated map
writeFileSync(MAP_PATH, JSON.stringify(map));
console.log(`Mapa atualizado: ${MAP_PATH}`);
console.log(`  ${placedCount} tiles colocados`);
console.log(`  ${deletedCount} tiles removidos`);

// Save rotation/flip overrides if any
if (rotationOverrides.length > 0) {
    const overridesPath = resolve(__dirname, 'src/game/maps/rotation_overrides.json');
    writeFileSync(overridesPath, JSON.stringify(rotationOverrides, null, 2));
    console.log(`  ${rotatedCount} rotacoes + ${flippedCount} flips salvos em: ${overridesPath}`);
    console.log('  (Estes overrides continuam sendo aplicados em runtime pelo applyMapEdits)');
} else {
    console.log('  Nenhuma rotacao/flip para salvar.');
}

console.log('\nProximo passo: rebuild com "npm run build:local" ou "npm run build"');
