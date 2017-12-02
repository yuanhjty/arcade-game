/**
 * @file app.js
 *
 * 游戏地图被分为规则紧密排列的等大矩形块，以方便渲染。
 *
 * 为满足显示效果的需求，用于渲染“地面”的图片在竖直方向上存在一块透明区域，
 * “地面块”可见行高为对应图片的非透明区域的高度，这导致各行地面块实际上是
 * 部分层叠的，下一行图片的透明区域覆盖在上一行的非透明区域上。
 *
 * 因此，各行地面块的可见部分相对于本行实际位置在竖直方向存在一个偏移量。
 * 在地图上渲染道具和角色时，道具块和角色块的位置以可见区域为基准，它们
 * 的实际位置用这个偏移量来修正。
 */

// 常量定义
const TO_RIGHT = 1,     // 方向常量
    TO_LEFT = -1,       // 方向常量
    KEY_LEFT = 37,      // 键盘方向键码
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    GROUND_OFFSET_V = 50,   // 地图块竖直方向偏移量
    BlOCK_WIDTH = 101,      // 地图块宽度
    BlOCK_HEIGHT = 83,      // 地图块高度
    ROWS_NUM = 7,       // 地图块行数
    COLS_NUM = 6,       // 地图块列数
    IMG_DIR = 'img/',   // 图片资源目录

    // 图片资源名称
    groundImages = {    // 地面图片
        stoneBlock: 'stone-block.png',
        waterBlock: 'water-block.png',
        grassBlock: 'grass-block.png',
    },
    propImages = {      // 道具图片
        key: 'key.png',
        blueGem: 'gem-blue.png',
        greenGem: 'gem-green.png',
        orangeGem: 'gem-orange.png',
        star: 'star.png',
        heart: 'heart.png'
    },
    spriteImages = {    // 角色图片
        enemy: 'enemy-bug.png',
        enemy_back: 'enemy-bug-back.png',
        player: 'char-boy.png',
        princess: 'char-princess-girl.png'
    };

/**
 * 渲染块，一个渲染块可以用绑定在其上的图片渲染画布的指定块区
 */
class RenderBlock {
    /**
     * @param offsetX {Number} 渲染块相对于所在地面块的 x 偏移量
     * @param offsetY {Number} 渲染块相对于所在地面块的 x 偏移量
     * @param width {Number} 渲染块宽度
     * @param height {Number} 渲染块高度
     */
    constructor(offsetX, offsetY, width, height) {
        this.image = null;          // 渲染块渲染指定块区所用的图片
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
    }

    /**
     * 为渲染块绑定图片
     * @param imageElement {Image}
     */
    bindImage(imageElement) {
        this.image = imageElement;
    }

    /**
     * @param x {Number} 要渲染区域的 x 坐标
     * @param y {Number} 要渲染区域的 y 坐标
     */
    render([x, y]) {
        if (this.image) {
            ctx.drawImage(this.image, Math.floor(x) + this.offsetX,
                Math.floor(y) + this.offsetY, this.width, this.height);
        }
    }
}

/**
 * TODO: 描述 GroundBlock 类
 */
class GroundBlock extends RenderBlock {
    /**
     * @param offsetX {Number}
     * @param offsetY {Number}
     * @param width {Number}
     * @param height {Number}
     */
    constructor(offsetX = 0, offsetY = 0, width = 101, height = 171) {
        super(offsetX, offsetY, width, height);
    }

    /**
     * @param col {Number} 要渲染的地面块所属的行
     * @param row {Number} 要渲染的地面块所属的列
     */
    render([row, col]) {
        super.render([col * BlOCK_WIDTH, row * BlOCK_HEIGHT]);
    }
}

/**
 *  TODO: 描述 PropBlock 类
 */
class PropBlock extends GroundBlock {
    /**
     * @param offsetX {Number}
     * @param offsetY {Number}
     * @param width {Number}
     * @param height {Number}
     */
    constructor(offsetX = 30, offsetY = 70, width = 40, height = 40) {
        super(offsetX, offsetY, width, height);
    }
}

/**
 * 地面渲染对象
 */
let ground = {
    blocks: [new GroundBlock(), new GroundBlock(), new GroundBlock()],
    map: [
        [1, 0, 0, 0, 0, 0],
        [2, 2, 1, 0, 0, 0],
        [0, 0, 0, 2, 1, 1],
        [1, 2, 1, 1, 2, 2],
        [0, 0, 0, 2, 1, 1],
        [1, 1, 2, 2, 0, 0],
        [2, 1, 1, 1, 1, 1],
    ],

    /**
     * 为各 GroundBlock 实例绑定对应的 Image 实例
     */
    bindImages() {
        this.blocks[0].bindImage(resources.get(IMG_DIR + groundImages.stoneBlock));
        this.blocks[1].bindImage(resources.get(IMG_DIR + groundImages.grassBlock));
        this.blocks[2].bindImage(resources.get(IMG_DIR + groundImages.waterBlock));
    },

    /**
     * 渲染地面
     */
    render() {
        let rowsNum = this.map.length,
            colsNum = this.map[0].length;
        for (let row = 0; row < rowsNum; row++) {
            for (let col = 0; col < colsNum; col++) {
                this.blocks[this.map[row][col]].render([row, col]);
            }
        }
    }
};

/**
 * 道具渲染对象
 */
let prop = {
    keyBlock: new PropBlock(38, 70, 24, 40),
    keyPosition: [3, 3],
    heartBlock: new PropBlock(),
    heartPosition: [4, 5],
    gemBlocks: [new PropBlock(), new PropBlock(), new PropBlock()],
    gemPositions: [[0, 0], [3, 0], [2, 5]],

    /**
     * 为各 PropBlock 实例绑定对应的 Image 实例
     */
    bindImages() {
        this.keyBlock.bindImage(resources.get(IMG_DIR + propImages.key));
        this.heartBlock.bindImage(resources.get(IMG_DIR + propImages.heart));
        this.gemBlocks[0].bindImage(resources.get(IMG_DIR + propImages.blueGem));
        this.gemBlocks[1].bindImage(resources.get(IMG_DIR + propImages.greenGem));
        this.gemBlocks[2].bindImage(resources.get(IMG_DIR + propImages.orangeGem));
    },

    /**
     * 渲染道具
     */
    render() {
        this.keyBlock.render(this.keyPosition);
        this.heartBlock.render(this.heartPosition);
        let gemsNum = this.gemBlocks.length;
        for (let i = 0; i < gemsNum; i++) {
            this.gemBlocks[i].render(this.gemPositions[i]);
        }
    }
};

/**
 * 敌人渲染块数组
 */
let enemyBlocks = [
    new RenderBlock(0, 65, 70, 50),     // 方向向右的敌人渲染块
    new RenderBlock(0, 65, 70, 50)      // 方向向左的敌人渲染块
];

/**
 * 敌人类
 */
class Enemy {
    /**
     * @param row {Number}
     * @param col {Number}
     * @param leftCol {Number}
     * @param rightCol {Number}
     * @param speed {Number}
     * @param direction {Number}
     */
    constructor(row, col, leftCol, rightCol, speed, direction) {
        this.x = col * BlOCK_WIDTH;
        this.y = row * BlOCK_HEIGHT;
        this.leftX = leftCol * BlOCK_WIDTH;
        this.rightX = (rightCol + 1) * BlOCK_WIDTH - enemyBlocks[0].width;
        this.speed = speed;
        this.direction = direction;
    }

    /**
     * 为敌人渲染块绑定图片
     */
    static bindImage() {
        enemyBlocks[0].bindImage(resources.get(IMG_DIR + spriteImages.enemy));
        enemyBlocks[1].bindImage(resources.get(IMG_DIR + spriteImages.enemy_back));
    }

    /**
     * 更新敌人位置
     * @param dt {Number} 与上次跟新之间的时间间隔
     */
    update(dt) {
        let x = this.speed * this.direction * dt + this.x;
        if (x >= this.leftX && x <= this.rightX) {
            this.x = x;
        } else {
            this.direction *= -1;
        }
    }

    /**
     * 渲染敌人
     */
    render() {
        let i = this.direction === TO_RIGHT ? 0 : 1;
        enemyBlocks[i].render([this.x, this.y]);
    }
}

/**
 * 所有敌人实例的数组
 */
let allEnemies = [
    new Enemy(0, 3, 1, 5, 180, TO_RIGHT),
    new Enemy(1, 4, 3, 5, 100, TO_LEFT),
    new Enemy(2, 1, 0, 2, 100, TO_RIGHT),
    new Enemy(4, 1, 0, 2, 100, TO_LEFT),
    new Enemy(5, 4, 4, 5, 80, TO_RIGHT)
];

/**
 * 玩家渲染块
 */
let playerBlock = new RenderBlock(0, 65, 50, 50);

/**
 * 玩家类
 */
class Player {
    /**
     * @param row {Number}
     * @param col {Number}
     * @param speed {Number}
     */
    constructor(row, col, speed = 100) {
        this.x = col * BlOCK_WIDTH;
        this.y = row * BlOCK_HEIGHT;
        this.speed = speed;
        this.keyMove = -1;
        this.lastKeyMove = -1;
    }

    /**
     * 为玩家渲染块绑定图片
     */
    static bindImage() {
        playerBlock.bindImage(resources.get(IMG_DIR + spriteImages.player));
    }

    /**
     * 更新玩家位置
     * @param dt {Number}
     */
    update(dt) {
        switch (this.keyMove) {
            case KEY_LEFT:
                this.x -= this.speed * dt;
                break;
            case KEY_RIGHT:
                this.x += this.speed * dt;
                break;
            case KEY_UP:
                this.y -= this.speed * dt;
                break;
            case KEY_DOWN:
                this.y += this.speed * dt;
                break;
            default:
                break;
        }
    }

    /**
     * 渲染玩家
     */
    render() {
        playerBlock.render([this.x, this.y]);
    }

    /**
     * 处理玩家键盘事件
     * @param e {Event} 玩家触发的键盘事件
     */
    handleInput(e) {
        switch (e.keyCode) {
            case KEY_LEFT:
            case KEY_RIGHT:
            case KEY_UP:
            case KEY_DOWN:
                if (e.type === 'keydown') {
                    if (e.keyCode !== this.keyMove) {
                        this.lastKeyMove = this.keyMove;
                    }
                    this.keyMove = e.keyCode;
                } else if (e.type === 'keyup') {
                    if (e.keyCode === this.keyMove) {
                        this.keyMove = this.lastKeyMove;
                    }
                    this.lastKeyMove = -1;
                }
                break;
            default:
                break;
        }
    }
}

/**
 * 玩家实例
 */
let player = new Player(6, 2.3, 100);
