import { BodyType, ConstraintType, Vector } from "matter";

export class MyScene extends Phaser.Scene {
  private MP!: Phaser.Physics.Matter.MatterPhysics;

  private map!: Phaser.Tilemaps.Tilemap;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  private offsetX = 40;
  private offsetY = 0;

  private actor!: Phaser.Physics.Matter.Sprite;
  private grabberLeft!: BodyType;
  private grabberRight!: BodyType;
  private rotationPoint!: Phaser.Math.Vector2;
  private rotationDirection!: number;
  private lastDown!: string;

  private handlers!: Phaser.Physics.Arcade.Group;
  private handler!: Phaser.Physics.Matter.Image;
  private hanging: boolean = false;
  private count: number = 0;
  private grabbed!: { x: number, y: number };

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
    if (layer) {
      this.matter.world.convertTilemapLayer(layer);
    }

    this.handler = this.matter.add.image(200, 300, 'handler', 0, {
      ignoreGravity: true,
      isSensor: true,
    });


    // this.handlers = this.physics.add.group({
    //   key: 'handler',
    //   quantity: 2,
    //   setXY: { x: 200, y: 300 },
    //   "setXY.stepX": 150,
    //   "setXY.stepY": -100,
    //   allowGravity: false,
    // });

    this.MP = new Phaser.Physics.Matter.MatterPhysics(this);

    const { bodies, body } = this.MP;
    const x = 45;
    const y = 44;

    const mainBody = bodies.circle(x, y, 30);
    this.grabberLeft = bodies.circle(x - this.offsetX, y - this.offsetY, 10, { mass: .01 });
    this.grabberRight = bodies.circle(x + this.offsetX, y - this.offsetY, 10, { mass: .01 });
    const finalBody = body.create({ parts: [mainBody, this.grabberLeft, this.grabberRight] });
    this.actor = this.matter.add.sprite(0, 0, 'penta');
    this.actor.setExistingBody(finalBody);
    this.actor.setFixedRotation().setPosition(200, 100);

    // // actor
    // this.actor = this.physics.add.sprite(200, 100, 'penta');
    // this.grabberOffset = this.actor.width / 3;

    // this.leftGrabber = this.physics.add.image(0, 0, '');
    // this.leftGrabber.body.setCircle(20);
    // this.leftGrabber.body.setAllowGravity(false);
    // this.rightGrabber = this.physics.add.image(0, 0, '');
    // this.rightGrabber.body.setCircle(20);
    // this.rightGrabber.body.setAllowGravity(false);

    // if (layer) {
    //   this.physics.add.collider(this.actor, layer);
    // }

    this.cursors = this.input.keyboard?.createCursorKeys();

    // // KEYBOARD
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const { code, repeat } = e;
      if (!repeat && ['ArrowRight', 'ArrowLeft'].includes(code)) {
        const grabber = code === 'ArrowRight' ? this.grabberRight : this.grabberLeft;
        const { x, y } = grabber.position;
        this.MP.overlap(grabber, [this.handler.body as BodyType], (a, b) => {
          console.log((b as Phaser.Types.Physics.Arcade.GameObjectWithBody));
        })
        this.rotationPoint = new Phaser.Math.Vector2(x, y);
        this.rotationDirection = code == 'ArrowRight' ? 1 : -1;

        this.count = 0;
        this.hanging = true;
        this.lastDown = code;
        //     this.physics.overlap(this.leftGrabber, this.handlers, (grabber, handler) => {
        //       const { x: handlerX, y: handlerY } = (handler as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.center;
        //       const { x: grabberX, y: grabberY } = (grabber as Phaser.Types.Physics.Arcade.GameObjectWithBody).body.center;
        //       const originX = ((this.actor.width / 2) - (this.actor.x - grabberX)) / this.actor.width;
        //       const originY = ((this.actor.height / 2) - (this.actor.y - grabberY)) / this.actor.height;
        //       // this.actor.setOrigin(originX, originY);
        //       this.actor.x = handlerX;
        //       this.actor.y = handlerY;
        //       this.actor.setVelocity(0);
        //       this.grabbed = { x: handlerX, y: handlerY };
        //       this.hanging = true;
        //     })
      }
    });

    this.input.keyboard?.on('keyup', (e: KeyboardEvent) => {
      const { code } = e;
      if (this.lastDown === code && ['ArrowRight', 'ArrowLeft'].includes(code)) {
        if (this.cursors?.left.isUp && this.cursors.right.isUp) {
          const a = this.actor.rotation - Math.PI / 2;
          const p = this.count / 25;
          const vx = Math.cos(a) * p;
          const vy = Math.sin(a) * p;
          this.actor.setVelocityX(vx);
          this.actor.setVelocityY(vy);
        }
        //     if (this.hanging) {
        //       if (this.cursors?.up.isDown) {
        //         this.actor.setVelocityY(-300);
        //       }
        //       if (this.cursors?.right.isDown) {
        //         this.actor.setVelocityX(100);
        //       }
        //       if (this.cursors?.left.isDown) {
        //         this.actor.setVelocityX(-100);
        //       }
        //     }

        this.hanging = false;
      }
    });

  }

  update() {
    if (this.hanging) {
      this.actor.rotation += .1 * this.rotationDirection;
      const r = Math.sqrt(Math.pow(this.offsetX, 2) + Math.pow(this.offsetY, 2));
      const { x, y } = this.rotationPoint;
      const newX = x - r * Math.cos(this.actor.rotation) * this.rotationDirection;
      const newY = y - r * Math.sin(this.actor.rotation) * this.rotationDirection;
      this.actor.setPosition(newX, newY);
      this.count++;
      // hanging
      //   this.actor.setPosition(this.grabbed.x, this.grabbed.y);
      //   this.actor.setVelocityY(0);
      //   this.actor.setRotation(1)
      //   // this.actor.angle++;
      //   this.actor.refreshBody();
    } //else {
    //   // jump
    // if (this.cursors?.up.isDown) {
    //   // if (this.actor.body.onFloor()) {
    //   this.actor.setVelocityY(-3);
    //   // }
    // }

    //   // walk
    //   if (this.actor.body.onFloor()) {
    // if (this.cursors?.right.isDown) {
    //   this.actor.setVelocityX(1);
    // } else if (this.cursors?.left.isDown) {
    //   this.actor.setVelocityX(-1);
    // } else {
    //   this.actor.setVelocityX(0);
    // }

    // if (this.cursors?.down.isDown) {
    //   //
    // }
    //   }
    // }

    // // TODO: допилить вращение
    // const v = this.actor.body.velocity;
    // this.leftGrabber.setPosition(this.actor.x - this.grabberOffset, this.actor.y);
    // this.leftGrabber.body.velocity.copy(v);
    // this.rightGrabber.setPosition(this.actor.x + this.grabberOffset, this.actor.y);
    // this.rightGrabber.body.velocity.copy(v);
  }
}
