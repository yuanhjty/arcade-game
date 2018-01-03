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

/***** 常量定义 */
const
  TO_RIGHT = 1,   // 方向常量
  TO_LEFT = -1,

  KEY_LEFT = 37,  // 键盘方向键码
  KEY_UP = 38,
  KEY_RIGHT = 39,
  KEY_DOWN = 40,

  OFFSET_V = 50,  // 地图块竖直方向偏移量
  COL_W = 101,    // 地图块宽度
  ROW_H = 83,     // 地图块高度
  ROWS_NUM = 7,   // 地图块行数
  COLS_NUM = 6,   // 地图块列数

  GROUND_IMG_WIDTH = 101,     // 地面渲染图片尺寸
  GROUND_IMG_HEIGHT = 171,

  PROP_KEY_WIDTH = 20,        // 游戏组件尺寸
  PROP_KEY_HEIGHT = 40,
  PROP_HEART_WIDTH = 30,
  PROP_HEART_HEIGHT = 30,
  PROP_GEM_WIDTH = 30,
  PROP_GEM_HEIGHT = 30,
  ENEMY_WIDTH = 70,
  ENEMY_HEIGHT = 50,
  PLAYER_WIDTH = 50,
  PLAYER_HEIGHT = 50,

  IMG_DIR = 'img/',   // 图片资源目录

  // 图片资源url
  groundImages = {    // 地面图片
    stoneBlock: IMG_DIR + 'stone-block.png',
    waterBlock: IMG_DIR + 'water-block.png',
    grassBlock: IMG_DIR + 'grass-block.png',
    door: IMG_DIR + 'door-closed.png',
    dimes: IMG_DIR + 'dimes.png',
    beauty: IMG_DIR + 'beauty.png',
    precious: IMG_DIR + 'precious.png'
  },
  propImages = {      // 道具图片
    propPanel: IMG_DIR + 'prop-panel-background.png',
    keyDim: IMG_DIR + 'key-dim.png',
    gemDim: IMG_DIR + 'gem-dim.png',
    heartDim: IMG_DIR + 'heart-dim.png',
    key: IMG_DIR + 'key.png',
    blueGem: IMG_DIR + 'gem-blue.png',
    greenGem: IMG_DIR + 'gem-green.png',
    orangeGem: IMG_DIR + 'gem-orange.png',
    star: IMG_DIR + 'star.png',
    heart: IMG_DIR + 'heart.png'
  },
  spriteImages = {    // 精灵图片
    enemyToRight: IMG_DIR + 'enemy-bug.png',
    enemyToLeft: IMG_DIR + 'enemy-bug-back.png',
    player: IMG_DIR + 'char-boy.png',
    princess: IMG_DIR + 'char-princess-girl.png'
  },
  promptImages = {
    dimes: IMG_DIR + 'prompt-dimes.png',
    beauty: IMG_DIR + 'prompt-beauty.png',
    precious: IMG_DIR + 'prompt-precious.png',
  }

/**
 * 矩形区域渲染器
 */
class RectRenderer {
  /**
   * @constructor
   * @param x
   * @param y
   * @param width
   * @param height
   */
  constructor ([x = 0, y = 0] = [], [width = 0, height = 0] = []) {
    this.rect = new Rect([x, y], [width, height])
  }

  /**
   * @param x
   * @param y
   */
  setPosition (x, y) {
    this.rect.x = x
    this.rect.y = y
  }

  /**
   * @param width
   * @param height
   */
  setSize (width, height) {
    this.rect.width = width
    this.rect.height = height
  }

  /**
   * @param ctx {CanvasRenderingContext2D}
   * @param image {Image}
   */
  render (ctx, image) {
    if (ctx && image) {
      ctx.drawImage(image, this.rect.x, this.rect.y,
        this.rect.width, this.rect.height)
    }
  }
}

/**
 * 地面渲染块
 */
class GroundBlockRender {
  /**
   * @constructor
   * @param width
   * @param height
   */
  constructor (width = GROUND_IMG_WIDTH, height = GROUND_IMG_HEIGHT) {
    this.width = width
    this.height = height
  }

  /**
   * 渲染由(行,列)指定的地面快
   * @param ctx {CanvasRenderingContext2D}
   * @param image {Image}
   * @param row {Number} 地面块所在行
   * @param col {Number} 地面块所在列
   */
  render (ctx, image, [row, col]) {
    if (ctx && image) {
      ctx.drawImage(image, COL_W * col, ROW_H * row,
        this.width, this.height)
    }
  }
}

/**
 * 道具类
 */
class Prop extends RectRenderer {
  /**
   * @constructor
   * @param x
   * @param y
   * @param width
   * @param height
   */
  constructor (x = 0, y = 0, width = 0, height = 0) {
    super([x, y], [width, height])
    this.image = null
  }

  /**
   * 更新道具状态
   */
  update () {
    // 可扩展
  }

  /**
   * 渲染道具
   * @param ctx
   */
  render (ctx) {
    super.render(ctx, this.image)
  }
}

/**
 * 钥匙道具类
 */
class Key extends Prop {
  /**
   * @constructor
   * @param x
   * @param y
   * @param width
   * @param height
   */
  constructor (x = 0, y = 0, width = PROP_KEY_WIDTH, height = PROP_KEY_HEIGHT) {
    super(x, y, width, height)
  }

  /**
   * 设置道具栏钥匙状态
   */
  setPropPanel () {
    enemiesManager.speedUp(20)
    let panel = propsManager.propsPanel
    panel.key.src = this.image.src
    panel.hasKey = true

    // 添加动画特效
    panel.key.classList.add('bounce')
    setTimeout(() => {
      panel.key.classList.remove('bounce')
    }, 800)

    if (panel.hasStar) {
      playerManager.forbiddenRanges.pop()
    }
  }
}

/**
 * 红心道具类
 */
class Heart extends Prop {
  /**
   * @constructor
   * @param x
   * @param y
   * @param width
   * @param height
   */
  constructor (x = 0, y = 0, width = PROP_HEART_WIDTH, height = PROP_HEART_HEIGHT) {
    super(x, y, width, height)
  }

  /**
   * 设置道具栏红心状态
   */
  setPropPanel () {
    let panel = propsManager.propsPanel
    let n = panel.heartsNumber
    if (n < 3 && n > 0) {
      panel.hearts[n].src = this.image.src
      panel.heartsNumber++

      // 添加动画特效
      panel.hearts[n].classList.add('bounce')
      setTimeout(() => {
        panel.hearts[n].classList.remove('bounce')
      }, 800)
    }
  }
}

/**
 * 宝石道具类
 */
class Gem extends Prop {
  /**
   * @constructor
   * @param color {String}
   * @param x
   * @param y
   * @param width
   * @param height
   */
  constructor (color = 'blue', x = 0, y = 0,
               width = PROP_GEM_WIDTH, height = PROP_GEM_HEIGHT) {
    super(x, y, width, height)
    this.color = color
  }

  /**
   * 设置道具栏宝石状态
   */
  setPropPanel () {
    enemiesManager.speedUp(20)
    propsManager.selectedGems.push(this)
    let panel = propsManager.propsPanel
    let n = panel.gemsNumber
    panel.gems[n].src = this.image.src
    panel.gemsNumber++

    // 添加动画特效
    panel.gems[n].classList.add('bounce')
    setTimeout(() => {
      panel.gems[n].classList.remove('bounce')
    }, 800)

    if (panel.gemsNumber === 3) {
      setTimeout(() => {
        panel.star.classList.remove('hide')
        panel.star.classList.add('show')
        panel.star.classList.add('zoomIn')
      }, 1000)
      setTimeout(() => {
        panel.star.classList.remove('zoomIn')
        groundManager.groundPanel.classList.add('pulse')
        setTimeout(() => {
          groundManager.map[6][0] = 3
          groundManager.groundPanel.classList.remove('pulse')
        }, 800)
      }, 2000)
      panel.hasStar = true
      if (panel.hasKey) {
        playerManager.forbiddenRanges.pop()
      }
    }
  }

}

/**
 * 敌人精灵类
 */
class Enemy extends RectRenderer {
  /**
   * @constructor
   * @param x
   * @param y
   * @param speed
   * @param direction
   */
  constructor (x = 0, y = 0, speed = 100, direction = TO_RIGHT) {
    super([x, y], [ENEMY_WIDTH, ENEMY_HEIGHT])
    this.speed = speed
    this.direction = direction
  }

  /**
   * 获得敌人精灵的形状矩形集
   * @returns {Array}
   */
  get shapeRects () {
    let relationMatrix = this.direction === TO_LEFT ? enemiesManager.shapeRelationMatrix[0] : enemiesManager.shapeRelationMatrix[1]
    return getShapeRects(this.rect, relationMatrix)
  }

  /**
   * 设置属性
   * @param x
   * @param y
   * @param speed
   * @param direction
   */
  setAttribute (x, y, speed, direction) {
    this.setPosition(x, y)
    this.speed = speed
    this.direction = direction
  }

  /**
   * 加速
   * @param dealtSpeed
   */
  speedUp (dealtSpeed) {
    this.speed += dealtSpeed
  }

  /**
   * 更新敌人精灵状态
   * @param dt
   * @param homeRange {Rect}
   */
  update (dt, homeRange) {
    let dx = this.speed * this.direction * dt
    this.rect.x += dx
    if (!inRect(this.rect, homeRange)) {
      this.rect.x -= dx
      this.direction *= -1
    }
  }

  /**
   * 渲染敌人精灵
   */
  render () {
    let enemyImage = this.direction === TO_RIGHT ? spriteImages.enemyToRight : spriteImages.enemyToLeft
    super.render(ctx, resources.get(enemyImage))

    // 用于测试和调节shapeRects
    // let rects = this.shapeRects;
    // ctx.fillStyle = 'green';
    // for (let rect of rects) {
    //     ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    // }
  }
}

/**
 * 玩家精灵类
 */
class Player extends RectRenderer {
  /**
   * @constructor
   * @param x
   * @param y
   * @param speed
   */
  constructor (x = 0, y = 0, speed = 100) {
    super([x, y], [PLAYER_WIDTH, PLAYER_HEIGHT])
    this.speed = speed
    this.keyMove = -1
    this.lastKeyMove = -1
    this.inCollision = false
  }

  /**
   * 设置位置和速度属性
   * @param x
   * @param y
   * @param speed
   */
  setAttribute (x, y, speed, blood) {
    this.setPosition(x, y)
    this.speed = speed
  }

  /**
   * 获得模拟精灵实际形状的矩形组
   */
  get shapeRects () {
    return getShapeRects(this.rect, playerManager.shapeRelationMatrix)
  }

  /**
   * 更新玩家精灵状态
   * @param dt
   * @param forbiddenRanges
   */
  update (dt, forbiddenRanges) {
    let dx = 0,
      dy = 0

    switch (this.keyMove) {
      case KEY_LEFT:
        dx = this.speed * dt * -1
        break
      case KEY_RIGHT:
        dx = this.speed * dt
        break
      case KEY_UP:
        dy = this.speed * dt * -1
        break
      case KEY_DOWN:
        dy = this.speed * dt
        break
      default:
        break
    }

    this.rect.x += dx
    this.rect.y += dy

    this.checkWin(playerManager.targetRange)

    if (!this.inCollision) {
      this.checkCollisionWithForbiddenRanges(dx, dy, forbiddenRanges)
      this.checkCollisionWithEnemies(enemiesManager.enemies)
      this.checkCollisionWithProps(propsManager.props)
    }
  }

  /**
   * 检测和处理玩家精灵活动禁区的碰撞情况
   * @param dx 本次状态更新沿 x 轴方向移动距离
   * @param dy 本次状态更新次沿 y 轴方向移动距离
   * @param forbiddenRanges {[Rect, ...]} 玩家精灵活动禁区
   */
  checkCollisionWithForbiddenRanges (dx, dy, forbiddenRanges) {
    for (let rect of forbiddenRanges) {
      if (overlapping(this.rect, rect)) {
        if (shapesInCollision(this.shapeRects, [rect])) {
          this.rect.x -= dx
          this.rect.y -= dy
        }
      }
    }
  }

  /**
   * 检查
   * @param targetRange {Rect} 目标区域
   */
  checkWin (targetRange) {
    if (inRect(this.rect, targetRange)) {
      switch (propsManager.selectedGems[2].color) {
        case 'orange':
          groundManager.map[6][0] = 4
          break
        case 'blue':
          groundManager.map[6][0] = 5
          break
        case 'green':
          groundManager.map[6][0] = 6
          break
        default:
          break
      }
      engine.stop('win')
    }
  }

  /**
   * 检测和处理玩家精灵与敌人精灵的碰撞情况
   * @param enemies
   */
  checkCollisionWithEnemies (enemies) {
    for (let enemy of enemies) {
      if (overlapping(this.rect, enemy.rect)) {
        if (shapesInCollision(this.shapeRects, enemy.shapeRects)) {
          // 敌人减速
          enemy.speedUp(-20)

          // 玩家掉血
          let panel = propsManager.propsPanel
          let blood = --panel.heartsNumber

          // 玩家掉血动画
          panel.hearts[blood].classList.add('shake')
          setTimeout(() => {
            panel.hearts[blood].src = propImages.heartDim
            panel.hearts[blood].classList.remove('shake')
          }, 800)

          // 若玩家血量大于0
          if (blood > 0) {
            // 碰撞震动
            groundManager.groundPanel.classList.add('shake')

            // 碰撞中，玩家和敌人暂停移动
            let playerSpeed = this.speed,
              enemySpeed = enemy.speed
            this.inCollision = true
            this.speed = 0
            enemy.speed = 0

            // 碰撞过程结束后恢复地面状态，重置玩家位置，恢复玩家和敌人移动
            setTimeout(() => {
              groundManager.groundPanel.classList.remove('shake')
              this.setPosition(COL_W * 5 + 25, ROW_H * 6 + 70)
              this.speed = playerSpeed
              enemy.speed = enemySpeed
              this.inCollision = false

              // 测试用
              // this.setPosition(COL_W * 2 + 25, ROW_H * 3 + 70);
            }, 800)
          } else {
            // 停止游戏，提示失败
            engine.stop('fail')
          }
          break
        }
      }
    }
  }

  /**
   * 检测和处理玩家精灵与道具的碰撞情况
   * @param props
   */
  checkCollisionWithProps (props) {
    for (let prop of props) {
      if (overlapping(this.rect, prop.rect)) {
        if (shapesInCollision(this.shapeRects, [prop.rect])) {
          prop.setPosition(-1000, -1000)
          prop.setPropPanel()
          break
        }
      }
    }
  }

  /**
   * 渲染玩家精灵
   */
  render () {
    super.render(ctx, resources.get(spriteImages.player))

    // 用于测试和调节shapeRects
    // let rects = this.shapeRects;
    // ctx.fillStyle = 'red';
    // for (let rect of rects) {
    //     ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    // }
  }

  /**
   * 处理玩家精灵键盘事件
   * @param e {event} 玩家触发的键盘事件
   */
  handleInput (e) {
    switch (e.keyCode) {
      case KEY_LEFT:
      case KEY_RIGHT:
      case KEY_UP:
      case KEY_DOWN:
        if (e.type === 'keydown') {
          if (e.keyCode !== this.keyMove) {
            this.lastKeyMove = this.keyMove
          }
          this.keyMove = e.keyCode
        } else if (e.type === 'keyup') {
          if (e.keyCode === this.keyMove) {
            this.keyMove = this.lastKeyMove
          }
          this.lastKeyMove = -1
        }
        break
      default:
        break
    }
  }
}

/***** 管理器对象 */
/**
 * 地面状态管理器
 * @type {{images: Array, block: GroundBlockRender, map: *[], loadImages(): void, initImages(): void, init(): void, reset(), update(), render(): void}}
 */
let groundManager = {
  groundPanel: document.querySelector('#ground'),
  images: [],
  blockRender: new GroundBlockRender(),
  map: [
    [1, 0, 0, 0, 0, 1],
    [2, 2, 1, 0, 0, 0],
    [1, 0, 0, 2, 1, 1],
    [1, 2, 1, 1, 2, 2],
    [0, 0, 0, 2, 1, 1],
    [1, 1, 2, 2, 0, 0],
    [2, 1, 1, 1, 1, 1]
  ],

  /**
   * 加载地面渲染图片
   */
  loadImages () {
    loadImages(groundImages)
  },

  /**
   * 初始化地面渲染图片
   */
  initImages () {
    let getImage = resources.get.bind(resources)
    this.images.push(
      getImage(groundImages.stoneBlock),
      getImage(groundImages.grassBlock),
      getImage(groundImages.waterBlock),
      getImage(groundImages.door),
      getImage(groundImages.dimes),
      getImage(groundImages.beauty),
      getImage(groundImages.precious)
    )
  },

  /**
   * 重置地面渲染图片
   */
  resetImages () {
    // 可扩展
  },

  /**
   * 初始化地面状态
   */
  initStates () {
    this.resetStates()
  },

  /**
   * 重置地面状态
   */
  resetStates () {
    this.map[6][0] = 2
  },

  /**
   * 更新地面状态
   */
  update () {
    // 可扩展
  },

  /**
   * 渲染地面
   */
  render () {
    let rowsNum = this.map.length,
      colsNum = this.map[0].length

    for (let r = 0; r < rowsNum; r++) {
      for (let c = 0; c < colsNum; c++) {
        this.blockRender.render(ctx, this.images[this.map[r][c]], [r, c])
      }
    }
  }
}

/**
 * 道具管理器
 * @type {{props: {key: Key, heart: Heart, blueGem: Gem, greenGem: Gem, orangeGem: Gem}, loadImages(): void, init(): void, reset(): void, update(): void, render(): void}}
 */
let propsManager = {
  props: [
    new Key(),
    new Heart(),
    new Gem('blue'),
    new Gem('green'),
    new Gem('orange')
  ],
  selectedGems: [],
  propsPanel: {
    hearts: null,
    gems: null,
    key: null,
    star: null,
    hasKey: false,
    hasStar: false,
    heartsNumber: 2,
    gemsNumber: 0
  },

  /**
   * 加载道具渲染图片
   */
  loadImages () {
    loadImages(propImages)
  },

  /**
   * 初始化道具渲染图片
   */
  initImages () {
    // 初始化道具图片
    let props = this.props
    let getImage = resources.get.bind(resources)
    props[0].image = getImage(propImages.key)
    props[1].image = getImage(propImages.heart)
    props[2].image = getImage(propImages.blueGem)
    props[3].image = getImage(propImages.greenGem)
    props[4].image = getImage(propImages.orangeGem)

    // 初始化道具栏图片
    this.resetImages()
  },

  /**
   * 重置道具图片
   */
  resetImages () {
    // 重置道具栏图片
    let panel = this.propsPanel
    let getImage = resources.get.bind(resources)

    panel.key.src = getImage(propImages.keyDim).src

    panel.star.classList.remove('show')
    panel.star.classList.add('hide')
    panel.gems.forEach(gem => {
      gem.src = getImage(propImages.gemDim).src
    })

    let hearts = panel.hearts
    hearts[0].src = hearts[1].src = getImage(propImages.heart).src
    hearts[2].src = getImage(propImages.heartDim).src
  },

  /**
   * 初始化道具状态
   */
  initStates () {
    // 绑定道具栏DOM元素
    let domPanel = document.querySelector('#prop-panel')
    let panel = this.propsPanel
    panel.hearts = domPanel.querySelectorAll('#blood img')
    panel.gems = domPanel.querySelectorAll('.gem img')
    panel.key = domPanel.querySelector('#key img')
    panel.star = domPanel.querySelector('#star img')

    // 初始化道具和道具栏状态
    this.resetStates()
  },

  /**
   * 重置道具状态
   */
  resetStates () {
    // 重置道具位置状态
    let props = this.props
    props[0].setPosition(40 + 3 * COL_W, 75 + 3 * ROW_H)
    props[1].setPosition(35 + 5 * COL_W, 75 + 4 * ROW_H)
    props[2].setPosition(35 + 0 * COL_W, 75 + 0 * ROW_H)
    props[3].setPosition(35 + 0 * COL_W, 75 + 3 * ROW_H)
    props[4].setPosition(35 + 5 * COL_W, 75 + 2 * ROW_H)

    // 清空已收集道具
    this.selectedGems.splice(0, this.selectedGems.length)

    // 重置道具栏状态
    let panel = this.propsPanel
    panel.hasKey = false
    panel.hasStar = false
    panel.gemsNumber = 0
    panel.heartsNumber = 2
  },

  /**
   * 更新道具状态
   */
  update () {
    for (let prop of this.props) {
      prop.update()
    }
  },

  /**
   * 渲染道具
   */
  render () {
    for (let prop of this.props) {
      prop.render(ctx)
    }
  }
}

/**
 * 敌人精灵管理器
 * @type {{enemies: *[], homeRanges: Array, loadImages(): void, init(): void, reset(): void, initHomeRanges(): void, update(*=): void, render(): void}}
 */
let enemiesManager = {
  enemies: [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()],
  homeRanges: [],
  shapeRelationMatrix: [
    // When enemy moves left.
    [
      [0.05, 0.30, 0.12, 0.40],
      [0.15, 0.18, 0.15, 0.60],
      [0.30, 0.08, 0.50, 0.80],
      [0.80, 0.18, 0.10, 0.60],
      [0.90, 0.27, 0.06, 0.42]
    ],
    // When enemy moves right.
    [
      [0.05, 0.27, 0.06, 0.40],
      [0.10, 0.18, 0.10, 0.60],
      [0.20, 0.08, 0.50, 0.80],
      [0.70, 0.18, 0.15, 0.60],
      [0.85, 0.25, 0.10, 0.40],
    ]
  ],

  /**
   * 加载敌人精灵渲染图片
   */
  loadImages () {
    resources.load(spriteImages.enemyToLeft)
    resources.load(spriteImages.enemyToRight)
  },

  /**
   * 初始化敌人精灵渲染图片
   */
  initImages () {
    // 可扩展
  },

  /**
   * 重置敌人精灵渲染图片
   */
  resetImages () {
    // 可扩展
  },

  /**
   * 初始化敌人精灵状态
   */
  initStates () {
    // 初始化敌人精灵活动范围
    this.homeRanges.push(
      createGroundRect(0, 1, 1, 4),
      createGroundRect(1, 3, 1, 3),
      createGroundRect(2, 1, 1, 2),
      createGroundRect(4, 0, 1, 3),
      createGroundRect(5, 4, 1, 2)
    )

    // 初始化敌人精灵状态
    this.resetStates()
  },

  /**
   * 重置敌人精灵状态
   */
  resetStates () {
    this.enemies[0].setAttribute(COL_W * 3, ROW_H * 0 + 65, 240, TO_RIGHT)
    this.enemies[1].setAttribute(COL_W * 4, ROW_H * 1 + 65, 130, TO_LEFT)
    this.enemies[2].setAttribute(COL_W * 1, ROW_H * 2 + 65, 150, TO_RIGHT)
    this.enemies[3].setAttribute(COL_W * 1, ROW_H * 4 + 65, 110, TO_LEFT)
    this.enemies[4].setAttribute(COL_W * 4, ROW_H * 5 + 65, 180, TO_RIGHT)
  },

  /**
   * 敌人精灵加速
   * @param dealtSpeed
   */
  speedUp (dealtSpeed) {
    this.enemies.forEach((enemy) => {
      enemy.speedUp(dealtSpeed)
    })
  },

  /**
   * 更新敌人精灵状态
   * @param dt
   */
  update (dt) {
    let i = 0
    this.enemies.forEach((enemy) => {
      enemy.update(dt, this.homeRanges[i++])
    })
  },

  /**
   * 渲染敌人精灵
   */
  render () {
    this.enemies.forEach((enemy) => {
      enemy.render()
    })
  }
}

/**
 * 玩家精灵管理器
 * @type {{player: Player, forbiddenRanges: Array, loadImages(): void, init(): void, reset(): void, initForbiddenRanges(): void, update(*=): void, render(): void, startEventListener(): void}}
 */
let playerManager = {
  player: new Player(),
  targetRange: createGroundRect(6, 0, 1, 1),
  forbiddenRanges: [],
  shapeRelationMatrix: [
    [0.20, 0.08, 0.60, 0.18],
    [0.06, 0.20, 0.88, 0.35],
    [0.13, 0.55, 0.74, 0.15],
    [0.28, 0.70, 0.45, 0.25]
  ],

  /**
   * 加载玩家精灵渲染图片
   */
  loadImages () {
    resources.load(spriteImages.player)
  },

  /**
   * 初始化玩家精灵渲染图片
   */
  initImages () {
    // 可扩展
  },

  /**
   * 重置玩家精灵渲染图片
   */
  resetImages () {
    // 可扩展
  },

  /**
   * 初始化玩家精灵状态
   */
  initStates () {
    // 初始化玩家精灵活动区域
    this.forbiddenRanges.push(
      createGroundRect(-1, 0, 1, COLS_NUM),
      createGroundRect(ROWS_NUM, 0, 1, COLS_NUM),
      createGroundRect(0, -1, ROWS_NUM, 1),
      createGroundRect(0, COLS_NUM, ROWS_NUM, 1),

      createGroundRect(1, 0, 1, 2),
      createGroundRect(2, 3, 1, 1),
      createGroundRect(3, 1, 1, 1),
      createGroundRect(3, 4, 1, 2),
      createGroundRect(4, 3, 1, 1),
      createGroundRect(5, 2, 1, 2),

      this.targetRange    // 点亮星星并拿到钥匙后，此区解禁
    )

    // 初始化玩家精灵状态
    this.resetStates()
  },

  /**
   * 重置玩家精灵状态
   */
  resetPlayer () {
    this.player.inCollision = false
    this.player.setAttribute(COL_W * 0 + 25, ROW_H * 5 + 70, 100)

    // 测试用
    // this.player.setAttribute(COL_W * 2 + 25, ROW_H * 3 + 70, 100);
  },

  /**
   * 重置玩家精灵相关状态
   */
  resetStates () {
    this.resetPlayer()

    // 重置目标区域为活动禁区
    if (this.forbiddenRanges.length < 11) {
      this.forbiddenRanges.push(this.targetRange)
    }
  },

  /**
   * 更新玩家精灵状态
   * @param dt
   */
  update (dt) {
    this.player.update(dt, this.forbiddenRanges)
  },

  /**
   * 渲染玩家精灵
   */
  render () {
    this.player.render()
  },

  /**
   * 启动玩家精灵事件监听
   */
  startEventListener () {
    document.addEventListener('keydown', (e) => {
      this.player.handleInput(e)
    })
    document.addEventListener('keyup', (e) => {
      this.player.handleInput(e)
    })
  }
}

/**
 * 提示信息管理器
 * @type {{winPrompts: {dimes: string[], beauty: string[], precious: string[]}, startPanel: Element | null, winPanel: Element | null, failPanel: Element | null, showPanel(*): void, hidePanel(*): void, showWinPanel(): void, initStates(): void, startEventListener(): void}}
 */
let promptsManager = {
  winPrompts: {
    dimes: [
      '好多钞票！等等，这怎么可能就是传说中的宝藏呢！！！到底是哪里出了问题...',
      '我会找到答案的'
    ],
    beauty: [
      '公主：谢谢你救了我，藏在这里的宝藏你找到了吗？',
      '我要去寻找宝藏'
    ],
    precious: [
      '哇！找到宝藏了！！！据说这里还囚禁着一位美丽的公主，你找到了吗？',
      '我要去救公主'
    ]
  },
  startPanel: document.querySelector('#start-panel'),
  winPanel: document.querySelector('#win-panel'),
  failPanel: document.querySelector('#fail-panel'),

  /**
   * 显示提示栏
   * @param panel
   */
  showPanel (panel) {
    panel.removeAttribute('hidden')
  },

  /**
   * 隐藏提示栏
   * @param panel
   */
  hidePanel (panel) {
    panel.hidden = 'hidden'
  },

  /**
   * 显示游戏胜利提示栏
   */
  showWinPanel () {
    let panel = this.winPanel,
      prompt = panel.querySelector('.prompt'),
      playButton = panel.querySelector('.button.play'),
      promptImage = panel.querySelector('#prize'),
      promptText,
      playButtonText,
      promptImageSrc

    switch (propsManager.selectedGems[2].color) {
      case 'orange':
        promptText = this.winPrompts.dimes[0]
        playButtonText = this.winPrompts.dimes[1]
        promptImageSrc = promptImages.dimes
        break
      case 'blue':
        promptText = this.winPrompts.beauty[0]
        playButtonText = this.winPrompts.beauty[1]
        promptImageSrc = promptImages.beauty
        break
      case 'green':
        promptText = this.winPrompts.precious[0]
        playButtonText = this.winPrompts.precious[1]
        promptImageSrc = promptImages.precious
        break
      default:
        break
    }

    prompt.firstChild.data = promptText
    playButton.firstChild.data = playButtonText
    promptImage.src = promptImageSrc

    panel.removeAttribute('hidden')
  },

  /**
   * 初始化提示栏状态
   */
  initStates () {
    this.showPanel(this.startPanel)
    this.hidePanel(this.winPanel)
    this.hidePanel(this.failPanel)
  },

  /**
   * 启动提示栏事件监听
   */
  startEventListener () {
    let playButtons = document.querySelectorAll('.button.play')
    playButtons.forEach(button => {
      button.onclick = (e) => {
        e.target.parentNode.hidden = 'hidden'
        engine.start()
      }
    })
  }
}
