export class MyScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private actor!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private handlers!: Phaser.Physics.Arcade.Group;

  constructor() {
    super('main');
  }

  preload() {
    this.load.image('tile', 'assets/image/tile.png');
    this.load.image('handler', 'assets/image/handler.png')
    this.load.image('penta', 'assets/image/img.png');
  }

  create() {
    const data = [
      [0, -1, -1, -1, -1, -1, -1, 0],
      [0, -1, -1, -1, -1, -1, -1, 0],
      [0, -1, -1, -1, -1, -1, -1, 0],
      [0, -1, -1, -1, -1, -1, -1, 0],
      [0, -1, -1, -1, -1, -1, -1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    this.map = this.make.tilemap({ data, tileWidth: 100, tileHeight: 100, width: 8, height: 6 });
    this.map.addTilesetImage('tile');
    const layer = this.map.createLayer(0, 'tile', 0, 0);

    this.map.setCollision(0);

    this.handlers = this.physics.add.group({
      key: 'handler',
      setXY: { x: 200, y: 300 },
    })

    // actor
    this.actor = this.physics.add.sprite(200, 100, 'penta');

    if (layer) {
      this.physics.add.collider(this.actor, layer);
    }

    this.cursors = this.input.keyboard?.createCursorKeys();
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
