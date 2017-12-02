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
    lastTime: undefined,

    /**
     * 游戏启动方法
     */
    run() {
        let canvas = document.createElement('canvas');
        canvas.width = BlOCK_WIDTH * COLS_NUM;
        canvas.height = BlOCK_HEIGHT * ROWS_NUM + GROUND_OFFSET_V;
        document.body.appendChild(canvas);
        window.ctx = canvas.getContext('2d');

        this.init();

        this.main();
    },

    /**
     * 游戏主循环例程
     */
    main() {
       let now = Date.now(),
           dt = (now - this.lastTime) / 1000.0;     // 用于Enemy对象的自动更新
       this.update(dt);
       this.render();
       this.lastTime = now;
       window.requestAnimationFrame(() => {this.main()});
    },

    /**
     * 游戏初始化例程
     */
    init() {
        // 加载地面图片
        this.loadResources(IMG_DIR, groundImages);
        resources.onReady(() => {
            ground.bindImages();
            ground.render();
        });

        // 加载道具图片
        this.loadResources(IMG_DIR, propImages);
        resources.onReady(() => {
            prop.bindImages();
            prop.render();
        });

        // 加载精灵图片
        this.loadResources(IMG_DIR, spriteImages);
        resources.onReady(() => {
            Enemy.bindImage();
            Player.bindImage();
        });

        // 启动玩家键盘事件监听，将键盘事件交由Player.handleInput()方法处理
        document.addEventListener('keydown', (e) => {player.handleInput(e);});
        document.addEventListener('keyup', (e) => {player.handleInput(e);});

        // 初始化engine
        this.lastTime = Date.now();
    },

    /**
     * 加载游戏资源
     * @param resourceDir {String} 资源目录
     * @param resourceNames {Object} 资源集合
     */
    loadResources(resourceDir, resourceNames) {
        let names = Object.values(resourceNames);
        for (let name of names) {
            resources.load(resourceDir + name);
        }
    },

    /**
     * 更新页面状态
     * @param dt {number} 本次与上次页面状态更新的时间间隔
     */
    update(dt) {
        allEnemies.forEach((enemy) => {enemy.update(dt);});
        player.update(dt);
    },

    /**
     * 渲染页面
     */
    render() {
        ground.render();
        prop.render();
        allEnemies.forEach((enemy) => {enemy.render();});
        player.render();
    }
};

// 启动游戏
engine.run();
