export class MyScene extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private actor!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

  constructor() {
    super();
  }

  preload() {
    this.load.image('penta', 'assets/img.png');
  }

  create() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.actor = this.physics.add.image(100, 100, 'penta');
  }

  update() {
    this.actor.setVelocity(0);

    if (this.cursors?.down.isDown) {
      this.actor.setVelocityY(100);
    }
    if (this.cursors?.up.isDown) {
      this.actor.setVelocityY(-100);
    }
    if (this.cursors?.right.isDown) {
      this.actor.setVelocityX(100);
    }
    if (this.cursors?.left.isDown) {
      this.actor.setVelocityX(-100);
    }
  }
}
