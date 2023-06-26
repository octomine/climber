import { IncomingMessage } from "http";

export class MyScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  private actor!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private leftGrabber!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private rightGrabber!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private grabberOffset = 0;
  private rotationDirection = 1;

  private handlers!: Phaser.Physics.Arcade.Group;
  private hanging = false;
  private grabbed!: { x: number, y: number } | null;
  private lastPressed = '';

  private walk = 200;
  private jump = 400;

  constructor() {
    super('main');
  }

  preload() {
    this.load.image('tile', 'assets/image/tile.png');
    this.load.image('handler', 'assets/image/handler.png')
    this.load.image('penta', 'assets/image/img.png');
    this.load.image('empty', 'assets/image/empty.png');
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

    const arr = new Array(6).fill(null);
    const r = 100;
    const xc = 300;
    const yc = 300;
    this.handlers = this.physics.add.group(
      arr.map((_, i) => {
        const a = i * Math.PI / 3;
        const x = xc + r * Math.cos(a);
        const y = yc + r * Math.sin(a);
        return this.physics.add.image(x, y, 'handler');
      }));
    this.handlers.children.each((child) => { (child.body as Phaser.Physics.Arcade.Body).setAllowGravity(false) })

    // actor
    this.actor = this.physics.add.sprite(200, 100, 'penta');
    const { width, height } = this.actor;
    this.actor.body.setCircle((width + height) / 4);
    this.grabberOffset = width / 2;

    const grabberR = 20;
    this.leftGrabber = this.physics.add.image(0, 0, 'empty');
    this.leftGrabber.body.setCircle(grabberR, -grabberR, -grabberR);// * grabberR, -grabberR, -grabberR);
    this.leftGrabber.body.setAllowGravity(false);
    this.rightGrabber = this.physics.add.image(0, 0, 'empty');
    this.rightGrabber.body.setCircle(grabberR, -grabberR, -grabberR);
    this.rightGrabber.body.setAllowGravity(false);

    if (layer) {
      this.physics.add.collider(this.actor, layer);
    }

    this.cursors = this.input.keyboard?.createCursorKeys();

    // KEYBOARD
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const { code, repeat } = e;
      if (!this.actor.body.onFloor()) {
        if (!repeat && ['ArrowLeft', 'ArrowRight'].includes(e.code)) {
          const grabber = code === 'ArrowLeft' ? this.leftGrabber : this.rightGrabber;
          if (!this.physics.overlap(grabber, this.handlers, (_, handler) => {
            const { x: handlerX, y: handlerY } = (handler as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.center;
            this.actor.setVelocity(0);
            this.grabbed = { x: handlerX, y: handlerY };
            this.hanging = true;
            this.rotationDirection = code === 'ArrowLeft' ? 1 : -1;
          })) {
            this.grabbed = null;
          }
        }
      }
      this.lastPressed = code;
    });

    this.input.keyboard?.on('keyup', (e: KeyboardEvent) => {
      const { code } = e;
      if (!this.actor.body.onFloor()) {
        if (this.lastPressed === code && ['ArrowLeft', 'ArrowRight'].includes(code)) {
          if (this.hanging) {
            const a = this.actor.rotation - Math.PI / 2;
            const v = this.jump;
            const vx = Math.cos(a) * v;
            const vy = Math.sin(a) * v;
            this.actor.setVelocityX(vx);
            this.actor.setVelocityY(vy);
          }
          this.hanging = false;
        }
      }
    });
  }

  update() {
    if (this.hanging) {
      // hanging
      if (this.grabbed) {
        this.actor.setVelocityY(0);
        const a = this.actor.rotation - .05 * this.rotationDirection;
        this.actor.rotation = a;
        const x = this.grabbed.x + Math.cos(a) * this.grabberOffset * this.rotationDirection;
        const y = this.grabbed.y + Math.sin(a) * this.grabberOffset * this.rotationDirection;

        this.actor.setPosition(x, y);
      } else {
        this.hanging = false;
      }
    } else {
      if (this.actor.body.onFloor()) {
        // jump
        if (this.cursors?.up.isDown) {
          this.actor.setVelocityY(-this.jump);
        }

        // walk
        if (this.cursors?.right.isDown) {
          this.actor.setVelocityX(this.walk);
        } else if (this.cursors?.left.isDown) {
          this.actor.setVelocityX(-this.walk);
        } else {
          this.actor.setVelocityX(0);
        }
      }
    }

    const v = this.actor.body.velocity;
    const offsetX = Math.cos(this.actor.rotation) * this.grabberOffset;
    const offsetY = Math.sin(this.actor.rotation) * this.grabberOffset;
    this.leftGrabber.setPosition(this.actor.x - offsetX, this.actor.y - offsetY);
    this.leftGrabber.body.velocity.copy(v);
    this.rightGrabber.setPosition(this.actor.x + offsetX, this.actor.y + offsetY);
    this.rightGrabber.body.velocity.copy(v);
  }
}
