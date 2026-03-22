/**
 * expand_map.js
 * Expands the default_office.json map from 56 rows to 75 rows,
 * adding a 2nd floor below the existing 1st floor.
 *
 * Run: node expand_map.js
 */

const fs = require('fs');
const path = require('path');

const MAP_PATH = path.join(__dirname, 'src', 'game', 'maps', 'default_office.json');

const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));

const W = map.width;           // 80
const OLD_H = map.height;      // 56
const NEW_H = 75;
const NEW_ROWS = NEW_H - OLD_H; // 19

console.log(`Map: ${W}x${OLD_H} -> ${W}x${NEW_H}  (adding ${NEW_ROWS} rows)`);

// ── GID constants (1-indexed as stored in JSON) ─────────────────────
const EMPTY       = 0;

// Floors
const OUTER_WALL  = 1;   // used as floor fill for walls / borders
const HALLWAY     = 2;   // beige hallway
const PURPLE_CARPET = 3;
const WORKSPACE   = 5;   // gray workspace
const WOOD_LOUNGE = 6;
const BLUE_MEETING = 7;
const CONFERENCE  = 8;   // diamond
const GREEN_OPEN  = 9;
const GRASS       = 14;  // the map uses 14 for grass (visible in data)
const BAMBOO      = 72;
const KITCHEN     = 73;
const MARBLE      = 71;
const CARPET_BLUE = 68;
const COBBLESTONE = 65;

// Walls
const WALL_TOP    = 41;
const WALL_BOTTOM = 42;
const WALL_LEFT   = 43;
const WALL_RIGHT  = 44;
const CORNER_TL   = 45;
const CORNER_TR   = 46;
const CORNER_BL   = 47;
const CORNER_BR   = 48;
const DOOR_FRAME  = 52;
const DOOR        = 4;
const WALL_INNER  = 21;

// Furniture
const DESK        = 23;
const MEET_TABLE  = 24;
const PLANT       = 25;
const BOOKSHELF   = 26;
const SOFA        = 27;
const CHAIR       = 28;
const WHITEBOARD  = 29;
const COFFEE      = 30;
const TV          = 31;
const PRINTER     = 35;
const PROJ_SCREEN = 89;
const PODIUM      = 90;
const BAR_COUNTER = 109;
const BAR_STOOL   = 110;

// ── Helper: index into flat array ───────────────────────────────────
function idx(x, y) {
  return y * W + x;
}

// ── Build new row data for each layer ───────────────────────────────

function buildGroundRows() {
  const data = new Array(NEW_ROWS * W).fill(GRASS);

  for (let localY = 0; localY < NEW_ROWS; localY++) {
    const y = OLD_H + localY;   // absolute y in the new map

    for (let x = 0; x < W; x++) {
      const i = localY * W + x;

      if (y >= 56 && y <= 57) {
        // Transition corridor
        data[i] = (x >= 2 && x <= 68) ? HALLWAY : OUTER_WALL;
      }
      else if (y === 58) {
        // Stair corridor
        data[i] = (x >= 2 && x <= 68) ? HALLWAY : OUTER_WALL;
      }
      else if (y === 59) {
        // Wall line separating (ground shows wall tile)
        data[i] = OUTER_WALL;
      }
      else if (y >= 60 && y <= 65) {
        // Room row 1
        if (x >= 2 && x <= 25) {
          data[i] = BAMBOO;        // Sala Executiva
        } else if (x >= 27 && x <= 50) {
          data[i] = WORKSPACE;     // Sala de Treinamento
        } else if (x >= 52 && x <= 68) {
          data[i] = CONFERENCE;    // Auditorio
        } else {
          data[i] = OUTER_WALL;    // walls between rooms & edges
        }
      }
      else if (y === 66) {
        // Corridor between room rows
        data[i] = (x >= 2 && x <= 68) ? HALLWAY : OUTER_WALL;
      }
      else if (y >= 67 && y <= 72) {
        // Room row 2
        if (x >= 2 && x <= 25) {
          data[i] = KITCHEN;       // Lab
        } else if (x >= 27 && x <= 50) {
          data[i] = CARPET_BLUE;   // Estudio
        } else if (x >= 52 && x <= 68) {
          data[i] = PURPLE_CARPET; // Biblioteca
        } else {
          data[i] = OUTER_WALL;
        }
      }
      else if (y === 73) {
        // Bottom corridor
        data[i] = (x >= 2 && x <= 68) ? HALLWAY : OUTER_WALL;
      }
      else if (y === 74) {
        // Outdoor bottom
        data[i] = GRASS;
      }
    }
  }
  return data;
}

function buildWallsRows() {
  const data = new Array(NEW_ROWS * W).fill(EMPTY);

  for (let localY = 0; localY < NEW_ROWS; localY++) {
    const y = OLD_H + localY;

    for (let x = 0; x < W; x++) {
      const i = localY * W + x;

      // ── y=56-58: Stair zone ──────────────────────────────────
      if (y === 56) {
        // Top wall of stair corridor
        if (x >= 2 && x <= 68) data[i] = WALL_TOP;
      }
      if (y === 57) {
        // Stair entrance markers
        if (x >= 35 && x <= 44) {
          data[i] = DOOR_FRAME;
        } else if (x === 2) {
          data[i] = WALL_LEFT;
        } else if (x === 68) {
          data[i] = WALL_RIGHT;
        }
      }
      if (y === 58) {
        if (x === 2) data[i] = WALL_LEFT;
        else if (x === 68) data[i] = WALL_RIGHT;
      }

      // ── y=59: Full wall line with door gaps ──────────────────
      if (y === 59) {
        if (x >= 2 && x <= 68) {
          // Door gaps for entering the 3 rooms
          if ((x === 12 || x === 13) || (x === 38 || x === 39) || (x === 60 || x === 61)) {
            data[i] = DOOR_FRAME;
          } else {
            data[i] = WALL_TOP;
          }
        }
      }

      // ── y=60-65: Room row 1 walls ────────────────────────────
      if (y >= 60 && y <= 65) {
        // Sala Executiva (x=2-25)
        if (x === 2)  data[i] = WALL_LEFT;
        if (x === 25) data[i] = WALL_RIGHT;
        // Sala de Treinamento (x=27-50)
        if (x === 27) data[i] = WALL_LEFT;
        if (x === 50) data[i] = WALL_RIGHT;
        // Auditorio (x=52-68)
        if (x === 52) data[i] = WALL_LEFT;
        if (x === 68) data[i] = WALL_RIGHT;

        // Room divider walls (vertical)
        if (x === 26) data[i] = WALL_RIGHT;
        if (x === 51) data[i] = WALL_RIGHT;
      }

      // Bottom wall of room row 1
      if (y === 65) {
        if (x >= 2 && x <= 25)  data[i] = WALL_BOTTOM;
        if (x >= 27 && x <= 50) data[i] = WALL_BOTTOM;
        if (x >= 52 && x <= 68) data[i] = WALL_BOTTOM;
      }

      // Corners for room row 1
      if (y === 60) {
        // Top-left corners (top wall is y=59, so rooms start at y=60)
        if (x === 2)  data[i] = CORNER_TL;
        if (x === 27) data[i] = CORNER_TL;
        if (x === 52) data[i] = CORNER_TL;
        // Top-right corners
        if (x === 25) data[i] = CORNER_TR;
        if (x === 50) data[i] = CORNER_TR;
        if (x === 68) data[i] = CORNER_TR;
      }
      if (y === 65) {
        // Bottom-left corners
        if (x === 2)  data[i] = CORNER_BL;
        if (x === 27) data[i] = CORNER_BL;
        if (x === 52) data[i] = CORNER_BL;
        // Bottom-right corners
        if (x === 25) data[i] = CORNER_BR;
        if (x === 50) data[i] = CORNER_BR;
        if (x === 68) data[i] = CORNER_BR;
      }

      // ── y=66: Corridor wall line with door gaps ──────────────
      if (y === 66) {
        if (x >= 2 && x <= 68) {
          if ((x === 12 || x === 13) || (x === 38 || x === 39) || (x === 60 || x === 61)) {
            data[i] = DOOR_FRAME;
          } else {
            data[i] = WALL_TOP;
          }
        }
      }

      // ── y=67-72: Room row 2 walls ────────────────────────────
      if (y >= 67 && y <= 72) {
        // Lab (x=2-25)
        if (x === 2)  data[i] = WALL_LEFT;
        if (x === 25) data[i] = WALL_RIGHT;
        // Estudio (x=27-50)
        if (x === 27) data[i] = WALL_LEFT;
        if (x === 50) data[i] = WALL_RIGHT;
        // Biblioteca (x=52-68)
        if (x === 52) data[i] = WALL_LEFT;
        if (x === 68) data[i] = WALL_RIGHT;

        // Dividers
        if (x === 26) data[i] = WALL_RIGHT;
        if (x === 51) data[i] = WALL_RIGHT;
      }

      // Bottom wall of room row 2
      if (y === 72) {
        if (x >= 2 && x <= 25)  data[i] = WALL_BOTTOM;
        if (x >= 27 && x <= 50) data[i] = WALL_BOTTOM;
        if (x >= 52 && x <= 68) data[i] = WALL_BOTTOM;
      }

      // Corners for room row 2
      if (y === 67) {
        if (x === 2)  data[i] = CORNER_TL;
        if (x === 27) data[i] = CORNER_TL;
        if (x === 52) data[i] = CORNER_TL;
        if (x === 25) data[i] = CORNER_TR;
        if (x === 50) data[i] = CORNER_TR;
        if (x === 68) data[i] = CORNER_TR;
      }
      if (y === 72) {
        if (x === 2)  data[i] = CORNER_BL;
        if (x === 27) data[i] = CORNER_BL;
        if (x === 52) data[i] = CORNER_BL;
        if (x === 25) data[i] = CORNER_BR;
        if (x === 50) data[i] = CORNER_BR;
        if (x === 68) data[i] = CORNER_BR;
      }

      // ── y=73: Bottom corridor wall ───────────────────────────
      if (y === 73) {
        if (x >= 2 && x <= 68) data[i] = WALL_BOTTOM;
      }

      // ── Furniture inside rooms ───────────────────────────────

      // Sala Executiva (y=60-65, x=2-25)
      if (y === 62 && x === 10) data[i] = MEET_TABLE;
      if (y === 62 && x === 14) data[i] = MEET_TABLE;
      if (y === 62 && x === 18) data[i] = MEET_TABLE;
      if (y === 63 && x === 10) data[i] = CHAIR;
      if (y === 63 && x === 14) data[i] = CHAIR;
      if (y === 63 && x === 18) data[i] = CHAIR;
      if (y === 61 && x === 10) data[i] = CHAIR;
      if (y === 61 && x === 14) data[i] = CHAIR;
      if (y === 61 && x === 18) data[i] = CHAIR;
      if (y === 61 && x === 5)  data[i] = TV;
      if (y === 62 && x === 5)  data[i] = SOFA;
      if (y === 64 && x === 22) data[i] = PLANT;

      // Sala de Treinamento (y=60-65, x=27-50)
      if (y === 61 && x === 38) data[i] = PROJ_SCREEN;
      if (y === 62 && x === 32) data[i] = CHAIR;
      if (y === 62 && x === 35) data[i] = CHAIR;
      if (y === 62 && x === 38) data[i] = CHAIR;
      if (y === 62 && x === 41) data[i] = CHAIR;
      if (y === 62 && x === 44) data[i] = CHAIR;
      if (y === 63 && x === 32) data[i] = CHAIR;
      if (y === 63 && x === 35) data[i] = CHAIR;
      if (y === 63 && x === 38) data[i] = CHAIR;
      if (y === 63 && x === 41) data[i] = CHAIR;
      if (y === 63 && x === 44) data[i] = CHAIR;
      if (y === 64 && x === 32) data[i] = CHAIR;
      if (y === 64 && x === 35) data[i] = CHAIR;
      if (y === 64 && x === 38) data[i] = CHAIR;
      if (y === 64 && x === 41) data[i] = CHAIR;
      if (y === 64 && x === 44) data[i] = CHAIR;

      // Auditorio (y=60-65, x=52-68)
      if (y === 61 && x === 60) data[i] = PODIUM;
      if (y === 62 && x === 55) data[i] = CHAIR;
      if (y === 62 && x === 58) data[i] = CHAIR;
      if (y === 62 && x === 61) data[i] = CHAIR;
      if (y === 62 && x === 64) data[i] = CHAIR;
      if (y === 63 && x === 55) data[i] = CHAIR;
      if (y === 63 && x === 58) data[i] = CHAIR;
      if (y === 63 && x === 61) data[i] = CHAIR;
      if (y === 63 && x === 64) data[i] = CHAIR;
      if (y === 64 && x === 55) data[i] = CHAIR;
      if (y === 64 && x === 58) data[i] = CHAIR;
      if (y === 64 && x === 61) data[i] = CHAIR;
      if (y === 64 && x === 64) data[i] = CHAIR;

      // Lab (y=67-72, x=2-25)
      if (y === 68 && x === 5)  data[i] = PRINTER;
      if (y === 69 && x === 10) data[i] = DESK;
      if (y === 69 && x === 15) data[i] = DESK;
      if (y === 69 && x === 20) data[i] = DESK;
      if (y === 70 && x === 10) data[i] = CHAIR;
      if (y === 70 && x === 15) data[i] = CHAIR;
      if (y === 70 && x === 20) data[i] = CHAIR;
      if (y === 68 && x === 22) data[i] = COFFEE;
      if (y === 71 && x === 5)  data[i] = PLANT;

      // Estudio (y=67-72, x=27-50)
      if (y === 68 && x === 35) data[i] = WHITEBOARD;
      if (y === 68 && x === 42) data[i] = WHITEBOARD;
      if (y === 70 && x === 33) data[i] = DESK;
      if (y === 70 && x === 38) data[i] = DESK;
      if (y === 70 && x === 43) data[i] = DESK;
      if (y === 71 && x === 33) data[i] = CHAIR;
      if (y === 71 && x === 38) data[i] = CHAIR;
      if (y === 71 && x === 43) data[i] = CHAIR;
      if (y === 68 && x === 48) data[i] = PLANT;

      // Biblioteca (y=67-72, x=52-68)
      if (y === 68 && x === 55) data[i] = BOOKSHELF;
      if (y === 68 && x === 58) data[i] = BOOKSHELF;
      if (y === 68 && x === 61) data[i] = BOOKSHELF;
      if (y === 68 && x === 64) data[i] = BOOKSHELF;
      if (y === 70 && x === 55) data[i] = CHAIR;
      if (y === 70 && x === 58) data[i] = CHAIR;
      if (y === 70 && x === 61) data[i] = DESK;
      if (y === 70 && x === 64) data[i] = DESK;
      if (y === 71 && x === 61) data[i] = CHAIR;
      if (y === 71 && x === 64) data[i] = CHAIR;
      if (y === 71 && x === 66) data[i] = PLANT;
    }
  }
  return data;
}

function buildFurnitureFrontRows() {
  // All empty for now
  return new Array(NEW_ROWS * W).fill(EMPTY);
}

// ── Apply expansion ─────────────────────────────────────────────────

const groundNew = buildGroundRows();
const wallsNew  = buildWallsRows();
const furnNew   = buildFurnitureFrontRows();

// Find layers by name
const groundLayer = map.layers.find(l => l.name === 'ground');
const wallsLayer  = map.layers.find(l => l.name === 'walls');
const furnLayer   = map.layers.find(l => l.name === 'furniture_front');

if (!groundLayer || !wallsLayer || !furnLayer) {
  console.error('Could not find expected layers. Available:', map.layers.map(l => l.name));
  process.exit(1);
}

// Verify existing data sizes
[groundLayer, wallsLayer, furnLayer].forEach(layer => {
  const expected = W * OLD_H;
  if (layer.data.length !== expected) {
    console.error(`Layer "${layer.name}" has ${layer.data.length} tiles, expected ${expected}`);
    process.exit(1);
  }
});

// Append new rows to each layer
groundLayer.data = groundLayer.data.concat(Array.from(groundNew));
wallsLayer.data  = wallsLayer.data.concat(Array.from(wallsNew));
furnLayer.data   = furnLayer.data.concat(Array.from(furnNew));

// Update heights
map.height = NEW_H;
groundLayer.height = NEW_H;
wallsLayer.height  = NEW_H;
furnLayer.height   = NEW_H;

// Verify final sizes
[groundLayer, wallsLayer, furnLayer].forEach(layer => {
  const expected = W * NEW_H;
  if (layer.data.length !== expected) {
    console.error(`FINAL CHECK FAIL: Layer "${layer.name}" has ${layer.data.length} tiles, expected ${expected}`);
    process.exit(1);
  }
});

// ── Write output ────────────────────────────────────────────────────

fs.writeFileSync(MAP_PATH, JSON.stringify(map));
console.log(`Success! Map expanded to ${W}x${NEW_H}.`);
console.log(`  Ground layer: ${groundLayer.data.length} tiles`);
console.log(`  Walls layer:  ${wallsLayer.data.length} tiles`);
console.log(`  Furniture layer: ${furnLayer.data.length} tiles`);
console.log(`Written to: ${MAP_PATH}`);
