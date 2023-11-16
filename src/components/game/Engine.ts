import 'phaser';
import { MyScene } from './MyScene';

const cfg = {
    type: Phaser.AUTO,
    title: 'game',
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        width: 640,
        height: 960,
    },
    backgroundColor: '#dddddd',
    scene: [MyScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            // debug: true,
        }
    }
}

const game = new Phaser.Game(cfg);
