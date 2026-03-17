import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { OfficeScene } from './scenes/OfficeScene';
import { getLocalUserId, getLocalUserName } from '../services/api';

export function createGatherGame(containerId, config = {}) {
    const userId = config.userId || window.USER_ID || getLocalUserId();
    const userName = config.userName || window.USER_NAME || getLocalUserName();

    const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerId,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelArt: true,
        roundPixels: true,
        antialias: false,
        backgroundColor: '#78b858',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [BootScene, OfficeScene],
        callbacks: {
            preBoot: (game) => {
                game.registry.set('userId', userId);
                game.registry.set('userName', userName);
                game.registry.set('spaceId', config.spaceId || 1);
            }
        }
    });

    return game;
}
