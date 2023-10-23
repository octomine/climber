export class MyScene extends Phaser.Scene {
  GAME_WIDTH = 640;
  GAME_HEIGHT = 980;

  parent!: Phaser.Structs.Size;
  sizer!: Phaser.Structs.Size;

  private map!: Phaser.Tilemaps.Tilemap;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  private actor!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private leftGrabber!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private rightGrabber!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private grabberOffset = 0;
  private rotationDirection = 1;

  private handlers!: Phaser.Physics.Arcade.Group;
  private hanging = false;
  private isDown: Record<string, boolean> = {
    'ArrowLeft': false,
    'ArrowRight': false,
  }
  private grabbed!: { x: number, y: number } | null;
  private lastPressed = '';
  private fall = false;

  private walk = 200;
  private jump = 400;

  constructor() {
    super('main');
  }

  preload() {
    this.load.image('tile', 'assets/image/tile.png');
    this.load.image('handler', 'assets/image/handler.png');
    this.load.image('penta', 'assets/image/img.png');
    this.load.image('hand', 'assets/image/hand.png');
    this.load.image('empty', 'assets/image/empty.png');
  }

  create() {
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;

    this.parent = new Phaser.Structs.Size(width, height);
    this.sizer = new Phaser.Structs.Size(this.GAME_WIDTH, this.GAME_HEIGHT, Phaser.Structs.Size.FIT, this.parent);

    this.parent.setSize(width, height);
    this.sizer.setSize(width, height);

    this.updateCamera();

    this.scale.on('resize', this.resize, this);

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

    const arr = new Array(7).fill(null);
    const r = 100;
    const xc = 300;
    const yc = 250;
    this.handlers = this.physics.add.group(
      arr.map((_, i) => {
        const a = (i % 2 === 0 ? .2 : 0) + i * Math.PI / 3;
        const x = xc + r * Math.cos(a);
        const y = yc + r * Math.sin(a);
        return this.physics.add.image(i === 6 ? xc : x, i === 6 ? yc : y, 'handler');
      }));
    this.handlers.children.each((child) => {
      (child.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      (child.body as Phaser.Physics.Arcade.Body).setCircle(18);
    })

    // actor
    this.actor = this.physics.add.sprite(200, 100, 'penta');
    const { width: actorWidth, height: actorHeight } = this.actor;
    this.actor.body.setCircle((actorWidth + actorHeight) / 4);
    this.grabberOffset = actorWidth / 2;

    const grabberR = 20;
    this.leftGrabber = this.physics.add.image(0, 0, 'hand');
    this.leftGrabber.body.setCircle(grabberR, -grabberR / 2, -grabberR / 2);
    this.leftGrabber.body.setAllowGravity(false);
    this.leftGrabber.flipX = true;
    this.rightGrabber = this.physics.add.image(0, 0, 'hand');
    this.rightGrabber.body.setCircle(grabberR, -grabberR / 2, -grabberR / 2);
    this.rightGrabber.body.setAllowGravity(false);

    if (layer) {
      this.physics.add.collider(this.actor, layer);
    }

    // camera
    this.cameras.main.setBounds(0, 0, 800, 600).setName('main');
    this.cameras.main.startFollow(this.actor, false, .2, .2);

    // ---
    this.cursors = this.input.keyboard?.createCursorKeys();

    const onDown = (code: string, repeat = false) => {
      this.isDown[code] = true;
      if (!this.actor.body.onFloor()) {
        if (!repeat && ['ArrowLeft', 'ArrowRight'].includes(code)) {
          const grabber = code === 'ArrowLeft' ? this.leftGrabber : this.rightGrabber;
          if (!this.physics.overlap(grabber, this.handlers, (_, handler) => {
            const { x: handlerX, y: handlerY } = (handler as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.center;
            this.actor.setVelocity(0);
            this.grabbed = { x: handlerX, y: handlerY };
            this.hanging = true;
            this.rotationDirection = code === 'ArrowLeft' ? 1 : -1;
          })) {
            this.grabbed = null;
            this.fall = true;
          }
        }
      }
      this.lastPressed = code;
    }

    const onUp = (code: string) => {
      this.isDown[code] = false;
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
    }

    // KEYBOARD
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const { code, repeat } = e;
      onDown(code, repeat);
    });

    this.input.keyboard?.on('keyup', (e: KeyboardEvent) => {
      const { code } = e;
      onUp(code);
    });

    // MOUSE
    this.input.on('pointerdown', (e: Phaser.Input.Pointer) => {
      const code = e.downX > this.sizer.width / 2 ? 'ArrowRight' : 'ArrowLeft';
      onDown(code);
    });

    this.input.on('pointerup', (e: Phaser.Input.Pointer) => {
      const code = e.downX > this.sizer.width / 2 ? 'ArrowRight' : 'ArrowLeft';
      onUp(code);
    })
  }

  resize({ width, height }: { width: number, height: number }) {
    this.parent.setSize(width, height);
    this.sizer.setSize(width, height);

    this.updateCamera();
  }

  updateCamera() {
    const camera = this.cameras.main;

    const x = Math.ceil((this.parent.width - this.sizer.width) / 2);
    const y = 0;
    const scaleX = this.sizer.width / this.GAME_WIDTH;
    const scaleY = this.sizer.height / this.GAME_HEIGHT;

    camera.setViewport(x, y, this.sizer.width, this.sizer.height);
    camera.setZoom(scaleX, scaleY);
    camera.centerOn(this.GAME_WIDTH / 2, this.GAME_HEIGHT / 2);
  }

  update() {
    this.grabberOffset = this.actor.width / 2;
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
        this.actor.rotation = 0;
        this.fall = false;
        // jump
        this.grabberOffset = -this.actor.width / 4;
        if (this.cursors?.up.isDown) {
          this.actor.setVelocityY(-this.jump);
        }

        // walk
        if (this.isDown.ArrowRight && this.isDown.ArrowLeft) {
          this.actor.setVelocityX(0);
        } else if (this.isDown.ArrowRight) {
          this.actor.setVelocityX(this.walk);
        } else if (this.isDown.ArrowLeft) {
          this.actor.setVelocityX(-this.walk);
        } else {
          this.actor.setVelocityX(0);
        }
      } else {
        if (this.fall) {
          this.actor.rotation *= .97;
        } else {
          const { x, y } = this.actor.body.velocity;
          const s = Math.sign(x);
          const a = Math.atan(y / x) + (s === 0 ? 1 : s) * Math.PI / 2;
          this.actor.rotation = Number.isNaN(a) ? 0 : a;
        }
      }
    }

    const v = this.actor.body.velocity;
    const offsetX = Math.cos(this.actor.rotation) * this.grabberOffset;
    const offsetY = Math.sin(this.actor.rotation) * this.grabberOffset;
    this.leftGrabber.setPosition(this.actor.x - offsetX, this.actor.y - offsetY);
    this.leftGrabber.setRotation(this.actor.rotation);
    this.leftGrabber.body.velocity.copy(v);
    this.rightGrabber.setPosition(this.actor.x + offsetX, this.actor.y + offsetY);
    this.rightGrabber.setRotation(this.actor.rotation);
    this.rightGrabber.body.velocity.copy(v);
  }
}
