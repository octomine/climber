export class MyScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private actor!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private handlers!: Phaser.Physics.Arcade.Group;
  private hanging: boolean = false;

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
      [0, -1, -1, -1, -1, 0, 0, 0],
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
      quantity: 2,
      setXY: { x: 200, y: 300 },
      "setXY.stepX": 150,
      "setXY.stepY": -100,
      allowGravity: false,
    });

    // actor
    this.actor = this.physics.add.sprite(200, 100, 'penta');

    if (layer) {
      this.physics.add.collider(this.actor, layer);
    }

    this.cursors = this.input.keyboard?.createCursorKeys();

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        this.physics.overlap(this.actor, this.handlers, (actor, handler) => {
          const { x, y } = (handler as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.center;
          this.actor.x = x;
          this.actor.y = y;
          this.actor.setVelocity(0);
          this.hanging = true;
        })
      }
    });

    this.input.keyboard?.on('keyup', (e: KeyboardEvent) => {
      const { code } = e;
      if (code === 'Space') {
        if (this.hanging) {
          if (this.cursors?.up.isDown) {
            this.actor.setVelocityY(-300);
          }
          if (this.cursors?.right.isDown) {
            this.actor.setVelocityX(100);
          }
          if (this.cursors?.left.isDown) {
            this.actor.setVelocityX(-100);
          }
        }
        this.hanging = false;
      }
    })
  }

  update() {
    if (this.hanging) {
      // hanging
      this.actor.setVelocityY(0);
    } else {
      // jump
      if (this.cursors?.up.isDown) {
        if (this.actor.body.onFloor()) {
          this.actor.setVelocityY(-300);
        }
      }

      // walk
      if (this.actor.body.onFloor()) {
        if (this.cursors?.right.isDown) {
          this.actor.setVelocityX(100);
        } else if (this.cursors?.left.isDown) {
          this.actor.setVelocityX(-100);
        } else {
          this.actor.setVelocityX(0);
        }
      }
    }
  }
}
