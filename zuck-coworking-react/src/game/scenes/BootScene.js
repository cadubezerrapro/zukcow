import Phaser from 'phaser';

/**
 * BootScene - Generates all pixel art assets programmatically
 * v1.5 - Rich textures, detailed furniture, improved avatars
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Carregando escritorio...',
            { fontSize: '18px', fill: '#3498db', fontFamily: 'Inter, sans-serif' }
        ).setOrigin(0.5);
    }

    create() {
        this.generateTileset();
        this.generateCharacterSprites();
        this.scene.start('OfficeScene');
    }

    // ==========================================
    // TILESET GENERATION - Rich textured tiles
    // ==========================================
    generateTileset() {
        const T = 32;           // logical tile size (draw methods use this)
        const SCALE = 2;
        const RT = T * SCALE;   // 64 — real tile size in texture
        const cols = 12;
        const rows = 16;
        const EXTRUDE = 1;
        const cellSize = RT + EXTRUDE * 2;  // 66
        const canvasW = cols * cellSize;     // 792
        const canvasH = rows * cellSize;     // 792
        const canvas = this.textures.createCanvas('office_tiles', canvasW, canvasH);
        const ctx = canvas.context;

        // Draw each tile at 2x resolution via ctx.scale
        for (let id = 0; id < cols * rows; id++) {
            const col = id % cols;
            const row = Math.floor(id / cols);
            const x = col * cellSize + EXTRUDE;
            const y = row * cellSize + EXTRUDE;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(SCALE, SCALE);
            this.drawTile(ctx, 0, 0, T, id);
            ctx.restore();
        }

        // Apply extrusion at real resolution
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = col * cellSize + EXTRUDE;
                const sy = row * cellSize + EXTRUDE;
                ctx.drawImage(canvas.canvas, sx, sy, RT, 1, sx, sy - 1, RT, 1);
                ctx.drawImage(canvas.canvas, sx, sy + RT - 1, RT, 1, sx, sy + RT, RT, 1);
                ctx.drawImage(canvas.canvas, sx, sy, 1, RT, sx - 1, sy, 1, RT);
                ctx.drawImage(canvas.canvas, sx + RT - 1, sy, 1, RT, sx + RT, sy, 1, RT);
                ctx.drawImage(canvas.canvas, sx, sy, 1, 1, sx - 1, sy - 1, 1, 1);
                ctx.drawImage(canvas.canvas, sx + RT - 1, sy, 1, 1, sx + RT, sy - 1, 1, 1);
                ctx.drawImage(canvas.canvas, sx, sy + RT - 1, 1, 1, sx - 1, sy + RT, 1, 1);
                ctx.drawImage(canvas.canvas, sx + RT - 1, sy + RT - 1, 1, 1, sx + RT, sy + RT, 1, 1);
            }
        }

        canvas.refresh();
    }

    drawTile(ctx, x, y, T, id) {
        ctx.clearRect(x, y, T, T);

        switch (id) {
            // Row 0: Floors (0-9)
            case 0: this.drawWallOuter(ctx, x, y, T); break;        // outer wall (border)
            case 1: this.drawFloorHallway(ctx, x, y, T); break;     // bege hallway
            case 2: this.drawFloorOffice(ctx, x, y, T); break;      // purple carpet
            case 3: this.drawDoor(ctx, x, y, T); break;             // door
            case 4: this.drawFloorWorkspace(ctx, x, y, T); break;   // gray workspace
            case 5: this.drawFloorLounge(ctx, x, y, T); break;      // wood lounge
            case 6: this.drawFloorMeeting(ctx, x, y, T); break;     // blue tile meeting
            case 7: this.drawFloorConference(ctx, x, y, T); break;  // diamond conference
            case 8: this.drawFloorOpen(ctx, x, y, T); break;        // green open area
            case 9: this.drawFloorOutdoor(ctx, x, y, T); break;     // grass base

            // Row 1: More floors + outdoor (10-19)
            case 10: this.drawFloorCafeteria(ctx, x, y, T); break;  // cafeteria pink
            case 11: this.drawFloorBreakRoom(ctx, x, y, T); break;  // break room
            case 12: this.drawGrassBase(ctx, x, y, T); break;       // outdoor grass light
            case 13: this.drawGrassDense(ctx, x, y, T); break;      // outdoor grass dark edge
            case 14: this.drawStonePath(ctx, x, y, T); break;       // stone path
            case 15: this.drawTreePine(ctx, x, y, T); break;        // pine tree
            case 16: this.drawTreeRound(ctx, x, y, T); break;       // round tree
            case 17: this.drawBush(ctx, x, y, T); break;            // bush/hedge
            case 18: this.drawFlowerBed(ctx, x, y, T); break;       // flower bed
            case 19: this.drawWallOuterDark(ctx, x, y, T); break;   // dark outer wall

            // Row 2: Walls + Furniture (20-29)
            case 20: this.drawWallInner(ctx, x, y, T); break;       // inner wall
            case 21: this.drawPartition(ctx, x, y, T); break;       // glass partition
            case 22: this.drawDesk(ctx, x, y, T); break;            // desk w/ monitors
            case 23: this.drawMeetingTable(ctx, x, y, T); break;    // meeting table
            case 24: this.drawPlant(ctx, x, y, T); break;           // potted plant
            case 25: this.drawBookshelf(ctx, x, y, T); break;       // bookshelf
            case 26: this.drawSofa(ctx, x, y, T); break;            // sofa
            case 27: this.drawOfficeChair(ctx, x, y, T); break;     // office chair
            case 28: this.drawWhiteboard(ctx, x, y, T); break;      // whiteboard
            case 29: this.drawCoffeeStation(ctx, x, y, T); break;   // coffee machine

            // Row 3: New furniture & decor (30-39)
            case 30: this.drawTV(ctx, x, y, T); break;               // smart TV
            case 31: this.drawWaterCooler(ctx, x, y, T); break;      // water dispenser
            case 32: this.drawStandingDesk(ctx, x, y, T); break;     // standing desk
            case 33: this.drawCeilingLight(ctx, x, y, T); break;     // pendant light
            case 34: this.drawPrinter(ctx, x, y, T); break;          // multifunction printer
            case 35: this.drawBeanBag(ctx, x, y, T); break;          // bean bag / puff
            case 36: this.drawMiniFridge(ctx, x, y, T); break;       // mini fridge
            case 37: this.drawCoatRack(ctx, x, y, T); break;         // coat rack
            case 38: this.drawRug(ctx, x, y, T); break;              // decorative rug
            case 39: this.drawWallArt(ctx, x, y, T); break;          // wall art / poster

            // Row 4-5: Walls with corners (40-51)
            case 40: this.drawWallTop(ctx, x, y, T); break;
            case 41: this.drawWallBottom(ctx, x, y, T); break;
            case 42: this.drawWallLeft(ctx, x, y, T); break;
            case 43: this.drawWallRight(ctx, x, y, T); break;
            case 44: this.drawWallCornerTL(ctx, x, y, T); break;
            case 45: this.drawWallCornerTR(ctx, x, y, T); break;
            case 46: this.drawWallCornerBL(ctx, x, y, T); break;
            case 47: this.drawWallCornerBR(ctx, x, y, T); break;
            case 48: this.drawWallTJunctionDown(ctx, x, y, T); break;
            case 49: this.drawWallTJunctionUp(ctx, x, y, T); break;
            case 50: this.drawWallTJunctionLeft(ctx, x, y, T); break;
            case 51: this.drawWallDoorFrame(ctx, x, y, T); break;

            // Water/Lake tiles (52-63)
            case 52: this.drawWaterDeep(ctx, x, y, T); break;
            case 53: this.drawWaterShallow(ctx, x, y, T); break;
            case 54: this.drawWaterEdgeTop(ctx, x, y, T); break;
            case 55: this.drawWaterEdgeBottom(ctx, x, y, T); break;
            case 56: this.drawWaterEdgeLeft(ctx, x, y, T); break;
            case 57: this.drawWaterEdgeRight(ctx, x, y, T); break;
            case 58: this.drawWaterCornerTL(ctx, x, y, T); break;
            case 59: this.drawWaterCornerTR(ctx, x, y, T); break;
            case 60: this.drawWaterCornerBL(ctx, x, y, T); break;
            case 61: this.drawWaterCornerBR(ctx, x, y, T); break;
            case 62: this.drawLilyPad(ctx, x, y, T); break;
            case 63: this.drawBridge(ctx, x, y, T); break;

            // Extra floors (64-75)
            case 64: this.drawCobblestone(ctx, x, y, T); break;
            case 65: this.drawSand(ctx, x, y, T); break;
            case 66: this.drawCarpetRed(ctx, x, y, T); break;
            case 67: this.drawCarpetBlue(ctx, x, y, T); break;
            case 68: this.drawCarpetGreen(ctx, x, y, T); break;
            case 69: this.drawCarpetPattern(ctx, x, y, T); break;
            case 70: this.drawMarbleFloor(ctx, x, y, T); break;
            case 71: this.drawBambooFloor(ctx, x, y, T); break;
            case 72: this.drawKitchenTile(ctx, x, y, T); break;
            case 73: this.drawGrassToPath(ctx, x, y, T); break;
            case 74: this.drawGardenSoil(ctx, x, y, T); break;
            case 75: this.drawFlowerGarden(ctx, x, y, T); break;

            // Decorations (76-87)
            case 76: this.drawAquarium(ctx, x, y, T); break;
            case 77: this.drawPaintingLandscape(ctx, x, y, T); break;
            case 78: this.drawPaintingAbstract(ctx, x, y, T); break;
            case 79: this.drawVendingMachine(ctx, x, y, T); break;
            case 80: this.drawArcadeMachine(ctx, x, y, T); break;
            case 81: this.drawPoolTable(ctx, x, y, T); break;
            case 82: this.drawPingPongTable(ctx, x, y, T); break;
            case 83: this.drawKitchenCounter(ctx, x, y, T); break;
            case 84: this.drawMicrowave(ctx, x, y, T); break;
            case 85: this.drawReceptionDesk(ctx, x, y, T); break;
            case 86: this.drawBathroomSink(ctx, x, y, T); break;
            case 87: this.drawServerRack(ctx, x, y, T); break;

            // More furniture (88-99)
            case 88: this.drawProjectorScreen(ctx, x, y, T); break;
            case 89: this.drawPodium(ctx, x, y, T); break;
            case 90: this.drawYogaMat(ctx, x, y, T); break;
            case 91: this.drawTreadmill(ctx, x, y, T); break;
            case 92: this.drawLocker(ctx, x, y, T); break;
            case 93: this.drawBenchOutdoor(ctx, x, y, T); break;
            case 94: this.drawLamppost(ctx, x, y, T); break;
            case 95: this.drawTrashCan(ctx, x, y, T); break;
            case 96: this.drawFireExtinguisher(ctx, x, y, T); break;
            case 97: this.drawWallClock(ctx, x, y, T); break;
            case 98: this.drawACUnit(ctx, x, y, T); break;
            case 99: this.drawMonitorFront(ctx, x, y, T); break;

            // Large tables + variants (100-111)
            case 100: this.drawConferenceTableTL(ctx, x, y, T); break;
            case 101: this.drawConferenceTableTR(ctx, x, y, T); break;
            case 102: this.drawConferenceTableBL(ctx, x, y, T); break;
            case 103: this.drawConferenceTableBR(ctx, x, y, T); break;
            case 104: this.drawDeskLLeft(ctx, x, y, T); break;
            case 105: this.drawDeskLRight(ctx, x, y, T); break;
            case 106: this.drawDeskDualMonitor(ctx, x, y, T); break;
            case 107: this.drawRoundTable(ctx, x, y, T); break;
            case 108: this.drawBarCounter(ctx, x, y, T); break;
            case 109: this.drawBarStool(ctx, x, y, T); break;
            case 110: this.drawFountainBase(ctx, x, y, T); break;
            case 111: this.drawFountainTop(ctx, x, y, T); break;

            // Animation frames (112-119)
            case 112: this.drawWaterFrame0(ctx, x, y, T); break;
            case 113: this.drawWaterFrame1(ctx, x, y, T); break;
            case 114: this.drawWaterFrame2(ctx, x, y, T); break;
            case 115: this.drawWaterFrame3(ctx, x, y, T); break;
            case 116: this.drawAquariumFrame1(ctx, x, y, T); break;
            case 117: this.drawAquariumFrame2(ctx, x, y, T); break;
            case 118: this.drawEmpty(ctx, x, y, T); break;
            case 119: this.drawEmpty(ctx, x, y, T); break;

            // Multi-tile objects (IDs 120-141)
            case 120: this.drawDesk2x2_TL(ctx, x, y, T); break;
            case 121: this.drawDesk2x2_TR(ctx, x, y, T); break;
            case 122: this.drawDesk2x2_BL(ctx, x, y, T); break;
            case 123: this.drawDesk2x2_BR(ctx, x, y, T); break;
            case 124: this.drawSofa2x1_L(ctx, x, y, T); break;
            case 125: this.drawSofa2x1_R(ctx, x, y, T); break;
            case 126: this.drawAquarium2x1_L(ctx, x, y, T); break;
            case 127: this.drawAquarium2x1_R(ctx, x, y, T); break;
            case 128: this.drawPoolTable_TL(ctx, x, y, T); break;
            case 129: this.drawPoolTable_TR(ctx, x, y, T); break;
            case 130: this.drawPoolTable_BL(ctx, x, y, T); break;
            case 131: this.drawPoolTable_BR(ctx, x, y, T); break;
            case 132: this.drawPingPong_TL(ctx, x, y, T); break;
            case 133: this.drawPingPong_TR(ctx, x, y, T); break;
            case 134: this.drawPingPong_BL(ctx, x, y, T); break;
            case 135: this.drawPingPong_BR(ctx, x, y, T); break;
            case 136: this.drawBookshelf2_Top(ctx, x, y, T); break;
            case 137: this.drawBookshelf2_Bot(ctx, x, y, T); break;
            case 138: this.drawVending2_Top(ctx, x, y, T); break;
            case 139: this.drawVending2_Bot(ctx, x, y, T); break;
            case 140: this.drawArcade2_Top(ctx, x, y, T); break;
            case 141: this.drawArcade2_Bot(ctx, x, y, T); break;

            // ===== NEW FURNITURE (142-179) =====
            // Tech & Office
            case 142: this.drawLaptop(ctx, x, y, T); break;
            case 143: this.drawGamingChair(ctx, x, y, T); break;
            case 144: this.drawDeskLamp(ctx, x, y, T); break;
            case 145: this.drawFilingCabinet(ctx, x, y, T); break;
            case 146: this.drawWhiteboardSmall(ctx, x, y, T); break;
            case 147: this.drawHeadphonesStand(ctx, x, y, T); break;
            case 148: this.drawDockStation(ctx, x, y, T); break;
            // Plants
            case 149: this.drawCactus(ctx, x, y, T); break;
            case 150: this.drawPalmTree(ctx, x, y, T); break;
            case 151: this.drawBonsai(ctx, x, y, T); break;
            case 152: this.drawHangingPlant(ctx, x, y, T); break;
            // Entertainment
            case 153: this.drawDartboard(ctx, x, y, T); break;
            case 154: this.drawSpeaker(ctx, x, y, T); break;
            case 155: this.drawNeonSign(ctx, x, y, T); break;
            case 156: this.drawDJTable(ctx, x, y, T); break;
            case 157: this.drawKaraoke(ctx, x, y, T); break;
            // Fitness
            case 158: this.drawPunchingBag(ctx, x, y, T); break;
            case 159: this.drawDumbbellRack(ctx, x, y, T); break;
            case 160: this.drawYogaBall(ctx, x, y, T); break;
            case 161: this.drawBasketballHoop(ctx, x, y, T); break;
            // Outdoor
            case 162: this.drawBBQGrill(ctx, x, y, T); break;
            case 163: this.drawFirePit(ctx, x, y, T); break;
            case 164: this.drawHammock(ctx, x, y, T); break;
            case 165: this.drawParasol(ctx, x, y, T); break;
            // Decor
            case 166: this.drawPetBed(ctx, x, y, T); break;
            case 167: this.drawVaseFlowers(ctx, x, y, T); break;
            case 168: this.drawCandle(ctx, x, y, T); break;
            case 169: this.drawMirror(ctx, x, y, T); break;
            case 170: this.drawChandelier(ctx, x, y, T); break;
            case 171: this.drawFan(ctx, x, y, T); break;
            // More furniture
            case 172: this.drawTVStand(ctx, x, y, T); break;
            case 173: this.drawSafe(ctx, x, y, T); break;
            case 174: this.drawShoeRack(ctx, x, y, T); break;
            case 175: this.drawUmbrellaStand(ctx, x, y, T); break;
            case 176: this.drawPhotoFrame(ctx, x, y, T); break;
            case 177: this.drawGlobeDesk(ctx, x, y, T); break;
            case 178: this.drawTrophy(ctx, x, y, T); break;
            case 179: this.drawCorkboard(ctx, x, y, T); break;

            default:
                ctx.fillStyle = '#1a1c2e';
                ctx.fillRect(x, y, T, T);
                break;
        }
    }

    // =============================================
    // FLOOR TILES - Gather-inspired rich textures
    // =============================================

    drawFloorHallway(ctx, x, y, T) {
        // Warm beige tile floor with dithering and grid detail
        const cA = '#e8dcc8', cB = '#d4c4a8';
        // Dithered base - alternate 2x2 pixel blocks
        for (let py = 0; py < T; py++) {
            for (let px = 0; px < T; px++) {
                const block = (Math.floor(px / 2) + Math.floor(py / 2)) % 2;
                ctx.fillStyle = block === 0 ? cA : cB;
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
        // Tile grid lines every 8px
        ctx.fillStyle = 'rgba(160,140,110,0.35)';
        for (let g = 0; g < T; g += 8) {
            ctx.fillRect(x, y + g, T, 1);   // horizontal
            ctx.fillRect(x + g, y, 1, T);   // vertical
        }
        // Tiny shadow dots at grid intersections
        ctx.fillStyle = 'rgba(80,60,30,0.25)';
        for (let gy = 0; gy < T; gy += 8) {
            for (let gx = 0; gx < T; gx += 8) {
                ctx.fillRect(x + gx, y + gy, 1, 1);
                ctx.fillRect(x + gx + 1, y + gy, 1, 1);
                ctx.fillRect(x + gx, y + gy + 1, 1, 1);
            }
        }
        // Highlight on top-left of each tile cell
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        for (let gy = 0; gy < T; gy += 8) {
            for (let gx = 0; gx < T; gx += 8) {
                ctx.fillRect(x + gx + 1, y + gy + 1, 6, 1);
                ctx.fillRect(x + gx + 1, y + gy + 1, 1, 6);
            }
        }
        // Bottom-right shadow on each tile cell
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let gy = 0; gy < T; gy += 8) {
            for (let gx = 0; gx < T; gx += 8) {
                ctx.fillRect(x + gx + 1, y + gy + 7, 7, 1);
                ctx.fillRect(x + gx + 7, y + gy + 1, 1, 7);
            }
        }
    }

    drawFloorOffice(ctx, x, y, T) {
        // Purple carpet with dithering and diagonal fiber texture
        const cA = '#4a3d6b', cB = '#3d3258';
        // Dithered base
        for (let py = 0; py < T; py++) {
            for (let px = 0; px < T; px++) {
                const block = (Math.floor(px / 2) + Math.floor(py / 2)) % 2;
                ctx.fillStyle = block === 0 ? cA : cB;
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
        // Diagonal fiber texture - thin lines every 4px (top-left to bottom-right)
        ctx.fillStyle = 'rgba(80,60,120,0.35)';
        for (let d = -T; d < T * 2; d += 4) {
            for (let i = 0; i < T; i++) {
                const px = i;
                const py = d + i;
                if (py >= 0 && py < T) {
                    ctx.fillRect(x + px, y + py, 1, 1);
                }
            }
        }
        // Counter-diagonal fibers (subtler)
        ctx.fillStyle = 'rgba(100,80,150,0.2)';
        for (let d = -T; d < T * 2; d += 6) {
            for (let i = 0; i < T; i++) {
                const px = i;
                const py = d - i + T;
                if (py >= 0 && py < T) {
                    ctx.fillRect(x + px, y + py, 1, 1);
                }
            }
        }
        // Subtle highlight noise
        ctx.fillStyle = 'rgba(180,160,220,0.08)';
        for (let i = 0; i < 20; i++) {
            const px2 = (i * 7 + 3) % (T - 1);
            const py2 = (i * 11 + 5) % (T - 1);
            ctx.fillRect(x + px2, y + py2, 2, 1);
        }
        // Slight vignette shadow at edges
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x, y, 1, T);
        ctx.fillRect(x, y + T - 1, T, 1);
        ctx.fillRect(x + T - 1, y, 1, T);
    }

    drawFloorWorkspace(ctx, x, y, T) {
        // Gray-blue carpet with dithering and fiber texture
        const cA = '#6b7b8f', cB = '#5a6a7e';
        // Dithered base
        for (let py = 0; py < T; py++) {
            for (let px = 0; px < T; px++) {
                const block = (Math.floor(px / 2) + Math.floor(py / 2)) % 2;
                ctx.fillStyle = block === 0 ? cA : cB;
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
        // Diagonal fiber texture every 4px
        ctx.fillStyle = 'rgba(90,105,126,0.4)';
        for (let d = -T; d < T * 2; d += 4) {
            for (let i = 0; i < T; i++) {
                const py = d + i;
                if (py >= 0 && py < T) {
                    ctx.fillRect(x + i, y + py, 1, 1);
                }
            }
        }
        // Counter-diagonal fibers
        ctx.fillStyle = 'rgba(80,95,115,0.25)';
        for (let d = -T; d < T * 2; d += 6) {
            for (let i = 0; i < T; i++) {
                const py = d - i + T;
                if (py >= 0 && py < T) {
                    ctx.fillRect(x + i, y + py, 1, 1);
                }
            }
        }
        // Subtle highlight speckles
        ctx.fillStyle = 'rgba(180,200,220,0.1)';
        for (let i = 0; i < 16; i++) {
            const px2 = (i * 7 + 2) % (T - 1);
            const py2 = (i * 13 + 5) % (T - 1);
            ctx.fillRect(x + px2, y + py2, 1, 1);
        }
        // Edge shadow
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x, y + T - 1, T, 1);
        ctx.fillRect(x + T - 1, y, 1, T);
    }

    drawFloorLounge(ctx, x, y, T) {
        // Wood floor with individual planks, grain lines, and gaps
        const plankColors = ['#c4956a', '#b8860b', '#d4a76a', '#c49060'];
        // Draw 4 planks, each 8px wide (horizontal planks)
        for (let p = 0; p < 4; p++) {
            const py = p * 8;
            const baseColor = plankColors[p % plankColors.length];
            // Fill plank base
            ctx.fillStyle = baseColor;
            ctx.fillRect(x, y + py, T, 7);
            // Plank gap (dark line at bottom of plank)
            ctx.fillStyle = '#5a3d20';
            ctx.fillRect(x, y + py + 7, T, 1);
            // Grain lines (1px darker horizontal lines within plank)
            ctx.fillStyle = 'rgba(100,65,30,0.2)';
            ctx.fillRect(x + 2, y + py + 2, 14, 1);
            ctx.fillRect(x + 18, y + py + 2, 12, 1);
            ctx.fillRect(x + 1, y + py + 4, 10, 1);
            ctx.fillRect(x + 14, y + py + 5, 16, 1);
            // Additional grain detail
            ctx.fillStyle = 'rgba(80,50,20,0.15)';
            ctx.fillRect(x + 5, y + py + 1, 8, 1);
            ctx.fillRect(x + 20, y + py + 3, 9, 1);
            ctx.fillRect(x + 8, y + py + 6, 12, 1);
            // Wood knot on alternating planks
            if (p === 1) {
                ctx.fillStyle = 'rgba(90,55,25,0.3)';
                ctx.fillRect(x + 22, y + py + 2, 3, 3);
                ctx.fillStyle = 'rgba(70,40,15,0.4)';
                ctx.fillRect(x + 23, y + py + 3, 1, 1);
            }
            if (p === 3) {
                ctx.fillStyle = 'rgba(90,55,25,0.3)';
                ctx.fillRect(x + 8, y + py + 2, 3, 3);
                ctx.fillStyle = 'rgba(70,40,15,0.4)';
                ctx.fillRect(x + 9, y + py + 3, 1, 1);
            }
            // Highlight at top of each plank (light from top)
            ctx.fillStyle = 'rgba(255,230,180,0.12)';
            ctx.fillRect(x, y + py, T, 1);
            // Shadow at bottom of each plank
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(x, y + py + 6, T, 1);
        }
        // Vertical plank offsets (staggered joint lines)
        ctx.fillStyle = '#5a3d20';
        ctx.fillRect(x + 16, y, 1, 8);
        ctx.fillRect(x + 24, y + 8, 1, 8);
        ctx.fillRect(x + 10, y + 16, 1, 8);
        ctx.fillRect(x + 20, y + 24, 1, 8);
    }

    drawFloorMeeting(ctx, x, y, T) {
        // Blue checkered tile with 8x8 tiles, white grout lines
        const cA = '#5b8fa8', cB = '#4a7e97';
        // Draw checkered 8x8 tiles
        for (let ty = 0; ty < T; ty += 8) {
            for (let tx = 0; tx < T; tx += 8) {
                const checker = ((tx / 8) + (ty / 8)) % 2;
                const baseC = checker === 0 ? cA : cB;
                ctx.fillStyle = baseC;
                ctx.fillRect(x + tx, y + ty, 8, 8);
                // Subtle inner highlight (top-left shine)
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fillRect(x + tx + 1, y + ty + 1, 6, 1);
                ctx.fillRect(x + tx + 1, y + ty + 1, 1, 6);
                // Inner shadow (bottom-right)
                ctx.fillStyle = 'rgba(0,0,0,0.06)';
                ctx.fillRect(x + tx + 1, y + ty + 7, 7, 1);
                ctx.fillRect(x + tx + 7, y + ty + 1, 1, 7);
            }
        }
        // White grout lines between tiles (1px)
        ctx.fillStyle = 'rgba(230,240,250,0.6)';
        for (let g = 0; g < T; g += 8) {
            ctx.fillRect(x, y + g, T, 1);
            ctx.fillRect(x + g, y, 1, T);
        }
        // Grout shadow (darker line just below/right of grout)
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        for (let g = 0; g < T; g += 8) {
            if (g + 1 < T) {
                ctx.fillRect(x, y + g + 1, T, 1);
                ctx.fillRect(x + g + 1, y, 1, T);
            }
        }
        // Subtle specular highlight on some tiles
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 3, y + 3, 2, 2);
        ctx.fillRect(x + 19, y + 11, 2, 2);
    }

    drawFloorConference(ctx, x, y, T) {
        // Rich carpet with diamond pattern and gold outlines
        const cA = '#5a3d7a', cB = '#4a2d6a';
        // Dithered base
        for (let py = 0; py < T; py++) {
            for (let px = 0; px < T; px++) {
                const block = (Math.floor(px / 2) + Math.floor(py / 2)) % 2;
                ctx.fillStyle = block === 0 ? cA : cB;
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
        // Gold diamond outlines every 16px
        const gold = '#c4a35a';
        const goldDark = '#a08040';
        for (let dy = 0; dy < T; dy += 16) {
            for (let dx = 0; dx < T; dx += 16) {
                const cx2 = dx + 8, cy2 = dy + 8;
                // Draw diamond outline using individual pixels
                ctx.fillStyle = gold;
                for (let i = 0; i <= 7; i++) {
                    // Top-right edge
                    if (cx2 + i < T && cy2 - 7 + i >= 0) ctx.fillRect(x + cx2 + i, y + cy2 - 7 + i, 1, 1);
                    // Top-left edge
                    if (cx2 - i >= 0 && cy2 - 7 + i >= 0) ctx.fillRect(x + cx2 - i, y + cy2 - 7 + i, 1, 1);
                    // Bottom-right edge
                    if (cx2 + i < T && cy2 + 7 - i < T) ctx.fillRect(x + cx2 + i, y + cy2 + 7 - i, 1, 1);
                    // Bottom-left edge
                    if (cx2 - i >= 0 && cy2 + 7 - i < T) ctx.fillRect(x + cx2 - i, y + cy2 + 7 - i, 1, 1);
                }
                // Inner shadow of diamond
                ctx.fillStyle = goldDark;
                for (let i = 0; i <= 6; i++) {
                    if (cx2 + i + 1 < T && cy2 - 6 + i + 1 >= 0 && cy2 - 6 + i + 1 < T)
                        ctx.fillRect(x + cx2 + i + 1, y + cy2 - 6 + i + 1, 1, 1);
                }
            }
        }
        // Smaller decorative diamonds at 16px centers
        ctx.fillStyle = 'rgba(196,163,90,0.3)';
        for (let dy = 8; dy < T; dy += 16) {
            for (let dx = 8; dx < T; dx += 16) {
                for (let i = 0; i <= 3; i++) {
                    if (dx + i < T) ctx.fillRect(x + dx + i, y + dy - 3 + i, 1, 1);
                    if (dx - i >= 0) ctx.fillRect(x + dx - i, y + dy - 3 + i, 1, 1);
                    if (dx + i < T) ctx.fillRect(x + dx + i, y + dy + 3 - i, 1, 1);
                    if (dx - i >= 0) ctx.fillRect(x + dx - i, y + dy + 3 - i, 1, 1);
                }
            }
        }
        // Subtle fiber noise
        ctx.fillStyle = 'rgba(120,80,180,0.1)';
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(x + (i * 7 + 3) % T, y + (i * 11 + 2) % T, 1, 1);
        }
    }

    drawFloorOpen(ctx, x, y, T) {
        // Light green carpet with dithering and cross-hatch texture
        const cA = '#8bc470', cB = '#7bb460';
        // Dithered base
        for (let py = 0; py < T; py++) {
            for (let px = 0; px < T; px++) {
                const block = (Math.floor(px / 2) + Math.floor(py / 2)) % 2;
                ctx.fillStyle = block === 0 ? cA : cB;
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
        // Cross-hatch texture (horizontal lines every 4px)
        ctx.fillStyle = 'rgba(100,160,80,0.2)';
        for (let py = 0; py < T; py += 4) {
            ctx.fillRect(x, y + py, T, 1);
        }
        // Cross-hatch (vertical lines every 4px)
        ctx.fillStyle = 'rgba(90,150,70,0.15)';
        for (let px = 0; px < T; px += 4) {
            ctx.fillRect(x + px, y, 1, T);
        }
        // Intersection emphasis
        ctx.fillStyle = 'rgba(70,120,50,0.12)';
        for (let py = 0; py < T; py += 4) {
            for (let px = 0; px < T; px += 4) {
                ctx.fillRect(x + px, y + py, 1, 1);
            }
        }
        // Subtle highlight speckles
        ctx.fillStyle = 'rgba(200,240,180,0.1)';
        for (let i = 0; i < 12; i++) {
            ctx.fillRect(x + (i * 7 + 1) % T, y + (i * 11 + 3) % T, 1, 1);
        }
        // Soft edge shadow
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x, y + T - 1, T, 1);
        ctx.fillRect(x + T - 1, y, 1, T);
    }

    drawFloorOutdoor(ctx, x, y, T) {
        // Rich multi-green grass with random darker tufts
        const greens = ['#7ec850', '#6bb840', '#5aa830', '#8dd860'];
        // Fill with base green
        ctx.fillStyle = greens[0];
        ctx.fillRect(x, y, T, T);
        // Random 2x2 patches of different greens (seeded by position)
        for (let py = 0; py < T; py += 2) {
            for (let px = 0; px < T; px += 2) {
                const seed = (px * 7 + py * 13 + 37) % 17;
                if (seed < 4) {
                    ctx.fillStyle = greens[seed];
                } else if (seed < 7) {
                    ctx.fillStyle = greens[1];
                } else if (seed < 10) {
                    ctx.fillStyle = greens[2];
                } else {
                    ctx.fillStyle = greens[3];
                }
                ctx.fillRect(x + px, y + py, 2, 2);
            }
        }
        // Darker grass tufts (small blade shapes)
        ctx.fillStyle = '#4a9828';
        for (let i = 0; i < 10; i++) {
            const tx = (i * 7 + 3) % (T - 2);
            const ty = (i * 11 + 5) % (T - 3);
            ctx.fillRect(x + tx, y + ty, 1, 3);
            ctx.fillRect(x + tx + 1, y + ty + 1, 1, 2);
        }
        // Lighter highlight grass blades
        ctx.fillStyle = '#a0e870';
        for (let i = 0; i < 6; i++) {
            const tx = (i * 9 + 2) % (T - 1);
            const ty = (i * 13 + 1) % (T - 2);
            ctx.fillRect(x + tx, y + ty, 1, 2);
        }
        // Tiny shadow patches
        ctx.fillStyle = 'rgba(0,60,0,0.1)';
        ctx.fillRect(x + 5, y + 12, 3, 2);
        ctx.fillRect(x + 20, y + 6, 2, 3);
        ctx.fillRect(x + 12, y + 24, 3, 2);
    }

    drawFloorCafeteria(ctx, x, y, T) {
        // Terracotta brick pattern with grout lines
        const cA = '#c4836a', cB = '#b4735a';
        // Base fill
        ctx.fillStyle = cA;
        ctx.fillRect(x, y, T, T);
        // Brick pattern - offset rows, each brick 8x4
        for (let row = 0; row < T; row += 5) {
            const offset = (Math.floor(row / 5) % 2) * 4;
            for (let col = -4; col < T; col += 9) {
                const bx = col + offset;
                const by = row;
                // Alternate brick colors
                const brickC = ((Math.floor(row / 5) + Math.floor((col + 4) / 9)) % 2 === 0) ? cA : cB;
                ctx.fillStyle = brickC;
                const drawX = Math.max(0, bx);
                const drawW = Math.min(bx + 8, T) - drawX;
                const drawY = Math.max(0, by);
                const drawH = Math.min(by + 4, T) - drawY;
                if (drawW > 0 && drawH > 0) {
                    ctx.fillRect(x + drawX, y + drawY, drawW, drawH);
                }
                // Brick highlight (top edge)
                ctx.fillStyle = 'rgba(255,220,190,0.15)';
                if (by >= 0 && by < T && drawW > 0) {
                    ctx.fillRect(x + drawX, y + by, drawW, 1);
                }
                // Brick shadow (bottom edge)
                ctx.fillStyle = 'rgba(80,40,20,0.12)';
                if (by + 3 >= 0 && by + 3 < T && drawW > 0) {
                    ctx.fillRect(x + drawX, y + by + 3, drawW, 1);
                }
            }
            // Grout line (horizontal)
            ctx.fillStyle = '#a09080';
            if (row + 4 < T) {
                ctx.fillRect(x, y + row + 4, T, 1);
            }
        }
        // Vertical grout lines
        ctx.fillStyle = '#a09080';
        for (let row = 0; row < T; row += 5) {
            const offset = (Math.floor(row / 5) % 2) * 4;
            for (let col = -4; col < T; col += 9) {
                const bx = col + offset;
                if (bx > 0 && bx < T) {
                    const drawY = Math.max(0, row);
                    const drawH = Math.min(row + 4, T) - drawY;
                    if (drawH > 0) ctx.fillRect(x + bx, y + drawY, 1, drawH);
                }
            }
        }
        // Subtle terracotta speckle texture
        ctx.fillStyle = 'rgba(150,80,50,0.1)';
        for (let i = 0; i < 15; i++) {
            ctx.fillRect(x + (i * 7 + 2) % T, y + (i * 11 + 3) % T, 1, 1);
        }
    }

    drawFloorBreakRoom(ctx, x, y, T) {
        // Yellow-cream checkered tile with shadow at edges
        const cA = '#e8d890', cB = '#d8c880';
        // Draw 8x8 checkered tiles
        for (let ty = 0; ty < T; ty += 8) {
            for (let tx = 0; tx < T; tx += 8) {
                const checker = ((tx / 8) + (ty / 8)) % 2;
                ctx.fillStyle = checker === 0 ? cA : cB;
                ctx.fillRect(x + tx, y + ty, 8, 8);
                // Top-left highlight
                ctx.fillStyle = 'rgba(255,255,230,0.15)';
                ctx.fillRect(x + tx + 1, y + ty + 1, 6, 1);
                ctx.fillRect(x + tx + 1, y + ty + 1, 1, 6);
                // Bottom-right shadow
                ctx.fillStyle = 'rgba(0,0,0,0.06)';
                ctx.fillRect(x + tx + 1, y + ty + 7, 7, 1);
                ctx.fillRect(x + tx + 7, y + ty + 1, 1, 7);
            }
        }
        // Grout lines
        ctx.fillStyle = 'rgba(180,170,140,0.4)';
        for (let g = 0; g < T; g += 8) {
            ctx.fillRect(x, y + g, T, 1);
            ctx.fillRect(x + g, y, 1, T);
        }
        // Grout intersection dots
        ctx.fillStyle = 'rgba(140,130,100,0.3)';
        for (let gy = 0; gy < T; gy += 8) {
            for (let gx = 0; gx < T; gx += 8) {
                ctx.fillRect(x + gx, y + gy, 1, 1);
            }
        }
        // Slight specular
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 4, y + 4, 2, 1);
        ctx.fillRect(x + 20, y + 20, 2, 1);
    }

    // =============================================
    // OUTDOOR TILES - Gather-style green areas
    // =============================================

    drawGrassBase(ctx, x, y, T) {
        // Light grass with 4+ greens randomly placed as 2x2 blocks
        const greens = ['#7ec850', '#6bb840', '#8dd860', '#5aa830'];
        // Fill base
        ctx.fillStyle = greens[0];
        ctx.fillRect(x, y, T, T);
        // Random 2x2 blocks of different greens
        for (let py = 0; py < T; py += 2) {
            for (let px = 0; px < T; px += 2) {
                const seed = (px * 13 + py * 7 + 41) % 19;
                if (seed < 5) ctx.fillStyle = greens[0];
                else if (seed < 9) ctx.fillStyle = greens[1];
                else if (seed < 13) ctx.fillStyle = greens[2];
                else if (seed < 16) ctx.fillStyle = greens[3];
                else ctx.fillStyle = '#75c048';
                ctx.fillRect(x + px, y + py, 2, 2);
            }
        }
        // Grass blade tufts (vertical thin shapes)
        ctx.fillStyle = '#4a9828';
        for (let i = 0; i < 8; i++) {
            const tx = (i * 7 + 1) % (T - 1);
            const ty = (i * 11 + 3) % (T - 3);
            ctx.fillRect(x + tx, y + ty, 1, 3);
        }
        // Light highlight blades
        ctx.fillStyle = '#a0e870';
        for (let i = 0; i < 5; i++) {
            const tx = (i * 9 + 4) % (T - 1);
            const ty = (i * 13 + 7) % (T - 2);
            ctx.fillRect(x + tx, y + ty, 1, 2);
        }
        // Tiny yellow-green highlights (sun spots)
        ctx.fillStyle = 'rgba(200,240,100,0.15)';
        ctx.fillRect(x + 8, y + 6, 1, 1);
        ctx.fillRect(x + 22, y + 14, 1, 1);
        ctx.fillRect(x + 14, y + 26, 1, 1);
        ctx.fillRect(x + 4, y + 20, 1, 1);
    }

    drawGrassDense(ctx, x, y, T) {
        // Dense dark grass with 4+ greens randomly placed
        const greens = ['#5ab038', '#4a9028', '#3d8020', '#6bc048'];
        // Fill base
        ctx.fillStyle = greens[0];
        ctx.fillRect(x, y, T, T);
        // Random 2x2 blocks
        for (let py = 0; py < T; py += 2) {
            for (let px = 0; px < T; px += 2) {
                const seed = (px * 11 + py * 17 + 29) % 23;
                if (seed < 6) ctx.fillStyle = greens[0];
                else if (seed < 11) ctx.fillStyle = greens[1];
                else if (seed < 16) ctx.fillStyle = greens[2];
                else if (seed < 20) ctx.fillStyle = greens[3];
                else ctx.fillStyle = '#458a22';
                ctx.fillRect(x + px, y + py, 2, 2);
            }
        }
        // Dense grass blade tufts
        ctx.fillStyle = '#2d6018';
        for (let i = 0; i < 12; i++) {
            const tx = (i * 5 + 2) % (T - 1);
            const ty = (i * 7 + 1) % (T - 4);
            ctx.fillRect(x + tx, y + ty, 1, 4);
            ctx.fillRect(x + tx + 1, y + ty + 1, 1, 3);
        }
        // Lighter accent blades
        ctx.fillStyle = '#78c858';
        for (let i = 0; i < 6; i++) {
            const tx = (i * 9 + 6) % (T - 1);
            const ty = (i * 11 + 4) % (T - 3);
            ctx.fillRect(x + tx, y + ty, 1, 3);
        }
        // Shadow patches for depth
        ctx.fillStyle = 'rgba(0,40,0,0.12)';
        ctx.fillRect(x + 3, y + 8, 4, 3);
        ctx.fillRect(x + 18, y + 20, 3, 4);
        ctx.fillRect(x + 10, y + 2, 3, 3);
        // Tiny highlight spots
        ctx.fillStyle = 'rgba(160,230,80,0.12)';
        ctx.fillRect(x + 7, y + 15, 1, 1);
        ctx.fillRect(x + 24, y + 8, 1, 1);
        ctx.fillRect(x + 15, y + 28, 1, 1);
    }

    drawStonePath(ctx, x, y, T) {
        // Beige stone path with visible joints
        ctx.fillStyle = '#d4c4a8';
        ctx.fillRect(x, y, T, T);
        // Stone blocks
        ctx.strokeStyle = 'rgba(160,140,110,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, 12, 12);
        ctx.strokeRect(x + 16, y + 2, 14, 12);
        ctx.strokeRect(x + 2, y + 16, 14, 14);
        ctx.strokeRect(x + 18, y + 16, 12, 14);
        // Stone highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 3, y + 3, 11, 1);
        ctx.fillRect(x + 17, y + 3, 13, 1);
        ctx.fillRect(x + 3, y + 17, 13, 1);
        ctx.fillRect(x + 19, y + 17, 11, 1);
        // Grass between stones
        ctx.fillStyle = '#90cc70';
        ctx.fillRect(x + 15, y + 4, 1, 3);
        ctx.fillRect(x + 7, y + 15, 1, 2);
    }

    drawTreePine(ctx, x, y, T) {
        // 3D Isometric pine tree — transparent background (ground shows through)
        // Large shadow on ground
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
        // Trunk: brown cylinder with bark texture
        ctx.fillStyle = '#4a2a18';
        ctx.fillRect(x + 13, y + 22, 6, 8);
        ctx.fillStyle = '#5a3520';
        ctx.fillRect(x + 14, y + 22, 4, 8);
        // Bark highlight (left, light source)
        ctx.fillStyle = '#6b4226';
        ctx.fillRect(x + 13, y + 22, 1, 8);
        // Bark lines
        ctx.fillStyle = '#3a1a0c';
        ctx.fillRect(x + 14, y + 24, 1, 2);
        ctx.fillRect(x + 16, y + 26, 1, 2);
        ctx.fillRect(x + 15, y + 23, 1, 1);
        // 4 layers of branches (triangles, each with darker bottom edge + lighter top)
        // Layer 1 (bottom, widest) - darker bottom edge
        ctx.fillStyle = '#1a5028';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 15); ctx.lineTo(x + 29, y + 26); ctx.lineTo(x + 3, y + 26);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#1d5a30';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 14); ctx.lineTo(x + 28, y + 24); ctx.lineTo(x + 4, y + 24);
        ctx.closePath(); ctx.fill();
        // Layer 2
        ctx.fillStyle = '#1a5028';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 10); ctx.lineTo(x + 26, y + 20); ctx.lineTo(x + 6, y + 20);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#266b3a';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 9); ctx.lineTo(x + 25, y + 18); ctx.lineTo(x + 7, y + 18);
        ctx.closePath(); ctx.fill();
        // Layer 3
        ctx.fillStyle = '#1d5a30';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 5); ctx.lineTo(x + 23, y + 14); ctx.lineTo(x + 9, y + 14);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2d7a42';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 4); ctx.lineTo(x + 22, y + 12); ctx.lineTo(x + 10, y + 12);
        ctx.closePath(); ctx.fill();
        // Layer 4 (top)
        ctx.fillStyle = '#266b3a';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 1); ctx.lineTo(x + 20, y + 8); ctx.lineTo(x + 12, y + 8);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#38904e';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 0); ctx.lineTo(x + 19, y + 6); ctx.lineTo(x + 13, y + 6);
        ctx.closePath(); ctx.fill();
        // Right side shadow on each layer (darker)
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(x + 20, y + 8, 4, 6);
        ctx.fillRect(x + 22, y + 14, 4, 6);
        ctx.fillRect(x + 24, y + 20, 3, 4);
        // Snow/frost highlights on tips (top-left light)
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(x + 14, y + 0, 3, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 12, y + 5, 2, 1);
        ctx.fillRect(x + 10, y + 9, 2, 1);
        ctx.fillRect(x + 8, y + 14, 2, 1);
        // Dark outline hint on right side
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 16, y + 0, 1, 1);
    }

    drawTreeRound(ctx, x, y, T) {
        // 3D Isometric round tree — transparent background
        // Large shadow (ellipse)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 12, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        // Trunk visible at bottom
        ctx.fillStyle = '#4a3018';
        ctx.fillRect(x + 13, y + 20, 6, 10);
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 14, y + 20, 4, 10);
        // Trunk highlight left
        ctx.fillStyle = '#6b4f2e';
        ctx.fillRect(x + 13, y + 20, 1, 10);
        // Bark texture
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(x + 14, y + 22, 1, 2);
        ctx.fillRect(x + 16, y + 25, 1, 2);
        // Branch stubs
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 11, y + 21, 3, 2);
        ctx.fillRect(x + 18, y + 22, 3, 2);
        // Canopy: 3D shading (dark bottom-right, light top-left)
        // Back (darkest)
        ctx.fillStyle = '#1e5a30';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 14, 0, Math.PI * 2); ctx.fill();
        // Mid layer
        ctx.fillStyle = '#2d7040';
        ctx.beginPath(); ctx.arc(x + 16, y + 14, 13, 0, Math.PI * 2); ctx.fill();
        // Depth through overlapping circles
        ctx.fillStyle = '#3a8a4e';
        ctx.beginPath(); ctx.arc(x + 12, y + 12, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#48a05c';
        ctx.beginPath(); ctx.arc(x + 20, y + 11, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#56b86a';
        ctx.beginPath(); ctx.arc(x + 15, y + 9, 7, 0, Math.PI * 2); ctx.fill();
        // Top light cluster
        ctx.fillStyle = '#62c876';
        ctx.beginPath(); ctx.arc(x + 18, y + 7, 4, 0, Math.PI * 2); ctx.fill();
        // Leaf texture (lighter dots on surface)
        ctx.fillStyle = '#50b868';
        const leafDots = [[6,14,2.5],[26,13,2.5],[9,8,2],[24,9,2],[16,3,2],[10,18,2],[22,17,2]];
        leafDots.forEach(([lx, ly, r]) => {
            ctx.beginPath(); ctx.arc(x + lx, y + ly, r, 0, Math.PI * 2); ctx.fill();
        });
        // Dark underside (bottom-right = darker for 3D)
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.arc(x + 18, y + 18, 10, 0, Math.PI); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.beginPath(); ctx.arc(x + 22, y + 14, 6, 0, Math.PI); ctx.fill();
        // Sunlight highlight (top-left)
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.arc(x + 10, y + 7, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.beginPath(); ctx.arc(x + 13, y + 4, 3.5, 0, Math.PI * 2); ctx.fill();
        // Small fruits
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(x + 8, y + 14, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(x + 22, y + 10, 1, 0, Math.PI * 2); ctx.fill();
    }

    drawBush(ctx, x, y, T) {
        // 3D Isometric bush/hedge — transparent background
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 27, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
        // Dark green at bottom/right (3D depth)
        ctx.fillStyle = '#2d7838';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 22, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3d8a48';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
        // Mid green
        ctx.fillStyle = '#4a9a58';
        ctx.beginPath(); ctx.ellipse(x + 11, y + 18, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
        // Light green at top/left (light source)
        ctx.fillStyle = '#5cb868';
        ctx.beginPath(); ctx.ellipse(x + 21, y + 17, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#68c474';
        ctx.beginPath(); ctx.ellipse(x + 14, y + 15, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#74d080';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 14, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Small leaf detail dots (lighter scattered)
        ctx.fillStyle = '#80dc8c';
        ctx.beginPath(); ctx.arc(x + 9, y + 16, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 20, y + 14, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 14, y + 13, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 24, y + 19, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 7, y + 20, 1.2, 0, Math.PI * 2); ctx.fill();
        // Dark bottom-right for 3D depth
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.beginPath(); ctx.ellipse(x + 20, y + 22, 8, 5, 0, 0, Math.PI); ctx.fill();
        // Highlight top-left
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 11, y + 14, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Small flowers
        ctx.fillStyle = '#ec4899';
        ctx.beginPath(); ctx.arc(x + 8, y + 17, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x + 22, y + 16, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath(); ctx.arc(x + 15, y + 13, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    drawFlowerBed(ctx, x, y, T) {
        // 3D Isometric raised flower bed — transparent background
        // Raised bed: wood edges showing 3D front face
        // Front face (darker wood)
        ctx.fillStyle = '#6b4a28';
        ctx.fillRect(x + 2, y + 20, 28, 8);
        // Top edge (lighter wood)
        ctx.fillStyle = '#8b6840';
        ctx.fillRect(x + 2, y + 18, 28, 2);
        // Top edge highlight
        ctx.fillStyle = '#a07848';
        ctx.fillRect(x + 2, y + 18, 28, 1);
        // Left highlight
        ctx.fillStyle = '#7a5a38';
        ctx.fillRect(x + 2, y + 20, 1, 8);
        // Soil with texture
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(x + 3, y + 12, 26, 6);
        ctx.fillStyle = '#4a3828';
        ctx.fillRect(x + 4, y + 13, 4, 1);
        ctx.fillRect(x + 12, y + 14, 3, 1);
        ctx.fillRect(x + 20, y + 13, 4, 1);
        // Colorful flowers (4-5 with stems)
        const flowers = [
            { cx: 8, cy: 8, color: '#ef4444', inner: '#fbbf24' },
            { cx: 16, cy: 6, color: '#ec4899', inner: '#fde68a' },
            { cx: 24, cy: 7, color: '#8b5cf6', inner: '#fbbf24' },
            { cx: 12, cy: 10, color: '#f59e0b', inner: '#fef3c7' },
            { cx: 20, cy: 9, color: '#3b82f6', inner: '#fde68a' },
        ];
        flowers.forEach(f => {
            // Stem
            ctx.fillStyle = '#2d7838';
            ctx.fillRect(x + f.cx - 0.5, y + f.cy + 2, 1, 6);
            // Leaf
            ctx.fillStyle = '#3d8b4a';
            ctx.fillRect(x + f.cx + 1, y + f.cy + 4, 2, 1);
            // Petals
            ctx.fillStyle = f.color;
            ctx.beginPath(); ctx.arc(x + f.cx, y + f.cy, 3, 0, Math.PI * 2); ctx.fill();
            // Center
            ctx.fillStyle = f.inner;
            ctx.beginPath(); ctx.arc(x + f.cx, y + f.cy, 1.2, 0, Math.PI * 2); ctx.fill();
        });
        // Dark outline on bed
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 18, 30, 1);
        ctx.fillRect(x + 1, y + 18, 1, 10);
        ctx.fillRect(x + 30, y + 18, 1, 10);
    }

    // --- Wall tiles ---

    drawWallOuter(ctx, x, y, T) {
        // Thick outer wall with 3D depth and brick pattern
        // Front face (main body)
        ctx.fillStyle = '#3a4556';
        ctx.fillRect(x, y, T, T);
        // Top face (lighter, 3D effect - 4px tall)
        ctx.fillStyle = '#5a6a7a';
        ctx.fillRect(x, y, T, 4);
        // Top edge highlight
        ctx.fillStyle = '#6a7a8a';
        ctx.fillRect(x, y, T, 1);
        // Brick pattern on front face (8x4 bricks with offset rows)
        for (let row = 0; row < 4; row++) {
            const by = 4 + row * 7;
            const offset = (row % 2) * 5;
            if (by >= T) break;
            for (let col = -1; col < 4; col++) {
                const bx = offset + col * 10;
                if (bx >= T) break;
                const drawX = Math.max(0, bx);
                const drawW = Math.min(bx + 9, T) - drawX;
                const drawH = Math.min(by + 6, T) - by;
                if (drawW > 0 && drawH > 0) {
                    // Brick body (slightly varied shade)
                    ctx.fillStyle = (row + col) % 2 === 0 ? '#3d4a5c' : '#374252';
                    ctx.fillRect(x + drawX, y + by, drawW, drawH);
                    // Brick highlight (top edge)
                    ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    ctx.fillRect(x + drawX, y + by, drawW, 1);
                    // Brick shadow (bottom edge)
                    ctx.fillStyle = 'rgba(0,0,0,0.08)';
                    if (by + drawH - 1 < T) ctx.fillRect(x + drawX, y + by + drawH - 1, drawW, 1);
                }
            }
            // Mortar line (horizontal)
            ctx.fillStyle = '#2d3748';
            if (by + 6 < T) ctx.fillRect(x, y + by + 6, T, 1);
        }
        // Side shadow (right edge, 2px)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + T - 2, y + 4, 2, T - 4);
        // Bottom shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y + T - 2, T, 2);
    }

    drawWallOuterDark(ctx, x, y, T) {
        // Dark outer wall with 3D depth and brick pattern
        // Front face
        ctx.fillStyle = '#2a3546';
        ctx.fillRect(x, y, T, T);
        // Top face (lighter)
        ctx.fillStyle = '#4a5a6a';
        ctx.fillRect(x, y, T, 4);
        // Top edge highlight
        ctx.fillStyle = '#5a6a7a';
        ctx.fillRect(x, y, T, 1);
        // Brick pattern on front face
        for (let row = 0; row < 4; row++) {
            const by = 4 + row * 7;
            const offset = (row % 2) * 5;
            if (by >= T) break;
            for (let col = -1; col < 4; col++) {
                const bx = offset + col * 10;
                if (bx >= T) break;
                const drawX = Math.max(0, bx);
                const drawW = Math.min(bx + 9, T) - drawX;
                const drawH = Math.min(by + 6, T) - by;
                if (drawW > 0 && drawH > 0) {
                    ctx.fillStyle = (row + col) % 2 === 0 ? '#2d3a4c' : '#273442';
                    ctx.fillRect(x + drawX, y + by, drawW, drawH);
                    ctx.fillStyle = 'rgba(255,255,255,0.04)';
                    ctx.fillRect(x + drawX, y + by, drawW, 1);
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    if (by + drawH - 1 < T) ctx.fillRect(x + drawX, y + by + drawH - 1, drawW, 1);
                }
            }
            ctx.fillStyle = '#1d2738';
            if (by + 6 < T) ctx.fillRect(x, y + by + 6, T, 1);
        }
        // Side shadow
        ctx.fillStyle = '#1d2738';
        ctx.fillRect(x + T - 2, y + 4, 2, T - 4);
        // Bottom shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x, y + T - 2, T, 2);
    }

    drawWallInner(ctx, x, y, T) {
        // Modern clean inner wall - smooth light surface with crown molding and baseboard
        // Base wall color - warm light gray
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Subtle texture variation
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + (i * 7 + 3) % T, y + 4 + (i * 9) % (T - 8), 3, 2);
        }
        // Crown molding at top - 3px
        ctx.fillStyle = '#d0c8c0';
        ctx.fillRect(x, y, T, 3);
        ctx.fillStyle = '#ddd6ce';
        ctx.fillRect(x, y, T, 1);
        // Shadow below crown
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x, y + 3, T, 1);
        // Baseboard at bottom - wood tone, 3px
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y + T - 3, T, 3);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x, y + T - 3, T, 1);
        ctx.fillStyle = '#7a6345';
        ctx.fillRect(x, y + T - 1, T, 1);
        // Shadow above baseboard
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x, y + T - 4, T, 1);
    }

    drawPartition(ctx, x, y, T) {
        // Glass partition with aluminum frame and reflections
        // Background (dark, visible through glass edges)
        ctx.fillStyle = '#3a4556';
        ctx.fillRect(x, y, T, T);
        // Aluminum frame - 3px wide on all sides
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x, y, 3, T);          // left frame
        ctx.fillRect(x + T - 3, y, 3, T);  // right frame
        ctx.fillRect(x, y, T, 3);          // top frame
        ctx.fillRect(x, y + T - 3, T, 3);  // bottom frame
        // Frame highlight (top-left edges)
        ctx.fillStyle = '#b0b8c4';
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x, y, 1, T);
        ctx.fillRect(x + 1, y + 1, T - 2, 1);
        ctx.fillRect(x + 1, y + 1, 1, T - 2);
        // Frame shadow (bottom-right inner edges)
        ctx.fillStyle = '#7a8494';
        ctx.fillRect(x + 2, y + T - 1, T - 2, 1);
        ctx.fillRect(x + T - 1, y + 2, 1, T - 2);
        // Frame joint dots at corners
        ctx.fillStyle = '#6a7484';
        ctx.fillRect(x + 1, y + 1, 2, 2);
        ctx.fillRect(x + T - 3, y + 1, 2, 2);
        ctx.fillRect(x + 1, y + T - 3, 2, 2);
        ctx.fillRect(x + T - 3, y + T - 3, 2, 2);
        // Glass area (semi-transparent light blue)
        ctx.fillStyle = '#c8dce8';
        ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
        // Glass transparency effect (slightly darker center)
        ctx.fillStyle = 'rgba(100,140,170,0.15)';
        ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
        // Diagonal reflection streak (45 degrees, 1px white line)
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 16; i++) {
            const rx = 5 + i;
            const ry = 3 + i;
            if (rx < T - 3 && ry < T - 3) {
                ctx.fillRect(x + rx, y + ry, 1, 1);
            }
        }
        // Second reflection (shorter, offset)
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 10; i++) {
            const rx = 8 + i;
            const ry = 3 + i;
            if (rx < T - 3 && ry < T - 3) {
                ctx.fillRect(x + rx, y + ry, 1, 1);
            }
        }
        // Frosted band in lower third
        ctx.fillStyle = 'rgba(220,235,250,0.25)';
        ctx.fillRect(x + 3, y + 20, T - 6, 6);
        // Glass bottom tint (slightly darker)
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x + 3, y + T / 2, T - 6, T / 2 - 3);
    }

    drawDoor(ctx, x, y, T) {
        // Modern full-width glass sliding door (each tile = one panel of a double door)
        // Floor threshold base
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(x, y + T - 3, T, 3);
        ctx.fillStyle = '#5a6a7e';
        ctx.fillRect(x, y + T - 3, T, 1);

        // Top rail (header beam)
        ctx.fillStyle = '#5a6a7e';
        ctx.fillRect(x, y, T, 4);
        ctx.fillStyle = '#6b7d92';
        ctx.fillRect(x, y, T, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x, y, T, 1);

        // Frame posts (left and right edges)
        ctx.fillStyle = '#6b7d92';
        ctx.fillRect(x, y + 3, 2, T - 6);
        ctx.fillRect(x + T - 2, y + 3, 2, T - 6);
        // Post highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x, y + 3, 1, T - 6);
        ctx.fillRect(x + T - 2, y + 3, 1, T - 6);

        // Glass panel (fills most of tile)
        ctx.fillStyle = 'rgba(120,170,220,0.35)';
        ctx.fillRect(x + 2, y + 4, T - 4, T - 7);

        // Glass gradient effect (darker at bottom)
        ctx.fillStyle = 'rgba(80,130,180,0.15)';
        ctx.fillRect(x + 2, y + T / 2, T - 4, T / 2 - 7);

        // Reflection streaks (diagonal light)
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(x + 4, y + 5, 3, T - 14);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fillRect(x + 8, y + 7, 2, T - 18);
        ctx.fillRect(x + T - 10, y + 6, 2, T - 16);
        // Subtle wide reflection
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 3, y + 5, 8, T - 13);

        // Center divider line (glass seam)
        ctx.fillStyle = 'rgba(90,110,130,0.4)';
        ctx.fillRect(x + T / 2 - 1, y + 4, 1, T - 7);

        // Handle (chrome vertical bar)
        ctx.fillStyle = '#b0bec5';
        ctx.fillRect(x + T - 7, y + 12, 2, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x + T - 7, y + 12, 1, 8);
        // Handle shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + T - 5, y + 13, 1, 7);

        // LED accent at top of glass
        ctx.fillStyle = 'rgba(100,200,255,0.3)';
        ctx.fillRect(x + 2, y + 4, T - 4, 1);
    }

    // --- Furniture tiles ---

    drawDesk(ctx, x, y, T) {
        // 3D Isometric desk with monitor, keyboard, mouse, mug
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Desk legs (metal, 3D)
        ctx.fillStyle = '#7a8290';
        ctx.fillRect(x + 3, y + 24, 2, 7);
        ctx.fillRect(x + 27, y + 24, 2, 7);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 3, y + 24, 1, 7);
        ctx.fillRect(x + 27, y + 24, 1, 7);
        // Desk front face (darker wood, 8px tall)
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 1, y + 17, 30, 8);
        // Front face wood grain
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 2, y + 19, 28, 1);
        ctx.fillRect(x + 3, y + 22, 26, 1);
        // Front face bottom shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 1, y + 24, 30, 1);
        // Desk top surface (lighter wood)
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(x + 1, y + 11, 30, 6);
        // Top surface highlight (top-left light source)
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 1, y + 11, 30, 1);
        ctx.fillRect(x + 1, y + 11, 1, 6);
        // Top surface grain detail
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x + 4, y + 13, 20, 1);
        ctx.fillRect(x + 6, y + 15, 18, 1);
        // Dark outline around desk body
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 11, 30, 1);
        ctx.fillRect(x + 0, y + 11, 1, 14);
        ctx.fillRect(x + 31, y + 11, 1, 14);
        // Monitor: 3D with bezel depth
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 5, y + 0, 22, 11);
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x + 6, y + 1, 20, 9);
        // Screen
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 7, y + 2, 18, 7);
        // Screen content
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x + 8, y + 3, 8, 1);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(x + 8, y + 4, 12, 1);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 8, y + 6, 6, 1);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(x + 15, y + 6, 5, 1);
        ctx.fillStyle = '#fb923c';
        ctx.fillRect(x + 8, y + 7, 10, 1);
        // Screen glow
        ctx.fillStyle = 'rgba(96,165,250,0.08)';
        ctx.fillRect(x + 7, y + 2, 18, 7);
        // Monitor stand (3D)
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 14, y + 9, 4, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 14, y + 9, 4, 1);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 12, y + 11, 8, 1);
        // Keyboard on desk surface
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 9, y + 13, 12, 3);
        ctx.fillStyle = '#374151';
        for (let ky = 0; ky < 2; ky++) {
            for (let kx = 0; kx < 5; kx++) {
                ctx.fillRect(x + 10 + kx * 2, y + 13.5 + ky * 1.2, 1.5, 0.8);
            }
        }
        // Mouse
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath(); ctx.ellipse(x + 25, y + 14, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x + 24.5, y + 13, 1, 1);
        // Coffee mug (3D cylinder)
        ctx.fillStyle = '#d4d4d4';
        ctx.fillRect(x + 2, y + 12, 4, 3);
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath(); ctx.ellipse(x + 4, y + 12, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8b4513';
        ctx.beginPath(); ctx.ellipse(x + 4, y + 12.5, 1.3, 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x + 2, y + 12, 1, 2);
    }

    drawMeetingTable(ctx, x, y, T) {
        // 3D meeting table with strong front face + right side shadow
        const outline = '#2A1A0A';
        const frontDark = '#4A3020';
        const surfLight = '#B08860';
        const surfHi = '#C9A876';
        const sideDark = '#2A1A0A';  // right side darkest

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x + 3, y + 27, 26, 4);

        // Legs (dark)
        ctx.fillStyle = outline;
        ctx.fillRect(x + 6, y + 22, 2, 7);
        ctx.fillRect(x + 24, y + 22, 2, 7);

        // FRONT FACE (ellipse bottom half — darker)
        ctx.fillStyle = frontDark;
        ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 13, 10, 0, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#3A2010';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 19, 13, 10, 0, 0.2, Math.PI - 0.2); ctx.fill();

        // RIGHT SIDE FACE — darken right edge of front face
        ctx.fillStyle = sideDark;
        ctx.fillRect(x + 27, y + 15, 3, 10);
        // Clip it visually with bg to match ellipse shape
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 29, y + 15, 3, 2);
        ctx.fillRect(x + 28, y + 24, 4, 4);

        // TOP SURFACE (lighter — strong contrast)
        ctx.fillStyle = surfLight;
        ctx.beginPath(); ctx.ellipse(x + 16, y + 14, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
        // Right side tint on surface (darker right half)
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.save();
        ctx.beginPath(); ctx.rect(x + 24, y + 4, 8, 20); ctx.clip();
        ctx.beginPath(); ctx.ellipse(x + 16, y + 14, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        ctx.fillStyle = surfHi;
        ctx.beginPath(); ctx.ellipse(x + 16, y + 13, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
        // Right side tint on highlight surface
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.save();
        ctx.beginPath(); ctx.rect(x + 24, y + 4, 8, 20); ctx.clip();
        ctx.beginPath(); ctx.ellipse(x + 16, y + 13, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Outline
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x + 16, y + 14, 13.5, 10.5, 0, 0, Math.PI * 2); ctx.stroke();

        // Wood grain
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 8, y + 10, 16, 1);
        ctx.fillRect(x + 6, y + 14, 20, 1);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.ellipse(x + 12, y + 10, 5, 3, -0.3, 0, Math.PI * 2); ctx.fill();

        // Papers
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 10, y + 11, 5, 4);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + 10, y + 11, 5, 1);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 16, y + 12, 4, 1);
    }

    drawPlant(ctx, x, y, T) {
        // 3D Isometric potted plant with volume
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 9, 3, 0, 0, Math.PI * 2); ctx.fill();

        // Pot front face (darker terracotta)
        ctx.fillStyle = '#9a4c2e';
        ctx.fillRect(x + 9, y + 23, 14, 7);
        // Pot top rim front
        ctx.fillStyle = '#a85838';
        ctx.fillRect(x + 8, y + 22, 16, 2);
        // Pot top surface (lighter terracotta)
        ctx.fillStyle = '#c46842';
        ctx.fillRect(x + 8, y + 20, 16, 2);
        // Pot rim highlight
        ctx.fillStyle = '#d47a52';
        ctx.fillRect(x + 8, y + 20, 16, 1);
        // Pot highlight (left side, top-left light)
        ctx.fillStyle = '#d47a52';
        ctx.fillRect(x + 9, y + 23, 2, 6);
        // Pot shadow (right side)
        ctx.fillStyle = '#7a3c1e';
        ctx.fillRect(x + 21, y + 23, 2, 6);
        // Decorative band
        ctx.fillStyle = '#d4a080';
        ctx.fillRect(x + 10, y + 25, 12, 1);
        // Pot bottom
        ctx.fillStyle = '#8a4428';
        ctx.fillRect(x + 10, y + 29, 12, 1);
        // Pot outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 8, y + 20, 16, 1);
        ctx.fillRect(x + 8, y + 20, 1, 10);
        ctx.fillRect(x + 23, y + 20, 1, 10);
        // Soil visible at top
        ctx.fillStyle = '#3d2b1f';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4a3828';
        ctx.fillRect(x + 12, y + 20, 2, 1);
        ctx.fillRect(x + 17, y + 20, 2, 1);

        // Main stem
        ctx.fillStyle = '#1a7a3a';
        ctx.fillRect(x + 15, y + 10, 2, 11);
        // Branch stems
        ctx.fillStyle = '#1a6a32';
        ctx.fillRect(x + 13, y + 12, 2, 1);
        ctx.fillRect(x + 17, y + 14, 2, 1);
        ctx.fillRect(x + 12, y + 8, 3, 1);
        ctx.fillRect(x + 17, y + 9, 3, 1);

        // Leaves: darker (behind) first, then lighter (front)
        // Back leaves (darker)
        ctx.fillStyle = '#18843a';
        ctx.beginPath(); ctx.ellipse(x + 9, y + 9, 5, 3.5, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#156e30';
        ctx.beginPath(); ctx.ellipse(x + 23, y + 8, 5, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#18843a';
        ctx.beginPath(); ctx.ellipse(x + 15, y + 3, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Mid leaves
        ctx.fillStyle = '#22a84a';
        ctx.beginPath(); ctx.ellipse(x + 6, y + 12, 4.5, 3, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#28b050';
        ctx.beginPath(); ctx.ellipse(x + 25, y + 11, 4, 3, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22a84a';
        ctx.beginPath(); ctx.ellipse(x + 11, y + 5, 4, 3, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#28b050';
        ctx.beginPath(); ctx.ellipse(x + 21, y + 4, 4, 3, -0.2, 0, Math.PI * 2); ctx.fill();
        // Front leaves (lightest)
        ctx.fillStyle = '#30c058';
        ctx.beginPath(); ctx.ellipse(x + 8, y + 16, 3.5, 2.5, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3dd868';
        ctx.beginPath(); ctx.ellipse(x + 24, y + 15, 3.5, 2.5, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#30c058';
        ctx.beginPath(); ctx.ellipse(x + 19, y + 1, 3.5, 2.5, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3dd868';
        ctx.beginPath(); ctx.ellipse(x + 12, y + 3, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();
        // Center foliage
        ctx.fillStyle = '#1a9640';
        ctx.beginPath(); ctx.ellipse(x + 14, y + 10, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22a84a';
        ctx.beginPath(); ctx.ellipse(x + 18, y + 10, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();

        // Highlights on top-left leaves
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath(); ctx.ellipse(x + 8, y + 7, 2, 1.5, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 14, y + 2, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 11, y + 4, 1.5, 1, 0.2, 0, Math.PI * 2); ctx.fill();

        // Small flowers for color
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath(); ctx.arc(x + 8, y + 7, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd93d';
        ctx.beginPath(); ctx.arc(x + 8, y + 7, 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x + 23, y + 6, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff7ed';
        ctx.beginPath(); ctx.arc(x + 23, y + 6, 0.5, 0, Math.PI * 2); ctx.fill();
    }

    drawBookshelf(ctx, x, y, T) {
        // 3D bookshelf with strong outline and side depth
        const outline = '#2A1A0A';
        const sideDark = '#4A3218';
        const woodMid = '#6A4A2A';
        const woodLight = '#8A6A4A';
        const back = '#d4c4a8';

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x + 3, y + 3, 28, 29);

        // Full outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y, 31, 1);
        ctx.fillRect(x, y, 1, 31);
        ctx.fillRect(x + 30, y, 1, 31);
        ctx.fillRect(x, y + 30, 31, 1);

        // Side panel (3D right)
        ctx.fillStyle = sideDark;
        ctx.fillRect(x + 28, y + 1, 2, 29);

        // Back
        ctx.fillStyle = back;
        ctx.fillRect(x + 1, y + 2, 27, 28);

        // Frame sides
        ctx.fillStyle = woodMid;
        ctx.fillRect(x + 1, y + 1, 2, 29);
        ctx.fillRect(x + 26, y + 1, 2, 29);

        // Top surface
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 1, y + 1, 29, 2);
        ctx.fillStyle = '#9A7A5A';
        ctx.fillRect(x + 1, y + 1, 29, 1);

        // Shelves with 3D edge
        for (let s = 0; s < 3; s++) {
            const sy = 9 + s * 9;
            ctx.fillStyle = woodMid;
            ctx.fillRect(x + 3, y + sy, 24, 2);
            ctx.fillStyle = woodLight;
            ctx.fillRect(x + 3, y + sy - 1, 24, 1);
        }

        // Top shelf books
        const b1 = ['#ef4444','#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899'];
        b1.forEach((c, i) => {
            const bw = 3 + (i % 2);
            const bh = 5 + (i % 3);
            ctx.fillStyle = c;
            ctx.fillRect(x + 4 + i * 3.8, y + 8 - bh, bw, bh);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(x + 4 + i * 3.8, y + 8 - bh, 1, bh);
        });

        // Mid shelf books
        const b2 = ['#14b8a6','#f97316','#6366f1','#84cc16'];
        b2.forEach((c, i) => {
            const bw = 3 + (i % 2);
            const bh = 4 + (i % 3);
            ctx.fillStyle = c;
            ctx.fillRect(x + 4 + i * 5, y + 17 - bh, bw, bh);
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(x + 4 + i * 5, y + 17 - bh, 1, bh);
        });
        // Succulent
        ctx.fillStyle = '#6b4226';
        ctx.fillRect(x + 22, y + 15, 4, 3);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath(); ctx.arc(x + 24, y + 14, 2.5, 0, Math.PI * 2); ctx.fill();

        // Bottom shelf items
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 4, y + 22, 6, 2);
        ctx.fillRect(x + 5, y + 24, 5, 2);
        // Photo frame
        ctx.fillStyle = '#d4a030';
        ctx.fillRect(x + 13, y + 22, 5, 6);
        ctx.fillStyle = '#e8dcc8';
        ctx.fillRect(x + 14, y + 23, 3, 4);
        // Globe
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(x + 24, y + 25, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 22, y + 24, 3, 2);
    }

    drawSofa(ctx, x, y, T) {
        // 3D sofa with strong front face contrast + right side face
        const outline = '#1A1A2A';
        const frontDark = '#1E2230';
        const seatMid = '#4B5563';
        const seatLight = '#5A6577';
        const backDark = '#2D3748';
        const backMid = '#374151';
        const sideBack = '#1E2230';    // right side back zone
        const sideSeat = '#3A4050';    // right side seat zone
        const sideFront = '#121620';   // right side front (darkest)

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + 2, y + 28, 28, 3);

        // Legs
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(x + 3, y + 27, 2, 4);
        ctx.fillRect(x + 27, y + 27, 2, 4);

        // Outline top
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 3, T, 1);
        ctx.fillRect(x, y + 3, 1, 25);

        // Back cushions (width=28, leave 3px for side)
        ctx.fillStyle = backDark;
        ctx.fillRect(x + 1, y + 4, 28, 10);
        ctx.fillStyle = backMid;
        ctx.fillRect(x + 2, y + 5, 26, 7);
        ctx.fillStyle = '#404A5A';
        ctx.fillRect(x + 2, y + 11, 26, 2);
        ctx.fillStyle = '#303A4A';
        ctx.fillRect(x + 15, y + 5, 2, 8);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 3, y + 5, 11, 1);
        ctx.fillRect(x + 18, y + 5, 9, 1);

        // RIGHT SIDE — back zone
        ctx.fillStyle = sideBack;
        ctx.fillRect(x + 29, y + 4, 3, 10);

        // Seat (lighter surface, width=28)
        ctx.fillStyle = seatMid;
        ctx.fillRect(x + 1, y + 14, 28, 6);
        ctx.fillStyle = seatLight;
        ctx.fillRect(x + 2, y + 14, 26, 4);
        ctx.fillStyle = '#404A5A';
        ctx.fillRect(x + 15, y + 14, 2, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 2, y + 14, 26, 1);

        // RIGHT SIDE — seat zone
        ctx.fillStyle = sideSeat;
        ctx.fillRect(x + 29, y + 14, 3, 6);

        // Edge
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 20, T, 1);

        // FRONT FACE (y+21 to y+27) — 6px dark (width=28)
        ctx.fillStyle = frontDark;
        ctx.fillRect(x + 1, y + 21, 28, 6);
        ctx.fillStyle = '#252A38';
        ctx.fillRect(x + 1, y + 21, 28, 1);
        // Texture
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i < 7; i++) ctx.fillRect(x + 2 + i * 4, y + 22, 3, 4);

        // RIGHT SIDE — front zone (DARKEST)
        ctx.fillStyle = sideFront;
        ctx.fillRect(x + 29, y + 21, 3, 6);

        // Right outline full height
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 3, 1, 25);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 27, T, 1);

        // Left armrest only
        ctx.fillStyle = backDark;
        ctx.fillRect(x + 1, y + 7, 3, 14);
        ctx.fillStyle = seatMid;
        ctx.fillRect(x + 1, y + 7, 3, 2);

        // Pillows
        ctx.fillStyle = '#0d9488';
        ctx.fillRect(x + 4, y + 7, 7, 4);
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(x + 4, y + 6, 7, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 21, y + 7, 7, 4);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(x + 21, y + 6, 7, 3);
    }

    drawOfficeChair(ctx, x, y, T) {
        // 3D Isometric office chair
        // Drop shadow (small circle)
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Star base with 5 wheels
        ctx.fillStyle = '#7a8290';
        ctx.fillRect(x + 8, y + 26, 2, 3);
        ctx.fillRect(x + 22, y + 26, 2, 3);
        ctx.fillRect(x + 5, y + 24, 2, 2);
        ctx.fillRect(x + 25, y + 24, 2, 2);
        ctx.fillRect(x + 15, y + 28, 2, 2);
        // Wheels (5 tiny circles)
        ctx.fillStyle = '#4b5563';
        ctx.beginPath(); ctx.arc(x + 9, y + 29, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 23, y + 29, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 6, y + 26, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 26, y + 26, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 16, y + 30, 1.5, 0, Math.PI * 2); ctx.fill();
        // Gas lift cylinder
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 15, y + 20, 2, 7);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 15, y + 20, 1, 7);
        // Height adjust lever
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 17, y + 22, 3, 1);
        // Seat cushion (3D: front face + top)
        // Front face of seat
        ctx.fillStyle = '#1a2332';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 19, 9, 3, 0, 0, Math.PI); ctx.fill();
        // Top of seat (lighter)
        ctx.fillStyle = '#1f2937';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 16, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2d3a48';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 15, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
        // Seat highlight
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.ellipse(x + 13, y + 14, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Chair back (rising up, taller, showing height)
        // Back front face (darker)
        ctx.fillStyle = '#1a2332';
        ctx.fillRect(x + 8, y + 10, 16, 3);
        // Back main body
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 8, y + 1, 16, 12);
        ctx.fillStyle = '#2d3a48';
        ctx.fillRect(x + 9, y + 2, 14, 10);
        // Mesh texture on back
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let i = 0; i < 5; i++) ctx.fillRect(x + 10 + i * 2.5, y + 3, 1, 9);
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 9, y + 4 + i * 3, 14, 0.5);
        // Lumbar support bump
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 10, y + 8, 12, 3);
        // Headrest (3D)
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 10, y + 0, 12, 2);
        ctx.fillStyle = '#2d3a48';
        ctx.fillRect(x + 11, y + 0, 10, 1);
        // Armrests (3D blocks)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 4, y + 8, 4, 10);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 4, y + 8, 4, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 4, y + 8, 1, 10);
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 24, y + 8, 4, 10);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 24, y + 8, 4, 2);
        // Dark outline around back
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 8, y + 0, 16, 1);
        ctx.fillRect(x + 7, y + 0, 1, 13);
        ctx.fillRect(x + 24, y + 0, 1, 13);
    }

    drawWhiteboard(ctx, x, y, T) {
        // 3D Isometric whiteboard on stand
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 10, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // A-frame stand legs
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 6, y + 24, 2, 7);
        ctx.fillRect(x + 24, y + 24, 2, 7);
        ctx.fillRect(x + 10, y + 26, 2, 5);
        ctx.fillRect(x + 20, y + 26, 2, 5);
        // Leg highlight
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 6, y + 24, 1, 7);
        ctx.fillRect(x + 24, y + 24, 1, 7);
        // Board frame (3D: slight gray border with depth)
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 2, y + 1, 28, 24);
        // Board front face bottom edge (darker)
        ctx.fillStyle = '#7a8494';
        ctx.fillRect(x + 2, y + 23, 28, 2);
        // White surface
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 3, y + 2, 26, 20);
        // Board highlight top-left
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 2, y + 1, 28, 1);
        ctx.fillRect(x + 2, y + 1, 1, 23);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 0, 30, 1);
        ctx.fillRect(x + 1, y + 0, 1, 25);
        ctx.fillRect(x + 30, y + 0, 1, 25);
        ctx.fillRect(x + 1, y + 24, 30, 1);
        // Writing content: colored squiggles
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 5, y + 3, 16, 2);
        // Post-its
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x + 5, y + 7, 5, 4);
        ctx.fillStyle = '#f87171'; ctx.fillRect(x + 12, y + 7, 5, 4);
        ctx.fillStyle = '#a78bfa'; ctx.fillRect(x + 19, y + 7, 5, 4);
        // Text on post-its
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + 6, y + 9, 3, 0.5);
        ctx.fillRect(x + 13, y + 9, 3, 0.5);
        ctx.fillRect(x + 20, y + 9, 3, 0.5);
        // Flow boxes
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 14, 6, 3);
        ctx.strokeRect(x + 14, y + 14, 6, 3);
        ctx.strokeRect(x + 23, y + 14, 5, 3);
        // Arrows
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 11, y + 15, 3, 1);
        ctx.fillRect(x + 20, y + 15, 3, 1);
        // Checkmarks
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 5, y + 19, 2, 2);
        ctx.fillRect(x + 9, y + 19, 2, 2);
        // Marker tray at bottom (3D)
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 4, y + 22, 24, 2);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 4, y + 22, 24, 1);
        // Markers in tray
        ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 7, y + 22, 4, 1);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + 13, y + 22, 4, 1);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x + 19, y + 22, 4, 1);
    }

    drawCoffeeStation(ctx, x, y, T) {
        // 3D coffee station with strong front face + right side face
        const outline = '#2A2A3A';
        const counterFront = '#8A8E96';
        const counterSurf = '#E8ECF0';
        const counterHi = '#F5F7FA';
        const sideSurf = '#C0C4CC';    // right side surface
        const sideFront = '#5A5E66';   // right side front (darkest)

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + 1, y + 29, 30, 3);

        // Outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 13, T, 1);
        ctx.fillRect(x, y + 13, 1, 18);

        // Counter surface (y+14 to y+18, width=28)
        ctx.fillStyle = counterSurf;
        ctx.fillRect(x + 1, y + 14, 28, 4);
        ctx.fillStyle = counterHi;
        ctx.fillRect(x + 1, y + 14, 28, 1);

        // RIGHT SIDE — surface zone
        ctx.fillStyle = sideSurf;
        ctx.fillRect(x + 29, y + 14, 3, 4);

        // FRONT FACE of counter (y+18 to y+30) — 12px dark (width=28)
        ctx.fillStyle = counterFront;
        ctx.fillRect(x + 1, y + 18, 28, 12);
        ctx.fillStyle = '#9A9EA6';
        ctx.fillRect(x + 1, y + 18, 28, 1);
        // Cabinet door lines
        ctx.fillStyle = '#7A7E86';
        ctx.fillRect(x + 14, y + 19, 1, 10);
        ctx.fillRect(x + 1, y + 29, 28, 1);

        // RIGHT SIDE — front zone (DARKEST)
        ctx.fillStyle = sideFront;
        ctx.fillRect(x + 29, y + 18, 3, 12);
        ctx.fillStyle = '#6A6E76';
        ctx.fillRect(x + 29, y + 18, 3, 1);

        // Right outline full height
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 13, 1, 18);

        // Espresso machine (3D box on counter)
        ctx.fillStyle = '#1a2332';
        ctx.fillRect(x + 2, y + 7, 13, 7);
        ctx.fillStyle = '#2a3342';
        ctx.fillRect(x + 2, y + 2, 13, 5);
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 2, y + 2, 13, 1);
        // Display
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 4, y + 3, 4, 2);
        // Button
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 10, y + 4, 2, 2);
        // Portafilter
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 5, y + 8, 7, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 7, y + 10, 3, 3);
        // Cup
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(x + 6, y + 11, 5, 3);
        // Steam
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x + 7, y + 0, 1, 2);
        ctx.fillRect(x + 9, y + 1, 1, 1);

        // Cup stack on counter
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x + 19, y + 8, 5, 5);
        ctx.fillStyle = '#e5e5e5';
        ctx.fillRect(x + 19, y + 8, 5, 1);
        // Snack basket
        ctx.fillStyle = '#6b4a28';
        ctx.fillRect(x + 18, y + 15, 8, 3);
        ctx.fillStyle = '#8b6840';
        ctx.fillRect(x + 18, y + 14, 8, 1);
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x + 19, y + 15, 3, 2);
        ctx.fillStyle = '#c08850';
        ctx.fillRect(x + 23, y + 15, 3, 2);
    }

    // ==========================================
    // NEW FURNITURE & DECOR (IDs 30-39)
    // ==========================================

    // ID 30 — Smart TV / Wall Monitor
    drawTV(ctx, x, y, T) {
        // 3D Isometric wall-mounted TV
        // Wall mount arm visible
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 13, y + 1, 6, 3);
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 14, y + 3, 4, 2);
        // TV bezel (3D: thin but with edge)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 2, y + 4, 28, 19);
        // Bezel front face bottom (darker)
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 2, y + 21, 28, 2);
        // Screen
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 3, y + 5, 26, 15);
        // Dashboard content
        const bars = [8, 11, 5, 9, 13, 8, 10];
        bars.forEach((h, i) => {
            ctx.fillStyle = i === 4 ? '#22d3ee' : '#3b82f6';
            ctx.fillRect(x + 4 + i * 3.5, y + 19 - h, 2, h);
        });
        // Chart axis
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 3, y + 19, 26, 1);
        // Title
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 5, y + 6, 10, 1);
        // Screen glow/reflection
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 4, y + 6, 8, 6);
        // Ambilight glow
        ctx.fillStyle = 'rgba(59,130,246,0.25)';
        ctx.fillRect(x + 0, y + 6, 2, 14);
        ctx.fillStyle = 'rgba(34,211,238,0.25)';
        ctx.fillRect(x + 30, y + 6, 2, 14);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 4, 30, 1);
        ctx.fillRect(x + 1, y + 4, 1, 19);
        ctx.fillRect(x + 30, y + 4, 1, 19);
        ctx.fillRect(x + 1, y + 22, 30, 1);
        // Power LED
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 15, y + 21, 2, 1);
        // Shadow below TV
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 4, y + 24, 24, 2);
    }

    // ID 31 — Water Cooler / Dispenser
    drawWaterCooler(ctx, x, y, T) {
        // 3D Isometric water cooler
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Base (3D)
        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(x + 10, y + 28, 12, 3);
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x + 10, y + 27, 12, 1);
        // Body front face (darker white)
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(x + 11, y + 14, 10, 14);
        // Body side visible (right, darker)
        ctx.fillStyle = '#b8b8b8';
        ctx.fillRect(x + 21, y + 14, 2, 14);
        // Body top surface (lighter)
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(x + 11, y + 10, 12, 4);
        // Body highlight (left, top-left light)
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x + 11, y + 14, 2, 14);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 10, y + 10, 13, 1);
        ctx.fillRect(x + 10, y + 10, 1, 19);
        ctx.fillRect(x + 22, y + 10, 1, 19);
        // Water bottle on top (3D blue tinted)
        ctx.fillStyle = '#4a90d9';
        ctx.beginPath(); ctx.arc(x + 16, y + 6, 5, 0, Math.PI * 2); ctx.fill();
        // Bottle highlight (top-left)
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath(); ctx.arc(x + 14, y + 4.5, 2.5, 0, Math.PI * 2); ctx.fill();
        // Bottle top
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 2, 4, 1.5, 0, 0, Math.PI * 2); ctx.fill();
        // Bottle neck
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x + 14, y + 10, 4, 2);
        // Dispensing area: two taps
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 12, y + 17, 2, 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 18, y + 17, 2, 2);
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 12, y + 19, 3, 1);
        ctx.fillRect(x + 17, y + 19, 3, 1);
        // Drip tray
        ctx.fillStyle = '#999';
        ctx.fillRect(x + 11, y + 22, 10, 2);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 11, y + 22, 10, 1);
    }

    // ID 32 — Standing Desk
    drawStandingDesk(ctx, x, y, T) {
        // 3D Isometric standing desk
        // Anti-fatigue mat below (3D)
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(x + 5, y + 27, 22, 4);
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x + 5, y + 26, 22, 1);
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 12, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Legs (tall, thin, with adjustable joint)
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 7, y + 13, 2, 15);
        ctx.fillRect(x + 23, y + 13, 2, 15);
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 7, y + 13, 1, 15);
        ctx.fillRect(x + 23, y + 13, 1, 15);
        // Adjustable joint
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 7, y + 19, 2, 2);
        ctx.fillRect(x + 23, y + 19, 2, 2);
        // Desk front panel (darker)
        ctx.fillStyle = '#d8d0c0';
        ctx.fillRect(x + 5, y + 12, 22, 2);
        // Desk top surface (lighter)
        ctx.fillStyle = '#f5f0e8';
        ctx.fillRect(x + 5, y + 9, 22, 3);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 5, y + 9, 22, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 4, y + 9, 24, 1);
        ctx.fillRect(x + 4, y + 9, 1, 5);
        ctx.fillRect(x + 27, y + 9, 1, 5);
        // Monitor on desk (3D)
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 9, y + 1, 14, 8);
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 10, y + 2, 12, 6);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 11, y + 3, 10, 4);
        // Screen content
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 12, y + 4, 4, 1);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 12, y + 5, 6, 1);
        // Monitor stand
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 14, y + 8, 4, 2);
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 14, y + 8, 4, 1);
        // Keyboard on surface
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 10, y + 10, 10, 2);
        ctx.fillStyle = '#374151';
        for (let kx = 0; kx < 4; kx++) {
            ctx.fillRect(x + 11 + kx * 2, y + 10.5, 1.5, 0.8);
        }
        // Coffee mug
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 6, y + 9, 3, 3);
        ctx.fillStyle = '#f55';
        ctx.fillRect(x + 6, y + 9, 1, 2);
    }

    // ID 33 — Ceiling Pendant Light
    drawCeilingLight(ctx, x, y, T) {
        // Ceiling light — transparent bg
        // Light glow — outer ring
        ctx.fillStyle = 'rgba(255, 247, 200, 0.25)';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 14, 0, Math.PI * 2); ctx.fill();
        // Light glow — mid ring
        ctx.fillStyle = 'rgba(255, 247, 200, 0.35)';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 10, 0, Math.PI * 2); ctx.fill();
        // Light glow — inner ring
        ctx.fillStyle = 'rgba(255, 247, 200, 0.5)';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 6, 0, Math.PI * 2); ctx.fill();
        // Cable from ceiling
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 15, y, 2, 8);
        // Canopy (ceiling plate)
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 12, y, 8, 2);
        // Lamp shade — circular modern
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath(); ctx.arc(x + 16, y + 12, 6, 0, Math.PI * 2); ctx.fill();
        // Shade inner (light)
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath(); ctx.arc(x + 16, y + 12, 4, 0, Math.PI * 2); ctx.fill();
        // Bulb center
        ctx.fillStyle = '#fde68a';
        ctx.beginPath(); ctx.arc(x + 16, y + 12, 2, 0, Math.PI * 2); ctx.fill();
        // Shade ring detail
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(x + 16, y + 12, 6, 0, Math.PI * 2); ctx.stroke();
    }

    // ID 34 — Multifunction Printer
    drawPrinter(ctx, x, y, T) {
        // 3D Isometric printer
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 12, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Legs
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 6, y + 27, 2, 4);
        ctx.fillRect(x + 24, y + 27, 2, 4);
        // Body front face (darker)
        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(x + 4, y + 16, 24, 12);
        // Body front face detail
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 4, y + 22, 24, 1);
        // Body top surface (lighter)
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(x + 4, y + 10, 24, 6);
        // Scanner lid top (darkest)
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 4, y + 8, 24, 2);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 4, y + 8, 24, 1);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 4, y + 8, 24, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 3, y + 8, 26, 1);
        ctx.fillRect(x + 3, y + 8, 1, 20);
        ctx.fillRect(x + 28, y + 8, 1, 20);
        // Display screen
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 6, y + 12, 8, 3);
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x + 7, y + 13, 3, 1);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 7, y + 14, 5, 0.5);
        // Buttons (colored dots)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 16, y + 12, 2, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 19, y + 12, 2, 2);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 22, y + 12, 4, 2);
        // Paper tray at front
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 6, y + 20, 20, 2);
        ctx.fillStyle = '#bbb';
        ctx.fillRect(x + 6, y + 20, 20, 1);
        // Paper output
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 8, y + 24, 16, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 10, y + 23, 12, 2);
        // Status LEDs
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 25, y + 14, 1, 1);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 25, y + 15.5, 1, 1);
    }

    // ID 35 — Bean Bag / Puff Lounge (centered design, rotation-friendly)
    drawBeanBag(ctx, x, y, T) {
        const cx = x + 16, cy = y + 16;
        // Drop shadow (circular)
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(cx, cy + 4, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
        // Bean bag body base (front face, darker)
        ctx.fillStyle = '#0a7a6e';
        ctx.beginPath(); ctx.ellipse(cx, cy + 2, 11, 9, 0, 0, Math.PI); ctx.fill();
        // Bean bag top (lighter, rounded puffy shape)
        ctx.fillStyle = '#0d9488';
        ctx.beginPath(); ctx.ellipse(cx, cy - 1, 11, 10, 0, 0, Math.PI * 2); ctx.fill();
        // Wrinkle/fold lines for volume
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, 4 + i * 2, -0.5, 1.5);
            ctx.stroke();
        }
        // Darker back-rest area
        ctx.fillStyle = '#0f766e';
        ctx.beginPath(); ctx.ellipse(cx - 3, cy, 8, 9, 0, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
        // Highlight on top-left (light source)
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath(); ctx.ellipse(cx + 2, cy - 3, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.ellipse(cx - 1, cy - 5, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Fabric texture lines
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(cx - 6, cy - 2, 12, 1);
        ctx.fillRect(cx - 5, cy + 2, 10, 1);
        // Orange pillow/cushion (3D)
        ctx.fillStyle = '#e06510';
        ctx.beginPath(); ctx.ellipse(cx + 4, cy - 2, 3.5, 2.8, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.ellipse(cx + 4, cy - 2.5, 3, 2.2, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fb923c';
        ctx.beginPath(); ctx.ellipse(cx + 4, cy - 3, 2, 1.2, 0.2, 0, Math.PI * 2); ctx.fill();
        // Dark outline
        ctx.strokeStyle = '#1a1c2e';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.ellipse(cx, cy - 1, 11.5, 10.5, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // ID 36 — Mini Fridge
    drawMiniFridge(ctx, x, y, T) {
        // 3D Isometric mini fridge
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 10, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Feet
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 8, y + 30, 2, 1);
        ctx.fillRect(x + 22, y + 30, 2, 1);
        // Side visible (right, darker)
        ctx.fillStyle = '#9ca0a8';
        ctx.fillRect(x + 24, y + 6, 3, 24);
        // Front door face
        ctx.fillStyle = '#b8bcc5';
        ctx.fillRect(x + 7, y + 6, 17, 24);
        // Door line
        ctx.fillStyle = '#8a8e96';
        ctx.fillRect(x + 7, y + 17, 17, 1);
        // Interior glow through crack
        ctx.fillStyle = 'rgba(186,230,253,0.4)';
        ctx.fillRect(x + 8, y + 17, 15, 1);
        // Top surface (lighter)
        ctx.fillStyle = '#ccd0d8';
        ctx.fillRect(x + 7, y + 4, 20, 2);
        // Top highlight
        ctx.fillStyle = '#dde0e8';
        ctx.fillRect(x + 7, y + 4, 20, 1);
        // Left highlight
        ctx.fillStyle = '#ccd0d8';
        ctx.fillRect(x + 7, y + 6, 2, 24);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 6, y + 4, 21, 1);
        ctx.fillRect(x + 6, y + 4, 1, 27);
        ctx.fillRect(x + 26, y + 4, 1, 27);
        ctx.fillRect(x + 6, y + 30, 21, 1);
        // Handle (chrome, 3D)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + 21, y + 10, 2, 4);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x + 21, y + 10, 1, 4);
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + 21, y + 20, 2, 4);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x + 21, y + 20, 1, 4);
        // Brand logo placeholder
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 13, y + 8, 6, 1);
        // Fridge magnets
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 10, y + 10, 2, 2);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(x + 14, y + 19, 2, 2);
        // Items on top (3D bottles)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 9, y + 2, 3, 2);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 13, y + 2, 3, 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 17, y + 3, 3, 1);
    }

    // ID 37 — Coat Rack
    drawCoatRack(ctx, x, y, T) {
        // Coat rack — transparent bg
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Base (heavy round)
        ctx.fillStyle = '#444';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Main pole
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 15, y + 6, 2, 23);
        // Top knob
        ctx.fillStyle = '#666';
        ctx.beginPath(); ctx.arc(x + 16, y + 5, 2, 0, Math.PI * 2); ctx.fill();
        // Hook arms (4 directions)
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 10, y + 8, 5, 1); // left
        ctx.fillRect(x + 17, y + 8, 5, 1); // right
        ctx.fillRect(x + 15, y + 8, 2, 1);
        // Hook tips (curved ends)
        ctx.fillRect(x + 10, y + 8, 1, 2);
        ctx.fillRect(x + 21, y + 8, 1, 2);
        // Coat 1 — dark blue
        ctx.fillStyle = '#1e3a5f';
        ctx.fillRect(x + 5, y + 10, 7, 12);
        ctx.fillStyle = '#162d4a';
        ctx.fillRect(x + 6, y + 11, 5, 10);
        // Coat 1 collar
        ctx.fillStyle = '#1e3a5f';
        ctx.fillRect(x + 6, y + 9, 5, 2);
        // Coat 2 — burgundy
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(x + 20, y + 10, 7, 10);
        ctx.fillStyle = '#6b1616';
        ctx.fillRect(x + 21, y + 11, 5, 8);
        // Umbrella leaning
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 3, y + 14, 1, 16);
        // Umbrella handle
        ctx.fillStyle = '#8b4513';
        ctx.beginPath(); ctx.arc(x + 3, y + 14, 2, Math.PI, Math.PI * 2); ctx.fill();
    }

    // ID 38 — Decorative Rug (circular)
    drawRug(ctx, x, y, T) {
        // Rug — transparent bg, lays on floor
        // Rug outer circle — warm terracotta
        ctx.fillStyle = '#c2703e';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 14, 0, Math.PI * 2); ctx.fill();
        // Middle ring — cream
        ctx.fillStyle = '#f5e6d3';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 11, 0, Math.PI * 2); ctx.fill();
        // Inner ring — dark pattern
        ctx.fillStyle = '#8b4513';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 8, 0, Math.PI * 2); ctx.fill();
        // Center — warm gold
        ctx.fillStyle = '#daa520';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 5, 0, Math.PI * 2); ctx.fill();
        // Center detail — star/mandala pattern
        ctx.fillStyle = '#c2703e';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 2, 0, Math.PI * 2); ctx.fill();
        // Geometric pattern lines on middle ring
        ctx.strokeStyle = '#a0522d';
        ctx.lineWidth = 0.5;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(x + 16 + Math.cos(angle) * 6, y + 16 + Math.sin(angle) * 6);
            ctx.lineTo(x + 16 + Math.cos(angle) * 10, y + 16 + Math.sin(angle) * 10);
            ctx.stroke();
        }
        // Diamond shapes in middle ring
        ctx.fillStyle = '#a0522d';
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const cx = x + 16 + Math.cos(angle) * 9.5;
            const cy = y + 16 + Math.sin(angle) * 9.5;
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
        }
        // Fringe on edges (bottom hint)
        ctx.fillStyle = '#c2703e';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 8 + i * 3, y + 29, 1, 2);
        }
    }

    // ID 39 — Wall Art / Framed Poster
    drawWallArt(ctx, x, y, T) {
        // Wall art — transparent bg
        // Frame shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 5, y + 5, 23, 23);
        // Frame — thin black
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 4, y + 3, 24, 24);
        // Frame inner mat — white
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x + 5, y + 4, 22, 22);
        // Canvas area
        ctx.fillStyle = '#faf8f5';
        ctx.fillRect(x + 6, y + 5, 20, 20);
        // Abstract art — colorful shapes
        // Blue splash
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(x + 12, y + 12, 5, 0, Math.PI * 2); ctx.fill();
        // Orange splash
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(x + 20, y + 16, 4, 0, Math.PI * 2); ctx.fill();
        // Teal stroke
        ctx.fillStyle = '#14b8a6';
        ctx.fillRect(x + 8, y + 18, 12, 3);
        // Yellow accent
        ctx.fillStyle = '#eab308';
        ctx.beginPath(); ctx.arc(x + 15, y + 9, 3, 0, Math.PI * 2); ctx.fill();
        // Pink dot
        ctx.fillStyle = '#ec4899';
        ctx.beginPath(); ctx.arc(x + 22, y + 10, 2, 0, Math.PI * 2); ctx.fill();
        // Dark line across
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 7, y + 14, 18, 1);
        // Spot light from above
        ctx.fillStyle = 'rgba(255,255,200,0.2)';
        ctx.beginPath();
        ctx.moveTo(x + 13, y + 1);
        ctx.lineTo(x + 19, y + 1);
        ctx.lineTo(x + 24, y + 5);
        ctx.lineTo(x + 8, y + 5);
        ctx.closePath();
        ctx.fill();
        // Light fixture
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 14, y + 1, 4, 2);
    }

    // ==========================================
    // WALLS WITH CORNERS (IDs 40-51)
    // ==========================================

    drawWallTop(ctx, x, y, T) {
        // Modern clean horizontal top wall
        // Main wall surface - light warm gray
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Subtle texture variation
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + (i * 7 + 2) % T, y + 4 + (i * 9) % (T - 8), 3, 2);
        }
        // Top edge - wall cap / crown (darker, 3D depth)
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, T, 4);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x, y, T, 2);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, T, 1);
        // Bottom baseboard (wood tone)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y + T - 3, T, 3);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x, y + T - 3, T, 1);
        // Inner shadow below cap
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x, y + 4, T, 2);
        // Shadow above baseboard
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x, y + T - 5, T, 2);
    }

    drawWallBottom(ctx, x, y, T) {
        // Modern clean horizontal bottom wall
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Subtle texture
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + (i * 5 + 1) % T, y + 3 + (i * 11) % (T - 8), 3, 2);
        }
        // Top baseboard (wood tone)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y, T, 3);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x, y + 2, T, 1);
        // Bottom edge - wall base / floor junction
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y + T - 4, T, 4);
        ctx.fillStyle = '#a8a098';
        ctx.fillRect(x, y + T - 2, T, 2);
        ctx.fillStyle = '#989088';
        ctx.fillRect(x, y + T - 1, T, 1);
        // Shadow below baseboard
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x, y + 3, T, 2);
        // Shadow at bottom
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x, y + T - 5, T, 1);
    }

    drawWallLeft(ctx, x, y, T) {
        // Modern clean vertical left wall
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Subtle texture
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 4 + (i * 7) % (T - 8), y + (i * 9 + 2) % T, 2, 3);
        }
        // Left edge - wall cap (3D depth)
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, 4, T);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x, y, 2, T);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, 1, T);
        // Right baseboard (wood tone)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + T - 3, y, 3, T);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + T - 3, y, 1, T);
        // Inner shadow after cap
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 4, y, 2, T);
        // Shadow before baseboard
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x + T - 5, y, 2, T);
    }

    drawWallRight(ctx, x, y, T) {
        // Modern clean vertical right wall
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Subtle texture
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(x + 2 + (i * 7) % (T - 8), y + (i * 11 + 1) % T, 2, 3);
        }
        // Left baseboard (wood tone)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y, 3, T);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + 2, y, 1, T);
        // Right edge - wall cap (3D depth)
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x + T - 4, y, 4, T);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x + T - 2, y, 2, T);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x + T - 1, y, 1, T);
        // Shadow after baseboard
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 3, y, 2, T);
        // Inner shadow before cap
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(x + T - 6, y, 2, T);
    }

    drawWallCornerTL(ctx, x, y, T) {
        // Modern clean top-left corner
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Top cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, T, 4);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x, y, T, 2);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, T, 1);
        // Left cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, 4, T);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x, y, 2, T);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, 1, T);
        // Corner accent
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, 4, 4);
        // Bottom baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + 4, y + T - 3, T - 4, 3);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + 4, y + T - 3, T - 4, 1);
        // Right baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + T - 3, y + 4, 3, T - 7);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + T - 3, y + 4, 1, T - 7);
        // Inner shadows
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 4, y + 4, T - 4, 2);
        ctx.fillRect(x + 4, y + 4, 2, T - 4);
    }

    drawWallCornerTR(ctx, x, y, T) {
        // Modern clean top-right corner
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Top cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, T, 4);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x, y, T, 2);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, T, 1);
        // Right cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x + T - 4, y, 4, T);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x + T - 2, y, 2, T);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x + T - 1, y, 1, T);
        // Corner accent
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x + T - 4, y, 4, 4);
        // Bottom baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y + T - 3, T - 4, 3);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x, y + T - 3, T - 4, 1);
        // Left baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y + 4, 3, T - 7);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + 2, y + 4, 1, T - 7);
        // Inner shadows
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x, y + 4, T - 4, 2);
        ctx.fillRect(x + T - 6, y + 4, 2, T - 4);
    }

    drawWallCornerBL(ctx, x, y, T) {
        // Modern clean bottom-left corner
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Left cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, 4, T);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x, y, 2, T);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, 1, T);
        // Bottom cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y + T - 4, T, 4);
        ctx.fillStyle = '#a8a098';
        ctx.fillRect(x, y + T - 2, T, 2);
        ctx.fillStyle = '#989088';
        ctx.fillRect(x, y + T - 1, T, 1);
        // Corner accent
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y + T - 4, 4, 4);
        // Top baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + 4, y, T - 4, 3);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + 4, y + 2, T - 4, 1);
        // Right baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + T - 3, y, 3, T - 4);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + T - 3, y, 1, T - 4);
        // Inner shadows
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 4, y + 3, 2, T - 7);
        ctx.fillRect(x + 4, y + T - 6, T - 4, 2);
    }

    drawWallCornerBR(ctx, x, y, T) {
        // Modern clean bottom-right corner
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Right cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x + T - 4, y, 4, T);
        ctx.fillStyle = '#ccc4bc';
        ctx.fillRect(x + T - 2, y, 2, T);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x + T - 1, y, 1, T);
        // Bottom cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y + T - 4, T, 4);
        ctx.fillStyle = '#a8a098';
        ctx.fillRect(x, y + T - 2, T, 2);
        ctx.fillStyle = '#989088';
        ctx.fillRect(x, y + T - 1, T, 1);
        // Corner accent
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x + T - 4, y + T - 4, 4, 4);
        // Top baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y, T - 4, 3);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x, y + 2, T - 4, 1);
        // Left baseboard (wood)
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y, 3, T - 4);
        ctx.fillStyle = '#9a8265';
        ctx.fillRect(x + 2, y, 1, T - 4);
        // Inner shadows
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + T - 6, y + 3, 2, T - 7);
        ctx.fillRect(x, y + T - 6, T - 4, 2);
    }

    drawWallTJunctionDown(ctx, x, y, T) {
        // Modern T-junction: wall at top, opening downward
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Top cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, T, 4);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, T, 1);
        // Left wall segment with baseboard
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y + T - 3, 10, 3);
        ctx.fillRect(x + 22, y + T - 3, 10, 3);
        // Opening in center bottom (corridor)
        ctx.fillStyle = '#d5cfc8';
        ctx.fillRect(x + 10, y + 4, 12, T - 4);
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x + 10, y + 4, 1, T - 4);
        ctx.fillRect(x + 21, y + 4, 1, T - 4);
    }

    drawWallTJunctionUp(ctx, x, y, T) {
        // Modern T-junction: wall at bottom, opening upward
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Bottom cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y + T - 4, T, 4);
        ctx.fillStyle = '#989088';
        ctx.fillRect(x, y + T - 1, T, 1);
        // Baseboard segments
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y, 10, 3);
        ctx.fillRect(x + 22, y, 10, 3);
        // Opening in center top
        ctx.fillStyle = '#d5cfc8';
        ctx.fillRect(x + 10, y, 12, T - 4);
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x + 10, y, 1, T - 4);
        ctx.fillRect(x + 21, y, 1, T - 4);
    }

    drawWallTJunctionLeft(ctx, x, y, T) {
        // Modern T-junction: wall at right, opening left
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Right cap
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x + T - 4, y, 4, T);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x + T - 1, y, 1, T);
        // Baseboard segments
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x, y, 3, 10);
        ctx.fillRect(x, y + 22, 3, 10);
        // Opening in center left
        ctx.fillStyle = '#d5cfc8';
        ctx.fillRect(x, y + 10, T - 4, 12);
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x, y + 10, T - 4, 1);
        ctx.fillRect(x, y + 21, T - 4, 1);
    }

    drawWallDoorFrame(ctx, x, y, T) {
        // Modern door frame with clean lines
        ctx.fillStyle = '#e8e4e0';
        ctx.fillRect(x, y, T, T);
        // Crown at top
        ctx.fillStyle = '#b8b0a8';
        ctx.fillRect(x, y, T, 4);
        ctx.fillStyle = '#d8d0c8';
        ctx.fillRect(x, y, T, 1);
        // Door frame posts (dark wood)
        ctx.fillStyle = '#6b5a42';
        ctx.fillRect(x + 4, y + 4, 3, T - 4);
        ctx.fillRect(x + 25, y + 4, 3, T - 4);
        // Lintel (horizontal beam)
        ctx.fillStyle = '#7a6950';
        ctx.fillRect(x + 4, y + 4, 24, 3);
        ctx.fillStyle = '#8b7860';
        ctx.fillRect(x + 4, y + 4, 24, 1);
        // Door opening
        ctx.fillStyle = '#d5cfc8';
        ctx.fillRect(x + 7, y + 7, 18, T - 7);
        // Threshold
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(x + 7, y + T - 2, 18, 2);
    }

    // ==========================================
    // WATER / LAKE TILES (IDs 52-63)
    // ==========================================

    _drawWaterFrame(ctx, x, y, T, frame = 0) {
        // Base fill — always same color
        ctx.fillStyle = '#2678a0';
        ctx.fillRect(x, y, T, T);

        // STATIC elements (same in all frames — matches edge tiles)
        // Dark depth bands
        ctx.fillStyle = '#1e6a90';
        ctx.fillRect(x, y + 5, T, 2);
        ctx.fillRect(x, y + 16, T, 2);
        ctx.fillRect(x, y + 27, T, 2);

        // Light wave crests
        ctx.fillStyle = '#3a9cc8';
        ctx.fillRect(x, y + 1, T, 1);
        ctx.fillRect(x, y + 12, T, 1);
        ctx.fillRect(x, y + 23, T, 1);

        // Bright foam lines
        ctx.fillStyle = '#5bb8e0';
        ctx.fillRect(x, y + 2, T, 1);
        ctx.fillRect(x, y + 13, T, 1);
        ctx.fillRect(x, y + 24, T, 1);

        // ANIMATED elements (shift with frame — only subtle highlights)
        // Wavy sinusoidal sparkle line (phase shifts per frame)
        ctx.fillStyle = '#4daad0';
        for (let wy = 8; wy < T; wy += 11) {
            for (let wx = 0; wx < T; wx++) {
                const wave = Math.sin(wx * 0.4 + frame * 1.5) * 1.5;
                const py = Math.round(wy + wave);
                if (py >= 0 && py < T) ctx.fillRect(x + wx, y + py, 1, 1);
            }
        }

        // Moving sparkles (sun reflections shifting)
        ctx.fillStyle = '#b0e8ff';
        const sparkles = [[5,3],[18,9],[28,6],[10,20],[24,26],[2,14],[14,29],[30,17]];
        for (const [sx, sy] of sparkles) {
            const nx = (sx + frame * 3) % T;
            ctx.fillRect(x + nx, y + sy, 2, 1);
        }
        ctx.fillStyle = '#d4f2ff';
        ctx.fillRect(x + ((6 + frame * 3) % T), y + 3, 1, 1);
        ctx.fillRect(x + ((19 + frame * 3) % T), y + 9, 1, 1);
        ctx.fillRect(x + ((11 + frame * 3) % T), y + 20, 1, 1);
    }

    _drawWaterBase(ctx, x, y, T, color) {
        // Default frame (frame 0) for edge/corner tiles
        if (color && color !== '#2678a0') {
            // Custom color for aquarium etc
            ctx.fillStyle = color;
            ctx.fillRect(x, y, T, T);
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            for (let wy = 3; wy < T; wy += 7) {
                for (let wx = 0; wx < T; wx += 2) {
                    ctx.fillRect(x + wx, y + wy, 2, 1);
                }
            }
            return;
        }
        this._drawWaterFrame(ctx, x, y, T, 0);
    }

    drawWaterDeep(ctx, x, y, T) {
        this._drawWaterFrame(ctx, x, y, T, 0);
    }

    drawWaterShallow(ctx, x, y, T) {
        this._drawWaterFrame(ctx, x, y, T, 0);
    }

    drawWaterEdgeTop(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        // Just 1px sand shore line at top edge
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x, y, T, 1);
        ctx.fillStyle = 'rgba(235,245,251,0.3)';
        ctx.fillRect(x, y + 1, T, 1);
    }

    drawWaterEdgeBottom(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x, y + T - 1, T, 1);
        ctx.fillStyle = 'rgba(235,245,251,0.3)';
        ctx.fillRect(x, y + T - 2, T, 1);
    }

    drawWaterEdgeLeft(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x, y, 1, T);
        ctx.fillStyle = 'rgba(235,245,251,0.3)';
        ctx.fillRect(x + 1, y, 1, T);
    }

    drawWaterEdgeRight(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x + T - 1, y, 1, T);
        ctx.fillStyle = 'rgba(235,245,251,0.3)';
        ctx.fillRect(x + T - 2, y, 1, T);
    }

    drawWaterCornerTL(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x, y, 1, T);
    }

    drawWaterCornerTR(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x + T - 1, y, 1, T);
    }

    drawWaterCornerBL(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x, y + T - 1, T, 1);
        ctx.fillRect(x, y, 1, T);
    }

    drawWaterCornerBR(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x, y + T - 1, T, 1);
        ctx.fillRect(x + T - 1, y, 1, T);
        ctx.fillStyle = '#c4a876';
        ctx.fillRect(x + T - 5, y + T - 5, 1, 1);
    }

    drawLilyPad(ctx, x, y, T) {
        // TRANSPARENT background — ground layer already has water beneath
        // Only draw the lily pad and flower (no opaque water fill)
        // Shadow under pad
        ctx.fillStyle = 'rgba(0,40,60,0.15)';
        ctx.fillRect(x + 10, y + 17, 12, 5);
        // Lily pad oval — dark green outline
        ctx.fillStyle = '#2d7018';
        ctx.fillRect(x + 12, y + 12, 8, 1);
        ctx.fillRect(x + 11, y + 13, 1, 1);
        ctx.fillRect(x + 20, y + 13, 1, 1);
        ctx.fillRect(x + 10, y + 14, 1, 4);
        ctx.fillRect(x + 21, y + 14, 1, 4);
        ctx.fillRect(x + 11, y + 18, 1, 1);
        ctx.fillRect(x + 20, y + 18, 1, 1);
        ctx.fillRect(x + 12, y + 19, 8, 1);
        // Pad fill
        ctx.fillStyle = '#4aaa28';
        ctx.fillRect(x + 12, y + 13, 8, 6);
        ctx.fillRect(x + 11, y + 14, 10, 4);
        // Highlight
        ctx.fillStyle = '#5abb38';
        ctx.fillRect(x + 12, y + 13, 5, 3);
        ctx.fillRect(x + 11, y + 14, 4, 2);
        // Veins
        ctx.fillStyle = 'rgba(30,80,15,0.3)';
        ctx.fillRect(x + 15, y + 13, 1, 6);
        ctx.fillRect(x + 13, y + 15, 6, 1);
        // Pink flower
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(x + 13, y + 13, 3, 1);
        ctx.fillRect(x + 12, y + 14, 1, 1);
        ctx.fillRect(x + 15, y + 14, 1, 1);
        ctx.fillRect(x + 13, y + 15, 3, 1);
        ctx.fillRect(x + 14, y + 12, 1, 1);
        ctx.fillRect(x + 14, y + 16, 1, 1);
        // Yellow center
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 13, y + 14, 2, 1);
        ctx.fillRect(x + 14, y + 13, 1, 1);
    }

    drawBridge(ctx, x, y, T) {
        this._drawWaterBase(ctx, x, y, T);
        // Wooden planks
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x + 4, y, 24, T);
        // Plank lines
        ctx.fillStyle = '#b8860b';
        for (let py = 0; py < T; py += 6) {
            ctx.fillRect(x + 4, y + py, 24, 1);
        }
        // Wood grain
        ctx.fillStyle = 'rgba(139,105,20,0.15)';
        ctx.fillRect(x + 8, y + 3, 8, 1);
        ctx.fillRect(x + 14, y + 15, 10, 1);
        ctx.fillRect(x + 10, y + 25, 6, 1);
        // Side rails
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(x + 4, y, 2, T);
        ctx.fillRect(x + 26, y, 2, T);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 6, y, 1, T);
    }

    // ==========================================
    // EXTRA FLOORS (IDs 64-75)
    // ==========================================

    drawCobblestone(ctx, x, y, T) {
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x, y, T, T);
        const stones = [
            [2, 2, 8, 6], [12, 1, 7, 7], [21, 2, 9, 6],
            [1, 10, 9, 7], [12, 10, 8, 6], [22, 9, 8, 8],
            [3, 19, 7, 7], [12, 18, 9, 7], [23, 19, 7, 6],
            [1, 27, 10, 4], [13, 27, 8, 4], [23, 26, 8, 5]
        ];
        stones.forEach(([sx, sy, sw, sh], i) => {
            ctx.fillStyle = i % 3 === 0 ? '#a8b0ba' : i % 3 === 1 ? '#8a929c' : '#b0b8c2';
            ctx.beginPath();
            ctx.moveTo(x + sx + 2, y + sy);
            ctx.lineTo(x + sx + sw - 2, y + sy);
            ctx.lineTo(x + sx + sw, y + sy + 2);
            ctx.lineTo(x + sx + sw, y + sy + sh - 2);
            ctx.lineTo(x + sx + sw - 2, y + sy + sh);
            ctx.lineTo(x + sx + 2, y + sy + sh);
            ctx.lineTo(x + sx, y + sy + sh - 2);
            ctx.lineTo(x + sx, y + sy + 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(x + sx + 1, y + sy + 1, sw - 2, 1);
        });
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 10, y + 8, 1, 1);
        ctx.fillRect(x + 20, y + 17, 1, 1);
    }

    drawSand(ctx, x, y, T) {
        ctx.fillStyle = '#f0d9a0';
        ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#e5cc8a';
        for (let i = 0; i < 10; i++) {
            const sx = (i * 7 + 3) % (T - 2);
            const sy = (i * 11 + 5) % (T - 2);
            ctx.fillRect(x + sx, y + sy, 2, 1);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 4, y + 8, 6, 1);
        ctx.fillRect(x + 18, y + 20, 8, 1);
        ctx.fillStyle = '#dcc080';
        ctx.fillRect(x + 10, y + 14, 3, 1);
        ctx.fillRect(x + 22, y + 6, 4, 1);
    }

    drawCarpetRed(ctx, x, y, T) {
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#991b1b';
        for (let ty = 0; ty < T; ty += 4) {
            for (let tx = 0; tx < T; tx += 4) {
                if ((tx + ty) % 8 === 0) ctx.fillRect(x + tx, y + ty, 4, 4);
            }
        }
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x, y, 1, T);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let i = 0; i < 8; i++) ctx.fillRect(x + (i * 5 + 2) % T, y + (i * 7 + 1) % T, 1, 1);
    }

    drawCarpetBlue(ctx, x, y, T) {
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#1e3a8a';
        for (let ty = 0; ty < T; ty += 4) {
            for (let tx = 0; tx < T; tx += 4) {
                if ((tx + ty) % 8 === 0) ctx.fillRect(x + tx, y + ty, 4, 4);
            }
        }
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x, y, 1, T);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let i = 0; i < 8; i++) ctx.fillRect(x + (i * 5 + 2) % T, y + (i * 7 + 1) % T, 1, 1);
    }

    drawCarpetGreen(ctx, x, y, T) {
        ctx.fillStyle = '#166534';
        ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#14532d';
        for (let ty = 0; ty < T; ty += 4) {
            for (let tx = 0; tx < T; tx += 4) {
                if ((tx + ty) % 8 === 0) ctx.fillRect(x + tx, y + ty, 4, 4);
            }
        }
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x, y, 1, T);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let i = 0; i < 8; i++) ctx.fillRect(x + (i * 5 + 2) % T, y + (i * 7 + 1) % T, 1, 1);
    }

    drawCarpetPattern(ctx, x, y, T) {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(x, y, T, T);
        // Diamond motif
        ctx.fillStyle = '#6d28d9';
        for (let dy = 0; dy < T; dy += 8) {
            for (let dx = 0; dx < T; dx += 8) {
                ctx.beginPath();
                ctx.moveTo(x + dx + 4, y + dy);
                ctx.lineTo(x + dx + 8, y + dy + 4);
                ctx.lineTo(x + dx + 4, y + dy + 8);
                ctx.lineTo(x + dx, y + dy + 4);
                ctx.closePath();
                ctx.fill();
            }
        }
        ctx.fillStyle = '#ddd6fe';
        for (let dy = 4; dy < T; dy += 8) {
            for (let dx = 4; dx < T; dx += 8) {
                ctx.fillRect(x + dx - 0.5, y + dy - 0.5, 1, 1);
            }
        }
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 2, y + 2, T - 4, 1);
    }

    drawMarbleFloor(ctx, x, y, T) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x, y, T, T);
        // Veins
        ctx.strokeStyle = 'rgba(148,163,184,0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + 12, y + 10); ctx.lineTo(x + 20, y + 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 22, y + 18); ctx.lineTo(x + 28, y + 26); ctx.lineTo(x + 18, y + 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 20); ctx.lineTo(x + 10, y + 28);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 8, y + 6, 8, 1);
        ctx.fillRect(x + 16, y + 22, 6, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        ctx.fillRect(x + 4, y + 14, 12, 8);
    }

    drawBambooFloor(ctx, x, y, T) {
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x, y, T, T);
        for (let py = 0; py < T; py += 4) {
            ctx.fillStyle = '#c89b5e';
            ctx.fillRect(x, y + py, T, 1);
            ctx.fillStyle = '#deb878';
            ctx.fillRect(x, y + py + 1, T, 1);
            // Knots
            if (py % 12 === 0) {
                ctx.fillStyle = '#b8860b';
                ctx.fillRect(x + 8, y + py + 2, T - 16, 1);
            }
        }
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 2, y + 2, 4, T - 4);
    }

    drawKitchenTile(ctx, x, y, T) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x, y, 16, 16);
        ctx.fillRect(x + 16, y + 16, 16, 16);
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, 15, 15);
        ctx.strokeRect(x + 16.5, y + 0.5, 15, 15);
        ctx.strokeRect(x + 0.5, y + 16.5, 15, 15);
        ctx.strokeRect(x + 16.5, y + 16.5, 15, 15);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 2, y + 2, 6, 1);
        ctx.fillRect(x + 18, y + 18, 6, 1);
    }

    drawGrassToPath(ctx, x, y, T) {
        this.drawGrassBase(ctx, x, y, T);
        // Stone path on right half
        ctx.fillStyle = '#d4c4a8';
        ctx.fillRect(x + 16, y, 16, T);
        ctx.strokeStyle = 'rgba(160,140,110,0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 17, y + 2, 13, 13);
        ctx.strokeRect(x + 17, y + 17, 13, 13);
        // Transition edge
        ctx.fillStyle = '#90cc70';
        ctx.fillRect(x + 16, y, 2, T);
        for (let ey = 0; ey < T; ey += 4) {
            ctx.fillRect(x + 17, y + ey, 1 + (ey % 8 === 0 ? 2 : 0), 3);
        }
    }

    drawGardenSoil(ctx, x, y, T) {
        ctx.fillStyle = '#5c3d2e';
        ctx.fillRect(x, y, T, T);
        ctx.fillStyle = '#4a3020';
        for (let sy = 0; sy < T; sy += 4) {
            ctx.fillRect(x, y + sy, T, 1);
        }
        // Small sprouts
        ctx.fillStyle = '#3d8b20';
        ctx.fillRect(x + 6, y + 8, 1, 3);
        ctx.fillRect(x + 5, y + 7, 1, 1);
        ctx.fillRect(x + 7, y + 7, 1, 1);
        ctx.fillRect(x + 18, y + 14, 1, 3);
        ctx.fillRect(x + 17, y + 13, 1, 1);
        ctx.fillRect(x + 19, y + 13, 1, 1);
        ctx.fillRect(x + 26, y + 22, 1, 3);
        ctx.fillRect(x + 25, y + 21, 1, 1);
        ctx.fillRect(x + 27, y + 21, 1, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 10, y + 10, 4, 1);
    }

    drawFlowerGarden(ctx, x, y, T) {
        this.drawGrassBase(ctx, x, y, T);
        const flowers = [
            { cx: 6, cy: 6, c: '#ef4444', ic: '#fbbf24', s: 2.5 },
            { cx: 18, cy: 4, c: '#ec4899', ic: '#fde68a', s: 2 },
            { cx: 28, cy: 8, c: '#8b5cf6', ic: '#fbbf24', s: 2 },
            { cx: 10, cy: 16, c: '#f59e0b', ic: '#fef3c7', s: 2.5 },
            { cx: 24, cy: 18, c: '#3b82f6', ic: '#e0f2fe', s: 2 },
            { cx: 4, cy: 26, c: '#ec4899', ic: '#fde68a', s: 2 },
            { cx: 16, cy: 24, c: '#ef4444', ic: '#fbbf24', s: 2.5 },
            { cx: 28, cy: 26, c: '#a855f7', ic: '#fbbf24', s: 2 },
        ];
        flowers.forEach(f => {
            ctx.fillStyle = '#3d8b4a';
            ctx.fillRect(x + f.cx - 0.5, y + f.cy + f.s, 1, 3);
            ctx.fillStyle = f.c;
            ctx.beginPath(); ctx.arc(x + f.cx, y + f.cy, f.s, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = f.ic;
            ctx.beginPath(); ctx.arc(x + f.cx, y + f.cy, f.s * 0.4, 0, Math.PI * 2); ctx.fill();
        });
    }

    // ==========================================
    // DECORATIONS (IDs 76-87)
    // ==========================================

    drawAquarium(ctx, x, y, T) {
        // 3D Isometric fish tank with depth
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 13, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Stand/table (dark wood, 3D front face)
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(x + 3, y + 26, 26, 5);
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 3, y + 24, 26, 2);
        ctx.fillStyle = '#6b4f2e';
        ctx.fillRect(x + 3, y + 24, 26, 1);
        // Glass tank frame
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 1, y + 4, 30, 20);
        // Tank front glass (semi-transparent blue)
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(x + 2, y + 5, 28, 18);
        // Water upper (lighter blue)
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x + 2, y + 5, 28, 10);
        // Water line
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 2, y + 5, 28, 1);
        // Gravel at bottom
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(x + 2, y + 21, 28, 2);
        ctx.fillStyle = '#a07848';
        for (let gx = 0; gx < 28; gx += 3) {
            ctx.fillRect(x + 2 + gx, y + 21, 2, 1);
        }
        // Green aquatic plants
        ctx.fillStyle = '#22a84a';
        ctx.fillRect(x + 5, y + 16, 2, 6);
        ctx.fillRect(x + 8, y + 14, 1, 8);
        ctx.fillStyle = '#30c058';
        ctx.fillRect(x + 24, y + 15, 2, 7);
        ctx.fillRect(x + 22, y + 17, 1, 5);
        // Fish (2-3 colorful)
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.ellipse(x + 12, y + 11, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + 15, y + 11); ctx.lineTo(x + 17, y + 9.5); ctx.lineTo(x + 17, y + 12.5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.ellipse(x + 20, y + 15, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + 22, y + 15); ctx.lineTo(x + 24, y + 13.5); ctx.lineTo(x + 24, y + 16.5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.ellipse(x + 15, y + 18, 2, 1, 0, 0, Math.PI * 2); ctx.fill();
        // Bubbles
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.arc(x + 8, y + 8, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 7, y + 10, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 25, y + 9, 1, 0, Math.PI * 2); ctx.fill();
        // Glass reflection (left edge)
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 2, y + 6, 2, 12);
        // Light from above (bright top edge)
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 2, y + 4, 28, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 0, y + 4, 32, 1);
        ctx.fillRect(x + 0, y + 4, 1, 20);
        ctx.fillRect(x + 31, y + 4, 1, 20);
    }

    drawPaintingLandscape(ctx, x, y, T) {
        // 3D Isometric framed landscape painting
        // Frame shadow on wall
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 5, y + 4, 26, 22);
        // Dark wood frame (3D with inner shadow)
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(x + 3, y + 2, 26, 22);
        // Frame right edge (darker, depth)
        ctx.fillStyle = '#2a1a10';
        ctx.fillRect(x + 27, y + 2, 2, 22);
        // Frame bottom edge (darker)
        ctx.fillStyle = '#2a1a10';
        ctx.fillRect(x + 3, y + 22, 26, 2);
        // Frame inner
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 4, y + 3, 24, 20);
        // Frame highlight top-left
        ctx.fillStyle = '#6b4f2e';
        ctx.fillRect(x + 3, y + 2, 26, 1);
        ctx.fillRect(x + 3, y + 2, 1, 22);
        // Canvas: landscape
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(x + 5, y + 4, 22, 18);
        // Mountains
        ctx.fillStyle = '#4b5563';
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 18); ctx.lineTo(x + 12, y + 8); ctx.lineTo(x + 18, y + 14); ctx.lineTo(x + 24, y + 6); ctx.lineTo(x + 27, y + 18);
        ctx.closePath(); ctx.fill();
        // Snow caps (white mountain)
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x + 11, y + 8, 2, 2);
        ctx.fillRect(x + 23, y + 6, 2, 2);
        // Green trees base
        ctx.fillStyle = '#3d8b20';
        ctx.fillRect(x + 5, y + 18, 22, 4);
        // Sun
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x + 8, y + 7, 2, 0, Math.PI * 2); ctx.fill();
    }

    drawPaintingAbstract(ctx, x, y, T) {
        // 3D Isometric abstract art with golden frame
        // Frame shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 5, y + 4, 26, 22);
        // Golden/ornate frame
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(x + 3, y + 2, 26, 22);
        // Frame depth (darker right + bottom)
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(x + 27, y + 2, 2, 22);
        ctx.fillRect(x + 3, y + 22, 26, 2);
        // Frame highlight (top-left)
        ctx.fillStyle = '#d4a030';
        ctx.fillRect(x + 3, y + 2, 26, 1);
        ctx.fillRect(x + 3, y + 2, 1, 22);
        // Inner frame
        ctx.fillStyle = '#a07828';
        ctx.fillRect(x + 4, y + 3, 24, 20);
        // Canvas
        ctx.fillStyle = '#faf8f5';
        ctx.fillRect(x + 5, y + 4, 22, 18);
        // Geometric shapes (bright colors)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 7, y + 6, 8, 8);
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(x + 21, y + 10, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 18); ctx.lineTo(x + 18, y + 14); ctx.lineTo(x + 24, y + 20);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 7, y + 16, 4, 4);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x + 19, y + 16, 6, 2);
    }

    drawVendingMachine(ctx, x, y, T) {
        // 3D Isometric vending machine
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 12, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Side face (right, darker)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 26, y + 2, 3, 28);
        // Front face body
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 4, y + 2, 22, 28);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 5, y + 3, 20, 26);
        // Top surface
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 4, y + 1, 25, 2);
        ctx.fillStyle = '#5a6577';
        ctx.fillRect(x + 4, y + 1, 25, 1);
        // Display window (product display with colorful rows)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 6, y + 4, 13, 17);
        // Product rows
        const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                ctx.fillStyle = colors[(row * 3 + col) % colors.length];
                ctx.fillRect(x + 7 + col * 4, y + 5 + row * 5, 3, 3);
            }
        }
        // Control panel (selection buttons)
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 20, y + 6, 4, 13);
        // Coin slot
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 21, y + 8, 2, 3);
        // Selection buttons
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 21, y + 12, 2, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 21, y + 15, 2, 2);
        // Dispensing area at bottom
        ctx.fillStyle = '#111827';
        ctx.fillRect(x + 6, y + 22, 13, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 7, y + 22, 11, 1);
        // Top brand area
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 12, y + 2, 4, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 3, y + 1, 26, 1);
        ctx.fillRect(x + 3, y + 1, 1, 30);
        ctx.fillRect(x + 28, y + 1, 1, 30);
        ctx.fillRect(x + 3, y + 30, 26, 1);
    }

    drawArcadeMachine(ctx, x, y, T) {
        // 3D Isometric arcade cabinet
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 10, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Cabinet side face (right, darker)
        ctx.fillStyle = '#1a1848';
        ctx.fillRect(x + 24, y + 2, 3, 28);
        // Cabinet front body
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x + 6, y + 2, 18, 28);
        ctx.fillStyle = '#312e81';
        ctx.fillRect(x + 7, y + 3, 16, 26);
        // Top surface
        ctx.fillStyle = '#3d3a8f';
        ctx.fillRect(x + 6, y + 1, 21, 2);
        // Marquee on top (lit, colorful)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + 8, y + 2, 14, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 8, y + 2, 14, 1);
        // Screen (glowing with game graphics)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 8, y + 5, 14, 11);
        // Screen glow
        ctx.fillStyle = 'rgba(34,211,238,0.06)';
        ctx.fillRect(x + 8, y + 5, 14, 11);
        // Game pixels
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 13, y + 12, 4, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 10, y + 8, 2, 2);
        ctx.fillRect(x + 18, y + 6, 2, 2);
        ctx.fillStyle = '#fbbf24';
        for (let sx = 10; sx < 20; sx += 3) {
            ctx.fillRect(x + sx, y + 6, 1, 1);
        }
        // Control panel (3D: tilted surface)
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 8, y + 17, 14, 6);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 8, y + 17, 14, 2);
        // Joystick
        ctx.fillStyle = '#111827';
        ctx.fillRect(x + 11, y + 18, 2, 4);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(x + 12, y + 18, 1.5, 0, Math.PI * 2); ctx.fill();
        // 4 colored buttons
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.arc(x + 17, y + 19, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath(); ctx.arc(x + 20, y + 19.5, 1.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x + 17, y + 21.5, 1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(x + 20, y + 21.5, 1, 0, Math.PI * 2); ctx.fill();
        // Coin slot
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 13, y + 25, 4, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 5, y + 1, 22, 1);
        ctx.fillRect(x + 5, y + 1, 1, 30);
        ctx.fillRect(x + 26, y + 1, 1, 30);
    }

    drawPoolTable(ctx, x, y, T) {
        // 3D Isometric pool table
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 4, y + 6, 28, 25);
        // 4 dark wooden legs
        ctx.fillStyle = '#3d2b1f';
        ctx.fillRect(x + 4, y + 24, 2, 6);
        ctx.fillRect(x + 26, y + 24, 2, 6);
        ctx.fillRect(x + 4, y + 6, 2, 4);
        ctx.fillRect(x + 26, y + 6, 2, 4);
        // Front face (dark wood rail)
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 2, y + 22, 28, 4);
        // Front face darker shadow
        ctx.fillStyle = '#4a3018';
        ctx.fillRect(x + 2, y + 25, 28, 1);
        // Table side rail visible
        ctx.fillStyle = '#4a3018';
        ctx.fillRect(x + 28, y + 4, 2, 22);
        // Top surface frame (lighter wood rail)
        ctx.fillStyle = '#6b4a38';
        ctx.fillRect(x + 2, y + 3, 28, 2);
        ctx.fillRect(x + 2, y + 3, 2, 20);
        ctx.fillRect(x + 28, y + 3, 2, 2);
        // Green felt surface
        ctx.fillStyle = '#166534';
        ctx.fillRect(x + 4, y + 5, 24, 17);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 5, y + 6, 22, 15);
        // Pockets (4 dark circles at corners + 2 mid)
        ctx.fillStyle = '#111827';
        ctx.beginPath(); ctx.arc(x + 5, y + 6, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 27, y + 6, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 5, y + 21, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 27, y + 21, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 16, y + 6, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 16, y + 21, 1.5, 0, Math.PI * 2); ctx.fill();
        // Colored balls (6-8)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x + 12, y + 13, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(x + 20, y + 10, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e40af';
        ctx.beginPath(); ctx.arc(x + 18, y + 14, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(x + 22, y + 12, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath(); ctx.arc(x + 14, y + 16, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(x + 10, y + 10, 1.5, 0, Math.PI * 2); ctx.fill();
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 3, 30, 1);
        ctx.fillRect(x + 1, y + 3, 1, 23);
        ctx.fillRect(x + 30, y + 3, 1, 23);
    }

    drawPingPongTable(ctx, x, y, T) {
        // 3D Isometric ping pong table
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 4, y + 7, 28, 24);
        // Legs
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 5, y + 24, 2, 6);
        ctx.fillRect(x + 25, y + 24, 2, 6);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 5, y + 24, 1, 6);
        ctx.fillRect(x + 25, y + 24, 1, 6);
        // Front face (dark blue edge)
        ctx.fillStyle = '#1a3a8f';
        ctx.fillRect(x + 2, y + 22, 28, 3);
        // Top surface: blue with white lines
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(x + 2, y + 4, 28, 18);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x + 3, y + 5, 26, 16);
        // White border lines
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 3, y + 5, 26, 1);
        ctx.fillRect(x + 3, y + 20, 26, 1);
        ctx.fillRect(x + 3, y + 5, 1, 16);
        ctx.fillRect(x + 28, y + 5, 1, 16);
        // Center line
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 15, y + 5, 1, 16);
        // Net (thin line with small posts)
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x + 15, y + 3, 2, 19);
        // Net posts
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 2, y + 3, 2, 2);
        ctx.fillRect(x + 28, y + 3, 2, 2);
        // Net mesh texture
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        for (let ny = 4; ny < 22; ny += 2) {
            ctx.fillRect(x + 15, y + ny, 2, 1);
        }
        // Top surface highlight
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 3, y + 5, 12, 8);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 3, 30, 1);
        ctx.fillRect(x + 1, y + 3, 1, 22);
        ctx.fillRect(x + 30, y + 3, 1, 22);
    }

    drawKitchenCounter(ctx, x, y, T) {
        // 3D Isometric kitchen counter
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 3, y + 12, 30, 20);
        // Counter front face (cabinet doors)
        ctx.fillStyle = '#c8ccd4';
        ctx.fillRect(x + 1, y + 12, 30, 18);
        // Cabinet doors detail
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + 3, y + 14, 12, 14);
        ctx.fillRect(x + 17, y + 14, 12, 14);
        // Door divider
        ctx.fillStyle = '#b0b4bc';
        ctx.fillRect(x + 15, y + 14, 2, 14);
        // Handles
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 13, y + 20, 1, 3);
        ctx.fillRect(x + 18, y + 20, 1, 3);
        // Counter top surface (lighter)
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x + 1, y + 8, 30, 4);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 1, y + 8, 30, 1);
        // Front edge shadow
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 1, y + 11, 30, 1);
        // Sink basin
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 10, y + 9, 12, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 11, y + 9, 10, 1);
        // Faucet (3D)
        ctx.fillStyle = '#c0cdd8';
        ctx.fillRect(x + 15, y + 6, 2, 3);
        ctx.fillRect(x + 14, y + 5, 4, 2);
        ctx.fillStyle = '#d0dde8';
        ctx.fillRect(x + 14, y + 5, 4, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 0, y + 8, 32, 1);
        ctx.fillRect(x + 0, y + 8, 1, 22);
        ctx.fillRect(x + 31, y + 8, 1, 22);
    }

    drawMicrowave(ctx, x, y, T) {
        // 3D Isometric microwave on counter
        // Counter surface
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + 1, y + 20, 30, 10);
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x + 1, y + 28, 30, 2);
        // Microwave front face (darker)
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 4, y + 10, 24, 10);
        // Microwave top surface (lighter)
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 4, y + 6, 24, 4);
        // Top highlight
        ctx.fillStyle = '#5a6577';
        ctx.fillRect(x + 4, y + 6, 24, 1);
        // Side face (right)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 26, y + 6, 2, 14);
        // Window (door glass)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 6, y + 8, 14, 10);
        // Interior glow
        ctx.fillStyle = 'rgba(255,247,200,0.15)';
        ctx.fillRect(x + 7, y + 9, 12, 8);
        // Control panel
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 21, y + 8, 5, 10);
        // Display
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 22, y + 9, 3, 2);
        // Buttons
        ctx.fillStyle = '#9ca3af';
        for (let by = 0; by < 3; by++) {
            ctx.fillRect(x + 22, y + 13 + by * 2, 2, 1);
        }
        // Handle
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 20, y + 10, 1, 6);
        ctx.fillStyle = '#b0b8c4';
        ctx.fillRect(x + 20, y + 10, 1, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 3, y + 6, 25, 1);
        ctx.fillRect(x + 3, y + 6, 1, 14);
        ctx.fillRect(x + 27, y + 6, 1, 14);
    }

    drawReceptionDesk(ctx, x, y, T) {
        // 3D Isometric reception desk
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 3, y + 10, 30, 22);
        // Front panel (darker wood)
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 1, y + 10, 30, 20);
        ctx.fillStyle = '#6b4f2e';
        ctx.fillRect(x + 2, y + 11, 28, 18);
        // Front panel accent strip
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(x + 2, y + 16, 28, 2);
        // Logo/badge area
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x + 12, y + 20, 8, 6);
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(x + 13, y + 21, 6, 4);
        // Top surface (lighter wood)
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x + 1, y + 6, 30, 4);
        ctx.fillStyle = '#deb878';
        ctx.fillRect(x + 1, y + 6, 30, 2);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 1, y + 6, 30, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 0, y + 6, 32, 1);
        ctx.fillRect(x + 0, y + 6, 1, 25);
        ctx.fillRect(x + 31, y + 6, 1, 25);
        // Monitor on desk top (3D)
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 5, y + 1, 10, 5);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 6, y + 2, 8, 3);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 7, y + 3, 4, 1);
        // Monitor stand
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 8, y + 5, 4, 2);
    }

    drawBathroomSink(ctx, x, y, T) {
        // Wall background
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x, y, T, T);
        // Mirror
        ctx.fillStyle = '#bfdbfe';
        ctx.fillRect(x + 8, y + 1, 16, 12);
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(x + 9, y + 2, 14, 10);
        // Mirror reflection
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x + 10, y + 3, 3, 6);
        // Sink basin
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x + 6, y + 16, 20, 6);
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x + 8, y + 17, 16, 4);
        // Faucet
        ctx.fillStyle = '#c0cdd8';
        ctx.fillRect(x + 15, y + 14, 2, 3);
        ctx.fillRect(x + 13, y + 13, 6, 2);
        // Pedestal
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x + 13, y + 22, 6, 8);
        // Drain
        ctx.fillStyle = '#6b7280';
        ctx.beginPath(); ctx.arc(x + 16, y + 19, 1, 0, Math.PI * 2); ctx.fill();
    }

    drawServerRack(ctx, x, y, T) {
        // 3D Isometric server rack
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 6, y + 3, 26, 30);
        // Side face (right, darker)
        ctx.fillStyle = '#111827';
        ctx.fillRect(x + 26, y + 1, 3, 30);
        // Front face (black cabinet)
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 4, y + 1, 22, 30);
        ctx.fillStyle = '#16202e';
        ctx.fillRect(x + 5, y + 2, 20, 28);
        // Top surface
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 4, y + 0, 25, 2);
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 4, y + 0, 25, 1);
        // Server rack units with 3D depth
        for (let su = 0; su < 5; su++) {
            const sy = 3 + su * 5;
            // Unit front face
            ctx.fillStyle = '#374151';
            ctx.fillRect(x + 6, y + sy, 18, 4);
            ctx.fillStyle = '#4b5563';
            ctx.fillRect(x + 7, y + sy + 1, 16, 2);
            // Ventilation grilles (horizontal lines)
            ctx.fillStyle = '#1f2937';
            for (let vx = 0; vx < 4; vx++) {
                ctx.fillRect(x + 8 + vx * 4, y + sy + 1, 2, 2);
            }
            // Blinking LEDs (tiny colored dots)
            const ledColors = ['#22c55e', '#22c55e', '#f59e0b', '#22c55e', '#ef4444'];
            ctx.fillStyle = ledColors[su];
            ctx.fillRect(x + 22, y + sy + 1, 1, 1);
            ctx.fillStyle = su % 2 === 0 ? '#3b82f6' : 'rgba(59,130,246,0.3)';
            ctx.fillRect(x + 22, y + sy + 2, 1, 1);
        }
        // Cable management (bottom)
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 26, y + 28, 2, 3);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 3, y + 0, 26, 1);
        ctx.fillRect(x + 3, y + 0, 1, 31);
        ctx.fillRect(x + 28, y + 0, 1, 31);
    }

    // ==========================================
    // MORE FURNITURE (IDs 88-99)
    // ==========================================

    drawProjectorScreen(ctx, x, y, T) {
        // 3D Isometric projector screen
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Stand pole (3D)
        ctx.fillStyle = '#7a8290';
        ctx.fillRect(x + 15, y + 24, 2, 7);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 15, y + 24, 1, 7);
        // Base (3D)
        ctx.fillStyle = '#5a6270';
        ctx.fillRect(x + 10, y + 29, 12, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 10, y + 29, 12, 1);
        // Screen housing (3D box)
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 2, y + 2, 28, 3);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 2, y + 1, 28, 1);
        // Screen (white, with subtle border)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + 3, y + 5, 26, 19);
        // Screen bottom edge (shadow/weight bar)
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x + 3, y + 23, 26, 1);
        // Projected content
        ctx.fillStyle = 'rgba(59,130,246,0.08)';
        ctx.fillRect(x + 5, y + 7, 22, 14);
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 6, y + 8, 10, 2);
        ctx.fillRect(x + 6, y + 12, 14, 1);
        ctx.fillRect(x + 6, y + 15, 8, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 1, 30, 1);
        ctx.fillRect(x + 2, y + 1, 1, 23);
        ctx.fillRect(x + 29, y + 1, 1, 23);
    }

    drawPodium(ctx, x, y, T) {
        // 3D Isometric podium
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 10, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Base (3D)
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 7, y + 28, 18, 3);
        ctx.fillStyle = '#6b4f2e';
        ctx.fillRect(x + 7, y + 27, 18, 1);
        // Body front face (darker wood)
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(x + 8, y + 10, 16, 18);
        // Front panel inset
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(x + 10, y + 12, 12, 14);
        ctx.fillStyle = '#c89b5e';
        ctx.fillRect(x + 11, y + 13, 10, 12);
        // Side face (right, darker)
        ctx.fillStyle = '#6b5010';
        ctx.fillRect(x + 24, y + 6, 2, 22);
        // Top surface (lighter)
        ctx.fillStyle = '#deb878';
        ctx.fillRect(x + 7, y + 4, 19, 4);
        ctx.fillStyle = '#e8c888';
        ctx.fillRect(x + 7, y + 4, 19, 1);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 7, y + 4, 19, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 7, y + 4, 19, 1);
        ctx.fillRect(x + 7, y + 4, 1, 24);
        ctx.fillRect(x + 25, y + 4, 1, 24);
        // Microphone (3D)
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 15, y + 1, 2, 4);
        ctx.fillStyle = '#4b5563';
        ctx.beginPath(); ctx.arc(x + 16, y + 1, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5a6577';
        ctx.beginPath(); ctx.arc(x + 15, y + 0.5, 1, 0, Math.PI * 2); ctx.fill();
    }

    drawYogaMat(ctx, x, y, T) {
        // 3D Isometric yoga mat with rolled edge
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 5, y + 4, 24, 28);
        // Mat body (slight height from floor)
        ctx.fillStyle = '#6d28d9';
        ctx.fillRect(x + 4, y + 3, 24, 27);
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(x + 4, y + 2, 24, 26);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x + 5, y + 3, 22, 24);
        // Center line
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 15, y + 4, 2, 22);
        // Mat texture lines
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        for (let my = 4; my < 26; my += 3) {
            ctx.fillRect(x + 5, y + my, 22, 1);
        }
        // Rolled edge at top (3D cylinder)
        ctx.fillStyle = '#5b1fc5';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 3, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6d28d9';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 2, 10, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 1.5, 9, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Highlight on roll
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.ellipse(x + 13, y + 1, 4, 1, 0, 0, Math.PI * 2); ctx.fill();
    }

    drawTreadmill(ctx, x, y, T) {
        // 3D Isometric treadmill
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 5, y + 18, 24, 13);
        // Base/belt (3D: front face darker)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 4, y + 22, 24, 8);
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 4, y + 16, 24, 6);
        // Belt surface (top)
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 5, y + 17, 22, 4);
        // Belt texture
        ctx.fillStyle = '#111827';
        for (let by = 17; by < 21; by += 2) {
            ctx.fillRect(x + 6, y + by, 20, 1);
        }
        // Upright posts (3D)
        ctx.fillStyle = '#5a6270';
        ctx.fillRect(x + 6, y + 2, 2, 16);
        ctx.fillRect(x + 24, y + 2, 2, 16);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 6, y + 2, 1, 16);
        ctx.fillRect(x + 24, y + 2, 1, 16);
        // Console (3D)
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 8, y + 3, 16, 8);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 8, y + 2, 16, 1);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 9, y + 3, 14, 6);
        // Display content
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 10, y + 4, 4, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 16, y + 4, 3, 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 10, y + 7, 8, 1);
        // Handlebars
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 5, y + 10, 3, 2);
        ctx.fillRect(x + 24, y + 10, 3, 2);
        ctx.fillStyle = '#b0b8c4';
        ctx.fillRect(x + 5, y + 10, 3, 1);
        ctx.fillRect(x + 24, y + 10, 3, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 3, y + 16, 26, 1);
        ctx.fillRect(x + 3, y + 16, 1, 14);
        ctx.fillRect(x + 28, y + 16, 1, 14);
    }

    drawLocker(ctx, x, y, T) {
        // 3D Isometric locker
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 8, y + 4, 22, 28);
        // Side face (right, darker)
        ctx.fillStyle = '#5a6270';
        ctx.fillRect(x + 24, y + 2, 3, 28);
        // Front face
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 6, y + 2, 18, 28);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 7, y + 3, 16, 26);
        // Top surface
        ctx.fillStyle = '#7a8494';
        ctx.fillRect(x + 6, y + 1, 21, 2);
        ctx.fillStyle = '#8a94a4';
        ctx.fillRect(x + 6, y + 1, 21, 1);
        // Door divider
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 14, y + 3, 2, 26);
        // Vents top
        ctx.fillStyle = '#4b5563';
        for (let vx = 0; vx < 3; vx++) {
            ctx.fillRect(x + 8 + vx * 2, y + 4, 1, 3);
            ctx.fillRect(x + 17 + vx * 2, y + 4, 1, 3);
        }
        // Handles
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 12, y + 14, 1, 4);
        ctx.fillRect(x + 17, y + 14, 1, 4);
        // Feet
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 7, y + 29, 3, 2);
        ctx.fillRect(x + 20, y + 29, 3, 2);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 5, y + 1, 22, 1);
        ctx.fillRect(x + 5, y + 1, 1, 30);
        ctx.fillRect(x + 26, y + 1, 1, 30);
    }

    drawBenchOutdoor(ctx, x, y, T) {
        // 3D Isometric outdoor bench — transparent background
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 4, y + 22, 26, 7);
        // Metal legs (3D)
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 5, y + 20, 2, 9);
        ctx.fillRect(x + 25, y + 20, 2, 9);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 5, y + 20, 1, 9);
        ctx.fillRect(x + 25, y + 20, 1, 9);
        // Seat front face (darker wood)
        ctx.fillStyle = '#a07848';
        ctx.fillRect(x + 3, y + 19, 26, 3);
        // Seat top surface (lighter wood planks)
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x + 3, y + 16, 26, 3);
        ctx.fillStyle = '#c89b5e';
        ctx.fillRect(x + 3, y + 17, 26, 1);
        // Seat highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 3, y + 16, 26, 1);
        // Backrest (3D planks with front face)
        ctx.fillStyle = '#a07848';
        ctx.fillRect(x + 4, y + 12, 24, 2);
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x + 4, y + 10, 24, 2);
        ctx.fillStyle = '#c89b5e';
        ctx.fillRect(x + 4, y + 11, 24, 1);
        ctx.fillStyle = '#a07848';
        ctx.fillRect(x + 4, y + 15, 24, 1);
        ctx.fillStyle = '#d4a76a';
        ctx.fillRect(x + 4, y + 13, 24, 2);
        // Highlight on backrest
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 4, y + 10, 24, 1);
    }

    drawLamppost(ctx, x, y, T) {
        // 3D Isometric lamppost — transparent background
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Base (3D)
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 12, y + 28, 8, 3);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 12, y + 27, 8, 1);
        // Pole (3D cylinder)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 15, y + 8, 2, 20);
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 15, y + 8, 1, 20);
        // Lamp head (3D)
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 10, y + 6, 12, 3);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 10, y + 6, 12, 1);
        // Light (glowing bottom)
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(x + 11, y + 8, 10, 2);
        // Light glow
        ctx.fillStyle = 'rgba(255,247,200,0.3)';
        ctx.beginPath(); ctx.arc(x + 16, y + 10, 6, 0, Math.PI * 2); ctx.fill();
        // Top finial (3D)
        ctx.fillStyle = '#5a6270';
        ctx.fillRect(x + 14, y + 4, 4, 3);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 14, y + 4, 4, 1);
    }

    drawTrashCan(ctx, x, y, T) {
        // 3D Isometric trash can
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Can body front face (darker)
        ctx.fillStyle = '#5a6270';
        ctx.fillRect(x + 9, y + 14, 14, 15);
        // Can body side (right, darker)
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 21, y + 11, 2, 18);
        // Can body main
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 9, y + 10, 12, 18);
        // Highlight (left, light source)
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 9, y + 11, 2, 16);
        // Lid (3D: top face + front edge)
        ctx.fillStyle = '#3d4553';
        ctx.fillRect(x + 8, y + 10, 16, 2);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 8, y + 8, 16, 2);
        ctx.fillStyle = '#5a6577';
        ctx.fillRect(x + 8, y + 8, 16, 1);
        // Handle on lid
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 14, y + 6, 4, 3);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 14, y + 6, 4, 1);
        // Recycle symbol
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 13, y + 17, 4, 4);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 8, y + 6, 16, 1);
        ctx.fillRect(x + 8, y + 8, 1, 21);
        ctx.fillRect(x + 23, y + 8, 1, 21);
    }

    drawFireExtinguisher(ctx, x, y, T) {
        // 3D Isometric fire extinguisher
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Base (3D)
        ctx.fillStyle = '#7a1414';
        ctx.fillRect(x + 11, y + 27, 10, 3);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x + 11, y + 27, 10, 1);
        // Body front face (darker red)
        ctx.fillStyle = '#b81c1c';
        ctx.fillRect(x + 11, y + 14, 10, 14);
        // Body cylinder (main, lighter)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 11, y + 10, 10, 18);
        // Highlight (left, light source)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 11, y + 11, 2, 16);
        // Shadow (right)
        ctx.fillStyle = '#b81c1c';
        ctx.fillRect(x + 19, y + 11, 2, 16);
        // Top valve (3D)
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x + 12, y + 6, 8, 5);
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 12, y + 6, 8, 2);
        // Handle
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 14, y + 4, 4, 3);
        ctx.fillRect(x + 18, y + 5, 4, 2);
        // Nozzle
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 20, y + 3, 2, 3);
        // Hose
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 21, y + 5, 4, 1);
        ctx.fillRect(x + 24, y + 5, 1, 6);
        // Label (3D)
        ctx.fillStyle = '#fef2f2';
        ctx.fillRect(x + 13, y + 16, 6, 4);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 14, y + 17, 4, 2);
        // Pressure gauge
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath(); ctx.arc(x + 16, y + 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 16, y + 7, 1, 2);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 10, y + 6, 12, 1);
        ctx.fillRect(x + 10, y + 10, 1, 18);
        ctx.fillRect(x + 21, y + 10, 1, 18);
    }

    drawWallClock(ctx, x, y, T) {
        // 3D Isometric wall clock
        // Wall background hint
        ctx.fillStyle = 'rgba(58,69,86,0.3)';
        ctx.fillRect(x, y, T, T);
        // Clock shadow on wall
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.arc(x + 17, y + 17, 12, 0, Math.PI * 2); ctx.fill();
        // Clock body (3D ring: outer darker, inner lighter)
        ctx.fillStyle = '#111827';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 2); ctx.fill();
        // Frame highlight top-left
        ctx.fillStyle = '#2d3748';
        ctx.beginPath(); ctx.arc(x + 15, y + 15, 12, Math.PI, Math.PI * 1.5); ctx.fill();
        // Clock face
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 10, 0, Math.PI * 2); ctx.fill();
        // Hour markers
        ctx.fillStyle = '#1f2937';
        for (let h = 0; h < 12; h++) {
            const angle = (h * 30 - 90) * Math.PI / 180;
            const mx = 16 + Math.cos(angle) * 8.5;
            const my = 16 + Math.sin(angle) * 8.5;
            ctx.fillRect(x + mx - 0.5, y + my - 0.5, 1, 1);
        }
        // Hour hand
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 15.5, y + 10, 1, 6);
        // Minute hand
        ctx.fillStyle = '#374151';
        ctx.fillRect(x + 16, y + 8, 0.5, 8);
        // Second hand
        ctx.fillStyle = '#ef4444';
        ctx.save();
        ctx.translate(x + 16, y + 16);
        ctx.rotate(Math.PI / 3);
        ctx.fillRect(-0.25, -8, 0.5, 8);
        ctx.restore();
        // Center dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 1, 0, Math.PI * 2); ctx.fill();
        // Glass highlight
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.arc(x + 13, y + 12, 5, 0, Math.PI * 2); ctx.fill();
    }

    drawACUnit(ctx, x, y, T) {
        // 3D Isometric AC unit on wall
        // Wall background
        ctx.fillStyle = 'rgba(58,69,86,0.3)';
        ctx.fillRect(x, y, T, T);
        // Shadow below unit
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 3, y + 10, 28, 14);
        // AC body front face (lower part, darker)
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x + 2, y + 14, 28, 8);
        // AC body top surface (lighter)
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(x + 2, y + 8, 28, 6);
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(x + 3, y + 9, 26, 4);
        // Top edge highlight
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(x + 2, y + 8, 28, 1);
        // Vent slats on front face
        ctx.fillStyle = '#9ca3af';
        for (let vy = 0; vy < 3; vy++) {
            ctx.fillRect(x + 4, y + 15 + vy * 2, 24, 1);
        }
        // LED indicator
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 26, y + 10, 2, 1);
        // Brand logo area
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x + 12, y + 10, 8, 2);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 1, y + 8, 30, 1);
        ctx.fillRect(x + 1, y + 8, 1, 14);
        ctx.fillRect(x + 30, y + 8, 1, 14);
        ctx.fillRect(x + 1, y + 21, 30, 1);
        // Air flow effect
        ctx.fillStyle = 'rgba(59,130,246,0.06)';
        ctx.fillRect(x + 6, y + 23, 20, 3);
        ctx.fillRect(x + 8, y + 26, 16, 2);
    }

    drawMonitorFront(ctx, x, y, T) {
        // 3D Isometric monitor for depth layer (renders in front of player)
        // Monitor bezel (3D thin with edge)
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 4, y + 1, 24, 17);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 5, y + 2, 22, 15);
        // Screen with code/dashboard
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 6, y + 3, 20, 13);
        // Screen content
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x + 7, y + 4, 8, 1);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(x + 7, y + 6, 12, 1);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 7, y + 8, 6, 1);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(x + 14, y + 8, 5, 1);
        ctx.fillStyle = '#fb923c';
        ctx.fillRect(x + 7, y + 10, 10, 1);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x + 7, y + 12, 14, 1);
        // Screen glow
        ctx.fillStyle = 'rgba(96,165,250,0.06)';
        ctx.fillRect(x + 6, y + 3, 20, 13);
        // Stand/base visible (3D)
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 14, y + 18, 4, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 14, y + 18, 4, 1);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 11, y + 20, 10, 2);
        ctx.fillStyle = '#b0b8c4';
        ctx.fillRect(x + 11, y + 20, 10, 1);
        // Bezel highlight
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 5, y + 2, 22, 1);
    }

    // ==========================================
    // LARGE TABLES + VARIANTS (IDs 100-111)
    // ==========================================

    drawConferenceTableTL(ctx, x, y, T) {
        // 3D Isometric conference table top-left quadrant
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 3, y + 4, 30, 30);
        // Front face edge (darker)
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(x + 2, y + 28, 30, 4);
        // Table surface
        ctx.fillStyle = '#5c3d2e';
        ctx.fillRect(x + 2, y + 2, 30, 26);
        ctx.fillStyle = '#6b4a38';
        ctx.fillRect(x + 3, y + 3, 29, 24);
        // Wood grain
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 6, y + 8, 20, 1);
        ctx.fillRect(x + 4, y + 18, 24, 1);
        // Leg
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 3, y + 3, 2, 2);
        // Edge highlight (top-left)
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 2, y + 2, 30, 1);
        ctx.fillRect(x + 2, y + 2, 1, 26);
    }

    drawConferenceTableTR(ctx, x, y, T) {
        // 3D conference table top-right
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y + 4, 30, 30);
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(x, y + 28, 30, 4);
        ctx.fillStyle = '#5c3d2e';
        ctx.fillRect(x, y + 2, 30, 26);
        ctx.fillStyle = '#6b4a38';
        ctx.fillRect(x, y + 3, 29, 24);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 4, y + 8, 20, 1);
        ctx.fillRect(x + 2, y + 18, 24, 1);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 27, y + 3, 2, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x, y + 2, 30, 1);
    }

    drawConferenceTableBL(ctx, x, y, T) {
        // 3D conference table bottom-left
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 3, y + 2, 30, 30);
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(x + 2, y + 26, 30, 4);
        ctx.fillStyle = '#5c3d2e';
        ctx.fillRect(x + 2, y, 30, 26);
        ctx.fillStyle = '#6b4a38';
        ctx.fillRect(x + 3, y, 29, 25);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 6, y + 10, 20, 1);
        ctx.fillRect(x + 4, y + 20, 24, 1);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 3, y + 27, 2, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 2, y, 1, 26);
    }

    drawConferenceTableBR(ctx, x, y, T) {
        // 3D conference table bottom-right
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 1, y + 2, 30, 30);
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(x, y + 26, 30, 4);
        ctx.fillStyle = '#5c3d2e';
        ctx.fillRect(x, y, 30, 26);
        ctx.fillStyle = '#6b4a38';
        ctx.fillRect(x, y, 29, 25);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 4, y + 10, 20, 1);
        ctx.fillRect(x + 2, y + 20, 24, 1);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 27, y + 27, 2, 2);
    }

    drawDeskLLeft(ctx, x, y, T) {
        // 3D Isometric L-desk left portion
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 3, y + 10, 30, 22);
        // Legs
        ctx.fillStyle = '#7a8290';
        ctx.fillRect(x + 2, y + 24, 2, 7);
        ctx.fillRect(x + 28, y + 28, 2, 3);
        // Front face (darker)
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 1, y + 14, 30, 6);
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 20, y + 14, 12, 16);
        // Top surface
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(x + 1, y + 8, 30, 6);
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(x + 20, y + 8, 12, 12);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 1, y + 8, 30, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 0, y + 8, 32, 1);
        // Monitor (3D)
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 6, y + 0, 14, 8);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 7, y + 1, 12, 6);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x + 8, y + 2, 6, 1);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 8, y + 4, 8, 1);
    }

    drawDeskLRight(ctx, x, y, T) {
        // 3D Isometric L-desk right portion
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x, y + 10, 30, 22);
        // Legs
        ctx.fillStyle = '#7a8290';
        ctx.fillRect(x + 28, y + 24, 2, 7);
        ctx.fillRect(x + 2, y + 28, 2, 3);
        // Front face (darker)
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 1, y + 14, 30, 6);
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x, y + 14, 12, 16);
        // Top surface
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(x + 1, y + 8, 30, 6);
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(x, y + 8, 12, 12);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 1, y + 8, 30, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x, y + 8, 32, 1);
        // Keyboard on surface
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 10, y + 10, 12, 3);
        ctx.fillStyle = '#374151';
        for (let ky = 0; ky < 2; ky++) {
            for (let kx = 0; kx < 5; kx++) {
                ctx.fillRect(x + 11 + kx * 2, y + 10.5 + ky * 1.2, 1.5, 0.8);
            }
        }
    }

    drawDeskDualMonitor(ctx, x, y, T) {
        // 3D Isometric desk with dual monitors
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Legs
        ctx.fillStyle = '#7a8290';
        ctx.fillRect(x + 2, y + 26, 2, 5);
        ctx.fillRect(x + 28, y + 26, 2, 5);
        // Desk front face (darker)
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 1, y + 17, 30, 7);
        // Desk top surface
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(x + 1, y + 11, 30, 6);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 1, y + 11, 30, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 0, y + 11, 32, 1);
        // Monitor 1 (3D)
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 2, y + 0, 13, 10);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 3, y + 1, 11, 8);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x + 4, y + 2, 5, 1);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(x + 4, y + 4, 8, 1);
        // Monitor 2 (3D)
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 17, y + 0, 13, 10);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 18, y + 1, 11, 8);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 19, y + 2, 6, 1);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(x + 19, y + 4, 8, 1);
        // Shared stand (3D)
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 14, y + 9, 4, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 14, y + 9, 4, 1);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 11, y + 11, 10, 1);
        // Keyboard
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(x + 8, y + 13, 14, 3);
        ctx.fillStyle = '#374151';
        for (let kx = 0; kx < 6; kx++) {
            ctx.fillRect(x + 9 + kx * 2, y + 13.5, 1.5, 0.8);
        }
    }

    drawRoundTable(ctx, x, y, T) {
        // 3D Isometric round table
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
        // Pedestal (3D)
        ctx.fillStyle = '#6b4a28';
        ctx.fillRect(x + 14, y + 22, 4, 6);
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(x + 14, y + 22, 2, 6);
        // Base
        ctx.fillStyle = '#5a3f22';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 28, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6b4f2e';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 27, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Table edge (front face, darker ring)
        ctx.fillStyle = '#b8860b';
        ctx.beginPath(); ctx.arc(x + 16, y + 16, 12, 0, Math.PI); ctx.fill();
        // Table top surface (lighter)
        ctx.fillStyle = '#d4a76a';
        ctx.beginPath(); ctx.arc(x + 16, y + 15, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#deb878';
        ctx.beginPath(); ctx.arc(x + 16, y + 14, 10, 0, Math.PI * 2); ctx.fill();
        // Wood grain rings
        ctx.fillStyle = 'rgba(184,134,11,0.1)';
        ctx.beginPath(); ctx.arc(x + 16, y + 14, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 16, y + 14, 3, 0, Math.PI * 2); ctx.fill();
        // Highlight (top-left)
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.arc(x + 12, y + 11, 4, 0, Math.PI * 2); ctx.fill();
        // Dark outline
        ctx.strokeStyle = '#1a1c2e';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(x + 16, y + 15, 11.5, 0, Math.PI * 2); ctx.stroke();
    }

    drawBarCounter(ctx, x, y, T) {
        // 3D Isometric bar counter
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 1, y + 8, T, 24);
        // Front panel (darker wood)
        ctx.fillStyle = '#5c3d2e';
        ctx.fillRect(x, y + 12, T, 18);
        ctx.fillStyle = '#6b4a38';
        ctx.fillRect(x + 1, y + 13, T - 2, 16);
        // Panel detail (inset rectangles)
        ctx.fillStyle = '#5a3f22';
        ctx.fillRect(x + 2, y + 14, 12, 14);
        ctx.fillRect(x + 16, y + 14, 14, 14);
        // Counter top surface (lighter marble)
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x, y + 6, T, 6);
        // Top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x, y + 6, T, 1);
        // Front edge of counter top (darker)
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(x, y + 11, T, 1);
        // Foot rail (3D chrome bar)
        ctx.fillStyle = '#a0adb8';
        ctx.fillRect(x, y + 26, T, 2);
        ctx.fillStyle = '#c0cdd8';
        ctx.fillRect(x, y + 26, T, 1);
        // Dark outline
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x, y + 6, T, 1);
    }

    drawBarStool(ctx, x, y, T) {
        // 3D Isometric bar stool
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 29, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        // Legs (4 angled, 3D)
        ctx.fillStyle = '#7a8290';
        ctx.fillRect(x + 8, y + 18, 2, 11);
        ctx.fillRect(x + 22, y + 18, 2, 11);
        ctx.fillRect(x + 12, y + 20, 2, 9);
        ctx.fillRect(x + 18, y + 20, 2, 9);
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x + 8, y + 18, 1, 11);
        ctx.fillRect(x + 22, y + 18, 1, 11);
        // Foot ring (3D)
        ctx.fillStyle = '#5a6270';
        ctx.fillRect(x + 9, y + 24, 14, 2);
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 9, y + 24, 14, 1);
        // Seat front face (darker)
        ctx.fillStyle = '#1a2332';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 17, 8, 3, 0, 0, Math.PI); ctx.fill();
        // Seat top surface (lighter)
        ctx.fillStyle = '#1f2937';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 15, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2d3a48';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 14, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        // Seat highlight (top-left)
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.ellipse(x + 13, y + 13, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    }

    drawFountainBase(ctx, x, y, T) {
        // Transparent background — ground layer shows through
        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 28, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
        // Stone base — front face (darker)
        ctx.fillStyle = '#7d8490';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 24, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
        // Stone base — front wall thickness
        ctx.fillStyle = '#7d8490';
        ctx.fillRect(x + 2, y + 20, 28, 5);
        // Stone base — top face (lighter)
        ctx.fillStyle = '#b0b7c3';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
        // Inner basin — front face
        ctx.fillStyle = '#6b7280';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 21, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
        // Water pool — deep
        ctx.fillStyle = '#2980b9';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 20, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
        // Water pool — surface highlight
        ctx.fillStyle = '#5dade2';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 19, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
        // Center pillar — front face (darker)
        ctx.fillStyle = '#7d8490';
        ctx.fillRect(x + 14, y + 12, 4, 9);
        // Center pillar — left face highlight
        ctx.fillStyle = '#b0b7c3';
        ctx.fillRect(x + 14, y + 12, 2, 9);
        // Top-left highlight on stone rim
        ctx.fillStyle = 'rgba(255,255,255,0.13)';
        ctx.beginPath(); ctx.ellipse(x + 13, y + 18, 6, 3, 0, 0, Math.PI); ctx.fill();
        // Ripples on water
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.ellipse(x + 16, y + 19, 6, 3, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x + 16, y + 19, 3, 1.5, 0, 0, Math.PI * 2); ctx.stroke();
        // Dark outline on base rim
        ctx.fillStyle = '#1a1c2e';
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 24, 14, 8, 0, 0, Math.PI);
        ctx.fill();
        // Redraw front face over outline bottom
        ctx.fillStyle = '#7d8490';
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 24, 13, 7, 0, 0, Math.PI);
        ctx.fill();
    }

    drawFountainTop(ctx, x, y, T) {
        // Pillar — front face (darker)
        ctx.fillStyle = '#7d8490';
        ctx.fillRect(x + 14, y + 20, 4, 12);
        // Pillar — left highlight
        ctx.fillStyle = '#b0b7c3';
        ctx.fillRect(x + 14, y + 20, 2, 12);
        // Pillar — dark outline left
        ctx.fillStyle = '#1a1c2e';
        ctx.fillRect(x + 13, y + 20, 1, 12);
        // Upper bowl — front face (darker stone)
        ctx.fillStyle = '#7d8490';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 21, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
        // Upper bowl — wall thickness
        ctx.fillStyle = '#7d8490';
        ctx.fillRect(x + 6, y + 18, 20, 4);
        // Upper bowl — top face (lighter stone)
        ctx.fillStyle = '#b0b7c3';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
        // Inner basin recess
        ctx.fillStyle = '#6b7280';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
        // Water in upper bowl — deep
        ctx.fillStyle = '#2980b9';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
        // Water in upper bowl — surface
        ctx.fillStyle = '#5dade2';
        ctx.beginPath(); ctx.ellipse(x + 16, y + 17, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Water spray — main jet
        ctx.fillStyle = 'rgba(93,173,226,0.55)';
        ctx.fillRect(x + 15, y + 4, 2, 13);
        // Water spray — side streams
        ctx.fillStyle = 'rgba(93,173,226,0.3)';
        ctx.fillRect(x + 14, y + 6, 1, 8);
        ctx.fillRect(x + 17, y + 6, 1, 8);
        // Spray droplets — bright white
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x + 15, y + 2, 1, 2);
        ctx.fillRect(x + 16, y + 3, 1, 1);
        ctx.fillRect(x + 13, y + 8, 1, 1);
        ctx.fillRect(x + 18, y + 7, 1, 1);
        ctx.fillRect(x + 12, y + 12, 1, 1);
        ctx.fillRect(x + 19, y + 11, 1, 1);
        // Bowl rim highlight (top-left light)
        ctx.fillStyle = 'rgba(255,255,255,0.13)';
        ctx.beginPath(); ctx.ellipse(x + 13, y + 16, 5, 2, 0, 0, Math.PI); ctx.fill();
        // Ripple on bowl water
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.ellipse(x + 16, y + 17, 4, 2, 0, 0, Math.PI * 2); ctx.stroke();
        // Dark outline on bowl rim bottom
        ctx.fillStyle = '#1a1c2e';
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 21, 10, 5, 0, 0, Math.PI);
        ctx.fill();
        // Redraw front face to clean outline overlap
        ctx.fillStyle = '#7d8490';
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 21, 9, 4, 0, 0, Math.PI);
        ctx.fill();
    }

    // ==========================================
    // ANIMATION FRAMES (IDs 112-119)
    // ==========================================

    drawWaterFrame0(ctx, x, y, T) {
        this._drawWaterFrame(ctx, x, y, T, 0);
    }

    drawWaterFrame1(ctx, x, y, T) {
        this._drawWaterFrame(ctx, x, y, T, 1);
    }

    drawWaterFrame2(ctx, x, y, T) {
        this._drawWaterFrame(ctx, x, y, T, 2);
    }

    drawWaterFrame3(ctx, x, y, T) {
        this._drawWaterFrame(ctx, x, y, T, 3);
    }

    drawAquariumFrame1(ctx, x, y, T) {
        // Same aquarium but fish shifted
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 1, y + 4, 30, 24);
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(x + 2, y + 5, 28, 22);
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x + 2, y + 5, 28, 12);
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(x + 2, y + 24, 28, 3);
        // Fish shifted right
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.ellipse(x + 14, y + 14, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + 17, y + 14); ctx.lineTo(x + 19, y + 12); ctx.lineTo(x + 19, y + 16); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.ellipse(x + 18, y + 10, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        // Bubbles shifted
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(x + 12, y + 7, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 24, y + 11, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 3, y + 6, 2, 10);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 4, y + 28, 2, 3);
        ctx.fillRect(x + 26, y + 28, 2, 3);
    }

    drawAquariumFrame2(ctx, x, y, T) {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(x + 1, y + 4, 30, 24);
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(x + 2, y + 5, 28, 22);
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x + 2, y + 5, 28, 12);
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(x + 2, y + 24, 28, 3);
        // Fish shifted more
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.ellipse(x + 20, y + 10, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + 23, y + 10); ctx.lineTo(x + 25, y + 8); ctx.lineTo(x + 25, y + 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.ellipse(x + 10, y + 16, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(x + 16, y + 6, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 8, y + 9, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 3, y + 6, 2, 10);
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(x + 4, y + 28, 2, 3);
        ctx.fillRect(x + 26, y + 28, 2, 3);
    }

    drawEmpty(ctx, x, y, T) {
        // Transparent / empty tile — do nothing
    }

    // =============================================
    // MULTI-TILE OBJECTS (IDs 120-141)
    // 3/4 top-down perspective: top=surface, bottom=front face (3D height)
    // =============================================

    // --- DESK 2x2 (IDs 120-123) — Computer workstation ---
    // 5-color ramp: DARKEST #2A1A0A, DARK #5A3A20, MID #8A6A4A, LIGHT #C9A876, HIGHLIGHT #E8CBA8

    drawDesk2x2_TL(ctx, x, y, T) {
        const surf = '#C9A876';
        const surfGrain = '#B89860';
        const outline = '#2A1A0A';
        const bg = '#1a1c2e';

        // Background
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline top of desk
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 10, T, 1);

        // Desk surface fills bottom area (y+11 to y+32) — seamless with BL
        ctx.fillStyle = surf;
        ctx.fillRect(x, y + 11, T, 21);
        // Surface highlight
        ctx.fillStyle = '#E8CBA8';
        ctx.fillRect(x + 1, y + 11, 30, 1);
        // Wood grain
        ctx.fillStyle = surfGrain;
        ctx.fillRect(x + 2, y + 18, 28, 1);
        ctx.fillRect(x + 5, y + 25, 22, 1);

        // Monitor (code editor)
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 2, y + 0, 22, 13);
        ctx.fillStyle = '#0a1e0a';
        ctx.fillRect(x + 3, y + 1, 20, 10);
        // Code lines
        ctx.fillStyle = '#33ff66';
        ctx.fillRect(x + 5, y + 2, 12, 1);
        ctx.fillStyle = '#66ccff';
        ctx.fillRect(x + 7, y + 4, 8, 1);
        ctx.fillStyle = '#33ff66';
        ctx.fillRect(x + 5, y + 6, 14, 1);
        ctx.fillStyle = '#ffcc33';
        ctx.fillRect(x + 7, y + 8, 10, 1);
        ctx.fillStyle = '#66ccff';
        ctx.fillRect(x + 5, y + 10, 7, 1);
        // Stand
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 10, y + 13, 6, 2);
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 8, y + 15, 10, 1);

        // Desk lamp (right side)
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 27, y + 14, 2, 12);
        ctx.fillStyle = '#ffd633';
        ctx.fillRect(x + 24, y + 11, 8, 3);
        ctx.fillStyle = 'rgba(255,220,50,0.12)';
        ctx.fillRect(x + 23, y + 14, 9, 8);

        // Phone on desk
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 2, y + 22, 4, 3);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 3, y + 23, 2, 1);

        // Left outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 10, 1, 22);
    }

    drawDesk2x2_TR(ctx, x, y, T) {
        const surf = '#C9A876';
        const surfGrain = '#B89860';
        const outline = '#2A1A0A';
        const bg = '#1a1c2e';
        const sideSurf = '#8A6A40';  // right side over surface

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline top
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 10, T, 1);

        // Surface
        ctx.fillStyle = surf;
        ctx.fillRect(x, y + 11, 28, 21);  // width=28, leave 4px for side
        ctx.fillStyle = '#E8CBA8';
        ctx.fillRect(x + 1, y + 11, 27, 1);
        ctx.fillStyle = surfGrain;
        ctx.fillRect(x + 4, y + 20, 22, 1);
        ctx.fillRect(x + 1, y + 28, 24, 1);

        // RIGHT SIDE FACE — 4px (x+28 to x+32), surface zone
        ctx.fillStyle = sideSurf;
        ctx.fillRect(x + 28, y + 11, 4, 21);
        // Side highlight (top edge)
        ctx.fillStyle = '#9A7A50';
        ctx.fillRect(x + 28, y + 11, 4, 1);
        // Right outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 10, 1, 22);

        // Monitor (dashboard) — stays within x+0..x+27
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 4, y + 0, 20, 13);
        ctx.fillStyle = '#0a0a1e';
        ctx.fillRect(x + 5, y + 1, 18, 10);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 7, y + 7, 3, 3);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x + 11, y + 4, 3, 6);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 15, y + 6, 3, 4);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x + 19, y + 5, 3, 5);
        // Stand
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 11, y + 13, 6, 2);
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 9, y + 15, 10, 1);

        // Coffee mug
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x + 2, y + 17, 5, 6);
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(x + 2, y + 17, 5, 2);
        ctx.fillStyle = '#3e1f0d';
        ctx.fillRect(x + 3, y + 17, 3, 1);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 7, y + 19, 2, 2);

        // Sticky notes
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(x + 2, y + 25, 5, 5);
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(x + 5, y + 27, 5, 4);

        // Pen holder (moved left to not overlap side)
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 22, y + 21, 5, 5);
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(x + 23, y + 18, 1, 4);
        ctx.fillStyle = '#f44336';
        ctx.fillRect(x + 25, y + 19, 1, 3);
    }

    drawDesk2x2_BL(ctx, x, y, T) {
        const surf = '#C9A876';
        const surfGrain = '#B89860';
        const edge = '#8A6A4A';
        const front = '#5A3A20';
        const frontLight = '#6A4A30';
        const outline = '#2A1A0A';
        const highlight = '#E8CBA8';
        const bg = '#1a1c2e';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Surface continues (y+0 to y+6) — seamless with TL
        ctx.fillStyle = surf;
        ctx.fillRect(x, y, T, 6);
        ctx.fillStyle = surfGrain;
        ctx.fillRect(x + 3, y + 3, 20, 1);
        // Left outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y, 1, 6);

        // Keyboard
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 3, y + 0, 16, 5);
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x + 4, y + 1, 14, 3);
        ctx.fillStyle = '#444';
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 7; col++) {
                ctx.fillRect(x + 5 + col * 2, y + 1 + row * 2, 1, 1);
            }
        }

        // Mouse
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 22, y + 0, 8, 5);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 24, y + 1, 4, 3);
        ctx.fillStyle = '#bbb';
        ctx.fillRect(x + 24, y + 2, 4, 1);

        // Edge lip (2px) — bright highlight
        ctx.fillStyle = edge;
        ctx.fillRect(x, y + 6, T, 2);
        ctx.fillStyle = highlight;
        ctx.fillRect(x + 1, y + 6, 30, 1);

        // FRONT FACE — large, dark (14px: y+8 to y+22)
        ctx.fillStyle = front;
        ctx.fillRect(x, y + 8, T, 14);
        // Outline left
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 6, 1, 16);
        // Lighter panel inset
        ctx.fillStyle = frontLight;
        ctx.fillRect(x + 2, y + 9, 28, 12);
        // Drawer divider
        ctx.fillStyle = front;
        ctx.fillRect(x + 2, y + 15, 28, 1);
        // Top drawer handle
        ctx.fillStyle = '#999';
        ctx.fillRect(x + 12, y + 11, 8, 2);
        ctx.fillStyle = '#bbb';
        ctx.fillRect(x + 13, y + 11, 6, 1);
        // Bottom drawer handle
        ctx.fillStyle = '#999';
        ctx.fillRect(x + 12, y + 17, 8, 2);
        ctx.fillStyle = '#bbb';
        ctx.fillRect(x + 13, y + 17, 6, 1);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 22, T, 1);

        // Desk legs
        ctx.fillStyle = outline;
        ctx.fillRect(x + 1, y + 23, 3, 5);
        ctx.fillStyle = '#3A2A1A';
        ctx.fillRect(x + 2, y + 23, 1, 5);

        // Floor shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y + 28, T, 4);
    }

    drawDesk2x2_BR(ctx, x, y, T) {
        const surf = '#C9A876';
        const surfGrain = '#B89860';
        const edge = '#8A6A4A';
        const front = '#5A3A20';
        const frontLight = '#6A4A30';
        const outline = '#2A1A0A';
        const highlight = '#E8CBA8';
        const bg = '#1a1c2e';
        const sideSurf = '#8A6A40';   // right side over surface
        const sideEdge = '#6A4A30';   // right side over edge
        const sideFront = '#3A2010';  // right side over front (darkest)

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Surface continues (y+0 to y+6), width=28
        ctx.fillStyle = surf;
        ctx.fillRect(x, y, 28, 6);
        ctx.fillStyle = surfGrain;
        ctx.fillRect(x + 6, y + 3, 16, 1);

        // RIGHT SIDE — surface zone (y+0 to y+6)
        ctx.fillStyle = sideSurf;
        ctx.fillRect(x + 28, y, 4, 6);

        // Notepad (inside 28px area)
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(x + 2, y + 0, 8, 5);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 3, y + 1, 6, 1);
        ctx.fillRect(x + 3, y + 3, 5, 1);

        // Pencil
        ctx.fillStyle = '#f4d03f';
        ctx.fillRect(x + 12, y + 2, 8, 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 12, y + 2, 2, 2);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 19, y + 2, 2, 2);

        // Small plant (moved left)
        ctx.fillStyle = '#5a3520';
        ctx.fillRect(x + 22, y + 2, 5, 3);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 22, y + 0, 2, 3);
        ctx.fillRect(x + 24, y + 0, 2, 3);
        ctx.fillRect(x + 26, y + 1, 2, 2);

        // Edge lip (width=28)
        ctx.fillStyle = edge;
        ctx.fillRect(x, y + 6, 28, 2);
        ctx.fillStyle = highlight;
        ctx.fillRect(x + 1, y + 6, 27, 1);
        // RIGHT SIDE — edge zone
        ctx.fillStyle = sideEdge;
        ctx.fillRect(x + 28, y + 6, 4, 2);

        // FRONT FACE — 14px (y+8 to y+22), width=28
        ctx.fillStyle = front;
        ctx.fillRect(x, y + 8, 28, 14);
        // Panel inset
        ctx.fillStyle = frontLight;
        ctx.fillRect(x + 2, y + 9, 25, 12);
        ctx.fillStyle = front;
        ctx.fillRect(x + 2, y + 15, 25, 1);
        // Drawer handles
        ctx.fillStyle = '#999';
        ctx.fillRect(x + 10, y + 11, 8, 2);
        ctx.fillStyle = '#bbb';
        ctx.fillRect(x + 11, y + 11, 6, 1);
        ctx.fillStyle = '#999';
        ctx.fillRect(x + 10, y + 17, 8, 2);
        ctx.fillStyle = '#bbb';
        ctx.fillRect(x + 11, y + 17, 6, 1);
        // Front face gradient: lighter top, darker bottom
        ctx.fillStyle = '#6A4A30';
        ctx.fillRect(x + 1, y + 8, 27, 1);
        ctx.fillStyle = '#4A2A10';
        ctx.fillRect(x + 1, y + 21, 27, 1);

        // RIGHT SIDE — front zone (DARKEST)
        ctx.fillStyle = sideFront;
        ctx.fillRect(x + 28, y + 8, 4, 14);
        // Side gradient
        ctx.fillStyle = '#4A3018';
        ctx.fillRect(x + 28, y + 8, 4, 1);
        ctx.fillStyle = '#2A1808';
        ctx.fillRect(x + 28, y + 21, 4, 1);

        // Right outline (full height)
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y, 1, 22);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 22, T, 1);

        // Desk leg (right)
        ctx.fillStyle = outline;
        ctx.fillRect(x + 28, y + 23, 3, 5);

        // Cable
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 15, y + 23, 1, 3);

        // Floor shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y + 28, T, 4);
    }

    // --- SOFA 2x1 (IDs 124-125) — Two-seater sofa ---
    // Ramp: outline #1A1A2A, dark #2A2A3A, mid #4A4A5A, light #6A6A7A, highlight #8A8A9A

    drawSofa2x1_L(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#1A1A2A';
        const backDark = '#2E2E3E';
        const backLight = '#4A4A5A';
        const seatLight = '#6A6A7A';
        const seatHi = '#7A7A8A';
        const frontDark = '#222233';
        const armDark = '#252538';
        const armLight = '#3A3A4A';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline top
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 1, T, 1);

        // Sofa back (y+2 to y+11)
        ctx.fillStyle = backDark;
        ctx.fillRect(x + 4, y + 2, 28, 9);
        ctx.fillStyle = backLight;
        ctx.fillRect(x + 6, y + 3, 24, 4);
        ctx.fillStyle = '#555568';
        ctx.fillRect(x + 6, y + 3, 24, 1);
        // Stitching
        ctx.fillStyle = '#252538';
        ctx.fillRect(x + 16, y + 3, 1, 7);

        // Left armrest
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 2, 1, 22);
        ctx.fillStyle = armDark;
        ctx.fillRect(x + 0, y + 3, 6, 20);
        ctx.fillStyle = armLight;
        ctx.fillRect(x + 1, y + 3, 4, 2);
        ctx.fillStyle = '#3E3E50';
        ctx.fillRect(x + 1, y + 5, 4, 16);

        // Seat cushion surface (y+11 to y+20)
        ctx.fillStyle = seatLight;
        ctx.fillRect(x + 4, y + 11, 28, 9);
        ctx.fillStyle = seatHi;
        ctx.fillRect(x + 6, y + 11, 24, 2);
        ctx.fillStyle = '#5A5A6A';
        ctx.fillRect(x + 6, y + 16, 24, 1);

        // Pillow (warm orange)
        ctx.fillStyle = '#e07050';
        ctx.fillRect(x + 8, y + 9, 8, 7);
        ctx.fillStyle = '#f08060';
        ctx.fillRect(x + 9, y + 9, 6, 2);
        ctx.fillStyle = '#c85a3a';
        ctx.fillRect(x + 9, y + 14, 6, 2);

        // FRONT FACE (y+20 to y+28) — 8px, dark
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 20, T, 1);
        ctx.fillStyle = frontDark;
        ctx.fillRect(x, y + 21, T, 7);
        ctx.fillStyle = '#2E2E40';
        ctx.fillRect(x + 1, y + 21, 30, 1);
        // Fabric texture
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let i = 0; i < 8; i++) ctx.fillRect(x + 2 + i * 4, y + 22, 3, 5);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 28, T, 1);

        // Legs
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(x + 2, y + 29, 3, 3);
        ctx.fillRect(x + 14, y + 29, 3, 3);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x, y + 30, T, 2);
    }

    drawSofa2x1_R(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#1A1A2A';
        const backDark = '#2E2E3E';
        const backLight = '#4A4A5A';
        const seatLight = '#6A6A7A';
        const seatHi = '#7A7A8A';
        const frontDark = '#222233';
        const sideBack = '#1E1E2E';   // right side back zone
        const sideSeat = '#4A4A5A';   // right side seat zone
        const sideFront = '#151520';  // right side front zone (darkest)

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline top
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 1, T, 1);

        // Sofa back (width=28)
        ctx.fillStyle = backDark;
        ctx.fillRect(x, y + 2, 28, 9);
        ctx.fillStyle = backLight;
        ctx.fillRect(x + 2, y + 3, 24, 4);
        ctx.fillStyle = '#555568';
        ctx.fillRect(x + 2, y + 3, 24, 1);
        ctx.fillStyle = '#252538';
        ctx.fillRect(x + 14, y + 3, 1, 7);

        // RIGHT SIDE — back zone
        ctx.fillStyle = sideBack;
        ctx.fillRect(x + 28, y + 2, 4, 9);
        ctx.fillStyle = '#252538';
        ctx.fillRect(x + 28, y + 2, 4, 1);

        // Seat cushion surface (width=28)
        ctx.fillStyle = seatLight;
        ctx.fillRect(x, y + 11, 28, 9);
        ctx.fillStyle = seatHi;
        ctx.fillRect(x + 2, y + 11, 24, 2);
        ctx.fillStyle = '#5A5A6A';
        ctx.fillRect(x + 2, y + 16, 24, 1);

        // RIGHT SIDE — seat zone
        ctx.fillStyle = sideSeat;
        ctx.fillRect(x + 28, y + 11, 4, 9);

        // Pillow (blue, moved left of side)
        ctx.fillStyle = '#5090d0';
        ctx.fillRect(x + 14, y + 9, 8, 7);
        ctx.fillStyle = '#60a0e0';
        ctx.fillRect(x + 15, y + 9, 6, 2);
        ctx.fillStyle = '#4080c0';
        ctx.fillRect(x + 15, y + 14, 6, 2);

        // FRONT FACE (width=28)
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 20, 28, 1);
        ctx.fillStyle = frontDark;
        ctx.fillRect(x, y + 21, 28, 7);
        ctx.fillStyle = '#2E2E40';
        ctx.fillRect(x + 1, y + 21, 27, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let i = 0; i < 7; i++) ctx.fillRect(x + 2 + i * 4, y + 22, 3, 5);

        // RIGHT SIDE — front zone (DARKEST)
        ctx.fillStyle = outline;
        ctx.fillRect(x + 28, y + 20, 4, 1);
        ctx.fillStyle = sideFront;
        ctx.fillRect(x + 28, y + 21, 4, 7);
        ctx.fillStyle = '#1A1A28';
        ctx.fillRect(x + 28, y + 21, 4, 1);

        // Right outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 1, 1, 27);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 28, T, 1);

        // Legs
        ctx.fillStyle = '#5a4030';
        ctx.fillRect(x + 15, y + 29, 3, 3);
        ctx.fillRect(x + 26, y + 29, 3, 3);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x, y + 30, T, 2);
    }

    // --- AQUARIUM 2x1 (IDs 126-127) — Fish tank on stand ---
    // Stand ramp: #2A1A0A, #4A3020, #6A5040, #8A7060

    drawAquarium2x1_L(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1A0A';
        const standFront = '#4A3020';
        const standTop = '#6A5040';
        const frame = '#333';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Tank frame (outline top)
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 1, T, 1);
        // Top rim
        ctx.fillStyle = frame;
        ctx.fillRect(x + 0, y + 2, T, 2);

        // Tank glass
        ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
        ctx.fillRect(x + 1, y + 4, 31, 18);

        // Water highlight at top
        ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.fillRect(x + 2, y + 4, 29, 3);
        ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
        ctx.fillRect(x + 2, y + 5, 29, 1);

        // Gravel
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 2, y + 19, 29, 3);
        ctx.fillStyle = '#7a6245';
        ctx.fillRect(x + 4, y + 20, 3, 1);
        ctx.fillRect(x + 20, y + 20, 4, 1);

        // Plants
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 5, y + 11, 2, 8);
        ctx.fillRect(x + 4, y + 9, 2, 4);
        ctx.fillRect(x + 6, y + 13, 2, 4);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x + 14, y + 13, 2, 6);
        ctx.fillRect(x + 13, y + 10, 2, 5);

        // Fish (orange)
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(x + 20, y + 9, 5, 3);
        ctx.fillStyle = '#d35400';
        ctx.fillRect(x + 18, y + 10, 2, 1);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 24, y + 9, 1, 1);

        // Fish (blue)
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 8, y + 15, 4, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 8, y + 15, 1, 1);

        // Bubbles
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x + 22, y + 6, 2, 2);
        ctx.fillRect(x + 24, y + 8, 1, 1);

        // Left frame
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 0, y + 2, 2, 20);

        // Stand top surface
        ctx.fillStyle = standTop;
        ctx.fillRect(x, y + 22, T, 2);
        ctx.fillStyle = '#7A6050';
        ctx.fillRect(x + 1, y + 22, 30, 1);

        // Stand FRONT FACE (y+24 to y+30) — 6px dark
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 24, T, 1);
        ctx.fillStyle = standFront;
        ctx.fillRect(x, y + 24, T, 6);
        ctx.fillStyle = '#3A2010';
        ctx.fillRect(x + 1, y + 28, 30, 1);

        // Legs
        ctx.fillStyle = outline;
        ctx.fillRect(x + 2, y + 30, 3, 2);
        ctx.fillRect(x + 16, y + 30, 3, 2);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x, y + 31, T, 1);
    }

    drawAquarium2x1_R(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1A0A';
        const standFront = '#4A3020';
        const standTop = '#6A5040';
        const frame = '#333';
        const sideFrame = '#222';       // right side tank frame (darkest)
        const sideStandTop = '#4A3020'; // right side stand surface
        const sideStandFront = '#2A1A0A'; // right side stand front (darkest)

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Tank frame top
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 1, T, 1);
        ctx.fillStyle = frame;
        ctx.fillRect(x, y + 2, 28, 2);

        // RIGHT SIDE — frame zone
        ctx.fillStyle = sideFrame;
        ctx.fillRect(x + 28, y + 2, 4, 2);

        // Tank glass (width=28)
        ctx.fillStyle = 'rgba(52, 152, 219, 0.7)';
        ctx.fillRect(x, y + 4, 28, 18);

        // RIGHT SIDE — glass zone (darker tint)
        ctx.fillStyle = 'rgba(20, 80, 140, 0.8)';
        ctx.fillRect(x + 28, y + 4, 4, 18);

        // Water highlight
        ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.fillRect(x + 1, y + 4, 26, 3);
        ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
        ctx.fillRect(x + 1, y + 5, 26, 1);

        // Gravel
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + 1, y + 19, 26, 3);
        ctx.fillStyle = '#7a6245';
        ctx.fillRect(x + 6, y + 20, 3, 1);

        // Coral
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x + 6, y + 15, 4, 4);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 7, y + 14, 2, 2);

        // Plants
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 20, y + 12, 2, 7);
        ctx.fillRect(x + 19, y + 10, 2, 4);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x + 21, y + 14, 2, 4);

        // Fish (yellow)
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 14, y + 8, 4, 2);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x + 18, y + 8, 2, 1);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 14, y + 8, 1, 1);

        // Fish (pink)
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(x + 4, y + 12, 4, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 7, y + 12, 1, 1);

        // Filter (moved left to stay within glass)
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 23, y + 5, 4, 7);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 24, y + 6, 2, 5);

        // Light
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 2, y + 4, 22, 2);

        // Right outline (full tank height)
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 1, 1, 21);

        // Stand top surface (width=28)
        ctx.fillStyle = standTop;
        ctx.fillRect(x, y + 22, 28, 2);
        ctx.fillStyle = '#7A6050';
        ctx.fillRect(x + 1, y + 22, 27, 1);
        // RIGHT SIDE — stand top
        ctx.fillStyle = sideStandTop;
        ctx.fillRect(x + 28, y + 22, 4, 2);

        // Stand FRONT FACE (width=28)
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 24, 28, 1);
        ctx.fillStyle = standFront;
        ctx.fillRect(x, y + 24, 28, 6);
        ctx.fillStyle = '#3A2010';
        ctx.fillRect(x + 1, y + 28, 27, 1);

        // RIGHT SIDE — stand front (DARKEST)
        ctx.fillStyle = sideStandFront;
        ctx.fillRect(x + 28, y + 24, 4, 6);
        // Right outline stand
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 22, 1, 8);

        // Legs
        ctx.fillStyle = outline;
        ctx.fillRect(x + 13, y + 30, 3, 2);
        ctx.fillRect(x + 27, y + 30, 3, 2);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x, y + 31, T, 1);
    }

    // --- POOL TABLE 2x2 (IDs 128-131) ---
    // Rail ramp: outline #2A1808, dark #4A2810, mid #6A4830, light #8A6848, hi #A08060

    drawPoolTable_TL(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1808';
        const railDark = '#6A4830';
        const railHi = '#8A6848';
        const felt = '#1a6b3a';
        const feltHi = '#1d7a42';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 2, y + 3, 30, 1);
        ctx.fillRect(x + 2, y + 3, 1, 29);

        // Top rail
        ctx.fillStyle = railDark;
        ctx.fillRect(x + 3, y + 4, 29, 4);
        ctx.fillStyle = railHi;
        ctx.fillRect(x + 3, y + 4, 29, 1);
        // Left rail
        ctx.fillStyle = railDark;
        ctx.fillRect(x + 3, y + 4, 4, 28);
        ctx.fillStyle = railHi;
        ctx.fillRect(x + 3, y + 4, 1, 28);

        // Corner pocket
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 3, y + 4, 5, 5);
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 4, y + 5, 3, 3);

        // Felt
        ctx.fillStyle = felt;
        ctx.fillRect(x + 7, y + 8, 25, 24);
        ctx.fillStyle = feltHi;
        ctx.fillRect(x + 10, y + 12, 18, 1);
        ctx.fillRect(x + 12, y + 20, 14, 1);

        // Balls
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 16, y + 14, 3, 3);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x + 16, y + 16, 3, 1);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 22, y + 18, 3, 3);
        ctx.fillStyle = '#d4ac0d';
        ctx.fillRect(x + 22, y + 20, 3, 1);
    }

    drawPoolTable_TR(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1808';
        const railDark = '#6A4830';
        const railHi = '#8A6848';
        const felt = '#1a6b3a';
        const feltHi = '#1d7a42';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 3, 30, 1);
        ctx.fillRect(x + 29, y + 3, 1, 29);

        // Top rail
        ctx.fillStyle = railDark;
        ctx.fillRect(x, y + 4, 29, 4);
        ctx.fillStyle = railHi;
        ctx.fillRect(x, y + 4, 29, 1);
        // Right rail
        ctx.fillStyle = railDark;
        ctx.fillRect(x + 25, y + 4, 4, 28);
        ctx.fillStyle = railHi;
        ctx.fillRect(x + 28, y + 4, 1, 28);

        // Corner pocket
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 24, y + 4, 5, 5);
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 25, y + 5, 3, 3);

        // Side pocket
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 25, y + 26, 4, 5);
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 26, y + 27, 2, 3);

        // Felt
        ctx.fillStyle = felt;
        ctx.fillRect(x, y + 8, 25, 24);
        ctx.fillStyle = feltHi;
        ctx.fillRect(x + 4, y + 14, 18, 1);
        ctx.fillRect(x + 2, y + 24, 16, 1);

        // Balls
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x + 10, y + 16, 3, 3);
        ctx.fillStyle = '#1a6fa0';
        ctx.fillRect(x + 10, y + 18, 3, 1);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(x + 18, y + 12, 3, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 18, y + 13, 3, 1);
    }

    drawPoolTable_BL(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1808';
        const railDark = '#6A4830';
        const railHi = '#8A6848';
        const felt = '#1a6b3a';
        const feltHi = '#1d7a42';
        const frontDark = '#3A1808';
        const frontMid = '#4A2810';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Left rail
        ctx.fillStyle = railDark;
        ctx.fillRect(x + 3, y, 4, 14);
        ctx.fillStyle = railHi;
        ctx.fillRect(x + 3, y, 1, 14);
        // Left outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 2, y, 1, 14);

        // Felt
        ctx.fillStyle = felt;
        ctx.fillRect(x + 7, y, 25, 14);
        ctx.fillStyle = feltHi;
        ctx.fillRect(x + 10, y + 6, 18, 1);

        // Bottom rail
        ctx.fillStyle = railDark;
        ctx.fillRect(x + 3, y + 14, 29, 4);
        ctx.fillStyle = railHi;
        ctx.fillRect(x + 3, y + 14, 29, 1);

        // Corner pocket
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 3, y + 13, 5, 5);
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 4, y + 14, 3, 3);

        // Cue ball
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(x + 18, y + 6, 3, 3);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 18, y + 8, 3, 1);

        // Edge outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 2, y + 18, 30, 1);

        // FRONT FACE (y+19 to y+27) — 8px
        ctx.fillStyle = frontMid;
        ctx.fillRect(x + 2, y + 19, 30, 8);
        ctx.fillStyle = '#5A3818';
        ctx.fillRect(x + 3, y + 19, 28, 1);
        // Decorative trim
        ctx.fillStyle = '#6A4828';
        ctx.fillRect(x + 4, y + 22, 26, 1);
        // Left outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 2, y + 18, 1, 9);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 2, y + 27, 30, 1);

        // Legs
        ctx.fillStyle = frontDark;
        ctx.fillRect(x + 4, y + 28, 4, 3);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 2, y + 30, 30, 2);
    }

    drawPoolTable_BR(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1808';
        const railDark = '#6A4830';
        const railHi = '#8A6848';
        const felt = '#1a6b3a';
        const feltHi = '#1d7a42';
        const frontDark = '#3A1808';
        const frontMid = '#4A2810';
        const sideFront = '#2A1808';  // right side on front face

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Right rail (upper, acts as side face for surface area)
        ctx.fillStyle = railDark;
        ctx.fillRect(x + 25, y, 4, 14);
        ctx.fillStyle = railHi;
        ctx.fillRect(x + 28, y, 1, 14);
        ctx.fillStyle = outline;
        ctx.fillRect(x + 29, y, 1, 14);

        // Felt
        ctx.fillStyle = felt;
        ctx.fillRect(x, y, 25, 14);
        ctx.fillStyle = feltHi;
        ctx.fillRect(x + 4, y + 4, 16, 1);
        ctx.fillRect(x + 2, y + 10, 20, 1);

        // Bottom rail
        ctx.fillStyle = railDark;
        ctx.fillRect(x, y + 14, 29, 4);
        ctx.fillStyle = railHi;
        ctx.fillRect(x, y + 14, 29, 1);

        // Corner pocket
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 24, y + 13, 5, 5);
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 25, y + 14, 3, 3);

        // Cue stick
        ctx.fillStyle = '#c8a868';
        ctx.fillRect(x + 6, y + 2, 1, 10);
        ctx.fillStyle = '#f0e0c0';
        ctx.fillRect(x + 6, y + 1, 1, 2);

        // Edge outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 18, T, 1);

        // FRONT FACE (y+19 to y+27, width=28)
        ctx.fillStyle = frontMid;
        ctx.fillRect(x, y + 19, 28, 8);
        ctx.fillStyle = '#5A3818';
        ctx.fillRect(x + 1, y + 19, 26, 1);
        ctx.fillStyle = '#6A4828';
        ctx.fillRect(x + 2, y + 22, 24, 1);

        // RIGHT SIDE — front zone (4px, darkest)
        ctx.fillStyle = sideFront;
        ctx.fillRect(x + 28, y + 19, 4, 8);
        ctx.fillStyle = '#3A2010';
        ctx.fillRect(x + 28, y + 19, 4, 1);

        // Right outline (full)
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 18, 1, 9);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 27, T, 1);

        // Legs
        ctx.fillStyle = frontDark;
        ctx.fillRect(x + 24, y + 28, 4, 3);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x, y + 30, T, 2);
    }

    // --- PING PONG TABLE 2x2 (IDs 132-135) ---
    // Ramp: outline #0A2050, dark #0D47A1, mid #1565C0, light #1976D0, hi #2196F3

    drawPingPong_TL(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#0A2050';
        const surf = '#1565c0';
        const surfHi = '#1976d0';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 1, y + 5, 31, 1);
        ctx.fillRect(x + 1, y + 5, 1, 27);

        // Surface
        ctx.fillStyle = surf;
        ctx.fillRect(x + 2, y + 6, 30, 26);
        // White edges
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 2, y + 6, 30, 1);
        ctx.fillRect(x + 2, y + 6, 1, 26);
        // Center line
        ctx.fillRect(x + 2, y + 18, 30, 1);
        // Texture
        ctx.fillStyle = surfHi;
        ctx.fillRect(x + 6, y + 10, 22, 1);
        ctx.fillRect(x + 8, y + 24, 18, 1);

        // Net post
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 30, y + 16, 2, 5);
    }

    drawPingPong_TR(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#0A2050';
        const surf = '#1565c0';
        const surfHi = '#1976d0';
        const sideSurf = '#0A3570';  // right side over surface

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline top
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 5, T, 1);

        // Surface (width=28, leave 4px for side)
        ctx.fillStyle = surf;
        ctx.fillRect(x, y + 6, 28, 26);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y + 6, 28, 1);
        ctx.fillRect(x + 27, y + 6, 1, 26);
        ctx.fillRect(x, y + 18, 28, 1);

        // RIGHT SIDE FACE — 4px (x+28 to x+31)
        ctx.fillStyle = sideSurf;
        ctx.fillRect(x + 28, y + 6, 4, 26);
        ctx.fillStyle = '#1050A0';
        ctx.fillRect(x + 28, y + 6, 4, 1);
        // Right outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y + 5, 1, 27);

        // Net
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(x, y + 17, 28, 1);
        ctx.fillRect(x, y + 19, 28, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        for (let nx = 0; nx < 14; nx++) ctx.fillRect(x + nx * 2, y + 17, 1, 3);

        // Net post
        ctx.fillStyle = '#888';
        ctx.fillRect(x, y + 16, 2, 5);

        ctx.fillStyle = surfHi;
        ctx.fillRect(x + 4, y + 12, 20, 1);
        ctx.fillRect(x + 6, y + 26, 16, 1);
    }

    drawPingPong_BL(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#0A2050';
        const surf = '#1565c0';
        const frontDark = '#0A3570';
        const frontMid = '#0D47A1';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Left outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 1, y, 1, 12);

        // Surface
        ctx.fillStyle = surf;
        ctx.fillRect(x + 2, y, 30, 12);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 2, y, 1, 12);
        ctx.fillRect(x + 2, y + 11, 30, 1);

        // Paddle (red)
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(x + 10, y + 2, 7, 5);
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(x + 11, y + 3, 5, 3);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 12, y + 7, 3, 3);

        // Edge outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 1, y + 12, 31, 1);

        // FRONT FACE (y+13 to y+21) — 8px
        ctx.fillStyle = frontMid;
        ctx.fillRect(x + 1, y + 13, 31, 8);
        ctx.fillStyle = '#1558b8';
        ctx.fillRect(x + 2, y + 13, 29, 1);
        // Left outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 1, y + 12, 1, 9);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x + 1, y + 21, 31, 1);

        // Legs
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 4, y + 22, 2, 8);
        ctx.fillRect(x + 18, y + 22, 2, 8);
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 4, y + 26, 16, 1);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x + 2, y + 29, 28, 2);
    }

    drawPingPong_BR(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#0A2050';
        const surf = '#1565c0';
        const frontMid = '#0D47A1';
        const sideSurf = '#0A3570';   // right side over surface
        const sideFront = '#082D70';  // right side over front (darkest)

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Surface (width=28, leave 4px for side)
        ctx.fillStyle = surf;
        ctx.fillRect(x, y, 28, 12);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 27, y, 1, 12);
        ctx.fillRect(x, y + 11, 28, 1);

        // RIGHT SIDE — surface zone
        ctx.fillStyle = sideSurf;
        ctx.fillRect(x + 28, y, 4, 12);
        ctx.fillStyle = '#1050A0';
        ctx.fillRect(x + 28, y + 11, 4, 1);

        // Ball
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 20, y + 5, 3, 3);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 20, y + 7, 3, 1);

        // Paddle (blue)
        ctx.fillStyle = '#1976d0';
        ctx.fillRect(x + 4, y + 3, 7, 5);
        ctx.fillStyle = '#0d47a1';
        ctx.fillRect(x + 5, y + 4, 5, 3);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 6, y + 8, 3, 3);

        // Edge outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 12, T, 1);

        // FRONT FACE (width=28)
        ctx.fillStyle = frontMid;
        ctx.fillRect(x, y + 13, 28, 8);
        ctx.fillStyle = '#1558b8';
        ctx.fillRect(x + 1, y + 13, 27, 1);

        // RIGHT SIDE — front zone (DARKEST)
        ctx.fillStyle = sideFront;
        ctx.fillRect(x + 28, y + 13, 4, 8);
        ctx.fillStyle = '#0A3570';
        ctx.fillRect(x + 28, y + 13, 4, 1);

        // Right outline full height
        ctx.fillStyle = outline;
        ctx.fillRect(x + 31, y, 1, 21);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 21, T, 1);

        // Legs
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 12, y + 22, 2, 8);
        ctx.fillRect(x + 24, y + 22, 2, 8);
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 12, y + 26, 14, 1);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x + 2, y + 29, 26, 2);
    }

    // --- BOOKSHELF 1x2 (IDs 136-137) ---
    // Wood ramp: outline #2A1A0A, dark #4A3218, mid #6A4A2A, light #8A6A4A, hi #A08060

    drawBookshelf2_Top(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1A0A';
        const woodDark = '#4A3218';
        const woodMid = '#6A4A2A';
        const woodLight = '#8A6A4A';
        const back = '#3A2210';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Full outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y, T, 1);
        ctx.fillRect(x, y, 1, T);
        ctx.fillRect(x + 31, y, 1, T);

        // Top surface (crown)
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 1, y + 1, 30, 2);
        ctx.fillStyle = '#A08060';
        ctx.fillRect(x + 1, y + 1, 30, 1);

        // Side panels
        ctx.fillStyle = woodDark;
        ctx.fillRect(x + 1, y + 3, 2, 29);
        ctx.fillRect(x + 29, y + 3, 2, 29);

        // Back panel
        ctx.fillStyle = back;
        ctx.fillRect(x + 3, y + 3, 26, 29);

        // Top shelf
        ctx.fillStyle = woodMid;
        ctx.fillRect(x + 3, y + 14, 26, 2);
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 3, y + 14, 26, 1);
        // Books
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x + 4, y + 5, 3, 9);
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x + 8, y + 4, 3, 10);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 12, y + 6, 2, 8);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 15, y + 5, 3, 9);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(x + 19, y + 3, 2, 11);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(x + 22, y + 6, 3, 8);
        ctx.fillStyle = '#1abc9c';
        ctx.fillRect(x + 26, y + 5, 2, 9);

        // Middle shelf
        ctx.fillStyle = woodMid;
        ctx.fillRect(x + 3, y + 28, 26, 2);
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 3, y + 28, 26, 1);
        // Books + globe
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 4, y + 18, 2, 10);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 7, y + 19, 3, 9);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 11, y + 17, 3, 11);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x + 15, y + 20, 2, 8);
        // Globe
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x + 20, y + 21, 5, 5);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 21, y + 22, 3, 3);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 22, y + 26, 1, 2);
    }

    drawBookshelf2_Bot(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A1A0A';
        const woodDark = '#4A3218';
        const woodMid = '#6A4A2A';
        const woodLight = '#8A6A4A';
        const back = '#3A2210';
        const frontDark = '#3A2210';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Side outlines
        ctx.fillStyle = outline;
        ctx.fillRect(x, y, 1, T);
        ctx.fillRect(x + 31, y, 1, T);

        // Side panels
        ctx.fillStyle = woodDark;
        ctx.fillRect(x + 1, y, 2, 24);
        ctx.fillRect(x + 29, y, 2, 24);

        // Back panel
        ctx.fillStyle = back;
        ctx.fillRect(x + 3, y, 26, 12);

        // Shelf
        ctx.fillStyle = woodMid;
        ctx.fillRect(x + 3, y + 12, 26, 2);
        ctx.fillStyle = woodLight;
        ctx.fillRect(x + 3, y + 12, 26, 1);
        // Books
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(x + 4, y + 2, 3, 10);
        ctx.fillStyle = '#1abc9c';
        ctx.fillRect(x + 8, y + 3, 2, 9);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 11, y + 1, 3, 11);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 15, y + 4, 2, 8);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x + 18, y + 2, 3, 10);
        // Frame
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 22, y + 3, 6, 8);
        ctx.fillStyle = '#c8e6ff';
        ctx.fillRect(x + 23, y + 4, 4, 6);

        // Bottom shelf area
        ctx.fillStyle = back;
        ctx.fillRect(x + 3, y + 14, 26, 8);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 5, y + 15, 10, 3);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x + 5, y + 18, 8, 2);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 16, y + 15, 8, 3);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(x + 16, y + 18, 10, 2);

        // Edge outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 22, T, 1);

        // FRONT FACE (y+22 to y+28) — 6px dark
        ctx.fillStyle = woodDark;
        ctx.fillRect(x + 1, y + 22, 30, 6);
        ctx.fillStyle = woodMid;
        ctx.fillRect(x + 1, y + 22, 30, 1);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 28, T, 1);

        // Feet
        ctx.fillStyle = frontDark;
        ctx.fillRect(x + 2, y + 29, 4, 2);
        ctx.fillRect(x + 26, y + 29, 4, 2);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 1, y + 30, 30, 2);
    }

    // --- VENDING MACHINE 1x2 (IDs 138-139) ---
    // Metal ramp: outline #2A2A3A, dark #4A5060, mid #6A7080, light #8A9098, hi #A0A8B0

    drawVending2_Top(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A2A3A';
        const bodyLight = '#8A9098';
        const bodySide = '#4A5060';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 1, T, 1);
        ctx.fillRect(x, y + 1, 1, 31);
        ctx.fillRect(x + 31, y + 1, 1, 31);

        // Side panel (3D right side)
        ctx.fillStyle = bodySide;
        ctx.fillRect(x + 28, y + 2, 3, 30);

        // Front
        ctx.fillStyle = bodyLight;
        ctx.fillRect(x + 1, y + 2, 27, 30);
        // Top highlight
        ctx.fillStyle = '#A0A8B0';
        ctx.fillRect(x + 1, y + 2, 27, 1);

        // Brand (red panel)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 2, y + 3, 25, 6);
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(x + 4, y + 4, 21, 4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 7, y + 5, 2, 2);
        ctx.fillRect(x + 11, y + 5, 4, 2);
        ctx.fillRect(x + 17, y + 5, 3, 2);

        // Glass display
        ctx.fillStyle = '#1a2a3a';
        ctx.fillRect(x + 2, y + 10, 25, 20);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x + 3, y + 11, 10, 18);

        // Row 1
        ctx.fillStyle = '#e74c3c';
        for (let i = 0; i < 5; i++) ctx.fillRect(x + 4 + i * 4, y + 12, 3, 5);
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 3, y + 17, 23, 1);
        // Row 2
        ctx.fillStyle = '#27ae60';
        for (let i = 0; i < 5; i++) ctx.fillRect(x + 4 + i * 4, y + 18, 3, 5);
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 3, y + 23, 23, 1);
        // Row 3
        ctx.fillStyle = '#3498db';
        for (let i = 0; i < 5; i++) ctx.fillRect(x + 4 + i * 4, y + 24, 3, 5);

        // Left highlight
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 1, y + 2, 1, 30);
    }

    drawVending2_Bot(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#2A2A3A';
        const bodyLight = '#8A9098';
        const bodySide = '#4A5060';
        const bodyFront = '#5A6070';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Side outlines
        ctx.fillStyle = outline;
        ctx.fillRect(x, y, 1, T);
        ctx.fillRect(x + 31, y, 1, T);

        // Side panel
        ctx.fillStyle = bodySide;
        ctx.fillRect(x + 28, y, 3, 26);

        // Front upper
        ctx.fillStyle = bodyLight;
        ctx.fillRect(x + 1, y, 27, 10);

        // Buttons
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 3, y + 1, 3, 3);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(x + 7, y + 1, 3, 3);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 11, y + 1, 3, 3);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 15, y + 1, 3, 3);
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(x + 19, y + 1, 3, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 4, y + 2, 1, 1);
        ctx.fillRect(x + 8, y + 2, 1, 1);
        ctx.fillRect(x + 12, y + 2, 1, 1);
        ctx.fillRect(x + 16, y + 2, 1, 1);
        ctx.fillRect(x + 20, y + 2, 1, 1);

        // Coin slot
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 3, y + 6, 5, 2);
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 4, y + 6, 3, 1);

        // Dispense area
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 2, y + 10, 25, 5);
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 2, y + 10, 25, 1);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 2, y + 14, 25, 1);

        // Edge outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 15, T, 1);

        // FRONT FACE (y+16 to y+26) — 10px dark
        ctx.fillStyle = bodyFront;
        ctx.fillRect(x + 1, y + 16, 30, 10);
        ctx.fillStyle = bodyLight;
        ctx.fillRect(x + 1, y + 16, 30, 1);
        // Grille
        ctx.fillStyle = '#4A5060';
        for (let gy = 0; gy < 4; gy++) ctx.fillRect(x + 5, y + 18 + gy * 2, 18, 1);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 26, T, 1);

        // Feet
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 2, y + 27, 4, 2);
        ctx.fillRect(x + 22, y + 27, 4, 2);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 1, y + 29, 30, 2);
    }

    // --- ARCADE CABINET 1x2 (IDs 140-141) ---
    // Purple ramp: outline #0E0820, dark #1A0E2A, mid #2A1A3A, light #3A2A4A, hi #4A3A5A

    drawArcade2_Top(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#0E0820';
        const cabFront = '#2A1A3A';
        const cabSide = '#1A0E2A';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 1, T, 1);
        ctx.fillRect(x, y + 1, 1, 31);
        ctx.fillRect(x + 31, y + 1, 1, 31);

        // Side (3D)
        ctx.fillStyle = cabSide;
        ctx.fillRect(x + 28, y + 2, 3, 30);

        // Front
        ctx.fillStyle = cabFront;
        ctx.fillRect(x + 1, y + 2, 27, 30);

        // Marquee
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 2, y + 3, 25, 8);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 2, y + 3, 25, 2);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x + 2, y + 7, 25, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6, y + 4, 2, 5);
        ctx.fillRect(x + 9, y + 4, 3, 5);
        ctx.fillRect(x + 13, y + 4, 2, 5);
        ctx.fillRect(x + 16, y + 4, 3, 5);
        ctx.fillRect(x + 20, y + 4, 2, 5);

        // Screen bezel
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 3, y + 12, 23, 18);
        // CRT
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(x + 4, y + 13, 21, 16);
        ctx.fillStyle = 'rgba(100, 100, 255, 0.08)';
        ctx.fillRect(x + 3, y + 12, 23, 18);

        // Game content
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x + 7, y + 15, 2, 2);
        ctx.fillRect(x + 11, y + 15, 2, 2);
        ctx.fillRect(x + 15, y + 15, 2, 2);
        ctx.fillRect(x + 19, y + 15, 2, 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 9, y + 19, 2, 2);
        ctx.fillRect(x + 13, y + 19, 2, 2);
        ctx.fillRect(x + 17, y + 19, 2, 2);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 12, y + 25, 4, 2);
        ctx.fillRect(x + 13, y + 24, 2, 1);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 13, y + 22, 1, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 5, y + 14, 1, 1);
        ctx.fillRect(x + 7, y + 14, 1, 1);

        // Left highlight
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 1, y + 2, 1, 30);
    }

    drawArcade2_Bot(ctx, x, y, T) {
        const bg = '#1a1c2e';
        const outline = '#0E0820';
        const cabFront = '#2A1A3A';
        const cabSide = '#1A0E2A';
        const cabLower = '#1E1030';

        ctx.fillStyle = bg;
        ctx.fillRect(x, y, T, T);

        // Side outlines
        ctx.fillStyle = outline;
        ctx.fillRect(x, y, 1, T);
        ctx.fillRect(x + 31, y, 1, T);

        // Side
        ctx.fillStyle = cabSide;
        ctx.fillRect(x + 28, y, 3, 26);

        // Front upper (controls)
        ctx.fillStyle = cabFront;
        ctx.fillRect(x + 1, y, 27, 10);

        // Control panel
        ctx.fillStyle = '#3A2A4A';
        ctx.fillRect(x + 2, y + 1, 25, 8);
        ctx.fillStyle = '#4A3A5A';
        ctx.fillRect(x + 2, y + 1, 25, 2);

        // Joystick
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 6, y + 4, 3, 3);
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 7, y + 2, 1, 3);

        // Buttons
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 13, y + 3, 3, 3);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x + 17, y + 3, 3, 3);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 13, y + 6, 3, 2);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x + 17, y + 6, 3, 2);

        // Coin area
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 7, y + 10, 16, 3);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 9, y + 11, 1, 1);
        ctx.fillRect(x + 11, y + 11, 1, 1);
        ctx.fillRect(x + 13, y + 11, 1, 1);
        ctx.fillRect(x + 15, y + 11, 1, 1);
        ctx.fillRect(x + 17, y + 11, 1, 1);
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 12, y + 12, 4, 1);

        // Edge outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 13, T, 1);

        // FRONT FACE (y+14 to y+26) — 12px
        ctx.fillStyle = cabLower;
        ctx.fillRect(x + 1, y + 14, 30, 12);
        ctx.fillStyle = '#2A1A3A';
        ctx.fillRect(x + 1, y + 14, 30, 1);
        // Decorative stripes
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 3, y + 18, 24, 1);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(x + 3, y + 20, 24, 1);

        // Bottom outline
        ctx.fillStyle = outline;
        ctx.fillRect(x, y + 26, T, 1);

        // Feet
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 2, y + 27, 4, 2);
        ctx.fillRect(x + 22, y + 27, 4, 2);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 1, y + 29, 30, 2);

        // Left highlight
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x + 1, y, 1, 26);
    }

    // ==========================================
    // CHARACTER SPRITE GENERATION - Improved
    // ==========================================
    generateCharacterSprites() {
        const spriteW = 16;
        const spriteH = 24;
        const scale = 2;
        const w = spriteW * scale;
        const h = spriteH * scale;
        const frames = 12;
        const colors = [
            { name: 'blue', skin: '#f5d6b8', shirt: '#3498db', pants: '#1e3a5f', hair: '#3d2b1f', shoe: '#2c1810' },
            { name: 'red', skin: '#f5d6b8', shirt: '#dc2626', pants: '#4a1515', hair: '#1a1a2e', shoe: '#111' },
            { name: 'green', skin: '#e8c49a', shirt: '#10b981', pants: '#064e3b', hair: '#4a3728', shoe: '#2a1a0e' },
            { name: 'purple', skin: '#f5d6b8', shirt: '#8b5cf6', pants: '#3b0764', hair: '#2d1b4e', shoe: '#1a0e30' },
            { name: 'orange', skin: '#e8c49a', shirt: '#f59e0b', pants: '#78350f', hair: '#1f1f1f', shoe: '#111' },
            { name: 'pink', skin: '#f5d6b8', shirt: '#ec4899', pants: '#831843', hair: '#5b3a29', shoe: '#3a2010' },
            { name: 'teal', skin: '#e8c49a', shirt: '#14b8a6', pants: '#134e4a', hair: '#2c2c2c', shoe: '#1a1a1a' },
            { name: 'gray', skin: '#f5d6b8', shirt: '#6b7280', pants: '#374151', hair: '#111827', shoe: '#0a0a0a' },
        ];

        colors.forEach(color => {
            const canvas = this.textures.createCanvas(`char_${color.name}`, w * frames, h);
            const ctx = canvas.context;

            const directions = ['down', 'left', 'right', 'up'];
            for (let d = 0; d < 4; d++) {
                for (let f = 0; f < 3; f++) {
                    const frameIdx = d * 3 + f;
                    const ox = frameIdx * w;
                    this.drawCharFrame(ctx, ox, 0, w, h, scale, color, directions[d], f);
                }
            }

            canvas.refresh();

            this.textures.get(`char_${color.name}`).add(0, 0, 0, 0, w, h);
            for (let i = 0; i < frames; i++) {
                this.textures.get(`char_${color.name}`).add(i, 0, i * w, 0, w, h);
            }
        });
    }

    drawCharFrame(ctx, ox, oy, w, h, scale, colors, dir, frame) {
        const s = scale;
        ctx.clearRect(ox, oy, w, h);

        const walkOffset = frame === 1 ? -1 * s : (frame === 2 ? 1 * s : 0);
        const bodyBob = frame !== 0 ? -1 : 0;
        // Arm swing for walk animation
        const armSwingFront = frame === 1 ? 2 * s : (frame === 2 ? -1 * s : 0);
        const armSwingBack = frame === 1 ? -1 * s : (frame === 2 ? 2 * s : 0);

        // Shadow (soft gradient ellipse)
        const grad = ctx.createRadialGradient(ox + w / 2, oy + h - 2 * s, 0, ox + w / 2, oy + h - 2 * s, 6 * s);
        grad.addColorStop(0, 'rgba(0,0,0,0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(ox + w / 2, oy + h - 2 * s, 6 * s, 2.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // === LEGS ===
        ctx.fillStyle = colors.pants;
        if (dir === 'down' || dir === 'up') {
            ctx.fillRect(ox + 5 * s + walkOffset, oy + 16 * s + bodyBob, 2.5 * s, 6 * s);
            ctx.fillRect(ox + 8.5 * s - walkOffset, oy + 16 * s + bodyBob, 2.5 * s, 6 * s);
        } else {
            ctx.fillRect(ox + 5.5 * s + walkOffset, oy + 16 * s + bodyBob, 2.5 * s, 6 * s);
            ctx.fillRect(ox + 8 * s - walkOffset, oy + 16 * s + bodyBob, 2.5 * s, 6 * s);
        }

        // === SHOES ===
        ctx.fillStyle = colors.shoe || '#1f2937';
        if (dir === 'down' || dir === 'up') {
            ctx.fillRect(ox + 5 * s + walkOffset, oy + 21 * s + bodyBob, 2.5 * s, 2 * s);
            ctx.fillRect(ox + 8.5 * s - walkOffset, oy + 21 * s + bodyBob, 2.5 * s, 2 * s);
        } else {
            ctx.fillRect(ox + 5.5 * s + walkOffset, oy + 21 * s + bodyBob, 2.5 * s, 2 * s);
            ctx.fillRect(ox + 8 * s - walkOffset, oy + 21 * s + bodyBob, 2.5 * s, 2 * s);
        }
        // Shoe sole accent
        ctx.fillStyle = colors.shirt;
        if (dir === 'down' || dir === 'up') {
            ctx.fillRect(ox + 5 * s + walkOffset, oy + 22.5 * s + bodyBob, 2.5 * s, 0.5 * s);
            ctx.fillRect(ox + 8.5 * s - walkOffset, oy + 22.5 * s + bodyBob, 2.5 * s, 0.5 * s);
        }

        // === ARMS (behind body for side views) ===
        if (dir === 'left') {
            // Back arm (right side, behind body)
            ctx.fillStyle = this._darkenColor(colors.shirt, 0.85);
            ctx.fillRect(ox + 10 * s, oy + 10 * s + bodyBob + armSwingBack, 2.5 * s, 6 * s);
            ctx.fillStyle = this._darkenColor(colors.skin, 0.9);
            ctx.fillRect(ox + 10 * s, oy + 15.5 * s + bodyBob + armSwingBack, 2.5 * s, 1.5 * s);
        } else if (dir === 'right') {
            // Back arm (left side, behind body)
            ctx.fillStyle = this._darkenColor(colors.shirt, 0.85);
            ctx.fillRect(ox + 3.5 * s, oy + 10 * s + bodyBob + armSwingBack, 2.5 * s, 6 * s);
            ctx.fillStyle = this._darkenColor(colors.skin, 0.9);
            ctx.fillRect(ox + 3.5 * s, oy + 15.5 * s + bodyBob + armSwingBack, 2.5 * s, 1.5 * s);
        }

        // === BODY OUTLINE ===
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(ox + 4 * s, oy + 8.5 * s + bodyBob, 8 * s, 8.5 * s);

        // === BODY / SHIRT (narrower to show arms) ===
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(ox + 4.5 * s, oy + 9 * s + bodyBob, 7 * s, 8 * s);

        // Shirt shading (subtle fold)
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(ox + 7.5 * s, oy + 10 * s + bodyBob, 1 * s, 6 * s);

        // Shirt collar
        if (dir === 'down') {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(ox + 6.5 * s, oy + 9 * s + bodyBob, 3 * s, 1 * s);
        }

        // === ARMS (front-facing: clearly visible on sides) ===
        if (dir === 'down' || dir === 'up') {
            // Left arm
            ctx.fillStyle = colors.shirt;
            ctx.fillRect(ox + 1.5 * s, oy + 9.5 * s + bodyBob + armSwingFront, 3 * s, 6 * s);
            // Left arm outline
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(ox + 1 * s, oy + 9.5 * s + bodyBob + armSwingFront, 0.5 * s, 6 * s);
            // Left hand
            ctx.fillStyle = colors.skin;
            ctx.fillRect(ox + 1.5 * s, oy + 15 * s + bodyBob + armSwingFront, 3 * s, 2 * s);

            // Right arm
            ctx.fillStyle = colors.shirt;
            ctx.fillRect(ox + 11.5 * s, oy + 9.5 * s + bodyBob + armSwingBack, 3 * s, 6 * s);
            // Right arm outline
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(ox + 14.5 * s, oy + 9.5 * s + bodyBob + armSwingBack, 0.5 * s, 6 * s);
            // Right hand
            ctx.fillStyle = colors.skin;
            ctx.fillRect(ox + 11.5 * s, oy + 15 * s + bodyBob + armSwingBack, 3 * s, 2 * s);
        } else if (dir === 'left') {
            // Front arm (left side, in front of body)
            ctx.fillStyle = colors.shirt;
            ctx.fillRect(ox + 2.5 * s, oy + 10 * s + bodyBob + armSwingFront, 2.5 * s, 6 * s);
            ctx.fillStyle = colors.skin;
            ctx.fillRect(ox + 2.5 * s, oy + 15.5 * s + bodyBob + armSwingFront, 2.5 * s, 1.5 * s);
        } else if (dir === 'right') {
            // Front arm (right side, in front of body)
            ctx.fillStyle = colors.shirt;
            ctx.fillRect(ox + 11 * s, oy + 10 * s + bodyBob + armSwingFront, 2.5 * s, 6 * s);
            ctx.fillStyle = colors.skin;
            ctx.fillRect(ox + 11 * s, oy + 15.5 * s + bodyBob + armSwingFront, 2.5 * s, 1.5 * s);
        }

        // === HEAD OUTLINE ===
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(ox + 3.5 * s, oy + 1.5 * s + bodyBob, 9 * s, 9 * s);

        // === HEAD ===
        ctx.fillStyle = colors.skin;
        ctx.fillRect(ox + 4 * s, oy + 2 * s + bodyBob, 8 * s, 8 * s);

        // Ears
        ctx.fillStyle = colors.skin;
        if (dir === 'down') {
            // Both ears visible from front
            ctx.fillRect(ox + 3 * s, oy + 5 * s + bodyBob, 1 * s, 2 * s);
            ctx.fillRect(ox + 12 * s, oy + 5 * s + bodyBob, 1 * s, 2 * s);
        } else if (dir === 'left') {
            ctx.fillRect(ox + 3 * s, oy + 5 * s + bodyBob, 1 * s, 2 * s);
        } else if (dir === 'right') {
            ctx.fillRect(ox + 12 * s, oy + 5 * s + bodyBob, 1 * s, 2 * s);
        }

        // === HAIR ===
        ctx.fillStyle = colors.hair;
        if (dir === 'up') {
            ctx.fillRect(ox + 3 * s, oy + 1 * s + bodyBob, 10 * s, 5 * s);
        } else {
            ctx.fillRect(ox + 3 * s, oy + 1 * s + bodyBob, 10 * s, 3 * s);
            if (dir === 'left') {
                ctx.fillRect(ox + 3 * s, oy + 2 * s + bodyBob, 2 * s, 4 * s);
            } else if (dir === 'right') {
                ctx.fillRect(ox + 11 * s, oy + 2 * s + bodyBob, 2 * s, 4 * s);
            }
        }

        // Hair highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(ox + 5 * s, oy + 1 * s + bodyBob, 4 * s, 1 * s);

        // === FACE ===
        if (dir !== 'up') {
            if (dir === 'down') {
                // Eye whites
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ox + 5 * s, oy + 5 * s + bodyBob, 2 * s, 2 * s);
                ctx.fillRect(ox + 9 * s, oy + 5 * s + bodyBob, 2 * s, 2 * s);
                // Pupils
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(ox + 5.5 * s, oy + 5.5 * s + bodyBob, 1.5 * s, 1.5 * s);
                ctx.fillRect(ox + 9.5 * s, oy + 5.5 * s + bodyBob, 1.5 * s, 1.5 * s);
                // Eye highlights
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ox + 5 * s, oy + 5 * s + bodyBob, 1 * s, 1 * s);
                ctx.fillRect(ox + 9 * s, oy + 5 * s + bodyBob, 1 * s, 1 * s);
                // Mouth (small smile)
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.fillRect(ox + 6.5 * s, oy + 8 * s + bodyBob, 3 * s, 0.5 * s);
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(ox + 7 * s, oy + 8.5 * s + bodyBob, 2 * s, 0.5 * s);

            } else if (dir === 'left') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ox + 4.5 * s, oy + 5 * s + bodyBob, 2 * s, 2 * s);
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(ox + 4.5 * s, oy + 5.5 * s + bodyBob, 1.5 * s, 1.5 * s);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ox + 4.5 * s, oy + 5 * s + bodyBob, 0.5 * s, 0.5 * s);
                // Mouth
                ctx.fillStyle = 'rgba(0,0,0,0.12)';
                ctx.fillRect(ox + 4 * s, oy + 8 * s + bodyBob, 2 * s, 0.5 * s);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ox + 9.5 * s, oy + 5 * s + bodyBob, 2 * s, 2 * s);
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(ox + 10 * s, oy + 5.5 * s + bodyBob, 1.5 * s, 1.5 * s);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ox + 11 * s, oy + 5 * s + bodyBob, 0.5 * s, 0.5 * s);
                // Mouth
                ctx.fillStyle = 'rgba(0,0,0,0.12)';
                ctx.fillRect(ox + 10 * s, oy + 8 * s + bodyBob, 2 * s, 0.5 * s);
            }
        }
    }

    // Utility to darken a hex color
    _darkenColor(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
    }

    // =============================================
    // NEW FURNITURE - Extended catalog (142-179)
    // =============================================

    drawLaptop(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base/keyboard
        ctx.fillStyle = '#8a8a9a'; ctx.fillRect(x+4, y+18, 24, 12);
        ctx.fillStyle = '#6a6a7a'; ctx.fillRect(x+5, y+19, 22, 10);
        // Keys
        for(let r=0;r<3;r++) for(let c=0;c<6;c++) {
            ctx.fillStyle = '#4a4a5a'; ctx.fillRect(x+6+c*3.5, y+20+r*3, 3, 2);
        }
        // Screen
        ctx.fillStyle = '#555'; ctx.fillRect(x+5, y+6, 22, 13);
        ctx.fillStyle = '#1e3a5f'; ctx.fillRect(x+6, y+7, 20, 11);
        // Screen glow
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+8, y+9, 8, 2);
        ctx.fillStyle = '#60a5fa'; ctx.fillRect(x+8, y+12, 12, 1);
        ctx.fillStyle = '#60a5fa'; ctx.fillRect(x+8, y+14, 10, 1);
    }

    drawGamingChair(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base/wheels
        ctx.fillStyle = '#333'; ctx.fillRect(x+10, y+28, 12, 3);
        ctx.fillStyle = '#444'; ctx.fillRect(x+14, y+25, 4, 4);
        // Seat
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+8, y+18, 16, 8);
        ctx.fillStyle = '#b91c1c'; ctx.fillRect(x+9, y+19, 14, 6);
        // Back
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+9, y+4, 14, 15);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+11, y+6, 10, 4);
        // Racing stripes
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+9, y+5, 2, 13);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+21, y+5, 2, 13);
        // Headrest
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+11, y+2, 10, 4);
        ctx.fillStyle = '#b91c1c'; ctx.fillRect(x+12, y+3, 8, 2);
    }

    drawDeskLamp(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base
        ctx.fillStyle = '#555'; ctx.fillRect(x+11, y+26, 10, 4);
        // Arm
        ctx.fillStyle = '#777'; ctx.fillRect(x+15, y+10, 2, 17);
        // Lamp head
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x+8, y+6, 14, 6);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+9, y+7, 12, 4);
        // Light glow
        ctx.fillStyle = 'rgba(251,191,36,0.3)'; ctx.fillRect(x+10, y+12, 10, 4);
    }

    drawFilingCabinet(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Body
        ctx.fillStyle = '#6b7280'; ctx.fillRect(x+6, y+4, 20, 26);
        ctx.fillStyle = '#9ca3af'; ctx.fillRect(x+7, y+5, 18, 24);
        // Drawers
        for(let i=0;i<3;i++) {
            ctx.fillStyle = '#d1d5db'; ctx.fillRect(x+8, y+6+i*8, 16, 7);
            ctx.fillStyle = '#6b7280'; ctx.fillRect(x+8, y+12+i*8, 16, 1);
            ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+14, y+9+i*8, 4, 2);
        }
    }

    drawWhiteboardSmall(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Frame
        ctx.fillStyle = '#9ca3af'; ctx.fillRect(x+4, y+4, 24, 20);
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(x+5, y+5, 22, 18);
        // Notes
        ctx.fillStyle = '#ef4444'; ctx.fillRect(x+7, y+7, 4, 4);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+13, y+7, 4, 4);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x+19, y+7, 4, 4);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x+7, y+14, 4, 4);
        ctx.fillStyle = '#8b5cf6'; ctx.fillRect(x+13, y+14, 4, 4);
        // Tray
        ctx.fillStyle = '#6b7280'; ctx.fillRect(x+6, y+24, 20, 3);
    }

    drawHeadphonesStand(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base
        ctx.fillStyle = '#555'; ctx.fillRect(x+11, y+26, 10, 4);
        // Pole
        ctx.fillStyle = '#777'; ctx.fillRect(x+14, y+10, 4, 17);
        // Top
        ctx.fillStyle = '#888'; ctx.fillRect(x+10, y+8, 12, 3);
        // Headphones
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+7, y+6, 6, 10);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+19, y+6, 6, 10);
        ctx.fillStyle = '#333'; ctx.fillRect(x+8, y+7, 4, 8);
        ctx.fillStyle = '#333'; ctx.fillRect(x+20, y+7, 4, 8);
        // Band
        ctx.fillStyle = '#444'; ctx.fillRect(x+10, y+4, 12, 3);
    }

    drawDockStation(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base
        ctx.fillStyle = '#555'; ctx.fillRect(x+4, y+20, 24, 8);
        ctx.fillStyle = '#666'; ctx.fillRect(x+5, y+21, 22, 6);
        // Ports
        ctx.fillStyle = '#333'; ctx.fillRect(x+7, y+23, 3, 2);
        ctx.fillStyle = '#333'; ctx.fillRect(x+12, y+23, 3, 2);
        ctx.fillStyle = '#333'; ctx.fillRect(x+17, y+23, 3, 2);
        ctx.fillStyle = '#333'; ctx.fillRect(x+22, y+23, 3, 2);
        // LED
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x+14, y+21, 4, 1);
        // Monitor above
        ctx.fillStyle = '#444'; ctx.fillRect(x+6, y+6, 20, 14);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x+7, y+7, 18, 12);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+9, y+9, 6, 2);
    }

    drawCactus(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Pot
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+10, y+22, 12, 8);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+11, y+23, 10, 6);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+12, y+24, 8, 2);
        // Cactus body
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+13, y+8, 6, 15);
        ctx.fillStyle = '#15803d'; ctx.fillRect(x+14, y+9, 4, 13);
        // Arms
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+8, y+12, 5, 4);
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+8, y+9, 3, 4);
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+19, y+14, 5, 4);
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+22, y+10, 3, 5);
        // Flower
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(x+14, y+6, 4, 3);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+15, y+7, 2, 1);
    }

    drawPalmTree(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Trunk
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+13, y+14, 6, 16);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+14, y+15, 4, 14);
        // Leaves
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x+4, y+4, 10, 5);
        ctx.fillRect(x+18, y+4, 10, 5);
        ctx.fillRect(x+8, y+2, 16, 6);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x+10, y+3, 12, 4);
        ctx.fillRect(x+6, y+8, 8, 4);
        ctx.fillRect(x+18, y+8, 8, 4);
        // Coconuts
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+13, y+10, 3, 3);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+17, y+11, 3, 3);
    }

    drawBonsai(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Pot
        ctx.fillStyle = '#1e40af'; ctx.fillRect(x+9, y+24, 14, 6);
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(x+10, y+25, 12, 4);
        // Trunk
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+14, y+16, 4, 9);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+11, y+14, 4, 4);
        // Canopy
        ctx.fillStyle = '#166534'; ctx.fillRect(x+6, y+6, 20, 10);
        ctx.fillStyle = '#15803d'; ctx.fillRect(x+8, y+4, 16, 10);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x+10, y+5, 12, 6);
    }

    drawHangingPlant(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Hook
        ctx.fillStyle = '#888'; ctx.fillRect(x+14, y+0, 4, 4);
        // Chain
        ctx.fillStyle = '#666'; ctx.fillRect(x+15, y+3, 2, 6);
        // Pot
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+10, y+8, 12, 7);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+11, y+9, 10, 5);
        // Hanging vines
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x+8, y+14, 3, 10);
        ctx.fillRect(x+13, y+14, 3, 12);
        ctx.fillRect(x+19, y+14, 3, 8);
        ctx.fillRect(x+22, y+14, 3, 14);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x+6, y+18, 3, 8);
        ctx.fillRect(x+16, y+16, 3, 10);
    }

    drawDartboard(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        const cx=x+16, cy=y+14;
        // Outer ring
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(cx-12, cy-12, 24, 24);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(cx-10, cy-10, 20, 20);
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(cx-8, cy-8, 16, 16);
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(cx-6, cy-6, 12, 12);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(cx-4, cy-4, 8, 8);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(cx-2, cy-2, 4, 4);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(cx-1, cy-1, 2, 2);
        // Dart
        ctx.fillStyle = '#60a5fa'; ctx.fillRect(cx+1, cy-1, 8, 2);
    }

    drawSpeaker(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Body
        ctx.fillStyle = '#333'; ctx.fillRect(x+8, y+4, 16, 24);
        ctx.fillStyle = '#222'; ctx.fillRect(x+9, y+5, 14, 22);
        // Woofer
        ctx.fillStyle = '#555'; ctx.fillRect(x+11, y+14, 10, 10);
        ctx.fillStyle = '#444'; ctx.fillRect(x+13, y+16, 6, 6);
        ctx.fillStyle = '#333'; ctx.fillRect(x+14, y+17, 4, 4);
        // Tweeter
        ctx.fillStyle = '#555'; ctx.fillRect(x+13, y+7, 6, 6);
        ctx.fillStyle = '#444'; ctx.fillRect(x+14, y+8, 4, 4);
        // LED
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+15, y+25, 2, 1);
    }

    drawNeonSign(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Background plate
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x+3, y+6, 26, 20);
        // Neon "OPEN"
        ctx.fillStyle = '#f43f5e';
        // O
        ctx.fillRect(x+5, y+10, 5, 8); ctx.fillStyle='#1e293b'; ctx.fillRect(x+6, y+12, 3, 4);
        // P
        ctx.fillStyle = '#ec4899'; ctx.fillRect(x+11, y+10, 2, 8);
        ctx.fillRect(x+11, y+10, 5, 2); ctx.fillRect(x+11, y+14, 5, 2);
        ctx.fillRect(x+14, y+10, 2, 6);
        // E
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(x+18, y+10, 2, 8);
        ctx.fillRect(x+18, y+10, 5, 2); ctx.fillRect(x+18, y+14, 4, 2); ctx.fillRect(x+18, y+16, 5, 2);
        // N
        ctx.fillStyle = '#ec4899'; ctx.fillRect(x+24, y+10, 2, 8); ctx.fillRect(x+27, y+10, 2, 8);
        ctx.fillRect(x+25, y+12, 2, 2); ctx.fillRect(x+26, y+14, 2, 2);
        // Glow
        ctx.fillStyle = 'rgba(244,63,94,0.2)'; ctx.fillRect(x+2, y+5, 28, 22);
    }

    drawDJTable(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Table
        ctx.fillStyle = '#333'; ctx.fillRect(x+2, y+14, 28, 14);
        ctx.fillStyle = '#444'; ctx.fillRect(x+3, y+15, 26, 12);
        // Turntables
        ctx.fillStyle = '#222'; ctx.fillRect(x+4, y+16, 10, 10);
        ctx.fillStyle = '#555'; ctx.fillRect(x+6, y+18, 6, 6);
        ctx.fillStyle = '#888'; ctx.fillRect(x+8, y+20, 2, 2);
        ctx.fillStyle = '#222'; ctx.fillRect(x+18, y+16, 10, 10);
        ctx.fillStyle = '#555'; ctx.fillRect(x+20, y+18, 6, 6);
        ctx.fillStyle = '#888'; ctx.fillRect(x+22, y+20, 2, 2);
        // Mixer
        ctx.fillStyle = '#666'; ctx.fillRect(x+14, y+17, 4, 8);
        // Laptop on top
        ctx.fillStyle = '#444'; ctx.fillRect(x+7, y+8, 18, 7);
        ctx.fillStyle = '#1e3a5f'; ctx.fillRect(x+8, y+9, 16, 5);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+10, y+10, 4, 1);
    }

    drawKaraoke(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Machine body
        ctx.fillStyle = '#7c3aed'; ctx.fillRect(x+6, y+10, 20, 18);
        ctx.fillStyle = '#6d28d9'; ctx.fillRect(x+7, y+11, 18, 16);
        // Screen
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x+8, y+12, 12, 8);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+9, y+13, 10, 6);
        // Music notes
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+10, y+14, 2, 3);
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(x+14, y+15, 2, 3);
        // Speaker
        ctx.fillStyle = '#444'; ctx.fillRect(x+22, y+13, 3, 3);
        // Microphone
        ctx.fillStyle = '#888'; ctx.fillRect(x+14, y+4, 4, 3);
        ctx.fillStyle = '#666'; ctx.fillRect(x+15, y+6, 2, 5);
        ctx.fillStyle = '#aaa'; ctx.fillRect(x+13, y+2, 6, 3);
    }

    drawPunchingBag(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Chain
        ctx.fillStyle = '#888'; ctx.fillRect(x+14, y+2, 4, 6);
        // Bag
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+10, y+7, 12, 20);
        ctx.fillStyle = '#b91c1c'; ctx.fillRect(x+11, y+8, 10, 18);
        ctx.fillStyle = '#991b1b'; ctx.fillRect(x+12, y+10, 8, 4);
        // Bottom
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(x+12, y+25, 8, 3);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x+11, y+8, 3, 16);
    }

    drawDumbbellRack(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Rack frame
        ctx.fillStyle = '#555'; ctx.fillRect(x+4, y+4, 4, 26);
        ctx.fillStyle = '#555'; ctx.fillRect(x+24, y+4, 4, 26);
        ctx.fillStyle = '#555'; ctx.fillRect(x+4, y+10, 24, 2);
        ctx.fillStyle = '#555'; ctx.fillRect(x+4, y+18, 24, 2);
        ctx.fillStyle = '#555'; ctx.fillRect(x+4, y+26, 24, 2);
        // Dumbbells
        ctx.fillStyle = '#333'; ctx.fillRect(x+9, y+6, 14, 3);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+8, y+6, 4, 3);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+20, y+6, 4, 3);
        ctx.fillStyle = '#333'; ctx.fillRect(x+9, y+13, 14, 3);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+8, y+13, 4, 3);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+20, y+13, 4, 3);
        ctx.fillStyle = '#333'; ctx.fillRect(x+9, y+21, 14, 3);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x+8, y+21, 4, 3);
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x+20, y+21, 4, 3);
    }

    drawYogaBall(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Ball (pixel circle)
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x+8, y+8, 16, 18);
        ctx.fillRect(x+6, y+10, 20, 14);
        ctx.fillRect(x+10, y+6, 12, 2);
        ctx.fillRect(x+10, y+26, 12, 2);
        // Stripe
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(x+8, y+15, 16, 3);
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x+10, y+9, 6, 4);
    }

    drawBasketballHoop(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Backboard
        ctx.fillStyle = '#f8fafc'; ctx.fillRect(x+6, y+2, 20, 14);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x+7, y+3, 18, 12);
        // Square on backboard
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+10, y+5, 12, 8);
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x+11, y+6, 10, 6);
        // Rim
        ctx.fillStyle = '#f97316'; ctx.fillRect(x+9, y+16, 14, 2);
        // Net
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x+10, y+18, 2, 6); ctx.fillRect(x+14, y+18, 2, 8);
        ctx.fillRect(x+18, y+18, 2, 6); ctx.fillRect(x+12, y+20, 2, 6);
        ctx.fillRect(x+16, y+20, 2, 6);
    }

    drawBBQGrill(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Legs
        ctx.fillStyle = '#555'; ctx.fillRect(x+8, y+22, 3, 8);
        ctx.fillStyle = '#555'; ctx.fillRect(x+21, y+22, 3, 8);
        // Body
        ctx.fillStyle = '#333'; ctx.fillRect(x+6, y+14, 20, 10);
        ctx.fillStyle = '#444'; ctx.fillRect(x+7, y+15, 18, 8);
        // Grill lines
        for(let i=0;i<5;i++) { ctx.fillStyle = '#666'; ctx.fillRect(x+8, y+16+i*2, 16, 1); }
        // Lid
        ctx.fillStyle = '#2a2a3a'; ctx.fillRect(x+5, y+10, 22, 5);
        ctx.fillStyle = '#333'; ctx.fillRect(x+6, y+11, 20, 3);
        // Handle
        ctx.fillStyle = '#888'; ctx.fillRect(x+14, y+8, 4, 3);
        // Smoke
        ctx.fillStyle = 'rgba(200,200,200,0.3)'; ctx.fillRect(x+12, y+4, 2, 5);
        ctx.fillStyle = 'rgba(200,200,200,0.2)'; ctx.fillRect(x+18, y+2, 2, 6);
    }

    drawFirePit(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Pit ring
        ctx.fillStyle = '#78716c'; ctx.fillRect(x+6, y+16, 20, 12);
        ctx.fillStyle = '#57534e'; ctx.fillRect(x+8, y+18, 16, 8);
        ctx.fillStyle = '#44403c'; ctx.fillRect(x+9, y+19, 14, 6);
        // Fire
        ctx.fillStyle = '#f97316'; ctx.fillRect(x+10, y+12, 12, 8);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+12, y+10, 8, 8);
        ctx.fillStyle = '#fde047'; ctx.fillRect(x+13, y+12, 6, 4);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+11, y+14, 3, 4);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+18, y+13, 3, 5);
        // Sparks
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+14, y+8, 2, 2);
        ctx.fillStyle = '#f97316'; ctx.fillRect(x+19, y+6, 1, 2);
    }

    drawHammock(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Poles
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+3, y+4, 3, 26);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+26, y+4, 3, 26);
        // Ropes
        ctx.fillStyle = '#d4a574'; ctx.fillRect(x+5, y+8, 4, 2);
        ctx.fillStyle = '#d4a574'; ctx.fillRect(x+23, y+8, 4, 2);
        // Hammock fabric
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+8, y+10, 16, 3);
        ctx.fillStyle = '#60a5fa'; ctx.fillRect(x+6, y+12, 20, 4);
        ctx.fillStyle = '#93c5fd'; ctx.fillRect(x+7, y+16, 18, 3);
        // Stripes
        ctx.fillStyle = '#f97316'; ctx.fillRect(x+8, y+13, 16, 1);
        ctx.fillStyle = '#f97316'; ctx.fillRect(x+9, y+16, 14, 1);
    }

    drawParasol(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Pole
        ctx.fillStyle = '#888'; ctx.fillRect(x+15, y+12, 2, 18);
        // Umbrella top
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+4, y+4, 24, 4);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(x+6, y+2, 20, 4);
        ctx.fillStyle = '#f87171'; ctx.fillRect(x+8, y+1, 16, 3);
        // Stripes
        ctx.fillStyle = '#fde047'; ctx.fillRect(x+10, y+2, 4, 5);
        ctx.fillStyle = '#fde047'; ctx.fillRect(x+18, y+2, 4, 5);
        // Tip
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+15, y+0, 2, 2);
    }

    drawPetBed(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Bed rim
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+4, y+14, 24, 14);
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+5, y+15, 22, 12);
        // Cushion
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+6, y+16, 20, 10);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x+7, y+17, 18, 8);
        // Sleeping pet (small circle)
        ctx.fillStyle = '#d4a574'; ctx.fillRect(x+10, y+18, 10, 6);
        ctx.fillStyle = '#c2956a'; ctx.fillRect(x+11, y+19, 8, 4);
        // Ears
        ctx.fillStyle = '#b4845a'; ctx.fillRect(x+10, y+17, 3, 2);
        ctx.fillStyle = '#b4845a'; ctx.fillRect(x+17, y+17, 3, 2);
    }

    drawVaseFlowers(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Vase
        ctx.fillStyle = '#7c3aed'; ctx.fillRect(x+11, y+18, 10, 10);
        ctx.fillStyle = '#6d28d9'; ctx.fillRect(x+12, y+16, 8, 4);
        // Stems
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+14, y+6, 2, 12);
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+18, y+8, 2, 10);
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+10, y+10, 2, 8);
        // Flowers
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(x+12, y+4, 6, 4);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+14, y+5, 2, 2);
        ctx.fillStyle = '#ec4899'; ctx.fillRect(x+16, y+6, 6, 4);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+18, y+7, 2, 2);
        ctx.fillStyle = '#8b5cf6'; ctx.fillRect(x+8, y+8, 6, 4);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+10, y+9, 2, 2);
    }

    drawCandle(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Holder
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+10, y+24, 12, 6);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+12, y+22, 8, 4);
        // Candle body
        ctx.fillStyle = '#fef3c7'; ctx.fillRect(x+13, y+12, 6, 11);
        ctx.fillStyle = '#fde68a'; ctx.fillRect(x+14, y+13, 4, 9);
        // Wick
        ctx.fillStyle = '#333'; ctx.fillRect(x+15, y+10, 2, 3);
        // Flame
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+14, y+6, 4, 5);
        ctx.fillStyle = '#fde047'; ctx.fillRect(x+15, y+5, 2, 4);
        ctx.fillStyle = '#f97316'; ctx.fillRect(x+14, y+8, 4, 2);
        // Glow
        ctx.fillStyle = 'rgba(251,191,36,0.15)'; ctx.fillRect(x+10, y+4, 12, 10);
    }

    drawMirror(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Frame
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+6, y+4, 20, 24);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+7, y+5, 18, 22);
        // Mirror surface
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(x+8, y+6, 16, 20);
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(x+9, y+7, 14, 18);
        // Reflection
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x+10, y+8, 4, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x+16, y+10, 4, 8);
    }

    drawChandelier(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Chain
        ctx.fillStyle = '#888'; ctx.fillRect(x+15, y+0, 2, 6);
        // Center
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+12, y+6, 8, 4);
        // Arms
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+4, y+8, 24, 2);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+6, y+10, 4, 4);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+14, y+10, 4, 4);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+22, y+10, 4, 4);
        // Lights
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+6, y+14, 4, 4);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+14, y+14, 4, 4);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+22, y+14, 4, 4);
        // Glow
        ctx.fillStyle = 'rgba(251,191,36,0.2)';
        ctx.fillRect(x+4, y+16, 8, 6);
        ctx.fillRect(x+12, y+16, 8, 6);
        ctx.fillRect(x+20, y+16, 8, 6);
    }

    drawFan(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base
        ctx.fillStyle = '#555'; ctx.fillRect(x+10, y+26, 12, 4);
        // Pole
        ctx.fillStyle = '#777'; ctx.fillRect(x+14, y+16, 4, 11);
        // Head
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x+6, y+4, 20, 14);
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(x+7, y+5, 18, 12);
        // Blades (implied motion)
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(x+8, y+6, 16, 10);
        ctx.fillStyle = '#64748b'; ctx.fillRect(x+9, y+10, 14, 2);
        ctx.fillStyle = '#64748b'; ctx.fillRect(x+15, y+6, 2, 10);
        // Center
        ctx.fillStyle = '#475569'; ctx.fillRect(x+14, y+9, 4, 4);
    }

    drawTVStand(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Stand
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+4, y+18, 24, 12);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+5, y+19, 22, 10);
        // Shelf
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+5, y+24, 22, 2);
        // Doors
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+6, y+20, 9, 3);
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+17, y+20, 9, 3);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+9, y+21, 2, 1);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+21, y+21, 2, 1);
        // TV on top
        ctx.fillStyle = '#222'; ctx.fillRect(x+4, y+4, 24, 14);
        ctx.fillStyle = '#1e293b'; ctx.fillRect(x+5, y+5, 22, 12);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(x+7, y+7, 8, 3);
    }

    drawSafe(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Body
        ctx.fillStyle = '#4b5563'; ctx.fillRect(x+6, y+6, 20, 22);
        ctx.fillStyle = '#374151'; ctx.fillRect(x+7, y+7, 18, 20);
        // Door
        ctx.fillStyle = '#6b7280'; ctx.fillRect(x+8, y+8, 16, 18);
        // Handle
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+20, y+14, 3, 6);
        // Dial
        ctx.fillStyle = '#d1d5db'; ctx.fillRect(x+11, y+14, 6, 6);
        ctx.fillStyle = '#9ca3af'; ctx.fillRect(x+12, y+15, 4, 4);
        ctx.fillStyle = '#6b7280'; ctx.fillRect(x+13, y+16, 2, 2);
        // Rivets
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(x+9, y+9, 2, 2); ctx.fillRect(x+21, y+9, 2, 2);
        ctx.fillRect(x+9, y+23, 2, 2); ctx.fillRect(x+21, y+23, 2, 2);
    }

    drawShoeRack(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Frame
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+4, y+6, 24, 24);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+5, y+7, 22, 22);
        // Shelves
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+5, y+14, 22, 2);
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+5, y+22, 22, 2);
        // Shoes top
        ctx.fillStyle = '#1e40af'; ctx.fillRect(x+6, y+8, 6, 5);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+14, y+8, 6, 5);
        ctx.fillStyle = '#333'; ctx.fillRect(x+22, y+8, 4, 5);
        // Shoes bottom
        ctx.fillStyle = '#22c55e'; ctx.fillRect(x+6, y+16, 6, 5);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x+14, y+16, 6, 5);
        ctx.fillStyle = '#8b5cf6'; ctx.fillRect(x+22, y+16, 4, 5);
    }

    drawUmbrellaStand(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Stand
        ctx.fillStyle = '#555'; ctx.fillRect(x+10, y+18, 12, 12);
        ctx.fillStyle = '#666'; ctx.fillRect(x+11, y+19, 10, 10);
        // Umbrellas
        ctx.fillStyle = '#1e40af'; ctx.fillRect(x+12, y+4, 3, 16);
        ctx.fillStyle = '#1e40af'; ctx.fillRect(x+10, y+4, 7, 3);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+17, y+6, 3, 14);
        ctx.fillStyle = '#dc2626'; ctx.fillRect(x+15, y+6, 7, 3);
        // Hooks
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+11, y+3, 3, 2);
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+18, y+5, 3, 2);
    }

    drawPhotoFrame(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Frame
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+6, y+6, 20, 20);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+7, y+7, 18, 18);
        // Photo
        ctx.fillStyle = '#87ceeb'; ctx.fillRect(x+8, y+8, 16, 16);
        // Mountains
        ctx.fillStyle = '#16a34a'; ctx.fillRect(x+8, y+16, 16, 8);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x+10, y+14, 6, 4);
        ctx.fillRect(x+18, y+12, 6, 6);
        // Sun
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+10, y+10, 4, 4);
    }

    drawGlobeDesk(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+11, y+26, 10, 4);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+14, y+22, 4, 5);
        // Globe (pixel circle)
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x+10, y+6, 12, 16);
        ctx.fillRect(x+8, y+8, 16, 12);
        // Continents
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x+12, y+8, 4, 6);
        ctx.fillRect(x+18, y+10, 4, 4);
        ctx.fillRect(x+10, y+16, 6, 3);
        // Frame ring
        ctx.fillStyle = '#b45309'; ctx.fillRect(x+8, y+13, 16, 2);
    }

    drawTrophy(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Base
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+10, y+26, 12, 4);
        ctx.fillStyle = '#92400e'; ctx.fillRect(x+12, y+24, 8, 3);
        // Stem
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+14, y+18, 4, 7);
        // Cup
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+8, y+6, 16, 13);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x+10, y+4, 12, 4);
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x+10, y+8, 12, 8);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+10, y+8, 12, 8);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(x+11, y+9, 10, 6);
        // Handles
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+5, y+8, 4, 6);
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+23, y+8, 4, 6);
        // Star
        ctx.fillStyle = '#fde047'; ctx.fillRect(x+14, y+10, 4, 4);
    }

    drawCorkboard(ctx, x, y, T) {
        ctx.fillStyle = '#1a1c2e'; ctx.fillRect(x, y, T, T);
        // Frame
        ctx.fillStyle = '#78350f'; ctx.fillRect(x+3, y+4, 26, 22);
        // Cork surface
        ctx.fillStyle = '#d4a574'; ctx.fillRect(x+4, y+5, 24, 20);
        ctx.fillStyle = '#c2956a'; ctx.fillRect(x+5, y+6, 22, 18);
        // Pinned notes
        ctx.fillStyle = '#fde047'; ctx.fillRect(x+6, y+7, 6, 6);
        ctx.fillStyle = '#f87171'; ctx.fillRect(x+14, y+8, 5, 5);
        ctx.fillStyle = '#60a5fa'; ctx.fillRect(x+20, y+7, 6, 4);
        ctx.fillStyle = '#a78bfa'; ctx.fillRect(x+7, y+15, 5, 5);
        ctx.fillStyle = '#4ade80'; ctx.fillRect(x+14, y+16, 6, 4);
        ctx.fillStyle = '#fb923c'; ctx.fillRect(x+21, y+14, 4, 6);
        // Pins
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x+8, y+7, 2, 2); ctx.fillRect(x+16, y+8, 2, 2);
        ctx.fillRect(x+22, y+7, 2, 2); ctx.fillRect(x+9, y+15, 2, 2);
    }
}
