//
const TO_RIGHT = 1,
    TO_LEFT = -1;

//
const IMG_OFFSET_V = 50,
    BlOCK_WIDTH = 101,
    BlOCK_HEIGHT = 83;

// 游戏背景面板块区数目
const ROWS_NUM = 7,
    COLS_NUM = 6;

// 图片资源的存储目录
const IMG_DIR = 'img/';

// 图片资源的文件名称
let groundImages = {
        stoneBlock: 'stone-block.png',
        waterBlock: 'water-block.png',
        grassBlock: 'grass-block.png',
    },
    propImages = {
        key: 'key.png',
        blueGem: 'gem-blue.png',
        greenGem: 'gem-green.png',
        orangeGem: 'gem-orange.png',
        star: 'star.png',
        heart: 'heart.png'
    },
    spriteImages = {
        enemy: 'enemy-bug.png',
        enemy_back: 'enemy-bug-back.png',
        player: 'char-boy.png',
        princess: 'char-princess-girl.png'
    };

class ImageBlock {
    /**
     * @description ImageBlock构造函数
     */
    constructor() {
        this.image = null;
    }

    /**
     * @description 绑定Image对象到ImageBlock实例上
     * @param imageElement {Image}
     */
    bindImage(imageElement) {
        this.image = imageElement;
    }

    /**
     * @description 用绑定在ImageBlock实例的Image对象渲染画布上由(row, col)指定的块区
     * @param row {Number}
     * @param col {Number}
     */
    render([row, col]) {
        if (this.image) {
            ctx.drawImage(this.image, col * BlOCK_WIDTH, row * BlOCK_HEIGHT);
        }
    }
}

class PropImageBlock extends ImageBlock {
    /**
     * @description PropImageBlock构造函数
     * @param offsetX {Number}
     * @param offsetY {Number}
     * @param width {Number}
     * @param height {Number}
     */
    constructor(offsetX = 30, offsetY = 70, width = 40, height = 40) {
        super();
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
    }

    render([row, col]) {
        if (this.image) {
            ctx.drawImage(this.image, col * BlOCK_WIDTH + this.offsetX,
                row * BlOCK_HEIGHT + this.offsetY, this.width, this.height);
        }
    }
}

/**
 * @description 游戏背景面板
 */
let ground = {
    blocks: [new ImageBlock(), new ImageBlock(), new ImageBlock()],
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
     * @description 为各ImageBlock实例绑定对应的Image实例
     */
    bindImages() {
        this.blocks[0].bindImage(resources.get(IMG_DIR + groundImages.stoneBlock));
        this.blocks[1].bindImage(resources.get(IMG_DIR + groundImages.grassBlock));
        this.blocks[2].bindImage(resources.get(IMG_DIR + groundImages.waterBlock));
    },

    /**
     * @description 渲染整个背景面板
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
 * @description 游戏道具
 */
let prop = {
    keyBlock: new PropImageBlock(38, 70, 24, 40),
    keyPosition: [3, 3],
    heartBlock: new PropImageBlock(),
    heartPosition: [4, 5],
    gemBlocks: [
        new PropImageBlock(),
        new PropImageBlock(),
        new PropImageBlock()
    ],
    gemPositions: [[0, 0], [3, 0], [2, 5]],

    bindImages() {
        this.keyBlock.bindImage(resources.get(IMG_DIR + propImages.key));
        this.heartBlock.bindImage(resources.get(IMG_DIR + propImages.heart));
        this.gemBlocks[0].bindImage(resources.get(IMG_DIR + propImages.blueGem));
        this.gemBlocks[1].bindImage(resources.get(IMG_DIR + propImages.greenGem));
        this.gemBlocks[2].bindImage(resources.get(IMG_DIR + propImages.orangeGem));
    },

    update() {

    },

    render() {
        this.keyBlock.render(this.keyPosition);
        this.heartBlock.render(this.heartPosition);
        let gemsNum = this.gemBlocks.length;
        for (let i = 0; i < gemsNum; i++) {
            this.gemBlocks[i].render(this.gemPositions[i]);
        }
    }
};

class SpriteImageBlock extends PropImageBlock {
    constructor(offsetX = 30, offsetY = 70, width = 40, height = 40, direction = TO_RIGHT) {
        super(offsetX, offsetY, width, height);
        this.direction = direction;
    }

    render([x, y]) {
        if (this.image) {
            ctx.drawImage(this.image, x, y + this.offsetY,
                this.width, this.height);
        }
    }
}

// let enemyImageBlock = new SpriteImageBlock(30, 65, 70, 50);
let enemyImageBlocks = [
    new SpriteImageBlock(30, 65, 70, 50),
    new SpriteImageBlock(30, 65, 70, 50)
];
/**
 * @description 敌人类
 */
class Enemy {
    constructor(row, initialCol, leftCol, rightCol, speed, initialDirection) {
        this.y = row * BlOCK_HEIGHT;
        this.x = initialCol * BlOCK_WIDTH;
        this.leftX = leftCol * BlOCK_WIDTH;
        this.rightX = (rightCol + 1) * BlOCK_WIDTH - enemyImageBlocks[0].width;
        this.speed = speed;
        this.direction = initialDirection;
    }

    static bindImage() {
        enemyImageBlocks[0].bindImage(resources.get(IMG_DIR + spriteImages.enemy));
        enemyImageBlocks[1].bindImage(resources.get(IMG_DIR + spriteImages.enemy_back));
    }

    update(dt) {
        let x = this.speed * this.direction * dt + this.x;
        if (x >= this.leftX && x <= this.rightX) {
            this.x = x;
        } else {
            this.direction *= -1;
        }
    }

    render() {
        let i = this.direction === TO_RIGHT ? 0 : 1;
        enemyImageBlocks[i].render([this.x, this.y]);
    }
}

// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
let allEnemies = [
    new Enemy(0, 3, 1, 5, 180, TO_RIGHT),
    new Enemy(1, 4, 3, 5, 100, TO_LEFT),
    new Enemy(2, 1, 0, 2, 100, TO_RIGHT),
    new Enemy(4, 1, 0, 2, 100, TO_LEFT),
    new Enemy(5, 4, 4, 5, 80, TO_RIGHT)
];

class RoleImageBlock extends PropImageBlock {

}

/**
 * @description 玩家类
 */
class Player {
    constructor() {
        this.image = null;
    }

    update() {

    }

    render() {

    }

    handleInput() {

    }
}



// 把玩家对象放进一个叫 player 的变量里面
let player = new Player();


// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function (e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});


