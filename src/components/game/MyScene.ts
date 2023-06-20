import { BodyType, ConstraintType } from "matter";

export class MyScene extends Phaser.Scene {
  private MP!: Phaser.Physics.Matter.MatterPhysics;

  private map!: Phaser.Tilemaps.Tilemap;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  private actor!: Phaser.Physics.Matter.Sprite;
  private grabberLeft!: BodyType;
  private grabberRight!: BodyType;
  private cstr!: ConstraintType;

  private handlers!: Phaser.Physics.Arcade.Group;
  private hanging: boolean = false;
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

    this.MP = new Phaser.Physics.Matter.MatterPhysics(this);

    const { bodies, body } = this.MP;
    const x = 45;
    const y = 44;
    const offsetX = 40;
    const offsetY = 20;

    const mainBody = bodies.circle(x, y, 30);
    this.grabberLeft = bodies.circle(x - offsetX, y - offsetY, 10, { mass: .01 });
    this.grabberRight = bodies.circle(x + offsetX, y - offsetY, 10, { mass: .01 });
    const finalBody = body.create({ parts: [mainBody, this.grabberLeft, this.grabberRight] });
    this.actor = this.matter.add.sprite(0, 0, 'penta');
    this.actor.setExistingBody(finalBody);
    this.actor.setFixedRotation().setPosition(200, 100);

    this.cstr = this.matter.add.constraint(this.grabberLeft, this.grabberRight, 50, 1);
    // this.handlers = this.physics.add.group({
    //   key: 'handler',
    //   quantity: 2,
    //   setXY: { x: 200, y: 300 },
    //   "setXY.stepX": 150,
    //   "setXY.stepY": -100,
    //   allowGravity: false,
    // });

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
      if (e.code === 'Space') {

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

    // this.input.keyboard?.on('keyup', (e: KeyboardEvent) => {
    //   const { code } = e;
    //   if (code === 'Space') {
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
    //     this.hanging = false;
    //   }
    // });

  }

  update() {
    // if (this.hanging) {
    //   // hanging
    //   this.actor.setPosition(this.grabbed.x, this.grabbed.y);
    //   this.actor.setVelocityY(0);
    //   this.actor.setRotation(1)
    //   // this.actor.angle++;
    //   this.actor.refreshBody();
    // } else {
    //   // jump
    if (this.cursors?.up.isDown) {
      // if (this.actor.body.onFloor()) {
      this.actor.setVelocityY(-3);
      // }
    }

    //   // walk
    //   if (this.actor.body.onFloor()) {
    if (this.cursors?.right.isDown) {
      this.actor.setVelocityX(1);
    } else if (this.cursors?.left.isDown) {
      this.actor.setVelocityX(-1);
    } else {
      this.actor.setVelocityX(0);
    }

    if (this.cursors?.down.isDown) {
      this.cstr.angleA++;
    }
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
