import 'phaser';
import { MyScene } from './MyScene';

const cfg = {
    type: Phaser.AUTO,
    title: 'game',
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#dddddd',
    scene: [MyScene],
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: .5 },
            debug: true,
        }
    }
}

const game = new Phaser.Game(cfg);
