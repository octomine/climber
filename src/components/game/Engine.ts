import 'phaser';
import { MyScene } from './MyScene';

const cfg = {
    type: Phaser.AUTO,
    title: 'game',
    width: 400,
    height: 400,
    parent: 'game',
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
