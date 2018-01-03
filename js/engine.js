/** @file engine.js
 *
 * 这个文件提供了游戏循环玩耍的功能（更新敌人和渲染）
 * 在屏幕上画出游戏面板，然后调用玩家和敌人对象的update/render函数（在app.js中定义的）
 *
 * 一个游戏引擎的工作过程就是不停的绘制整个游戏屏幕。
 * 当玩家在屏幕上移动的时候，看上去就是图片在移动或者被重绘。
 */

/**
 * 引擎对象，控制游戏主循环、页面更新和重绘
 */
let engine = {
  _stop: true,
  _lastTime: undefined,

  /**
   * 游戏主循环
   */
  main () {
    let now = Date.now(),
      dt = (now - this._lastTime) / 1000.0   // 用于Enemy对象的自动更新
    this.update(dt)
    this.render()
    this._lastTime = now
    if (!this._stop) {
      window.requestAnimationFrame(() => {
        this.main()
      })
    }
  },

  /**
   * 停止游戏
   */
  stop (state) {
    if (state === 'win') {
      setTimeout(() => {
        promptsManager.showWinPanel()
        this._stop = true
      }, 300)
    } else if (state === 'fail') {
      this._stop = true
      groundManager.groundPanel.classList.add('shake')
      setTimeout(() => {
        groundManager.groundPanel.classList.remove('shake')
        promptsManager.showPanel(promptsManager.failPanel)
      }, 800)
    }
  },

  /**
   * 启动游戏
   */
  start () {
    this.resetStates()
    this.resetImages()
    this._stop = false
    this._lastTime = Date.now()
    requestAnimationFrame(() => {
      this.main()
    })
  },

  /**
   * 初始化图片资源、组件状态和页面渲染状态
   */
  init () {
    // 创建地图画布
    this.createCanvas()

    // 初始化游戏组件
    this.initStates()

    // 注册资源加载完成时要运行的函数
    resources.onReady(() => {
      groundManager.initImages()
      propsManager.initImages()
      enemiesManager.initImages()
      playerManager.initImages()

      groundManager.render()
      propsManager.render()
      enemiesManager.render()
      playerManager.render()
    })

    // 加载资源
    groundManager.loadImages()
    propsManager.loadImages()
    enemiesManager.loadImages()
    playerManager.loadImages()

    // 启动玩家事件监听
    playerManager.startEventListener()
    promptsManager.startEventListener()
  },

  /**
   * 创建画布
   */
  createCanvas () {
    let canvas = document.createElement('canvas')
    canvas.width = COL_W * COLS_NUM
    canvas.height = ROW_H * ROWS_NUM + OFFSET_V

    groundManager.groundPanel.appendChild(canvas)
    window.ctx = canvas.getContext('2d')
  },

  /**
   * 初始化组件状态
   */
  initStates () {
    groundManager.initStates()
    propsManager.initStates()
    enemiesManager.initStates()
    playerManager.initStates()
    promptsManager.initStates()
  },

  /**
   * 重置组件渲染图片
   */
  resetImages () {
    groundManager.resetImages()
    propsManager.resetImages()
    enemiesManager.resetImages()
    playerManager.resetImages()
  },

  /**
   * 重置组件状态
   */
  resetStates () {
    groundManager.resetStates()
    propsManager.resetStates()
    enemiesManager.resetStates()
    playerManager.resetStates()
  },

  /**
   * 更新组件状态
   * @param dt {number} 本次与上次页面状态更新的时间间隔
   */
  update (dt) {
    groundManager.update()
    propsManager.update()
    enemiesManager.update(dt)
    playerManager.update(dt)
  },

  /**
   * 渲染页面
   */
  render () {
    groundManager.render()
    propsManager.render()
    enemiesManager.render()
    playerManager.render()
  }
}

// 初始化游戏页面
engine.init()
